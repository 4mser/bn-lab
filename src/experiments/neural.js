import { TAU, L, ink } from '../core/shared.js';

export default { id: 'neural',
  name: L('A network thinking', 'Una red pensando'),
  note: L('Signal entering on the left and spreading. Node brightness is activation.',
          'Señal entrando por la izquierda y propagándose. El brillo del nodo es su activación.'),
  params: [
    { key: 'depth', label: L('Layers', 'Capas'),          min: 2, max: 6, step: 1, def: 4 },
    { key: 'width', label: L('Units per layer', 'Neuronas por capa'), min: 3, max: 14, step: 1, def: 9 },
    { key: 'speed', label: L('Signal speed', 'Velocidad de la señal'), min: 0.2, max: 3, step: 0.1, def: 1 }
  ],
  make() {
    let Wt = [], D = 0, N = 0;
    const rnd = () => (Math.random() * 2 - 1) * 1.4;
    function build(depth, width) {
      D = depth; N = width; Wt = [];
      // Layer 0 receives 2 inputs; the rest receive the entire previous layer
      for (let l = 0; l < D; l++) {
        const inN = l === 0 ? 2 : N;
        Wt.push(Array.from({ length: l === D - 1 ? 1 : N },
                           () => Array.from({ length: inN }, rnd)));
      }
    }
    build(4, 9);
    return {
      reset() { build(D, N); },
      step(ctx, w, h, t, acc, P, M) {
        if ((P.depth | 0) !== D || (P.width | 0) !== N) build(P.depth | 0, P.width | 0);

        // Input: the cursor. Without a cursor, a point that orbits on its own.
        const ix = M.in ? (M.x / w) * 2 - 1 : Math.cos(t * 0.5) * 0.8;
        const iy = M.in ? (M.y / h) * 2 - 1 : Math.sin(t * 0.7) * 0.8;

        // Forward propagation, storing each layer
        const acts = [[ix, iy]];
        for (let l = 0; l < D; l++) {
          const prev = acts[acts.length - 1], out = [];
          for (const row of Wt[l]) {
            let z = 0;
            for (let k = 0; k < row.length; k++) z += row[k] * prev[k];
            out.push(Math.tanh(z));
          }
          acts.push(out);
        }

        // The signal front sweeps across the layers: that's what reads as thinking
        const front = (t * P.speed * 0.6) % (D + 2);
        const reach = l => Math.max(0, Math.min(1, front - l));

        const padX = w * 0.12, spanX = w - padX * 2;
        const colX = i => padX + (spanX * i) / (acts.length - 1);
        const nodeY = (layer, i) => {
          const n = layer.length;
          return h * 0.5 + (i - (n - 1) / 2) * Math.min(h * 0.11, h * 0.8 / Math.max(n, 1));
        };

        // Connections: thickness by |weight|, brightness by how much flows through them
        for (let l = 0; l < D; l++) {
          const from = acts[l], to = acts[l + 1], g = reach(l);
          if (g <= 0) continue;
          for (let j = 0; j < to.length; j++) {
            for (let k = 0; k < from.length; k++) {
              const wgt = Wt[l][j][k];
              const flow = Math.abs(wgt * from[k]) * g;
              if (flow < 0.03) continue;
              ctx.lineWidth = 0.4 + Math.min(1.6, Math.abs(wgt) * 0.8);
              ctx.strokeStyle = wgt >= 0
                ? `rgba(${acc},${Math.min(0.6, flow * 0.55).toFixed(3)})`
                : `rgba(${ink()},${Math.min(0.35, flow * 0.3).toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(colX(l), nodeY(from, k));
              ctx.lineTo(colX(l + 1), nodeY(to, j));
              ctx.stroke();
            }
          }
        }

        // Nodes: radius and halo based on |activation|
        for (let l = 0; l < acts.length; l++) {
          const layer = acts[l], g = reach(l - 1) || (l === 0 ? 1 : 0);
          for (let i = 0; i < layer.length; i++) {
            const a = Math.abs(layer[i]) * (l === 0 ? 1 : g);
            const x = colX(l), y = nodeY(layer, i);
            ctx.fillStyle = `rgba(${acc},${(0.05 + a * 0.12).toFixed(3)})`;
            ctx.beginPath(); ctx.arc(x, y, 5 + a * 13, 0, TAU); ctx.fill();
            ctx.fillStyle = layer[i] >= 0
              ? `rgba(${acc},${(0.25 + a * 0.75).toFixed(3)})`
              : `rgba(${ink()},${(0.2 + a * 0.6).toFixed(3)})`;
            ctx.beginPath(); ctx.arc(x, y, 2.4 + a * 3.4, 0, TAU); ctx.fill();
          }
        }

        // Output
        const out = acts[acts.length - 1][0];
        ctx.fillStyle = `rgba(${acc},0.85)`; ctx.font = '11px monospace';
        ctx.fillText('in (' + ix.toFixed(2) + ', ' + iy.toFixed(2) + ')', 12, h - 28);
        ctx.fillText('out ' + out.toFixed(3), 12, h - 12);
      }
    };
  }
}
