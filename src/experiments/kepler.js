import { TAU, L } from '../core/shared.js';

/* Advances a body around a central mass at (cx, cy) by one frame (one time
   unit), in place on b = { x, y, vx, vy }. Exported so validation/ can measure
   the exact scheme the figure runs.

   Leapfrog (kick-drift-kick), 64 fixed sub-steps per frame. Leapfrog is
   symplectic and time-reversible, so energy oscillates without drifting, and
   every sub-step conserves angular momentum exactly — the kicks are parallel
   to r and the drift is parallel to v — which is what makes the swept sectors
   exactly equal. The central mass has a Plummer softening ε = 0.5 px, and the
   optional pointer adds a second, more heavily softened mass.

   It used to be symplectic Euler, two sub-steps per frame, with the distance
   softened by +6 px. The validation suite measured that softening precessing
   the default orbit by 60° per revolution: rosettes instead of Kepler's closed
   ellipses. This scheme brings it below half a degree. A variant with
   distance-adaptive sub-steps was tried and rejected: changing the step breaks
   time symmetry, and energy drifted 5 % over 400 orbits. */
const EPS2 = 0.25, SUBSTEPS = 64;
function keplerAccel(b, cx, cy, GM, pointer, perturb) {
  const dx = cx - b.x, dy = cy - b.y, q = dx * dx + dy * dy + EPS2;
  const k = GM / (q * Math.sqrt(q));
  let ax = dx * k, ay = dy * k;
  if (pointer && pointer.in && perturb) {
    const ux = pointer.x - b.x, uy = pointer.y - b.y, ur = Math.hypot(ux, uy) + 14;
    ax += (ux / ur) * (perturb / (ur * ur));
    ay += (uy / ur) * (perturb / (ur * ur));
  }
  return [ax, ay];
}
export function keplerFrame(b, cx, cy, GM, pointer, perturb) {
  const h = 1 / SUBSTEPS;
  let a = keplerAccel(b, cx, cy, GM, pointer, perturb);
  for (let i = 0; i < SUBSTEPS; i++) {
    b.vx += a[0] * h / 2; b.vy += a[1] * h / 2;
    b.x += b.vx * h; b.y += b.vy * h;
    a = keplerAccel(b, cx, cy, GM, pointer, perturb);
    b.vx += a[0] * h / 2; b.vy += a[1] * h / 2;
  }
  return b;
}

export default { id: 'kepler',
  name: L('Kepler orbits', 'Órbitas de Kepler'),
  note: L('Equal areas in equal times. The law Newton later explained.',
          'Áreas iguales en tiempos iguales. La ley que Newton explicó después.'),
  params: [
    { key: 'ecc',     label: L('Eccentricity', 'Excentricidad'), min: 0, max: 0.9, step: 0.01, def: 0.55 },
    { key: 'planets', label: L('Planets', 'Planetas'),           min: 1, max: 6, step: 1, def: 3 },
    { key: 'perturb', label: L('Cursor mass', 'Masa del cursor'), min: 0, max: 4000, step: 100, def: 900 }
  ],
  make(w, h) {
    let ps = [];
    const seed = (w, h, ecc) => {
      ps = [];
      const cx = w / 2, cy = h / 2;
      for (let i = 0; i < 6; i++) {
        const r = Math.min(w, h) * (0.12 + i * 0.055);
        const vc = Math.sqrt(2600 / r) * Math.sqrt(1 - ecc);
        ps.push({ x: cx + r, y: cy, vx: 0, vy: vc, p: [], area: [] });
      }
    };
    let lw = w, lh = h;
    seed(w, h, 0.55);
    return {
      resize(w, h) { lw = w; lh = h; seed(w, h, 0.55); },
      reset() { seed(lw, lh, 0.55); },
      step(ctx, w, h, t, acc, P, M) {
        const cx = w / 2, cy = h / 2, GM = 2600;
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, TAU); ctx.fill();
        if (M.in && P.perturb) {
          ctx.strokeStyle = `rgba(${acc},0.4)`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(M.x, M.y, 4 + P.perturb / 900, 0, TAU); ctx.stroke();
        }
        const n = P.planets | 0;
        for (let i = 0; i < n && i < ps.length; i++) {
          const b = ps[i];
          keplerFrame(b, cx, cy, GM, M, P.perturb);   // the cursor acts as another mass
          b.p.push([b.x, b.y]); if (b.p.length > 700) b.p.shift();
          ctx.strokeStyle = `rgba(${acc},0.35)`; ctx.lineWidth = 1;
          ctx.beginPath();
          b.p.forEach((q, k) => k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]));
          ctx.stroke();
          // Second law: sectors swept out in equal time intervals
          if (i === 0 && b.p.length > 12) {
            ctx.fillStyle = `rgba(${acc},0.14)`;
            for (let k = b.p.length - 1; k > b.p.length - 60 && k > 11; k -= 12) {
              ctx.beginPath(); ctx.moveTo(cx, cy);
              ctx.lineTo(b.p[k][0], b.p[k][1]); ctx.lineTo(b.p[k - 11][0], b.p[k - 11][1]);
              ctx.closePath(); ctx.fill();
            }
          }
          ctx.fillStyle = `rgba(${acc},0.95)`;
          ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, TAU); ctx.fill();
        }
      }
    };
  }
}
