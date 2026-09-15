import { TAU, L, ink } from '../core/shared.js';

export default { id: 'doubleslit',
  name: L('Double slit', 'Doble rendija'),
  note: L('Nobody watching, and fringes appear. Put an observer at the slits and they do not.',
          'Nadie mirando, y aparecen franjas. Pon un observador en las rendijas y no aparecen.'),
  params: [
    { key: 'watch', label: L('Observer at the slits', 'Observador en las rendijas'), min: 0, max: 1, step: 1, def: 0 },
    { key: 'eff',   label: L('Detector reliability', 'Fiabilidad del detector'), min: 0, max: 1, step: 0.01, def: 1 },
    { key: 'sep',   label: L('Slit separation d', 'Separación d'), min: 20, max: 140, step: 2, def: 62, unit: 'px' },
    { key: 'lam',   label: L('Wavelength λ', 'Longitud de onda λ'), min: 8, max: 40, step: 1, def: 18, unit: 'px' }
  ],
  make(w, h) {
    const BINS = 150;
    let bins = new Float32Array(BINS), peak = 1, hits = [], lastKey = '';
    let seen = [0, 0], glow = [0, 0];
    return {
      reset() { bins = new Float32Array(BINS); peak = 1; hits = []; seen = [0, 0]; },
      step(ctx, w, h, t, acc, P, M) {
        // The observer is a switch. Its reliability decides how much
        // which-path information exists: a perfect detector gives D = 1.
        const on = P.watch > 0.5;
        const eff = M.in ? Math.min(1, Math.max(0, M.x / w)) : P.eff;
        const D = on ? eff : 0;
        const V = Math.sqrt(Math.max(0, 1 - D * D));   // complementarity V² + D² ≤ 1
        const key = [P.sep, P.lam, on ? 1 : 0, D.toFixed(2)].join('|');
        if (key !== lastKey) { lastKey = key; bins = new Float32Array(BINS); peak = 1; hits = []; seen = [0, 0]; }

        const bx = w * 0.34, sx = w * 0.90, cy = h / 2;
        const s1 = cy - P.sep / 2, s2 = cy + P.sep / 2;
        const k = TAU / P.lam;

        const amp = (x, y, sy) => {
          const dx = x - bx, dy = y - sy, r = Math.hypot(dx, dy) + 6;
          const a = 26 / Math.sqrt(r);
          return [a * Math.cos(k * r), a * Math.sin(k * r)];
        };
        // With the observer off, the cross term enters in full and fringes
        // appear. Turned on, it vanishes and you're left with two summed blobs.
        const inten = (x, y) => {
          const A = amp(x, y, s1), B = amp(x, y, s2);
          const i1 = A[0] * A[0] + A[1] * A[1], i2 = B[0] * B[0] + B[1] * B[1];
          return i1 + i2 + 2 * V * (A[0] * B[0] + A[1] * B[1]);
        };

        const STEP = 7;
        for (let x = bx + STEP; x < sx; x += STEP) {
          for (let y = STEP / 2; y < h; y += STEP) {
            const I = Math.min(1, inten(x, y) / 26);
            if (I < 0.05) continue;
            ctx.fillStyle = `rgba(${acc},${(0.06 + I * 0.5).toFixed(3)})`;
            ctx.beginPath(); ctx.arc(x, y, 0.5 + I * 1.9, 0, TAU); ctx.fill();
          }
        }
        ctx.strokeStyle = `rgba(${acc},0.18)`; ctx.lineWidth = 1;
        for (const sy of [s1, s2]) {
          for (let n = 0; n < 7; n++) {
            const rr = ((t * 34 + n * P.lam * 2.4) % (sx - bx));
            ctx.beginPath(); ctx.arc(bx, sy, rr, -1.15, 1.15); ctx.stroke();
          }
        }

        ctx.strokeStyle = `rgba(${acc},0.8)`; ctx.lineWidth = 2.5;
        const gap = 7;
        [[0, s1 - gap], [s1 + gap, s2 - gap], [s2 + gap, h]].forEach(([a, b]) => {
          ctx.beginPath(); ctx.moveTo(bx, a); ctx.lineTo(bx, b); ctx.stroke();
        });

        // Detections. With the observer on, we also record which slit each
        // photon passed through: that's the information that kills the fringes.
        let Imax = 0;
        for (let b = 0; b < BINS; b++) Imax = Math.max(Imax, inten(sx, (b + 0.5) * h / BINS));
        for (let q = 0; q < 3; q++) {
          for (let tries = 0; tries < 14; tries++) {
            const y = Math.random() * h;
            if (inten(sx, y) > Math.random() * Imax) {
              const b = Math.min(BINS - 1, Math.floor((y / h) * BINS));
              bins[b]++; peak = Math.max(peak, bins[b]);
              hits.push({ y, life: 1 });
              if (on) {
                // Most likely slit given where it landed, if the detector
                // gets it right; with reliability < 1 it's sometimes wrong.
                let which = y < cy ? 0 : 1;
                if (Math.random() > eff) which = 1 - which;
                seen[which]++; glow[which] = 1;
              }
              break;
            }
          }
        }
        if (hits.length > 260) hits.splice(0, hits.length - 260);

        // The observer: two detectors that flash when they register a pass
        glow[0] *= 0.90; glow[1] *= 0.90;
        if (on) {
          [s1, s2].forEach((sy, i) => {
            ctx.strokeStyle = `rgba(${ink()},${(0.3 + glow[i] * 0.7).toFixed(2)})`;
            ctx.lineWidth = 1.2 + glow[i];
            ctx.beginPath(); ctx.arc(bx + 15, sy, 7, 0, TAU); ctx.stroke();
            ctx.font = '10px monospace';
            ctx.fillStyle = `rgba(${ink()},${(0.45 + glow[i] * 0.55).toFixed(2)})`;
            ctx.fillText(String(seen[i]), bx + 26, sy + 4);
          });
        }

        const bw = h / BINS;
        for (let b = 0; b < BINS; b++) {
          if (!bins[b]) continue;
          const L = (bins[b] / peak) * (w * 0.085);
          ctx.fillStyle = `rgba(${acc},${(0.25 + 0.6 * (bins[b] / peak)).toFixed(3)})`;
          ctx.fillRect(sx, b * bw, L, bw - 0.5);
        }
        ctx.strokeStyle = `rgba(${acc},0.5)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, h); ctx.stroke();
        hits.forEach(hh => {
          hh.life *= 0.985;
          ctx.fillStyle = `rgba(${ink()},${(hh.life * 0.8).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(sx, hh.y, 1.6, 0, TAU); ctx.fill();
        });

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('V² + D² ≤ 1      knowing the path costs you the fringes', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText((on ? 'observer ON   D = ' + D.toFixed(2) : 'nobody watching   D = 0') +
          '    V = ' + V.toFixed(2) + '    ' +
          (V > 0.15 ? 'interference' : 'two bands, no fringes'), 12, h - 12);
      }
    };
  }
}
