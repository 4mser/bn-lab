import { L } from '../core/shared.js';

export default { id: 'attention',
  name: L('Attention', 'Atención'),
  note: L('What a transformer does to a sentence: every word weighs every other one.',
          'Lo que un transformer le hace a una frase: cada palabra pesa a todas las demás.'),
  params: [
    { key: 'temp', label: L('Softmax sharpness', 'Nitidez del softmax'), min: 0.2, max: 4, step: 0.05, def: 1 },
    { key: 'head', label: L('Head', 'Cabeza'), min: 0, max: 3, step: 1, def: 0 },
    { key: 'row',  label: L('Focus token', 'Token en foco'), min: -1, max: 9, step: 1, def: -1 }
  ],
  make() {
    // Fixed sentence with hand-crafted vectors in 4 interpretable dimensions:
    // [animal, furniture, action, reference]. This is not a trained model and
    // doesn't claim to be: it teaches the MECHANISM, which almost nobody sees.
    const TOK = ['the', 'cat', 'sat', 'on', 'the', 'mat', 'because', 'it', 'was', 'tired'];
    // Magnitudes matter: with vectors near zero all dot products look alike,
    // the softmax comes out nearly flat, and the matrix looks dead. The first
    // version had that problem. Real embeddings aren't tiny either.
    const E = [
      [0.2, 0.2, 0.1, 0.3], [2.4, 0.1, 0.2, 0.6], [0.3, 0.2, 2.3, 0.2],
      [0.1, 0.8, 0.5, 0.1], [0.2, 0.2, 0.1, 0.3], [0.2, 2.4, 0.1, 0.5],
      [0.1, 0.1, 0.5, 1.0], [1.6, 0.5, 0.1, 2.2], [0.2, 0.1, 1.3, 0.5],
      [1.4, 0.1, 0.9, 0.3]
    ];
    // Four heads: each projects with different weights, so each attends to
    // different relationships within the same sentence.
    const HEAD = [
      [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],
      [[0,0,0,1],[1,0,0,0],[0,1,0,0],[0,0,1,0]],
      [[0,1,0,0],[0,0,1,0],[0,0,0,1],[1,0,0,0]],
      [[1,0,0,1],[0,1,1,0],[1,0,1,0],[0,1,0,1]]
    ];
    return {
      step(ctx, w, h, t, acc, P, M) {
        const n = TOK.length, W = HEAD[P.head | 0];
        const proj = v => W.map(r => r.reduce((a, x, i) => a + x * v[i], 0));
        const Q = E.map(proj), K = E.map(proj);
        // A = softmax(Q·Kᵀ / √d)
        const A = Q.map(q => {
          const sc = K.map(k => k.reduce((a, x, i) => a + x * q[i], 0) / Math.sqrt(4) / P.temp);
          const mx = Math.max(...sc), ex = sc.map(v => Math.exp(v - mx));
          const sum = ex.reduce((a, b) => a + b, 0);
          return ex.map(v => v / sum);
        });

        const focus = M.in ? Math.min(n - 1, Math.floor((M.y / h) * n)) : (P.row | 0);
        const gy = h * 0.14, gx = w * 0.30, cell = Math.min((w * 0.42) / n, (h * 0.62) / n);

        // Attention matrix
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            const a = A[i][j];
            const on = focus < 0 || focus === i;
            ctx.fillStyle = `rgba(${acc},${(a * (on ? 0.95 : 0.12)).toFixed(3)})`;
            ctx.fillRect(gx + j * cell, gy + i * cell, cell - 1, cell - 1);
          }
        }
        ctx.strokeStyle = `rgba(${acc},0.2)`; ctx.lineWidth = 1;
        ctx.strokeRect(gx, gy, cell * n, cell * n);

        ctx.font = '11px monospace';
        for (let i = 0; i < n; i++) {
          const on = focus < 0 || focus === i;
          ctx.fillStyle = `rgba(${acc},${on ? 0.95 : 0.35})`;
          ctx.textAlign = 'right';
          ctx.fillText(TOK[i], gx - 8, gy + i * cell + cell * 0.7);   // queries
          ctx.textAlign = 'left';
          ctx.save();
          ctx.translate(gx + i * cell + cell * 0.7, gy - 10);
          ctx.rotate(-Math.PI / 4);
          ctx.fillStyle = `rgba(${acc},0.6)`;
          ctx.fillText(TOK[i], 0, 0);                                 // keys
          ctx.restore();
        }
        ctx.textAlign = 'left';

        // Arcs for the focused row: who that word attends to
        if (focus >= 0) {
          const by = gy + cell * n + h * 0.10, bx = gx;
          for (let j = 0; j < n; j++) {
            const a = A[focus][j];
            if (a < 0.02) continue;
            const x1 = bx + focus * cell + cell / 2, x2 = bx + j * cell + cell / 2;
            ctx.strokeStyle = `rgba(${acc},${Math.min(0.9, a * 1.6).toFixed(3)})`;
            ctx.lineWidth = 0.5 + a * 5;
            ctx.beginPath();
            ctx.moveTo(x1, by);
            ctx.quadraticCurveTo((x1 + x2) / 2, by - Math.abs(x2 - x1) * 0.45 - 12, x2, by);
            ctx.stroke();
          }
          for (let j = 0; j < n; j++) {
            ctx.fillStyle = `rgba(${acc},${j === focus ? 1 : 0.5})`;
            ctx.font = '11px monospace';
            ctx.fillText(TOK[j], bx + j * cell + 2, by + 16);
          }
        }

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('A = softmax(Q·Kᵀ / √d)      rows are queries, columns are keys', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText('head ' + (P.head | 0) + '   sharpness ' + P.temp.toFixed(2) +
          (focus >= 0 ? '   focus: "' + TOK[focus] + '"' : '   (hover a row)'), 12, h - 12);
      }
    };
  }
}
