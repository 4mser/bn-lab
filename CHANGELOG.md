# Changelog

## 0.1.0 — 2026-09-15

First public release.

- **Engine.** `mount()` for Canvas 2D and WebGL experiments: device-pixel-ratio
  handling, `ResizeObserver`, rendering only while on screen and in a visible
  tab, 60 fps pacing on high-refresh displays, reduced-motion stills, pointer
  input, dark / light / auto themes with a custom accent, bilingual controls
  panel, and `destroy()` that releases every listener and GPU resource.
- **40 experiments** across chaos, waves, optics, quantum mechanics, special
  and general relativity, astrophysics, statistical mechanics, automata,
  number theory, geometry and machine learning.
- **GPU fluid.** Stable-fluids Navier-Stokes solver in WebGL (adapted from
  Pavel Dobryakov's WebGL-Fluid-Simulation, MIT) that renders as light on dark
  themes and as pigment on light themes.
- **Validation suite** (`npm run validate`) that checks the exact on-screen
  update functions against published and exact results.

### Found by the validation suite before release

These experiments come from the B&N Solutions lab, where they ran with simpler
integrators. Writing the checks exposed three of them, and the schemes were
replaced before publishing:

- **Lorenz attractor.** Forward Euler at dt = 0.005 measured a largest
  Lyapunov exponent of 0.958 against the published 0.9056 (5.8 % high).
  Now RK4 at the same step: 0.907 (0.18 %).
- **Double pendulum.** Semi-implicit Euler lost 7 % of the available energy in
  a minute with damping off, an undeclared friction. Now RK4 at the same step:
  below 0.001 %.
- **Kepler orbits.** A +6 px distance softening precessed the default orbit by
  60° per revolution, drawing rosettes instead of ellipses. Now leapfrog with
  64 sub-steps per frame and a 0.5 px Plummer softening: under half a degree.
  A distance-adaptive variant was tried and rejected because it broke time
  symmetry and drifted 5 % in energy over 400 orbits.
