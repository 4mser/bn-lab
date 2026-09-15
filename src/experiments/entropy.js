import { TAU, L } from '../core/shared.js';

export default { id: 'entropy',
  name: L('Entropy', 'Entropía'),
  note: L('Gas released in a corner. Reverse every velocity and watch it go home.',
          'Un gas soltado en una esquina. Invierte todas las velocidades y míralo volver.'),
  params: [
    { key: 'n',    label: L('Particles', 'Partículas'), min: 4, max: 600, step: 1, def: 240 },
    { key: 'cells', label: L('Coarse-graining', 'Grano de la descripción'), min: 2, max: 16, step: 1, def: 8 },
    { key: 'rev',  label: L('Reverse time', 'Invertir el tiempo'), min: 0, max: 1, step: 1, def: 0 }
  ],
  make(w, h) {
    // Particles with no collisions among themselves: this is a free
    // expansion of an ideal gas. Without collisions the dynamics are exactly
    // reversible, which is exactly what Loschmidt's argument needs.
    let P = [], hist = [], lastRev = 0, lastN = 0, boxH = 0;
    const seed = (n, w, h) => {
      P = [];
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU, sp = 0.8 + Math.random() * 1.6;
        P.push({ x: w * 0.06 + Math.random() * w * 0.16,
                 y: h * 0.10 + Math.random() * h * 0.16,
                 vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
      }
      hist = [];
    };
    return {
      reset() { lastN = 0; },
      step(ctx, w, h, t, acc, P0, M) {
        boxH = h * 0.66;
        const n = P0.n | 0, C = P0.cells | 0;
        if (n !== lastN) { seed(n, w, boxH); lastN = n; }
        // Toggling the control reverses all velocities at once
        if (P0.rev !== lastRev) { lastRev = P0.rev; for (const p of P) { p.vx = -p.vx; p.vy = -p.vy; } }

        for (const p of P) {
          // The cursor pushes: lowering entropy locally takes work
          if (M.in && M.y < boxH) {
            const dx = p.x - M.x, dy = p.y - M.y, d = Math.hypot(dx, dy) + 1;
            if (d < 90) { const g = (1 - d / 90) * 0.5; p.vx += (dx / d) * g; p.vy += (dy / d) * g; }
          }
          p.x += p.vx; p.y += p.vy;
          if (p.x < 2) { p.x = 2; p.vx = -p.vx; }
          if (p.x > w - 2) { p.x = w - 2; p.vx = -p.vx; }
          if (p.y < 2) { p.y = 2; p.vy = -p.vy; }
          if (p.y > boxH - 2) { p.y = boxH - 2; p.vy = -p.vy; }
        }

        // Coarse-grained entropy: count occupancy per cell.
        // S = −Σ pᵢ·ln pᵢ, normalized by ln(C²) so the maximum is 1.
        const cnt = new Float64Array(C * C);
        for (const p of P) {
          const cx = Math.min(C - 1, (p.x / w * C) | 0);
          const cy = Math.min(C - 1, (p.y / boxH * C) | 0);
          cnt[cy * C + cx]++;
        }
        let S = 0;
        for (let i = 0; i < cnt.length; i++) {
          if (!cnt[i]) continue;
          const q = cnt[i] / P.length;
          S -= q * Math.log(q);
        }
        S /= Math.log(C * C);
        hist.push(S);
        if (hist.length > w * 0.86) hist.shift();

        // Cells: the shading IS the macroscopic description
        const cw = w / C, ch = boxH / C;
        for (let i = 0; i < C; i++) {
          for (let jj = 0; jj < C; jj++) {
            const q = cnt[jj * C + i] / Math.max(1, P.length);
            if (q <= 0) continue;
            ctx.fillStyle = `rgba(${acc},${Math.min(0.30, q * 3.2).toFixed(3)})`;
            ctx.fillRect(i * cw, jj * ch, cw, ch);
          }
        }
        ctx.strokeStyle = `rgba(${acc},0.10)`; ctx.lineWidth = 1;
        for (let i = 1; i < C; i++) {
          ctx.beginPath(); ctx.moveTo(i * cw, 0); ctx.lineTo(i * cw, boxH); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, i * ch); ctx.lineTo(w, i * ch); ctx.stroke();
        }
        ctx.strokeStyle = `rgba(${acc},0.5)`; ctx.lineWidth = 1.2;
        ctx.strokeRect(1, 1, w - 2, boxH - 2);

        ctx.fillStyle = `rgba(${acc},0.95)`;
        for (const p of P) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, TAU); ctx.fill(); }

        // S over time curve
        const gy = h * 0.90, gh = h * 0.17, gx = w * 0.07;
        ctx.strokeStyle = `rgba(${acc},0.2)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(gx, gy - gh); ctx.lineTo(gx + w * 0.86, gy - gh); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + w * 0.86, gy); ctx.stroke();
        ctx.strokeStyle = `rgba(${acc},0.9)`; ctx.lineWidth = 1.5;
        ctx.beginPath();
        hist.forEach((v, i) => { const X = gx + i, Y = gy - v * gh;
          i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
        ctx.stroke();
        ctx.font = '10px monospace'; ctx.fillStyle = `rgba(${acc},0.45)`;
        ctx.fillText('S max', gx - 4, gy - gh - 4);

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('S = −Σ pᵢ ln pᵢ      the equations do not know which way is forward', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText('S / S_max = ' + S.toFixed(3) + '     N = ' + P.length +
          '     cells ' + C + '×' + C, 12, h - 12);
      }
    };
  }
}
