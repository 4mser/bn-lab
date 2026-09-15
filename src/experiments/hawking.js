import { TAU, L, ink } from '../core/shared.js';

export default { id: 'hawking',
  name: L('Hawking radiation', 'Radiación de Hawking'),
  note: L('Pairs born at the horizon. One escapes, one falls in, and the hole loses mass.',
          'Pares que nacen en el horizonte. Uno escapa, otro cae, y el agujero pierde masa.'),
  params: [
    { key: 'mass', label: L('Initial mass', 'Masa inicial'), min: 20, max: 120, step: 2, def: 80 },
    { key: 'rate', label: L('Evaporation rate', 'Ritmo de evaporación'), min: 0, max: 3, step: 0.05, def: 0.6 },
    { key: 'pairs', label: L('Pair density', 'Densidad de pares'), min: 2, max: 40, step: 1, def: 16 }
  ],
  make() {
    let M = 80, pairs = [], flash = 0;
    return {
      reset() { M = 0; pairs = []; flash = 0; },
      step(ctx, w, h, t, acc, P, M0) {
        if (M <= 0) M = P.mass;
        const cx = w / 2, cy = h / 2;
        // The horizon grows with mass: r_s = 2GM/c²
        const rs = M * 0.9;
        // Hawking temperature: T = ħc³/8πGMk_B → T ∝ 1/M.
        // This is why evaporating HEATS UP: the less mass left, the more it radiates.
        const T = 60 / M;
        // Luminosity ∝ 1/M², so dM/dt ∝ −1/M² and the end is abrupt
        if (P.rate > 0) M -= (P.rate * 40) / (M * M);
        if (M < 6) { flash = 1; M = P.mass; pairs = []; }
        flash *= 0.9;

        // Photon sphere at 1.5 r_s: the last possible orbit for light
        ctx.strokeStyle = `rgba(${acc},0.22)`; ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.arc(cx, cy, rs * 1.5, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);

        // Pair creation at the horizon
        const want = P.pairs | 0;
        if (pairs.length < want && Math.random() < 0.5) {
          const a = Math.random() * TAU;
          pairs.push({ a, r: rs, out: 0, life: 0 });
        }
        pairs = pairs.filter(p => {
          p.life += 0.016;
          p.out += 0.8 + T * 6;                    // the escaping one moves away
          const ro = rs + p.out, ri = Math.max(0, rs - p.out * 0.55);
          const fade = Math.max(0, 1 - p.out / (Math.min(w, h) * 0.45));
          // The escaping one: positive energy, visible
          ctx.fillStyle = `rgba(${acc},${(fade * 0.9).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(cx + ro * Math.cos(p.a), cy + ro * Math.sin(p.a), 1.8, 0, TAU); ctx.fill();
          // The infalling one: NEGATIVE energy, which is why the hole loses mass
          ctx.fillStyle = `rgba(${ink()},${(fade * 0.4).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(cx + ri * Math.cos(p.a), cy + ri * Math.sin(p.a), 1.4, 0, TAU); ctx.fill();
          return fade > 0.02;
        });

        // The horizon: a perfectly black disk with an edge
        const grd = ctx.createRadialGradient(cx, cy, rs * 0.9, cx, cy, rs * 1.25);
        grd.addColorStop(0, 'rgba(0,0,0,1)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(cx, cy, rs * 1.25, 0, TAU); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(cx, cy, rs, 0, TAU); ctx.fill();
        ctx.strokeStyle = `rgba(${acc},${(0.5 + T * 2).toFixed(2)})`; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(cx, cy, rs, 0, TAU); ctx.stroke();

        if (flash > 0.02) {                        // the final flash
          ctx.fillStyle = `rgba(${acc},${(flash * 0.5).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(cx, cy, rs * (1 + (1 - flash) * 6), 0, TAU); ctx.fill();
        }

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('T ∝ 1/M      L ∝ 1/M²      lifetime ∝ M³', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText('M = ' + M.toFixed(1) + '     T = ' + T.toFixed(3) + '  (rising)', 12, h - 12);
      }
    };
  }
}
