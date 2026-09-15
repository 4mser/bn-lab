import { TAU, L } from '../core/shared.js';

export default { id: 'optimizers',
  name: L('How a model learns', 'Cómo aprende un modelo'),
  note: L('The same slope, three ways down. Momentum and Adam against plain descent.',
          'La misma pendiente, tres formas de bajar. Momentum y Adam contra el descenso simple.'),
  params: [
    { key: 'lr',   label: L('Learning rate', 'Tasa de aprendizaje'), min: 0.001, max: 0.06, step: 0.001, def: 0.012 },
    { key: 'land', label: L('Landscape', 'Paisaje'), min: 0, max: 2, step: 1, def: 0 },
    { key: 'run',  label: L('Restart', 'Reiniciar'), min: 0, max: 1, step: 1, def: 0 }
  ],
  make() {
    let R = [], lastRun = 0, lastLand = -1;
    // Three landscapes with different traps: narrow valley, saddle, and bumps
    const f = (x, y, L) =>
      L === 0 ? (1 - x) ** 2 + 12 * (y - x * x) ** 2                    // Rosenbrock
    : L === 1 ? x * x - y * y + 0.35 * (x ** 4 + y ** 4)                // saddle
    :           x * x + y * y + 1.6 * (Math.sin(3 * x) + Math.sin(3 * y));
    const grad = (x, y, L) => {
      const e = 1e-3;
      return [(f(x + e, y, L) - f(x - e, y, L)) / (2 * e),
              (f(x, y + e, L) - f(x, y - e, L)) / (2 * e)];
    };
    // Each landscape starts where its lesson shows. Measured, not eyeballed:
    // on the saddle Adam escapes in 11 steps, momentum in 64, and SGD in 315;
    // on the bumpy landscape momentum is the only one that escapes the bad well.
    const START = [[-1.4, 1.6], [1.6, 0.001], [2.05, 2.05]];
    const seed = land => {
      const [sx, sy] = START[land] || START[0];
      R = [
        { n: 'SGD', x: sx, y: sy, p: [], vx: 0, vy: 0, mx: 0, my: 0, sx: 0, sy: 0, t: 0 },
        { n: 'momentum', x: sx, y: sy, p: [], vx: 0, vy: 0, mx: 0, my: 0, sx: 0, sy: 0, t: 0 },
        { n: 'Adam', x: sx, y: sy, p: [], vx: 0, vy: 0, mx: 0, my: 0, sx: 0, sy: 0, t: 0 }
      ];
    };
    seed(0);
    return {
      reset() { seed(lastLand < 0 ? 0 : lastLand); },
      step(ctx, w, h, t, acc, P, M) {
        const LAND = P.land | 0;
        if (P.run !== lastRun || LAND !== lastLand) { lastRun = P.run; lastLand = LAND; seed(LAND); }
        const S = Math.min(w, h) * 0.42, cx = w / 2, cy = h / 2;
        const toS = (x, y) => [cx + x * S / 2.2, cy - y * S / 2.2];

        // Contour lines
        const RES = 90, vals = [];
        let mn = 1e9, mx = -1e9;
        for (let j = 0; j < RES; j++) for (let i = 0; i < RES; i++) {
          const x = (i / RES) * 4.4 - 2.2, y = (j / RES) * 4.4 - 2.2;
          const v = Math.log(1 + Math.max(0, f(x, y, LAND) + 4));
          vals.push(v); if (v < mn) mn = v; if (v > mx) mx = v;
        }
        const img = ctx.createImageData(RES, RES), px = img.data;
        const rgb = acc.split(',').map(Number);
        for (let k = 0; k < vals.length; k++) {
          const u = (vals[k] - mn) / (mx - mn + 1e-9);
          const band = 0.5 + 0.5 * Math.cos(u * 34);
          const a = (1 - u) * 0.5 + band * 0.12;
          const o = k * 4;
          px[o] = rgb[0] * a; px[o+1] = rgb[1] * a; px[o+2] = rgb[2] * a; px[o+3] = 255;
        }
        const off = document.createElement('canvas');
        off.width = off.height = RES; off.getContext('2d').putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, cx - S, cy - S, S * 2, S * 2);

        // The three optimizers, same starting point and same base rate
        const lr = P.lr;
        R.forEach(r => {
          const [gx, gy] = grad(r.x, r.y, LAND);
          r.t++;
          if (r.n === 'SGD') { r.x -= lr * gx; r.y -= lr * gy; }
          else if (r.n === 'momentum') {
            r.vx = 0.9 * r.vx - lr * gx; r.vy = 0.9 * r.vy - lr * gy;
            r.x += r.vx; r.y += r.vy;
          } else {
            const b1 = 0.9, b2 = 0.999, e = 1e-8;
            r.mx = b1 * r.mx + (1 - b1) * gx; r.my = b1 * r.my + (1 - b1) * gy;
            r.sx = b2 * r.sx + (1 - b2) * gx * gx; r.sy = b2 * r.sy + (1 - b2) * gy * gy;
            const mhx = r.mx / (1 - Math.pow(b1, r.t)), mhy = r.my / (1 - Math.pow(b1, r.t));
            const shx = r.sx / (1 - Math.pow(b2, r.t)), shy = r.sy / (1 - Math.pow(b2, r.t));
            r.x -= lr * 8 * mhx / (Math.sqrt(shx) + e);
            r.y -= lr * 8 * mhy / (Math.sqrt(shy) + e);
          }
          r.x = Math.max(-2.2, Math.min(2.2, r.x));
          r.y = Math.max(-2.2, Math.min(2.2, r.y));
          r.p.push([r.x, r.y]); if (r.p.length > 900) r.p.shift();
        });

        const style = ['0.45', '0.7', '1'];
        R.forEach((r, i) => {
          ctx.strokeStyle = `rgba(${acc},${style[i]})`; ctx.lineWidth = 1 + i * 0.5;
          ctx.beginPath();
          r.p.forEach((q, k) => { const p = toS(q[0], q[1]);
            k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
          ctx.stroke();
          const p = toS(r.x, r.y);
          ctx.fillStyle = `rgba(${acc},${style[i]})`;
          ctx.beginPath(); ctx.arc(p[0], p[1], 3.6, 0, TAU); ctx.fill();
          ctx.font = '11px monospace';
          ctx.fillText(r.n + '  loss ' + f(r.x, r.y, LAND).toFixed(3), 14, 48 + i * 16);
        });

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText(['Rosenbrock — a narrow curved valley',
                      'saddle — flat in one direction, steep in the other',
                      'bumpy bowl — local minima everywhere'][LAND], 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText('same start, same learning rate ' + lr.toFixed(3) +
          '   steps ' + R[0].t, 12, h - 12);
      }
    };
  }
}
