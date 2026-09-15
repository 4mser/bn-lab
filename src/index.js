/* phenomena — interactive physics and mathematics that actually compute.

   The core is tiny and has no dependencies. Experiments are separate modules,
   so a bundler only ships the ones you import:

     import { mount } from 'phenomena';
     import lorenz from 'phenomena/experiments/lorenz';
     mount(canvas, lorenz, { controls: panel });

   The prebuilt browser bundle (dist/phenomena.min.js) registers every
   experiment, so there you can mount by id: Phenomena.mount(canvas, 'lorenz'). */

export { mount, define, register, getExperiment, listExperiments, label } from './core/mount.js';
export { themes, resolveTheme, parseColor } from './core/theme.js';
export { TAU, L, paper, ink, core } from './core/shared.js';
export const version = '0.1.0';
