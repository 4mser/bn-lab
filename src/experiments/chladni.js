import { L } from '../core/shared.js';

export default { id: 'chladni',
  name: L('Chladni figures', 'Figuras de Chladni'),
  note: L('Sand on a vibrating plate walks off the loud parts and piles on the silent ones.',
          'La arena sobre una placa que vibra huye de lo que suena y se apila en lo callado.'),
  params: [
    { key: 'm',    label: L('Mode m', 'Modo m'), min: 1, max: 9, step: 1, def: 3 },
    { key: 'n',    label: L('Mode n', 'Modo n'), min: 1, max: 9, step: 1, def: 5 },
    { key: 'grain', label: L('Grains', 'Granos'), min: 400, max: 6000, step: 100, def: 2600 }
  ],
  make(w, h) {
    let g = [], K = 0;
    const seed = (n, w, h) => {
      g = [];
      for (let i = 0; i < n; i++) g.push([Math.random(), Math.random()]);
      K = n;
    };
    seed(2600, w, h);
    // Free square plate: the antisymmetric combination is what produces
    // the figures Chladni drew in 1787.
    const u = (x, y, m, n) =>
      Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y) -
      Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);
    return {
      reset() { seed(K, w, h); },
      step(ctx, w, h, t, acc, P, M) {
        if ((P.grain | 0) !== K) seed(P.grain | 0, w, h);
        const m = P.m | 0, n = P.n | 0;
        const S = Math.min(w, h) * 0.78, px = (w - S) / 2, py = (h - S) / 2;

        // Background field
        const RES = 120, img = ctx.createImageData(RES, RES), d = img.data;
        const rgb = acc.split(',').map(Number);
        for (let j = 0; j < RES; j++) for (let i = 0; i < RES; i++) {
          const a = Math.abs(u(i / RES, j / RES, m, n)) / 2;
          const o = (j * RES + i) * 4;
          d[o] = rgb[0] * a * 0.30; d[o+1] = rgb[1] * a * 0.30; d[o+2] = rgb[2] * a * 0.30; d[o+3] = 255;
        }
        const off = document.createElement('canvas');
        off.width = off.height = RES; off.getContext('2d').putImageData(img, 0, 0);
        ctx.drawImage(off, px, py, S, S);
        ctx.strokeStyle = `rgba(${acc},0.35)`;
        ctx.lineWidth = 1; ctx.strokeRect(px, py, S, S);

        // Each grain descends the gradient of |u| and jumps according to how
        // strongly it vibrates where it is. Where u = 0 there's no jump: it stays there.
        const e = 0.004;
        for (let k = 0; k < g.length; k++) {
          const p = g[k];
          const a = Math.abs(u(p[0], p[1], m, n));
          const gx = (Math.abs(u(p[0] + e, p[1], m, n)) - Math.abs(u(p[0] - e, p[1], m, n))) / (2 * e);
          const gy = (Math.abs(u(p[0], p[1] + e, m, n)) - Math.abs(u(p[0], p[1] - e, m, n))) / (2 * e);
          // Two distinct kinds of noise. The one proportional to amplitude
          // ejects grains from the vibrating regions. The constant one is what
          // lets them walk ALONG the nodal line once they reach it:
          // without it they get stuck at the first point they touch and the figure
          // comes out as scattered puddles instead of curves. Measured: 0.038 sextuples
          // the coverage without pulling grains off the node (mean |u| 0.070 vs. 0.068).
          const kick = a * 0.010, walk = 0.038;
          p[0] += -gx * 0.0016 + (Math.random() - 0.5) * kick + (Math.random() - 0.5) * walk;
          p[1] += -gy * 0.0016 + (Math.random() - 0.5) * kick + (Math.random() - 0.5) * walk;
          p[0] = Math.max(0, Math.min(1, p[0]));
          p[1] = Math.max(0, Math.min(1, p[1]));
        }

        ctx.fillStyle = `rgba(${acc},0.85)`;
        for (let k = 0; k < g.length; k++)
          ctx.fillRect(px + g[k][0] * S - 0.6, py + g[k][1] * S - 0.6, 1.5, 1.5);

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('u = cos(nπx)cos(mπy) − cos(mπx)cos(nπy)      grains settle where u = 0', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText('m = ' + m + '   n = ' + n + '   ' + g.length + ' grains', 12, h - 12);
      }
    };
  }
}
