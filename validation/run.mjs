/* Numerical validation.

   Each check drives the exact update function an experiment uses on screen
   (imported from src/experiments) and compares a measured quantity with a
   published or analytically exact value. Criteria are fixed in this file, not
   tuned after the fact. Results are written to validation/RESULTS.md.

     node validation/run.mjs            full run
     node validation/run.mjs --quick    shorter runs, same criteria */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lorenzStep } from '../src/experiments/lorenz.js';
import { pendulumStep } from '../src/experiments/pendulum.js';
import { keplerFrame } from '../src/experiments/kepler.js';
import { metropolis } from '../src/experiments/ising.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const QUICK = process.argv.includes('--quick');
const results = [];
const fmt = (v, d = 4) => (Math.abs(v) !== 0 && (Math.abs(v) < 1e-3 || Math.abs(v) >= 1e5) ? v.toExponential(2) : v.toFixed(d));

function record(check) {
  results.push(check);
  const mark = check.pass ? 'PASS' : 'FAIL';
  console.log(`\n[${mark}] ${check.title}`);
  for (const row of check.rows) console.log('   ' + row.join('  |  '));
  console.log('   → ' + check.verdict);
}

/* Deterministic PRNG (mulberry32) so Monte Carlo runs are reproducible. */
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── 1. Lorenz: largest Lyapunov exponent ───────────────────────────────────
   Benettin's method: follow a reference and a neighbour 1e-8 apart,
   renormalise the separation every 10 steps and average log growth.
   Reference: λ₁ ≈ 0.9056 for σ=10, ρ=28, β=8/3 (Sprott, Chaos and
   Time-Series Analysis, OUP 2003). The figure integrates with RK4 at
   dt = 0.005. Forward Euler at the same dt — what the figure used before this
   suite existed — is measured alongside as a control. */
{
  const P = { sigma: 10, rho: 28, beta: 8 / 3 }, dt = 0.005;
  const eulerStep = (s) => {
    const [x, y, z] = s;
    s[0] += P.sigma * (y - x) * dt; s[1] += (x * (P.rho - z) - y) * dt; s[2] += (x * y - P.beta * z) * dt;
    return s;
  };
  const lyapunov = (stepFn, time) => {
    const a = [1, 1, 1];
    for (let i = 0; i < 100 / dt; i++) stepFn(a);          // settle onto the attractor
    const d0 = 1e-8, b = [a[0] + d0, a[1], a[2]];
    let sum = 0, steps = 0, maxAbs = 0;
    const total = Math.round(time / dt);
    while (steps < total) {
      for (let k = 0; k < 10; k++) { stepFn(a); stepFn(b); }
      steps += 10;
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
      const d = Math.hypot(dx, dy, dz);
      sum += Math.log(d / d0);
      for (let i = 0; i < 3; i++) b[i] = a[i] + [dx, dy, dz][i] * d0 / d;
      maxAbs = Math.max(maxAbs, Math.abs(a[0]), Math.abs(a[1]), Math.abs(a[2]));
    }
    return { lambda: sum / (steps * dt), maxAbs };
  };
  const time = QUICK ? 500 : 3000;
  const screen = lyapunov(s => lorenzStep(s, P, dt), time);
  const control = lyapunov(eulerStep, time);
  const REF = 0.9056;
  const err = Math.abs(screen.lambda - REF) / REF;
  const errControl = Math.abs(control.lambda - REF) / REF;
  const pass = err < 0.05 && screen.maxAbs < 60;
  record({
    id: 'lorenz', title: 'Lorenz attractor — largest Lyapunov exponent',
    rows: [
      ['scheme', 'λ₁ measured', 'reference', 'relative error'],
      ['RK4, dt=0.005 (on screen)', fmt(screen.lambda), String(REF), (err * 100).toFixed(2) + ' %'],
      ['forward Euler, dt=0.005 (control: the previous scheme)', fmt(control.lambda), String(REF), (errControl * 100).toFixed(2) + ' %']
    ],
    criterion: 'on-screen scheme within 5 % of λ₁ = 0.9056, trajectory bounded (|x|,|y|,|z| < 60)',
    pass,
    verdict: `λ₁ = ${fmt(screen.lambda)} over t = ${time} (${(err * 100).toFixed(2)} % from the reference). Forward Euler at the same step reads ${fmt(control.lambda)} (${(errControl * 100).toFixed(1)} % high), which is why the figure no longer uses it.`
  });
}

/* ── 2. Double pendulum: energy conservation ───────────────────────────────
   With damping switched off (damp = 1) the system is Hamiltonian, so any
   change in E = T + V is integration error. RK4, h = 0.05, three sub-steps
   per frame as on screen, 60 s of frames at 60 fps. Semi-implicit Euler at the
   same h — the previous scheme — is measured alongside as a control.
     T = ½(m₁+m₂)l₁²ω₁² + ½m₂l₂²ω₂² + m₂l₁l₂ω₁ω₂cos(θ₁−θ₂)
     V = −(m₁+m₂)g l₁cosθ₁ − m₂g l₂cosθ₂
   Error is reported relative to the energy above the resting state. */
{
  const m1 = 10, m2 = 10, l = 80, g = 0.6, h = 0.05;
  const energy = s => {
    const T = 0.5 * (m1 + m2) * l * l * s.v1 * s.v1 + 0.5 * m2 * l * l * s.v2 * s.v2
            + m2 * l * l * s.v1 * s.v2 * Math.cos(s.a1 - s.a2);
    const V = -(m1 + m2) * g * l * Math.cos(s.a1) - m2 * g * l * Math.cos(s.a2);
    return T + V;
  };
  const rest = -(m1 + m2) * g * l - m2 * g * l;
  // The previous scheme, kept here only as a control.
  const semiImplicit = (s, damp) => {
    const { a1, a2, v1, v2 } = s, sin = Math.sin, cos = Math.cos;
    const d = 2 * m1 + m2 - m2 * cos(2 * a1 - 2 * a2);
    const n1 = -g * (2 * m1 + m2) * sin(a1) - m2 * g * sin(a1 - 2 * a2)
             - 2 * sin(a1 - a2) * m2 * (v2 * v2 * l + v1 * v1 * l * cos(a1 - a2));
    const n2 = 2 * sin(a1 - a2) * (v1 * v1 * l * (m1 + m2) + g * (m1 + m2) * cos(a1) + v2 * v2 * l * m2 * cos(a1 - a2));
    s.v1 = v1 + n1 / (l * d) * h; s.v2 = v2 + n2 / (l * d) * h;
    s.a1 = a1 + s.v1 * h; s.a2 = a2 + s.v2 * h;
    s.v1 *= damp; s.v2 *= damp;
  };
  const run = (stepFn, damp, frames) => {
    const s = { a1: Math.PI / 2 + 0.6, a2: Math.PI / 2 + 0.4, v1: 0, v2: 0 };
    const E0 = energy(s);
    let worst = 0;
    for (let f = 0; f < frames; f++) {
      for (let i = 0; i < 3; i++) stepFn(s, damp);
      worst = Math.max(worst, Math.abs(energy(s) - E0));
    }
    return { worst: worst / (E0 - rest), final: (energy(s) - rest) / (E0 - rest) };
  };
  const frames = 60 * (QUICK ? 20 : 60);
  const screenStep = (s, damp) => pendulumStep(s, g, m1, m2, l, l, h, damp);
  const free = run(screenStep, 1, frames);
  const control = run(semiImplicit, 1, frames);
  const damped = run(screenStep, 0.9999, frames);
  const pass = free.worst < 0.05;
  record({
    id: 'pendulum', title: 'Double pendulum — energy conservation',
    rows: [
      ['case', 'max |ΔE| / (E₀ − E_rest)', 'energy left at the end'],
      ['RK4, undamped (on screen, damp = 1)', (free.worst * 100).toExponential(1) + ' %', (free.final * 100).toFixed(3) + ' %'],
      ['semi-implicit Euler, undamped (control: the previous scheme)', (control.worst * 100).toFixed(3) + ' %', (control.final * 100).toFixed(2) + ' %'],
      ['RK4, default damping (0.9999 per sub-step)', '—', (damped.final * 100).toFixed(2) + ' %']
    ],
    criterion: 'undamped energy error below 5 % of the available energy over the whole run',
    pass,
    verdict: `Over ${frames / 60} s the on-screen scheme keeps the undamped energy within ${(free.worst * 100).toExponential(1)} %; the previous scheme drifted ${(control.worst * 100).toFixed(1)} %. The default damping is a deliberate, declared loss.`
  });
}

/* ── 3. Kepler: conserved quantities, equal areas, closed orbits ───────────
   Leapfrog (64 fixed sub-steps per frame, as on screen) with a central force
   conserves angular momentum L = x·v_y − y·v_x
   exactly (kicks parallel to r, drifts parallel to v), so equal areas in equal
   times holds to round-off — Kepler's second law is a property of the scheme.
   Energy E = ½v² − GM/√(r²+ε²) must oscillate without secular drift, and
   Kepler's first law asks for closed ellipses: the periapsis should not
   precess. Measured on the default orbit (e = 0.55) and on a harder one
   (e = 0.8). The previous scheme is kept as a control. */
{
  const GM = 2600, r0 = 400 * 0.12;
  // The previous scheme: symplectic Euler, h = 0.5 ×2 per frame, distance + 6 px.
  const previous = b => {
    for (let s = 0; s < 2; s++) {
      const dx = -b.x, dy = -b.y, r = Math.hypot(dx, dy) + 6;
      b.vx += (dx / r) * (GM / (r * r)) * 0.5; b.vy += (dy / r) * (GM / (r * r)) * 0.5;
      b.x += b.vx * 0.5; b.y += b.vy * 0.5;
    }
  };
  const orbit = (frameFn, ecc, U, orbitsWanted) => {
  const b = { x: r0, y: 0, vx: 0, vy: Math.sqrt(GM / r0) * Math.sqrt(1 - ecc) };
  const E = () => 0.5 * (b.vx * b.vx + b.vy * b.vy) + U(Math.hypot(b.x, b.y));
  const Lm = () => b.x * b.vy - b.y * b.vx;
  const E0 = E(), L0 = Lm();
  let worstL = 0, worstE = 0, orbits = 0, prevR = Math.hypot(b.x, b.y), falling = false;
  const periAngles = [], energyByOrbit = [];
  let eSum = 0, eN = 0;
  for (let step = 0; orbits < orbitsWanted && step < 5e7; step++) {
    frameFn(b);
    const r = Math.hypot(b.x, b.y);
    worstL = Math.max(worstL, Math.abs(Lm() - L0) / Math.abs(L0));
    const e = E();
    worstE = Math.max(worstE, Math.abs(e - E0) / Math.abs(E0));
    eSum += e; eN++;
    if (r < prevR) falling = true;
    else if (falling) {                       // just passed periapsis
      falling = false; orbits++;
      periAngles.push(Math.atan2(b.y, b.x));
      energyByOrbit.push(eSum / eN); eSum = 0; eN = 0;
    }
    prevR = r;
  }
  let prec = 0;
  for (let i = 1; i < periAngles.length; i++) {
    let d = periAngles[i] - periAngles[i - 1];
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    prec += d;
  }
  prec = prec / (periAngles.length - 1) * 180 / Math.PI;
  const k = Math.min(10, Math.floor(energyByOrbit.length / 2));
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  const drift = Math.abs(mean(energyByOrbit.slice(-k)) - mean(energyByOrbit.slice(1, k + 1))) / Math.abs(E0);
  return { orbits, worstL, worstE, drift, prec };
  };

  const plummer = d => -GM / Math.sqrt(d * d + 0.25);
  const softened = d => -GM * (1 / (d + 6) - 3 / ((d + 6) * (d + 6)));
  const n = QUICK ? 60 : 400;
  const screen = orbit(b => keplerFrame(b, 0, 0, GM, null, 0), 0.55, plummer, n);
  const hard = orbit(b => keplerFrame(b, 0, 0, GM, null, 0), 0.8, plummer, n);
  const control = orbit(previous, 0.55, softened, n);
  const row = (name, s) => [name, s.worstL.toExponential(1), (s.worstE * 100).toFixed(3) + ' %', s.drift.toExponential(1), s.prec.toFixed(2) + '°'];
  const pass = [screen, hard].every(s => s.worstL < 1e-9 && s.drift < 1e-3 && Math.abs(s.prec) < 5);
  record({
    id: 'kepler', title: 'Kepler orbits — angular momentum, energy, closed orbits',
    rows: [
      ['scheme, eccentricity', 'max |ΔL|/L', 'max |ΔE|/|E|', 'secular drift', 'precession / orbit'],
      row('leapfrog, 64 sub-steps, e = 0.55 (on screen, default)', screen),
      row('leapfrog, 64 sub-steps, e = 0.80 (on screen)', hard),
      row('symplectic Euler, +6 px softening, e = 0.55 (control: previous scheme)', control)
    ],
    criterion: `over ${n} orbits: |ΔL|/L < 1e-9, secular energy drift < 1e-3, periapsis precession below 5° per orbit`,
    pass,
    verdict: `Angular momentum holds to round-off and energy oscillates without trend. The periapsis now moves ${Math.abs(screen.prec).toFixed(2)}° per orbit; the previous scheme's softening moved it ${Math.abs(control.prec).toFixed(1)}°, drawing rosettes instead of ellipses.`
  });
}

/* ── 4. Ising: spontaneous magnetisation vs the exact solution ─────────────
   Metropolis on a 64×64 periodic lattice, started ordered as on screen.
   Compared with the exact infinite-lattice result (Onsager 1944; Yang 1952):
     M(T) = [1 − sinh⁻⁴(2/T)]^(1/8)   for T < T_c = 2/ln(1+√2) ≈ 2.269
   Finite size rounds the transition, so the criterion applies away from T_c. */
{
  const N = 64, rand = mulberry32(20260915);
  const TC = 2 / Math.log(1 + Math.SQRT2);
  const exact = T => (T < TC ? Math.pow(1 - Math.pow(Math.sinh(2 / T), -4), 1 / 8) : 0);
  const temps = [1.5, 1.8, 2.0, 2.2, 2.269, 2.4, 3.0];
  const eq = QUICK ? 600 : 2000, meas = QUICK ? 1000 : 4000;
  const rows = [['T', '⟨|m|⟩ measured', 'exact M(T), N→∞', '|difference|']];
  let pass = true;
  for (const T of temps) {
    const sp = new Int8Array(N * N).fill(1);
    metropolis(sp, N, T, 0, eq * N * N, rand);
    let acc = 0;
    for (let s = 0; s < meas; s++) {
      metropolis(sp, N, T, 0, N * N, rand);
      let m = 0;
      for (let i = 0; i < sp.length; i++) m += sp[i];
      acc += Math.abs(m) / sp.length;
    }
    const mean = acc / meas, ex = exact(T), diff = Math.abs(mean - ex);
    if (T <= 2.0 && diff > 0.03) pass = false;
    if (T >= 3.0 && mean > 0.15) pass = false;
    rows.push([T.toFixed(3), mean.toFixed(4), ex.toFixed(4), diff.toFixed(4)]);
  }
  record({
    id: 'ising', title: 'Ising model — magnetisation against Onsager–Yang',
    rows,
    criterion: '|⟨|m|⟩ − M(T)| < 0.03 for T ≤ 2.0; ⟨|m|⟩ < 0.15 at T = 3.0 (finite size rounds the region near T_c)',
    pass,
    verdict: `Metropolis reproduces the exact magnetisation below T_c; near T_c the 64×64 lattice shows the expected finite-size rounding.`
  });
}

/* ── Report ── */
const failed = results.filter(r => !r.pass);
const md = [
  '# Validation results',
  '',
  `Generated by \`node validation/run.mjs${QUICK ? ' --quick' : ''}\` on ${new Date().toISOString().slice(0, 10)} with Node ${process.version}.`,
  'Every check calls the same update function the experiment runs on screen.',
  '',
  ...results.flatMap(r => [
    `## ${r.pass ? '✅' : '❌'} ${r.title}`,
    '',
    `| ${r.rows[0].join(' | ')} |`,
    `|${r.rows[0].map(() => '---').join('|')}|`,
    ...r.rows.slice(1).map(row => `| ${row.join(' | ')} |`),
    '',
    `**Criterion:** ${r.criterion}`,
    '',
    r.verdict,
    ''
  ])
].join('\n');
if (!QUICK) fs.writeFileSync(path.join(here, 'RESULTS.md'), md);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
process.exit(failed.length ? 1 : 0);
