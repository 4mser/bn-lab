import { L } from '../core/shared.js';

export default { id: 'rule30',
  name: L('Rule 30', 'Regla 30'),
  note: L('One line, one rule, applied forever. The result looks random.',
          'Una línea, una regla, aplicada infinitas veces. El resultado parece azar.'),
  params: [
    { key: 'rule', label: L('Rule number', 'Número de regla'), min: 0, max: 255, step: 1, def: 30 },
    { key: 'cell', label: L('Cell size', 'Tamaño de celda'),   min: 2, max: 8,   step: 1, def: 3, unit: 'px' }
  ],
  make(w) {
    let cols = 0, row = null, y = 0, lastCell = 0;
    const seed = c => { row = new Uint8Array(c); row[c >> 1] = 1; y = 0; };
    return {
      persist: true,
      resize() { cols = 0; },
      reset() { cols = 0; },
      step(ctx, w, h, t, acc, P, M) {
        const CELL = P.cell | 0;
        if (!cols || CELL !== lastCell) {
          lastCell = CELL; cols = Math.max(8, Math.floor(w / CELL));
          seed(cols); ctx.clearRect(0, 0, w, h);
        }
        if (y * CELL > h) { seed(cols); ctx.clearRect(0, 0, w, h); }
        ctx.fillStyle = `rgba(${acc},0.8)`;
        for (let i = 0; i < cols; i++) if (row[i]) ctx.fillRect(i * CELL, y * CELL, CELL - 0.6, CELL - 0.6);
        const R = P.rule | 0, next = new Uint8Array(cols);
        for (let i = 0; i < cols; i++) {
          const l = row[(i - 1 + cols) % cols], c = row[i], r = row[(i + 1) % cols];
          const idx = (l << 2) | (c << 1) | r;       // neighborhood encoded as a number 0..7
          next[i] = (R >> idx) & 1;                  // bit idx of the rule
        }
        row = next; y++;
      }
    };
  }
}
