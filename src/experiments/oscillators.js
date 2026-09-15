import { TAU, L } from '../core/shared.js';

export default { id: 'oscillators',
  name: L('Coupled oscillators', 'Osciladores acoplados'),
  note: L('Two masses, one spring between them. Energy moves back and forth on its own.',
          'Dos masas, un resorte entre ellas. La energía va y viene sola.'),
  params: [
    { key: 'kc',   label: L('Coupling', 'Acoplamiento'), min: 0, max: 0.6, step: 0.01, def: 0.18 },
    { key: 'k',    label: L('Stiffness', 'Rigidez'),     min: 0.2, max: 3, step: 0.05, def: 1 },
    { key: 'mass', label: L('Mass ratio', 'Razón de masas'), min: 0.4, max: 3, step: 0.05, def: 1 }
  ],
  make() {
    let x1 = 1, x2 = 0, v1 = 0, v2 = 0, h1 = [], h2 = [];
    return {
      reset() { x1 = 1; x2 = 0; v1 = v2 = 0; h1 = []; h2 = []; },
      step(ctx, w, h, t, acc, P, M) {
        if (M.in) { x1 = (M.y / h - 0.5) * 2; v1 = 0; }   // the cursor lifts the first mass
        const dt = 0.12;
        for (let i = 0; i < 3; i++) {
          const a1 = (-P.k * x1 - P.kc * (x1 - x2));
          const a2 = (-P.k * x2 - P.kc * (x2 - x1)) / P.mass;
          v1 += a1 * dt; v2 += a2 * dt; x1 += v1 * dt; x2 += v2 * dt;
        }
        h1.push(x1); h2.push(x2);
        if (h1.length > w * 0.5) { h1.shift(); h2.shift(); }

        const cy = h * 0.32, A = h * 0.16, xa = w * 0.26, xb = w * 0.62;
        ctx.strokeStyle = `rgba(${acc},0.3)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(xa, cy + x1 * A); ctx.lineTo(xb, cy + x2 * A); ctx.stroke();
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.beginPath(); ctx.arc(xa, cy + x1 * A, 7, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.arc(xb, cy + x2 * A, 7 * Math.sqrt(P.mass), 0, TAU); ctx.fill();

        // History of each mass: the beat pattern shows up on its own
        const y0 = h * 0.74, s = h * 0.1;
        [[h1, 0.85], [h2, 0.4]].forEach(([arr, al]) => {
          ctx.strokeStyle = `rgba(${acc},${al})`; ctx.lineWidth = 1.2;
          ctx.beginPath();
          arr.forEach((v, k) => { const X = w * 0.06 + k * 2, Y = y0 + v * s;
            k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
          ctx.stroke();
        });
      }
    };
  }
}
