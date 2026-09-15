import { L } from '../core/shared.js';

export default { id: 'quantum',
  name: L('Particle in a box', 'Partícula en una caja'),
  note: L('Two states added together. The probability sloshes and never settles.',
          'Dos estados sumados. La probabilidad chapotea y nunca se asienta.'),
  params: [
    { key: 'n1',  label: L('State n₁', 'Estado n₁'), min: 1, max: 6, step: 1, def: 1 },
    { key: 'n2',  label: L('State n₂', 'Estado n₂'), min: 1, max: 8, step: 1, def: 2 },
    { key: 'mix', label: L('Mix', 'Mezcla'),         min: 0, max: 1, step: 0.01, def: 0.5 }
  ],
  make() {
    return {
      step(ctx, w, h, t, acc, P, M) {
        const pad = w * 0.08, L = w - pad * 2, base = h * 0.55, A = h * 0.16;
        const mix = M.in ? Math.min(1, Math.max(0, M.x / w)) : P.mix;
        const a = Math.sqrt(1 - mix), b = Math.sqrt(mix);
        const n1 = P.n1 | 0, n2 = P.n2 | 0;
        const E1 = n1 * n1 * 0.35, E2 = n2 * n2 * 0.35;   // Eₙ ∝ n²

        // Walls of the well
        ctx.strokeStyle = `rgba(${acc},0.35)`; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad, h * 0.12); ctx.lineTo(pad, h * 0.9);
        ctx.moveTo(pad + L, h * 0.12); ctx.lineTo(pad + L, h * 0.9);
        ctx.stroke();

        let reP = [], imP = [], pr = [];
        for (let i = 0; i <= 220; i++) {
          const u = i / 220, x = pad + u * L;
          const f1 = Math.sin(n1 * Math.PI * u), f2 = Math.sin(n2 * Math.PI * u);
          const re = a * f1 * Math.cos(-E1 * t) + b * f2 * Math.cos(-E2 * t);
          const im = a * f1 * Math.sin(-E1 * t) + b * f2 * Math.sin(-E2 * t);
          reP.push([x, base - re * A]); imP.push([x, base - im * A]);
          pr.push([x, base - (re * re + im * im) * A * 1.5]);
        }
        const line = (pts, alpha, lw) => {
          ctx.strokeStyle = `rgba(${acc},${alpha})`; ctx.lineWidth = lw;
          ctx.beginPath(); pts.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
          ctx.stroke();
        };
        line(reP, 0.35, 1);          // real part
        line(imP, 0.22, 1);          // imaginary part
        line(pr, 0.95, 1.6);         // |ψ|², the only observable quantity
        ctx.fillStyle = `rgba(${acc},0.8)`; ctx.font = '11px monospace';
        ctx.fillText('|ψ|²  n₁=' + n1 + '  n₂=' + n2, 12, 20);
      }
    };
  }
}
