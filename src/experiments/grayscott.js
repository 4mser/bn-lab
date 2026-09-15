import { L } from '../core/shared.js';

export default { id: 'grayscott',
  name: L('Reaction and diffusion', 'Reacción y difusión'),
  note: L('Two chemicals, four numbers. Spots, stripes, mazes, things that divide.',
          'Dos químicos, cuatro números. Manchas, rayas, laberintos, cosas que se dividen.'),
  params: [
    { key: 'F', label: L('Feed F', 'Alimentación F'), min: 0.01, max: 0.08, step: 0.001, def: 0.037 },
    { key: 'k', label: L('Kill k', 'Remoción k'), min: 0.045, max: 0.07, step: 0.0005, def: 0.06 },
    { key: 'it', label: L('Steps per frame', 'Pasos por frame'), min: 1, max: 14, step: 1, def: 6 }
  ],
  make() {
    const N = 150;
    let U = null, V = null, U2 = null, V2 = null;
    const seed = () => {
      U = new Float32Array(N * N).fill(1); V = new Float32Array(N * N);
      U2 = new Float32Array(N * N); V2 = new Float32Array(N * N);
      for (let q = 0; q < 22; q++) {
        const cx = 10 + ((Math.random() * (N - 20)) | 0), cy = 10 + ((Math.random() * (N - 20)) | 0);
        for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
          const k = (cy + dy) * N + (cx + dx);
          U[k] = 0.5; V[k] = 0.25;
        }
      }
    };
    seed();
    return {
      reset() { seed(); },
      step(ctx, w, h, t, acc, P, M) {
        if (M.in) {                                  // seed with the cursor
          const S0 = Math.min(w, h) * 0.8, ox0 = (w - S0) / 2, oy0 = (h - S0) / 2;
          const cx = ((M.x - ox0) / S0 * N) | 0, cy = ((M.y - oy0) / S0 * N) | 0;
          for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
            const x = cx + dx, y = cy + dy;
            if (x > 0 && x < N - 1 && y > 0 && y < N - 1) { U[y * N + x] = 0.5; V[y * N + x] = 0.25; }
          }
        }
        const Du = 0.16, Dv = 0.08, F = P.F, kk = P.k;
        for (let s = 0; s < (P.it | 0); s++) {
          for (let y = 1; y < N - 1; y++) {
            for (let x = 1; x < N - 1; x++) {
              const i = y * N + x;
              // 5-point Laplacian
              const lu = U[i - 1] + U[i + 1] + U[i - N] + U[i + N] - 4 * U[i];
              const lv = V[i - 1] + V[i + 1] + V[i - N] + V[i + N] - 4 * V[i];
              const uvv = U[i] * V[i] * V[i];
              U2[i] = U[i] + Du * lu - uvv + F * (1 - U[i]);
              V2[i] = V[i] + Dv * lv + uvv - (F + kk) * V[i];
            }
          }
          const tu = U; U = U2; U2 = tu;
          const tv = V; V = V2; V2 = tv;
        }
        const img = ctx.createImageData(N, N), px = img.data;
        const rgb = acc.split(',').map(Number);
        for (let i = 0; i < N * N; i++) {
          const v = Math.min(1, Math.max(0, V[i] * 3.4));
          const o = i * 4;
          px[o] = rgb[0] * v; px[o+1] = rgb[1] * v; px[o+2] = rgb[2] * v; px[o+3] = 255;
        }
        const off = document.createElement('canvas');
        off.width = off.height = N; off.getContext('2d').putImageData(img, 0, 0);
        const S = Math.min(w, h) * 0.8;
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, (w - S) / 2, (h - S) / 2, S, S);

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('∂U/∂t = Du∇²U − UV² + F(1−U)      ∂V/∂t = Dv∇²V + UV² − (F+k)V', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText('F = ' + F.toFixed(3) + '   k = ' + kk.toFixed(4), 12, h - 12);
      }
    };
  }
}
