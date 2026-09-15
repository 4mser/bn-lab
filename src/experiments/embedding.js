import { TAU, L, ink } from '../core/shared.js';

export default { id: 'embedding',
  name: L('Embedding space', 'Espacio de embeddings'),
  note: L('High-dimensional structure squeezed into a plane, live.',
          'Estructura de muchas dimensiones exprimida a un plano, en vivo.'),
  params: [
    { key: 'dim',  label: L('True dimensions', 'Dimensiones reales'), min: 3, max: 24, step: 1, def: 10 },
    { key: 'clus', label: L('Clusters', 'Grupos'), min: 2, max: 8, step: 1, def: 5 },
    { key: 'rate', label: L('Relaxation rate', 'Tasa de relajación'), min: 0.01, max: 0.4, step: 0.01, def: 0.12 }
  ],
  make(w, h) {
    let hi = [], lo = [], lab = [], D = 0, C = 0, target = null;
    const build = (dim, clus, w, h) => {
      D = dim; C = clus; hi = []; lo = []; lab = [];
      const centres = Array.from({ length: clus }, () =>
        Array.from({ length: dim }, () => (Math.random() * 2 - 1) * 2.2));
      for (let c = 0; c < clus; c++) {
        for (let i = 0; i < 26; i++) {
          hi.push(centres[c].map(v => v + (Math.random() * 2 - 1) * 0.45));
          lab.push(c);
          lo.push([w / 2 + (Math.random() - 0.5) * 40, h / 2 + (Math.random() - 0.5) * 40]);
        }
      }
      // Matrix of true high-dimensional distances: this is the target
      const n = hi.length;
      target = new Float32Array(n * n);
      let mx = 0;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        let s = 0;
        for (let k = 0; k < dim; k++) { const d = hi[i][k] - hi[j][k]; s += d * d; }
        const v = Math.sqrt(s); target[i * n + j] = v; if (v > mx) mx = v;
      }
      const scale = (Math.min(w, h) * 0.40) / mx;
      for (let i = 0; i < n * n; i++) target[i] *= scale;
    };
    build(10, 5, w, h);
    return {
      resize(w, h) { build(D, C, w, h); },
      reset() { build(D, C, w, h); },
      step(ctx, w, h, t, acc, P, M) {
        if ((P.dim | 0) !== D || (P.clus | 0) !== C) build(P.dim | 0, P.clus | 0, w, h);
        const n = lo.length, rate = P.rate;
        // Multidimensional scaling by relaxation: pulls each pair closer or
        // pushes it apart until the on-plane distance matches the real one.
        for (let s = 0; s < 3; s++) {
          for (let i = 0; i < n; i++) {
            const j = (Math.random() * n) | 0;
            if (i === j) continue;
            const dx = lo[j][0] - lo[i][0], dy = lo[j][1] - lo[i][1];
            const d = Math.hypot(dx, dy) + 1e-6;
            const want = target[i * n + j];
            const push = ((d - want) / d) * rate * 0.5;
            lo[i][0] += dx * push; lo[i][1] += dy * push;
            lo[j][0] -= dx * push; lo[j][1] -= dy * push;
          }
        }
        // Residual error: how much doesn't fit into two dimensions
        let err = 0, cnt = 0;
        for (let q = 0; q < 400; q++) {
          const i = (Math.random() * n) | 0, j = (Math.random() * n) | 0;
          if (i === j) continue;
          const d = Math.hypot(lo[j][0] - lo[i][0], lo[j][1] - lo[i][1]);
          const want = target[i * n + j];
          err += Math.abs(d - want) / (want + 1); cnt++;
        }
        err = cnt ? err / cnt : 0;

        for (let i = 0; i < n; i++) {
          const c = lab[i], a = 0.35 + (c / Math.max(1, C - 1)) * 0.6;
          ctx.fillStyle = c % 2 ? `rgba(${acc},${a.toFixed(2)})` : `rgba(${ink()},${(a * 0.7).toFixed(2)})`;
          ctx.beginPath(); ctx.arc(lo[i][0], lo[i][1], 2.6, 0, TAU); ctx.fill();
        }
        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('pairwise distances in ' + D + 'D, forced onto 2D by relaxation', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText(D + ' dimensions → 2   ' + C + ' clusters   residual distortion ' +
          (err * 100).toFixed(1) + '%', 12, h - 12);
      }
    };
  }
}
