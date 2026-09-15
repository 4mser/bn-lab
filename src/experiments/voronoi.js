import { TAU, L, ink } from '../core/shared.js';

export default { id: 'voronoi',
  name: L('Voronoi', 'Voronoi'),
  note: L('Every point belongs to whoever is nearest. Change what "near" means and the world changes shape.',
          'Cada punto pertenece a quien tenga más cerca. Cambia qué significa "cerca" y el mundo cambia de forma.'),
  params: [
    { key: 'sites',  label: L('Sites', 'Sitios'), min: 3, max: 40, step: 1, def: 14 },
    { key: 'speed',  label: L('Drift', 'Deriva'), min: 0, max: 3, step: 0.1, def: 0.8 },
    { key: 'metric', label: L('Distance', 'Distancia'), min: 0, max: 2, step: 1, def: 0 }
  ],
  make(w, h) {
    let S = [], K = 0;
    const seed = (n, w, h) => {
      S = []; K = n;
      for (let i = 0; i < n; i++)
        S.push({ x: Math.random() * w, y: Math.random() * h,
                 vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40 });
    };
    seed(14, w, h);
    return {
      resize(w, h) { seed(K, w, h); },
      reset() { seed(K, w, h); },
      step(ctx, w, h, t, acc, P, M) {
        if ((P.sites | 0) !== K) seed(P.sites | 0, w, h);
        const met = P.metric | 0, dt = 1 / 60;
        S.forEach(s => {
          s.x += s.vx * P.speed * dt; s.y += s.vy * P.speed * dt;
          if (s.x < 0 || s.x > w) s.vx *= -1;
          if (s.y < 0 || s.y > h) s.vy *= -1;
          s.x = Math.max(0, Math.min(w, s.x)); s.y = Math.max(0, Math.min(h, s.y));
        });
        // The cursor is just another site: the tessellation reacts live
        const pts = M.in ? S.concat([{ x: M.x, y: M.y, cur: 1 }]) : S;

        const dist = (dx, dy) =>
          met === 0 ? dx * dx + dy * dy
        : met === 1 ? Math.abs(dx) + Math.abs(dy)
        :             Math.max(Math.abs(dx), Math.abs(dy));

        const RES = 150, RH = Math.max(1, Math.round((RES * h) / w));
        const own = new Int16Array(RES * RH);
        for (let j = 0; j < RH; j++) {
          const y = ((j + 0.5) / RH) * h;
          for (let i = 0; i < RES; i++) {
            const x = ((i + 0.5) / RES) * w;
            let best = 1e18, bi = 0;
            for (let s = 0; s < pts.length; s++) {
              const d = dist(x - pts[s].x, y - pts[s].y);
              if (d < best) { best = d; bi = s; }
            }
            own[j * RES + i] = bi;
          }
        }

        const img = ctx.createImageData(RES, RH), d = img.data;
        const rgb = acc.split(',').map(Number);
        for (let j = 0; j < RH; j++) for (let i = 0; i < RES; i++) {
          const q = j * RES + i, o = q * 4, id = own[q];
          // Edge = where ownership changes relative to the neighbor
          const edge = (i + 1 < RES && own[q + 1] !== id) || (j + 1 < RH && own[q + RES] !== id);
          const a = edge ? 0.9 : 0.05 + ((id * 37) % 100) / 100 * 0.22;
          d[o] = rgb[0] * a; d[o+1] = rgb[1] * a; d[o+2] = rgb[2] * a; d[o+3] = 255;
        }
        const off = document.createElement('canvas');
        off.width = RES; off.height = RH;
        off.getContext('2d').putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, 0, 0, w, h);

        pts.forEach(s => {
          ctx.fillStyle = s.cur ? `rgba(${ink()},1)` : `rgba(${acc},0.95)`;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.cur ? 4 : 2.4, 0, TAU); ctx.fill();
        });

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText(['Euclidean — straight line, the usual one',
                      'Manhattan — |dx| + |dy|, city blocks',
                      'Chebyshev — max(|dx|,|dy|), king moves'][met], 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText(pts.length + ' sites' + (M.in ? '   ·  one of them is your cursor' : ''), 12, h - 12);
      }
    };
  }
}
