/* ═══════════════════════════════════════════════════════════════════════
   DATASET DE BRANDING — la cámara y el rasterizador.
   ═══════════════════════════════════════════════════════════════════════
   Puerto directo de lo que hace pyrender en `generar_dataset.py`, escrito a
   mano porque en el navegador no hay OpenGL sin traer una librería y el lab no
   trae librerías. Es un rasterizador por software: transforma, descarta caras
   traseras, interpola con un búfer de profundidad y sombrea con Lambert.

   Las convenciones son las del script, no otras:

     · Proyección ORTOGRÁFICA con xmag = ymag = 1.15. El objeto viene escalado
       a la esfera unitaria, así que 1.15 deja un margen y ninguna vista queda
       recortada.
     · Convención OpenGL: la cámara mira hacia −z local.
     · Luz direccional intensidad 4, ambiente 0.25, igual que la escena de
       pyrender.
     · FIXED_LIGHT = false → la luz viaja con la cámara. En espacio de cámara
       eso es una luz frontal constante, y por eso el sombreado sale idéntico
       en todas las vistas: la red aprende forma y no iluminación.
       FIXED_LIGHT = true → la luz se queda en el mundo mirando desde (1,1,1).
   ═══════════════════════════════════════════════════════════════════════ */
(function (raiz) {
  'use strict';

  /* n direcciones casi equidistantes sobre la esfera. Uniforme en cos(theta)
     para que no se amontonen en los polos; el ángulo áureo evita que salgan
     alineadas en radios. Misma fórmula que `fibonacci_sphere`. */
  function fibonacci(n) {
    const d = new Float64Array(n * 3);
    const aureo = Math.PI * (1 + Math.sqrt(5));
    for (let k = 0; k < n; k++) {
      const i = k + 0.5;
      const z = 1 - 2 * i / n;
      const r = Math.sqrt(Math.max(0, 1 - z * z));
      const phi = aureo * i;
      d[k * 3] = r * Math.cos(phi);
      d[k * 3 + 1] = r * Math.sin(phi);
      d[k * 3 + 2] = z;
    }
    return d;
  }

  /* Pose 4×4 de una cámara en dist·dirección mirando al origen.
     El caso degenerado importa: si la dirección coincide con el eje que se usa
     como "arriba", el producto cruz se anula y la base queda indefinida. Por
     eso se cambia de eje cerca de los polos. */
  function lookAt(dx, dy, dz, dist) {
    let zx = dx, zy = dy, zz = dz;
    const L = Math.hypot(zx, zy, zz) || 1;
    zx /= L; zy /= L; zz /= L;

    const polo = Math.abs(zz) >= 0.999;
    const ux = 0, uy = polo ? 1 : 0, uz = polo ? 0 : 1;

    let xx = uy * zz - uz * zy, xy = uz * zx - ux * zz, xz = ux * zy - uy * zx;
    const Lx = Math.hypot(xx, xy, xz) || 1;
    xx /= Lx; xy /= Lx; xz /= Lx;

    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;

    // Columnas [x y z] y traslación dist·z.
    return {
      R: [xx, yx, zx,
          xy, yy, zy,
          xz, yz, zz],
      t: [dist * zx, dist * zy, dist * zz]
    };
  }

  /* Rotación como vector de seis: las dos primeras COLUMNAS de R, apiladas.
     Los cuaterniones tienen doble cobertura y los ángulos de Euler saltan;
     esta representación es continua, que es lo que quiere una regresión de
     pose. Equivale a `R[:, :2].T.reshape(6)`. */
  function rot6d(R) {
    return [R[0], R[3], R[6], R[1], R[4], R[7]];
  }

  /* Rota una matriz 3×3 sobre el eje z local (el roll de la cámara). */
  function conRoll(R, ang) {
    const c = Math.cos(ang), s = Math.sin(ang);
    // R · Rz(ang)
    return [
      R[0] * c + R[1] * s, -R[0] * s + R[1] * c, R[2],
      R[3] * c + R[4] * s, -R[3] * s + R[4] * c, R[5],
      R[6] * c + R[7] * s, -R[6] * s + R[7] * c, R[8]
    ];
  }

  const XMAG = 1.15;

  /* Memoria de trabajo. Un tubo fino y largo pasa de los cien mil vértices, y
     reservar seis arreglos de ese tamaño en cada cuadro son megabytes por
     segundo para el recolector de basura: la previa se entrecorta sola. Se
     guardan y se reusan mientras la malla no cambie de tamaño. */
  const scratch = { nv: 0, S: 0 };
  function trabajo(nv, N) {
    if (scratch.nv !== nv) {
      scratch.nv = nv;
      scratch.VX = new Float32Array(nv); scratch.VY = new Float32Array(nv); scratch.VZ = new Float32Array(nv);
      scratch.NX = new Float32Array(nv); scratch.NY = new Float32Array(nv); scratch.NZ = new Float32Array(nv);
    }
    if (scratch.S !== N) {
      scratch.S = N;
      scratch.col = new Uint8ClampedArray(N * N * 4);
      scratch.prof = new Float32Array(N * N);
    }
    return scratch;
  }

  /* Rasteriza la malla desde una pose. Escribe color (RGBA) y profundidad.
     `luzMundo` no nulo = luz fija en el mundo.

     `ss` es el supermuestreo. Importa cuando el tubo es fino: a radios chicos
     los triángulos miden menos de un píxel, y sin supermuestreo el trazo se
     rompe en puntos sueltos y parpadea al girar —cada cuadro cae en píxeles
     distintos—. Se rasteriza a ss× y se promedia. La máscara se reduce por
     "algún sub-píxel tocó": con mayoría, un trazo de medio píxel desaparece
     de la silueta, que es justo lo que hay que conservar. */
  function render(m, pose, S, color, prof, luzMundo, ss) {
    const k = Math.max(1, Math.round(ss || 1));
    if (k === 1) return rasterizar(m, pose, S, color, prof, luzMundo);

    const N = S * k;
    const w = trabajo(m.nv, N);
    rasterizar(m, pose, N, w.col, w.prof, luzMundo);

    const n2 = k * k;
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        let acc = 0, cerca = Infinity;
        for (let b = 0; b < k; b++) {
          for (let a = 0; a < k; a++) {
            const j = (y * k + b) * N + (x * k + a);
            acc += w.col[j * 4];
            if (w.prof[j] < cerca) cerca = w.prof[j];
          }
        }
        const i = y * S + x;
        const v = acc / n2;
        color[i * 4] = v; color[i * 4 + 1] = v; color[i * 4 + 2] = v; color[i * 4 + 3] = 255;
        prof[i] = cerca;
      }
    }
  }

  function rasterizar(m, pose, S, color, prof, luzMundo) {
    const R = pose.R, t = pose.t;
    color.fill(0);
    for (let i = 0; i < S * S; i++) { color[i * 4 + 3] = 255; prof[i] = Infinity; }

    // Vértices y normales a espacio de cámara. p_cam = Rᵀ(p − t).
    const nv = m.nv;
    const w = trabajo(nv, scratch.S || S);
    const VX = w.VX, VY = w.VY, VZ = w.VZ, NX = w.NX, NY = w.NY, NZ = w.NZ;
    for (let i = 0; i < nv; i++) {
      const x = m.V[i * 3] - t[0], y = m.V[i * 3 + 1] - t[1], z = m.V[i * 3 + 2] - t[2];
      VX[i] = R[0] * x + R[3] * y + R[6] * z;
      VY[i] = R[1] * x + R[4] * y + R[7] * z;
      VZ[i] = R[2] * x + R[5] * y + R[8] * z;
      const nx = m.VN[i * 3], ny = m.VN[i * 3 + 1], nz = m.VN[i * 3 + 2];
      NX[i] = R[0] * nx + R[3] * ny + R[6] * nz;
      NY[i] = R[1] * nx + R[4] * ny + R[7] * nz;
      NZ[i] = R[2] * nx + R[5] * ny + R[8] * nz;
    }

    // Dirección de la luz en espacio de cámara.
    let lx, ly, lz;
    if (luzMundo) {
      lx = R[0] * luzMundo[0] + R[3] * luzMundo[1] + R[6] * luzMundo[2];
      ly = R[1] * luzMundo[0] + R[4] * luzMundo[1] + R[7] * luzMundo[2];
      lz = R[2] * luzMundo[0] + R[5] * luzMundo[1] + R[8] * luzMundo[2];
    } else {
      // La luz viaja con la cámara: frontal, constante en todas las vistas.
      lx = 0; ly = 0; lz = 1;
    }

    const AMB = 0.25, INT = 0.78;      // ambiente e intensidad de pyrender, normalizados
    const mitad = S / 2, esc = S / (2 * XMAG);

    for (let f = 0; f < m.nt; f++) {
      const i0 = m.F[f * 3], i1 = m.F[f * 3 + 1], i2 = m.F[f * 3 + 2];

      // A pantalla. La cámara mira hacia −z, así que la profundidad es −z_cam.
      const ax = mitad + VX[i0] * esc, ay = mitad - VY[i0] * esc, az = -VZ[i0];
      const bx = mitad + VX[i1] * esc, by = mitad - VY[i1] * esc, bz = -VZ[i1];
      const cx = mitad + VX[i2] * esc, cy = mitad - VY[i2] * esc, cz = -VZ[i2];

      // Área con signo: descarta caras traseras y triángulos degenerados.
      const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
      if (!(area < -1e-9)) continue;

      let mnx = Math.floor(Math.min(ax, bx, cx)), mxx = Math.ceil(Math.max(ax, bx, cx));
      let mny = Math.floor(Math.min(ay, by, cy)), mxy = Math.ceil(Math.max(ay, by, cy));
      if (mxx < 0 || mnx >= S || mxy < 0 || mny >= S) continue;
      if (mnx < 0) mnx = 0; if (mxx > S - 1) mxx = S - 1;
      if (mny < 0) mny = 0; if (mxy > S - 1) mxy = S - 1;

      const inv = 1 / area;
      for (let y = mny; y <= mxy; y++) {
        const py = y + 0.5;
        for (let x = mnx; x <= mxx; x++) {
          const px = x + 0.5;
          const w0 = ((bx - ax) * (py - ay) - (by - ay) * (px - ax)) * inv;
          const w1 = ((cx - bx) * (py - by) - (cy - by) * (px - bx)) * inv;
          const w2 = 1 - w0 - w1;
          if (w0 < 0 || w1 < 0 || w2 < 0) continue;
          // Baricéntricas: w1 pesa al vértice 0, w2 al 1, w0 al 2.
          const z = w1 * az + w2 * bz + w0 * cz;
          const k = y * S + x;
          if (z >= prof[k]) continue;
          prof[k] = z;
          let nx = w1 * NX[i0] + w2 * NX[i1] + w0 * NX[i2];
          let ny = w1 * NY[i0] + w2 * NY[i1] + w0 * NY[i2];
          let nz = w1 * NZ[i0] + w2 * NZ[i1] + w0 * NZ[i2];
          const L = Math.hypot(nx, ny, nz) || 1;
          const lam = Math.max(0, (nx * lx + ny * ly + nz * lz) / L);
          const v = Math.min(255, Math.round(255 * (AMB + INT * lam)));
          color[k * 4] = v; color[k * 4 + 1] = v; color[k * 4 + 2] = v;
        }
      }
    }
  }

  /* Rotación 2D de una imagen ya renderizada. En ortográfica, girar la cámara
     sobre su propio eje es exactamente esto, y sale mucho más barato que
     volver a rasterizar. Múltiplos de 90° sin interpolar; el resto bilineal,
     como hace scipy con order=1. */
  function rotarImagen(src, S, grados, canales) {
    const c = canales || 4;
    const dst = new Uint8ClampedArray(src.length);
    if (c === 4) for (let i = 0; i < S * S; i++) dst[i * 4 + 3] = 255;

    const mod = ((grados % 360) + 360) % 360;
    if (Math.abs(mod % 90) < 1e-6) {
      const k = Math.round(mod / 90) % 4;
      for (let y = 0; y < S; y++) {
        for (let x = 0; x < S; x++) {
          let sx, sy;
          if (k === 0) { sx = x; sy = y; }
          else if (k === 1) { sx = S - 1 - y; sy = x; }
          else if (k === 2) { sx = S - 1 - x; sy = S - 1 - y; }
          else { sx = y; sy = S - 1 - x; }
          for (let q = 0; q < c; q++) dst[(y * S + x) * c + q] = src[(sy * S + sx) * c + q];
        }
      }
      return dst;
    }

    const a = mod * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    const m = (S - 1) / 2;
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const dx = x - m, dy = y - m;
        const sx = ca * dx + sa * dy + m, sy = -sa * dx + ca * dy + m;
        if (sx < 0 || sy < 0 || sx > S - 1 || sy > S - 1) continue;
        const x0 = Math.floor(sx), y0 = Math.floor(sy);
        const x1 = Math.min(S - 1, x0 + 1), y1 = Math.min(S - 1, y0 + 1);
        const fx = sx - x0, fy = sy - y0;
        for (let q = 0; q < c; q++) {
          const p00 = src[(y0 * S + x0) * c + q], p10 = src[(y0 * S + x1) * c + q];
          const p01 = src[(y1 * S + x0) * c + q], p11 = src[(y1 * S + x1) * c + q];
          dst[(y * S + x) * c + q] =
            p00 * (1 - fx) * (1 - fy) + p10 * fx * (1 - fy) + p01 * (1 - fx) * fy + p11 * fx * fy;
        }
      }
    }
    if (c === 4) for (let i = 0; i < S * S; i++) dst[i * 4 + 3] = 255;
    return dst;
  }

  raiz.BR_CAMARA = { fibonacci, lookAt, rot6d, conRoll, render, rotarImagen, XMAG };

})(typeof self !== 'undefined' ? self : this);
