import { TAU, L } from '../core/shared.js';

export default { id: 'boids',
  name: L('Flocking', 'Bandada'),
  note: L('Three local rules and no leader. The flock is not in any of the birds.',
          'Tres reglas locales y ningún líder. La bandada no está en ninguno de los pájaros.'),
  params: [
    { key: 'sep', label: L('Separation', 'Separación'), min: 0, max: 3, step: 0.05, def: 1.4 },
    { key: 'ali', label: L('Alignment', 'Alineación'), min: 0, max: 3, step: 0.05, def: 1 },
    { key: 'coh', label: L('Cohesion', 'Cohesión'), min: 0, max: 3, step: 0.05, def: 0.9 }
  ],
  make(w, h) {
    let B = [];
    const seed = (w, h) => {
      B = [];
      for (let i = 0; i < 220; i++) {
        const a = Math.random() * TAU;
        B.push({ x: Math.random() * w, y: Math.random() * h,
                 vx: Math.cos(a) * 2, vy: Math.sin(a) * 2 });
      }
    };
    seed(w, h);
    return {
      resize(w, h) { seed(w, h); },
      reset() { seed(w, h); },
      step(ctx, w, h, t, acc, P, M) {
        const R = 46, RS = 20;
        for (const b of B) {
          let cx = 0, cy = 0, ax = 0, ay = 0, sx = 0, sy = 0, n = 0;
          for (const o of B) {
            if (o === b) continue;
            const dx = o.x - b.x, dy = o.y - b.y, d2 = dx * dx + dy * dy;
            if (d2 > R * R) continue;
            n++; cx += o.x; cy += o.y; ax += o.vx; ay += o.vy;
            if (d2 < RS * RS) { const d = Math.sqrt(d2) + 0.01; sx -= dx / d; sy -= dy / d; }
          }
          if (n) {
            cx = cx / n - b.x; cy = cy / n - b.y;                 // cohesion
            ax = ax / n - b.vx; ay = ay / n - b.vy;               // alignment
            const norm = (x, y) => { const d = Math.hypot(x, y) || 1; return [x / d, y / d]; };
            const [c1, c2] = norm(cx, cy), [a1, a2] = norm(ax, ay), [s1, s2] = norm(sx, sy);
            b.vx += c1 * P.coh * 0.05 + a1 * P.ali * 0.09 + s1 * P.sep * 0.13;
            b.vy += c2 * P.coh * 0.05 + a2 * P.ali * 0.09 + s2 * P.sep * 0.13;
          }
          if (M.in) {                                             // the cursor startles them
            const dx = b.x - M.x, dy = b.y - M.y, d = Math.hypot(dx, dy) + 1;
            if (d < 130) { const g = (1 - d / 130) * 0.8; b.vx += (dx / d) * g; b.vy += (dy / d) * g; }
          }
          const sp = Math.hypot(b.vx, b.vy) || 1;
          const cap = 2.6;
          b.vx = (b.vx / sp) * cap; b.vy = (b.vy / sp) * cap;
          b.x = (b.x + b.vx + w) % w; b.y = (b.y + b.vy + h) % h;
        }
        for (const b of B) {
          const a = Math.atan2(b.vy, b.vx);
          ctx.fillStyle = `rgba(${acc},0.9)`;
          ctx.beginPath();
          ctx.moveTo(b.x + Math.cos(a) * 5, b.y + Math.sin(a) * 5);
          ctx.lineTo(b.x + Math.cos(a + 2.5) * 3.4, b.y + Math.sin(a + 2.5) * 3.4);
          ctx.lineTo(b.x + Math.cos(a - 2.5) * 3.4, b.y + Math.sin(a - 2.5) * 3.4);
          ctx.closePath(); ctx.fill();
        }
        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('separation · alignment · cohesion — each one looks only at its neighbours', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText(B.length + ' birds   sep ' + P.sep.toFixed(2) +
          '   ali ' + P.ali.toFixed(2) + '   coh ' + P.coh.toFixed(2), 12, h - 12);
      }
    };
  }
}
