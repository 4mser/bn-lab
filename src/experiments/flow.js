import { L } from '../core/shared.js';

export default { id: 'flow',
  name: L('Flow field', 'Campo de flujo'),
  note: L('Particles with no plan, following a field they cannot see.',
          'Partículas sin plan, siguiendo un campo que no pueden ver.'),
  params: [
    { key: 'scale', label: L('Field scale', 'Escala del campo'), min: 3, max: 30, step: 0.5, def: 11 },
    { key: 'speed', label: L('Step size', 'Tamaño del paso'),   min: 0.3, max: 4, step: 0.05, def: 1.25 },
    { key: 'pull',  label: L('Cursor pull', 'Atracción del cursor'), min: 0, max: 3, step: 0.1, def: 1.2 }
  ],
  make(w, h) {
    const N = 220, P = [];
    for (let i = 0; i < N; i++) P.push({ x: Math.random() * w, y: Math.random() * h, life: Math.random() * 200 });
    return {
      fade: 0.055,
      step(ctx, w, h, t, acc, Q, M) {
        const f = Q.scale / 1000;
        ctx.lineWidth = 1;
        for (const p of P) {
          const a = (Math.sin(p.x * f + t * 0.35) + Math.cos(p.y * f * 1.18 - t * 0.28)) * Math.PI;
          let vx = Math.cos(a) * Q.speed, vy = Math.sin(a) * Q.speed;
          if (M.in && Q.pull) {                       // the cursor bends the trajectories
            const dx = M.x - p.x, dy = M.y - p.y, d = Math.hypot(dx, dy) + 1;
            if (d < 220) { const g = Q.pull * (1 - d / 220); vx += (dx / d) * g; vy += (dy / d) * g; }
          }
          const nx = p.x + vx, ny = p.y + vy;
          ctx.strokeStyle = `rgba(${acc},0.30)`;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
          p.x = nx; p.y = ny; p.life--;
          if (p.life < 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
            p.x = Math.random() * w; p.y = Math.random() * h; p.life = 120 + Math.random() * 160;
          }
        }
      }
    };
  }
}
