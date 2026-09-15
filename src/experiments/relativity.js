import { TAU, L } from '../core/shared.js';

export default { id: 'relativity',
  name: L('Special relativity', 'Relatividad especial'),
  note: L('A light clock, seen from two frames. Same bounces, different elapsed time.',
          'Un reloj de luz visto desde dos marcos. Mismos rebotes, distinto tiempo transcurrido.'),
  params: [
    { key: 'vista', label: L('View: 0 same frame · 1 two frames', 'Vista: 0 un marco · 1 dos marcos'),
      min: 0, max: 1, step: 1, def: 1 },
    { key: 'beta',  label: L('Speed β = v/c', 'Velocidad β = v/c'), min: 0, max: 0.98, step: 0.005, def: 0.6 },
    { key: 'rate',  label: L('Clock rate', 'Ritmo del reloj'),      min: 0.3, max: 2.5, step: 0.05, def: 1 },
    { key: 'trail', label: L('Path memory', 'Memoria del camino'),  min: 0, max: 900, step: 20, def: 420 }
  ],
  make() {
    // ── Two different diagrams, and the difference between them IS the lesson.
    //
    // You can't have all three at once:
    //   (1) both balls bounce at the same instant
    //   (2) both move at the same on-screen speed
    //   (3) the one on the right covers more distance (true if β > 0)
    // Any two of these rule out the third.
    //
    // View 1 (default) = 1+3: the SAME clock seen from two frames.
    // The bounces are the SAME EVENTS, so they happen together. What
    // changes is how much time each clock ticked off between those two
    // events: the right panel covers γ times more distance at the same c,
    // meaning γ times more time passed in your frame. That's time dilation,
    // derived rather than assumed. The ON-SCREEN speeds aren't compared
    // between panels, because each panel runs on its own time axis.
    //
    // View 0 = 2+3: two clocks in ONE frame. Here both photons do travel at
    // c on screen, which is why the moving one bounces less often.
    let ph = 0, lab = 0, tau = 0, ticksM = 0, ticksR = 0, path = [], px0 = 0;
    let xL = 0, yL = 0, prevPm = 1, upL = -1, legs = 0;
    // Distance each photon has traveled, accumulated straight from the drawing.
    // The clock readings are computed from this (t = s / c) instead of by
    // multiplying by γ: that way the number is a MEASUREMENT of what's on
    // screen and exposes any geometry error, rather than just repeating the formula.
    let sIzq = 0, sDer = 0, ultIzq = null, ultDer = null;
    const tri = u => Math.abs(((u % 2) + 2) % 2 - 1);   // sawtooth 1→0→1
    return {
      reset() { ph = 0; lab = 0; tau = 0; ticksM = ticksR = 0; path = []; px0 = 0;
                xL = 0; yL = 0; prevPm = 1; upL = -1; legs = 0;
                sIzq = 0; sDer = 0; ultIzq = null; ultDer = null; },
      step(ctx, w, h, t, acc, P, M) {
        const beta = M.in ? Math.min(0.98, Math.max(0, M.x / w)) : P.beta;
        const g = 1 / Math.sqrt(1 - beta * beta);
        const dt = 0.016 * P.rate;
        const dos = (P.vista | 0) === 1;

        ctx.font = '11px monospace';

        if (dos) {
          // ══ TWO FRAMES ══════════════════════════════════════════════
          // A single phase advance drives both panels: by construction
          // the bounces are simultaneous, which is exactly what we want to show.
          // The animation runs on YOUR clock. That's why a leg takes γ
          // times longer: the bottom ball stays fixed at c no matter what
          // β is, while the top one slows to c/γ. Previously the axis was
          // the events' own time and the top panel didn't react to speed at all.
          const prev = ph;
          ph += (dt * 1.2) / g;
          if (Math.floor(ph) !== Math.floor(prev)) legs++;
          const p = tri(ph);

          // STACKED panels: this way the bottom clock has the full width to
          // travel across, and its reset happens off-screen. Side by side it
          // had to wrap around within the panel and would teleport on every
          // cycle, which is exactly the glitch this layout was meant to fix.
          const H = h * 0.28;
          const topA = h * 0.08, botA = topA + H;      // clock's own frame
          const topB = h * 0.46, botB = topB + H;      // your frame
          const cV = 1.2 * H;

          const mirror = (x, y0, y1, wide, a) => {
            ctx.strokeStyle = `rgba(${acc},${a})`; ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(x - wide / 2, y0); ctx.lineTo(x + wide / 2, y0);
            ctx.moveTo(x - wide / 2, y1); ctx.lineTo(x + wide / 2, y1);
            ctx.stroke();
          };
          const wide = Math.min(w * 0.09, 84);

          // ── Top: in the clock's own frame ──
          const ax = w * 0.5, ay = topA + H * p;
          mirror(ax, topA, botA, wide, 0.5);
          ctx.strokeStyle = `rgba(${acc},0.18)`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(ax, topA); ctx.lineTo(ax, botA); ctx.stroke();
          ctx.fillStyle = `rgba(${acc},0.95)`;
          ctx.beginPath(); ctx.arc(ax, ay, 4.2, 0, TAU); ctx.fill();

          // ── Bottom: the same clock, moving. It advances continuously and
          // reappears off-frame, never jumping into view.
          const pad = w * 0.10, span = w + 2 * pad;
          if (!px0) px0 = pad + w * 0.30;
          px0 += beta * cV * dt;                        // βγH per leg, with the new axis
          let reinicio = false;
          if (px0 > span) { px0 -= span; path.length = 0; reinicio = true; }
          const bx = -pad + px0, by = topB + H * p;

          path.push([bx, by]);
          const keep = P.trail | 0;
          if (keep === 0) path.length = 0;
          else if (path.length > keep) path.splice(0, path.length - keep);
          ctx.lineWidth = 1.1;
          for (let k = 1; k < path.length; k++) {
            if (Math.abs(path[k][0] - path[k - 1][0]) > w * 0.5) continue;
            ctx.strokeStyle = `rgba(${acc},${((k / path.length) * 0.5).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(path[k - 1][0], path[k - 1][1]);
            ctx.lineTo(path[k][0], path[k][1]);
            ctx.stroke();
          }

          mirror(bx, topB, botB, wide / g, 0.9);        // length contraction
          ctx.strokeStyle = `rgba(${acc},0.18)`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(bx, topB); ctx.lineTo(bx, botB); ctx.stroke();
          ctx.fillStyle = `rgba(${acc},1)`;
          ctx.beginPath(); ctx.arc(bx, by, 4.2, 0, TAU); ctx.fill();

          // Guide line: both are always at the same relative height
          ctx.strokeStyle = `rgba(${acc},0.12)`; ctx.lineWidth = 1;
          ctx.setLineDash([1, 5]);
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay + (topB - topA)); ctx.stroke();
          ctx.setLineDash([]);

          // Distance traveled by each photon, taken straight from the drawing
          if (ultIzq) { const d = Math.hypot(ax - ultIzq[0], ay - ultIzq[1]); if (d < H) sIzq += d; }
          if (ultDer && !reinicio) { const d = Math.hypot(bx - ultDer[0], by - ultDer[1]); if (d < H) sDer += d; }
          ultIzq = [ax, ay]; ultDer = [bx, by];

          ctx.fillStyle = `rgba(${acc},0.5)`;
          ctx.fillText('en el marco del reloj', 14, topA - 10);
          ctx.fillText('en tu marco', 14, topB - 10);

          const propio = (sIzq / cV).toFixed(2);
          const tuyo = (sDer / cV).toFixed(2);
          const medido = sIzq > 1 ? (sDer / sIzq) : 1;
          ctx.fillStyle = `rgba(${acc},0.9)`;
          ctx.fillText('reloj del cohete  τ = ' + propio + ' s     tu reloj  t = ' + tuyo + ' s', 12, h - 44);
          ctx.fillStyle = `rgba(${acc},0.55)`;
          ctx.fillText('mismos ' + legs + ' rebotes · arriba se ve lenta porque ese reloj corre lento en tu tiempo', 12, h - 28);
          ctx.fillStyle = `rgba(${acc},0.95)`;
          ctx.fillText('β = ' + beta.toFixed(3) + '    γ = ' + g.toFixed(3) +
            '    t/τ medido = ' + medido.toFixed(3), 12, h - 12);
          return;
        }

        // ══ ONE FRAME ═══════════════════════════════════════════════════
        const topY = h * 0.20, botY = h * 0.62, H = botY - topY;
        const restX = w * 0.13;

        const prevR = lab;
        lab += dt;
        const pr = tri(lab * 1.2);
        if (Math.floor(lab * 1.2) !== Math.floor(prevR * 1.2)) ticksR++;

        const prevT = tau;
        tau += dt / g;
        const pm = tri(tau * 1.2);
        if (Math.floor(tau * 1.2) !== Math.floor(prevT * 1.2)) ticksM++;

        const cLuz = 1.2 * H;
        const pad = w * 0.10;
        const span = w + 2 * pad;
        if (!px0) px0 = pad + w * 0.32;
        px0 = px0 + beta * cLuz * dt;
        if (px0 > span) { px0 -= span; path.length = 0; }
        const cxm = -pad + px0;

        const phY = topY + H * pm;
        path.push([cxm, phY]);
        const keep = P.trail | 0;
        if (keep === 0) path.length = 0;
        else if (path.length > keep) path.splice(0, path.length - keep);

        ctx.lineWidth = 1;
        for (let i = 1; i < path.length; i++) {
          if (Math.abs(path[i][0] - path[i - 1][0]) > w * 0.5) continue;
          ctx.strokeStyle = `rgba(${acc},${((i / path.length) * 0.55).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(path[i - 1][0], path[i - 1][1]);
          ctx.lineTo(path[i][0], path[i][1]);
          ctx.stroke();
        }

        const mirror2 = (x, alpha, wide) => {
          ctx.strokeStyle = `rgba(${acc},${alpha})`; ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(x - wide / 2, topY); ctx.lineTo(x + wide / 2, topY);
          ctx.moveTo(x - wide / 2, botY); ctx.lineTo(x + wide / 2, botY);
          ctx.stroke();
        };
        mirror2(restX, 0.3, w * 0.07);
        ctx.strokeStyle = `rgba(${acc},0.18)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(restX, topY); ctx.lineTo(restX, botY); ctx.stroke();
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.beginPath(); ctx.arc(restX, topY + H * pr, 3.2, 0, TAU); ctx.fill();

        mirror2(cxm, 0.9, (w * 0.07) / g);
        ctx.fillStyle = `rgba(${acc},1)`;
        ctx.beginPath(); ctx.arc(cxm, phY, 3.8, 0, TAU); ctx.fill();

        const rulerY = h * 0.79, L0 = w * 0.16;
        ctx.strokeStyle = `rgba(${acc},0.25)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(restX - L0 / 2, rulerY); ctx.lineTo(restX + L0 / 2, rulerY); ctx.stroke();
        ctx.strokeStyle = `rgba(${acc},0.85)`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cxm - L0 / (2 * g), rulerY); ctx.lineTo(cxm + L0 / (2 * g), rulerY); ctx.stroke();

        ctx.fillStyle = `rgba(${acc},0.9)`;
        ctx.fillText('β = ' + beta.toFixed(3) + '    γ = ' + g.toFixed(3), 12, h - 44);
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('rest   ' + ticksR + ' ticks', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText('moving ' + ticksM + ' ticks    ratio ' +
          (ticksR ? (ticksM / ticksR).toFixed(3) : '—') + '   1/γ = ' + (1 / g).toFixed(3), 12, h - 12);
      }
    };
  }
}
