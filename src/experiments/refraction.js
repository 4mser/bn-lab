import { L } from '../core/shared.js';

export default { id: 'refraction',
  name: L('Snell and the trapped ray', 'Snell y el rayo atrapado'),
  note: L('Tilt the beam past the critical angle and the interface turns into a mirror.',
          'Inclina el haz más allá del ángulo crítico y la interfaz se vuelve espejo.'),
  params: [
    { key: 'n1',  label: L('n above', 'n arriba'), min: 1, max: 2.6, step: 0.01, def: 1.5 },
    { key: 'n2',  label: L('n below', 'n abajo'), min: 1, max: 2.6, step: 0.01, def: 1 },
    { key: 'ang', label: L('Angle of incidence', 'Ángulo de incidencia'), min: 1, max: 89, step: 0.5, def: 35 }
  ],
  make() {
    return {
      step(ctx, w, h, t, acc, P, M) {
        const iy = h * 0.52, ox = w * 0.5;
        const n1 = P.n1, n2 = P.n2;
        // The cursor takes over from the slider when it's hovering above the interface
        let th1 = (P.ang * Math.PI) / 180;
        if (M.in && M.y < iy) th1 = Math.max(0.02, Math.min(1.55, Math.atan2(Math.abs(M.x - ox), Math.max(6, iy - M.y))));

        const s2 = (n1 / n2) * Math.sin(th1);
        const tir = s2 > 1;
        const th2 = tir ? 0 : Math.asin(s2);
        const critical = n1 > n2 ? Math.asin(n2 / n1) : null;

        // Fresnel equations, s and p polarization
        const c1 = Math.cos(th1), c2 = Math.cos(th2);
        const rs = tir ? 1 : ((n1 * c1 - n2 * c2) / (n1 * c1 + n2 * c2)) ** 2;
        const rp = tir ? 1 : ((n1 * c2 - n2 * c1) / (n1 * c2 + n2 * c1)) ** 2;
        const R = (rs + rp) / 2, T = 1 - R;

        // Media
        ctx.fillStyle = `rgba(${acc},0.07)`; ctx.fillRect(0, 0, w, iy);
        ctx.fillStyle = `rgba(${acc},0.03)`; ctx.fillRect(0, iy, w, h - iy);
        ctx.strokeStyle = `rgba(${acc},0.45)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, iy); ctx.lineTo(w, iy); ctx.stroke();

        // Normal line
        ctx.setLineDash([3, 5]); ctx.strokeStyle = `rgba(${acc},0.28)`;
        ctx.beginPath(); ctx.moveTo(ox, 12); ctx.lineTo(ox, h - 44); ctx.stroke();
        ctx.setLineDash([]);

        const Lr = Math.min(w, h) * 0.46;
        const beam = (x1, y1, x2, y2, a, wd) => {
          ctx.strokeStyle = `rgba(${acc},${a.toFixed(3)})`;
          ctx.lineWidth = wd;
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
          // Wavefronts: spaced closer together where the refractive index is higher
          const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
          const ux = dx / len, uy = dy / len, sp = 14;
          const ph = ((t * 60) % sp);
          ctx.lineWidth = 1;
          for (let d = ph; d < len; d += sp) {
            const px = x1 + ux * d, py = y1 + uy * d;
            ctx.strokeStyle = `rgba(${acc},${(a * 0.5).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(px - uy * 4, py + ux * 4);
            ctx.lineTo(px + uy * 4, py - ux * 4);
            ctx.stroke();
          }
        };

        // Incident ray (arrives from the upper left)
        beam(ox - Math.sin(th1) * Lr, iy - Math.cos(th1) * Lr, ox, iy, 0.95, 2);
        // Reflected ray
        beam(ox, iy, ox + Math.sin(th1) * Lr, iy - Math.cos(th1) * Lr, 0.25 + R * 0.7, 1 + R * 2.5);
        // Transmitted ray
        if (!tir) beam(ox, iy, ox + Math.sin(th2) * Lr, iy + Math.cos(th2) * Lr, 0.25 + T * 0.7, 1 + T * 2.5);

        // Critical angle cone
        if (critical !== null) {
          ctx.setLineDash([2, 4]);
          ctx.strokeStyle = `rgba(${acc},0.3)`;
          ctx.beginPath();
          ctx.moveTo(ox - Math.sin(critical) * Lr, iy - Math.cos(critical) * Lr);
          ctx.lineTo(ox, iy);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = '10px monospace';
          ctx.fillStyle = `rgba(${acc},0.5)`;
          ctx.fillText('θc = ' + ((critical * 180) / Math.PI).toFixed(1) + '°',
            ox - Math.sin(critical) * Lr - 4, iy - Math.cos(critical) * Lr - 6);
        }

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.6)`;
        ctx.fillText('n₁ = ' + n1.toFixed(2), 12, 20);
        ctx.fillText('n₂ = ' + n2.toFixed(2), 12, iy + 20);
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('n₁ sin θ₁ = n₂ sin θ₂        reflectance from Fresnel', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText(tir
          ? 'θ₁ = ' + ((th1 * 180) / Math.PI).toFixed(1) + '°  ·  total internal reflection  ·  R = 100%'
          : 'θ₁ = ' + ((th1 * 180) / Math.PI).toFixed(1) + '°   θ₂ = ' + ((th2 * 180) / Math.PI).toFixed(1) +
            '°   R = ' + (R * 100).toFixed(1) + '%   T = ' + (T * 100).toFixed(1) + '%', 12, h - 12);
      }
    };
  }
}
