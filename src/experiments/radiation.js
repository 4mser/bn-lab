import { TAU, L } from '../core/shared.js';

export default { id: 'radiation',
  name: L('Why light exists', 'Por qué existe la luz'),
  note: L('Field lines drawn from the retarded position. Shake a charge and you see the kink leave.',
          'Líneas de campo desde la posición retardada. Sacude una carga y ves salir el quiebre.'),
  params: [
    { key: 'mode',  label: L('Motion', 'Movimiento'), min: 0, max: 2, step: 1, def: 0 },
    { key: 'beta',  label: L('Speed (v/c)', 'Rapidez (v/c)'), min: 0.05, max: 0.75, step: 0.01, def: 0.35 },
    { key: 'lines', label: L('Field lines', 'Líneas de campo'), min: 8, max: 40, step: 2, def: 24 }
  ],
  make() {
    // Purcell construction: a field line points radially from
    // where the charge WAS at time r/c ago, not where it is now. When it accelerates,
    // that discrepancy builds up into a kink that travels at c. The kink is light.
    const DT = 1 / 120, C = 210;         // px per second
    let hist = [], st = 0, acct = 0;
    const posAt = (tt, mode, beta, w, h) => {
      // The only thing visible is the wavelength λ = c·T, so it's fixed to
      // a fraction of the canvas so several fit, and the amplitude follows
      // from that: A = βλ/2π. This is the real relation for a dipole, and
      // explains why the charge barely moves while the whole field oscillates.
      const LAM = Math.min(w, h) * 0.38, om = (TAU * C) / LAM, A = (beta * C) / om;
      if (mode === 0) return [w / 2 + A * Math.sin(om * tt), h / 2];
      if (mode === 1) return [w / 2 + A * Math.cos(om * tt), h / 2 + A * Math.sin(om * tt)];
      // Hard bounce: constant speed with abrupt reversals. Its path
      // is chosen so the kinks end up ~200px apart and several are visible.
      const AB = LAM * 0.18, T = (AB * 4) / (beta * C), ph = ((tt % T) + T) % T;
      const x = ph < T / 2 ? -AB + (ph / (T / 2)) * 2 * AB : AB - ((ph - T / 2) / (T / 2)) * 2 * AB;
      return [w / 2 + x, h / 2];
    };
    return {
      reset() { hist = []; st = 0; acct = 0; },
      step(ctx, w, h, t, acc, P, M) {
        const mode = P.mode | 0;
        const RMAX = Math.hypot(w, h) * 0.52;
        const need = Math.ceil(RMAX / (C * DT)) + 4;
        // Motion is a pure function of time, so the past can be
        // computed ahead of time: it's precomputed and the field appears fully
        // formed from the first frame instead of taking seconds to fill in.
        if (hist.length < need)
          for (let i = hist.length; i < need; i++) hist.push(posAt(st - i * DT, mode, P.beta, w, h));
        // A fixed-step proper clock: this way the history index IS the distance
        acct += 1 / 60;
        while (st < acct) {
          st += DT;
          hist.unshift(posAt(st, mode, P.beta, w, h));
          if (hist.length > need) hist.length = need;
        }

        const N = P.lines | 0, dr = C * DT * 2;
        for (let k = 0; k < N; k++) {
          const th = (k / N) * TAU;
          const ct = Math.cos(th), sn = Math.sin(th);
          ctx.beginPath();
          let started = false;
          for (let r = 6; r < RMAX; r += dr) {
            const idx = Math.min(hist.length - 1, Math.round(r / (C * DT)));
            const p = hist[idx];
            const x = p[0] + r * ct, y = p[1] + r * sn;
            started ? ctx.lineTo(x, y) : (ctx.moveTo(x, y), started = true);
          }
          ctx.strokeStyle = `rgba(${acc},0.42)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        const now = hist[0];
        ctx.fillStyle = `rgba(${acc},1)`;
        ctx.beginPath(); ctx.arc(now[0], now[1], 4.5, 0, TAU); ctx.fill();
        ctx.strokeStyle = `rgba(${acc},0.14)`;
        ctx.beginPath(); ctx.arc(now[0], now[1], 5.5, 0, TAU); ctx.stroke();

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText(['dipole — the textbook antenna',
                      'circular — this is synchrotron light',
                      'hard turns — every kink is a burst'][mode], 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText('v/c = ' + P.beta.toFixed(2) +
          '   lines point at the charge as it was r/c ago', 12, h - 12);
      }
    };
  }
}
