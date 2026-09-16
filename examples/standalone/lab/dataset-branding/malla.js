/* ═══════════════════════════════════════════════════════════════════════
   DATASET DE BRANDING — la malla.
   ═══════════════════════════════════════════════════════════════════════
   `generar_dataset.py` espera una malla con caras: pyrender no sabe qué hacer
   con una nube de puntos. El README propone el puente —envolver la trayectoria
   en un tubo, `TubeGeometry` sobre un `CatmullRomCurve3`— y esto es ese puente,
   construido acá para no tener que exportar un .glb y volver a importarlo.

   Dos detalles que deciden si el tubo se ve bien o se ve retorcido:

   MARCOS DE TRANSPORTE PARALELO. Para poner el anillo de vértices alrededor de
   cada punto de la curva hace falta una base perpendicular. Lo obvio es el
   marco de Frenet —normal y binormal de la curva—, y es exactamente lo que no
   hay que hacer: la normal de Frenet apunta hacia el centro de curvatura y en
   un punto de inflexión salta de golpe al lado contrario. La trayectoria de un
   atractor está llena de inflexiones, así que el tubo sale con torceduras en
   cada una. El transporte paralelo arrastra el marco anterior girándolo lo
   mínimo indispensable para seguir siendo perpendicular, y no gira sobre el eje
   del tubo salvo que la curva lo obligue.

   REMUESTREO POR LONGITUD DE ARCO. La trayectoria viene con pasos de tiempo
   iguales, no de distancia: donde el sistema va rápido los puntos quedan
   separados y donde va lento se amontonan. Un tubo sobre esos puntos tiene
   anillos apretados en unas zonas y estirados en otras. Se remuestrea a
   distancia constante, que además es lo que hace `CatmullRomCurve3` cuando se
   le piden N divisiones.
   ═══════════════════════════════════════════════════════════════════════ */
(function (raiz) {
  'use strict';

  /* Catmull–Rom centrípeta sobre cuatro puntos de control. La variante
     centrípeta (alfa = 0.5) es la que no forma bucles ni picos cuando dos
     puntos de control quedan muy juntos, que en una trayectoria integrada
     pasa todo el tiempo. */
  function catmull(p0, p1, p2, p3, t, salida) {
    const t2 = t * t, t3 = t2 * t;
    for (let k = 0; k < 3; k++) {
      salida[k] = 0.5 * (
        (2 * p1[k]) +
        (-p0[k] + p2[k]) * t +
        (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
        (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3
      );
    }
  }

  /* Remuestrea la nube a `n` puntos separados por la misma distancia. */
  function porArco(pts, total, n) {
    // Longitud acumulada.
    const acum = new Float64Array(total);
    let largo = 0;
    for (let i = 1; i < total; i++) {
      const a = i * 3, b = (i - 1) * 3;
      largo += Math.hypot(pts[a] - pts[b], pts[a + 1] - pts[b + 1], pts[a + 2] - pts[b + 2]);
      acum[i] = largo;
    }
    if (!(largo > 0)) return null;

    const out = new Float64Array(n * 3);
    let j = 1;
    for (let i = 0; i < n; i++) {
      const meta = largo * i / (n - 1);
      while (j < total - 1 && acum[j] < meta) j++;
      const t0 = acum[j - 1], t1 = acum[j];
      const f = t1 > t0 ? (meta - t0) / (t1 - t0) : 0;
      const a = (j - 1) * 3, b = j * 3;
      out[i * 3] = pts[a] + (pts[b] - pts[a]) * f;
      out[i * 3 + 1] = pts[a + 1] + (pts[b + 1] - pts[a + 1]) * f;
      out[i * 3 + 2] = pts[a + 2] + (pts[b + 2] - pts[a + 2]) * f;
    }
    return out;
  }

  /* Suaviza el remuestreo con Catmull–Rom: sin esto el tubo hereda las
     esquinas de la poligonal y las caras se ven facetadas contra la luz. */
  function suavizar(base, n, subdiv) {
    if (subdiv <= 1) return { pts: base, n: n };
    const m = (n - 1) * subdiv + 1;
    const out = new Float64Array(m * 3);
    const tmp = new Float64Array(3);
    const P = i => base.subarray(Math.max(0, Math.min(n - 1, i)) * 3, Math.max(0, Math.min(n - 1, i)) * 3 + 3);
    let w = 0;
    for (let i = 0; i < n - 1; i++) {
      for (let s = 0; s < subdiv; s++) {
        catmull(P(i - 1), P(i), P(i + 1), P(i + 2), s / subdiv, tmp);
        out[w++] = tmp[0]; out[w++] = tmp[1]; out[w++] = tmp[2];
      }
    }
    out[w++] = base[(n - 1) * 3]; out[w++] = base[(n - 1) * 3 + 1]; out[w++] = base[(n - 1) * 3 + 2];
    return { pts: out, n: m };
  }

  /* Tubo alrededor de la curva.
     Devuelve vértices, normales y triángulos indexados. */
  function tubo(pts, total, opt) {
    const o = opt || {};
    const muestras = Math.max(8, o.muestras || 900);
    const radial = Math.max(3, o.radial || 8);
    const radioRel = o.radio || 0.012;          // relativo al diámetro del objeto

    const base = porArco(pts, total, muestras);
    if (!base) return null;
    const s = suavizar(base, muestras, o.subdiv || 2);
    const C = s.pts, M = s.n;

    // Diámetro para fijar el radio del tubo en unidades del objeto.
    let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity, mnz = Infinity, mxz = -Infinity;
    for (let i = 0; i < M; i++) {
      const j = i * 3;
      if (C[j] < mnx) mnx = C[j]; if (C[j] > mxx) mxx = C[j];
      if (C[j + 1] < mny) mny = C[j + 1]; if (C[j + 1] > mxy) mxy = C[j + 1];
      if (C[j + 2] < mnz) mnz = C[j + 2]; if (C[j + 2] > mxz) mxz = C[j + 2];
    }
    const diam = Math.max(mxx - mnx, mxy - mny, mxz - mnz);
    const R = Math.max(1e-9, diam * radioRel);

    // Tangentes.
    const T = new Float64Array(M * 3);
    for (let i = 0; i < M; i++) {
      const a = Math.max(0, i - 1) * 3, b = Math.min(M - 1, i + 1) * 3;
      let tx = C[b] - C[a], ty = C[b + 1] - C[a + 1], tz = C[b + 2] - C[a + 2];
      const L = Math.hypot(tx, ty, tz) || 1;
      T[i * 3] = tx / L; T[i * 3 + 1] = ty / L; T[i * 3 + 2] = tz / L;
    }

    // Transporte paralelo: se arranca con cualquier vector perpendicular y
    // después cada marco se obtiene rotando el anterior el ángulo mínimo que
    // lo vuelve perpendicular a la tangente nueva.
    const N = new Float64Array(M * 3), B = new Float64Array(M * 3);
    let nx, ny, nz;
    {
      const tx = T[0], ty = T[1], tz = T[2];
      // El eje menos alineado con la tangente da el producto cruz más estable.
      let ax = 0, ay = 0, az = 0;
      const at = Math.abs(tx), bt = Math.abs(ty), ct = Math.abs(tz);
      if (at <= bt && at <= ct) ax = 1; else if (bt <= ct) ay = 1; else az = 1;
      nx = ay * tz - az * ty; ny = az * tx - ax * tz; nz = ax * ty - ay * tx;
      const L = Math.hypot(nx, ny, nz) || 1; nx /= L; ny /= L; nz /= L;
    }
    for (let i = 0; i < M; i++) {
      if (i > 0) {
        const px = T[(i - 1) * 3], py = T[(i - 1) * 3 + 1], pz = T[(i - 1) * 3 + 2];
        const cx = T[i * 3], cy = T[i * 3 + 1], cz = T[i * 3 + 2];
        // Eje y ángulo entre tangente anterior y actual.
        let ex = py * cz - pz * cy, ey = pz * cx - px * cz, ez = px * cy - py * cx;
        const sen = Math.hypot(ex, ey, ez);
        if (sen > 1e-12) {
          ex /= sen; ey /= sen; ez /= sen;
          const cos = Math.max(-1, Math.min(1, px * cx + py * cy + pz * cz));
          const ang = Math.atan2(sen, cos);
          // Rodrigues sobre la normal anterior.
          const ca = Math.cos(ang), sa = Math.sin(ang);
          const dot = ex * nx + ey * ny + ez * nz;
          const crx = ey * nz - ez * ny, cry = ez * nx - ex * nz, crz = ex * ny - ey * nx;
          const rx = nx * ca + crx * sa + ex * dot * (1 - ca);
          const ry = ny * ca + cry * sa + ey * dot * (1 - ca);
          const rz = nz * ca + crz * sa + ez * dot * (1 - ca);
          nx = rx; ny = ry; nz = rz;
        }
        // Reortogonalizar contra la deriva numérica acumulada.
        const d = nx * cx + ny * cy + nz * cz;
        nx -= d * cx; ny -= d * cy; nz -= d * cz;
        const L = Math.hypot(nx, ny, nz) || 1; nx /= L; ny /= L; nz /= L;
      }
      N[i * 3] = nx; N[i * 3 + 1] = ny; N[i * 3 + 2] = nz;
      const tx = T[i * 3], ty = T[i * 3 + 1], tz = T[i * 3 + 2];
      B[i * 3] = ty * nz - tz * ny;
      B[i * 3 + 1] = tz * nx - tx * nz;
      B[i * 3 + 2] = tx * ny - ty * nx;
    }

    // Vértices y normales del tubo.
    const nv = M * radial;
    const V = new Float32Array(nv * 3), VN = new Float32Array(nv * 3);
    for (let i = 0; i < M; i++) {
      for (let k = 0; k < radial; k++) {
        const a = 2 * Math.PI * k / radial, ca = Math.cos(a), sa = Math.sin(a);
        const ux = N[i * 3] * ca + B[i * 3] * sa;
        const uy = N[i * 3 + 1] * ca + B[i * 3 + 1] * sa;
        const uz = N[i * 3 + 2] * ca + B[i * 3 + 2] * sa;
        const w = (i * radial + k) * 3;
        V[w] = C[i * 3] + ux * R; V[w + 1] = C[i * 3 + 1] + uy * R; V[w + 2] = C[i * 3 + 2] + uz * R;
        VN[w] = ux; VN[w + 1] = uy; VN[w + 2] = uz;
      }
    }

    // Caras: dos triángulos por quad.
    const nt = (M - 1) * radial * 2;
    const F = new Uint32Array(nt * 3);
    let w = 0;
    for (let i = 0; i < M - 1; i++) {
      for (let k = 0; k < radial; k++) {
        const k2 = (k + 1) % radial;
        const a = i * radial + k, b = i * radial + k2;
        const c = (i + 1) * radial + k, d = (i + 1) * radial + k2;
        F[w++] = a; F[w++] = c; F[w++] = b;
        F[w++] = b; F[w++] = c; F[w++] = d;
      }
    }

    return centrarYEscalar({ V: V, VN: VN, F: F, nv: nv, nt: nt, M: M, radial: radial, radio: R });
  }

  /* Misma normalización que `load_mesh`: se centra en el centroide y se escala
     por el radio de la esfera envolvente, no por la caja. Escalar por la caja
     dejaría vértices fuera del encuadre en las vistas diagonales. */
  function centrarYEscalar(m) {
    let cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < m.nv; i++) { cx += m.V[i * 3]; cy += m.V[i * 3 + 1]; cz += m.V[i * 3 + 2]; }
    cx /= m.nv; cy /= m.nv; cz /= m.nv;
    let maxR = 0;
    for (let i = 0; i < m.nv; i++) {
      const x = m.V[i * 3] - cx, y = m.V[i * 3 + 1] - cy, z = m.V[i * 3 + 2] - cz;
      const r = Math.hypot(x, y, z);
      if (r > maxR) maxR = r;
    }
    const k = maxR > 0 ? 1 / maxR : 1;
    for (let i = 0; i < m.nv; i++) {
      m.V[i * 3] = (m.V[i * 3] - cx) * k;
      m.V[i * 3 + 1] = (m.V[i * 3 + 1] - cy) * k;
      m.V[i * 3 + 2] = (m.V[i * 3 + 2] - cz) * k;
    }
    m.escala = k;
    return m;
  }

  raiz.BR_MALLA = { tubo: tubo };

})(typeof self !== 'undefined' ? self : this);
