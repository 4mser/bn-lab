import { TAU, L } from '../core/shared.js';

/* Angular accelerations of the double pendulum: the exact Lagrangian
   equations of motion, angles measured from the downward vertical. */
function pendulumAccel(a1, a2, v1, v2, g, m1, m2, l1, l2) {
  const sin = Math.sin, cos = Math.cos;
  const d = 2 * m1 + m2 - m2 * cos(2 * a1 - 2 * a2);
  const n1 = -g * (2 * m1 + m2) * sin(a1) - m2 * g * sin(a1 - 2 * a2)
           - 2 * sin(a1 - a2) * m2 * (v2 * v2 * l2 + v1 * v1 * l1 * cos(a1 - a2));
  const n2 = 2 * sin(a1 - a2) * (v1 * v1 * l1 * (m1 + m2) + g * (m1 + m2) * cos(a1)
           + v2 * v2 * l2 * m2 * cos(a1 - a2));
  return [n1 / (l1 * d), n2 / (l2 * d)];
}

/* One RK4 step of the double pendulum, in place on s = { a1, a2, v1, v2 }.
   `damp` multiplies both angular velocities after the step (1 = no damping).
   Exported so validation/ can measure the exact scheme the figure runs.

   It used to be semi-implicit Euler at the same h. With damping off, the
   validation suite measured that scheme drifting 7 % of the available energy
   in a minute — an invisible friction the figure never declared. RK4 at the
   same h keeps it below 0.001 %, so the only energy loss left is `damp`. */
export function pendulumStep(s, g, m1, m2, l1, l2, h, damp) {
  const f = (a1, a2, v1, v2) => {
    const acc = pendulumAccel(a1, a2, v1, v2, g, m1, m2, l1, l2);
    return [v1, v2, acc[0], acc[1]];
  };
  const { a1, a2, v1, v2 } = s, k = h / 2;
  const k1 = f(a1, a2, v1, v2);
  const k2 = f(a1 + k * k1[0], a2 + k * k1[1], v1 + k * k1[2], v2 + k * k1[3]);
  const k3 = f(a1 + k * k2[0], a2 + k * k2[1], v1 + k * k2[2], v2 + k * k2[3]);
  const k4 = f(a1 + h * k3[0], a2 + h * k3[1], v1 + h * k3[2], v2 + h * k3[3]);
  s.a1 = a1 + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
  s.a2 = a2 + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
  s.v1 = (v1 + h / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])) * damp;
  s.v2 = (v2 + h / 6 * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3])) * damp;
  return s;
}

export default { id: 'pendulum',
  name: L('Double pendulum', 'Péndulo doble'),
  note: L('Two rods, one equation, and no way to predict minute two.',
          'Dos barras, una ecuación, y ninguna forma de predecir el minuto dos.'),
  params: [
    { key: 'g',    label: L('Gravity', 'Gravedad'),   min: 0.1, max: 2,   step: 0.05, def: 0.6 },
    { key: 'damp', label: L('Damping', 'Amortiguación'), min: 0.99, max: 1, step: 0.0005, def: 0.9999 },
    { key: 'm2',   label: L('Lower mass', 'Masa inferior'), min: 1, max: 40, step: 1, def: 10 }
  ],
  make() {
    const start = () => ({ a1: Math.PI / 2 + 0.6, a2: Math.PI / 2 + 0.4, v1: 0, v2: 0 });
    let st = start(), trace = [];
    return {
      reset() { st = start(); trace = []; },
      step(ctx, w, h, t, acc, P, M) {
        const m1 = 10, m2 = P.m2, l1 = Math.min(w, h) * 0.20, l2 = Math.min(w, h) * 0.20, g = P.g;
        const ox = w / 2, oy = h * 0.34;
        // With the mouse inside, the pendulum is grabbed: the angles point at the cursor
        if (M.in) {
          st.a1 = st.a2 = Math.atan2(M.x - ox, M.y - oy);
          st.v1 = st.v2 = 0; trace.length = 0;
        } else {
          for (let i = 0; i < 3; i++) pendulumStep(st, g, m1, m2, l1, l2, 0.05, P.damp);
        }
        const { a1, a2 } = st;
        const x1 = ox + l1 * Math.sin(a1), y1 = oy + l1 * Math.cos(a1);
        const x2 = x1 + l2 * Math.sin(a2), y2 = y1 + l2 * Math.cos(a2);
        trace.push([x2, y2]);
        if (trace.length > 900) trace.shift();
        for (let i = 1; i < trace.length; i++) {
          ctx.strokeStyle = `rgba(${acc},${((i / trace.length) * 0.5).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(trace[i - 1][0], trace[i - 1][1]);
          ctx.lineTo(trace[i][0], trace[i][1]); ctx.stroke();
        }
        ctx.strokeStyle = `rgba(${acc},0.85)`; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.fillStyle = `rgba(${acc},0.95)`;
        [[x1, y1, 2.6], [x2, y2, 2 + m2 * 0.12]].forEach(p => {
          ctx.beginPath(); ctx.arc(p[0], p[1], p[2], 0, TAU); ctx.fill();
        });
      }
    };
  }
}
