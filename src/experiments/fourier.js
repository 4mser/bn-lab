import { TAU, L } from '../core/shared.js';

export default { id: 'fourier',
  name: L('Fourier series', 'Serie de Fourier'),
  note: L('Enough circles turning at once will draw any shape.',
          'Suficientes círculos girando a la vez dibujan cualquier forma.'),
  params: [
    { key: 'terms', label: L('Harmonics', 'Armónicos'), min: 1, max: 20, step: 1, def: 6 },
    { key: 'speed', label: L('Speed', 'Velocidad'),     min: 0, max: 2, step: 0.05, def: 0.6 }
  ],
  make() {
    let trace = [];
    return {
      reset() { trace = []; },
      step(ctx, w, h, t, acc, P, M) {
        const cx = w * 0.34, cy = h / 2, R = Math.min(w, h) * 0.17;
        // The mouse drags the phase: you can scrub through the wave by hand
        const phase = M.in ? (M.x / w) * 12 : t * P.speed;
        let x = cx, y = cy;
        ctx.lineWidth = 1;
        for (let i = 0; i < (P.terms | 0); i++) {
          const n = i * 2 + 1, r = R * (4 / (n * Math.PI));
          const px = x, py = y;
          x += r * Math.cos(n * phase); y += r * Math.sin(n * phase);
          ctx.strokeStyle = `rgba(${acc},0.20)`;
          ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.stroke();
          ctx.strokeStyle = `rgba(${acc},0.45)`;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
        }
        trace.unshift(y);
        if (trace.length > Math.floor(w * 0.6)) trace.pop();
        ctx.strokeStyle = `rgba(${acc},0.85)`; ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let i = 0; i < trace.length; i++) {
          const tx = w * 0.62 + i, ty = trace[i];
          i ? ctx.lineTo(tx, ty) : ctx.moveTo(tx, ty);
        }
        ctx.stroke();
        ctx.strokeStyle = `rgba(${acc},0.3)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(w * 0.62, trace[0]); ctx.stroke();
      }
    };
  }
}
