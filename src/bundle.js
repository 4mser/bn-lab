/* Entry point of the browser bundle: the core plus every experiment,
   registered so they can be mounted by id. Exposed as window.BNLab. */

import { register } from './core/mount.js';
import { experiments } from './experiments/index.js';

register(experiments);

export * from './index.js';
export { experiments };
