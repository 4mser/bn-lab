/* ═══════════════════════════════════════════════════════════════════════
   ABECEDARIO DE ATRACTORES — la página.
   ═══════════════════════════════════════════════════════════════════════
   Tres responsabilidades y nada más: mandarle trabajo a los workers, dibujar
   lo que vuelve, y guardar lo encontrado. La matemática está en nucleo.js y
   la búsqueda en buscador.js; acá no se calcula nada que valga la pena mirar.

   Sobre el dibujo: el buscador puntúa sobre una grilla de 64×64, que es lo
   que hace que evaluar cientos de ángulos cueste milisegundos. Pero para
   MIRAR una figura, esa grilla es un mosaico. El visor no usa el
   rasterizador: traza la trayectoria con líneas de canvas en modo `lighter`
   —cada trazo suma luz, como una placa fotográfica— y por eso se ve como una
   larga exposición y no como un mapa de calor.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const N = window.ABC_NUCLEO, B = window.ABC_BUSCADOR, L = window.ABC_LETRAS;
  const G = 64;                              // lado de la grilla de puntaje
  const CLAVE = 'abc-atractores-v1';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const gr = r => r * 180 / Math.PI;

  /* ── Estado ───────────────────────────────────────────────────────────
     `hallazgos[letra]` es la mejor figura conocida para esa letra. Arranca
     con lo que trajo el barrido que se corrió al construir esto y se pisa con
     lo que el visitante encuentre mejor, que queda en su navegador. */
  let hallazgos = {};
  let actual = 'A';
  let buscando = false;

  const objetivos = {};
  function objetivoDe(letra) {
    if (!objetivos[letra]) objetivos[letra] = L.objetivo(letra, G, { peso: 300 });
    return objetivos[letra];
  }

  function cargar() {
    hallazgos = Object.assign({}, window.ABC_HALLAZGOS || {});
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE) || '{}');
      Object.keys(guardado).forEach(k => {
        if (!hallazgos[k] || guardado[k].punt > hallazgos[k].punt) hallazgos[k] = guardado[k];
      });
    } catch (e) {}
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(hallazgos)); } catch (e) {}
  }

  /* ── Trayectorias ─────────────────────────────────────────────────────
     Integrar es lo caro. Se guarda la última nube de cada solución: girarla,
     cambiarle la exposición o repintarla no vuelve a integrar nada. */
  /* La trayectoria del visor tiene que cubrir EL MISMO tramo de recorrido que
     midió el buscador, porque la ventana de exposición se guarda como
     fracción de ese tramo. Así que se reintegra con los mismos pasos base y
     se le sube la subdivisión: mismo recorrido, más tinta. Cambiar `n` en vez
     de `subdiv` dibujaría otra figura. */
  const BASE_N = 5000, BASE_TRANS = 1200;
  const cache = {};
  function claveDe(s) { return s.sistemaId + '|' + s.z.map(v => v.toFixed(4)).join(','); }
  function nubeDe(s, subdiv) {
    const k = claveDe(s) + '|s' + subdiv;
    if (cache[k]) return cache[k];
    const sis = window.ABC_SISTEMA(s.sistemaId);
    if (!sis) return null;
    /* Sin filtro de caos acá: el visor dibuja lo que se encontró, sea un
       atractor extraño o una órbita periódica. Filtrar lo dejaría en blanco
       justo en las figuras que hay que poder mirar para darse cuenta de que
       son periódicas. El veredicto se muestra en la ficha, medido. */
    const tr = N.trayectoria(sis, B.aParams(sis, s.z),
      { n: s.n || BASE_N, transitorio: s.trans || BASE_TRANS, subdiv: subdiv, lyapMin: -Infinity });
    if (!tr.ok) return null;
    const ks = Object.keys(cache);
    if (ks.length > 14) delete cache[ks[0]];
    cache[k] = tr;
    return tr;
  }

  /* ── Trazo de larga exposición ────────────────────────────────────────
     Mismo procedimiento que las firmas de las tarjetas: la nube se reproyecta
     entera con el ángulo actual y se traza en tramos. `lighter` suma luz, así
     que donde la trayectoria pasa muchas veces el trazo se satura y aparece
     la estructura; con `source-over` todo quedaría de un gris plano. */
  function trazar(cv, sol, vista, opt) {
    const o = opt || {};
    const ctx = cv.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = cv.clientWidth || cv.width, H = cv.clientHeight || cv.height;
    if (!W || !H) return;
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const claro = document.documentElement.dataset.mode === 'light';
    ctx.fillStyle = claro ? '#ffffff' : '#000000';
    ctx.fillRect(0, 0, W, H);

    // El fantasma de la letra, debajo de todo: es contra esto que se buscó.
    if (o.fantasma) {
      ctx.save();
      ctx.font = '300 ' + Math.round(Math.min(W, H) * 0.78) + "px " + L.FAMILIA;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = claro ? 'rgba(10,92,255,0.11)' : 'rgba(255,255,255,0.085)';
      ctx.fillText(o.fantasma, W / 2, H / 2 + Math.min(W, H) * 0.02);
      ctx.restore();
    }

    const tr = nubeDe(sol, o.subdiv || 9);
    if (!tr) return;

    const R = N.rotacion(vista.yaw, vista.pitch, vista.roll, new Float64Array(9));
    const pts = tr.pts, c = tr.centro;
    const ex = vista.ex || 1;
    const desde = Math.max(0, Math.min(0.75, vista.desde || 0));
    const largo = Math.max(0.25, Math.min(1, vista.largo == null ? 1 : vista.largo));
    const i0 = Math.floor(tr.n * desde);
    const i1 = Math.min(tr.n, i0 + Math.floor(tr.n * largo));

    // Encaje por caja envolvente, igual que en el puntaje: si el visor
    // encuadrara distinto, la figura no sería la que se puntuó.
    let mnu = Infinity, mxu = -Infinity, mnv = Infinity, mxv = -Infinity;
    for (let i = i0; i < i1; i++) {
      const j = i * 3, a = pts[j] - c[0], b = pts[j + 1] - c[1], d = pts[j + 2] - c[2];
      const u = (R[0] * a + R[1] * b + R[2] * d) * ex;
      const v = (R[3] * a + R[4] * b + R[5] * d);
      if (u < mnu) mnu = u; if (u > mxu) mxu = u;
      if (v < mnv) mnv = v; if (v > mxv) mxv = v;
    }
    const anu = mxu - mnu, anv = mxv - mnv;
    if (!(anu > 1e-9) || !(anv > 1e-9)) return;
    const util = Math.min(W, H) * (o.encaje || 0.86);
    const esc = util / Math.max(anu, anv);
    const ou = W / 2 - (mnu + mxu) / 2 * esc, ov = H / 2 + (mnv + mxv) / 2 * esc;

    ctx.globalCompositeOperation = claro ? 'source-over' : 'lighter';
    ctx.lineWidth = o.grosor || 0.7;
    ctx.lineJoin = 'round';
    const alfa = o.alfa || 0.085;
    ctx.strokeStyle = claro
      ? 'rgba(10,92,255,' + Math.min(1, alfa * 2.6).toFixed(3) + ')'
      : 'rgba(232,234,238,' + alfa.toFixed(3) + ')';

    const total = i1 - i0, TRAMOS = 14, paso = Math.ceil(total / TRAMOS);
    for (let t = 0; t < TRAMOS; t++) {
      const a0 = i0 + t * paso, aF = Math.min(i1, a0 + paso + 1);
      if (a0 >= aF) break;
      ctx.beginPath();
      for (let i = a0; i < aF; i++) {
        const j = i * 3, a = pts[j] - c[0], b = pts[j + 1] - c[1], d = pts[j + 2] - c[2];
        const sx = ou + (R[0] * a + R[1] * b + R[2] * d) * ex * esc;
        const sy = ov - (R[3] * a + R[4] * b + R[5] * d) * esc;
        i > a0 ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ── Visor principal ──────────────────────────────────────────────────
     Arranca en el ángulo hallado y se puede arrastrar. Es el punto entero de
     la pieza: la letra no está dibujada, está en una orientación. Al girar,
     desaparece — y lo que queda es un objeto tridimensional cualquiera. */
  const visor = {
    cv: null, sol: null, vista: null, base: null,
    arrastre: false, ax: 0, ay: 0, pedido: 0, sueltoEn: 0
  };

  function pintarVisor() {
    visor.pedido = 0;
    if (!visor.sol) return;
    trazar(visor.cv, visor.sol, visor.vista, { fantasma: $('#verFantasma').checked ? actual : null });
    const d = Math.hypot(visor.vista.yaw - visor.base.yaw, visor.vista.pitch - visor.base.pitch,
                         visor.vista.roll - visor.base.roll);
    $('#desvio').textContent = d < 0.01 ? 'en el ángulo hallado' : ('girado ' + gr(d).toFixed(0) + '°');
    $('#volverAng').hidden = d < 0.01;
  }
  function repintar() {
    if (visor.pedido) return;
    visor.pedido = requestAnimationFrame(pintarVisor);
  }

  function montarVisor() {
    const cv = visor.cv = $('#visor');
    cv.addEventListener('pointerdown', e => {
      visor.arrastre = true; visor.ax = e.clientX; visor.ay = e.clientY;
      cv.setPointerCapture(e.pointerId); cv.classList.add('tomando');
    });
    cv.addEventListener('pointermove', e => {
      if (!visor.arrastre) return;
      visor.vista.yaw += (e.clientX - visor.ax) * 0.008;
      visor.vista.pitch = Math.max(-1.4, Math.min(1.4, visor.vista.pitch - (e.clientY - visor.ay) * 0.006));
      visor.ax = e.clientX; visor.ay = e.clientY;
      repintar();
    });
    const soltar = () => { visor.arrastre = false; cv.classList.remove('tomando'); };
    cv.addEventListener('pointerup', soltar);
    cv.addEventListener('pointercancel', soltar);
    addEventListener('resize', repintar, { passive: true });
    $('#volverAng').addEventListener('click', () => {
      visor.vista = Object.assign({}, visor.base); repintar();
    });
    $('#verFantasma').addEventListener('change', repintar);
  }

  /* ── Ficha de la letra ────────────────────────────────────────────────
     Todo lo que hace falta para reproducir la figura: sistema, parámetros,
     los tres ángulos y la ventana de exposición. Y la lectura del
     clasificador, que es la única parte que puede contradecir al buscador:
     dice contra qué letra se parece MÁS la figura, no contra la que se pidió.
     Cuando esas dos no coinciden, el hallazgo es malo por más que puntúe. */
  function ficha(letra) {
    const s = hallazgos[letra];
    const caja = $('#ficha');
    if (!s) {
      caja.innerHTML = '<p class="vacio">Sin figura para esta letra. Dale a buscar.</p>';
      return;
    }
    const sis = window.ABC_SISTEMA(s.sistemaId);
    const P = B.aParams(sis, s.z);
    const params = sis.libre
      ? '30 coeficientes'
      : sis.rango.map(r => r.k + ' = ' + P[r.k].toFixed(3)).join('   ');
    const v = s.vista;
    const expo = (v.largo == null || v.largo >= 0.999)
      ? 'completa'
      : (Math.round(v.largo * 100) + '% desde el ' + Math.round((v.desde || 0) * 100) + '%');

    /* El λ se vuelve a medir acá en vez de leerse del hallazgo guardado.
       El estimador tenía un error —la trayectoria sombra se colocaba antes
       del transitorio, así que la primera medición aportaba una constante
       enorme y λ salía como esa constante dividida por el tiempo— y los
       números que quedaron guardados están inflados. Se recalcula y se dice
       qué es: con λ cerca de cero la figura es una órbita periódica, no un
       atractor extraño, por más bonita que se vea. */
    let lectura = '—';
    const tr = nubeDe(s, 1);
    const lam = tr ? tr.lyap : null;
    if (tr) {
      const g1 = new Float32Array(G * G), t = new Float32Array(G * G);
      if (N.proyectar(tr, v, G, g1)) {
        N.normalizar(g1, t);
        const filas = L.clasificar(t, L.ABECEDARIO.map(objetivoDe), G).slice(0, 3);
        lectura = filas.map(f =>
          '<b class="' + (f.letra === letra ? 'ok' : '') + '">' + f.letra + '</b> ' + f.punt.toFixed(2)
        ).join('&nbsp;&nbsp;·&nbsp;&nbsp;');
      }
    }

    caja.innerHTML =
      fila('Sistema', sis.nombre + ' <span class="cita">' + sis.cita + '</span>') +
      fila('Parámetros', '<code>' + params + '</code>') +
      fila('Ángulo', '<code>yaw ' + gr(v.yaw).toFixed(1) + '°   pitch ' + gr(v.pitch).toFixed(1) +
           '°   roll ' + gr(v.roll).toFixed(1) + '°</code>') +
      fila('Exposición', '<code>' + expo + '</code>') +
      fila('Lyapunov', lam == null ? '<code>—</code>'
           : '<code>λ = ' + lam.toFixed(4) + '</code> <span class="cita">' +
             (lam > 0.02
               ? 'positivo: atractor extraño, la trayectoria nunca se repite'
               : 'cerca de cero: <b class="ojo">órbita periódica</b>, la curva se cierra y se repite') +
             '</span>') +
      fila('Puntaje', '<code>' + s.punt.toFixed(3) + '</code> <span class="cita">Jaccard contra la letra</span>') +
      fila('Se lee como', lectura);
  }
  const fila = (k, v) => '<div class="fi"><span class="fi-k">' + k + '</span><span class="fi-v">' + v + '</span></div>';

  /* ── Grilla del abecedario ────────────────────────────────────────────── */
  function grilla() {
    const cont = $('#abc');
    cont.innerHTML = '';
    L.ABECEDARIO.forEach(letra => {
      const b = document.createElement('button');
      b.className = 'cel';
      b.dataset.letra = letra;
      b.innerHTML = '<canvas></canvas><span class="cel-l">' + letra + '</span><span class="cel-p"></span>';
      b.addEventListener('click', () => elegir(letra));
      cont.appendChild(b);
    });
    // Veintiséis letras en seis columnas dejan cuatro huecos, y el fondo de la
    // grilla los pinta como un bloque suelto. Se rellenan con celdas inertes.
    const cols = 6, sobran = (cols - (L.ABECEDARIO.length % cols)) % cols;
    for (let i = 0; i < sobran; i++) {
      const v = document.createElement('span');
      v.className = 'cel cel-vacia';
      cont.appendChild(v);
    }
    refrescarGrilla();
  }

  function refrescarGrilla() {
    $$('#abc .cel[data-letra]').forEach(b => {
      const letra = b.dataset.letra, s = hallazgos[letra];
      b.classList.toggle('sel', letra === actual);
      b.classList.toggle('hay', !!s);
      const p = b.querySelector('.cel-p');
      p.textContent = s ? s.punt.toFixed(2) : '';
      // El nivel de la celda: es la lectura honesta de qué tan legible salió.
      b.dataset.nivel = !s ? 'no' : s.punt >= 0.62 ? 'alto' : s.punt >= 0.45 ? 'medio' : 'bajo';
    });
    dibujarMiniaturas();
  }

  /* Las miniaturas se dibujan de a poco: veintiséis integraciones seguidas
     bloquean el hilo casi un segundo y la página se siente trabada justo al
     abrirla. Una por cuadro no se nota. */
  let colaMini = [];
  function dibujarMiniaturas() {
    colaMini = $$('#abc .cel[data-letra]').filter(b => hallazgos[b.dataset.letra]);
    const siguiente = () => {
      const b = colaMini.shift();
      if (!b) return;
      const s = hallazgos[b.dataset.letra];
      if (s) trazar(b.querySelector('canvas'), s, s.vista,
        { subdiv: 4, encaje: 0.9, alfa: 0.16, grosor: 0.6 });
      requestAnimationFrame(siguiente);
    };
    requestAnimationFrame(siguiente);
  }

  function elegir(letra) {
    actual = letra;
    $('#letraActual').textContent = letra;
    const s = hallazgos[letra];
    if (s) {
      visor.sol = s;
      visor.base = Object.assign({}, s.vista);
      visor.vista = Object.assign({}, s.vista);
    } else {
      visor.sol = null;
    }
    $('#visorVacio').hidden = !!s;
    pintarVisor();
    ficha(letra);
    refrescarGrilla();
  }

  /* ── Los workers ──────────────────────────────────────────────────────
     Un trabajo = (letra, sistema). Se reparten entre tantos workers como
     núcleos tenga la máquina menos uno, para no dejar al navegador sin hilo
     con el que repintar. */
  let pool = [], cola = [], vivos = 0, mejorCorrida = null, letraCorrida = null;
  const NUCLEOS = Math.max(2, Math.min(6, (navigator.hardwareConcurrency || 4) - 1));

  function armarPool() {
    for (let i = 0; i < NUCLEOS; i++) {
      // Ruta absoluta a propósito: la página se sirve como
      // /lab/abecedario-atractores SIN barra final, así que una ruta relativa
      // resolvería a /lab/buscador.worker.js y el pool no arrancaría.
      const w = new Worker('/lab/abecedario-atractores/buscador.worker.js');
      w.onmessage = ev => alMensaje(w, ev.data);
      w.libre = true;
      pool.push(w);
    }
  }

  function despachar() {
    pool.forEach(w => {
      if (!w.libre || !cola.length) return;
      const t = cola.shift();
      w.libre = false; vivos++;
      w.postMessage(t, [t.mask, t.dist]);
    });
    if (!cola.length && !vivos) terminar();
  }

  function alMensaje(w, m) {
    if (m.tipo === 'avance') {
      $('#estado').textContent =
        'buscando ' + m.letra + ' · ' + m.sistemaId + ' · generación ' + m.gen + '/' + m.gens +
        ' · mejor ' + m.punt.toFixed(3);
      const total = totalTrabajos || 1;
      $('#barra').style.width = Math.round((hechos / total) * 100) + '%';
      window.ABC_SALA.avance(m);
      return;
    }
    if (m.tipo !== 'listo') return;
    window.ABC_SALA.cerrarTrabajo(m.trabajo);
    w.libre = true; vivos--; hechos++;
    const r = m.res;
    if (r && r.punt > 0 && r.vista) {
      const s = { sistemaId: r.sistemaId, z: r.z, vista: r.vista, punt: r.punt, lyap: r.lyap };
      if (!mejorCorrida || r.punt > mejorCorrida.punt) mejorCorrida = s;
      const prev = hallazgos[m.letra];
      if (!prev || r.punt > prev.punt) {
        hallazgos[m.letra] = s;
        if (m.letra === actual) elegir(actual); else refrescarGrilla();
      }
    }
    despachar();
  }

  let totalTrabajos = 0, hechos = 0;

  function encolar(letras) {
    const sistemas = $$('.sis:checked').map(i => i.value);
    if (!sistemas.length) { $('#estado').textContent = 'Elige al menos un sistema.'; return; }
    const cfg = {
      generaciones: +$('#presupuesto').value,
      poblacion: 10, puntos: 5000, grueso: 90, finos: 3, pasosFino: 22,
      exposicion: $('#usarExpo').checked,
      estirado: $('#usarEstira').checked
    };
    letras.forEach(letra => {
      const obj = objetivoDe(letra);
      sistemas.forEach((id, i) => {
        // Los arreglos se transfieren, así que cada trabajo lleva su copia.
        cola.push({
          tipo: 'buscar', trabajo: letra + ':' + id, letra: letra, sistemaId: id, G: G,
          semilla: (Date.now() + i * 7919) >>> 0, cfg: cfg,
          // Si el panel está cerrado, el worker ni siquiera arma la
          // telemetría: no tiene sentido pagar por lo que nadie mira.
          telemetria: window.ABC_SALA.esta(),
          mask: obj.mask.slice().buffer, dist: obj.dist.slice().buffer, area: obj.area
        });
      });
    });
    totalTrabajos = cola.length; hechos = 0;
    buscando = true;
    document.body.classList.add('buscando');
    $('#barra').style.width = '0%';
    window.ABC_SALA.iniciar();
    despachar();
  }

  function terminar() {
    buscando = false;
    document.body.classList.remove('buscando');
    $('#estado').textContent = 'Listo.';
    $('#barra').style.width = '100%';
    guardar();
    refrescarGrilla();
  }

  function detener() {
    cola.length = 0;
    pool.forEach(w => w.terminate());
    pool = []; vivos = 0;
    armarPool();
    terminar();
    $('#estado').textContent = 'Detenido.';
  }

  /* ── Arranque ─────────────────────────────────────────────────────────── */
  function arranque() {
    cargar();
    grilla();
    montarVisor();
    armarPool();

    // Casilla por sistema, en el orden del catálogo.
    const cajas = $('#sistemas');
    window.ABC_SISTEMAS.forEach(s => {
      const l = document.createElement('label');
      l.innerHTML = '<input type="checkbox" class="sis" value="' + s.id + '" checked><span>' + s.nombre + '</span>';
      cajas.appendChild(l);
    });

    // La sala de máquinas arranca abierta: es la parte que explica el método.
    const verSala = $('#verSala');
    window.ABC_SALA.activar(verSala.checked);
    verSala.addEventListener('change', () => window.ABC_SALA.activar(verSala.checked));

    $('#buscarUna').addEventListener('click', () => encolar([actual]));
    $('#buscarTodo').addEventListener('click', () => encolar(L.ABECEDARIO.slice()));
    $('#detener').addEventListener('click', detener);
    $('#exportar').addEventListener('click', () => {
      const txt = 'window.ABC_HALLAZGOS = ' + JSON.stringify(hallazgos) + ';';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([txt], { type: 'text/javascript' }));
      a.download = 'hallazgos.js'; a.click();
    });
    $('#olvidar').addEventListener('click', () => {
      try { localStorage.removeItem(CLAVE); } catch (e) {}
      cargar(); elegir(actual);
    });

    elegir('A');

    // Las secciones entran al hacer scroll, como en el resto del lab.
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$('.blk').forEach(b => io.observe(b));
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', arranque);
  else arranque();
})();
