import { L } from '../core/shared.js';

/* Metropolis updates on an N×N periodic lattice of ±1 spins, in place:
   `flips` single-spin proposals at random sites, each accepted with
   probability min(1, exp(−ΔE/T)), with J = 1 and k_B = 1.
   Exported so validation/ can measure the exact scheme the figure runs. */
export function metropolis(sp, N, T, B, flips, rand = Math.random) {
  for (let f = 0; f < flips; f++) {
    const i = (rand() * N) | 0, j = (rand() * N) | 0, k = j * N + i;
    const s = sp[k];
    const nb = sp[j * N + ((i + 1) % N)] + sp[j * N + ((i - 1 + N) % N)]
             + sp[((j + 1) % N) * N + i] + sp[((j - 1 + N) % N) * N + i];
    const dE = 2 * s * (nb + B);
    if (dE <= 0 || rand() < Math.exp(-dE / T)) sp[k] = -s;
  }
  return sp;
}

export default { id: 'ising',
  name: L('Ising model', 'Modelo de Ising'),
  note: L('Spins that copy their neighbours. Below a critical temperature they all agree.',
          'Espines que copian a sus vecinos. Bajo cierta temperatura todos se ponen de acuerdo.'),
  params: [
    { key: 'T',  label: L('Temperature T', 'Temperatura T'), min: 0.4, max: 5, step: 0.02, def: 2.6 },
    { key: 'B',  label: L('External field', 'Campo externo'), min: -0.5, max: 0.5, step: 0.01, def: 0 },
    { key: 'sw', label: L('Sweeps per frame', 'Barridos por frame'), min: 1, max: 40, step: 1, def: 12 }
  ],
  make() {
    const TC = 2 / Math.log(1 + Math.SQRT2);      // 2.269..., exact (Onsager)
    let N = 0, sp = null, hist = [];
    // Starts ORDERED on purpose. From a random state, at low temperature the
    // system freezes into domains that take forever to merge, and |M|
    // stays near zero: the number would lie about the transition.
    const init = n => { N = n; sp = new Int8Array(N * N).fill(1); hist = []; };
    return {
      reset() { init(N || 110); },
      step(ctx, w, h, t, acc, P, M) {
        const n = Math.min(140, Math.max(40, Math.floor(Math.min(w, h) / 4)));
        if (n !== N) init(n);
        const T = M.in ? 0.4 + (M.x / w) * 4.6 : P.T;

        // Metropolis: propose flipping a spin and accept with exp(−ΔE/T).
        // The entire phase transition emerges from that single exponential.
        metropolis(sp, N, T, P.B, (P.sw | 0) * N * N / 6);

        let m = 0;
        for (let i = 0; i < sp.length; i++) m += sp[i];
        m /= sp.length;
        hist.push(Math.abs(m));
        if (hist.length > 240) hist.shift();

        // Drawing the grid
        const S = Math.min(w, h) * 0.74, ox = (w - S) / 2, oy = h * 0.06, cs = S / N;
        const img = ctx.createImageData(N, N), px = img.data;
        const rgb = acc.split(',').map(Number);
        for (let k = 0; k < sp.length; k++) {
          const o = k * 4, up = sp[k] > 0;
          px[o] = up ? rgb[0] : 12; px[o+1] = up ? rgb[1] : 12; px[o+2] = up ? rgb[2] : 14; px[o+3] = 255;
        }
        const off = document.createElement('canvas');
        off.width = off.height = N; off.getContext('2d').putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(off, ox, oy, S, S);
        ctx.strokeStyle = `rgba(${acc},0.4)`; ctx.lineWidth = 1;
        ctx.strokeRect(ox, oy, S, S);

        // Magnetization over time, and where you are relative to Tc
        const gx = ox, gw = S, gy = h * 0.95, gh = h * 0.10;
        ctx.strokeStyle = `rgba(${acc},0.18)`;
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();
        ctx.strokeStyle = `rgba(${acc},0.9)`; ctx.lineWidth = 1.4;
        ctx.beginPath();
        hist.forEach((v, i) => { const X = gx + (i / 240) * gw, Y = gy - v * gh;
          i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
        ctx.stroke();

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('T_c = 2/ln(1+√2) = ' + TC.toFixed(3) + '   (exact, Onsager 1944)', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText('T = ' + T.toFixed(2) + '   |M| = ' + Math.abs(m).toFixed(3) + '   ' +
          (T < TC ? 'ordered' : 'disordered'), 12, h - 12);
      }
    };
  }
}
