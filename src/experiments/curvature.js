import { TAU, L, core } from '../core/shared.js';

export default { id: 'curvature',
  name: L('Gravity is geometry', 'La gravedad es geometría'),
  note: L('A lattice of space with a mass in it. Move the mass and watch the grid answer.',
          'Una retícula de espacio con una masa dentro. Mueve la masa y mira responder a la rejilla.'),
  params: [
    { key: 'mass', label: L('Mass', 'Masa'), min: 0, max: 3, step: 0.05, def: 1.2 },
    { key: 'div',  label: L('Lattice divisions', 'Divisiones de la retícula'), min: 3, max: 8, step: 1, def: 6 },
    { key: 'tilt', label: L('View tilt', 'Inclinación de la vista'), min: 0.05, max: 1.1, step: 0.02, def: 0.42 }
  ],
  make() {
    let yaw = 0.6;
    return {
      reset() { yaw = 0.6; },
      step(ctx, w, h, t, acc, P, M) {
        const N = P.div | 0, SUB = 8;          // SUB: points per segment, so the curve is visible
        const tilt = P.tilt;
        yaw += 0.0022;
        // The mass moves with the cursor inside the lattice
        const mx = M.in ? (M.x / w - 0.5) * 2.1 : Math.cos(t * 0.35) * 0.5;
        const my = M.in ? (M.y / h - 0.5) * -2.1 : Math.sin(t * 0.5) * 0.4;
        const Mp = [mx, my, 0];
        const rgb = acc.split(',').map(Number);

        // Displacement of each vertex toward the mass. The 1/r² falloff with
        // a soft core keeps the grid from folding back on itself near the
        // center, which is where the approximation stops holding anyway.
        const K = P.mass * 0.30;
        const warp = p => {
          const dx = p[0] - Mp[0], dy = p[1] - Mp[1], dz = p[2] - Mp[2];
          const r2 = dx * dx + dy * dy + dz * dz;
          const r = Math.sqrt(r2) + 1e-4;
          const s = Math.min(r * 0.75, K / (r2 + 0.05));
          return [p[0] - (dx / r) * s, p[1] - (dy / r) * s, p[2] - (dz / r) * s, r];
        };

        // Projection: yaw rotation, tilt, and soft perspective
        const cy = Math.cos(yaw), sy = Math.sin(yaw);
        const ct = Math.cos(tilt), st = Math.sin(tilt);
        const S = Math.min(w, h) * 0.30, ox = w / 2, oy = h / 2;
        const proj = q => {
          const x = q[0] * cy - q[2] * sy;
          const z = q[0] * sy + q[2] * cy;
          const y = q[1] * ct - z * st;
          const zz = q[1] * st + z * ct;
          const per = 1 / (1 + zz * 0.22);         // perspective
          return [ox + x * S * per, oy - y * S * per, zz, per];
        };

        // All lattice lines, across the three axes
        const lines = [];
        const at = (u, i, j) => {
          const a = -1 + (2 * i) / N, b = -1 + (2 * j) / N;
          return u === 0 ? [null, a, b] : u === 1 ? [a, null, b] : [a, b, null];
        };
        for (let u = 0; u < 3; u++) {
          for (let i = 0; i <= N; i++) {
            for (let j = 0; j <= N; j++) {
              const tpl = at(u, i, j), pts = [];
              let depth = 0, near = 0;
              for (let k = 0; k <= N * SUB; k++) {
                const v = -1 + (2 * k) / (N * SUB);
                const p = tpl.slice(); p[u] = v;
                const q = warp(p);
                const pr = proj(q);
                pts.push(pr);
                depth += pr[2];
                near = Math.max(near, 1 / (1 + q[3] * q[3] * 2.2));
              }
              lines.push({ pts, depth: depth / pts.length, near });
            }
          }
        }
        // Back to front, so depth reads correctly
        lines.sort((a, b) => b.depth - a.depth);

        for (const L of lines) {
          // Near the mass the line brightens toward white: the same trick
          // as the blue→green gradient in classic textbook illustrations
          const n = Math.min(1, L.near * 1.5);
          const r = rgb[0] + (245 - rgb[0]) * n;
          const g = rgb[1] + (250 - rgb[1]) * n;
          const b = rgb[2] + (255 - rgb[2]) * n;
          const fog = Math.max(0.10, Math.min(0.75, 0.5 - L.depth * 0.16));
          ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${(fog * (0.45 + n * 0.55)).toFixed(3)})`;
          ctx.lineWidth = 0.8 + n * 1.2;
          ctx.beginPath();
          L.pts.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
          ctx.stroke();
        }

        // The mass
        const pm = proj([Mp[0], Mp[1], Mp[2], 0]);
        const R = (7 + P.mass * 5) * pm[3];
        const gg = ctx.createRadialGradient(pm[0], pm[1], 0, pm[0], pm[1], R * 3);
        gg.addColorStop(0, `rgba(${core()},0.95)`);
        gg.addColorStop(0.35, `rgba(${acc},0.5)`);
        gg.addColorStop(1, `rgba(${acc},0)`);
        ctx.fillStyle = gg;
        ctx.beginPath(); ctx.arc(pm[0], pm[1], R * 3, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(pm[0], pm[1], R * 0.5, 0, TAU); ctx.fill();

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('no force is drawn here — only distances', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText('mass ' + P.mass.toFixed(2) + '     lattice ' + N + '³', 12, h - 12);
      }
    };
  }
}
