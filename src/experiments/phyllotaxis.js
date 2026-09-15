import { TAU, L } from '../core/shared.js';

export default { id: 'phyllotaxis',
  name: L('Phyllotaxis', 'Filotaxis'),
  note: L('The golden angle. The same packing a sunflower solved first.',
          'El ángulo áureo. El mismo empaquetado que un girasol resolvió antes.'),
  params: [
    { key: 'angle', label: L('Divergence angle', 'Ángulo de divergencia'), min: 130, max: 145, step: 0.01, def: 137.507, unit: '°' },
    { key: 'count', label: L('Seeds', 'Semillas'),   min: 60, max: 900, step: 10, def: 420 },
    { key: 'spread', label: L('Spread', 'Dispersión'), min: 0.01, max: 0.06, step: 0.002, def: 0.028 }
  ],
  make() {
    return {
      step(ctx, w, h, t, acc, P, M) {
        const GA = P.angle * Math.PI / 180;
        const n = P.count | 0, sc = Math.min(w, h) * P.spread, cx = w / 2, cy = h / 2;
        const spin = M.in ? (M.x / w - 0.5) * 6 : t * 0.12;
        for (let i = 0; i < n; i++) {
          const a = i * GA + spin, r = sc * Math.sqrt(i);
          const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
          const f = i / n;
          ctx.fillStyle = `rgba(${acc},${(0.15 + f * 0.7).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(x, y, 0.8 + f * 2.1, 0, TAU); ctx.fill();
        }
      }
    };
  }
}
