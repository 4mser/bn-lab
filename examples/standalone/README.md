# Standalone laboratory demos

The package exports 40 modular experiments through `src/experiments/`. This
directory contains the larger browser demonstrations that run as complete
pages rather than as small library definitions.

## Included collections

- `lab/` — the full interactive laboratory: chaos, waves, optics, quantum
  mechanics, relativity, neural networks, geometry, astronomy and more.
- `openpsico/` — the private psychometrics concept, including the 3D brain
  visualization in `cerebro3d.js` and the six cognitive simulations in
  `sims.js`.

The standalone pages are source demos for research, teaching, thesis figures
and scientific articles. They are intentionally kept alongside the package so
the visual work that motivated BN Lab remains reproducible and inspectable.

To view them locally from this directory, serve the repository root with any
static server and open `examples/standalone/lab/` or
`examples/standalone/openpsico/`.
