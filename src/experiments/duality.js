import { TAU, L } from '../core/shared.js';

export default { id: 'duality',
  name: L('Wave or particle, your choice', 'Onda o partícula, tú eliges'),
  note: L('One apparatus. Slide the second mirror in and out, and the photon changes what it was.',
          'Un aparato. Mete y saca el segundo espejo, y el fotón cambia lo que fue.'),
  params: [
    { key: 'bs2',  label: L('Second splitter in place', 'Segundo divisor puesto'), min: 0, max: 1, step: 1, def: 1 },
    { key: 'late', label: L('Decide after entry', 'Decidir tras la entrada'), min: 0, max: 1, step: 1, def: 0 },
    { key: 'phase', label: L('Phase φ', 'Fase φ'), min: 0, max: 360, step: 1, def: 60, unit: '°' }
  ],
  make() {
    const NB = 72;                                  // phase bins for the curve
    let curve = Array.from({ length: NB }, () => ({ n: 0, d0: 0 }));
    let shots = [], lastBS = -1, early = 0, lateN = 0, earlyD0 = 0, lateD0 = 0;
    return {
      reset() { curve = Array.from({ length: NB }, () => ({ n: 0, d0: 0 }));
                shots = []; early = lateN = earlyD0 = lateD0 = 0; },
      step(ctx, w, h, t, acc, P, M) {
        const deg = M.in ? (M.x / w) * 360 : P.phase;
        const phi = deg * Math.PI / 180;
        const hasBS2 = P.bs2 > 0.5, delayed = P.late > 0.5;
        if (hasBS2 !== (lastBS === 1)) {             // switching mode clears the curve
          lastBS = hasBS2 ? 1 : 0;
          curve = Array.from({ length: NB }, () => ({ n: 0, d0: 0 }));
          early = lateN = earlyD0 = lateD0 = 0;
        }

        // ── Geometry. Three bands that don't overlap:
        //    0–0.12h text · 0.14–0.62h apparatus · 0.66–0.96h curve
        //    D1 exits DOWNWARD to keep the top clear for the header.
        const SRC = [w * 0.06, h * 0.20], BS1 = [w * 0.20, h * 0.20];
        const M1  = [w * 0.20, h * 0.48], M2  = [w * 0.52, h * 0.20];
        const BS2 = [w * 0.52, h * 0.48];
        const D0  = [w * 0.76, h * 0.48], D1 = [w * 0.52, h * 0.62];
        const line = (p1, p2, al, lw) => {
          ctx.strokeStyle = `rgba(${acc},${al})`; ctx.lineWidth = lw || 1.4;
          ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
        };
        line(SRC, BS1, 0.4);
        line(BS1, M2, 0.3); line(M2, BS2, 0.3);       // arm A: right, then down
        line(BS1, M1, 0.3); line(M1, BS2, 0.3);       // arm B: down, then right
        line(BS2, D0, 0.3); line(BS2, D1, 0.3);

        ctx.font = '10px monospace';
        const tag = (x, y, str, al) => {
          ctx.fillStyle = `rgba(${acc},${al || 0.55})`;
          ctx.fillText(str, x, y);
        };
        const mirror = p => { ctx.strokeStyle = `rgba(${acc},0.75)`; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(p[0] - 10, p[1] - 10); ctx.lineTo(p[0] + 10, p[1] + 10); ctx.stroke(); };
        const splitter = (p, on) => {
          ctx.strokeStyle = on ? `rgba(${acc},0.95)` : `rgba(${acc},0.16)`;
          ctx.lineWidth = on ? 2.6 : 1.4;
          if (!on) ctx.setLineDash([3, 4]);
          ctx.beginPath(); ctx.moveTo(p[0] - 11, p[1] + 11); ctx.lineTo(p[0] + 11, p[1] - 11); ctx.stroke();
          ctx.setLineDash([]);
        };
        mirror(M1); mirror(M2); splitter(BS1, true); splitter(BS2, hasBS2);

        // Labels: all OUTSIDE the rectangle, none crosses a path
        ctx.fillStyle = `rgba(${acc},0.9)`;
        ctx.beginPath(); ctx.arc(SRC[0], SRC[1], 4, 0, TAU); ctx.fill();
        tag(SRC[0] - 20, SRC[1] - 14, 'source', 0.7);
        tag(BS1[0] - 46, BS1[1] - 16, 'splitter 1');
        tag(M2[0] - 16, M2[1] - 16, 'mirror');
        tag(M1[0] - 52, M1[1] + 4, 'mirror');
        tag(BS2[0] + 16, BS2[1] + 26, hasBS2 ? 'splitter 2' : 'splitter 2 · REMOVED', hasBS2 ? 0.55 : 0.95);
        // The two arms, labeled wherever there's free space
        tag((BS1[0] + M2[0]) / 2 - 40, BS1[1] - 16, 'path A   φ = ' + deg.toFixed(0) + '°', 0.8);
        tag((M1[0] + BS2[0]) / 2 - 24, M1[1] + 20, 'path B', 0.55);
        // ── Photons
        if (Math.random() < 0.4) shots.push({ u: 0, arm: Math.random() < 0.5 ? 0 : 1,
                                              decided: !delayed, bs2: hasBS2, hit: null, wasLate: delayed });
        shots = shots.filter(s => {
          s.u += 0.010;
          if (!s.decided && s.u > 0.55) { s.decided = true; s.bs2 = hasBS2; }
          const u = s.u;
          const dot = (p, a, r) => { ctx.fillStyle = `rgba(${acc},${a})`;
            ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.fill(); };
          if (u < 0.22) {
            const k = u / 0.22;
            dot([SRC[0] + (BS1[0] - SRC[0]) * k, SRC[1]], 0.95, 3);
          } else if (u < 0.72) {
            const k = (u - 0.22) / 0.5;
            const arms = (s.decided && !s.bs2) ? [s.arm] : [0, 1];
            for (const a of arms) {
              // A: right along the top then down. B: down then right.
              const p = a === 0
                ? (k < 0.5 ? [BS1[0] + (M2[0] - BS1[0]) * (k / 0.5), BS1[1]]
                           : [M2[0], M2[1] + (BS2[1] - M2[1]) * ((k - 0.5) / 0.5)])
                : (k < 0.5 ? [BS1[0], BS1[1] + (M1[1] - BS1[1]) * (k / 0.5)]
                           : [M1[0] + (BS2[0] - M1[0]) * ((k - 0.5) / 0.5), M1[1]]);
              arms.length === 1 ? dot(p, 0.95, 3) : dot(p, 0.45, 2.4);
            }
          } else {
            if (s.hit === null) {
              const pd0 = s.bs2 ? Math.cos(phi / 2) ** 2 : 0.5;
              s.hit = Math.random() < pd0 ? 0 : 1;
              const b = Math.min(NB - 1, Math.floor((deg / 360) * NB));
              curve[b].n++; if (s.hit === 0) curve[b].d0++;
              if (s.wasLate) { lateN++; if (!s.hit) lateD0++; }
              else { early++; if (!s.hit) earlyD0++; }
            }
            const k = (u - 0.72) / 0.28;
            dot(s.hit === 0 ? [BS2[0] + (D0[0] - BS2[0]) * k, D0[1]]
                            : [D1[0], BS2[1] + (D1[1] - BS2[1]) * k], 0.95, 3);
          }
          return u < 1;
        });

        [[D0, 'D0', 18, 4], [D1, 'D1', -8, 26]].forEach(([p, lab, dx, dy]) => {
          ctx.strokeStyle = `rgba(${acc},0.8)`; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.arc(p[0], p[1], 10, 0, TAU); ctx.stroke();
          ctx.font = '11px monospace'; ctx.fillStyle = `rgba(${acc},0.9)`;
          ctx.fillText(lab, p[0] + dx, p[1] + dy);
        });

        // ── The curve: this is what makes the difference visible
        const gx = w * 0.08, gw = w * 0.86, gy = h * 0.95, gh = h * 0.27;
        ctx.strokeStyle = `rgba(${acc},0.18)`; ctx.lineWidth = 1;
        [0, 0.5, 1].forEach(v => { const Y = gy - v * gh;
          ctx.beginPath(); ctx.moveTo(gx, Y); ctx.lineTo(gx + gw, Y); ctx.stroke(); });
        ctx.font = '10px monospace'; ctx.fillStyle = `rgba(${acc},0.45)`;
        ctx.fillText('1', gx - 12, gy - gh + 4); ctx.fillText('½', gx - 12, gy - gh / 2 + 4);
        ctx.fillText('0', gx - 12, gy + 4);
        ctx.fillText('P(D0) vs φ', gx, gy - gh - 8);
        // Prediction
        ctx.strokeStyle = `rgba(${acc},0.45)`; ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 5]); ctx.beginPath();
        for (let i = 0; i <= 180; i++) {
          const d = (i / 180) * 360, v = hasBS2 ? Math.cos((d * Math.PI / 180) / 2) ** 2 : 0.5;
          const X = gx + (i / 180) * gw, Y = gy - v * gh;
          i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
        }
        ctx.stroke(); ctx.setLineDash([]);
        // Measured
        ctx.fillStyle = `rgba(${acc},0.95)`;
        curve.forEach((c, i) => {
          if (c.n < 3) return;
          const X = gx + ((i + 0.5) / NB) * gw, Y = gy - (c.d0 / c.n) * gh;
          ctx.beginPath(); ctx.arc(X, Y, 2.4, 0, TAU); ctx.fill();
        });
        const mx = gx + (deg / 360) * gw;
        ctx.strokeStyle = `rgba(${acc},0.35)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(mx, gy - gh); ctx.lineTo(mx, gy); ctx.stroke();

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText(hasBS2 ? 'WAVE — both routes contribute, φ decides the detector'
                            : 'PARTICLE — the detector names the route, φ does nothing', 118, 22);
        const fE = early ? earlyD0 / early : 0, fL = lateN ? lateD0 / lateN : 0;
        ctx.fillStyle = `rgba(${acc},0.9)`;
        ctx.fillText('decided early  ' + (early ? fE.toFixed(3) : '—') +
                     '     decided mid-flight  ' + (lateN ? fL.toFixed(3) : '—') +
                     '     predicted ' + (hasBS2 ? (Math.cos(phi / 2) ** 2).toFixed(3) : '0.500'), 118, 40);
      }
    };
  }
}
