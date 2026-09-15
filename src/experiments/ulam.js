import { L } from '../core/shared.js';

export default { id: 'ulam',
  name: L('Ulam spiral', 'Espiral de Ulam'),
  note: L('Primes on a square spiral. Nobody knows why the diagonals are there.',
          'Primos en una espiral cuadrada. Nadie sabe por qué están las diagonales.'),
  params: [
    { key: 'size',  label: L('Grid', 'Rejilla'), min: 60, max: 400, step: 10, def: 200 },
    { key: 'start', label: L('Start at', 'Empieza en'), min: 0, max: 60, step: 1, def: 0 },
    { key: 'euler', label: L('Mark n²+n+41', 'Marcar n²+n+41'), min: 0, max: 1, step: 1, def: 0 }
  ],
  make() {
    let cache = null, key = '';
    const sieve = n => {
      const p = new Uint8Array(n + 1).fill(1);
      p[0] = p[1] = 0;
      for (let i = 2; i * i <= n; i++) if (p[i]) for (let j = i * i; j <= n; j += i) p[j] = 0;
      return p;
    };
    return {
      step(ctx, w, h, t, acc, P, M) {
        const N = P.size | 0, start = P.start | 0, eu = P.euler | 0;
        const k = N + ':' + start + ':' + eu + ':' + acc;
        if (key !== k) {
          key = k;
          const total = N * N, pr = sieve(total + start + 4);
          const euler = new Set();
          if (eu) for (let i = 0; i * i + i + 41 <= total + start; i++) euler.add(i * i + i + 41);
          const img = new ImageData(N, N), d = img.data;
          const rgb = acc.split(',').map(Number);
          // Walk the spiral: right 1, up 1, left 2, down 2, …
          let x = N >> 1, y = N >> 1, dx = 1, dy = 0, run = 1, done = 0;
          for (let v = 1; v <= total; v++) {
            if (x >= 0 && x < N && y >= 0 && y < N) {
              const num = v + start, o = (y * N + x) * 4;
              const isP = !!pr[num], isE = euler.has(num);
              const a = isE ? 1 : isP ? 0.85 : 0.04;
              d[o] = isE ? 255 : rgb[0] * a;
              d[o+1] = isE ? 255 : rgb[1] * a;
              d[o+2] = isE ? 255 : rgb[2] * a;
              d[o+3] = 255;
            }
            x += dx; y += dy;
            if (++done === run) {
              done = 0;
              const tmp = dx; dx = -dy; dy = tmp;      // turn
              if (dy === 0) run++;
            }
          }
          cache = document.createElement('canvas');
          cache.width = cache.height = N;
          cache.getContext('2d').putImageData(img, 0, 0);
        }
        const S = Math.min(w, h) * 0.84, px = (w - S) / 2, py = (h - S) / 2;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(cache, px, py, S, S);
        ctx.imageSmoothingEnabled = true;
        ctx.strokeStyle = `rgba(${acc},0.25)`;
        ctx.strokeRect(px, py, S, S);

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('every diagonal line is a quadratic n² + bn + c that is prime unusually often', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText('1 to ' + (N * N + start).toLocaleString('en') + '   offset ' + start +
          (eu ? '   ·  white: n²+n+41, prime for n = 0…39' : ''), 12, h - 12);
      }
    };
  }
}
