import { TAU, L } from '../core/shared.js';

export default { id: 'interference',
  name: L('Interference', 'Interferencia'),
  note: L('Two point sources. |ψ|² where their waves overlap.',
          'Dos fuentes puntuales. |ψ|² donde sus ondas se cruzan.'),
  params: [
    { key: 'lambda',  label: L('Wavelength λ', 'Longitud de onda λ'), min: 12, max: 70, step: 1, def: 34, unit: 'px' },
    { key: 'sources', label: L('Sources', 'Fuentes'),                 min: 2,  max: 5,  step: 1, def: 2 },
    { key: 'speed',   label: L('Speed', 'Velocidad'),                 min: 0,  max: 4,  step: 0.1, def: 2.2 }
  ],
  make() {
    return {
      step(ctx, w, h, t, acc, P, M) {
        const STEP = 6, k = TAU / P.lambda;
        const src = [];
        if (M.in) src.push([M.x, M.y, 1]);
        else src.push([w * (0.5 + 0.22 * Math.cos(t * 0.25)), h * 0.36, 1]);
        for (let i = 1; i < P.sources; i++) {
          const a = (i / (P.sources - 1)) * Math.PI + 0.6;
          src.push([w * (0.5 + 0.3 * Math.cos(a)), h * (0.55 + 0.22 * Math.sin(a)), 0.92]);
        }
        for (let x = STEP / 2; x < w; x += STEP) {
          for (let y = STEP / 2; y < h; y += STEP) {
            let psi = 0;
            for (const s of src) {
              const r = Math.hypot(x - s[0], y - s[1]) + 8;
              psi += s[2] * (22 / Math.sqrt(r)) * Math.cos(k * r - t * P.speed);
            }
            const I = Math.min(1, psi * psi / 9);
            if (I < 0.04) continue;
            ctx.fillStyle = `rgba(${acc},${(0.09 + I * 0.72).toFixed(3)})`;
            ctx.beginPath(); ctx.arc(x, y, 0.5 + I * 2.2, 0, TAU); ctx.fill();
          }
        }
        ctx.strokeStyle = `rgba(${acc},0.5)`; ctx.lineWidth = 1;
        for (const s of src) { ctx.beginPath(); ctx.arc(s[0], s[1], 3.5, 0, TAU); ctx.stroke(); }
      }
    };
  }
}
