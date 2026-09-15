/* Helpers that experiments import.

   Colors are handed to experiments as "r,g,b" strings so they can be dropped
   straight into `rgba(${c},alpha)`. The accent arrives as the `acc` argument
   of step(); the neutral inks below depend on the theme of the mount that is
   currently drawing. The engine sets that theme synchronously right before
   calling step(), so several mounts with different themes can share a page. */

export const TAU = Math.PI * 2;

/* Bilingual label: { en, es }. Experiments ship English and Spanish text. */
export const L = (en, es) => ({ en, es });

let current = null;

/** @internal — called by the engine before every step(). */
export function setCurrentTheme(theme) { current = theme; }

const pick = (key, dark, light) => () =>
  current ? current[key] : dark;

/* Paper: the page background. Used for trail veils. */
export const paper = pick('paper', '0,0,0');
/* Ink: neutral foreground (white on dark, deep navy on light). */
export const ink = pick('ink', '235,238,245');
/* Core: the strongest highlight (pure white on dark, near-black on light). */
export const core = pick('core', '255,255,255');
