import { TAU, L } from '../core/shared.js';

export default { id: 'brownian',
  name: L('Brownian motion', 'Movimiento browniano'),
  note: L('Einstein 1905: the jitter that proved atoms are real.',
          'Einstein 1905: el temblor que demostró que los átomos existen.'),
  params: [
    { key: 'jump',    label: L('Step size', 'Tamaño del paso'), min: 1, max: 18, step: 0.5, def: 6 },
    { key: 'walkers', label: L('Walkers', 'Caminantes'),        min: 1, max: 14, step: 1,   def: 6 },
    { key: 'drift',   label: L('Cursor drift', 'Deriva al cursor'), min: 0, max: 2, step: 0.05, def: 0.5 }
  ],
  make(w, h) {
    let W = [];
    const fit = (n, w, h) => {
      while (W.length < n) W.push({ x: w / 2, y: h / 2, p: [] });
      if (W.length > n) W.length = n;
    };
    return {
      resize(w, h) { W.forEach(k => { k.x = w / 2; k.y = h / 2; k.p.length = 0; }); },
      reset() { W = []; },
      step(ctx, w, h, t, acc, P, M) {
        fit(P.walkers | 0, w, h);
        for (const k of W) {
          for (let i = 0; i < 3; i++) {
            k.x += (Math.random() - 0.5) * P.jump;
            k.y += (Math.random() - 0.5) * P.jump;
            if (M.in && P.drift) {                    // bias toward the cursor
              const dx = M.x - k.x, dy = M.y - k.y, d = Math.hypot(dx, dy) + 1;
              k.x += (dx / d) * P.drift; k.y += (dy / d) * P.drift;
            }
            k.x = Math.max(4, Math.min(w - 4, k.x)); k.y = Math.max(4, Math.min(h - 4, k.y));
            k.p.push([k.x, k.y]);
          }
          if (k.p.length > 520) k.p.splice(0, k.p.length - 520);
          ctx.lineWidth = 1;
          for (let i = 1; i < k.p.length; i++) {
            ctx.strokeStyle = `rgba(${acc},${((i / k.p.length) * 0.55).toFixed(3)})`;
            ctx.beginPath(); ctx.moveTo(k.p[i - 1][0], k.p[i - 1][1]);
            ctx.lineTo(k.p[i][0], k.p[i][1]); ctx.stroke();
          }
          ctx.fillStyle = `rgba(${acc},0.9)`;
          ctx.beginPath(); ctx.arc(k.x, k.y, 2.2, 0, TAU); ctx.fill();
        }
      }
    };
  }
}
