/* ═══════════════════════════════════════════════════════════════════════
   DATASET DE BRANDING — la página.
   ═══════════════════════════════════════════════════════════════════════
   Integra el atractor, lo envuelve en un tubo, lo fotografía desde toda la
   esfera y empaqueta el resultado. Los mismos parámetros que la celda 1 de
   `generar_dataset.py`, con los mismos nombres, para que quien haya leído el
   script encuentre acá lo que espera.

   El render va repartido en cuadros. Doscientas vistas de 256×256 seguidas
   bloquean el hilo varios segundos y la pestaña deja de repintar justo cuando
   hay algo que mirar; de a una por cuadro, la lámina se llena a la vista y la
   página sigue respondiendo.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const N = window.ABC_NUCLEO, B = window.ABC_BUSCADOR, C = window.BR_CAMARA, E = window.BR_EMPAQUE;

  const CAM_DIST = 4.0;

  /* Un atractor por integrante, como pide el README, más el Lorenz. El reparto
     es el de las tarjetas de contacto: cada quien ya tiene el suyo. */
  const REPARTO = {
    thomas: 'Benjamín Campos',
    chenlee: 'Nicolás Moreno',
    burkeshaw: 'Nicolás Campos',
    dadras: 'Vicente Campos',
    lorenz: 'el del arranque'
  };

  const cfg = {
    sistema: 'thomas', nViews: 64, imgSize: 128, rolls: 1,
    fixedLight: false, iteraciones: 24000, radial: 6, radio: 0.0035
  };

  let malla = null, dirs = null, corriendo = false, cancelar = false;
  let vistas = [];            // {nombre, pix, mask, R, dir, roll}

  /* Anillos del tubo a partir de las iteraciones. Son dos cosas distintas
     —cuánta trayectoria se integra y con cuánto detalle se la envuelve— pero
     acopladas: pedir cien mil pasos y envolverlos con cuatrocientos anillos
     tira a la basura casi todo lo integrado. Uno cada dos pasos y medio es
     donde el tubo deja de mejorar visiblemente. */
  const anillosDe = it => Math.max(200, Math.min(16000, Math.round(it / 2.5)));

  /* Supermuestreo según el tamaño de la malla. Con el tubo fino hace falta
     —si no, el trazo se rompe en puntos— pero cuesta el cuadrado del factor,
     así que en mallas grandes se baja para que la previa siga girando. */
  const ssDe = nt => nt > 90000 ? 1 : 2;

  /* ── La malla ─────────────────────────────────────────────────────────── */
  function construir() {
    const sis = window.ABC_SISTEMA(cfg.sistema);
    const P = B.aParams(sis, B.deDefectos(sis));
    const t0 = performance.now();
    /* Sin filtro de caos a propósito. El trabajo de esta página es fotografiar
       el objeto, no certificar que sea un atractor extraño: hay sistemas de la
       lista que en sus valores clásicos caen en ventanas periódicas —Thomas
       con b = 0.19, el de las tarjetas, es una— y su figura sirve igual como
       material de marca. El exponente se mide y se muestra; que sea o no
       caótico se lee ahí, no se decide por el usuario. */
    const tr = N.trayectoria(sis, P, { n: cfg.iteraciones, transitorio: 2000, lyapMin: -Infinity });
    if (!tr.ok) { estado('La trayectoria no se pudo integrar: ' + tr.motivo); malla = null; return; }
    malla = window.BR_MALLA.tubo(tr.pts, tr.n, {
      muestras: anillosDe(cfg.iteraciones), radial: cfg.radial, radio: cfg.radio, subdiv: 2
    });
    if (!malla) { estado('No se pudo construir el tubo.'); return; }
    $('#conteo').textContent =
      malla.nv.toLocaleString('es') + ' vértices · ' + malla.nt.toLocaleString('es') + ' caras · ' +
      malla.M.toLocaleString('es') + ' anillos de ' + malla.radial +
      ' · ' + Math.round(performance.now() - t0) + ' ms';
    // λ medido sobre esta misma trayectoria: positivo, caos; cerca de cero,
    // órbita periódica. Se dice cuál es, sin adornos.
    $('#lyap').textContent = 'λ = ' + tr.lyap.toFixed(4) +
      (tr.lyap > 0.02 ? ' · caótico' : ' · órbita periódica');
    previa();
  }

  /* Reconstruir con sesenta mil pasos cuesta decenas de milisegundos, y un
     deslizador dispara un evento por píxel movido. Se reconstruye una vez por
     cuadro con el último valor: se siente inmediato y no encola trabajo. */
  let pendiente = 0;
  function reconstruir() {
    if (pendiente) return;
    pendiente = requestAnimationFrame(() => { pendiente = 0; construir(); });
  }

  /* Vista previa: la malla girando, con el mismo rasterizador que el dataset.
     Si la previa usara otro camino de dibujo no serviría para verificar
     nada. */
  let angPrevia = 0, animando = 0;
  let pvCol = null, pvProf = null, pvS = 0;
  function previa() {
    if (!malla) return;
    const cv = $('#previa'), S = 300;
    if (cv.width !== S) { cv.width = S; cv.height = S; }
    if (pvS !== S) { pvS = S; pvCol = new Uint8ClampedArray(S * S * 4); pvProf = new Float32Array(S * S); }
    const d = [Math.cos(angPrevia) * 0.82, Math.sin(angPrevia) * 0.82, 0.42];
    const pose = C.lookAt(d[0], d[1], d[2], CAM_DIST);
    const t0 = performance.now();
    C.render(malla, pose, S, pvCol, pvProf, cfg.fixedLight ? luzFija() : null, ssDe(malla.nt));
    $('#msCuadro').textContent = (performance.now() - t0).toFixed(1) + ' ms/cuadro';
    tintar(pvCol, S);
    cv.getContext('2d').putImageData(new ImageData(pvCol, S, S), 0, 0);
  }
  function animar() {
    cancelAnimationFrame(animando);
    const paso = () => {
      if (!$('#girar').checked) return;
      angPrevia += 0.012;
      previa();
      animando = requestAnimationFrame(paso);
    };
    animando = requestAnimationFrame(paso);
  }

  /* El dataset se guarda en gris, como sale del render. En pantalla se tiñe
     con el acento del tema para que la página no parezca una captura ajena;
     es sólo la previa, los PNG del ZIP van tal cual. */
  function tintar(px, S) {
    const rgb = (getComputedStyle(document.documentElement)
      .getPropertyValue('--accent-rgb').trim() || '232 234 238').split(/\s+/).map(Number);
    for (let i = 0; i < S * S; i++) {
      const v = px[i * 4] / 255;
      px[i * 4] = rgb[0] * v; px[i * 4 + 1] = rgb[1] * v; px[i * 4 + 2] = rgb[2] * v;
    }
  }

  // Luz fija en el mundo mirando desde (1,1,1): la dirección en la que viaja.
  function luzFija() {
    const k = 1 / Math.sqrt(3);
    return [k, k, k];
  }

  /* ── El barrido de la esfera ──────────────────────────────────────────── */
  function correr() {
    if (!malla || corriendo) return;
    corriendo = true; cancelar = false;
    document.body.classList.add('corriendo');
    vistas = [];
    $('#lamina').innerHTML = '';
    dirs = C.fibonacci(cfg.nViews);
    const S = cfg.imgSize;
    const color = new Uint8ClampedArray(S * S * 4), prof = new Float32Array(S * S);
    const luz = cfg.fixedLight ? luzFija() : null;
    const t0 = performance.now();
    let k = 0;

    const paso = () => {
      if (cancelar) { fin(t0); return; }
      const pose = C.lookAt(dirs[k * 3], dirs[k * 3 + 1], dirs[k * 3 + 2], CAM_DIST);
      C.render(malla, pose, S, color, prof, luz, ssDe(malla.nt));

      // Máscara: el píxel tiene profundidad finita, o sea que hay objeto.
      const mask = new Uint8ClampedArray(S * S * 4);
      for (let i = 0; i < S * S; i++) {
        const v = isFinite(prof[i]) ? 255 : 0;
        mask[i * 4] = mask[i * 4 + 1] = mask[i * 4 + 2] = v;
        mask[i * 4 + 3] = 255;
      }

      for (let j = 0; j < cfg.rolls; j++) {
        const grados = 360 * j / cfg.rolls;
        const pix = j === 0 ? color.slice() : C.rotarImagen(color, S, grados);
        /* La máscara se rota con la vista. En el script original se escribe
           una sola por dirección, fuera del bucle de rolls: con ROLLS > 1 la
           máscara deja de corresponder a la imagen y el entrenamiento
           empareja mal. Acá va una por imagen. */
        const msk = j === 0 ? mask.slice() : C.rotarImagen(mask, S, grados);
        const ang = grados * Math.PI / 180;
        const R = C.conRoll(pose.R, ang);
        const nombre = cfg.rolls > 1
          ? String(k).padStart(5, '0') + '_' + j
          : String(k).padStart(5, '0');
        vistas.push({ nombre, pix, mask: msk, R, dir: [dirs[k * 3], dirs[k * 3 + 1], dirs[k * 3 + 2]], roll: ang });
        celda(nombre, pix, S);
      }

      k++;
      $('#barra').style.width = Math.round(k / cfg.nViews * 100) + '%';
      estado('vista ' + k + '/' + cfg.nViews + ' · ' + vistas.length + ' imágenes');
      if (k < cfg.nViews) requestAnimationFrame(paso); else fin(t0);
    };
    requestAnimationFrame(paso);
  }

  function fin(t0) {
    corriendo = false;
    document.body.classList.remove('corriendo');
    estado(vistas.length + ' imágenes en ' + ((performance.now() - t0) / 1000).toFixed(1) + ' s' +
           (cancelar ? ' (detenido)' : ''));
    $('#descargar').disabled = !vistas.length;
  }

  function celda(nombre, pix, S) {
    const cv = document.createElement('canvas');
    cv.width = S; cv.height = S;
    cv.className = 'vis';
    cv.title = nombre;
    const copia = pix.slice();
    tintar(copia, S);
    cv.getContext('2d').putImageData(new ImageData(copia, S, S), 0, 0);
    $('#lamina').appendChild(cv);
  }

  /* ── Empaque ──────────────────────────────────────────────────────────── */
  async function descargar() {
    if (!vistas.length) return;
    $('#descargar').disabled = true;
    estado('empaquetando…');
    const S = cfg.imgSize;
    const entradas = [];

    for (let i = 0; i < vistas.length; i++) {
      const v = vistas[i];
      entradas.push({ nombre: 'dataset/views/' + v.nombre + '.png', datos: await E.png(v.pix, S) });
      entradas.push({ nombre: 'dataset/masks/' + v.nombre + '.png', datos: await E.png(v.mask, S) });
      if (i % 12 === 0) estado('empaquetando… ' + (i + 1) + '/' + vistas.length);
    }

    const n = vistas.length;
    const R = new Float64Array(n * 9), r6 = new Float64Array(n * 6);
    const dd = new Float64Array(n * 3), rr = new Float64Array(n);
    vistas.forEach((v, i) => {
      for (let k = 0; k < 9; k++) R[i * 9 + k] = v.R[k];
      const s = C.rot6d(v.R);
      for (let k = 0; k < 6; k++) r6[i * 6 + k] = s[k];
      dd[i * 3] = v.dir[0]; dd[i * 3 + 1] = v.dir[1]; dd[i * 3 + 2] = v.dir[2];
      rr[i] = v.roll;
    });

    const npz = E.zip([
      { nombre: 'R.npy', datos: E.npy(R, [n, 3, 3]) },
      { nombre: 'rot6d.npy', datos: E.npy(r6, [n, 6]) },
      { nombre: 'dirs.npy', datos: E.npy(dd, [n, 3]) },
      { nombre: 'rolls.npy', datos: E.npy(rr, [n]) }
    ]);
    entradas.push({ nombre: 'dataset/poses.npz', datos: new Uint8Array(await npz.arrayBuffer()) });

    const meta = {
      n_views: cfg.nViews, rolls: cfg.rolls, total_images: n, image_size: S,
      projection: 'orthographic', camera_distance: CAM_DIST, fixed_light: cfg.fixedLight,
      convention: 'OpenGL: camara mira hacia -z local, +y arriba',
      xmag: C.XMAG,
      fuente: {
        sistema: cfg.sistema, tubo: { muestras: cfg.muestras, radial: cfg.radial, radio_rel: cfg.radio },
        vertices: malla.nv, caras: malla.nt
      },
      records: vistas.map(v => ({
        file: 'views/' + v.nombre + '.png',
        dir: v.dir, roll: v.roll,
        R: [[v.R[0], v.R[1], v.R[2]], [v.R[3], v.R[4], v.R[5]], [v.R[6], v.R[7], v.R[8]]],
        rot6d: C.rot6d(v.R)
      }))
    };
    entradas.push({
      nombre: 'dataset/metadata.json',
      datos: new TextEncoder().encode(JSON.stringify(meta, null, 2))
    });

    const blob = E.zip(entradas);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'dataset-' + cfg.sistema + '-' + n + '.zip';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    estado('descargado · ' + (blob.size / 1048576).toFixed(1) + ' MB');
    $('#descargar').disabled = false;
  }

  const estado = t => { $('#estado').textContent = t; };

  /* ── Arranque ─────────────────────────────────────────────────────────── */
  function arranque() {
    const sel = $('#sistema');
    Object.keys(REPARTO).forEach(id => {
      const s = window.ABC_SISTEMA(id);
      const o = document.createElement('option');
      o.value = id;
      o.textContent = s.nombre + ' — ' + REPARTO[id];
      sel.appendChild(o);
    });
    sel.value = cfg.sistema;

    const enlazar = (id, clave, entero) => {
      const el = $('#' + id), sal = $('#' + id + 'V');
      const pintar = () => { if (sal) sal.textContent = el.value; };
      pintar();
      el.addEventListener('input', () => {
        cfg[clave] = entero ? parseInt(el.value, 10) : parseFloat(el.value);
        pintar();
        // Lo que cambia el objeto se reconstruye en vivo; lo que sólo afecta
        // al barrido no toca nada hasta que se fotografía.
        if (['iteraciones', 'radial', 'radio'].indexOf(clave) >= 0) reconstruir();
      });
    };
    enlazar('nViews', 'nViews', true);
    enlazar('imgSize', 'imgSize', true);
    enlazar('rolls', 'rolls', true);
    enlazar('iteraciones', 'iteraciones', true);
    enlazar('radial', 'radial', true);
    enlazar('radio', 'radio', false);

    sel.addEventListener('change', () => { cfg.sistema = sel.value; construir(); });
    $('#fixedLight').addEventListener('change', e => { cfg.fixedLight = e.target.checked; previa(); });
    $('#girar').addEventListener('change', e => { if (e.target.checked) animar(); });
    $('#correr').addEventListener('click', correr);
    $('#detener').addEventListener('click', () => { cancelar = true; });
    $('#descargar').addEventListener('click', descargar);
    $('#verMascaras').addEventListener('change', e => {
      $('#lamina').classList.toggle('mascaras', e.target.checked);
      // Repintar la lámina con lo que corresponda.
      const S = cfg.imgSize;
      $$('#lamina .vis').forEach((cv, i) => {
        const v = vistas[i]; if (!v) return;
        const copia = (e.target.checked ? v.mask : v.pix).slice();
        tintar(copia, S);
        cv.getContext('2d').putImageData(new ImageData(copia, S, S), 0, 0);
      });
    });

    construir();
    animar();

    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$('.blk').forEach(b => io.observe(b));
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', arranque);
  else arranque();
})();
