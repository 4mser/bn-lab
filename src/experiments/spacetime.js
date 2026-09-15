import { TAU, L } from '../core/shared.js';

export default { id: 'spacetime',
  name: L('Curved spacetime', 'Espaciotiempo curvo'),
  note: L('The embedding diagram of a black hole. Orbits are straight lines on a bent surface.',
          'El diagrama de embebimiento de un agujero negro. Las órbitas son rectas sobre una superficie doblada.'),
  params: [
    { key: 'rs',    label: L('Schwarzschild radius', 'Radio de Schwarzschild'), min: 4, max: 40, step: 1, def: 16, unit: 'px' },
    { key: 'tilt',  label: L('View angle', 'Ángulo de vista'), min: 0.1, max: 0.9, step: 0.02, def: 0.42 },
    { key: 'orbit', label: L('Orbiting particles', 'Partículas en órbita'), min: 0, max: 6, step: 1, def: 3 }
  ],
  make(w, h) {
    let bodies = [], lw = w, lh = h;
    const seed = (w, h) => {
      bodies = [];
      for (let i = 0; i < 6; i++) {
        const r = Math.min(w, h) * (0.14 + i * 0.05), a = i * 1.7;
        const v = Math.sqrt(2200 / r);
        bodies.push({ x: r * Math.cos(a), y: r * Math.sin(a),
                      vx: -Math.sin(a) * v, vy: Math.cos(a) * v, p: [] });
      }
    };
    seed(w, h);
    return {
      resize(w, h) { lw = w; lh = h; seed(w, h); },
      reset() { seed(lw, lh); },
      step(ctx, w, h, t, acc, P, M) {
        const cx = M.in ? M.x : w / 2, cy = (M.in ? M.y : h / 2) - h * 0.06;
        const rs = P.rs, tilt = P.tilt, DEPTH = 1.5;

        // Flamm's paraboloid: z(r) = 2·√(rs·(r − rs)) for r ≥ rs.
        // This is the exact Schwarzschild embedding surface, not a made-up
        // well: the throat sits at rs and flattens out toward infinity.
        const zOf = r => 2 * Math.sqrt(rs * Math.max(0, r - rs));
        const proj = (dx, dy) => {
          const r = Math.hypot(dx, dy);
          const z = zOf(Math.max(r, rs));
          return [cx + dx, cy + dy * tilt + (zOf(600) - z) * DEPTH * tilt];
        };

        // Polar mesh: rings and radii, the standard way to draw the diagram
        ctx.lineWidth = 1;
        const RINGS = 16, SPOKES = 32, RMAX = Math.max(w, h) * 0.62;
        for (let i = 1; i <= RINGS; i++) {
          const r = rs + Math.pow(i / RINGS, 1.7) * RMAX;
          ctx.strokeStyle = `rgba(${acc},${(0.30 - i * 0.012).toFixed(3)})`;
          ctx.beginPath();
          for (let k = 0; k <= SPOKES; k++) {
            const a = (k / SPOKES) * TAU;
            const p = proj(r * Math.cos(a), r * Math.sin(a));
            k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
          }
          ctx.stroke();
        }
        ctx.strokeStyle = `rgba(${acc},0.14)`;
        for (let k = 0; k < SPOKES; k++) {
          const a = (k / SPOKES) * TAU;
          ctx.beginPath();
          for (let i = 0; i <= RINGS; i++) {
            const r = rs + Math.pow(i / RINGS, 1.7) * RMAX;
            const p = proj(r * Math.cos(a), r * Math.sin(a));
            i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
          }
          ctx.stroke();
        }

        // The horizon: the throat of the funnel
        ctx.strokeStyle = `rgba(${acc},0.9)`; ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let k = 0; k <= SPOKES; k++) {
          const a = (k / SPOKES) * TAU;
          const p = proj(rs * Math.cos(a), rs * Math.sin(a));
          k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
        }
        ctx.stroke();

        // Particles: integrated in the plane and projected onto the surface
        const n = P.orbit | 0;
        for (let i = 0; i < n && i < bodies.length; i++) {
          const b = bodies[i];
          for (let s = 0; s < 2; s++) {
            const r = Math.hypot(b.x, b.y) + 4;
            const a = 2200 / (r * r) * 0.5;
            b.vx -= (b.x / r) * a; b.vy -= (b.y / r) * a;
            b.x += b.vx * 0.5; b.y += b.vy * 0.5;
          }
          b.p.push([b.x, b.y]); if (b.p.length > 520) b.p.shift();
          ctx.strokeStyle = `rgba(${acc},0.6)`; ctx.lineWidth = 1.1;
          ctx.beginPath();
          b.p.forEach((q, k) => { const pr = proj(q[0], q[1]);
            k ? ctx.lineTo(pr[0], pr[1]) : ctx.moveTo(pr[0], pr[1]); });
          ctx.stroke();
          const pb = proj(b.x, b.y);
          ctx.fillStyle = `rgba(${acc},0.95)`;
          ctx.beginPath(); ctx.arc(pb[0], pb[1], 3.2, 0, TAU); ctx.fill();
        }

        ctx.fillStyle = `rgba(${acc},0.75)`; ctx.font = '11px monospace';
        ctx.fillText('r_s = ' + rs + 'px', 12, h - 12);
      }
    };
  }
}
