import { TAU, L, ink } from '../core/shared.js';

export default { id: 'entanglement',
  name: L('Bell test', 'Test de Bell'),
  note: L('Two detectors, random outcomes each, correlations no local theory can produce.',
          'Dos detectores, resultados azarosos en cada uno, correlaciones que ninguna teoría local produce.'),
  params: [
    { key: 'angA',  label: L('Detector A angle', 'Ángulo del detector A'), min: 0, max: 180, step: 1, def: 0, unit: '°' },
    { key: 'angB',  label: L('Detector B angle', 'Ángulo del detector B'), min: 0, max: 180, step: 1, def: 45, unit: '°' },
    { key: 'speed', label: L('Pairs per frame', 'Pares por frame'), min: 1, max: 200, step: 1, def: 40 }
  ],
  make() {
    // Settings that maximize CHSH under this sign convention (E = −cos):
    //   a = 0°, a' = 90°, b = 45°, b' = 135°  →  S = 2√2
    // With 0/45/22.5/67.5 the same state gives only 2.39: it still violates
    // the classical bound, but doesn't reach the quantum maximum.
    const SET = [[0, 45], [0, 135], [90, 45], [90, 135]];
    let tally = SET.map(() => ({ n: 0, s: 0 })), hist = [], shots = [];
    const D = 180 / Math.PI;
    return {
      reset() { tally = SET.map(() => ({ n: 0, s: 0 })); hist = []; shots = []; },
      step(ctx, w, h, t, acc, P, M) {
        const aA = M.in ? (M.x / w) * 180 : P.angA;
        const aB = P.angB;

        // One measurement: each side gives ±1 at random, but the correlation
        // of the singlet state is E = −cos(a − b). There's no signal between them.
        const measure = (a, b) => {
          const E = -Math.cos((a - b) / D);
          const A = Math.random() < 0.5 ? 1 : -1;
          const B = Math.random() < (1 + E) / 2 ? A : -A;
          return [A, B];
        };

        for (let k = 0; k < (P.speed | 0); k++) {
          SET.forEach((cfg, i) => {
            const [A, B] = measure(cfg[0], cfg[1]);
            tally[i].n++; tally[i].s += A * B;
          });
          const [A, B] = measure(aA, aB);
          shots.push({ A, B, life: 0 });
        }
        if (shots.length > 40) shots.splice(0, shots.length - 40);

        const E = tally.map(x => (x.n ? x.s / x.n : 0));
        const S = Math.abs(E[0] - E[1] + E[2] + E[3]);   // CHSH parameter

        // Measured correlation of the visible pair against the prediction
        const Emeas = -Math.cos((aA - aB) / D);
        hist.push(Emeas);
        if (hist.length > 200) hist.shift();

        const cx = w / 2, cy = h * 0.34, arm = Math.min(w * 0.3, h * 0.3);
        // Source at the center, detectors on the sides
        ctx.strokeStyle = `rgba(${acc},0.25)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx - arm, cy); ctx.lineTo(cx + arm, cy); ctx.stroke();
        ctx.fillStyle = `rgba(${acc},0.9)`;
        ctx.beginPath(); ctx.arc(cx, cy, 4, 0, TAU); ctx.fill();

        const dial = (x, ang, label, val) => {
          ctx.strokeStyle = `rgba(${acc},0.5)`; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(x, cy, 16, 0, TAU); ctx.stroke();
          const r = ang / D;
          ctx.strokeStyle = `rgba(${acc},0.95)`; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x - 16 * Math.cos(r), cy - 16 * Math.sin(r));
          ctx.lineTo(x + 16 * Math.cos(r), cy + 16 * Math.sin(r)); ctx.stroke();
          ctx.font = '10px monospace'; ctx.fillStyle = `rgba(${acc},0.7)`;
          ctx.fillText(label + ' ' + ang.toFixed(0) + '°', x - 22, cy + 34);
          ctx.fillStyle = val > 0 ? `rgba(${acc},1)` : `rgba(${ink()},0.9)`;
          ctx.fillText(val > 0 ? '+1' : '−1', x - 7, cy - 26);
        };
        const last = shots[shots.length - 1] || { A: 1, B: -1 };
        dial(cx - arm, aA, 'A', last.A);
        dial(cx + arm, aB, 'B', last.B);

        // Correlation curve: measurement against −cos(Δ)
        const gy = h * 0.72, gh = h * 0.2, gw = w * 0.76, gx = w * 0.12;
        ctx.strokeStyle = `rgba(${acc},0.18)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
        ctx.strokeStyle = `rgba(${acc},0.5)`;
        ctx.beginPath();
        for (let i = 0; i <= 90; i++) {
          const d = (i / 90) * 180, y = gy - (-Math.cos(d / D)) * gh;
          i ? ctx.lineTo(gx + (i / 90) * gw, y) : ctx.moveTo(gx, y);
        }
        ctx.stroke();
        const px = gx + (Math.abs(aA - aB) / 180) * gw;
        ctx.fillStyle = `rgba(${acc},1)`;
        ctx.beginPath(); ctx.arc(px, gy - Emeas * gh, 3.4, 0, TAU); ctx.fill();

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('E(a,b) = −cos(a−b)      classical limit S ≤ 2', 12, h - 28);
        ctx.fillStyle = S > 2 ? `rgba(${acc},1)` : `rgba(${ink()},0.8)`;
        ctx.fillText('CHSH  S = ' + S.toFixed(3) + '   (2√2 = 2.828)' +
          (S > 2 ? '   violated' : ''), 12, h - 12);
      }
    };
  }
}
