import { TAU, L } from '../core/shared.js';

export default { id: 'wormhole',
  name: L('Wormhole', 'Agujero de gusano'),
  note: L('A Morris-Thorne throat joining two sheets. Watch something cross it.',
          'Una garganta de Morris-Thorne uniendo dos hojas. Mira algo cruzarla.'),
  params: [
    { key: 'reach',   label: L('Sheet extent', 'Alcance de las hojas'), min: 1.4, max: 6, step: 0.1, def: 3.2 },
    { key: 'tilt',    label: L('View angle', 'Ángulo de vista'), min: 0.12, max: 0.9, step: 0.02, def: 0.34 },
    { key: 'travel',  label: L('Travellers', 'Viajeros'), min: 0, max: 4, step: 1, def: 2 }
  ],
  make() {
    // Morris-Thorne metric with shape function b(r) = b₀²/r.
    // The proper radial coordinate l runs from −∞ to +∞ and CROSSES the throat:
    //   r(l) = √(b₀² + l²)        circumferential radius
    //   z(l) = b₀·arcsinh(l/b₀)   embedding height
    // With l = 0 at the throat, l > 0 is one sheet and l < 0 the other.
    let phi = 0, trav = [];
    const seed = n => {
      trav = [];
      for (let i = 0; i < 4; i++) trav.push({ l: 1 - i * 0.5, dir: i % 2 ? 1 : -1, p: [] });
    };
    seed();
    return {
      reset() { seed(); phi = 0; },
      step(ctx, w, h, t, acc, P, M) {
        // The metric is self-similar in b₀: changing it only scales the figure
        // without changing its shape. So b₀ is fixed at 1 world unit and the
        // scale is computed to fill the frame; the real control is how much of
        // the sheets is shown, which does change what's on screen.
        const LMAX = P.reach;
        const S = (Math.min(w, h) * 0.40) / Math.sqrt(1 + LMAX * LMAX);
        const b0 = S;
        const tilt = M.in ? 0.12 + (M.y / h) * 0.78 : P.tilt;
        if (M.in) phi = (M.x / w) * TAU; else phi += 0.0035;

        const rOf = l => S * Math.sqrt(1 + l * l);
        const zOf = l => S * Math.asinh(l);
        const ca = Math.cos(phi), sa = Math.sin(phi);
        const kz = Math.cos(tilt), ky = Math.sin(tilt);
        const cx = w / 2, cy = h / 2;
        // Projection: azimuthal rotation, then camera tilt
        const proj = (l, a) => {
          const r = rOf(l), z = zOf(l);
          const x = r * Math.cos(a), y = r * Math.sin(a);
          const xr = x * ca - y * sa, yr = x * sa + y * ca;
          return [cx + xr, cy + yr * ky - z * kz];
        };

        // Rings of constant l, drawn back to front
        const RINGS = 26, SEG = 40;
        const ls = [];
        for (let i = 0; i <= RINGS; i++) ls.push(-LMAX + (2 * LMAX * i) / RINGS);
        ls.sort((A, B) => zOf(B) - zOf(A));    // top ones first
        ctx.lineWidth = 1;
        for (const l of ls) {
          const near = 1 - Math.min(1, Math.abs(l) / LMAX);
          ctx.strokeStyle = `rgba(${acc},${(0.10 + near * 0.45).toFixed(3)})`;
          ctx.beginPath();
          for (let k = 0; k <= SEG; k++) {
            const pnt = proj(l, (k / SEG) * TAU);
            k ? ctx.lineTo(pnt[0], pnt[1]) : ctx.moveTo(pnt[0], pnt[1]);
          }
          ctx.stroke();
        }
        // Meridians of constant angle
        ctx.strokeStyle = `rgba(${acc},0.14)`;
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * TAU;
          ctx.beginPath();
          for (let i = 0; i <= 60; i++) {
            const l = -LMAX + (2 * LMAX * i) / 60;
            const pnt = proj(l, a);
            i ? ctx.lineTo(pnt[0], pnt[1]) : ctx.moveTo(pnt[0], pnt[1]);
          }
          ctx.stroke();
        }
        // The throat: the minimal circle, l = 0, radius exactly b₀
        ctx.strokeStyle = `rgba(${acc},0.95)`; ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let k = 0; k <= SEG; k++) {
          const pnt = proj(0, (k / SEG) * TAU);
          k ? ctx.lineTo(pnt[0], pnt[1]) : ctx.moveTo(pnt[0], pnt[1]);
        }
        ctx.stroke();

        // Travellers: advance in l at constant proper speed and cross through
        const n = P.travel | 0;
        for (let i = 0; i < n && i < trav.length; i++) {
          const tr = trav[i];
          tr.l += tr.dir * 0.016;
          if (tr.l > LMAX) { tr.l = LMAX; tr.dir = -1; tr.p.length = 0; }
          if (tr.l < -LMAX) { tr.l = -LMAX; tr.dir = 1; tr.p.length = 0; }
          const a = (i / Math.max(1, n)) * TAU + t * 0.25;
          tr.p.push([tr.l, a]);
          if (tr.p.length > 220) tr.p.shift();
          ctx.lineWidth = 1.2;
          for (let k = 1; k < tr.p.length; k++) {
            ctx.strokeStyle = `rgba(${acc},${((k / tr.p.length) * 0.7).toFixed(3)})`;
            const A = proj(tr.p[k - 1][0], tr.p[k - 1][1]), B = proj(tr.p[k][0], tr.p[k][1]);
            ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
          }
          const pnt = proj(tr.l, a);
          ctx.fillStyle = `rgba(${acc},1)`;
          ctx.beginPath(); ctx.arc(pnt[0], pnt[1], 4.2, 0, TAU); ctx.fill();
        }

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('r(l) = √(b₀² + l²)      z(l) = b₀·asinh(l/b₀)', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.9)`;
        ctx.fillText('b₀ = ' + S.toFixed(0) + 'px    2πb₀ = ' + (TAU * S).toFixed(0) + 'px    l ∈ [−' + LMAX.toFixed(1) + ', ' + LMAX.toFixed(1) + ']', 12, h - 12);
      }
    };
  }
}
