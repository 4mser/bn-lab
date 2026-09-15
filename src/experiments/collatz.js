import { L } from '../core/shared.js';

export default { id: 'collatz',
  name: L('Collatz', 'Collatz'),
  note: L('Halve it or triple-plus-one. Every path tested so far falls to 1. Nobody has proved it.',
          'Divide en dos o triplica y suma uno. Todo camino probado cae a 1. Nadie lo ha demostrado.'),
  params: [
    { key: 'count', label: L('Numbers', 'Números'), min: 100, max: 6000, step: 100, def: 2200 },
    { key: 'even',  label: L('Even turn', 'Giro par'), min: 0, max: 20, step: 0.5, def: 7 },
    { key: 'odd',   label: L('Odd turn', 'Giro impar'), min: -24, max: 0, step: 0.5, def: -11 }
  ],
  make() {
    let cache = null, key = '', maxLen = 0;
    return {
      resize() { key = ''; },
      step(ctx, w, h, t, acc, P, M) {
        const N = P.count | 0;
        const k = N + ':' + P.even + ':' + P.odd + ':' + w + ':' + h + ':' + acc;
        if (key !== k) {
          key = k;
          cache = document.createElement('canvas');
          cache.width = w; cache.height = h;
          const c = cache.getContext('2d');
          const ev = (P.even * Math.PI) / 180, od = (P.odd * Math.PI) / 180;
          const seg = Math.min(w, h) * 0.020;
          maxLen = 0;
          // The sequence is drawn BACKWARDS, from 1. All branches
          // share a root, which is why the drawing grows like coral.
          for (let s = 2; s <= N; s++) {
            const path = [];
            let v = s, guard = 0;
            while (v !== 1 && guard++ < 1000) { path.push(v % 2 === 0); v = v % 2 === 0 ? v / 2 : 3 * v + 1; }
            if (path.length > maxLen) maxLen = path.length;
            let x = w / 2, y = h * 0.94, a = -Math.PI / 2;
            c.beginPath(); c.moveTo(x, y);
            for (let i = path.length - 1; i >= 0; i--) {
              a += path[i] ? ev : od;
              x += Math.cos(a) * seg; y += Math.sin(a) * seg;
              c.lineTo(x, y);
            }
            c.strokeStyle = `rgba(${acc},0.035)`;
            c.lineWidth = 1;
            c.stroke();
          }
        }
        ctx.drawImage(cache, 0, 0);
        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('n even → n/2      n odd → 3n+1      drawn backwards from 1', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText(N.toLocaleString('en') + ' starting numbers   longest path ' + maxLen + ' steps', 12, h - 12);
      }
    };
  }
}
