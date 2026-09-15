import { L } from '../core/shared.js';

export default { id: 'mandelbrot',
  name: L('Mandelbrot set', 'Conjunto de Mandelbrot'),
  note: L('One line of algebra, repeated. The edge never stops having detail.',
          'Una línea de álgebra, repetida. El borde nunca deja de tener detalle.'),
  params: [
    { key: 'zoom', label: L('Zoom', 'Zoom'),            min: 0, max: 14, step: 0.05, def: 0 },
    { key: 'iter', label: L('Iterations', 'Iteraciones'), min: 40, max: 400, step: 10, def: 140 },
    { key: 'res',  label: L('Resolution', 'Resolución'),  min: 90, max: 260, step: 10, def: 170 }
  ],
  make() {
    let img = null, off = null, key = '';
    let cx = -0.743643887037151, cy = 0.13182590420533;   // Misiurewicz point
    return {
      reset() { cx = -0.743643887037151; cy = 0.13182590420533; },
      step(ctx, w, h, t, acc, P, M) {
        const RES = P.res | 0, IT = P.iter | 0;
        const scale = 3.2 / Math.pow(2, P.zoom);
        // The cursor reframes the view: its position becomes the new center
        if (M.in) {
          // Smooth, clamped panning: without the clamp the center drifts outside
          // the set within a couple of seconds and the view goes flat black.
          cx += ((M.x / w - 0.5) * scale) * 0.006;
          cy += ((M.y / h - 0.5) * scale * (h / w)) * 0.006;
          cx = Math.max(-2.3, Math.min(0.9, cx));
          cy = Math.max(-1.3, Math.min(1.3, cy));
        }
        const k = [RES, IT, P.zoom.toFixed(3), cx.toFixed(12), cy.toFixed(12), acc].join('|');
        if (k !== key) {
          key = k;
          if (!img || img.width !== RES) {
            img = ctx.createImageData(RES, RES);
            off = document.createElement('canvas'); off.width = off.height = RES;
          }
          const rgb = acc.split(',').map(Number), px = img.data;
          for (let j = 0; j < RES; j++) {
            const y0 = cy + ((j / RES) - 0.5) * scale;
            for (let i = 0; i < RES; i++) {
              const x0 = cx + ((i / RES) - 0.5) * scale;
              let x = 0, y = 0, n = 0, x2 = 0, y2 = 0;
              // z ← z² + c, until it escapes the disk of radius 2
              while (x2 + y2 <= 4 && n < IT) { y = 2 * x * y + y0; x = x2 - y2 + x0; x2 = x * x; y2 = y * y; n++; }
              const o = (j * RES + i) * 4;
              if (n >= IT) { px[o] = px[o+1] = px[o+2] = 0; px[o+3] = 255; }
              else {
                // Smooth the iteration count: removes the banding of the integer escape count
                const mu = n + 1 - Math.log(Math.log(Math.sqrt(x2 + y2))) / Math.LN2;
                const v = Math.pow(Math.max(0, mu) / IT, 0.32);
                // Cyclic palette: a flat ramp hides the filaments,
                // cycling reveals them like layers of an onion.
                // √mu instead of mu: gives cycles even where the escape is fast
                const band = 0.5 + 0.5 * Math.cos(Math.sqrt(Math.max(0, mu)) * 2.0 - 1.1);
                const m1 = 0.30 + 0.70 * band, m2 = (1 - band) * 0.55;
                px[o]   = Math.min(255, rgb[0] * v * m1 + 245 * v * m2);
                px[o+1] = Math.min(255, rgb[1] * v * m1 + 248 * v * m2);
                px[o+2] = Math.min(255, rgb[2] * v * m1 + 255 * v * m2);
                px[o+3] = 255;
              }
            }
          }
          off.getContext('2d').putImageData(img, 0, 0);
        }
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, 0, 0, w, h);
        ctx.fillStyle = `rgba(${acc},0.85)`; ctx.font = '11px monospace';
        ctx.fillText('zoom ×' + Math.pow(2, P.zoom).toFixed(0), 12, h - 12);
      }
    };
  }
}
