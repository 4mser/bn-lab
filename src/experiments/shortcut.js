import { TAU, L } from '../core/shared.js';

export default { id: 'shortcut',
  name: L('Looking through', 'Mirar a través'),
  note: L('Ray-traced view into an Ellis wormhole. Two skies in one image.',
          'Vista trazada por rayos hacia un agujero de Ellis. Dos cielos en una imagen.'),
  params: [
    { key: 'b0',   label: L('Throat radius b₀', 'Radio de garganta b₀'), min: 0.2, max: 3, step: 0.05, def: 1 },
    { key: 'dist', label: L('Camera distance', 'Distancia de la cámara'), min: 1.5, max: 14, step: 0.25, def: 5 },
    { key: 'fov',  label: L('Field of view', 'Campo de visión'), min: 30, max: 140, step: 2, def: 90, unit: '°' }
  ],
  make() {
    // Ellis metric (Morris-Thorne with b(r) = b₀²/r):
    //   ds² = −dt² + dl² + (b₀² + l²)dφ²
    // A ray with impact parameter b satisfies
    //   dl/dφ = ±(r²/b)·√(1 − b²/r²),   r² = b₀² + l²
    // Integrating IN φ, the square root doesn't blow up at the turning point:
    // dl/dφ → 0 smoothly, so plain Euler with a fine step is enough.
    const N = 512;                       // rays in the lookup table
    let lut = null, key = '', img = null, off = null, ikey = '';

    function buildLUT(b0, l0, fovRad) {
      const r0 = Math.sqrt(b0 * b0 + l0 * l0);
      const t = new Float32Array(N);     // asymptotic angle Θ
      const side = new Uint8Array(N);    // 0 = same side, 1 = the other
      const LINF = 260;
      for (let i = 0; i < N; i++) {
        const psi = (i / (N - 1)) * (fovRad / 2);
        const b = r0 * Math.sin(psi);
        let l = l0, phi = 0, dir = -1;   // starts falling toward the throat
        const dphi = 0.004;
        let guard = 0;
        while (guard++ < 6000) {
          const r2 = b0 * b0 + l * l;
          const s = 1 - (b * b) / r2;
          if (s <= 0) { dir = -dir; l += dir * 0.001; continue; }   // turning point
          const dl = dir * (r2 / Math.max(b, 1e-6)) * Math.sqrt(s);
          l += dl * dphi; phi += dphi;
          if (l > LINF || l < -LINF) break;
        }
        side[i] = l < 0 ? 1 : 0;
        t[i] = phi;
      }
      return { t, side, r0 };
    }

    // Procedural skies. Stars are generated per cell with a random position
    // inside it and a smooth falloff, so they read as points rather than
    // blocks of the buffer.
    function sky(which, th, az, rgb, px, o) {
      const hash = (a, b) => {
        const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
        return s - Math.floor(s);
      };
      const K = which ? 34 : 22;
      const u = th * K, v = az * K * 0.5;
      let star = 0;
      for (let du = -1; du <= 0; du++) {
        for (let dv = -1; dv <= 0; dv++) {
          const cu = Math.floor(u) + du, cv = Math.floor(v) + dv;
          const h1 = hash(cu, cv);
          if (h1 < (which ? 0.28 : 0.16)) continue;          // no star in this cell
          const sx = cu + hash(cu + 3.3, cv), sy = cv + hash(cu, cv + 7.7);
          const d = Math.hypot(u - sx, v - sy);
          const mag = 0.35 + hash(cv, cu) * 0.65;
          star = Math.max(star, Math.max(0, 1 - d / 0.42) * mag);
        }
      }
      star = Math.pow(star, 1.7);
      // Coordinate grid: different density on each side
      const gA = Math.abs(((th * (which ? 7 : 4)) % 1) - 0.5);
      const gB = Math.abs(((az * (which ? 7 : 4)) % 1) - 0.5);
      const grid = Math.max(0, 0.5 - Math.min(gA, gB)) * (which ? 0.20 : 0.13);
      if (which) {                        // the other sky: cold, pale
        px[o]   = Math.min(255, 205 * star + 110 * grid);
        px[o+1] = Math.min(255, 222 * star + 130 * grid);
        px[o+2] = Math.min(255, 255 * star + 165 * grid);
      } else {                            // our own sky: the theme color
        px[o]   = Math.min(255, rgb[0] * star + rgb[0] * grid);
        px[o+1] = Math.min(255, rgb[1] * star + rgb[1] * grid);
        px[o+2] = Math.min(255, rgb[2] * star + rgb[2] * grid);
      }
      px[o+3] = 255;
    }

    return {
      reset() { key = ''; ikey = ''; },
      step(ctx, w, h, t, acc, P, M) {
        const b0 = P.b0, l0 = P.dist, fov = P.fov * Math.PI / 180;
        const spin = M.in ? (M.x / w) * TAU : t * 0.05;
        const RES = 300;

        const k = [b0.toFixed(2), l0.toFixed(2), P.fov].join('|');
        if (k !== key) { key = k; lut = buildLUT(b0, l0, fov); ikey = ''; }

        const ik = [k, acc].join('|');
        if (ik !== ikey) {
          ikey = ik;
          if (!img || img.width !== RES) {
            img = ctx.createImageData(RES, RES);
            off = document.createElement('canvas'); off.width = off.height = RES;
          }
          const rgb = acc.split(',').map(Number), px = img.data;
          const half = RES / 2, tanH = Math.tan(fov / 2);
          for (let j = 0; j < RES; j++) {
            const dy = (j - half) / half;
            for (let i = 0; i < RES; i++) {
              const dx = (i - half) / half;
              const rad = Math.hypot(dx, dy);
              const o = (j * RES + i) * 4;
              // angle of the ray relative to the optical axis
              const psi = Math.atan(rad * tanH);
              const idx = Math.min(N - 1, Math.round((psi / (fov / 2)) * (N - 1)));
              const az = Math.atan2(dy, dx);
              sky(lut.side[idx], lut.t[idx], az, rgb, px, o);
            }
          }
          off.getContext('2d').putImageData(img, 0, 0);
        }

        // Rotation is applied at draw time. Recomputing the buffer every
        // rotation frame would cost 90,000 table lookups that never change.
        const S = Math.max(w, h) * 1.45;
        ctx.save();
        ctx.translate(w / 2, h / 2); ctx.rotate(spin);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, -S / 2, -S / 2, S, S);
        ctx.restore();

        // Mouth edge: the last ray that still crosses to the other side
        let edge = 0;
        for (let i = 0; i < N; i++) if (lut.side[i]) edge = i;
        const psiE = ((edge + 0.5) / (N - 1)) * (fov / 2);
        const rE = Math.tan(psiE) / Math.tan(fov / 2);
        ctx.strokeStyle = `rgba(${acc},0.5)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(w / 2, h / 2, (rE * S) / 2, 0, TAU); ctx.stroke();

        ctx.font = '11px monospace';
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText('dl/dφ = ±(r²/b)·√(1 − b²/r²)      r² = b₀² + l²', 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        const frac = lut.side.reduce((a, b) => a + b, 0) / N;
        ctx.fillText('b₀ = ' + b0.toFixed(2) + '   camera l = ' + l0.toFixed(1) +
          '   other sky covers ' + (frac * 100).toFixed(0) + '% of the view', 12, h - 12);
      }
    };
  }
}
