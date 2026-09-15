# phenomena

**Interactive physics and mathematics that actually compute.**
Forty live simulations — chaos, waves, optics, quantum mechanics, relativity,
statistical mechanics, automata, optimisation — and a GPU Navier-Stokes fluid.
Every figure integrates its own equations in the browser. Zero dependencies,
100 KB minified for all of them, and each one importable on its own.

[Read the article](https://www.bnsolutions.cl/research/phenomena) ·
[Experiments](docs/EXPERIMENTS.md) ·
[Validation results](validation/RESULTS.md) ·
[Leer en español](README.es.md)

![The phenomena gallery](docs/assets/gallery.png)

## Why

Most interactive explanations are illustrations: an animation drawn to look
like the physics. The figures here are the physics, running. The double
pendulum integrates its Lagrangian equations of motion, the Ising model runs
Metropolis Monte Carlo, the fluid projects its velocity field onto a
divergence-free one sixty times a second. Move the cursor and you are
perturbing a live system, not scrubbing a video.

That also makes them testable. A [validation suite](#validation) calls the
exact update functions the figures run and compares them with published
results — and it found three of our own figures wrong before this release.

## Quick start

### In a page, no build step

```html
<canvas id="sim" style="width:100%;height:480px"></canvas>
<div id="controls"></div>

<script src="https://cdn.jsdelivr.net/gh/4mser/phenomena@v0.1.0/dist/phenomena.min.js"></script>
<script>
  Phenomena.mount(document.getElementById('sim'), 'lorenz', {
    controls: document.getElementById('controls')
  });
</script>
```

The browser bundle registers every experiment, so you mount by id. Add
`dist/phenomena.css` for a neutral look for the sliders, or style the
`.phen-*` classes yourself.

### With a bundler

```sh
npm install github:4mser/phenomena
```

```js
import { mount } from 'phenomena';
import fluid from 'phenomena/experiments/fluid';

const sim = mount(canvas, fluid, { theme: 'auto', accent: '#0a5cff' });
```

Each experiment is its own module, so you only ship the ones you import.

## API

### `mount(canvas, experiment, options?)`

Starts an experiment on a `<canvas>`. It sizes to the canvas's CSS box, follows
its resizes, renders only while it is on screen and the tab is visible, and
paces high-refresh displays to 60 fps so the physics runs at the same speed
everywhere.

| option | default | |
|---|---|---|
| `theme` | `'dark'` | `'dark'`, `'light'`, `'auto'` (follows `prefers-color-scheme`) or `{ mode, accent, paper, ink, core }` |
| `accent` | theme's | main drawing color: `'#0a5cff'`, `'rgb(10 92 255)'` or `[10, 92, 255]` |
| `controls` | — | element that receives one slider per parameter and a reset button |
| `locale` | `<html lang>` | `'en'` or `'es'` for labels |
| `params` | defaults | initial parameter values, clamped to their ranges |
| `pixelRatio` | `2` | cap on `devicePixelRatio` |
| `autoplay` | `true` | start when visible |
| `motion` | `'auto'` | `'reduce'` renders a still, `'always'` ignores `prefers-reduced-motion` |
| `onError` | — | called if the experiment cannot start (for WebGL, `error.code === 'WEBGL_UNSUPPORTED'`) |

It returns a handle:

```js
sim.set('rho', 32);        // clamped to the parameter's range
sim.get('rho');
sim.reset();               // restart the state, keep parameters
sim.resetParams();
sim.pause(); sim.play(); sim.step(10);
sim.setTheme('light');     // or { theme, accent }; the simulation keeps running
sim.destroy();             // removes listeners, frees GPU resources
sim.supported;             // false if it could not start
```

A canvas that cannot run its experiment gets `data-phenomena="unsupported"` and
fires a `phenomena:unsupported` event, so you can show a fallback.

### Other exports

`define(experiment)` validates a definition · `register(...experiments)` makes
them mountable by id · `getExperiment(id)`, `listExperiments()` ·
`themes`, `resolveTheme()`, `parseColor()` · `TAU`, `L(en, es)`, and the theme
inks `paper()`, `ink()`, `core()` for use inside experiments.
TypeScript declarations are included.

## Writing an experiment

An experiment is a plain object. `make` builds the state once; `step` advances
and draws one frame.

```js
import { mount, define, L, TAU } from 'phenomena';

const oscillator = define({
  id: 'damped-oscillator',
  name: L('Damped oscillator', 'Oscilador amortiguado'),
  note: L('A mass on a spring losing energy to friction.', 'Una masa en un resorte que pierde energía por roce.'),
  params: [
    { key: 'omega', label: L('Frequency ω', 'Frecuencia ω'), min: 0.5, max: 8, step: 0.1, def: 3 },
    { key: 'zeta',  label: L('Damping ζ', 'Amortiguación ζ'), min: 0, max: 1.2, step: 0.01, def: 0.08 }
  ],
  make(w, h) {
    let x = 1, v = 0;
    return {
      reset() { x = 1; v = 0; },
      step(ctx, w, h, t, acc, P, M) {
        const dt = 1 / 60;                       // semi-implicit Euler
        v += (-P.omega ** 2 * x - 2 * P.zeta * P.omega * v) * dt;
        x += v * dt;
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.beginPath(); ctx.arc(w / 2 + x * w * 0.2, h / 2, 14, 0, TAU); ctx.fill();
      }
    };
  }
});

mount(canvas, oscillator, { controls: panel });
```

`step(ctx, w, h, t, acc, P, M, env)` receives the 2D context (already scaled to
CSS pixels), the size, a time that advances 0.016 per frame, the accent as an
`"r,g,b"` string, live parameters `P`, the pointer `M = { x, y, in, down, presses }`
and `env = { theme, dt, frame, pixelRatio, reducedMotion, locale, canvas }`.
Return `fade: 0.1` to leave trails (a veil of the page color instead of a
clear) or `persist: true` to never clear. Set `kind: 'webgl'` to get the canvas
without a 2D context and create your own WebGL context from `env.canvas`.
See [`examples/custom.html`](examples/custom.html) and
[CONTRIBUTING](CONTRIBUTING.md).

## The fluid

`fluid` solves the incompressible Navier-Stokes equations on the GPU with the
stable-fluids method: semi-Lagrangian advection, a Jacobi pressure projection
and vorticity confinement, each stage a fragment shader over half-float
textures. It runs on WebGL2 or WebGL1 with half-float render targets, including
iOS. On a dark theme the dye is added as light; on a light theme the same
density is read as pigment, and a theme change blends between the two without
restarting. The solver is adapted from Pavel Dobryakov's
[WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation)
(MIT) — see [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md). It is a
two-dimensional, inviscid and numerically diffusive model: good for intuition
about advection and incompressibility, not a tool for engineering flows.

## Validation

`npm run validate` drives the exact update functions the figures run and
compares them with published or exact results. Criteria are fixed before the
run. Full output: [validation/RESULTS.md](validation/RESULTS.md).

| experiment | quantity | on screen | reference |
|---|---|---|---|
| Lorenz attractor | largest Lyapunov exponent | 0.9072 | 0.9056 (Sprott 2003) |
| Double pendulum | energy error, 60 s, undamped | < 0.001 % | 0 (Hamiltonian) |
| Kepler orbits | angular momentum drift · periapsis precession | 7e-14 · 0.38° per orbit | 0 · 0° |
| Ising model | ⟨\|m\|⟩ at T = 2.0, 64×64 lattice | 0.9113 | 0.9113 (Onsager–Yang) |

Writing these checks exposed three figures that were wrong in the lab they came
from: Lorenz ran forward Euler (λ₁ 5.8 % high), the pendulum lost 7 % of its
energy per minute to an integrator it never declared, and a distance softening
made Kepler's ellipses precess 60° per orbit. All three schemes were replaced
before release; the old ones stay in the suite as controls. Details in the
[changelog](CHANGELOG.md).

`npm test` separately runs every 2D experiment headless with default, minimum
and maximum parameters in both themes, and fails on any exception or
non-finite coordinate.

## Experiments

Forty of them, each with the model, how it is implemented, what to look at,
why it matters and primary references, in English and Spanish:
**[docs/EXPERIMENTS.md](docs/EXPERIMENTS.md)**.

A network thinking · Attention · Bell test · Brownian motion · Chladni figures ·
Collatz · Coupled oscillators · Curved spacetime · Double pendulum · Double
slit · Embedding space · Entropy · Flocking · Flow field · Fourier series ·
Gravity is geometry · Hawking radiation · How a model learns · Incompressible
fluid · Interference · Ising model · Julia set · Kepler orbits · Looking
through · Lorenz attractor · Mandelbrot set · Particle in a box · Phyllotaxis ·
Quasar · Reaction and diffusion · Rule 30 · Snell and the trapped ray · Special
relativity · Spiral galaxy · Two mouths, one plane · Ulam spiral · Voronoi ·
Wave or particle, your choice · Why light exists · Wormhole.

## Browser support

Any browser with Canvas 2D, `ResizeObserver` and `IntersectionObserver` (all
evergreen browsers since 2020). The fluid additionally needs WebGL with
renderable half-float textures; where that is missing it reports itself
unsupported instead of failing silently.

## Development

```sh
npm install
npm run build      # src/experiments/index.js + dist/
npm test
npm run validate
node scripts/docs.mjs
```

## Citing

If you use phenomena in teaching material, a paper or a talk, see
[CITATION.cff](CITATION.cff).

## License

MIT © 2026 [B&N Solutions](https://www.bnsolutions.cl), Santiago, Chile.
The fluid solver includes MIT-licensed code by Pavel Dobryakov; see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
