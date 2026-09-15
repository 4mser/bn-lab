import { L } from '../core/shared.js';

/* One classical Runge-Kutta (RK4) step of the Lorenz system, in place on
   s = [x, y, z]. Exported so validation/ can measure the exact scheme the
   figure runs.

   It used to be forward Euler at the same dt. The validation suite measured
   that scheme's largest Lyapunov exponent at 0.958 against the published
   0.9056 (5.8 % high: Euler adds spurious expansion); RK4 at the same dt
   gives 0.907. The picture looks the same — the numbers did not. */
const lorenzField = (x, y, z, P) => [P.sigma * (y - x), x * (P.rho - z) - y, x * y - P.beta * z];
export function lorenzStep(s, P, dt) {
  const [x, y, z] = s, h = dt / 2;
  const k1 = lorenzField(x, y, z, P);
  const k2 = lorenzField(x + h * k1[0], y + h * k1[1], z + h * k1[2], P);
  const k3 = lorenzField(x + h * k2[0], y + h * k2[1], z + h * k2[2], P);
  const k4 = lorenzField(x + dt * k3[0], y + dt * k3[1], z + dt * k3[2], P);
  s[0] = x + dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
  s[1] = y + dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
  s[2] = z + dt / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
  return s;
}

export default { id: 'lorenz',
  name: L('Lorenz attractor', 'Atractor de Lorenz'),
  note: L('Deterministic and unpredictable. Never repeats, never escapes.',
          'Determinista e impredecible. Nunca se repite, nunca se escapa.'),
  params: [
    { key: 'rho',   label: L('Rayleigh ρ', 'Rayleigh ρ'),   min: 1,  max: 60, step: 0.5, def: 28 },
    { key: 'sigma', label: L('Prandtl σ', 'Prandtl σ'),     min: 1,  max: 20, step: 0.5, def: 10 },
    { key: 'beta',  label: L('Geometry β', 'Geometría β'),  min: 0.5, max: 5, step: 0.05, def: 8 / 3 }
  ],
  make() {
    let s = [0.01, 0, 0], trail = [];
    return {
      reset() { s = [0.01, 0, 0]; trail = []; },
      step(ctx, w, h, t, acc, P, M) {
        const dt = 0.005;
        for (let i = 0; i < 14; i++) {
          lorenzStep(s, P, dt);
          trail.push([s[0], s[1], s[2]]);
        }
        if (trail.length > 2600) trail.splice(0, trail.length - 2600);
        // The mouse rotates the projection around the vertical axis
        const ang = M.in ? (M.x / w - 0.5) * 2.4 : 0;
        const ca = Math.cos(ang), sa = Math.sin(ang);
        const sc = Math.min(w, h) / 62, cx = w / 2, cy = h / 2 + h * 0.22;
        const px = p => cx + (p[0] * ca - p[1] * sa) * sc;
        const py = p => cy - p[2] * sc;
        ctx.lineWidth = 1;
        for (let i = 1; i < trail.length; i++) {
          ctx.strokeStyle = `rgba(${acc},${((i / trail.length) * 0.75).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(px(trail[i - 1]), py(trail[i - 1]));
          ctx.lineTo(px(trail[i]), py(trail[i]));
          ctx.stroke();
        }
      }
    };
  }
}
