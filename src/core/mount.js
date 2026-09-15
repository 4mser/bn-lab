/* The engine.

   An experiment is a plain object:

     {
       id, name: {en, es}, note: {en, es},
       kind?: '2d' | 'webgl',               default '2d'
       params?: [{ key, label: {en, es}, min, max, step, def, unit? }],
       pixelRatio?: number,                 cap on devicePixelRatio (default 2)
       make(w, h, env) → {
         step(ctx, w, h, t, acc, P, M, env),
         resize?(w, h, env), reset?(), destroy?(),
         fade?: number,                     paint a veil of `paper` each frame
         persist?: boolean                  never clear the canvas
       }
     }

   `P` holds the live parameter values, `M` the pointer in CSS pixels of the
   canvas ({x, y, in, down, presses}). `t` advances 0.016 per frame; frames are
   paced at ~60 fps so a 120 Hz display does not run the physics twice as fast.

   The engine owns everything that is not physics: device pixel ratio, resize,
   theme, pointer, controls, reduced motion, and not rendering what is off
   screen or in a hidden tab. */

import { setCurrentTheme } from './shared.js';
import { resolveTheme } from './theme.js';
import { buildControls } from './controls.js';

const registry = new Map();
const FRAME_MS = 1000 / 60;

function validate(def) {
  if (!def || typeof def !== 'object') throw new TypeError('phenomena: experiment must be an object');
  if (!def.id || typeof def.id !== 'string') throw new TypeError('phenomena: experiment needs a string id');
  if (typeof def.make !== 'function') throw new TypeError(`phenomena: experiment "${def.id}" needs make()`);
  for (const p of def.params || []) {
    if (!p.key || !(p.min <= p.def && p.def <= p.max)) {
      throw new RangeError(`phenomena: parameter "${p.key}" of "${def.id}" needs min <= def <= max`);
    }
  }
  return def;
}

/** Checks an experiment definition and returns it unchanged. */
export const define = def => validate(def);

/** Makes experiments mountable by id: mount(canvas, 'lorenz'). */
export function register(...defs) {
  for (const def of defs.flat()) registry.set(validate(def).id, def);
}
export const getExperiment = id => registry.get(id);
export const listExperiments = () => [...registry.values()];

/** Picks the text for a locale from an {en, es} label. */
export const label = (l, locale = 'en') => (l && typeof l === 'object' ? l[locale] ?? l.en : l);

/* Experiments write readouts with a fixed font size designed for a wide
   canvas. On a phone those lines would be cut at the right edge, so text that
   does not fit is shrunk just enough — and only when needed. */
function fitText(ctx, width) {
  const draw = ctx.fillText.bind(ctx);
  ctx.fillText = function (txt, x, y, maxWidth) {
    if (maxWidth !== undefined) return draw(txt, x, y, maxWidth);
    const room = width() - x - 8;
    if (room <= 0 || ctx.textAlign !== 'left' && ctx.textAlign !== 'start') return draw(txt, x, y);
    const need = ctx.measureText(txt).width;
    if (need <= room) return draw(txt, x, y);
    const face = /^(?:(\S+)\s+)?(\d+(?:\.\d+)?)px\s+(.+)$/.exec(ctx.font);
    const shrunk = face && parseFloat(face[2]) * (room / need);
    if (shrunk && shrunk >= 7.5) {
      const keep = ctx.font;
      ctx.font = (face[1] ? face[1] + ' ' : '') + shrunk.toFixed(2) + 'px ' + face[3];
      draw(txt, x, y);
      ctx.font = keep;
    } else {
      draw(txt, x, y, room);
    }
  };
}

/**
 * Mounts an experiment on a canvas and starts it when it becomes visible.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {object|string} experiment  definition, or the id of a registered one
 * @param {object} [options]
 * @param {'dark'|'light'|'auto'|object} [options.theme='dark']
 * @param {string|number[]} [options.accent]  overrides the theme accent
 * @param {HTMLElement} [options.controls]    element that receives sliders
 * @param {'en'|'es'} [options.locale]         defaults to <html lang>
 * @param {object} [options.params]            initial parameter values
 * @param {number} [options.pixelRatio]        cap on devicePixelRatio
 * @param {boolean} [options.autoplay=true]
 * @param {'auto'|'always'|'reduce'} [options.motion='auto']
 * @param {(error: Error) => void} [options.onError]
 */
export function mount(canvas, experiment, options = {}) {
  if (!canvas || typeof canvas.getContext !== 'function') {
    throw new TypeError('phenomena.mount: the first argument must be a <canvas>');
  }
  const def = typeof experiment === 'string' ? registry.get(experiment) : experiment;
  if (!def) throw new Error(`phenomena.mount: unknown experiment "${experiment}"`);
  validate(def);

  let opts = { ...options };
  const kind = def.kind || '2d';
  const locale = opts.locale ||
    (typeof document !== 'undefined' && /^es\b/i.test(document.documentElement.lang) ? 'es' : 'en');
  const reduce = opts.motion === 'reduce' ||
    (opts.motion !== 'always' && typeof matchMedia === 'function' &&
     matchMedia('(prefers-reduced-motion: reduce)').matches);
  const maxDpr = opts.pixelRatio ?? def.pixelRatio ?? 2;

  let theme = resolveTheme(opts);
  const P = {};
  for (const p of def.params || []) {
    const v = opts.params && opts.params[p.key];
    P[p.key] = v == null ? p.def : Math.min(p.max, Math.max(p.min, +v));
  }
  const M = { x: 0, y: 0, in: false, down: false, presses: 0 };

  const ctx = kind === '2d' ? canvas.getContext('2d') : null;
  let w = 0, h = 0, inst = null, raf = 0, t = 0, last = 0, due = 0, frame = 0;
  let dirty = true, visible = false, playing = opts.autoplay !== false;
  let destroyed = false, supported = true, controls = null;
  if (ctx) fitText(ctx, () => w);

  const env = {
    canvas, locale, reducedMotion: reduce, pixelRatio: 1, dt: 1 / 60, frame: 0,
    get theme() { return theme; }
  };

  function fail(error) {
    supported = false;
    canvas.dataset.phenomena = 'unsupported';
    canvas.dispatchEvent(new CustomEvent('phenomena:unsupported', { detail: error }));
    if (opts.onError) opts.onError(error);
    else if (error && error.code !== 'WEBGL_UNSUPPORTED') console.error(error);
  }

  function size() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const dpr = Math.min(globalThis.devicePixelRatio || 1, maxDpr);
    w = r.width; h = r.height; env.pixelRatio = dpr;
    const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
    if (canvas.width !== bw) canvas.width = bw;
    if (canvas.height !== bh) canvas.height = bh;
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    try {
      if (!inst) inst = def.make(w, h, env);
      else if (inst.resize) inst.resize(w, h, env);
    } catch (error) { fail(error); return false; }
    if (ctx && !inst.persist) ctx.clearRect(0, 0, w, h);
    return true;
  }

  function draw(now) {
    if (dirty) { if (!size()) return false; dirty = false; }
    env.dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
    last = now;
    env.frame = frame++;
    t += reduce ? 0 : 0.016;
    setCurrentTheme(theme);
    if (ctx) {
      if (inst.fade) { ctx.fillStyle = `rgba(${theme.paper},${inst.fade})`; ctx.fillRect(0, 0, w, h); }
      else if (!inst.persist) ctx.clearRect(0, 0, w, h);
    }
    try { inst.step(ctx, w, h, t, theme.accent, P, M, env); }
    catch (error) { fail(error); return false; }
    return true;
  }

  const hidden = () => typeof document !== 'undefined' && document.hidden;
  const running = () => playing && visible && supported && !destroyed && !reduce && !hidden();

  function loop(now) {
    raf = 0;
    if (!running()) return;
    raf = requestAnimationFrame(loop);
    if (now < due - 1) return;                 // pace high-refresh displays to 60 fps
    due = Math.max(due + FRAME_MS, now);
    draw(now);
  }
  function kick() {
    if (!raf && running()) { last = 0; due = 0; raf = requestAnimationFrame(loop); }
  }
  function halt() { if (raf) cancelAnimationFrame(raf); raf = 0; }

  /* Reduced motion: a still image instead of an animation. Trails need a
     number of frames to exist, so the still is taken after a short warm-up. */
  let stillTaken = false;
  function still(frames) {
    if (!reduce || !visible || destroyed || !supported) return;
    const n = frames ?? (stillTaken ? 1 : 90);
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    for (let i = 0; i < n; i++) if (!draw(now + i * FRAME_MS)) break;
    stillTaken = true;
  }

  const onMove = e => {
    const r = canvas.getBoundingClientRect();
    M.x = e.clientX - r.left; M.y = e.clientY - r.top; M.in = true;
  };
  const onDown = e => { onMove(e); M.down = true; M.presses++; };
  const onUp = () => { M.down = false; };
  const onLeave = () => { M.in = false; M.down = false; };
  canvas.addEventListener('pointermove', onMove, { passive: true });
  canvas.addEventListener('pointerdown', onDown, { passive: true });
  canvas.addEventListener('pointerup', onUp, { passive: true });
  canvas.addEventListener('pointerleave', onLeave, { passive: true });
  canvas.addEventListener('pointercancel', onLeave, { passive: true });

  const ro = typeof ResizeObserver === 'function'
    ? new ResizeObserver(() => { dirty = true; if (reduce) still(1); })
    : null;
  if (ro) ro.observe(canvas);
  else addEventListener('resize', () => { dirty = true; }, { passive: true });

  const io = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(entries => {
        for (const e of entries) visible = e.isIntersecting;
        if (visible) { if (reduce) still(); else kick(); } else halt();
      }, { rootMargin: '80px 0px', threshold: 0 })
    : null;
  if (io) io.observe(canvas); else { visible = true; }

  const onVisibility = () => (hidden() ? halt() : kick());
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility);

  let scheme = null;
  const onScheme = () => api.setTheme({});
  if (opts.theme === 'auto' && typeof matchMedia === 'function') {
    scheme = matchMedia('(prefers-color-scheme: light)');
    scheme.addEventListener('change', onScheme);
  }

  const api = {
    id: def.id,
    definition: def,
    canvas,
    params: P,
    pointer: M,
    get theme() { return theme; },
    get playing() { return playing; },
    get supported() { return supported; },

    /** Sets a parameter (clamped to its range). */
    set(key, value) {
      const p = (def.params || []).find(q => q.key === key);
      if (!p) throw new Error(`phenomena: "${def.id}" has no parameter "${key}"`);
      P[key] = Math.min(p.max, Math.max(p.min, +value));
      if (controls) controls.sync(key);
      if (reduce) still(1);
      return api;
    },
    get(key) { return P[key]; },

    /** Restarts the simulation state. Parameters keep their values. */
    reset() {
      if (!inst) return api;
      if (inst.reset) inst.reset();
      else { if (inst.destroy) inst.destroy(); inst = null; dirty = true; }
      t = 0;
      if (ctx && w) ctx.clearRect(0, 0, w, h);
      if (reduce) { stillTaken = false; still(); }
      return api;
    },
    /** Puts every parameter back to its default. */
    resetParams() {
      for (const p of def.params || []) P[p.key] = p.def;
      if (controls) controls.sync();
      return api;
    },
    play() { playing = true; kick(); return api; },
    pause() { playing = false; halt(); return api; },
    /** Advances n frames by hand, e.g. while paused. */
    step(n = 1) {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      for (let i = 0; i < n; i++) if (!draw(now + i * FRAME_MS)) break;
      return api;
    },
    /** Changes theme or accent without restarting the simulation. */
    setTheme(next) {
      opts = typeof next === 'string' ? { ...opts, theme: next } : { ...opts, ...next };
      theme = resolveTheme(opts);
      if (ctx && w) ctx.clearRect(0, 0, w, h);
      if (reduce) still(1);
      return api;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      halt();
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      if (scheme) scheme.removeEventListener('change', onScheme);
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointercancel', onLeave);
      if (controls) controls.destroy();
      if (inst && inst.destroy) inst.destroy();
      inst = null;
    }
  };

  if (opts.controls) controls = buildControls(opts.controls, def, api, locale);
  return api;
}
