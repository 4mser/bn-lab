# Contributing

Thanks for wanting to add to BN Lab. The bar for an experiment is simple to
state and hard to meet: **the figure has to compute what it shows.** If a
picture could be drawn without solving anything, it does not belong here.

## Setup

```sh
git clone https://github.com/4mser/bn-lab.git
cd bn-lab
npm install
npm run build      # regenerates src/experiments/index.js and dist/
npm test           # headless run of every experiment + core tests
npm run validate   # numerical checks against published results
```

Open `examples/index.html` through any static server (for example
`python3 -m http.server`) to see the gallery.

## Adding an experiment

1. Create `src/experiments/<id>.js` exporting a default object:

   ```js
   import { L, TAU } from '../core/shared.js';

   export default {
     id: 'my-experiment',
     name: L('English name', 'Nombre en español'),
     note: L('One sentence on what it shows.', 'Una frase sobre lo que muestra.'),
     params: [{ key: 'k', label: L('Stiffness', 'Rigidez'), min: 0, max: 10, step: 0.1, def: 2 }],
     make(w, h, env) {
       // state lives in this closure
       return {
         step(ctx, w, h, t, acc, P, M, env) { /* integrate, then draw */ },
         reset() {}
       };
     }
   };
   ```

2. Run `npm run build` so it is registered, then `npm test`. The headless test
   runs it with default, minimum and maximum parameters in both themes and fails
   on any exception or non-finite coordinate.
3. Add its long-form text to `docs/content/lab-content.cjs` (or `OVERRIDES` in
   `scripts/docs.mjs`) and its primary references to `REFERENCES`, then run
   `node scripts/docs.mjs`.

### House rules

- **No dependencies.** Canvas 2D or WebGL and mathematics.
- **Say which integrator you use and why**, in a comment next to it. If the
  scheme has a known bias (energy drift, numerical diffusion, finite size),
  say so in the docs rather than hoping nobody notices.
- **Export the update function** when the physics has a checkable invariant or
  a known result, and add a check to `validation/run.mjs`. Criteria are written
  before the run and never loosened to make a check pass. If a check fails, fix
  the scheme or document the limitation.
- **Colors come from the theme.** Use `acc` for the accent and `ink()`, `core()`
  and `paper()` for neutrals, never literal white or black, so the experiment
  works on light pages.
- **Bilingual labels.** English and Spanish for `name`, `note` and every
  parameter label.
- **Cite primary sources.** Journal, volume, year and pages you have checked.

## Pull requests

Keep them focused: one experiment or one fix. Describe what the figure computes
and, if you touched a scheme, paste the before/after output of
`npm run validate`.

By contributing you agree that your contribution is licensed under the MIT
License of this repository.
