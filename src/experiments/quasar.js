import { TAU, L, core } from '../core/shared.js';

export default { id: 'quasar',
  name: L('Quasar', 'Cuásar'),
  note: L('An accretion disk and two jets. One side is brighter, and that is relativity.',
          'Un disco de acreción y dos chorros. Un lado brilla más, y eso es relatividad.'),
  params: [
    { key: 'incl', label: L('Inclination', 'Inclinación'), min: 0.05, max: 1.5, step: 0.02, def: 0.42 },
    { key: 'jet',  label: L('Jet power', 'Potencia del chorro'), min: 0, max: 3, step: 0.05, def: 1.2 },
    { key: 'beam', label: L('Beaming β', 'Beaming β'), min: 0, max: 0.9, step: 0.02, def: 0.55 }
  ],
  make(w, h) {
    let disk = [], jet = [], phi = 0;
    const seed = (w, h) => {
      disk = []; jet = [];
      const R = Math.min(w, h);
      for (let i = 0; i < 900; i++) {
        const u = Math.pow(Math.random(), 0.6);
        disk.push({ r: R * (0.07 + u * 0.34), a: Math.random() * TAU });
      }
    };
    seed(w, h);
    return {
      resize(w, h) { seed(w, h); },
      reset() { seed(w, h); jet = []; },
      step(ctx, w, h, t, acc, P, M) {
        const incl = M.in ? 0.05 + (M.y / h) * 1.45 : P.incl;
        if (M.in) phi = (M.x / w) * TAU; else phi += 0.002;
        const cx = w / 2, cy = h / 2;
        const ky = Math.sin(incl), kz = Math.cos(incl);
        const rgb = acc.split(',').map(Number);

        // Jets: collimated perpendicular to the disk, above and below
        if (P.jet > 0 && jet.length < 260) {
          for (let k = 0; k < 2; k++)
            jet.push({ z: 0, dir: k ? 1 : -1, o: (Math.random() - 0.5) * 14, v: 2 + Math.random() * 3 });
        }
        jet = jet.filter(j => {
          j.z += j.dir * j.v * P.jet;
          const far = Math.abs(j.z) > Math.min(w, h) * 0.62;
          const y = cy - j.z * kz, x = cx + j.o;
          const fade = 1 - Math.abs(j.z) / (Math.min(w, h) * 0.62);
          ctx.fillStyle = `rgba(${acc},${(fade * 0.5).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(x, y, 1.5, 0, TAU); ctx.fill();
          return !far;
        });

        // Disk: Keplerian rotation, faster toward the center
        for (const d of disk) {
          d.a += (2.2 / Math.pow(d.r, 1.5)) * 60;
          const ax = d.a + phi;
          const x = d.r * Math.cos(ax), y = d.r * Math.sin(ax);
          const sx = cx + x, sy = cy + y * ky;
          // Doppler beaming: δ = 1/(γ(1 − β·cosθ)). The approaching side
          // is much brighter. This is the same effect that makes only one jet
          // visible in most real quasars.
          const beta = P.beam * Math.min(1, (Math.min(w, h) * 0.12) / d.r);
          const g = 1 / Math.sqrt(1 - beta * beta);
          const cosTh = -Math.sin(ax) * Math.cos(incl);
          const delta = 1 / (g * (1 - beta * cosTh));
          const b = Math.min(1, Math.pow(delta, 3) * 0.18);
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${b.toFixed(3)})`;
          ctx.fillRect(sx, sy, 1.6, 1.6);
        }

        // The central engine
        const R0 = Math.min(w, h) * 0.05;
        const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, R0);
        g2.addColorStop(0, `rgba(${core()},0.9)`);
        g2.addColorStop(0.4, `rgba(${acc},0.7)`);
        g2.addColorStop(1, `rgba(${acc},0)`);
        ctx.fillStyle = g2;
        ctx.beginPath(); ctx.arc(cx, cy, R0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(cx, cy, R0 * 0.28, 0, TAU); ctx.fill();

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('δ = 1/(γ(1 − β·cosθ))     brightness ∝ δ³', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.9)`;
        ctx.fillText('inclination ' + (incl * 57.3).toFixed(0) + '°     β = ' + P.beam.toFixed(2), 12, h - 12);
      }
    };
  }
}
