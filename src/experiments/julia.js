import { TAU, L } from '../core/shared.js';

export default { id: 'julia',
  name: L('Julia set', 'Conjunto de Julia'),
  note: L('Same rule, one constant. Move the cursor and the whole shape reorganises.',
          'La misma regla, una constante. Mueve el cursor y la forma entera se reorganiza.'),
  params: [
    { key: 'iter', label: L('Iterations', 'Iteraciones'), min: 40, max: 300, step: 10, def: 120 },
    { key: 'res',  label: L('Resolution', 'Resolución'),  min: 90, max: 260, step: 10, def: 170 },
    { key: 'orbit', label: L('Auto orbit', 'Órbita automática'), min: 0, max: 1, step: 1, def: 1 }
  ],
  make() {
    let img = null, off = null, key = '';
    return {
      step(ctx, w, h, t, acc, P, M) {
        const RES = P.res | 0, IT = P.iter | 0;
        // c is taken ON the boundary of the main cardioid:
        //   c = ½e^{iθ} − ¼e^{2iθ}
        // That's where the interesting Julia sets live. Mapping the cursor to the
        // whole plane leaves most positions inside, where they're just fat blobs.
        // Horizontal picks the point on the boundary; vertical moves inward
        // (connected) or outward (disconnected dust).
        const th = M.in ? (M.x / w) * TAU : t * 0.12;
        const radial = M.in ? (M.y / h - 0.5) * 0.30 : 0;
        const k1 = (1 + radial);
        const jr = (0.5 * Math.cos(th) - 0.25 * Math.cos(2 * th)) * k1;
        const ji = (0.5 * Math.sin(th) - 0.25 * Math.sin(2 * th)) * k1;
        const k = [RES, IT, jr.toFixed(5), ji.toFixed(5), acc].join('|');
        if (k !== key) {
          key = k;
          if (!img || img.width !== RES) {
            img = ctx.createImageData(RES, RES);
            off = document.createElement('canvas'); off.width = off.height = RES;
          }
          const rgb = acc.split(',').map(Number), px = img.data, scale = 3.0;
          for (let j = 0; j < RES; j++) {
            const y0 = ((j / RES) - 0.5) * scale;
            for (let i = 0; i < RES; i++) {
              const x0 = ((i / RES) - 0.5) * scale;
              let x = x0, y = y0, n = 0, x2 = x * x, y2 = y * y;
              // Same as Mandelbrot but c is fixed and z starts at the pixel
              while (x2 + y2 <= 4 && n < IT) { y = 2 * x * y + ji; x = x2 - y2 + jr; x2 = x * x; y2 = y * y; n++; }
              const o = (j * RES + i) * 4;
              if (n >= IT) { px[o] = px[o+1] = px[o+2] = 0; px[o+3] = 255; }
              else {
                const mu = n + 1 - Math.log(Math.log(Math.sqrt(x2 + y2))) / Math.LN2;
                const v = Math.pow(Math.max(0, mu) / IT, 0.34);
                // √mu instead of mu: gives cycles even where the escape is fast
                const band = 0.5 + 0.5 * Math.cos(Math.sqrt(Math.max(0, mu)) * 2.1 - 1.1);
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
        ctx.fillText('c = ' + jr.toFixed(3) + (ji >= 0 ? ' + ' : ' − ') + Math.abs(ji).toFixed(3) + 'i', 12, h - 12);
      }
    };
  }
}
