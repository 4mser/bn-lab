/* Themes.

   A canvas does not inherit CSS, so colors are resolved once here and handed
   to experiments as "r,g,b" strings. A theme has five slots:

     mode    'dark' | 'light'
     accent  the main drawing color            (step's `acc` argument)
     paper   the background, used by trail veils
     ink     neutral foreground
     core    strongest highlight

   Experiments that leave trails do not clear the canvas: they paint a
   translucent veil of `paper` every frame. That is why the paper color must
   match what is behind the canvas — on a light page a black veil would
   slowly darken the whole figure. */

export const themes = Object.freeze({
  dark: Object.freeze({ mode: 'dark', accent: '232,234,238', paper: '0,0,0', ink: '235,238,245', core: '255,255,255' }),
  light: Object.freeze({ mode: 'light', accent: '20,30,52', paper: '247,249,252', ink: '20,30,52', core: '8,13,24' })
});

/** Parses '#0a5cff', '#fff', 'rgb(10 92 255)', '10,92,255' or [10,92,255] into "r,g,b". */
export function parseColor(value) {
  if (value == null) return null;
  if (Array.isArray(value)) return value.slice(0, 3).map(n => Math.round(+n)).join(',');
  const s = String(value).trim();
  let m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
  if (m) {
    const hex = m[1].length === 3 ? m[1].replace(/./g, c => c + c) : m[1];
    return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)).join(',');
  }
  m = /^(?:rgba?\()?\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)/i.exec(s);
  if (m) return [m[1], m[2], m[3]].map(n => Math.round(+n)).join(',');
  throw new TypeError(`BN Lab: cannot parse color "${value}"`);
}

const prefersLight = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: light)').matches;

/**
 * Resolves mount options into a concrete theme.
 * `theme` may be 'dark', 'light', 'auto' (follows prefers-color-scheme) or an
 * object with any of the five slots; `accent` is a shortcut that overrides
 * only the accent.
 */
export function resolveTheme({ theme = 'dark', accent } = {}) {
  let base;
  if (theme && typeof theme === 'object') {
    const mode = theme.mode === 'light' ? 'light' : 'dark';
    base = { ...themes[mode] };
    for (const k of ['accent', 'paper', 'ink', 'core']) if (theme[k] != null) base[k] = parseColor(theme[k]);
    base.mode = mode;
  } else {
    const mode = theme === 'auto' ? (prefersLight() ? 'light' : 'dark') : theme === 'light' ? 'light' : 'dark';
    base = { ...themes[mode] };
  }
  if (accent != null) base.accent = parseColor(accent);
  return Object.freeze(base);
}
