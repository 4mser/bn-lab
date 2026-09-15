/* A headless stand-in for CanvasRenderingContext2D.

   It records nothing but checks every coordinate that reaches a drawing call.
   A browser silently ignores NaN or Infinity in a path, so a simulation that
   blows up numerically can look merely "empty" on screen; here it is counted. */

const CHECKED = new Set([
  'moveTo', 'lineTo', 'arc', 'arcTo', 'ellipse', 'rect', 'fillRect', 'strokeRect', 'clearRect',
  'quadraticCurveTo', 'bezierCurveTo', 'translate', 'scale', 'setTransform', 'transform'
]);

export function createContext(canvas) {
  const stats = { calls: 0, nonFinite: 0, where: new Map() };
  const state = { font: '10px sans-serif', textAlign: 'start', globalAlpha: 1 };
  const target = {
    canvas,
    measureText: s => ({ width: String(s).length * 6, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }),
    createImageData: (w, h) => (typeof w === 'object'
      ? { width: w.width, height: w.height, data: new Uint8ClampedArray(w.width * w.height * 4) }
      : { width: w, height: h, data: new Uint8ClampedArray(Math.max(0, w * h * 4)) }),
    getImageData: (x, y, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(0, w * h * 4)) }),
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
    createConicGradient: () => ({ addColorStop() {} }),
    createPattern: () => ({}),
    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    isPointInPath: () => false,
    getLineDash: () => [],
    fillText(txt, x, y) { check('fillText', [x, y]); },
    strokeText(txt, x, y) { check('strokeText', [x, y]); },
    drawImage(img, ...args) { check('drawImage', args); }
  };
  function check(name, args) {
    stats.calls++;
    for (const a of args) {
      if (typeof a === 'number' && !Number.isFinite(a)) {
        stats.nonFinite++;
        stats.where.set(name, (stats.where.get(name) || 0) + 1);
        return;
      }
    }
  }
  const ctx = new Proxy(target, {
    get(t, key) {
      if (key in t) return t[key];
      if (key in state) return state[key];
      if (typeof key === 'string' && CHECKED.has(key)) return (...args) => check(key, args);
      return typeof key === 'string' && /^[a-z]/.test(key) && !/Style$|^line|^global|^shadow|^font|^text|^image|^filter|^direction|^letter|^word/.test(key)
        ? () => {}
        : undefined;
    },
    set(t, key, value) { state[key] = value; return true; }
  });
  return { ctx, stats };
}

export function createCanvas(width = 300, height = 150) {
  const canvas = { width, height };
  canvas.getContext = () => createContext(canvas).ctx;
  return canvas;
}

/* Minimal globals some experiments touch: offscreen canvases and ImageData. */
export function installGlobals() {
  globalThis.document ??= { createElement: tag => (tag === 'canvas' ? createCanvas() : {}) };
  globalThis.ImageData ??= class ImageData {
    constructor(a, b, c) {
      if (a instanceof Uint8ClampedArray) { this.data = a; this.width = b; this.height = c ?? a.length / 4 / b; }
      else { this.width = a; this.height = b; this.data = new Uint8ClampedArray(a * b * 4); }
    }
  };
}
