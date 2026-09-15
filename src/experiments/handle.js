import { TAU, L } from '../core/shared.js';

export default { id: 'handle',
  name: L('Two mouths, one plane', 'Dos bocas, un plano'),
  note: L('Both ends in the same space. Go in one, come out the other.',
          'Los dos extremos en el mismo espacio. Entras por uno, sales por el otro.'),
  params: [
    { key: 'R',    label: L('Mouth radius', 'Radio de boca'), min: 14, max: 60, step: 1, def: 30, unit: 'px' },
    { key: 'pull', label: L('Gravity', 'Gravedad'), min: 0, max: 4, step: 0.1, def: 1.6 },
    { key: 'rays', label: L('Rays', 'Rayos'), min: 1, max: 40, step: 1, def: 18 }
  ],
  make(w, h) {
    // A handle: two disks are removed from the plane and their boundaries
    // are glued together. The two disks are THE SAME place, so crossing the
    // edge of one means exiting through the other. The topology changes;
    // the rest of the plane stays flat.
    let rays = [], A = [0, 0], B = [0, 0], flash = 0;
    const spawn = (w, h) => ({
      p: [Math.random() * w, -10],
      v: (() => { const a = Math.PI * (0.25 + Math.random() * 0.5); return [Math.cos(a) * 2.2, Math.sin(a) * 2.2]; })(),
      tr: [], hops: 0
    });
    return {
      reset() { rays = []; flash = 0; },
      step(ctx, w, h, t, acc, P, M) {
        const R = P.R;
        A = [w * 0.30, h * 0.58];
        B = M.in ? [M.x, M.y] : [w * 0.72, h * 0.40];
        const mouths = [A, B];

        // Grid deformation: the SAME field that bends the rays.
        // This isn't decoration — it's the deflection drawn onto the lines.
        const warp = (x, y) => {
          let ox = x, oy = y;
          for (const m of mouths) {
            const dx = x - m[0], dy = y - m[1], d = Math.hypot(dx, dy) + 1;
            const s = Math.min(R * 1.15, (R * R * P.pull * 0.6) / d);
            ox -= (dx / d) * s; oy -= (dy / d) * s;
          }
          return [ox, oy];
        };
        const STEP = 34;
        ctx.strokeStyle = `rgba(${acc},0.16)`; ctx.lineWidth = 1;
        for (let gx = -STEP; gx <= w + STEP; gx += STEP) {
          ctx.beginPath();
          for (let gy = -STEP; gy <= h + STEP; gy += STEP / 3) {
            const q = warp(gx, gy); gy === -STEP ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]);
          }
          ctx.stroke();
        }
        for (let gy = -STEP; gy <= h + STEP; gy += STEP) {
          ctx.beginPath();
          for (let gx = -STEP; gx <= w + STEP; gx += STEP / 3) {
            const q = warp(gx, gy); gx === -STEP ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]);
          }
          ctx.stroke();
        }

        // Rays: fall toward the mouths under gravity and cross over on touching the edge
        while (rays.length < (P.rays | 0)) rays.push(spawn(w, h));
        if (rays.length > (P.rays | 0)) rays.length = P.rays | 0;

        for (const r of rays) {
          for (let s = 0; s < 2; s++) {
            for (const m of mouths) {
              const dx = m[0] - r.p[0], dy = m[1] - r.p[1], d = Math.hypot(dx, dy) + 4;
              const a = (P.pull * R * R * 0.02) / (d * d);
              r.v[0] += (dx / d) * a; r.v[1] += (dy / d) * a;
            }
            r.p[0] += r.v[0] * 0.5; r.p[1] += r.v[1] * 0.5;

            // The crossing: entering one disk means exiting through the
            // other while keeping the same direction. The two edges are the
            // same circle, glued together.
            for (let k = 0; k < 2; k++) {
              const m = mouths[k], o = mouths[1 - k];
              if (Math.hypot(r.p[0] - m[0], r.p[1] - m[1]) < R) {
                const sp = Math.hypot(r.v[0], r.v[1]) || 1;
                const ux = r.v[0] / sp, uy = r.v[1] / sp;
                r.p[0] = o[0] + ux * (R + 1.5);
                r.p[1] = o[1] + uy * (R + 1.5);
                r.tr.push(null);                    // break the trail: it didn't cross the plane
                r.hops++; flash = 1;
                break;
              }
            }
          }
          r.tr.push([r.p[0], r.p[1]]);
          if (r.tr.length > 190) r.tr.shift();
          if (r.p[0] < -60 || r.p[0] > w + 60 || r.p[1] < -60 || r.p[1] > h + 60) {
            const n = spawn(w, h); r.p = n.p; r.v = n.v; r.tr = []; r.hops = 0;
          }
          // Trail, broken where the jump happened
          ctx.lineWidth = 1;
          for (let i = 1; i < r.tr.length; i++) {
            if (!r.tr[i] || !r.tr[i - 1]) continue;
            ctx.strokeStyle = `rgba(${acc},${((i / r.tr.length) * (r.hops ? 0.75 : 0.4)).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(r.tr[i - 1][0], r.tr[i - 1][1]);
            ctx.lineTo(r.tr[i][0], r.tr[i][1]);
            ctx.stroke();
          }
          ctx.fillStyle = `rgba(${acc},0.95)`;
          ctx.beginPath(); ctx.arc(r.p[0], r.p[1], 2, 0, TAU); ctx.fill();
        }

        // The mouths. The faint arc is a reminder that they are the same spot.
        flash *= 0.92;
        ctx.strokeStyle = `rgba(${acc},${(0.12 + flash * 0.3).toFixed(2)})`;
        ctx.setLineDash([4, 7]); ctx.lineWidth = 1;
        ctx.beginPath();
        const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
        ctx.moveTo(A[0], A[1]);
        ctx.quadraticCurveTo(mx, my - Math.hypot(B[0] - A[0], B[1] - A[1]) * 0.22, B[0], B[1]);
        ctx.stroke(); ctx.setLineDash([]);

        mouths.forEach((m, i) => {
          const g = ctx.createRadialGradient(m[0], m[1], R * 0.2, m[0], m[1], R);
          g.addColorStop(0, 'rgba(0,0,0,0.95)');
          g.addColorStop(1, `rgba(${acc},0.10)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(m[0], m[1], R, 0, TAU); ctx.fill();
          ctx.strokeStyle = `rgba(${acc},${(0.75 + flash * 0.25).toFixed(2)})`;
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.arc(m[0], m[1], R, 0, TAU); ctx.stroke();
          ctx.font = '11px monospace'; ctx.fillStyle = `rgba(${acc},0.8)`;
          ctx.fillText(i ? 'B' : 'A', m[0] - 3, m[1] - R - 8);
        });

        const sep = Math.hypot(B[0] - A[0], B[1] - A[1]);
        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('∂A ≡ ∂B      the two circles are the same circle', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText('separation ' + sep.toFixed(0) + 'px   through the handle 0px', 12, h - 12);
      }
    };
  }
}
