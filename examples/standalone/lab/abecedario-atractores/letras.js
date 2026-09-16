/* ═══════════════════════════════════════════════════════════════════════
   ABECEDARIO DE ATRACTORES — la letra objetivo.
   ═══════════════════════════════════════════════════════════════════════
   Rasteriza un glifo en una grilla G×G y le calcula la transformada de
   distancia. Necesita canvas, así que esto corre en la página y el resultado
   —dos arreglos planos— se le manda al worker. El worker no dibuja letras.

   Una decisión que cambia por completo lo que el buscador puede lograr: el
   objetivo se dibuja con un peso LIVIANO, no con una negrita. Un atractor de
   larga exposición es una curva; puede recorrer el trazo de una letra, pero
   no puede rellenar un bloque macizo. Contra una "A" en negra el mejor
   candidato posible sigue puntuando mal —le falta el relleno— y el buscador
   se pasa la corrida persiguiendo algo inalcanzable. Contra una "A" de trazo
   fino, la curva y el objetivo son la misma clase de objeto.
   ═══════════════════════════════════════════════════════════════════════ */
(function (raiz) {
  'use strict';

  const FAMILIA = "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif";

  /* Dibuja la letra centrada y encajada en la grilla, y devuelve máscara,
     transformada de distancia y área en píxeles. */
  function objetivo(letra, G, opt) {
    const o = opt || {};
    const peso = o.peso || 300;
    const familia = o.familia || FAMILIA;
    const margen = o.margen == null ? 0.10 : o.margen;

    const cv = (typeof OffscreenCanvas !== 'undefined')
      ? new OffscreenCanvas(G, G)
      : Object.assign(document.createElement('canvas'), { width: G, height: G });
    cv.width = G; cv.height = G;
    const ctx = cv.getContext('2d', { willReadFrequently: true });

    // Se mide primero con un cuerpo grande y después se escala: medir el glifo
    // a tamaño de grilla da cajas de píxel entero y la letra baila.
    const BASE = 200;
    ctx.font = peso + ' ' + BASE + "px " + familia;
    const m = ctx.measureText(letra);
    const anchoG = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    const altoG = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    if (!(anchoG > 0) || !(altoG > 0)) return null;

    const util = G * (1 - 2 * margen);
    const esc = Math.min(util / anchoG, util / altoG);
    const cuerpo = BASE * esc;

    ctx.clearRect(0, 0, G, G);
    ctx.fillStyle = '#fff';
    ctx.font = peso + ' ' + cuerpo + "px " + familia;
    const m2 = ctx.measureText(letra);
    const x = G / 2 - (m2.actualBoundingBoxRight - m2.actualBoundingBoxLeft) / 2;
    const y = G / 2 + (m2.actualBoundingBoxAscent - m2.actualBoundingBoxDescent) / 2;
    ctx.fillText(letra, x, y);

    const px = ctx.getImageData(0, 0, G, G).data;
    const mask = new Uint8Array(G * G);
    let area = 0;
    for (let i = 0; i < G * G; i++) {
      // El antialias del borde entra como parte de la letra: si no, el trazo
      // fino queda con agujeros de un píxel y la cobertura nunca llega a 1.
      if (px[i * 4 + 3] > 90) { mask[i] = 1; area++; }
    }
    if (!area) return null;

    return { letra: letra, mask: mask, dist: raiz.ABC_NUCLEO.distancia(mask, G), area: area, G: G };
  }

  /* Clasificador por plantilla: contra qué letra se parece más una figura ya
     proyectada. Es el mismo puntaje del buscador corrido contra las 26
     máscaras. Sirve para lo que el buscador no puede decir por sí solo —si la
     "O" que encontró se lee más como una "D"— y es lo que convierte el
     resultado en algo verificable en vez de una opinión. */
  function clasificar(t, objetivos, G) {
    const P = raiz.ABC_NUCLEO.puntuar;
    const filas = objetivos.map(o => ({ letra: o.letra, punt: P(t, o, G) }));
    filas.sort((a, b) => b.punt - a.punt);
    return filas;
  }

  const ABECEDARIO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  raiz.ABC_LETRAS = { objetivo, clasificar, ABECEDARIO, FAMILIA };

})(typeof self !== 'undefined' ? self : this);
