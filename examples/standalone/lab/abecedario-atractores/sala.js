/* ═══════════════════════════════════════════════════════════════════════
   ABECEDARIO DE ATRACTORES — sala de máquinas.
   ═══════════════════════════════════════════════════════════════════════
   El buscador no es una caja negra: tiene un estado interno y ese estado es
   geométrico, así que se puede dibujar. Esta es la instrumentación en vivo de
   lo que está pasando mientras corre.

   Cuatro vistas, cada una mirando una parte distinta del método:

     ENJAMBRE   una tarjeta por worker. Cada uno lleva un sistema distinto
                para la misma letra, así que son quince carreras en paralelo y
                acá se ve cuál va ganando y con qué figura.

     PARÁMETROS el espacio donde busca sep-CMA-ES. Cada punto es un juego de
                parámetros que se probó, y su brillo, lo que puntuó. La elipse
                es la gaussiana del optimizador: dónde cree que está la
                solución y con cuánta confianza. Verla encogerse y moverse es
                literalmente ver el método aprender — y verla saltar de golpe
                es un reinicio, que ocurre cuando lleva demasiadas
                generaciones sin mejorar.

     ÁNGULOS    el nivel interno. Una rejilla equirectangular donde cada celda
                guarda el mejor puntaje conseguido mirando desde esa
                dirección: horizontal el yaw, vertical el pitch. Se llena con
                cientos de orientaciones por candidato y muestra que las
                direcciones buenas no están repartidas al azar, sino en
                manchas.

     DESCARTES  cuántos candidatos ni siquiera llegaron a puntuar, y por qué:
                se fueron al infinito, cayeron a un punto fijo, o resultaron
                no ser caóticos. En la familia libre es la mayoría, y ese
                número es la razón por la que hace falta sembrar por rechazo.

   Nada de esto altera la búsqueda. Si el panel está cerrado, el worker ni
   siquiera arma la telemetría.
   ═══════════════════════════════════════════════════════════════════════ */
(function (raiz) {
  'use strict';

  const $ = s => document.querySelector(s);
  const B = raiz.ABC_BUSCADOR;
  const MAPA_W = B.MAPA_W, MAPA_H = B.MAPA_H, MINI = B.MINI;

  const trabajos = {};      // trabajo → estado vivo
  let lider = null, pedido = 0, abierta = false;

  function acento() {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
    return v || '232 234 238';
  }
  const claro = () => document.documentElement.dataset.mode === 'light';

  /* ── Tarjetas del enjambre ────────────────────────────────────────────── */
  function tarjeta(t) {
    if (t.el) return t.el;
    const el = document.createElement('div');
    el.className = 'maq';
    el.innerHTML =
      '<canvas class="maq-mini"></canvas>' +
      '<div class="maq-txt">' +
        '<div class="maq-sis"></div>' +
        '<div class="maq-gen"></div>' +
        '<canvas class="maq-spark"></canvas>' +
      '</div>' +
      '<div class="maq-p"></div>';
    $('#enjambre').appendChild(el);
    t.el = el;
    return el;
  }

  function pintarTarjeta(t) {
    const el = tarjeta(t);
    el.classList.toggle('lider', t === lider);
    el.querySelector('.maq-sis').textContent = t.nombre;
    el.querySelector('.maq-gen').textContent = 'gen ' + t.gen + '/' + t.gens;
    el.querySelector('.maq-p').textContent = t.punt.toFixed(3);

    if (t.mini) pintarMini(el.querySelector('.maq-mini'), t.mini);
    pintarSpark(el.querySelector('.maq-spark'), t.curva);
  }

  function lienzo(cv, w, h) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = cv.clientWidth || w, H = cv.clientHeight || h;
    if (!W || !H) return null;
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    return { ctx: ctx, W: W, H: H };
  }

  /* La miniatura llega como bytes de densidad: se colorea con el acento del
     tema en vez de gris, para que se lea como parte de la página. */
  function pintarMini(cv, bytes) {
    const l = lienzo(cv, MINI, MINI); if (!l) return;
    const off = document.createElement('canvas');
    off.width = MINI; off.height = MINI;
    const octx = off.getContext('2d');
    const im = octx.createImageData(MINI, MINI);
    const rgb = acento().split(/\s+/).map(Number);
    const inv = claro();
    for (let i = 0; i < bytes.length; i++) {
      const v = bytes[i] / 255;
      im.data[i * 4] = inv ? 255 - v * (255 - rgb[0]) : rgb[0] * v;
      im.data[i * 4 + 1] = inv ? 255 - v * (255 - rgb[1]) : rgb[1] * v;
      im.data[i * 4 + 2] = inv ? 255 - v * (255 - rgb[2]) : rgb[2] * v;
      im.data[i * 4 + 3] = 255;
    }
    octx.putImageData(im, 0, 0);
    l.ctx.imageSmoothingEnabled = true;
    l.ctx.drawImage(off, 0, 0, l.W, l.H);
  }

  function pintarSpark(cv, curva) {
    const l = lienzo(cv, 80, 18); if (!l || curva.length < 2) return;
    const { ctx, W, H } = l;
    const mx = Math.max(0.001, Math.max.apply(null, curva));
    ctx.strokeStyle = 'rgb(' + acento() + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    curva.forEach((v, i) => {
      const x = i / (curva.length - 1) * W, y = H - (v / mx) * (H - 2) - 1;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
  }

  /* ── Mapa de parámetros ───────────────────────────────────────────────── */
  function pintarParam(t) {
    const l = lienzo($('#mapaParam'), 300, 300); if (!l || !t) return;
    const { ctx, W, H } = l;
    const rgb = acento();

    ctx.strokeStyle = claro() ? 'rgba(8,13,24,0.07)' : 'rgba(232,234,238,0.07)';
    ctx.lineWidth = 1;
    for (let k = 1; k < 4; k++) {
      ctx.beginPath(); ctx.moveTo(W * k / 4, 0); ctx.lineTo(W * k / 4, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, H * k / 4); ctx.lineTo(W, H * k / 4); ctx.stroke();
    }

    /* Todo lo que sigue queda recortado al recuadro. La gaussiana arranca
       ancha —al principio el método no sabe nada y su desviación cubre el
       espacio entero— y sin recorte la elipse se sale y se lee como un
       garabato en vez de como una elipse. */
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();

    // La estela: las generaciones anteriores se van apagando, así se ve por
    // dónde vino el enjambre y no sólo dónde está.
    t.estela.forEach((gen, gi) => {
      const edad = (gi + 1) / t.estela.length;
      gen.forEach(pt => {
        const x = pt[0] * W, y = (1 - pt[1]) * H;
        const r = 1.4 + pt[2] * 3.4;
        // Piso de opacidad: un candidato que puntuó cero igual dice dónde se
        // miró, y sin piso la mitad del mapa queda invisible.
        ctx.fillStyle = 'rgb(' + rgb + '/' + (0.14 + pt[2] * 0.62 * edad).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      });
    });

    // La gaussiana: centro y ancho por eje, a una desviación.
    if (t.media) {
      const cx = t.media[0] * W, cy = (1 - t.media[1]) * H;
      ctx.strokeStyle = 'rgb(' + rgb + '/0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(1.5, t.ancho[0] * W), Math.max(1.5, t.ancho[1] * H), 0, 0, 6.2832);
      ctx.stroke();
      ctx.setLineDash([]);
      // Cruz en la media: el punto donde el método cree que está la solución.
      ctx.strokeStyle = 'rgb(' + rgb + '/0.95)';
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy); ctx.lineTo(cx + 5, cy);
      ctx.moveTo(cx, cy - 5); ctx.lineTo(cx, cy + 5);
      ctx.stroke();
    }
    ctx.restore();

    const eje = $('#ejesParam');
    if (eje && t.ejes) eje.textContent = t.ejes[1] ? (t.ejes[0] + ' × ' + t.ejes[1]) : t.ejes[0];
    const sg = $('#sigmaParam');
    if (sg) sg.textContent = 'σ = ' + (t.sigma != null ? t.sigma.toFixed(3) : '—');
  }

  /* ── Mapa de ángulos ──────────────────────────────────────────────────── */
  function pintarAngulos(t) {
    const cv = $('#mapaAng');
    const l = lienzo(cv, 300, 150); if (!l || !t || !t.mapa) return;
    const { ctx, W, H } = l;
    const off = document.createElement('canvas');
    off.width = MAPA_W; off.height = MAPA_H;
    const octx = off.getContext('2d');
    const im = octx.createImageData(MAPA_W, MAPA_H);
    const rgb = acento().split(/\s+/).map(Number);
    const inv = claro();
    let mx = 1;
    for (let i = 0; i < t.mapa.length; i++) if (t.mapa[i] > mx) mx = t.mapa[i];
    for (let i = 0; i < t.mapa.length; i++) {
      // Realce por el máximo observado: sin esto, cuando ninguna orientación
      // pasa de 0,3 el mapa entero se ve negro y no se distingue nada.
      const v = Math.pow(t.mapa[i] / mx, 0.75);
      im.data[i * 4] = inv ? 255 - v * (255 - rgb[0]) : rgb[0] * v;
      im.data[i * 4 + 1] = inv ? 255 - v * (255 - rgb[1]) : rgb[1] * v;
      im.data[i * 4 + 2] = inv ? 255 - v * (255 - rgb[2]) : rgb[2] * v;
      im.data[i * 4 + 3] = 255;
    }
    octx.putImageData(im, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, W, H);

    // La orientación que va ganando, marcada sobre el mapa.
    if (t.vista) {
      let yaw = t.vista.yaw % (Math.PI * 2); if (yaw < 0) yaw += Math.PI * 2;
      const x = yaw / (Math.PI * 2) * W;
      const y = (t.vista.pitch + Math.PI / 2) / Math.PI * H;
      ctx.strokeStyle = claro() ? '#0a5cff' : '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, 6.2832); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x - 3, y);
      ctx.moveTo(x + 3, y); ctx.lineTo(x + 8, y); ctx.stroke();
    }
  }

  /* ── Descartes ────────────────────────────────────────────────────────── */
  function pintarDescartes(t) {
    const caja = $('#descartes');
    if (!caja || !t || !t.descartes) return;
    const d = t.descartes;
    const total = (d.diverge || 0) + (d.punto || 0) + (d['no-caotico'] || 0);
    const filas = [
      ['se fue al infinito', d.diverge || 0],
      ['cayó a un punto', d.punto || 0],
      ['no era caótico', d['no-caotico'] || 0]
    ];
    caja.innerHTML = filas.map(f =>
      '<div class="des"><span class="des-k">' + f[0] + '</span>' +
      '<span class="des-b"><i style="width:' + (total ? (f[1] / total * 100) : 0).toFixed(1) + '%"></i></span>' +
      '<span class="des-n">' + f[1] + '</span></div>').join('');
  }

  /* ── Ciclo de pintado ─────────────────────────────────────────────────── */
  function repintar() {
    if (pedido) return;
    pedido = requestAnimationFrame(() => {
      pedido = 0;
      if (!abierta) return;
      Object.keys(trabajos).forEach(k => pintarTarjeta(trabajos[k]));
      pintarParam(lider);
      pintarAngulos(lider);
      pintarDescartes(lider);
    });
  }

  /* ── API ──────────────────────────────────────────────────────────────── */
  function iniciar() {
    Object.keys(trabajos).forEach(k => {
      if (trabajos[k].el) trabajos[k].el.remove();
      delete trabajos[k];
    });
    lider = null;
    $('#enjambre').innerHTML = '';
    repintar();
  }

  function avance(m) {
    if (!abierta) return;
    let t = trabajos[m.trabajo];
    if (!t) {
      const sis = raiz.ABC_SISTEMA(m.sistemaId);
      t = trabajos[m.trabajo] = {
        id: m.sistemaId, nombre: sis ? sis.nombre : m.sistemaId,
        gen: 0, gens: 0, punt: 0, curva: [], estela: [], mini: null,
        media: null, ancho: [0, 0], sigma: null, ejes: null, mapa: null,
        vista: null, descartes: null
      };
    }
    t.gen = m.gen; t.gens = m.gens; t.punt = m.punt;
    t.curva.push(m.punt);
    if (t.curva.length > 60) t.curva.shift();
    if (m.descartes) t.descartes = m.descartes;
    if (m.mini) t.mini = m.mini;
    if (m.pobl) {
      t.estela.push(m.pobl);
      if (t.estela.length > 12) t.estela.shift();   // doce generaciones de memoria
    }
    if (m.media) { t.media = m.media; t.ancho = m.ancho || [0, 0]; t.sigma = m.sigma; }
    if (m.ejes) t.ejes = m.ejes;
    if (m.mapa) t.mapa = m.mapa;
    if (m.vista) t.vista = m.vista;

    if (!lider || t.punt > lider.punt) lider = t;
    repintar();
  }

  function cerrarTrabajo(trabajo) {
    const t = trabajos[trabajo];
    if (!t) return;
    if (t.el) t.el.classList.add('fin');
  }

  function activar(v) {
    abierta = v;
    document.body.classList.toggle('sala-abierta', v);
    if (v) repintar();
  }

  raiz.ABC_SALA = { iniciar, avance, cerrarTrabajo, activar, esta: () => abierta };

})(window);
