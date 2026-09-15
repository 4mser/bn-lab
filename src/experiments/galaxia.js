import { L } from '../core/shared.js';

export default { id: 'galaxia',
  name: L('Spiral galaxy', 'Galaxia espiral'),
  note: L('Two thousand stars, one law of rotation. The arms wind themselves up.',
          'Dos mil estrellas, una ley de rotación. Los brazos se enrollan solos.'),
  params: [
    { key: 'brazos', label: L('Arms', 'Brazos'),           min: 1, max: 6, step: 1,    def: 3 },
    { key: 'giro',   label: L('Pitch g', 'Paso g'),        min: 1, max: 9, step: 0.1,  def: 4.6 },
    { key: 'vel',    label: L('Rotation ω', 'Rotación ω'), min: 0, max: 3, step: 0.05, def: 1 }
  ],
  make() {
    // Each star stores radius, arm, offset and twinkle phase. The
    // angle is recalculated every frame from the sliders, so changing
    // the number of arms reshapes the galaxy without reseeding the field.
    let stars = [];
    const sow = () => {
      stars = [];
      for (let i = 0; i < 2000; i++) {
        const u = Math.pow(Math.random(), 0.72);            // denser toward the core
        stars.push({
          u,
          arm: (Math.random() * 6) | 0,
          jit: (Math.random() - 0.5) * (0.14 + u * 0.6),    // arms fray outward
          sz: 0.5 + Math.random() * 1.5,
          tw: Math.random() * Math.PI * 2
        });
      }
    };
    sow();
    return {
      reset() { sow(); },
      step(ctx, w, h, t, acc, P, M) {
        const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.46;
        // The cursor tilts the disk: face-on at the top, edge-on at the bottom
        const inc = M.in ? 0.1 + (M.y / h) * 1.25 : 0.44;
        const ci = Math.cos(inc);
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
        g.addColorStop(0, `rgba(${acc},0.5)`);
        g.addColorStop(0.3, `rgba(${acc},0.1)`);
        g.addColorStop(1, `rgba(${acc},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * 0.5, R * 0.5 * ci, 0, 0, Math.PI * 2);
        ctx.fill();
        for (const s of stars) {
          const r = 0.05 + s.u * 0.95;
          // Keplerian differential rotation: ω ∝ 1/√r
          const om = P.vel / Math.sqrt(r);
          // Logarithmic spiral plus time drift: winding up in real time
          const th = (s.arm % P.brazos) * (Math.PI * 2 / P.brazos)
                   + P.giro * Math.log(r + 0.12) + s.jit + t * 0.05 * om;
          const x = cx + Math.cos(th) * r * R;
          const y = cy + Math.sin(th) * r * R * ci;
          const b = (0.3 + 0.7 * (1 - s.u)) * (0.74 + 0.26 * Math.sin(t * 2.2 + s.tw));
          ctx.fillStyle = `rgba(${acc},${(b * 0.3).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(x, y, s.sz * 2.6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(${acc},${b.toFixed(3)})`;
          ctx.beginPath(); ctx.arc(x, y, s.sz * 0.75, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      }
    };
  }
}
