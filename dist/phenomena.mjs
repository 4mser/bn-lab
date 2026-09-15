/*! phenomena v0.1.0 | MIT License | https://www.bnsolutions.cl/research/phenomena */

// src/core/shared.js
var TAU = Math.PI * 2;
var L = (en, es) => ({ en, es });
var current = null;
function setCurrentTheme(theme) {
  current = theme;
}
var pick = (key, dark, light) => () => current ? current[key] : dark;
var paper = pick("paper", "0,0,0");
var ink = pick("ink", "235,238,245");
var core = pick("core", "255,255,255");

// src/core/theme.js
var themes = Object.freeze({
  dark: Object.freeze({ mode: "dark", accent: "232,234,238", paper: "0,0,0", ink: "235,238,245", core: "255,255,255" }),
  light: Object.freeze({ mode: "light", accent: "20,30,52", paper: "247,249,252", ink: "20,30,52", core: "8,13,24" })
});
function parseColor(value) {
  if (value == null) return null;
  if (Array.isArray(value)) return value.slice(0, 3).map((n) => Math.round(+n)).join(",");
  const s = String(value).trim();
  let m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
  if (m) {
    const hex = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",");
  }
  m = /^(?:rgba?\()?\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)/i.exec(s);
  if (m) return [m[1], m[2], m[3]].map((n) => Math.round(+n)).join(",");
  throw new TypeError(`phenomena: cannot parse color "${value}"`);
}
var prefersLight = () => typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: light)").matches;
function resolveTheme({ theme = "dark", accent } = {}) {
  let base;
  if (theme && typeof theme === "object") {
    const mode = theme.mode === "light" ? "light" : "dark";
    base = { ...themes[mode] };
    for (const k of ["accent", "paper", "ink", "core"]) if (theme[k] != null) base[k] = parseColor(theme[k]);
    base.mode = mode;
  } else {
    const mode = theme === "auto" ? prefersLight() ? "light" : "dark" : theme === "light" ? "light" : "dark";
    base = { ...themes[mode] };
  }
  if (accent != null) base.accent = parseColor(accent);
  return Object.freeze(base);
}

// src/core/controls.js
var decimals = (step) => (String(step).split(".")[1] || "").length;
function buildControls(host, def, api, locale = "en") {
  var _a, _b;
  const params = def.params || [];
  host.textContent = "";
  host.classList.add("phen-controls");
  if (!params.length) return { sync() {
  }, destroy() {
    host.textContent = "";
  } };
  const rows = /* @__PURE__ */ new Map();
  const text = (l) => {
    var _a2;
    return l && typeof l === "object" ? (_a2 = l[locale]) != null ? _a2 : l.en : l;
  };
  for (const p of params) {
    const row = document.createElement("label");
    row.className = "phen-ctl";
    const name = document.createElement("span");
    name.className = "phen-ctl-label";
    name.textContent = (_a = text(p.label)) != null ? _a : p.key;
    const input = document.createElement("input");
    input.type = "range";
    input.min = p.min;
    input.max = p.max;
    input.step = (_b = p.step) != null ? _b : "any";
    input.value = api.params[p.key];
    const out = document.createElement("output");
    out.className = "phen-ctl-value";
    const fmt = (v) => (p.step && p.step < 1 ? Number(v).toFixed(decimals(p.step)) : String(v)) + (p.unit || "");
    out.textContent = fmt(api.params[p.key]);
    input.addEventListener("input", () => {
      api.set(p.key, +input.value);
    });
    row.append(name, input, out);
    host.appendChild(row);
    rows.set(p.key, { input, out, fmt });
  }
  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "phen-reset";
  reset.textContent = locale === "es" ? "Reiniciar" : "Reset";
  reset.addEventListener("click", () => {
    api.resetParams();
    api.reset();
  });
  host.appendChild(reset);
  return {
    sync(key) {
      for (const [k, r] of rows) {
        if (key && k !== key) continue;
        r.input.value = api.params[k];
        r.out.textContent = r.fmt(api.params[k]);
      }
    },
    destroy() {
      host.textContent = "";
      host.classList.remove("phen-controls");
    }
  };
}

// src/core/mount.js
var registry = /* @__PURE__ */ new Map();
var FRAME_MS = 1e3 / 60;
function validate(def) {
  if (!def || typeof def !== "object") throw new TypeError("phenomena: experiment must be an object");
  if (!def.id || typeof def.id !== "string") throw new TypeError("phenomena: experiment needs a string id");
  if (typeof def.make !== "function") throw new TypeError(`phenomena: experiment "${def.id}" needs make()`);
  for (const p of def.params || []) {
    if (!p.key || !(p.min <= p.def && p.def <= p.max)) {
      throw new RangeError(`phenomena: parameter "${p.key}" of "${def.id}" needs min <= def <= max`);
    }
  }
  return def;
}
var define = (def) => validate(def);
function register(...defs) {
  for (const def of defs.flat()) registry.set(validate(def).id, def);
}
var getExperiment = (id) => registry.get(id);
var listExperiments = () => [...registry.values()];
var label = (l, locale = "en") => {
  var _a;
  return l && typeof l === "object" ? (_a = l[locale]) != null ? _a : l.en : l;
};
function fitText(ctx, width) {
  const draw = ctx.fillText.bind(ctx);
  ctx.fillText = function(txt, x, y, maxWidth) {
    if (maxWidth !== void 0) return draw(txt, x, y, maxWidth);
    const room = width() - x - 8;
    if (room <= 0 || ctx.textAlign !== "left" && ctx.textAlign !== "start") return draw(txt, x, y);
    const need = ctx.measureText(txt).width;
    if (need <= room) return draw(txt, x, y);
    const face = /^(?:(\S+)\s+)?(\d+(?:\.\d+)?)px\s+(.+)$/.exec(ctx.font);
    const shrunk = face && parseFloat(face[2]) * (room / need);
    if (shrunk && shrunk >= 7.5) {
      const keep = ctx.font;
      ctx.font = (face[1] ? face[1] + " " : "") + shrunk.toFixed(2) + "px " + face[3];
      draw(txt, x, y);
      ctx.font = keep;
    } else {
      draw(txt, x, y, room);
    }
  };
}
function mount(canvas, experiment, options = {}) {
  var _a, _b;
  if (!canvas || typeof canvas.getContext !== "function") {
    throw new TypeError("phenomena.mount: the first argument must be a <canvas>");
  }
  const def = typeof experiment === "string" ? registry.get(experiment) : experiment;
  if (!def) throw new Error(`phenomena.mount: unknown experiment "${experiment}"`);
  validate(def);
  let opts = { ...options };
  const kind = def.kind || "2d";
  const locale = opts.locale || (typeof document !== "undefined" && /^es\b/i.test(document.documentElement.lang) ? "es" : "en");
  const reduce = opts.motion === "reduce" || opts.motion !== "always" && typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const maxDpr = (_b = (_a = opts.pixelRatio) != null ? _a : def.pixelRatio) != null ? _b : 2;
  let theme = resolveTheme(opts);
  const P = {};
  for (const p of def.params || []) {
    const v = opts.params && opts.params[p.key];
    P[p.key] = v == null ? p.def : Math.min(p.max, Math.max(p.min, +v));
  }
  const M = { x: 0, y: 0, in: false, down: false, presses: 0 };
  const ctx = kind === "2d" ? canvas.getContext("2d") : null;
  let w = 0, h = 0, inst = null, raf = 0, t = 0, last = 0, due = 0, frame = 0;
  let dirty = true, visible = false, playing = opts.autoplay !== false;
  let destroyed = false, supported = true, controls = null;
  if (ctx) fitText(ctx, () => w);
  const env = {
    canvas,
    locale,
    reducedMotion: reduce,
    pixelRatio: 1,
    dt: 1 / 60,
    frame: 0,
    get theme() {
      return theme;
    }
  };
  function fail(error) {
    supported = false;
    canvas.dataset.phenomena = "unsupported";
    canvas.dispatchEvent(new CustomEvent("phenomena:unsupported", { detail: error }));
    if (opts.onError) opts.onError(error);
    else if (error && error.code !== "WEBGL_UNSUPPORTED") console.error(error);
  }
  function size() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const dpr = Math.min(globalThis.devicePixelRatio || 1, maxDpr);
    w = r.width;
    h = r.height;
    env.pixelRatio = dpr;
    const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
    if (canvas.width !== bw) canvas.width = bw;
    if (canvas.height !== bh) canvas.height = bh;
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    try {
      if (!inst) inst = def.make(w, h, env);
      else if (inst.resize) inst.resize(w, h, env);
    } catch (error) {
      fail(error);
      return false;
    }
    if (ctx && !inst.persist) ctx.clearRect(0, 0, w, h);
    return true;
  }
  function draw(now) {
    if (dirty) {
      if (!size()) return false;
      dirty = false;
    }
    env.dt = last ? Math.min((now - last) / 1e3, 1 / 20) : 1 / 60;
    last = now;
    env.frame = frame++;
    t += reduce ? 0 : 0.016;
    setCurrentTheme(theme);
    if (ctx) {
      if (inst.fade) {
        ctx.fillStyle = `rgba(${theme.paper},${inst.fade})`;
        ctx.fillRect(0, 0, w, h);
      } else if (!inst.persist) ctx.clearRect(0, 0, w, h);
    }
    try {
      inst.step(ctx, w, h, t, theme.accent, P, M, env);
    } catch (error) {
      fail(error);
      return false;
    }
    return true;
  }
  const hidden = () => typeof document !== "undefined" && document.hidden;
  const running = () => playing && visible && supported && !destroyed && !reduce && !hidden();
  function loop(now) {
    raf = 0;
    if (!running()) return;
    raf = requestAnimationFrame(loop);
    if (now < due - 1) return;
    due = Math.max(due + FRAME_MS, now);
    draw(now);
  }
  function kick() {
    if (!raf && running()) {
      last = 0;
      due = 0;
      raf = requestAnimationFrame(loop);
    }
  }
  function halt() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  let stillTaken = false;
  function still(frames) {
    if (!reduce || !visible || destroyed || !supported) return;
    const n = frames != null ? frames : stillTaken ? 1 : 90;
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    for (let i = 0; i < n; i++) if (!draw(now + i * FRAME_MS)) break;
    stillTaken = true;
  }
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    M.x = e.clientX - r.left;
    M.y = e.clientY - r.top;
    M.in = true;
  };
  const onDown = (e) => {
    onMove(e);
    M.down = true;
    M.presses++;
  };
  const onUp = () => {
    M.down = false;
  };
  const onLeave = () => {
    M.in = false;
    M.down = false;
  };
  canvas.addEventListener("pointermove", onMove, { passive: true });
  canvas.addEventListener("pointerdown", onDown, { passive: true });
  canvas.addEventListener("pointerup", onUp, { passive: true });
  canvas.addEventListener("pointerleave", onLeave, { passive: true });
  canvas.addEventListener("pointercancel", onLeave, { passive: true });
  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => {
    dirty = true;
    if (reduce) still(1);
  }) : null;
  if (ro) ro.observe(canvas);
  else addEventListener("resize", () => {
    dirty = true;
  }, { passive: true });
  const io = typeof IntersectionObserver === "function" ? new IntersectionObserver((entries) => {
    for (const e of entries) visible = e.isIntersecting;
    if (visible) {
      if (reduce) still();
      else kick();
    } else halt();
  }, { rootMargin: "80px 0px", threshold: 0 }) : null;
  if (io) io.observe(canvas);
  else {
    visible = true;
  }
  const onVisibility = () => hidden() ? halt() : kick();
  if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisibility);
  let scheme = null;
  const onScheme = () => api.setTheme({});
  if (opts.theme === "auto" && typeof matchMedia === "function") {
    scheme = matchMedia("(prefers-color-scheme: light)");
    scheme.addEventListener("change", onScheme);
  }
  const api = {
    id: def.id,
    definition: def,
    canvas,
    params: P,
    pointer: M,
    get theme() {
      return theme;
    },
    get playing() {
      return playing;
    },
    get supported() {
      return supported;
    },
    /** Sets a parameter (clamped to its range). */
    set(key, value) {
      const p = (def.params || []).find((q) => q.key === key);
      if (!p) throw new Error(`phenomena: "${def.id}" has no parameter "${key}"`);
      P[key] = Math.min(p.max, Math.max(p.min, +value));
      if (controls) controls.sync(key);
      if (reduce) still(1);
      return api;
    },
    get(key) {
      return P[key];
    },
    /** Restarts the simulation state. Parameters keep their values. */
    reset() {
      if (!inst) return api;
      if (inst.reset) inst.reset();
      else {
        if (inst.destroy) inst.destroy();
        inst = null;
        dirty = true;
      }
      t = 0;
      if (ctx && w) ctx.clearRect(0, 0, w, h);
      if (reduce) {
        stillTaken = false;
        still();
      }
      return api;
    },
    /** Puts every parameter back to its default. */
    resetParams() {
      for (const p of def.params || []) P[p.key] = p.def;
      if (controls) controls.sync();
      return api;
    },
    play() {
      playing = true;
      kick();
      return api;
    },
    pause() {
      playing = false;
      halt();
      return api;
    },
    /** Advances n frames by hand, e.g. while paused. */
    step(n = 1) {
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      for (let i = 0; i < n; i++) if (!draw(now + i * FRAME_MS)) break;
      return api;
    },
    /** Changes theme or accent without restarting the simulation. */
    setTheme(next) {
      opts = typeof next === "string" ? { ...opts, theme: next } : { ...opts, ...next };
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
      if (scheme) scheme.removeEventListener("change", onScheme);
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
      if (controls) controls.destroy();
      if (inst && inst.destroy) inst.destroy();
      inst = null;
    }
  };
  if (opts.controls) controls = buildControls(opts.controls, def, api, locale);
  return api;
}

// src/experiments/attention.js
var attention_default = {
  id: "attention",
  name: L("Attention", "Atenci\xF3n"),
  note: L(
    "What a transformer does to a sentence: every word weighs every other one.",
    "Lo que un transformer le hace a una frase: cada palabra pesa a todas las dem\xE1s."
  ),
  params: [
    { key: "temp", label: L("Softmax sharpness", "Nitidez del softmax"), min: 0.2, max: 4, step: 0.05, def: 1 },
    { key: "head", label: L("Head", "Cabeza"), min: 0, max: 3, step: 1, def: 0 },
    { key: "row", label: L("Focus token", "Token en foco"), min: -1, max: 9, step: 1, def: -1 }
  ],
  make() {
    const TOK = ["the", "cat", "sat", "on", "the", "mat", "because", "it", "was", "tired"];
    const E = [
      [0.2, 0.2, 0.1, 0.3],
      [2.4, 0.1, 0.2, 0.6],
      [0.3, 0.2, 2.3, 0.2],
      [0.1, 0.8, 0.5, 0.1],
      [0.2, 0.2, 0.1, 0.3],
      [0.2, 2.4, 0.1, 0.5],
      [0.1, 0.1, 0.5, 1],
      [1.6, 0.5, 0.1, 2.2],
      [0.2, 0.1, 1.3, 0.5],
      [1.4, 0.1, 0.9, 0.3]
    ];
    const HEAD = [
      [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]],
      [[0, 0, 0, 1], [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]],
      [[0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1], [1, 0, 0, 0]],
      [[1, 0, 0, 1], [0, 1, 1, 0], [1, 0, 1, 0], [0, 1, 0, 1]]
    ];
    return {
      step(ctx, w, h, t, acc, P, M) {
        const n = TOK.length, W = HEAD[P.head | 0];
        const proj = (v) => W.map((r) => r.reduce((a, x, i) => a + x * v[i], 0));
        const Q = E.map(proj), K = E.map(proj);
        const A = Q.map((q) => {
          const sc = K.map((k) => k.reduce((a, x, i) => a + x * q[i], 0) / Math.sqrt(4) / P.temp);
          const mx = Math.max(...sc), ex = sc.map((v) => Math.exp(v - mx));
          const sum = ex.reduce((a, b) => a + b, 0);
          return ex.map((v) => v / sum);
        });
        const focus = M.in ? Math.min(n - 1, Math.floor(M.y / h * n)) : P.row | 0;
        const gy = h * 0.14, gx = w * 0.3, cell = Math.min(w * 0.42 / n, h * 0.62 / n);
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            const a = A[i][j];
            const on = focus < 0 || focus === i;
            ctx.fillStyle = `rgba(${acc},${(a * (on ? 0.95 : 0.12)).toFixed(3)})`;
            ctx.fillRect(gx + j * cell, gy + i * cell, cell - 1, cell - 1);
          }
        }
        ctx.strokeStyle = `rgba(${acc},0.2)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(gx, gy, cell * n, cell * n);
        ctx.font = "11px monospace";
        for (let i = 0; i < n; i++) {
          const on = focus < 0 || focus === i;
          ctx.fillStyle = `rgba(${acc},${on ? 0.95 : 0.35})`;
          ctx.textAlign = "right";
          ctx.fillText(TOK[i], gx - 8, gy + i * cell + cell * 0.7);
          ctx.textAlign = "left";
          ctx.save();
          ctx.translate(gx + i * cell + cell * 0.7, gy - 10);
          ctx.rotate(-Math.PI / 4);
          ctx.fillStyle = `rgba(${acc},0.6)`;
          ctx.fillText(TOK[i], 0, 0);
          ctx.restore();
        }
        ctx.textAlign = "left";
        if (focus >= 0) {
          const by = gy + cell * n + h * 0.1, bx = gx;
          for (let j = 0; j < n; j++) {
            const a = A[focus][j];
            if (a < 0.02) continue;
            const x1 = bx + focus * cell + cell / 2, x2 = bx + j * cell + cell / 2;
            ctx.strokeStyle = `rgba(${acc},${Math.min(0.9, a * 1.6).toFixed(3)})`;
            ctx.lineWidth = 0.5 + a * 5;
            ctx.beginPath();
            ctx.moveTo(x1, by);
            ctx.quadraticCurveTo((x1 + x2) / 2, by - Math.abs(x2 - x1) * 0.45 - 12, x2, by);
            ctx.stroke();
          }
          for (let j = 0; j < n; j++) {
            ctx.fillStyle = `rgba(${acc},${j === focus ? 1 : 0.5})`;
            ctx.font = "11px monospace";
            ctx.fillText(TOK[j], bx + j * cell + 2, by + 16);
          }
        }
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("A = softmax(Q\xB7K\u1D40 / \u221Ad)      rows are queries, columns are keys", 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText("head " + (P.head | 0) + "   sharpness " + P.temp.toFixed(2) + (focus >= 0 ? '   focus: "' + TOK[focus] + '"' : "   (hover a row)"), 12, h - 12);
      }
    };
  }
};

// src/experiments/boids.js
var boids_default = {
  id: "boids",
  name: L("Flocking", "Bandada"),
  note: L(
    "Three local rules and no leader. The flock is not in any of the birds.",
    "Tres reglas locales y ning\xFAn l\xEDder. La bandada no est\xE1 en ninguno de los p\xE1jaros."
  ),
  params: [
    { key: "sep", label: L("Separation", "Separaci\xF3n"), min: 0, max: 3, step: 0.05, def: 1.4 },
    { key: "ali", label: L("Alignment", "Alineaci\xF3n"), min: 0, max: 3, step: 0.05, def: 1 },
    { key: "coh", label: L("Cohesion", "Cohesi\xF3n"), min: 0, max: 3, step: 0.05, def: 0.9 }
  ],
  make(w, h) {
    let B = [];
    const seed = (w2, h2) => {
      B = [];
      for (let i = 0; i < 220; i++) {
        const a = Math.random() * TAU;
        B.push({
          x: Math.random() * w2,
          y: Math.random() * h2,
          vx: Math.cos(a) * 2,
          vy: Math.sin(a) * 2
        });
      }
    };
    seed(w, h);
    return {
      resize(w2, h2) {
        seed(w2, h2);
      },
      reset() {
        seed(w, h);
      },
      step(ctx, w2, h2, t, acc, P, M) {
        const R = 46, RS = 20;
        for (const b of B) {
          let cx = 0, cy = 0, ax = 0, ay = 0, sx = 0, sy = 0, n = 0;
          for (const o of B) {
            if (o === b) continue;
            const dx = o.x - b.x, dy = o.y - b.y, d2 = dx * dx + dy * dy;
            if (d2 > R * R) continue;
            n++;
            cx += o.x;
            cy += o.y;
            ax += o.vx;
            ay += o.vy;
            if (d2 < RS * RS) {
              const d = Math.sqrt(d2) + 0.01;
              sx -= dx / d;
              sy -= dy / d;
            }
          }
          if (n) {
            cx = cx / n - b.x;
            cy = cy / n - b.y;
            ax = ax / n - b.vx;
            ay = ay / n - b.vy;
            const norm = (x, y) => {
              const d = Math.hypot(x, y) || 1;
              return [x / d, y / d];
            };
            const [c1, c2] = norm(cx, cy), [a1, a2] = norm(ax, ay), [s1, s2] = norm(sx, sy);
            b.vx += c1 * P.coh * 0.05 + a1 * P.ali * 0.09 + s1 * P.sep * 0.13;
            b.vy += c2 * P.coh * 0.05 + a2 * P.ali * 0.09 + s2 * P.sep * 0.13;
          }
          if (M.in) {
            const dx = b.x - M.x, dy = b.y - M.y, d = Math.hypot(dx, dy) + 1;
            if (d < 130) {
              const g = (1 - d / 130) * 0.8;
              b.vx += dx / d * g;
              b.vy += dy / d * g;
            }
          }
          const sp = Math.hypot(b.vx, b.vy) || 1;
          const cap = 2.6;
          b.vx = b.vx / sp * cap;
          b.vy = b.vy / sp * cap;
          b.x = (b.x + b.vx + w2) % w2;
          b.y = (b.y + b.vy + h2) % h2;
        }
        for (const b of B) {
          const a = Math.atan2(b.vy, b.vx);
          ctx.fillStyle = `rgba(${acc},0.9)`;
          ctx.beginPath();
          ctx.moveTo(b.x + Math.cos(a) * 5, b.y + Math.sin(a) * 5);
          ctx.lineTo(b.x + Math.cos(a + 2.5) * 3.4, b.y + Math.sin(a + 2.5) * 3.4);
          ctx.lineTo(b.x + Math.cos(a - 2.5) * 3.4, b.y + Math.sin(a - 2.5) * 3.4);
          ctx.closePath();
          ctx.fill();
        }
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("separation \xB7 alignment \xB7 cohesion \u2014 each one looks only at its neighbours", 12, h2 - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText(B.length + " birds   sep " + P.sep.toFixed(2) + "   ali " + P.ali.toFixed(2) + "   coh " + P.coh.toFixed(2), 12, h2 - 12);
      }
    };
  }
};

// src/experiments/brownian.js
var brownian_default = {
  id: "brownian",
  name: L("Brownian motion", "Movimiento browniano"),
  note: L(
    "Einstein 1905: the jitter that proved atoms are real.",
    "Einstein 1905: el temblor que demostr\xF3 que los \xE1tomos existen."
  ),
  params: [
    { key: "jump", label: L("Step size", "Tama\xF1o del paso"), min: 1, max: 18, step: 0.5, def: 6 },
    { key: "walkers", label: L("Walkers", "Caminantes"), min: 1, max: 14, step: 1, def: 6 },
    { key: "drift", label: L("Cursor drift", "Deriva al cursor"), min: 0, max: 2, step: 0.05, def: 0.5 }
  ],
  make(w, h) {
    let W = [];
    const fit = (n, w2, h2) => {
      while (W.length < n) W.push({ x: w2 / 2, y: h2 / 2, p: [] });
      if (W.length > n) W.length = n;
    };
    return {
      resize(w2, h2) {
        W.forEach((k) => {
          k.x = w2 / 2;
          k.y = h2 / 2;
          k.p.length = 0;
        });
      },
      reset() {
        W = [];
      },
      step(ctx, w2, h2, t, acc, P, M) {
        fit(P.walkers | 0, w2, h2);
        for (const k of W) {
          for (let i = 0; i < 3; i++) {
            k.x += (Math.random() - 0.5) * P.jump;
            k.y += (Math.random() - 0.5) * P.jump;
            if (M.in && P.drift) {
              const dx = M.x - k.x, dy = M.y - k.y, d = Math.hypot(dx, dy) + 1;
              k.x += dx / d * P.drift;
              k.y += dy / d * P.drift;
            }
            k.x = Math.max(4, Math.min(w2 - 4, k.x));
            k.y = Math.max(4, Math.min(h2 - 4, k.y));
            k.p.push([k.x, k.y]);
          }
          if (k.p.length > 520) k.p.splice(0, k.p.length - 520);
          ctx.lineWidth = 1;
          for (let i = 1; i < k.p.length; i++) {
            ctx.strokeStyle = `rgba(${acc},${(i / k.p.length * 0.55).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(k.p[i - 1][0], k.p[i - 1][1]);
            ctx.lineTo(k.p[i][0], k.p[i][1]);
            ctx.stroke();
          }
          ctx.fillStyle = `rgba(${acc},0.9)`;
          ctx.beginPath();
          ctx.arc(k.x, k.y, 2.2, 0, TAU);
          ctx.fill();
        }
      }
    };
  }
};

// src/experiments/chladni.js
var chladni_default = {
  id: "chladni",
  name: L("Chladni figures", "Figuras de Chladni"),
  note: L(
    "Sand on a vibrating plate walks off the loud parts and piles on the silent ones.",
    "La arena sobre una placa que vibra huye de lo que suena y se apila en lo callado."
  ),
  params: [
    { key: "m", label: L("Mode m", "Modo m"), min: 1, max: 9, step: 1, def: 3 },
    { key: "n", label: L("Mode n", "Modo n"), min: 1, max: 9, step: 1, def: 5 },
    { key: "grain", label: L("Grains", "Granos"), min: 400, max: 6e3, step: 100, def: 2600 }
  ],
  make(w, h) {
    let g = [], K = 0;
    const seed = (n, w2, h2) => {
      g = [];
      for (let i = 0; i < n; i++) g.push([Math.random(), Math.random()]);
      K = n;
    };
    seed(2600, w, h);
    const u = (x, y, m, n) => Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y) - Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);
    return {
      reset() {
        seed(K, w, h);
      },
      step(ctx, w2, h2, t, acc, P, M) {
        if ((P.grain | 0) !== K) seed(P.grain | 0, w2, h2);
        const m = P.m | 0, n = P.n | 0;
        const S = Math.min(w2, h2) * 0.78, px = (w2 - S) / 2, py = (h2 - S) / 2;
        const RES = 120, img = ctx.createImageData(RES, RES), d = img.data;
        const rgb = acc.split(",").map(Number);
        for (let j = 0; j < RES; j++) for (let i = 0; i < RES; i++) {
          const a = Math.abs(u(i / RES, j / RES, m, n)) / 2;
          const o = (j * RES + i) * 4;
          d[o] = rgb[0] * a * 0.3;
          d[o + 1] = rgb[1] * a * 0.3;
          d[o + 2] = rgb[2] * a * 0.3;
          d[o + 3] = 255;
        }
        const off = document.createElement("canvas");
        off.width = off.height = RES;
        off.getContext("2d").putImageData(img, 0, 0);
        ctx.drawImage(off, px, py, S, S);
        ctx.strokeStyle = `rgba(${acc},0.35)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, S, S);
        const e = 4e-3;
        for (let k = 0; k < g.length; k++) {
          const p = g[k];
          const a = Math.abs(u(p[0], p[1], m, n));
          const gx = (Math.abs(u(p[0] + e, p[1], m, n)) - Math.abs(u(p[0] - e, p[1], m, n))) / (2 * e);
          const gy = (Math.abs(u(p[0], p[1] + e, m, n)) - Math.abs(u(p[0], p[1] - e, m, n))) / (2 * e);
          const kick = a * 0.01, walk = 0.038;
          p[0] += -gx * 16e-4 + (Math.random() - 0.5) * kick + (Math.random() - 0.5) * walk;
          p[1] += -gy * 16e-4 + (Math.random() - 0.5) * kick + (Math.random() - 0.5) * walk;
          p[0] = Math.max(0, Math.min(1, p[0]));
          p[1] = Math.max(0, Math.min(1, p[1]));
        }
        ctx.fillStyle = `rgba(${acc},0.85)`;
        for (let k = 0; k < g.length; k++)
          ctx.fillRect(px + g[k][0] * S - 0.6, py + g[k][1] * S - 0.6, 1.5, 1.5);
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("u = cos(n\u03C0x)cos(m\u03C0y) \u2212 cos(m\u03C0x)cos(n\u03C0y)      grains settle where u = 0", 12, h2 - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText("m = " + m + "   n = " + n + "   " + g.length + " grains", 12, h2 - 12);
      }
    };
  }
};

// src/experiments/collatz.js
var collatz_default = {
  id: "collatz",
  name: L("Collatz", "Collatz"),
  note: L(
    "Halve it or triple-plus-one. Every path tested so far falls to 1. Nobody has proved it.",
    "Divide en dos o triplica y suma uno. Todo camino probado cae a 1. Nadie lo ha demostrado."
  ),
  params: [
    { key: "count", label: L("Numbers", "N\xFAmeros"), min: 100, max: 6e3, step: 100, def: 2200 },
    { key: "even", label: L("Even turn", "Giro par"), min: 0, max: 20, step: 0.5, def: 7 },
    { key: "odd", label: L("Odd turn", "Giro impar"), min: -24, max: 0, step: 0.5, def: -11 }
  ],
  make() {
    let cache = null, key = "", maxLen = 0;
    return {
      resize() {
        key = "";
      },
      step(ctx, w, h, t, acc, P, M) {
        const N = P.count | 0;
        const k = N + ":" + P.even + ":" + P.odd + ":" + w + ":" + h + ":" + acc;
        if (key !== k) {
          key = k;
          cache = document.createElement("canvas");
          cache.width = w;
          cache.height = h;
          const c = cache.getContext("2d");
          const ev = P.even * Math.PI / 180, od = P.odd * Math.PI / 180;
          const seg = Math.min(w, h) * 0.02;
          maxLen = 0;
          for (let s = 2; s <= N; s++) {
            const path = [];
            let v = s, guard = 0;
            while (v !== 1 && guard++ < 1e3) {
              path.push(v % 2 === 0);
              v = v % 2 === 0 ? v / 2 : 3 * v + 1;
            }
            if (path.length > maxLen) maxLen = path.length;
            let x = w / 2, y = h * 0.94, a = -Math.PI / 2;
            c.beginPath();
            c.moveTo(x, y);
            for (let i = path.length - 1; i >= 0; i--) {
              a += path[i] ? ev : od;
              x += Math.cos(a) * seg;
              y += Math.sin(a) * seg;
              c.lineTo(x, y);
            }
            c.strokeStyle = `rgba(${acc},0.035)`;
            c.lineWidth = 1;
            c.stroke();
          }
        }
        ctx.drawImage(cache, 0, 0);
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("n even \u2192 n/2      n odd \u2192 3n+1      drawn backwards from 1", 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText(N.toLocaleString("en") + " starting numbers   longest path " + maxLen + " steps", 12, h - 12);
      }
    };
  }
};

// src/experiments/curvature.js
var curvature_default = {
  id: "curvature",
  name: L("Gravity is geometry", "La gravedad es geometr\xEDa"),
  note: L(
    "A lattice of space with a mass in it. Move the mass and watch the grid answer.",
    "Una ret\xEDcula de espacio con una masa dentro. Mueve la masa y mira responder a la rejilla."
  ),
  params: [
    { key: "mass", label: L("Mass", "Masa"), min: 0, max: 3, step: 0.05, def: 1.2 },
    { key: "div", label: L("Lattice divisions", "Divisiones de la ret\xEDcula"), min: 3, max: 8, step: 1, def: 6 },
    { key: "tilt", label: L("View tilt", "Inclinaci\xF3n de la vista"), min: 0.05, max: 1.1, step: 0.02, def: 0.42 }
  ],
  make() {
    let yaw = 0.6;
    return {
      reset() {
        yaw = 0.6;
      },
      step(ctx, w, h, t, acc, P, M) {
        const N = P.div | 0, SUB = 8;
        const tilt = P.tilt;
        yaw += 22e-4;
        const mx = M.in ? (M.x / w - 0.5) * 2.1 : Math.cos(t * 0.35) * 0.5;
        const my = M.in ? (M.y / h - 0.5) * -2.1 : Math.sin(t * 0.5) * 0.4;
        const Mp = [mx, my, 0];
        const rgb = acc.split(",").map(Number);
        const K = P.mass * 0.3;
        const warp = (p) => {
          const dx = p[0] - Mp[0], dy = p[1] - Mp[1], dz = p[2] - Mp[2];
          const r2 = dx * dx + dy * dy + dz * dz;
          const r = Math.sqrt(r2) + 1e-4;
          const s = Math.min(r * 0.75, K / (r2 + 0.05));
          return [p[0] - dx / r * s, p[1] - dy / r * s, p[2] - dz / r * s, r];
        };
        const cy = Math.cos(yaw), sy = Math.sin(yaw);
        const ct = Math.cos(tilt), st = Math.sin(tilt);
        const S = Math.min(w, h) * 0.3, ox = w / 2, oy = h / 2;
        const proj = (q) => {
          const x = q[0] * cy - q[2] * sy;
          const z = q[0] * sy + q[2] * cy;
          const y = q[1] * ct - z * st;
          const zz = q[1] * st + z * ct;
          const per = 1 / (1 + zz * 0.22);
          return [ox + x * S * per, oy - y * S * per, zz, per];
        };
        const lines = [];
        const at = (u, i, j) => {
          const a = -1 + 2 * i / N, b = -1 + 2 * j / N;
          return u === 0 ? [null, a, b] : u === 1 ? [a, null, b] : [a, b, null];
        };
        for (let u = 0; u < 3; u++) {
          for (let i = 0; i <= N; i++) {
            for (let j = 0; j <= N; j++) {
              const tpl = at(u, i, j), pts = [];
              let depth = 0, near = 0;
              for (let k = 0; k <= N * SUB; k++) {
                const v = -1 + 2 * k / (N * SUB);
                const p = tpl.slice();
                p[u] = v;
                const q = warp(p);
                const pr = proj(q);
                pts.push(pr);
                depth += pr[2];
                near = Math.max(near, 1 / (1 + q[3] * q[3] * 2.2));
              }
              lines.push({ pts, depth: depth / pts.length, near });
            }
          }
        }
        lines.sort((a, b) => b.depth - a.depth);
        for (const L2 of lines) {
          const n = Math.min(1, L2.near * 1.5);
          const r = rgb[0] + (245 - rgb[0]) * n;
          const g = rgb[1] + (250 - rgb[1]) * n;
          const b = rgb[2] + (255 - rgb[2]) * n;
          const fog = Math.max(0.1, Math.min(0.75, 0.5 - L2.depth * 0.16));
          ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${(fog * (0.45 + n * 0.55)).toFixed(3)})`;
          ctx.lineWidth = 0.8 + n * 1.2;
          ctx.beginPath();
          L2.pts.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
          ctx.stroke();
        }
        const pm = proj([Mp[0], Mp[1], Mp[2], 0]);
        const R = (7 + P.mass * 5) * pm[3];
        const gg = ctx.createRadialGradient(pm[0], pm[1], 0, pm[0], pm[1], R * 3);
        gg.addColorStop(0, `rgba(${core()},0.95)`);
        gg.addColorStop(0.35, `rgba(${acc},0.5)`);
        gg.addColorStop(1, `rgba(${acc},0)`);
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(pm[0], pm[1], R * 3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(pm[0], pm[1], R * 0.5, 0, TAU);
        ctx.fill();
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("no force is drawn here \u2014 only distances", 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText("mass " + P.mass.toFixed(2) + "     lattice " + N + "\xB3", 12, h - 12);
      }
    };
  }
};

// src/experiments/doubleslit.js
var doubleslit_default = {
  id: "doubleslit",
  name: L("Double slit", "Doble rendija"),
  note: L(
    "Nobody watching, and fringes appear. Put an observer at the slits and they do not.",
    "Nadie mirando, y aparecen franjas. Pon un observador en las rendijas y no aparecen."
  ),
  params: [
    { key: "watch", label: L("Observer at the slits", "Observador en las rendijas"), min: 0, max: 1, step: 1, def: 0 },
    { key: "eff", label: L("Detector reliability", "Fiabilidad del detector"), min: 0, max: 1, step: 0.01, def: 1 },
    { key: "sep", label: L("Slit separation d", "Separaci\xF3n d"), min: 20, max: 140, step: 2, def: 62, unit: "px" },
    { key: "lam", label: L("Wavelength \u03BB", "Longitud de onda \u03BB"), min: 8, max: 40, step: 1, def: 18, unit: "px" }
  ],
  make(w, h) {
    const BINS = 150;
    let bins = new Float32Array(BINS), peak = 1, hits = [], lastKey = "";
    let seen = [0, 0], glow = [0, 0];
    return {
      reset() {
        bins = new Float32Array(BINS);
        peak = 1;
        hits = [];
        seen = [0, 0];
      },
      step(ctx, w2, h2, t, acc, P, M) {
        const on = P.watch > 0.5;
        const eff = M.in ? Math.min(1, Math.max(0, M.x / w2)) : P.eff;
        const D = on ? eff : 0;
        const V = Math.sqrt(Math.max(0, 1 - D * D));
        const key = [P.sep, P.lam, on ? 1 : 0, D.toFixed(2)].join("|");
        if (key !== lastKey) {
          lastKey = key;
          bins = new Float32Array(BINS);
          peak = 1;
          hits = [];
          seen = [0, 0];
        }
        const bx = w2 * 0.34, sx = w2 * 0.9, cy = h2 / 2;
        const s1 = cy - P.sep / 2, s2 = cy + P.sep / 2;
        const k = TAU / P.lam;
        const amp = (x, y, sy) => {
          const dx = x - bx, dy = y - sy, r = Math.hypot(dx, dy) + 6;
          const a = 26 / Math.sqrt(r);
          return [a * Math.cos(k * r), a * Math.sin(k * r)];
        };
        const inten = (x, y) => {
          const A = amp(x, y, s1), B = amp(x, y, s2);
          const i1 = A[0] * A[0] + A[1] * A[1], i2 = B[0] * B[0] + B[1] * B[1];
          return i1 + i2 + 2 * V * (A[0] * B[0] + A[1] * B[1]);
        };
        const STEP = 7;
        for (let x = bx + STEP; x < sx; x += STEP) {
          for (let y = STEP / 2; y < h2; y += STEP) {
            const I = Math.min(1, inten(x, y) / 26);
            if (I < 0.05) continue;
            ctx.fillStyle = `rgba(${acc},${(0.06 + I * 0.5).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(x, y, 0.5 + I * 1.9, 0, TAU);
            ctx.fill();
          }
        }
        ctx.strokeStyle = `rgba(${acc},0.18)`;
        ctx.lineWidth = 1;
        for (const sy of [s1, s2]) {
          for (let n = 0; n < 7; n++) {
            const rr = (t * 34 + n * P.lam * 2.4) % (sx - bx);
            ctx.beginPath();
            ctx.arc(bx, sy, rr, -1.15, 1.15);
            ctx.stroke();
          }
        }
        ctx.strokeStyle = `rgba(${acc},0.8)`;
        ctx.lineWidth = 2.5;
        const gap = 7;
        [[0, s1 - gap], [s1 + gap, s2 - gap], [s2 + gap, h2]].forEach(([a, b]) => {
          ctx.beginPath();
          ctx.moveTo(bx, a);
          ctx.lineTo(bx, b);
          ctx.stroke();
        });
        let Imax = 0;
        for (let b = 0; b < BINS; b++) Imax = Math.max(Imax, inten(sx, (b + 0.5) * h2 / BINS));
        for (let q = 0; q < 3; q++) {
          for (let tries = 0; tries < 14; tries++) {
            const y = Math.random() * h2;
            if (inten(sx, y) > Math.random() * Imax) {
              const b = Math.min(BINS - 1, Math.floor(y / h2 * BINS));
              bins[b]++;
              peak = Math.max(peak, bins[b]);
              hits.push({ y, life: 1 });
              if (on) {
                let which = y < cy ? 0 : 1;
                if (Math.random() > eff) which = 1 - which;
                seen[which]++;
                glow[which] = 1;
              }
              break;
            }
          }
        }
        if (hits.length > 260) hits.splice(0, hits.length - 260);
        glow[0] *= 0.9;
        glow[1] *= 0.9;
        if (on) {
          [s1, s2].forEach((sy, i) => {
            ctx.strokeStyle = `rgba(${ink()},${(0.3 + glow[i] * 0.7).toFixed(2)})`;
            ctx.lineWidth = 1.2 + glow[i];
            ctx.beginPath();
            ctx.arc(bx + 15, sy, 7, 0, TAU);
            ctx.stroke();
            ctx.font = "10px monospace";
            ctx.fillStyle = `rgba(${ink()},${(0.45 + glow[i] * 0.55).toFixed(2)})`;
            ctx.fillText(String(seen[i]), bx + 26, sy + 4);
          });
        }
        const bw = h2 / BINS;
        for (let b = 0; b < BINS; b++) {
          if (!bins[b]) continue;
          const L2 = bins[b] / peak * (w2 * 0.085);
          ctx.fillStyle = `rgba(${acc},${(0.25 + 0.6 * (bins[b] / peak)).toFixed(3)})`;
          ctx.fillRect(sx, b * bw, L2, bw - 0.5);
        }
        ctx.strokeStyle = `rgba(${acc},0.5)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, h2);
        ctx.stroke();
        hits.forEach((hh) => {
          hh.life *= 0.985;
          ctx.fillStyle = `rgba(${ink()},${(hh.life * 0.8).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, hh.y, 1.6, 0, TAU);
          ctx.fill();
        });
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("V\xB2 + D\xB2 \u2264 1      knowing the path costs you the fringes", 12, h2 - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText((on ? "observer ON   D = " + D.toFixed(2) : "nobody watching   D = 0") + "    V = " + V.toFixed(2) + "    " + (V > 0.15 ? "interference" : "two bands, no fringes"), 12, h2 - 12);
      }
    };
  }
};

// src/experiments/duality.js
var duality_default = {
  id: "duality",
  name: L("Wave or particle, your choice", "Onda o part\xEDcula, t\xFA eliges"),
  note: L(
    "One apparatus. Slide the second mirror in and out, and the photon changes what it was.",
    "Un aparato. Mete y saca el segundo espejo, y el fot\xF3n cambia lo que fue."
  ),
  params: [
    { key: "bs2", label: L("Second splitter in place", "Segundo divisor puesto"), min: 0, max: 1, step: 1, def: 1 },
    { key: "late", label: L("Decide after entry", "Decidir tras la entrada"), min: 0, max: 1, step: 1, def: 0 },
    { key: "phase", label: L("Phase \u03C6", "Fase \u03C6"), min: 0, max: 360, step: 1, def: 60, unit: "\xB0" }
  ],
  make() {
    const NB = 72;
    let curve = Array.from({ length: NB }, () => ({ n: 0, d0: 0 }));
    let shots = [], lastBS = -1, early = 0, lateN = 0, earlyD0 = 0, lateD0 = 0;
    return {
      reset() {
        curve = Array.from({ length: NB }, () => ({ n: 0, d0: 0 }));
        shots = [];
        early = lateN = earlyD0 = lateD0 = 0;
      },
      step(ctx, w, h, t, acc, P, M) {
        const deg = M.in ? M.x / w * 360 : P.phase;
        const phi = deg * Math.PI / 180;
        const hasBS2 = P.bs2 > 0.5, delayed = P.late > 0.5;
        if (hasBS2 !== (lastBS === 1)) {
          lastBS = hasBS2 ? 1 : 0;
          curve = Array.from({ length: NB }, () => ({ n: 0, d0: 0 }));
          early = lateN = earlyD0 = lateD0 = 0;
        }
        const SRC = [w * 0.06, h * 0.2], BS1 = [w * 0.2, h * 0.2];
        const M1 = [w * 0.2, h * 0.48], M2 = [w * 0.52, h * 0.2];
        const BS2 = [w * 0.52, h * 0.48];
        const D0 = [w * 0.76, h * 0.48], D1 = [w * 0.52, h * 0.62];
        const line = (p1, p2, al, lw) => {
          ctx.strokeStyle = `rgba(${acc},${al})`;
          ctx.lineWidth = lw || 1.4;
          ctx.beginPath();
          ctx.moveTo(p1[0], p1[1]);
          ctx.lineTo(p2[0], p2[1]);
          ctx.stroke();
        };
        line(SRC, BS1, 0.4);
        line(BS1, M2, 0.3);
        line(M2, BS2, 0.3);
        line(BS1, M1, 0.3);
        line(M1, BS2, 0.3);
        line(BS2, D0, 0.3);
        line(BS2, D1, 0.3);
        ctx.font = "10px monospace";
        const tag = (x, y, str, al) => {
          ctx.fillStyle = `rgba(${acc},${al || 0.55})`;
          ctx.fillText(str, x, y);
        };
        const mirror = (p) => {
          ctx.strokeStyle = `rgba(${acc},0.75)`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(p[0] - 10, p[1] - 10);
          ctx.lineTo(p[0] + 10, p[1] + 10);
          ctx.stroke();
        };
        const splitter = (p, on) => {
          ctx.strokeStyle = on ? `rgba(${acc},0.95)` : `rgba(${acc},0.16)`;
          ctx.lineWidth = on ? 2.6 : 1.4;
          if (!on) ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.moveTo(p[0] - 11, p[1] + 11);
          ctx.lineTo(p[0] + 11, p[1] - 11);
          ctx.stroke();
          ctx.setLineDash([]);
        };
        mirror(M1);
        mirror(M2);
        splitter(BS1, true);
        splitter(BS2, hasBS2);
        ctx.fillStyle = `rgba(${acc},0.9)`;
        ctx.beginPath();
        ctx.arc(SRC[0], SRC[1], 4, 0, TAU);
        ctx.fill();
        tag(SRC[0] - 20, SRC[1] - 14, "source", 0.7);
        tag(BS1[0] - 46, BS1[1] - 16, "splitter 1");
        tag(M2[0] - 16, M2[1] - 16, "mirror");
        tag(M1[0] - 52, M1[1] + 4, "mirror");
        tag(BS2[0] + 16, BS2[1] + 26, hasBS2 ? "splitter 2" : "splitter 2 \xB7 REMOVED", hasBS2 ? 0.55 : 0.95);
        tag((BS1[0] + M2[0]) / 2 - 40, BS1[1] - 16, "path A   \u03C6 = " + deg.toFixed(0) + "\xB0", 0.8);
        tag((M1[0] + BS2[0]) / 2 - 24, M1[1] + 20, "path B", 0.55);
        if (Math.random() < 0.4) shots.push({
          u: 0,
          arm: Math.random() < 0.5 ? 0 : 1,
          decided: !delayed,
          bs2: hasBS2,
          hit: null,
          wasLate: delayed
        });
        shots = shots.filter((s) => {
          s.u += 0.01;
          if (!s.decided && s.u > 0.55) {
            s.decided = true;
            s.bs2 = hasBS2;
          }
          const u = s.u;
          const dot = (p, a, r) => {
            ctx.fillStyle = `rgba(${acc},${a})`;
            ctx.beginPath();
            ctx.arc(p[0], p[1], r, 0, TAU);
            ctx.fill();
          };
          if (u < 0.22) {
            const k = u / 0.22;
            dot([SRC[0] + (BS1[0] - SRC[0]) * k, SRC[1]], 0.95, 3);
          } else if (u < 0.72) {
            const k = (u - 0.22) / 0.5;
            const arms = s.decided && !s.bs2 ? [s.arm] : [0, 1];
            for (const a of arms) {
              const p = a === 0 ? k < 0.5 ? [BS1[0] + (M2[0] - BS1[0]) * (k / 0.5), BS1[1]] : [M2[0], M2[1] + (BS2[1] - M2[1]) * ((k - 0.5) / 0.5)] : k < 0.5 ? [BS1[0], BS1[1] + (M1[1] - BS1[1]) * (k / 0.5)] : [M1[0] + (BS2[0] - M1[0]) * ((k - 0.5) / 0.5), M1[1]];
              arms.length === 1 ? dot(p, 0.95, 3) : dot(p, 0.45, 2.4);
            }
          } else {
            if (s.hit === null) {
              const pd0 = s.bs2 ? Math.cos(phi / 2) ** 2 : 0.5;
              s.hit = Math.random() < pd0 ? 0 : 1;
              const b = Math.min(NB - 1, Math.floor(deg / 360 * NB));
              curve[b].n++;
              if (s.hit === 0) curve[b].d0++;
              if (s.wasLate) {
                lateN++;
                if (!s.hit) lateD0++;
              } else {
                early++;
                if (!s.hit) earlyD0++;
              }
            }
            const k = (u - 0.72) / 0.28;
            dot(s.hit === 0 ? [BS2[0] + (D0[0] - BS2[0]) * k, D0[1]] : [D1[0], BS2[1] + (D1[1] - BS2[1]) * k], 0.95, 3);
          }
          return u < 1;
        });
        [[D0, "D0", 18, 4], [D1, "D1", -8, 26]].forEach(([p, lab, dx, dy]) => {
          ctx.strokeStyle = `rgba(${acc},0.8)`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(p[0], p[1], 10, 0, TAU);
          ctx.stroke();
          ctx.font = "11px monospace";
          ctx.fillStyle = `rgba(${acc},0.9)`;
          ctx.fillText(lab, p[0] + dx, p[1] + dy);
        });
        const gx = w * 0.08, gw = w * 0.86, gy = h * 0.95, gh = h * 0.27;
        ctx.strokeStyle = `rgba(${acc},0.18)`;
        ctx.lineWidth = 1;
        [0, 0.5, 1].forEach((v) => {
          const Y = gy - v * gh;
          ctx.beginPath();
          ctx.moveTo(gx, Y);
          ctx.lineTo(gx + gw, Y);
          ctx.stroke();
        });
        ctx.font = "10px monospace";
        ctx.fillStyle = `rgba(${acc},0.45)`;
        ctx.fillText("1", gx - 12, gy - gh + 4);
        ctx.fillText("\xBD", gx - 12, gy - gh / 2 + 4);
        ctx.fillText("0", gx - 12, gy + 4);
        ctx.fillText("P(D0) vs \u03C6", gx, gy - gh - 8);
        ctx.strokeStyle = `rgba(${acc},0.45)`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 5]);
        ctx.beginPath();
        for (let i = 0; i <= 180; i++) {
          const d = i / 180 * 360, v = hasBS2 ? Math.cos(d * Math.PI / 180 / 2) ** 2 : 0.5;
          const X = gx + i / 180 * gw, Y = gy - v * gh;
          i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        curve.forEach((c, i) => {
          if (c.n < 3) return;
          const X = gx + (i + 0.5) / NB * gw, Y = gy - c.d0 / c.n * gh;
          ctx.beginPath();
          ctx.arc(X, Y, 2.4, 0, TAU);
          ctx.fill();
        });
        const mx = gx + deg / 360 * gw;
        ctx.strokeStyle = `rgba(${acc},0.35)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mx, gy - gh);
        ctx.lineTo(mx, gy);
        ctx.stroke();
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText(hasBS2 ? "WAVE \u2014 both routes contribute, \u03C6 decides the detector" : "PARTICLE \u2014 the detector names the route, \u03C6 does nothing", 118, 22);
        const fE = early ? earlyD0 / early : 0, fL = lateN ? lateD0 / lateN : 0;
        ctx.fillStyle = `rgba(${acc},0.9)`;
        ctx.fillText("decided early  " + (early ? fE.toFixed(3) : "\u2014") + "     decided mid-flight  " + (lateN ? fL.toFixed(3) : "\u2014") + "     predicted " + (hasBS2 ? (Math.cos(phi / 2) ** 2).toFixed(3) : "0.500"), 118, 40);
      }
    };
  }
};

// src/experiments/embedding.js
var embedding_default = {
  id: "embedding",
  name: L("Embedding space", "Espacio de embeddings"),
  note: L(
    "High-dimensional structure squeezed into a plane, live.",
    "Estructura de muchas dimensiones exprimida a un plano, en vivo."
  ),
  params: [
    { key: "dim", label: L("True dimensions", "Dimensiones reales"), min: 3, max: 24, step: 1, def: 10 },
    { key: "clus", label: L("Clusters", "Grupos"), min: 2, max: 8, step: 1, def: 5 },
    { key: "rate", label: L("Relaxation rate", "Tasa de relajaci\xF3n"), min: 0.01, max: 0.4, step: 0.01, def: 0.12 }
  ],
  make(w, h) {
    let hi = [], lo = [], lab = [], D = 0, C = 0, target = null;
    const build = (dim, clus, w2, h2) => {
      D = dim;
      C = clus;
      hi = [];
      lo = [];
      lab = [];
      const centres = Array.from({ length: clus }, () => Array.from({ length: dim }, () => (Math.random() * 2 - 1) * 2.2));
      for (let c = 0; c < clus; c++) {
        for (let i = 0; i < 26; i++) {
          hi.push(centres[c].map((v) => v + (Math.random() * 2 - 1) * 0.45));
          lab.push(c);
          lo.push([w2 / 2 + (Math.random() - 0.5) * 40, h2 / 2 + (Math.random() - 0.5) * 40]);
        }
      }
      const n = hi.length;
      target = new Float32Array(n * n);
      let mx = 0;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        let s = 0;
        for (let k = 0; k < dim; k++) {
          const d = hi[i][k] - hi[j][k];
          s += d * d;
        }
        const v = Math.sqrt(s);
        target[i * n + j] = v;
        if (v > mx) mx = v;
      }
      const scale = Math.min(w2, h2) * 0.4 / mx;
      for (let i = 0; i < n * n; i++) target[i] *= scale;
    };
    build(10, 5, w, h);
    return {
      resize(w2, h2) {
        build(D, C, w2, h2);
      },
      reset() {
        build(D, C, w, h);
      },
      step(ctx, w2, h2, t, acc, P, M) {
        if ((P.dim | 0) !== D || (P.clus | 0) !== C) build(P.dim | 0, P.clus | 0, w2, h2);
        const n = lo.length, rate = P.rate;
        for (let s = 0; s < 3; s++) {
          for (let i = 0; i < n; i++) {
            const j = Math.random() * n | 0;
            if (i === j) continue;
            const dx = lo[j][0] - lo[i][0], dy = lo[j][1] - lo[i][1];
            const d = Math.hypot(dx, dy) + 1e-6;
            const want = target[i * n + j];
            const push = (d - want) / d * rate * 0.5;
            lo[i][0] += dx * push;
            lo[i][1] += dy * push;
            lo[j][0] -= dx * push;
            lo[j][1] -= dy * push;
          }
        }
        let err = 0, cnt = 0;
        for (let q = 0; q < 400; q++) {
          const i = Math.random() * n | 0, j = Math.random() * n | 0;
          if (i === j) continue;
          const d = Math.hypot(lo[j][0] - lo[i][0], lo[j][1] - lo[i][1]);
          const want = target[i * n + j];
          err += Math.abs(d - want) / (want + 1);
          cnt++;
        }
        err = cnt ? err / cnt : 0;
        for (let i = 0; i < n; i++) {
          const c = lab[i], a = 0.35 + c / Math.max(1, C - 1) * 0.6;
          ctx.fillStyle = c % 2 ? `rgba(${acc},${a.toFixed(2)})` : `rgba(${ink()},${(a * 0.7).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(lo[i][0], lo[i][1], 2.6, 0, TAU);
          ctx.fill();
        }
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("pairwise distances in " + D + "D, forced onto 2D by relaxation", 12, h2 - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText(D + " dimensions \u2192 2   " + C + " clusters   residual distortion " + (err * 100).toFixed(1) + "%", 12, h2 - 12);
      }
    };
  }
};

// src/experiments/entanglement.js
var entanglement_default = {
  id: "entanglement",
  name: L("Bell test", "Test de Bell"),
  note: L(
    "Two detectors, random outcomes each, correlations no local theory can produce.",
    "Dos detectores, resultados azarosos en cada uno, correlaciones que ninguna teor\xEDa local produce."
  ),
  params: [
    { key: "angA", label: L("Detector A angle", "\xC1ngulo del detector A"), min: 0, max: 180, step: 1, def: 0, unit: "\xB0" },
    { key: "angB", label: L("Detector B angle", "\xC1ngulo del detector B"), min: 0, max: 180, step: 1, def: 45, unit: "\xB0" },
    { key: "speed", label: L("Pairs per frame", "Pares por frame"), min: 1, max: 200, step: 1, def: 40 }
  ],
  make() {
    const SET = [[0, 45], [0, 135], [90, 45], [90, 135]];
    let tally = SET.map(() => ({ n: 0, s: 0 })), hist = [], shots = [];
    const D = 180 / Math.PI;
    return {
      reset() {
        tally = SET.map(() => ({ n: 0, s: 0 }));
        hist = [];
        shots = [];
      },
      step(ctx, w, h, t, acc, P, M) {
        const aA = M.in ? M.x / w * 180 : P.angA;
        const aB = P.angB;
        const measure = (a, b) => {
          const E2 = -Math.cos((a - b) / D);
          const A = Math.random() < 0.5 ? 1 : -1;
          const B = Math.random() < (1 + E2) / 2 ? A : -A;
          return [A, B];
        };
        for (let k = 0; k < (P.speed | 0); k++) {
          SET.forEach((cfg, i) => {
            const [A2, B2] = measure(cfg[0], cfg[1]);
            tally[i].n++;
            tally[i].s += A2 * B2;
          });
          const [A, B] = measure(aA, aB);
          shots.push({ A, B, life: 0 });
        }
        if (shots.length > 40) shots.splice(0, shots.length - 40);
        const E = tally.map((x) => x.n ? x.s / x.n : 0);
        const S = Math.abs(E[0] - E[1] + E[2] + E[3]);
        const Emeas = -Math.cos((aA - aB) / D);
        hist.push(Emeas);
        if (hist.length > 200) hist.shift();
        const cx = w / 2, cy = h * 0.34, arm = Math.min(w * 0.3, h * 0.3);
        ctx.strokeStyle = `rgba(${acc},0.25)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - arm, cy);
        ctx.lineTo(cx + arm, cy);
        ctx.stroke();
        ctx.fillStyle = `rgba(${acc},0.9)`;
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, TAU);
        ctx.fill();
        const dial = (x, ang, label2, val) => {
          ctx.strokeStyle = `rgba(${acc},0.5)`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(x, cy, 16, 0, TAU);
          ctx.stroke();
          const r = ang / D;
          ctx.strokeStyle = `rgba(${acc},0.95)`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x - 16 * Math.cos(r), cy - 16 * Math.sin(r));
          ctx.lineTo(x + 16 * Math.cos(r), cy + 16 * Math.sin(r));
          ctx.stroke();
          ctx.font = "10px monospace";
          ctx.fillStyle = `rgba(${acc},0.7)`;
          ctx.fillText(label2 + " " + ang.toFixed(0) + "\xB0", x - 22, cy + 34);
          ctx.fillStyle = val > 0 ? `rgba(${acc},1)` : `rgba(${ink()},0.9)`;
          ctx.fillText(val > 0 ? "+1" : "\u22121", x - 7, cy - 26);
        };
        const last = shots[shots.length - 1] || { A: 1, B: -1 };
        dial(cx - arm, aA, "A", last.A);
        dial(cx + arm, aB, "B", last.B);
        const gy = h * 0.72, gh = h * 0.2, gw = w * 0.76, gx = w * 0.12;
        ctx.strokeStyle = `rgba(${acc},0.18)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx + gw, gy);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${acc},0.5)`;
        ctx.beginPath();
        for (let i = 0; i <= 90; i++) {
          const d = i / 90 * 180, y = gy - -Math.cos(d / D) * gh;
          i ? ctx.lineTo(gx + i / 90 * gw, y) : ctx.moveTo(gx, y);
        }
        ctx.stroke();
        const px = gx + Math.abs(aA - aB) / 180 * gw;
        ctx.fillStyle = `rgba(${acc},1)`;
        ctx.beginPath();
        ctx.arc(px, gy - Emeas * gh, 3.4, 0, TAU);
        ctx.fill();
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("E(a,b) = \u2212cos(a\u2212b)      classical limit S \u2264 2", 12, h - 28);
        ctx.fillStyle = S > 2 ? `rgba(${acc},1)` : `rgba(${ink()},0.8)`;
        ctx.fillText("CHSH  S = " + S.toFixed(3) + "   (2\u221A2 = 2.828)" + (S > 2 ? "   violated" : ""), 12, h - 12);
      }
    };
  }
};

// src/experiments/entropy.js
var entropy_default = {
  id: "entropy",
  name: L("Entropy", "Entrop\xEDa"),
  note: L(
    "Gas released in a corner. Reverse every velocity and watch it go home.",
    "Un gas soltado en una esquina. Invierte todas las velocidades y m\xEDralo volver."
  ),
  params: [
    { key: "n", label: L("Particles", "Part\xEDculas"), min: 4, max: 600, step: 1, def: 240 },
    { key: "cells", label: L("Coarse-graining", "Grano de la descripci\xF3n"), min: 2, max: 16, step: 1, def: 8 },
    { key: "rev", label: L("Reverse time", "Invertir el tiempo"), min: 0, max: 1, step: 1, def: 0 }
  ],
  make(w, h) {
    let P = [], hist = [], lastRev = 0, lastN = 0, boxH = 0;
    const seed = (n, w2, h2) => {
      P = [];
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU, sp = 0.8 + Math.random() * 1.6;
        P.push({
          x: w2 * 0.06 + Math.random() * w2 * 0.16,
          y: h2 * 0.1 + Math.random() * h2 * 0.16,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp
        });
      }
      hist = [];
    };
    return {
      reset() {
        lastN = 0;
      },
      step(ctx, w2, h2, t, acc, P0, M) {
        boxH = h2 * 0.66;
        const n = P0.n | 0, C = P0.cells | 0;
        if (n !== lastN) {
          seed(n, w2, boxH);
          lastN = n;
        }
        if (P0.rev !== lastRev) {
          lastRev = P0.rev;
          for (const p of P) {
            p.vx = -p.vx;
            p.vy = -p.vy;
          }
        }
        for (const p of P) {
          if (M.in && M.y < boxH) {
            const dx = p.x - M.x, dy = p.y - M.y, d = Math.hypot(dx, dy) + 1;
            if (d < 90) {
              const g = (1 - d / 90) * 0.5;
              p.vx += dx / d * g;
              p.vy += dy / d * g;
            }
          }
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 2) {
            p.x = 2;
            p.vx = -p.vx;
          }
          if (p.x > w2 - 2) {
            p.x = w2 - 2;
            p.vx = -p.vx;
          }
          if (p.y < 2) {
            p.y = 2;
            p.vy = -p.vy;
          }
          if (p.y > boxH - 2) {
            p.y = boxH - 2;
            p.vy = -p.vy;
          }
        }
        const cnt = new Float64Array(C * C);
        for (const p of P) {
          const cx = Math.min(C - 1, p.x / w2 * C | 0);
          const cy = Math.min(C - 1, p.y / boxH * C | 0);
          cnt[cy * C + cx]++;
        }
        let S = 0;
        for (let i = 0; i < cnt.length; i++) {
          if (!cnt[i]) continue;
          const q = cnt[i] / P.length;
          S -= q * Math.log(q);
        }
        S /= Math.log(C * C);
        hist.push(S);
        if (hist.length > w2 * 0.86) hist.shift();
        const cw = w2 / C, ch = boxH / C;
        for (let i = 0; i < C; i++) {
          for (let jj = 0; jj < C; jj++) {
            const q = cnt[jj * C + i] / Math.max(1, P.length);
            if (q <= 0) continue;
            ctx.fillStyle = `rgba(${acc},${Math.min(0.3, q * 3.2).toFixed(3)})`;
            ctx.fillRect(i * cw, jj * ch, cw, ch);
          }
        }
        ctx.strokeStyle = `rgba(${acc},0.10)`;
        ctx.lineWidth = 1;
        for (let i = 1; i < C; i++) {
          ctx.beginPath();
          ctx.moveTo(i * cw, 0);
          ctx.lineTo(i * cw, boxH);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i * ch);
          ctx.lineTo(w2, i * ch);
          ctx.stroke();
        }
        ctx.strokeStyle = `rgba(${acc},0.5)`;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(1, 1, w2 - 2, boxH - 2);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        for (const p of P) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5, 0, TAU);
          ctx.fill();
        }
        const gy = h2 * 0.9, gh = h2 * 0.17, gx = w2 * 0.07;
        ctx.strokeStyle = `rgba(${acc},0.2)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx, gy - gh);
        ctx.lineTo(gx + w2 * 0.86, gy - gh);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx + w2 * 0.86, gy);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${acc},0.9)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        hist.forEach((v, i) => {
          const X = gx + i, Y = gy - v * gh;
          i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
        });
        ctx.stroke();
        ctx.font = "10px monospace";
        ctx.fillStyle = `rgba(${acc},0.45)`;
        ctx.fillText("S max", gx - 4, gy - gh - 4);
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("S = \u2212\u03A3 p\u1D62 ln p\u1D62      the equations do not know which way is forward", 12, h2 - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText("S / S_max = " + S.toFixed(3) + "     N = " + P.length + "     cells " + C + "\xD7" + C, 12, h2 - 12);
      }
    };
  }
};

// src/experiments/flow.js
var flow_default = {
  id: "flow",
  name: L("Flow field", "Campo de flujo"),
  note: L(
    "Particles with no plan, following a field they cannot see.",
    "Part\xEDculas sin plan, siguiendo un campo que no pueden ver."
  ),
  params: [
    { key: "scale", label: L("Field scale", "Escala del campo"), min: 3, max: 30, step: 0.5, def: 11 },
    { key: "speed", label: L("Step size", "Tama\xF1o del paso"), min: 0.3, max: 4, step: 0.05, def: 1.25 },
    { key: "pull", label: L("Cursor pull", "Atracci\xF3n del cursor"), min: 0, max: 3, step: 0.1, def: 1.2 }
  ],
  make(w, h) {
    const N = 220, P = [];
    for (let i = 0; i < N; i++) P.push({ x: Math.random() * w, y: Math.random() * h, life: Math.random() * 200 });
    return {
      fade: 0.055,
      step(ctx, w2, h2, t, acc, Q, M) {
        const f = Q.scale / 1e3;
        ctx.lineWidth = 1;
        for (const p of P) {
          const a = (Math.sin(p.x * f + t * 0.35) + Math.cos(p.y * f * 1.18 - t * 0.28)) * Math.PI;
          let vx = Math.cos(a) * Q.speed, vy = Math.sin(a) * Q.speed;
          if (M.in && Q.pull) {
            const dx = M.x - p.x, dy = M.y - p.y, d = Math.hypot(dx, dy) + 1;
            if (d < 220) {
              const g = Q.pull * (1 - d / 220);
              vx += dx / d * g;
              vy += dy / d * g;
            }
          }
          const nx = p.x + vx, ny = p.y + vy;
          ctx.strokeStyle = `rgba(${acc},0.30)`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          p.x = nx;
          p.y = ny;
          p.life--;
          if (p.life < 0 || p.x < 0 || p.x > w2 || p.y < 0 || p.y > h2) {
            p.x = Math.random() * w2;
            p.y = Math.random() * h2;
            p.life = 120 + Math.random() * 160;
          }
        }
      }
    };
  }
};

// src/experiments/fluid.js
var unsupported = (message) => Object.assign(new Error("phenomena/fluid: " + message), { code: "WEBGL_UNSUPPORTED" });
var fluid_default = {
  id: "fluid",
  kind: "webgl",
  pixelRatio: 1.25,
  name: L("Incompressible fluid", "Fluido incompresible"),
  note: L(
    "Navier-Stokes on the GPU: advection, pressure projection and vorticity confinement, all in shaders.",
    "Navier-Stokes en la GPU: advecci\xF3n, proyecci\xF3n de presi\xF3n y confinamiento de vorticidad, todo en shaders."
  ),
  params: [
    { key: "curl", label: L("Vorticity confinement", "Confinamiento de vorticidad"), min: 0, max: 60, step: 1, def: 24 },
    { key: "iterations", label: L("Pressure iterations", "Iteraciones de presi\xF3n"), min: 2, max: 40, step: 1, def: 16 },
    { key: "velocity", label: L("Velocity decay", "Decaimiento de velocidad"), min: 0, max: 2, step: 0.02, def: 0.26 },
    { key: "dye", label: L("Dye decay", "Decaimiento de tinta"), min: 0, max: 2, step: 0.02, def: 0.22 },
    { key: "radius", label: L("Splat radius", "Radio de inyecci\xF3n"), min: 0.05, max: 1, step: 0.01, def: 0.17 },
    { key: "ambient", label: L("Ambient splats", "Inyecci\xF3n ambiental"), min: 0, max: 1, step: 1, def: 1 }
  ],
  make(w, h, env) {
    const cv = env.canvas;
    const small = Math.min(w, h) < 520;
    const SIM_RES = small ? 96 : 128;
    const DYE_RES = small ? 448 : 640;
    const PRESSURE = 0.8;
    const SPLAT_FORCE = 3200;
    const attrs = { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl = cv.getContext("webgl2", attrs);
    const isGL2 = !!gl;
    if (!gl) gl = cv.getContext("webgl", attrs) || cv.getContext("experimental-webgl", attrs);
    if (!gl) throw unsupported("WebGL is not available");
    let halfFloat, linear;
    if (isGL2) {
      gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float");
      halfFloat = gl.HALF_FLOAT;
      linear = true;
    } else {
      const ext = gl.getExtension("OES_texture_half_float");
      linear = !!gl.getExtension("OES_texture_half_float_linear");
      halfFloat = ext ? ext.HALF_FLOAT_OES : null;
    }
    if (!halfFloat || !linear) throw unsupported("half-float textures are not supported");
    const fmt = (internalFormat, format) => ({ internalFormat, format });
    let texRGBA, texRG, texR;
    if (isGL2) {
      texRGBA = fmt(gl.RGBA16F, gl.RGBA);
      texRG = fmt(gl.RG16F, gl.RG);
      texR = fmt(gl.R16F, gl.RED);
    } else {
      texRGBA = texRG = texR = fmt(gl.RGBA, gl.RGBA);
    }
    function renderable(f) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, f.internalFormat, 4, 4, 0, f.format, halfFloat, null);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.deleteFramebuffer(fb);
      gl.deleteTexture(tex);
      return ok;
    }
    if (!renderable(texRGBA)) throw unsupported("cannot render to half-float textures");
    if (!renderable(texRG)) texRG = texRGBA;
    if (!renderable(texR)) texR = texRG;
    const shaders = [];
    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) {
        throw new Error("phenomena/fluid: shader failed to compile\n" + gl.getShaderInfoLog(s));
      }
      shaders.push(s);
      return s;
    }
    const VERT = compile(gl.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * .5 + .5;
        vL = vUv - vec2(texelSize.x, 0.); vR = vUv + vec2(texelSize.x, 0.);
        vT = vUv + vec2(0., texelSize.y); vB = vUv - vec2(0., texelSize.y);
        gl_Position = vec4(aPosition, 0., 1.);
      }`);
    const programs = [];
    function program(fragment) {
      const p = gl.createProgram();
      gl.attachShader(p, VERT);
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragment));
      gl.bindAttribLocation(p, 0, "aPosition");
      gl.linkProgram(p);
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(p, i);
        u[info.name] = gl.getUniformLocation(p, info.name);
      }
      programs.push(p);
      return { u, bind: () => gl.useProgram(p) };
    }
    const splatP = program(`
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio, radius;
      uniform vec3 color;
      uniform vec2 point;
      void main () {
        vec2 p = vUv - point; p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.);
      }`);
    const advectP = program(`
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVelocity, uSource;
      uniform vec2 texelSize;
      uniform float dt, dissipation;
      void main () {
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        gl_FragColor = texture2D(uSource, coord) / (1. + dissipation * dt);
      }`);
    const divergenceP = program(`
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x, R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y, B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.) L = -C.x; if (vR.x > 1.) R = -C.x;
        if (vT.y > 1.) T = -C.y; if (vB.y < 0.) B = -C.y;
        gl_FragColor = vec4(.5 * (R - L + T - B), 0., 0., 1.);
      }`);
    const curlP = program(`
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y, R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x, B = texture2D(uVelocity, vB).x;
        gl_FragColor = vec4(R - L - T + B, 0., 0., 1.);
      }`);
    const vorticityP = program(`
      precision highp float;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uVelocity, uCurl;
      uniform float curl, dt;
      void main () {
        float L = texture2D(uCurl, vL).x, R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x, B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = .5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + .0001;
        force *= curl * C; force.y *= -1.;
        vec2 vel = texture2D(uVelocity, vUv).xy + force * dt;
        gl_FragColor = vec4(clamp(vel, -1000., 1000.), 0., 1.);
      }`);
    const pressureP = program(`
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uPressure, uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
        float div = texture2D(uDivergence, vUv).x;
        gl_FragColor = vec4((L + R + B + T - div) * .25, 0., 0., 1.);
      }`);
    const gradientP = program(`
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uPressure, uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
        vec2 vel = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
        gl_FragColor = vec4(vel, 0., 1.);
      }`);
    const clearP = program(`
      precision mediump float; precision mediump sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`);
    const displayP = program(`
      precision highp float;
      varying vec2 vUv, vL, vR, vT, vB;
      uniform sampler2D uTexture;
      uniform vec3 uPaper, uInk;
      uniform float uLight;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float dx = length(texture2D(uTexture, vR).rgb) - length(texture2D(uTexture, vL).rgb);
        float dy = length(texture2D(uTexture, vT).rgb) - length(texture2D(uTexture, vB).rgb);
        vec3 n = normalize(vec3(dx, dy, .14));
        c *= clamp(dot(n, normalize(vec3(-.3, .4, 1.))) + .72, .72, 1.08);
        vec3 dark = uPaper + c;
        float dens = clamp(length(c) * 3.1, 0., 1.);
        vec3 tint = mix(uPaper, mix(uPaper, uInk, .38), smoothstep(.05, .52, dens));
        tint = mix(tint, uInk, .8 * smoothstep(.58, 1., dens));
        float u = smoothstep(.18, .82, uLight);
        vec3 col = mix(dark, tint, u);
        float d = length(vUv - vec2(.5, .42));
        col *= 1. - (.32 * (1. - uLight) + .05 * uLight) * smoothstep(.45, .95, d);
        gl_FragColor = vec4(col, 1.);
      }`);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    function blit(target) {
      if (target) {
        gl.viewport(0, 0, target.w, target.h);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
      } else {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
    let targets = [];
    function fbo(tw, th, f, filter) {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, f.internalFormat, tw, th, 0, f.format, halfFloat, null);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, tw, th);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const target = {
        tex,
        fb,
        w: tw,
        h: th,
        texel: [1 / tw, 1 / th],
        attach(id) {
          gl.activeTexture(gl.TEXTURE0 + id);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          return id;
        }
      };
      targets.push(target);
      return target;
    }
    function doubleFbo(tw, th, f, filter) {
      let a = fbo(tw, th, f, filter), b = fbo(tw, th, f, filter);
      return {
        get read() {
          return a;
        },
        get write() {
          return b;
        },
        swap() {
          const t = a;
          a = b;
          b = t;
        },
        texel: [1 / tw, 1 / th]
      };
    }
    function resolution(base) {
      const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
      return aspect < 1 ? { w: base, h: Math.round(base / aspect) } : { w: Math.round(base * aspect), h: base };
    }
    let dye, velocity, divergence, curl, pressure;
    function allocate() {
      for (const t of targets) {
        gl.deleteTexture(t.tex);
        gl.deleteFramebuffer(t.fb);
      }
      targets = [];
      const sr = resolution(SIM_RES), dr = resolution(DYE_RES);
      dye = doubleFbo(dr.w, dr.h, texRGBA, gl.LINEAR);
      velocity = doubleFbo(sr.w, sr.h, texRG, gl.LINEAR);
      divergence = fbo(sr.w, sr.h, texR, gl.NEAREST);
      curl = fbo(sr.w, sr.h, texR, gl.NEAREST);
      pressure = doubleFbo(sr.w, sr.h, texR, gl.NEAREST);
    }
    allocate();
    const LEVELS = [0.22, 0.36, 0.5, 0.66, 0.82];
    const rgb = (s) => s.split(",").map((n) => +n / 255);
    function tint(k) {
      const a = rgb(env.theme.accent);
      const level = LEVELS[Math.random() * LEVELS.length | 0] * k;
      return [a[0] * level, a[1] * level, a[2] * level];
    }
    function splat(x, y, dx, dy, color, radius) {
      splatP.bind();
      gl.uniform1i(splatP.u.uTarget, velocity.read.attach(0));
      gl.uniform1f(splatP.u.aspectRatio, cv.width / cv.height);
      gl.uniform2f(splatP.u.point, x, y);
      gl.uniform3f(splatP.u.color, dx, dy, 0);
      gl.uniform1f(splatP.u.radius, radius / 100);
      blit(velocity.write);
      velocity.swap();
      gl.uniform1i(splatP.u.uTarget, dye.read.attach(0));
      gl.uniform3f(splatP.u.color, color[0], color[1], color[2]);
      blit(dye.write);
      dye.swap();
    }
    function burst(n, strength) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, f = 600 + Math.random() * 900;
        splat(
          0.12 + Math.random() * 0.76,
          0.15 + Math.random() * 0.7,
          Math.cos(a) * f,
          Math.sin(a) * f,
          tint(strength),
          0.5 + Math.random() * 0.5
        );
      }
    }
    function solve(dt, P) {
      gl.disable(gl.BLEND);
      const texel = velocity.texel;
      curlP.bind();
      gl.uniform2f(curlP.u.texelSize, texel[0], texel[1]);
      gl.uniform1i(curlP.u.uVelocity, velocity.read.attach(0));
      blit(curl);
      vorticityP.bind();
      gl.uniform2f(vorticityP.u.texelSize, texel[0], texel[1]);
      gl.uniform1i(vorticityP.u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(vorticityP.u.uCurl, curl.attach(1));
      gl.uniform1f(vorticityP.u.curl, P.curl);
      gl.uniform1f(vorticityP.u.dt, dt);
      blit(velocity.write);
      velocity.swap();
      divergenceP.bind();
      gl.uniform2f(divergenceP.u.texelSize, texel[0], texel[1]);
      gl.uniform1i(divergenceP.u.uVelocity, velocity.read.attach(0));
      blit(divergence);
      clearP.bind();
      gl.uniform1i(clearP.u.uTexture, pressure.read.attach(0));
      gl.uniform1f(clearP.u.value, PRESSURE);
      blit(pressure.write);
      pressure.swap();
      pressureP.bind();
      gl.uniform2f(pressureP.u.texelSize, texel[0], texel[1]);
      gl.uniform1i(pressureP.u.uDivergence, divergence.attach(0));
      for (let i = 0, n = P.iterations | 0; i < n; i++) {
        gl.uniform1i(pressureP.u.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }
      gradientP.bind();
      gl.uniform2f(gradientP.u.texelSize, texel[0], texel[1]);
      gl.uniform1i(gradientP.u.uPressure, pressure.read.attach(0));
      gl.uniform1i(gradientP.u.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();
      advectP.bind();
      gl.uniform2f(advectP.u.texelSize, texel[0], texel[1]);
      gl.uniform1i(advectP.u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advectP.u.uSource, velocity.read.attach(0));
      gl.uniform1f(advectP.u.dt, dt);
      gl.uniform1f(advectP.u.dissipation, P.velocity);
      blit(velocity.write);
      velocity.swap();
      gl.uniform1i(advectP.u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advectP.u.uSource, dye.read.attach(1));
      gl.uniform1f(advectP.u.dissipation, P.dye);
      blit(dye.write);
      dye.swap();
    }
    let light = env.theme.mode === "light" ? 1 : 0;
    function display() {
      const paper2 = rgb(env.theme.paper), ink2 = rgb(env.theme.accent);
      displayP.bind();
      gl.uniform2f(displayP.u.texelSize, 1 / cv.width, 1 / cv.height);
      gl.uniform1i(displayP.u.uTexture, dye.read.attach(0));
      gl.uniform3f(displayP.u.uPaper, paper2[0], paper2[1], paper2[2]);
      gl.uniform3f(displayP.u.uInk, ink2[0], ink2[1], ink2[2]);
      gl.uniform1f(displayP.u.uLight, light);
      blit(null);
    }
    const pointer = { x: 0.5, y: 0.5, inside: false, presses: 0, color: tint(0.2), since: 0 };
    let lastAmbient = 0, clock = 0;
    burst(12, 0.42);
    return {
      step(ctx, w2, h2, t, acc, P, M, env2) {
        const dt = Math.min(env2.dt, 1 / 60);
        clock += dt;
        const target = env2.theme.mode === "light" ? 1 : 0;
        light = env2.reducedMotion ? target : light + (target - light) * 0.095;
        if (M.in) {
          const nx = M.x / w2, ny = 1 - M.y / h2;
          if (pointer.inside) {
            const dx = (nx - pointer.x) * SPLAT_FORCE, dy = (ny - pointer.y) * SPLAT_FORCE;
            if (Math.abs(dx) + Math.abs(dy) > 3) {
              if (clock - pointer.since > 2.4) {
                pointer.color = tint(0.2);
                pointer.since = clock;
              }
              splat(nx, ny, dx, dy, pointer.color, P.radius);
            }
          }
          pointer.x = nx;
          pointer.y = ny;
          pointer.inside = true;
        } else {
          pointer.inside = false;
        }
        if (M.presses !== pointer.presses) {
          pointer.presses = M.presses;
          const nx = M.x / w2, ny = 1 - M.y / h2;
          for (let i = 0; i < 6; i++) {
            const a = Math.PI * 2 * i / 6, f = 480 + Math.random() * 380;
            splat(nx, ny, Math.cos(a) * f, Math.sin(a) * f, tint(0.32), P.radius);
          }
        }
        if (P.ambient && clock - lastAmbient > 1.5) {
          lastAmbient = clock;
          const a = Math.random() * Math.PI * 2, f = 340 + Math.random() * 420;
          splat(
            0.1 + Math.random() * 0.8,
            0.15 + Math.random() * 0.7,
            Math.cos(a) * f,
            Math.sin(a) * f,
            tint(0.3),
            0.5 + Math.random() * 0.45
          );
        }
        solve(dt, P);
        display();
      },
      resize() {
        allocate();
        burst(12, 0.42);
      },
      reset() {
        allocate();
        burst(12, 0.42);
      },
      destroy() {
        for (const t of targets) {
          gl.deleteTexture(t.tex);
          gl.deleteFramebuffer(t.fb);
        }
        for (const p of programs) gl.deleteProgram(p);
        for (const s of shaders) gl.deleteShader(s);
        gl.deleteBuffer(vbo);
        gl.deleteBuffer(ibo);
        const lose = gl.getExtension("WEBGL_lose_context");
        if (lose) lose.loseContext();
      }
    };
  }
};

// src/experiments/fourier.js
var fourier_default = {
  id: "fourier",
  name: L("Fourier series", "Serie de Fourier"),
  note: L(
    "Enough circles turning at once will draw any shape.",
    "Suficientes c\xEDrculos girando a la vez dibujan cualquier forma."
  ),
  params: [
    { key: "terms", label: L("Harmonics", "Arm\xF3nicos"), min: 1, max: 20, step: 1, def: 6 },
    { key: "speed", label: L("Speed", "Velocidad"), min: 0, max: 2, step: 0.05, def: 0.6 }
  ],
  make() {
    let trace = [];
    return {
      reset() {
        trace = [];
      },
      step(ctx, w, h, t, acc, P, M) {
        const cx = w * 0.34, cy = h / 2, R = Math.min(w, h) * 0.17;
        const phase = M.in ? M.x / w * 12 : t * P.speed;
        let x = cx, y = cy;
        ctx.lineWidth = 1;
        for (let i = 0; i < (P.terms | 0); i++) {
          const n = i * 2 + 1, r = R * (4 / (n * Math.PI));
          const px = x, py = y;
          x += r * Math.cos(n * phase);
          y += r * Math.sin(n * phase);
          ctx.strokeStyle = `rgba(${acc},0.20)`;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, TAU);
          ctx.stroke();
          ctx.strokeStyle = `rgba(${acc},0.45)`;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        trace.unshift(y);
        if (trace.length > Math.floor(w * 0.6)) trace.pop();
        ctx.strokeStyle = `rgba(${acc},0.85)`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let i = 0; i < trace.length; i++) {
          const tx = w * 0.62 + i, ty = trace[i];
          i ? ctx.lineTo(tx, ty) : ctx.moveTo(tx, ty);
        }
        ctx.stroke();
        ctx.strokeStyle = `rgba(${acc},0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(w * 0.62, trace[0]);
        ctx.stroke();
      }
    };
  }
};

// src/experiments/galaxia.js
var galaxia_default = {
  id: "galaxia",
  name: L("Spiral galaxy", "Galaxia espiral"),
  note: L(
    "Two thousand stars, one law of rotation. The arms wind themselves up.",
    "Dos mil estrellas, una ley de rotaci\xF3n. Los brazos se enrollan solos."
  ),
  params: [
    { key: "brazos", label: L("Arms", "Brazos"), min: 1, max: 6, step: 1, def: 3 },
    { key: "giro", label: L("Pitch g", "Paso g"), min: 1, max: 9, step: 0.1, def: 4.6 },
    { key: "vel", label: L("Rotation \u03C9", "Rotaci\xF3n \u03C9"), min: 0, max: 3, step: 0.05, def: 1 }
  ],
  make() {
    let stars = [];
    const sow = () => {
      stars = [];
      for (let i = 0; i < 2e3; i++) {
        const u = Math.pow(Math.random(), 0.72);
        stars.push({
          u,
          arm: Math.random() * 6 | 0,
          jit: (Math.random() - 0.5) * (0.14 + u * 0.6),
          // arms fray outward
          sz: 0.5 + Math.random() * 1.5,
          tw: Math.random() * Math.PI * 2
        });
      }
    };
    sow();
    return {
      reset() {
        sow();
      },
      step(ctx, w, h, t, acc, P, M) {
        const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.46;
        const inc = M.in ? 0.1 + M.y / h * 1.25 : 0.44;
        const ci = Math.cos(inc);
        ctx.globalCompositeOperation = "lighter";
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
        g.addColorStop(0, `rgba(${acc},0.5)`);
        g.addColorStop(0.3, `rgba(${acc},0.1)`);
        g.addColorStop(1, `rgba(${acc},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * 0.5, R * 0.5 * ci, 0, 0, Math.PI * 2);
        ctx.fill();
        for (const s of stars) {
          const r = 0.05 + s.u * 0.95;
          const om = P.vel / Math.sqrt(r);
          const th = s.arm % P.brazos * (Math.PI * 2 / P.brazos) + P.giro * Math.log(r + 0.12) + s.jit + t * 0.05 * om;
          const x = cx + Math.cos(th) * r * R;
          const y = cy + Math.sin(th) * r * R * ci;
          const b = (0.3 + 0.7 * (1 - s.u)) * (0.74 + 0.26 * Math.sin(t * 2.2 + s.tw));
          ctx.fillStyle = `rgba(${acc},${(b * 0.3).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, s.sz * 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(${acc},${b.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, s.sz * 0.75, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      }
    };
  }
};

// src/experiments/grayscott.js
var grayscott_default = {
  id: "grayscott",
  name: L("Reaction and diffusion", "Reacci\xF3n y difusi\xF3n"),
  note: L(
    "Two chemicals, four numbers. Spots, stripes, mazes, things that divide.",
    "Dos qu\xEDmicos, cuatro n\xFAmeros. Manchas, rayas, laberintos, cosas que se dividen."
  ),
  params: [
    { key: "F", label: L("Feed F", "Alimentaci\xF3n F"), min: 0.01, max: 0.08, step: 1e-3, def: 0.037 },
    { key: "k", label: L("Kill k", "Remoci\xF3n k"), min: 0.045, max: 0.07, step: 5e-4, def: 0.06 },
    { key: "it", label: L("Steps per frame", "Pasos por frame"), min: 1, max: 14, step: 1, def: 6 }
  ],
  make() {
    const N = 150;
    let U = null, V = null, U2 = null, V2 = null;
    const seed = () => {
      U = new Float32Array(N * N).fill(1);
      V = new Float32Array(N * N);
      U2 = new Float32Array(N * N);
      V2 = new Float32Array(N * N);
      for (let q = 0; q < 22; q++) {
        const cx = 10 + (Math.random() * (N - 20) | 0), cy = 10 + (Math.random() * (N - 20) | 0);
        for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
          const k = (cy + dy) * N + (cx + dx);
          U[k] = 0.5;
          V[k] = 0.25;
        }
      }
    };
    seed();
    return {
      reset() {
        seed();
      },
      step(ctx, w, h, t, acc, P, M) {
        if (M.in) {
          const S0 = Math.min(w, h) * 0.8, ox0 = (w - S0) / 2, oy0 = (h - S0) / 2;
          const cx = (M.x - ox0) / S0 * N | 0, cy = (M.y - oy0) / S0 * N | 0;
          for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
            const x = cx + dx, y = cy + dy;
            if (x > 0 && x < N - 1 && y > 0 && y < N - 1) {
              U[y * N + x] = 0.5;
              V[y * N + x] = 0.25;
            }
          }
        }
        const Du = 0.16, Dv = 0.08, F = P.F, kk = P.k;
        for (let s = 0; s < (P.it | 0); s++) {
          for (let y = 1; y < N - 1; y++) {
            for (let x = 1; x < N - 1; x++) {
              const i = y * N + x;
              const lu = U[i - 1] + U[i + 1] + U[i - N] + U[i + N] - 4 * U[i];
              const lv = V[i - 1] + V[i + 1] + V[i - N] + V[i + N] - 4 * V[i];
              const uvv = U[i] * V[i] * V[i];
              U2[i] = U[i] + Du * lu - uvv + F * (1 - U[i]);
              V2[i] = V[i] + Dv * lv + uvv - (F + kk) * V[i];
            }
          }
          const tu = U;
          U = U2;
          U2 = tu;
          const tv = V;
          V = V2;
          V2 = tv;
        }
        const img = ctx.createImageData(N, N), px = img.data;
        const rgb = acc.split(",").map(Number);
        for (let i = 0; i < N * N; i++) {
          const v = Math.min(1, Math.max(0, V[i] * 3.4));
          const o = i * 4;
          px[o] = rgb[0] * v;
          px[o + 1] = rgb[1] * v;
          px[o + 2] = rgb[2] * v;
          px[o + 3] = 255;
        }
        const off = document.createElement("canvas");
        off.width = off.height = N;
        off.getContext("2d").putImageData(img, 0, 0);
        const S = Math.min(w, h) * 0.8;
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, (w - S) / 2, (h - S) / 2, S, S);
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("\u2202U/\u2202t = Du\u2207\xB2U \u2212 UV\xB2 + F(1\u2212U)      \u2202V/\u2202t = Dv\u2207\xB2V + UV\xB2 \u2212 (F+k)V", 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText("F = " + F.toFixed(3) + "   k = " + kk.toFixed(4), 12, h - 12);
      }
    };
  }
};

// src/experiments/handle.js
var handle_default = {
  id: "handle",
  name: L("Two mouths, one plane", "Dos bocas, un plano"),
  note: L(
    "Both ends in the same space. Go in one, come out the other.",
    "Los dos extremos en el mismo espacio. Entras por uno, sales por el otro."
  ),
  params: [
    { key: "R", label: L("Mouth radius", "Radio de boca"), min: 14, max: 60, step: 1, def: 30, unit: "px" },
    { key: "pull", label: L("Gravity", "Gravedad"), min: 0, max: 4, step: 0.1, def: 1.6 },
    { key: "rays", label: L("Rays", "Rayos"), min: 1, max: 40, step: 1, def: 18 }
  ],
  make(w, h) {
    let rays = [], A = [0, 0], B = [0, 0], flash = 0;
    const spawn = (w2, h2) => ({
      p: [Math.random() * w2, -10],
      v: (() => {
        const a = Math.PI * (0.25 + Math.random() * 0.5);
        return [Math.cos(a) * 2.2, Math.sin(a) * 2.2];
      })(),
      tr: [],
      hops: 0
    });
    return {
      reset() {
        rays = [];
        flash = 0;
      },
      step(ctx, w2, h2, t, acc, P, M) {
        const R = P.R;
        A = [w2 * 0.3, h2 * 0.58];
        B = M.in ? [M.x, M.y] : [w2 * 0.72, h2 * 0.4];
        const mouths = [A, B];
        const warp = (x, y) => {
          let ox = x, oy = y;
          for (const m of mouths) {
            const dx = x - m[0], dy = y - m[1], d = Math.hypot(dx, dy) + 1;
            const s = Math.min(R * 1.15, R * R * P.pull * 0.6 / d);
            ox -= dx / d * s;
            oy -= dy / d * s;
          }
          return [ox, oy];
        };
        const STEP = 34;
        ctx.strokeStyle = `rgba(${acc},0.16)`;
        ctx.lineWidth = 1;
        for (let gx = -STEP; gx <= w2 + STEP; gx += STEP) {
          ctx.beginPath();
          for (let gy = -STEP; gy <= h2 + STEP; gy += STEP / 3) {
            const q = warp(gx, gy);
            gy === -STEP ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]);
          }
          ctx.stroke();
        }
        for (let gy = -STEP; gy <= h2 + STEP; gy += STEP) {
          ctx.beginPath();
          for (let gx = -STEP; gx <= w2 + STEP; gx += STEP / 3) {
            const q = warp(gx, gy);
            gx === -STEP ? ctx.moveTo(q[0], q[1]) : ctx.lineTo(q[0], q[1]);
          }
          ctx.stroke();
        }
        while (rays.length < (P.rays | 0)) rays.push(spawn(w2, h2));
        if (rays.length > (P.rays | 0)) rays.length = P.rays | 0;
        for (const r of rays) {
          for (let s = 0; s < 2; s++) {
            for (const m of mouths) {
              const dx = m[0] - r.p[0], dy = m[1] - r.p[1], d = Math.hypot(dx, dy) + 4;
              const a = P.pull * R * R * 0.02 / (d * d);
              r.v[0] += dx / d * a;
              r.v[1] += dy / d * a;
            }
            r.p[0] += r.v[0] * 0.5;
            r.p[1] += r.v[1] * 0.5;
            for (let k = 0; k < 2; k++) {
              const m = mouths[k], o = mouths[1 - k];
              if (Math.hypot(r.p[0] - m[0], r.p[1] - m[1]) < R) {
                const sp = Math.hypot(r.v[0], r.v[1]) || 1;
                const ux = r.v[0] / sp, uy = r.v[1] / sp;
                r.p[0] = o[0] + ux * (R + 1.5);
                r.p[1] = o[1] + uy * (R + 1.5);
                r.tr.push(null);
                r.hops++;
                flash = 1;
                break;
              }
            }
          }
          r.tr.push([r.p[0], r.p[1]]);
          if (r.tr.length > 190) r.tr.shift();
          if (r.p[0] < -60 || r.p[0] > w2 + 60 || r.p[1] < -60 || r.p[1] > h2 + 60) {
            const n = spawn(w2, h2);
            r.p = n.p;
            r.v = n.v;
            r.tr = [];
            r.hops = 0;
          }
          ctx.lineWidth = 1;
          for (let i = 1; i < r.tr.length; i++) {
            if (!r.tr[i] || !r.tr[i - 1]) continue;
            ctx.strokeStyle = `rgba(${acc},${(i / r.tr.length * (r.hops ? 0.75 : 0.4)).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(r.tr[i - 1][0], r.tr[i - 1][1]);
            ctx.lineTo(r.tr[i][0], r.tr[i][1]);
            ctx.stroke();
          }
          ctx.fillStyle = `rgba(${acc},0.95)`;
          ctx.beginPath();
          ctx.arc(r.p[0], r.p[1], 2, 0, TAU);
          ctx.fill();
        }
        flash *= 0.92;
        ctx.strokeStyle = `rgba(${acc},${(0.12 + flash * 0.3).toFixed(2)})`;
        ctx.setLineDash([4, 7]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
        ctx.moveTo(A[0], A[1]);
        ctx.quadraticCurveTo(mx, my - Math.hypot(B[0] - A[0], B[1] - A[1]) * 0.22, B[0], B[1]);
        ctx.stroke();
        ctx.setLineDash([]);
        mouths.forEach((m, i) => {
          const g = ctx.createRadialGradient(m[0], m[1], R * 0.2, m[0], m[1], R);
          g.addColorStop(0, "rgba(0,0,0,0.95)");
          g.addColorStop(1, `rgba(${acc},0.10)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(m[0], m[1], R, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = `rgba(${acc},${(0.75 + flash * 0.25).toFixed(2)})`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(m[0], m[1], R, 0, TAU);
          ctx.stroke();
          ctx.font = "11px monospace";
          ctx.fillStyle = `rgba(${acc},0.8)`;
          ctx.fillText(i ? "B" : "A", m[0] - 3, m[1] - R - 8);
        });
        const sep = Math.hypot(B[0] - A[0], B[1] - A[1]);
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("\u2202A \u2261 \u2202B      the two circles are the same circle", 12, h2 - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText("separation " + sep.toFixed(0) + "px   through the handle 0px", 12, h2 - 12);
      }
    };
  }
};

// src/experiments/hawking.js
var hawking_default = {
  id: "hawking",
  name: L("Hawking radiation", "Radiaci\xF3n de Hawking"),
  note: L(
    "Pairs born at the horizon. One escapes, one falls in, and the hole loses mass.",
    "Pares que nacen en el horizonte. Uno escapa, otro cae, y el agujero pierde masa."
  ),
  params: [
    { key: "mass", label: L("Initial mass", "Masa inicial"), min: 20, max: 120, step: 2, def: 80 },
    { key: "rate", label: L("Evaporation rate", "Ritmo de evaporaci\xF3n"), min: 0, max: 3, step: 0.05, def: 0.6 },
    { key: "pairs", label: L("Pair density", "Densidad de pares"), min: 2, max: 40, step: 1, def: 16 }
  ],
  make() {
    let M = 80, pairs = [], flash = 0;
    return {
      reset() {
        M = 0;
        pairs = [];
        flash = 0;
      },
      step(ctx, w, h, t, acc, P, M0) {
        if (M <= 0) M = P.mass;
        const cx = w / 2, cy = h / 2;
        const rs = M * 0.9;
        const T = 60 / M;
        if (P.rate > 0) M -= P.rate * 40 / (M * M);
        if (M < 6) {
          flash = 1;
          M = P.mass;
          pairs = [];
        }
        flash *= 0.9;
        ctx.strokeStyle = `rgba(${acc},0.22)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.arc(cx, cy, rs * 1.5, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
        const want = P.pairs | 0;
        if (pairs.length < want && Math.random() < 0.5) {
          const a = Math.random() * TAU;
          pairs.push({ a, r: rs, out: 0, life: 0 });
        }
        pairs = pairs.filter((p) => {
          p.life += 0.016;
          p.out += 0.8 + T * 6;
          const ro = rs + p.out, ri = Math.max(0, rs - p.out * 0.55);
          const fade = Math.max(0, 1 - p.out / (Math.min(w, h) * 0.45));
          ctx.fillStyle = `rgba(${acc},${(fade * 0.9).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(cx + ro * Math.cos(p.a), cy + ro * Math.sin(p.a), 1.8, 0, TAU);
          ctx.fill();
          ctx.fillStyle = `rgba(${ink()},${(fade * 0.4).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(cx + ri * Math.cos(p.a), cy + ri * Math.sin(p.a), 1.4, 0, TAU);
          ctx.fill();
          return fade > 0.02;
        });
        const grd = ctx.createRadialGradient(cx, cy, rs * 0.9, cx, cy, rs * 1.25);
        grd.addColorStop(0, "rgba(0,0,0,1)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, rs * 1.25, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(cx, cy, rs, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = `rgba(${acc},${(0.5 + T * 2).toFixed(2)})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, rs, 0, TAU);
        ctx.stroke();
        if (flash > 0.02) {
          ctx.fillStyle = `rgba(${acc},${(flash * 0.5).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(cx, cy, rs * (1 + (1 - flash) * 6), 0, TAU);
          ctx.fill();
        }
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("T \u221D 1/M      L \u221D 1/M\xB2      lifetime \u221D M\xB3", 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText("M = " + M.toFixed(1) + "     T = " + T.toFixed(3) + "  (rising)", 12, h - 12);
      }
    };
  }
};

// src/experiments/interference.js
var interference_default = {
  id: "interference",
  name: L("Interference", "Interferencia"),
  note: L(
    "Two point sources. |\u03C8|\xB2 where their waves overlap.",
    "Dos fuentes puntuales. |\u03C8|\xB2 donde sus ondas se cruzan."
  ),
  params: [
    { key: "lambda", label: L("Wavelength \u03BB", "Longitud de onda \u03BB"), min: 12, max: 70, step: 1, def: 34, unit: "px" },
    { key: "sources", label: L("Sources", "Fuentes"), min: 2, max: 5, step: 1, def: 2 },
    { key: "speed", label: L("Speed", "Velocidad"), min: 0, max: 4, step: 0.1, def: 2.2 }
  ],
  make() {
    return {
      step(ctx, w, h, t, acc, P, M) {
        const STEP = 6, k = TAU / P.lambda;
        const src = [];
        if (M.in) src.push([M.x, M.y, 1]);
        else src.push([w * (0.5 + 0.22 * Math.cos(t * 0.25)), h * 0.36, 1]);
        for (let i = 1; i < P.sources; i++) {
          const a = i / (P.sources - 1) * Math.PI + 0.6;
          src.push([w * (0.5 + 0.3 * Math.cos(a)), h * (0.55 + 0.22 * Math.sin(a)), 0.92]);
        }
        for (let x = STEP / 2; x < w; x += STEP) {
          for (let y = STEP / 2; y < h; y += STEP) {
            let psi = 0;
            for (const s of src) {
              const r = Math.hypot(x - s[0], y - s[1]) + 8;
              psi += s[2] * (22 / Math.sqrt(r)) * Math.cos(k * r - t * P.speed);
            }
            const I = Math.min(1, psi * psi / 9);
            if (I < 0.04) continue;
            ctx.fillStyle = `rgba(${acc},${(0.09 + I * 0.72).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(x, y, 0.5 + I * 2.2, 0, TAU);
            ctx.fill();
          }
        }
        ctx.strokeStyle = `rgba(${acc},0.5)`;
        ctx.lineWidth = 1;
        for (const s of src) {
          ctx.beginPath();
          ctx.arc(s[0], s[1], 3.5, 0, TAU);
          ctx.stroke();
        }
      }
    };
  }
};

// src/experiments/ising.js
function metropolis(sp, N, T, B, flips, rand = Math.random) {
  for (let f = 0; f < flips; f++) {
    const i = rand() * N | 0, j = rand() * N | 0, k = j * N + i;
    const s = sp[k];
    const nb = sp[j * N + (i + 1) % N] + sp[j * N + (i - 1 + N) % N] + sp[(j + 1) % N * N + i] + sp[(j - 1 + N) % N * N + i];
    const dE = 2 * s * (nb + B);
    if (dE <= 0 || rand() < Math.exp(-dE / T)) sp[k] = -s;
  }
  return sp;
}
var ising_default = {
  id: "ising",
  name: L("Ising model", "Modelo de Ising"),
  note: L(
    "Spins that copy their neighbours. Below a critical temperature they all agree.",
    "Espines que copian a sus vecinos. Bajo cierta temperatura todos se ponen de acuerdo."
  ),
  params: [
    { key: "T", label: L("Temperature T", "Temperatura T"), min: 0.4, max: 5, step: 0.02, def: 2.6 },
    { key: "B", label: L("External field", "Campo externo"), min: -0.5, max: 0.5, step: 0.01, def: 0 },
    { key: "sw", label: L("Sweeps per frame", "Barridos por frame"), min: 1, max: 40, step: 1, def: 12 }
  ],
  make() {
    const TC = 2 / Math.log(1 + Math.SQRT2);
    let N = 0, sp = null, hist = [];
    const init = (n) => {
      N = n;
      sp = new Int8Array(N * N).fill(1);
      hist = [];
    };
    return {
      reset() {
        init(N || 110);
      },
      step(ctx, w, h, t, acc, P, M) {
        const n = Math.min(140, Math.max(40, Math.floor(Math.min(w, h) / 4)));
        if (n !== N) init(n);
        const T = M.in ? 0.4 + M.x / w * 4.6 : P.T;
        metropolis(sp, N, T, P.B, (P.sw | 0) * N * N / 6);
        let m = 0;
        for (let i = 0; i < sp.length; i++) m += sp[i];
        m /= sp.length;
        hist.push(Math.abs(m));
        if (hist.length > 240) hist.shift();
        const S = Math.min(w, h) * 0.74, ox = (w - S) / 2, oy = h * 0.06, cs = S / N;
        const img = ctx.createImageData(N, N), px = img.data;
        const rgb = acc.split(",").map(Number);
        for (let k = 0; k < sp.length; k++) {
          const o = k * 4, up = sp[k] > 0;
          px[o] = up ? rgb[0] : 12;
          px[o + 1] = up ? rgb[1] : 12;
          px[o + 2] = up ? rgb[2] : 14;
          px[o + 3] = 255;
        }
        const off = document.createElement("canvas");
        off.width = off.height = N;
        off.getContext("2d").putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(off, ox, oy, S, S);
        ctx.strokeStyle = `rgba(${acc},0.4)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(ox, oy, S, S);
        const gx = ox, gw = S, gy = h * 0.95, gh = h * 0.1;
        ctx.strokeStyle = `rgba(${acc},0.18)`;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx + gw, gy);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${acc},0.9)`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        hist.forEach((v, i) => {
          const X = gx + i / 240 * gw, Y = gy - v * gh;
          i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
        });
        ctx.stroke();
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("T_c = 2/ln(1+\u221A2) = " + TC.toFixed(3) + "   (exact, Onsager 1944)", 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText("T = " + T.toFixed(2) + "   |M| = " + Math.abs(m).toFixed(3) + "   " + (T < TC ? "ordered" : "disordered"), 12, h - 12);
      }
    };
  }
};

// src/experiments/julia.js
var julia_default = {
  id: "julia",
  name: L("Julia set", "Conjunto de Julia"),
  note: L(
    "Same rule, one constant. Move the cursor and the whole shape reorganises.",
    "La misma regla, una constante. Mueve el cursor y la forma entera se reorganiza."
  ),
  params: [
    { key: "iter", label: L("Iterations", "Iteraciones"), min: 40, max: 300, step: 10, def: 120 },
    { key: "res", label: L("Resolution", "Resoluci\xF3n"), min: 90, max: 260, step: 10, def: 170 },
    { key: "orbit", label: L("Auto orbit", "\xD3rbita autom\xE1tica"), min: 0, max: 1, step: 1, def: 1 }
  ],
  make() {
    let img = null, off = null, key = "";
    return {
      step(ctx, w, h, t, acc, P, M) {
        const RES = P.res | 0, IT = P.iter | 0;
        const th = M.in ? M.x / w * TAU : t * 0.12;
        const radial = M.in ? (M.y / h - 0.5) * 0.3 : 0;
        const k1 = 1 + radial;
        const jr = (0.5 * Math.cos(th) - 0.25 * Math.cos(2 * th)) * k1;
        const ji = (0.5 * Math.sin(th) - 0.25 * Math.sin(2 * th)) * k1;
        const k = [RES, IT, jr.toFixed(5), ji.toFixed(5), acc].join("|");
        if (k !== key) {
          key = k;
          if (!img || img.width !== RES) {
            img = ctx.createImageData(RES, RES);
            off = document.createElement("canvas");
            off.width = off.height = RES;
          }
          const rgb = acc.split(",").map(Number), px = img.data, scale = 3;
          for (let j = 0; j < RES; j++) {
            const y0 = (j / RES - 0.5) * scale;
            for (let i = 0; i < RES; i++) {
              const x0 = (i / RES - 0.5) * scale;
              let x = x0, y = y0, n = 0, x2 = x * x, y2 = y * y;
              while (x2 + y2 <= 4 && n < IT) {
                y = 2 * x * y + ji;
                x = x2 - y2 + jr;
                x2 = x * x;
                y2 = y * y;
                n++;
              }
              const o = (j * RES + i) * 4;
              if (n >= IT) {
                px[o] = px[o + 1] = px[o + 2] = 0;
                px[o + 3] = 255;
              } else {
                const mu = n + 1 - Math.log(Math.log(Math.sqrt(x2 + y2))) / Math.LN2;
                const v = Math.pow(Math.max(0, mu) / IT, 0.34);
                const band = 0.5 + 0.5 * Math.cos(Math.sqrt(Math.max(0, mu)) * 2.1 - 1.1);
                const m1 = 0.3 + 0.7 * band, m2 = (1 - band) * 0.55;
                px[o] = Math.min(255, rgb[0] * v * m1 + 245 * v * m2);
                px[o + 1] = Math.min(255, rgb[1] * v * m1 + 248 * v * m2);
                px[o + 2] = Math.min(255, rgb[2] * v * m1 + 255 * v * m2);
                px[o + 3] = 255;
              }
            }
          }
          off.getContext("2d").putImageData(img, 0, 0);
        }
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, 0, 0, w, h);
        ctx.fillStyle = `rgba(${acc},0.85)`;
        ctx.font = "11px monospace";
        ctx.fillText("c = " + jr.toFixed(3) + (ji >= 0 ? " + " : " \u2212 ") + Math.abs(ji).toFixed(3) + "i", 12, h - 12);
      }
    };
  }
};

// src/experiments/kepler.js
var EPS2 = 0.25;
var SUBSTEPS = 64;
function keplerAccel(b, cx, cy, GM, pointer, perturb) {
  const dx = cx - b.x, dy = cy - b.y, q = dx * dx + dy * dy + EPS2;
  const k = GM / (q * Math.sqrt(q));
  let ax = dx * k, ay = dy * k;
  if (pointer && pointer.in && perturb) {
    const ux = pointer.x - b.x, uy = pointer.y - b.y, ur = Math.hypot(ux, uy) + 14;
    ax += ux / ur * (perturb / (ur * ur));
    ay += uy / ur * (perturb / (ur * ur));
  }
  return [ax, ay];
}
function keplerFrame(b, cx, cy, GM, pointer, perturb) {
  const h = 1 / SUBSTEPS;
  let a = keplerAccel(b, cx, cy, GM, pointer, perturb);
  for (let i = 0; i < SUBSTEPS; i++) {
    b.vx += a[0] * h / 2;
    b.vy += a[1] * h / 2;
    b.x += b.vx * h;
    b.y += b.vy * h;
    a = keplerAccel(b, cx, cy, GM, pointer, perturb);
    b.vx += a[0] * h / 2;
    b.vy += a[1] * h / 2;
  }
  return b;
}
var kepler_default = {
  id: "kepler",
  name: L("Kepler orbits", "\xD3rbitas de Kepler"),
  note: L(
    "Equal areas in equal times. The law Newton later explained.",
    "\xC1reas iguales en tiempos iguales. La ley que Newton explic\xF3 despu\xE9s."
  ),
  params: [
    { key: "ecc", label: L("Eccentricity", "Excentricidad"), min: 0, max: 0.9, step: 0.01, def: 0.55 },
    { key: "planets", label: L("Planets", "Planetas"), min: 1, max: 6, step: 1, def: 3 },
    { key: "perturb", label: L("Cursor mass", "Masa del cursor"), min: 0, max: 4e3, step: 100, def: 900 }
  ],
  make(w, h) {
    let ps = [];
    const seed = (w2, h2, ecc) => {
      ps = [];
      const cx = w2 / 2, cy = h2 / 2;
      for (let i = 0; i < 6; i++) {
        const r = Math.min(w2, h2) * (0.12 + i * 0.055);
        const vc = Math.sqrt(2600 / r) * Math.sqrt(1 - ecc);
        ps.push({ x: cx + r, y: cy, vx: 0, vy: vc, p: [], area: [] });
      }
    };
    let lw = w, lh = h;
    seed(w, h, 0.55);
    return {
      resize(w2, h2) {
        lw = w2;
        lh = h2;
        seed(w2, h2, 0.55);
      },
      reset() {
        seed(lw, lh, 0.55);
      },
      step(ctx, w2, h2, t, acc, P, M) {
        const cx = w2 / 2, cy = h2 / 2, GM = 2600;
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, TAU);
        ctx.fill();
        if (M.in && P.perturb) {
          ctx.strokeStyle = `rgba(${acc},0.4)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(M.x, M.y, 4 + P.perturb / 900, 0, TAU);
          ctx.stroke();
        }
        const n = P.planets | 0;
        for (let i = 0; i < n && i < ps.length; i++) {
          const b = ps[i];
          keplerFrame(b, cx, cy, GM, M, P.perturb);
          b.p.push([b.x, b.y]);
          if (b.p.length > 700) b.p.shift();
          ctx.strokeStyle = `rgba(${acc},0.35)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          b.p.forEach((q, k) => k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]));
          ctx.stroke();
          if (i === 0 && b.p.length > 12) {
            ctx.fillStyle = `rgba(${acc},0.14)`;
            for (let k = b.p.length - 1; k > b.p.length - 60 && k > 11; k -= 12) {
              ctx.beginPath();
              ctx.moveTo(cx, cy);
              ctx.lineTo(b.p[k][0], b.p[k][1]);
              ctx.lineTo(b.p[k - 11][0], b.p[k - 11][1]);
              ctx.closePath();
              ctx.fill();
            }
          }
          ctx.fillStyle = `rgba(${acc},0.95)`;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 3, 0, TAU);
          ctx.fill();
        }
      }
    };
  }
};

// src/experiments/lorenz.js
var lorenzField = (x, y, z, P) => [P.sigma * (y - x), x * (P.rho - z) - y, x * y - P.beta * z];
function lorenzStep(s, P, dt) {
  const [x, y, z] = s, h = dt / 2;
  const k1 = lorenzField(x, y, z, P);
  const k2 = lorenzField(x + h * k1[0], y + h * k1[1], z + h * k1[2], P);
  const k3 = lorenzField(x + h * k2[0], y + h * k2[1], z + h * k2[2], P);
  const k4 = lorenzField(x + dt * k3[0], y + dt * k3[1], z + dt * k3[2], P);
  s[0] = x + dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
  s[1] = y + dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
  s[2] = z + dt / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
  return s;
}
var lorenz_default = {
  id: "lorenz",
  name: L("Lorenz attractor", "Atractor de Lorenz"),
  note: L(
    "Deterministic and unpredictable. Never repeats, never escapes.",
    "Determinista e impredecible. Nunca se repite, nunca se escapa."
  ),
  params: [
    { key: "rho", label: L("Rayleigh \u03C1", "Rayleigh \u03C1"), min: 1, max: 60, step: 0.5, def: 28 },
    { key: "sigma", label: L("Prandtl \u03C3", "Prandtl \u03C3"), min: 1, max: 20, step: 0.5, def: 10 },
    { key: "beta", label: L("Geometry \u03B2", "Geometr\xEDa \u03B2"), min: 0.5, max: 5, step: 0.05, def: 8 / 3 }
  ],
  make() {
    let s = [0.01, 0, 0], trail = [];
    return {
      reset() {
        s = [0.01, 0, 0];
        trail = [];
      },
      step(ctx, w, h, t, acc, P, M) {
        const dt = 5e-3;
        for (let i = 0; i < 14; i++) {
          lorenzStep(s, P, dt);
          trail.push([s[0], s[1], s[2]]);
        }
        if (trail.length > 2600) trail.splice(0, trail.length - 2600);
        const ang = M.in ? (M.x / w - 0.5) * 2.4 : 0;
        const ca = Math.cos(ang), sa = Math.sin(ang);
        const sc = Math.min(w, h) / 62, cx = w / 2, cy = h / 2 + h * 0.22;
        const px = (p) => cx + (p[0] * ca - p[1] * sa) * sc;
        const py = (p) => cy - p[2] * sc;
        ctx.lineWidth = 1;
        for (let i = 1; i < trail.length; i++) {
          ctx.strokeStyle = `rgba(${acc},${(i / trail.length * 0.75).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(px(trail[i - 1]), py(trail[i - 1]));
          ctx.lineTo(px(trail[i]), py(trail[i]));
          ctx.stroke();
        }
      }
    };
  }
};

// src/experiments/mandelbrot.js
var mandelbrot_default = {
  id: "mandelbrot",
  name: L("Mandelbrot set", "Conjunto de Mandelbrot"),
  note: L(
    "One line of algebra, repeated. The edge never stops having detail.",
    "Una l\xEDnea de \xE1lgebra, repetida. El borde nunca deja de tener detalle."
  ),
  params: [
    { key: "zoom", label: L("Zoom", "Zoom"), min: 0, max: 14, step: 0.05, def: 0 },
    { key: "iter", label: L("Iterations", "Iteraciones"), min: 40, max: 400, step: 10, def: 140 },
    { key: "res", label: L("Resolution", "Resoluci\xF3n"), min: 90, max: 260, step: 10, def: 170 }
  ],
  make() {
    let img = null, off = null, key = "";
    let cx = -0.743643887037151, cy = 0.13182590420533;
    return {
      reset() {
        cx = -0.743643887037151;
        cy = 0.13182590420533;
      },
      step(ctx, w, h, t, acc, P, M) {
        const RES = P.res | 0, IT = P.iter | 0;
        const scale = 3.2 / Math.pow(2, P.zoom);
        if (M.in) {
          cx += (M.x / w - 0.5) * scale * 6e-3;
          cy += (M.y / h - 0.5) * scale * (h / w) * 6e-3;
          cx = Math.max(-2.3, Math.min(0.9, cx));
          cy = Math.max(-1.3, Math.min(1.3, cy));
        }
        const k = [RES, IT, P.zoom.toFixed(3), cx.toFixed(12), cy.toFixed(12), acc].join("|");
        if (k !== key) {
          key = k;
          if (!img || img.width !== RES) {
            img = ctx.createImageData(RES, RES);
            off = document.createElement("canvas");
            off.width = off.height = RES;
          }
          const rgb = acc.split(",").map(Number), px = img.data;
          for (let j = 0; j < RES; j++) {
            const y0 = cy + (j / RES - 0.5) * scale;
            for (let i = 0; i < RES; i++) {
              const x0 = cx + (i / RES - 0.5) * scale;
              let x = 0, y = 0, n = 0, x2 = 0, y2 = 0;
              while (x2 + y2 <= 4 && n < IT) {
                y = 2 * x * y + y0;
                x = x2 - y2 + x0;
                x2 = x * x;
                y2 = y * y;
                n++;
              }
              const o = (j * RES + i) * 4;
              if (n >= IT) {
                px[o] = px[o + 1] = px[o + 2] = 0;
                px[o + 3] = 255;
              } else {
                const mu = n + 1 - Math.log(Math.log(Math.sqrt(x2 + y2))) / Math.LN2;
                const v = Math.pow(Math.max(0, mu) / IT, 0.32);
                const band = 0.5 + 0.5 * Math.cos(Math.sqrt(Math.max(0, mu)) * 2 - 1.1);
                const m1 = 0.3 + 0.7 * band, m2 = (1 - band) * 0.55;
                px[o] = Math.min(255, rgb[0] * v * m1 + 245 * v * m2);
                px[o + 1] = Math.min(255, rgb[1] * v * m1 + 248 * v * m2);
                px[o + 2] = Math.min(255, rgb[2] * v * m1 + 255 * v * m2);
                px[o + 3] = 255;
              }
            }
          }
          off.getContext("2d").putImageData(img, 0, 0);
        }
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, 0, 0, w, h);
        ctx.fillStyle = `rgba(${acc},0.85)`;
        ctx.font = "11px monospace";
        ctx.fillText("zoom \xD7" + Math.pow(2, P.zoom).toFixed(0), 12, h - 12);
      }
    };
  }
};

// src/experiments/neural.js
var neural_default = {
  id: "neural",
  name: L("A network thinking", "Una red pensando"),
  note: L(
    "Signal entering on the left and spreading. Node brightness is activation.",
    "Se\xF1al entrando por la izquierda y propag\xE1ndose. El brillo del nodo es su activaci\xF3n."
  ),
  params: [
    { key: "depth", label: L("Layers", "Capas"), min: 2, max: 6, step: 1, def: 4 },
    { key: "width", label: L("Units per layer", "Neuronas por capa"), min: 3, max: 14, step: 1, def: 9 },
    { key: "speed", label: L("Signal speed", "Velocidad de la se\xF1al"), min: 0.2, max: 3, step: 0.1, def: 1 }
  ],
  make() {
    let Wt = [], D = 0, N = 0;
    const rnd = () => (Math.random() * 2 - 1) * 1.4;
    function build(depth, width) {
      D = depth;
      N = width;
      Wt = [];
      for (let l = 0; l < D; l++) {
        const inN = l === 0 ? 2 : N;
        Wt.push(Array.from(
          { length: l === D - 1 ? 1 : N },
          () => Array.from({ length: inN }, rnd)
        ));
      }
    }
    build(4, 9);
    return {
      reset() {
        build(D, N);
      },
      step(ctx, w, h, t, acc, P, M) {
        if ((P.depth | 0) !== D || (P.width | 0) !== N) build(P.depth | 0, P.width | 0);
        const ix = M.in ? M.x / w * 2 - 1 : Math.cos(t * 0.5) * 0.8;
        const iy = M.in ? M.y / h * 2 - 1 : Math.sin(t * 0.7) * 0.8;
        const acts = [[ix, iy]];
        for (let l = 0; l < D; l++) {
          const prev = acts[acts.length - 1], out2 = [];
          for (const row of Wt[l]) {
            let z = 0;
            for (let k = 0; k < row.length; k++) z += row[k] * prev[k];
            out2.push(Math.tanh(z));
          }
          acts.push(out2);
        }
        const front = t * P.speed * 0.6 % (D + 2);
        const reach = (l) => Math.max(0, Math.min(1, front - l));
        const padX = w * 0.12, spanX = w - padX * 2;
        const colX = (i) => padX + spanX * i / (acts.length - 1);
        const nodeY = (layer, i) => {
          const n = layer.length;
          return h * 0.5 + (i - (n - 1) / 2) * Math.min(h * 0.11, h * 0.8 / Math.max(n, 1));
        };
        for (let l = 0; l < D; l++) {
          const from = acts[l], to = acts[l + 1], g = reach(l);
          if (g <= 0) continue;
          for (let j = 0; j < to.length; j++) {
            for (let k = 0; k < from.length; k++) {
              const wgt = Wt[l][j][k];
              const flow = Math.abs(wgt * from[k]) * g;
              if (flow < 0.03) continue;
              ctx.lineWidth = 0.4 + Math.min(1.6, Math.abs(wgt) * 0.8);
              ctx.strokeStyle = wgt >= 0 ? `rgba(${acc},${Math.min(0.6, flow * 0.55).toFixed(3)})` : `rgba(${ink()},${Math.min(0.35, flow * 0.3).toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(colX(l), nodeY(from, k));
              ctx.lineTo(colX(l + 1), nodeY(to, j));
              ctx.stroke();
            }
          }
        }
        for (let l = 0; l < acts.length; l++) {
          const layer = acts[l], g = reach(l - 1) || (l === 0 ? 1 : 0);
          for (let i = 0; i < layer.length; i++) {
            const a = Math.abs(layer[i]) * (l === 0 ? 1 : g);
            const x = colX(l), y = nodeY(layer, i);
            ctx.fillStyle = `rgba(${acc},${(0.05 + a * 0.12).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(x, y, 5 + a * 13, 0, TAU);
            ctx.fill();
            ctx.fillStyle = layer[i] >= 0 ? `rgba(${acc},${(0.25 + a * 0.75).toFixed(3)})` : `rgba(${ink()},${(0.2 + a * 0.6).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(x, y, 2.4 + a * 3.4, 0, TAU);
            ctx.fill();
          }
        }
        const out = acts[acts.length - 1][0];
        ctx.fillStyle = `rgba(${acc},0.85)`;
        ctx.font = "11px monospace";
        ctx.fillText("in (" + ix.toFixed(2) + ", " + iy.toFixed(2) + ")", 12, h - 28);
        ctx.fillText("out " + out.toFixed(3), 12, h - 12);
      }
    };
  }
};

// src/experiments/optimizers.js
var optimizers_default = {
  id: "optimizers",
  name: L("How a model learns", "C\xF3mo aprende un modelo"),
  note: L(
    "The same slope, three ways down. Momentum and Adam against plain descent.",
    "La misma pendiente, tres formas de bajar. Momentum y Adam contra el descenso simple."
  ),
  params: [
    { key: "lr", label: L("Learning rate", "Tasa de aprendizaje"), min: 1e-3, max: 0.06, step: 1e-3, def: 0.012 },
    { key: "land", label: L("Landscape", "Paisaje"), min: 0, max: 2, step: 1, def: 0 },
    { key: "run", label: L("Restart", "Reiniciar"), min: 0, max: 1, step: 1, def: 0 }
  ],
  make() {
    let R = [], lastRun = 0, lastLand = -1;
    const f = (x, y, L2) => L2 === 0 ? (1 - x) ** 2 + 12 * (y - x * x) ** 2 : L2 === 1 ? x * x - y * y + 0.35 * (x ** 4 + y ** 4) : x * x + y * y + 1.6 * (Math.sin(3 * x) + Math.sin(3 * y));
    const grad = (x, y, L2) => {
      const e = 1e-3;
      return [
        (f(x + e, y, L2) - f(x - e, y, L2)) / (2 * e),
        (f(x, y + e, L2) - f(x, y - e, L2)) / (2 * e)
      ];
    };
    const START = [[-1.4, 1.6], [1.6, 1e-3], [2.05, 2.05]];
    const seed = (land) => {
      const [sx, sy] = START[land] || START[0];
      R = [
        { n: "SGD", x: sx, y: sy, p: [], vx: 0, vy: 0, mx: 0, my: 0, sx: 0, sy: 0, t: 0 },
        { n: "momentum", x: sx, y: sy, p: [], vx: 0, vy: 0, mx: 0, my: 0, sx: 0, sy: 0, t: 0 },
        { n: "Adam", x: sx, y: sy, p: [], vx: 0, vy: 0, mx: 0, my: 0, sx: 0, sy: 0, t: 0 }
      ];
    };
    seed(0);
    return {
      reset() {
        seed(lastLand < 0 ? 0 : lastLand);
      },
      step(ctx, w, h, t, acc, P, M) {
        const LAND = P.land | 0;
        if (P.run !== lastRun || LAND !== lastLand) {
          lastRun = P.run;
          lastLand = LAND;
          seed(LAND);
        }
        const S = Math.min(w, h) * 0.42, cx = w / 2, cy = h / 2;
        const toS = (x, y) => [cx + x * S / 2.2, cy - y * S / 2.2];
        const RES = 90, vals = [];
        let mn = 1e9, mx = -1e9;
        for (let j = 0; j < RES; j++) for (let i = 0; i < RES; i++) {
          const x = i / RES * 4.4 - 2.2, y = j / RES * 4.4 - 2.2;
          const v = Math.log(1 + Math.max(0, f(x, y, LAND) + 4));
          vals.push(v);
          if (v < mn) mn = v;
          if (v > mx) mx = v;
        }
        const img = ctx.createImageData(RES, RES), px = img.data;
        const rgb = acc.split(",").map(Number);
        for (let k = 0; k < vals.length; k++) {
          const u = (vals[k] - mn) / (mx - mn + 1e-9);
          const band = 0.5 + 0.5 * Math.cos(u * 34);
          const a = (1 - u) * 0.5 + band * 0.12;
          const o = k * 4;
          px[o] = rgb[0] * a;
          px[o + 1] = rgb[1] * a;
          px[o + 2] = rgb[2] * a;
          px[o + 3] = 255;
        }
        const off = document.createElement("canvas");
        off.width = off.height = RES;
        off.getContext("2d").putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, cx - S, cy - S, S * 2, S * 2);
        const lr = P.lr;
        R.forEach((r) => {
          const [gx, gy] = grad(r.x, r.y, LAND);
          r.t++;
          if (r.n === "SGD") {
            r.x -= lr * gx;
            r.y -= lr * gy;
          } else if (r.n === "momentum") {
            r.vx = 0.9 * r.vx - lr * gx;
            r.vy = 0.9 * r.vy - lr * gy;
            r.x += r.vx;
            r.y += r.vy;
          } else {
            const b1 = 0.9, b2 = 0.999, e = 1e-8;
            r.mx = b1 * r.mx + (1 - b1) * gx;
            r.my = b1 * r.my + (1 - b1) * gy;
            r.sx = b2 * r.sx + (1 - b2) * gx * gx;
            r.sy = b2 * r.sy + (1 - b2) * gy * gy;
            const mhx = r.mx / (1 - Math.pow(b1, r.t)), mhy = r.my / (1 - Math.pow(b1, r.t));
            const shx = r.sx / (1 - Math.pow(b2, r.t)), shy = r.sy / (1 - Math.pow(b2, r.t));
            r.x -= lr * 8 * mhx / (Math.sqrt(shx) + e);
            r.y -= lr * 8 * mhy / (Math.sqrt(shy) + e);
          }
          r.x = Math.max(-2.2, Math.min(2.2, r.x));
          r.y = Math.max(-2.2, Math.min(2.2, r.y));
          r.p.push([r.x, r.y]);
          if (r.p.length > 900) r.p.shift();
        });
        const style = ["0.45", "0.7", "1"];
        R.forEach((r, i) => {
          ctx.strokeStyle = `rgba(${acc},${style[i]})`;
          ctx.lineWidth = 1 + i * 0.5;
          ctx.beginPath();
          r.p.forEach((q, k) => {
            const p2 = toS(q[0], q[1]);
            k ? ctx.lineTo(p2[0], p2[1]) : ctx.moveTo(p2[0], p2[1]);
          });
          ctx.stroke();
          const p = toS(r.x, r.y);
          ctx.fillStyle = `rgba(${acc},${style[i]})`;
          ctx.beginPath();
          ctx.arc(p[0], p[1], 3.6, 0, TAU);
          ctx.fill();
          ctx.font = "11px monospace";
          ctx.fillText(r.n + "  loss " + f(r.x, r.y, LAND).toFixed(3), 14, 48 + i * 16);
        });
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText([
          "Rosenbrock \u2014 a narrow curved valley",
          "saddle \u2014 flat in one direction, steep in the other",
          "bumpy bowl \u2014 local minima everywhere"
        ][LAND], 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText("same start, same learning rate " + lr.toFixed(3) + "   steps " + R[0].t, 12, h - 12);
      }
    };
  }
};

// src/experiments/oscillators.js
var oscillators_default = {
  id: "oscillators",
  name: L("Coupled oscillators", "Osciladores acoplados"),
  note: L(
    "Two masses, one spring between them. Energy moves back and forth on its own.",
    "Dos masas, un resorte entre ellas. La energ\xEDa va y viene sola."
  ),
  params: [
    { key: "kc", label: L("Coupling", "Acoplamiento"), min: 0, max: 0.6, step: 0.01, def: 0.18 },
    { key: "k", label: L("Stiffness", "Rigidez"), min: 0.2, max: 3, step: 0.05, def: 1 },
    { key: "mass", label: L("Mass ratio", "Raz\xF3n de masas"), min: 0.4, max: 3, step: 0.05, def: 1 }
  ],
  make() {
    let x1 = 1, x2 = 0, v1 = 0, v2 = 0, h1 = [], h2 = [];
    return {
      reset() {
        x1 = 1;
        x2 = 0;
        v1 = v2 = 0;
        h1 = [];
        h2 = [];
      },
      step(ctx, w, h, t, acc, P, M) {
        if (M.in) {
          x1 = (M.y / h - 0.5) * 2;
          v1 = 0;
        }
        const dt = 0.12;
        for (let i = 0; i < 3; i++) {
          const a1 = -P.k * x1 - P.kc * (x1 - x2);
          const a2 = (-P.k * x2 - P.kc * (x2 - x1)) / P.mass;
          v1 += a1 * dt;
          v2 += a2 * dt;
          x1 += v1 * dt;
          x2 += v2 * dt;
        }
        h1.push(x1);
        h2.push(x2);
        if (h1.length > w * 0.5) {
          h1.shift();
          h2.shift();
        }
        const cy = h * 0.32, A = h * 0.16, xa = w * 0.26, xb = w * 0.62;
        ctx.strokeStyle = `rgba(${acc},0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xa, cy + x1 * A);
        ctx.lineTo(xb, cy + x2 * A);
        ctx.stroke();
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.beginPath();
        ctx.arc(xa, cy + x1 * A, 7, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(xb, cy + x2 * A, 7 * Math.sqrt(P.mass), 0, TAU);
        ctx.fill();
        const y0 = h * 0.74, s = h * 0.1;
        [[h1, 0.85], [h2, 0.4]].forEach(([arr, al]) => {
          ctx.strokeStyle = `rgba(${acc},${al})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          arr.forEach((v, k) => {
            const X = w * 0.06 + k * 2, Y = y0 + v * s;
            k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
          });
          ctx.stroke();
        });
      }
    };
  }
};

// src/experiments/pendulum.js
function pendulumAccel(a1, a2, v1, v2, g, m1, m2, l1, l2) {
  const sin = Math.sin, cos = Math.cos;
  const d = 2 * m1 + m2 - m2 * cos(2 * a1 - 2 * a2);
  const n1 = -g * (2 * m1 + m2) * sin(a1) - m2 * g * sin(a1 - 2 * a2) - 2 * sin(a1 - a2) * m2 * (v2 * v2 * l2 + v1 * v1 * l1 * cos(a1 - a2));
  const n2 = 2 * sin(a1 - a2) * (v1 * v1 * l1 * (m1 + m2) + g * (m1 + m2) * cos(a1) + v2 * v2 * l2 * m2 * cos(a1 - a2));
  return [n1 / (l1 * d), n2 / (l2 * d)];
}
function pendulumStep(s, g, m1, m2, l1, l2, h, damp) {
  const f = (a12, a22, v12, v22) => {
    const acc = pendulumAccel(a12, a22, v12, v22, g, m1, m2, l1, l2);
    return [v12, v22, acc[0], acc[1]];
  };
  const { a1, a2, v1, v2 } = s, k = h / 2;
  const k1 = f(a1, a2, v1, v2);
  const k2 = f(a1 + k * k1[0], a2 + k * k1[1], v1 + k * k1[2], v2 + k * k1[3]);
  const k3 = f(a1 + k * k2[0], a2 + k * k2[1], v1 + k * k2[2], v2 + k * k2[3]);
  const k4 = f(a1 + h * k3[0], a2 + h * k3[1], v1 + h * k3[2], v2 + h * k3[3]);
  s.a1 = a1 + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
  s.a2 = a2 + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
  s.v1 = (v1 + h / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])) * damp;
  s.v2 = (v2 + h / 6 * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3])) * damp;
  return s;
}
var pendulum_default = {
  id: "pendulum",
  name: L("Double pendulum", "P\xE9ndulo doble"),
  note: L(
    "Two rods, one equation, and no way to predict minute two.",
    "Dos barras, una ecuaci\xF3n, y ninguna forma de predecir el minuto dos."
  ),
  params: [
    { key: "g", label: L("Gravity", "Gravedad"), min: 0.1, max: 2, step: 0.05, def: 0.6 },
    { key: "damp", label: L("Damping", "Amortiguaci\xF3n"), min: 0.99, max: 1, step: 5e-4, def: 0.9999 },
    { key: "m2", label: L("Lower mass", "Masa inferior"), min: 1, max: 40, step: 1, def: 10 }
  ],
  make() {
    const start = () => ({ a1: Math.PI / 2 + 0.6, a2: Math.PI / 2 + 0.4, v1: 0, v2: 0 });
    let st = start(), trace = [];
    return {
      reset() {
        st = start();
        trace = [];
      },
      step(ctx, w, h, t, acc, P, M) {
        const m1 = 10, m2 = P.m2, l1 = Math.min(w, h) * 0.2, l2 = Math.min(w, h) * 0.2, g = P.g;
        const ox = w / 2, oy = h * 0.34;
        if (M.in) {
          st.a1 = st.a2 = Math.atan2(M.x - ox, M.y - oy);
          st.v1 = st.v2 = 0;
          trace.length = 0;
        } else {
          for (let i = 0; i < 3; i++) pendulumStep(st, g, m1, m2, l1, l2, 0.05, P.damp);
        }
        const { a1, a2 } = st;
        const x1 = ox + l1 * Math.sin(a1), y1 = oy + l1 * Math.cos(a1);
        const x2 = x1 + l2 * Math.sin(a2), y2 = y1 + l2 * Math.cos(a2);
        trace.push([x2, y2]);
        if (trace.length > 900) trace.shift();
        for (let i = 1; i < trace.length; i++) {
          ctx.strokeStyle = `rgba(${acc},${(i / trace.length * 0.5).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(trace[i - 1][0], trace[i - 1][1]);
          ctx.lineTo(trace[i][0], trace[i][1]);
          ctx.stroke();
        }
        ctx.strokeStyle = `rgba(${acc},0.85)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.fillStyle = `rgba(${acc},0.95)`;
        [[x1, y1, 2.6], [x2, y2, 2 + m2 * 0.12]].forEach((p) => {
          ctx.beginPath();
          ctx.arc(p[0], p[1], p[2], 0, TAU);
          ctx.fill();
        });
      }
    };
  }
};

// src/experiments/phyllotaxis.js
var phyllotaxis_default = {
  id: "phyllotaxis",
  name: L("Phyllotaxis", "Filotaxis"),
  note: L(
    "The golden angle. The same packing a sunflower solved first.",
    "El \xE1ngulo \xE1ureo. El mismo empaquetado que un girasol resolvi\xF3 antes."
  ),
  params: [
    { key: "angle", label: L("Divergence angle", "\xC1ngulo de divergencia"), min: 130, max: 145, step: 0.01, def: 137.507, unit: "\xB0" },
    { key: "count", label: L("Seeds", "Semillas"), min: 60, max: 900, step: 10, def: 420 },
    { key: "spread", label: L("Spread", "Dispersi\xF3n"), min: 0.01, max: 0.06, step: 2e-3, def: 0.028 }
  ],
  make() {
    return {
      step(ctx, w, h, t, acc, P, M) {
        const GA = P.angle * Math.PI / 180;
        const n = P.count | 0, sc = Math.min(w, h) * P.spread, cx = w / 2, cy = h / 2;
        const spin = M.in ? (M.x / w - 0.5) * 6 : t * 0.12;
        for (let i = 0; i < n; i++) {
          const a = i * GA + spin, r = sc * Math.sqrt(i);
          const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
          const f = i / n;
          ctx.fillStyle = `rgba(${acc},${(0.15 + f * 0.7).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, 0.8 + f * 2.1, 0, TAU);
          ctx.fill();
        }
      }
    };
  }
};

// src/experiments/quantum.js
var quantum_default = {
  id: "quantum",
  name: L("Particle in a box", "Part\xEDcula en una caja"),
  note: L(
    "Two states added together. The probability sloshes and never settles.",
    "Dos estados sumados. La probabilidad chapotea y nunca se asienta."
  ),
  params: [
    { key: "n1", label: L("State n\u2081", "Estado n\u2081"), min: 1, max: 6, step: 1, def: 1 },
    { key: "n2", label: L("State n\u2082", "Estado n\u2082"), min: 1, max: 8, step: 1, def: 2 },
    { key: "mix", label: L("Mix", "Mezcla"), min: 0, max: 1, step: 0.01, def: 0.5 }
  ],
  make() {
    return {
      step(ctx, w, h, t, acc, P, M) {
        const pad = w * 0.08, L2 = w - pad * 2, base = h * 0.55, A = h * 0.16;
        const mix = M.in ? Math.min(1, Math.max(0, M.x / w)) : P.mix;
        const a = Math.sqrt(1 - mix), b = Math.sqrt(mix);
        const n1 = P.n1 | 0, n2 = P.n2 | 0;
        const E1 = n1 * n1 * 0.35, E2 = n2 * n2 * 0.35;
        ctx.strokeStyle = `rgba(${acc},0.35)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad, h * 0.12);
        ctx.lineTo(pad, h * 0.9);
        ctx.moveTo(pad + L2, h * 0.12);
        ctx.lineTo(pad + L2, h * 0.9);
        ctx.stroke();
        let reP = [], imP = [], pr = [];
        for (let i = 0; i <= 220; i++) {
          const u = i / 220, x = pad + u * L2;
          const f1 = Math.sin(n1 * Math.PI * u), f2 = Math.sin(n2 * Math.PI * u);
          const re = a * f1 * Math.cos(-E1 * t) + b * f2 * Math.cos(-E2 * t);
          const im = a * f1 * Math.sin(-E1 * t) + b * f2 * Math.sin(-E2 * t);
          reP.push([x, base - re * A]);
          imP.push([x, base - im * A]);
          pr.push([x, base - (re * re + im * im) * A * 1.5]);
        }
        const line = (pts, alpha, lw) => {
          ctx.strokeStyle = `rgba(${acc},${alpha})`;
          ctx.lineWidth = lw;
          ctx.beginPath();
          pts.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
          ctx.stroke();
        };
        line(reP, 0.35, 1);
        line(imP, 0.22, 1);
        line(pr, 0.95, 1.6);
        ctx.fillStyle = `rgba(${acc},0.8)`;
        ctx.font = "11px monospace";
        ctx.fillText("|\u03C8|\xB2  n\u2081=" + n1 + "  n\u2082=" + n2, 12, 20);
      }
    };
  }
};

// src/experiments/quasar.js
var quasar_default = {
  id: "quasar",
  name: L("Quasar", "Cu\xE1sar"),
  note: L(
    "An accretion disk and two jets. One side is brighter, and that is relativity.",
    "Un disco de acreci\xF3n y dos chorros. Un lado brilla m\xE1s, y eso es relatividad."
  ),
  params: [
    { key: "incl", label: L("Inclination", "Inclinaci\xF3n"), min: 0.05, max: 1.5, step: 0.02, def: 0.42 },
    { key: "jet", label: L("Jet power", "Potencia del chorro"), min: 0, max: 3, step: 0.05, def: 1.2 },
    { key: "beam", label: L("Beaming \u03B2", "Beaming \u03B2"), min: 0, max: 0.9, step: 0.02, def: 0.55 }
  ],
  make(w, h) {
    let disk = [], jet = [], phi = 0;
    const seed = (w2, h2) => {
      disk = [];
      jet = [];
      const R = Math.min(w2, h2);
      for (let i = 0; i < 900; i++) {
        const u = Math.pow(Math.random(), 0.6);
        disk.push({ r: R * (0.07 + u * 0.34), a: Math.random() * TAU });
      }
    };
    seed(w, h);
    return {
      resize(w2, h2) {
        seed(w2, h2);
      },
      reset() {
        seed(w, h);
        jet = [];
      },
      step(ctx, w2, h2, t, acc, P, M) {
        const incl = M.in ? 0.05 + M.y / h2 * 1.45 : P.incl;
        if (M.in) phi = M.x / w2 * TAU;
        else phi += 2e-3;
        const cx = w2 / 2, cy = h2 / 2;
        const ky = Math.sin(incl), kz = Math.cos(incl);
        const rgb = acc.split(",").map(Number);
        if (P.jet > 0 && jet.length < 260) {
          for (let k = 0; k < 2; k++)
            jet.push({ z: 0, dir: k ? 1 : -1, o: (Math.random() - 0.5) * 14, v: 2 + Math.random() * 3 });
        }
        jet = jet.filter((j) => {
          j.z += j.dir * j.v * P.jet;
          const far = Math.abs(j.z) > Math.min(w2, h2) * 0.62;
          const y = cy - j.z * kz, x = cx + j.o;
          const fade = 1 - Math.abs(j.z) / (Math.min(w2, h2) * 0.62);
          ctx.fillStyle = `rgba(${acc},${(fade * 0.5).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, TAU);
          ctx.fill();
          return !far;
        });
        for (const d of disk) {
          d.a += 2.2 / Math.pow(d.r, 1.5) * 60;
          const ax = d.a + phi;
          const x = d.r * Math.cos(ax), y = d.r * Math.sin(ax);
          const sx = cx + x, sy = cy + y * ky;
          const beta = P.beam * Math.min(1, Math.min(w2, h2) * 0.12 / d.r);
          const g = 1 / Math.sqrt(1 - beta * beta);
          const cosTh = -Math.sin(ax) * Math.cos(incl);
          const delta = 1 / (g * (1 - beta * cosTh));
          const b = Math.min(1, Math.pow(delta, 3) * 0.18);
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${b.toFixed(3)})`;
          ctx.fillRect(sx, sy, 1.6, 1.6);
        }
        const R0 = Math.min(w2, h2) * 0.05;
        const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, R0);
        g2.addColorStop(0, `rgba(${core()},0.9)`);
        g2.addColorStop(0.4, `rgba(${acc},0.7)`);
        g2.addColorStop(1, `rgba(${acc},0)`);
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(cx, cy, R0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(cx, cy, R0 * 0.28, 0, TAU);
        ctx.fill();
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("\u03B4 = 1/(\u03B3(1 \u2212 \u03B2\xB7cos\u03B8))     brightness \u221D \u03B4\xB3", 12, h2 - 28);
        ctx.fillStyle = `rgba(${acc},0.9)`;
        ctx.fillText("inclination " + (incl * 57.3).toFixed(0) + "\xB0     \u03B2 = " + P.beam.toFixed(2), 12, h2 - 12);
      }
    };
  }
};

// src/experiments/radiation.js
var radiation_default = {
  id: "radiation",
  name: L("Why light exists", "Por qu\xE9 existe la luz"),
  note: L(
    "Field lines drawn from the retarded position. Shake a charge and you see the kink leave.",
    "L\xEDneas de campo desde la posici\xF3n retardada. Sacude una carga y ves salir el quiebre."
  ),
  params: [
    { key: "mode", label: L("Motion", "Movimiento"), min: 0, max: 2, step: 1, def: 0 },
    { key: "beta", label: L("Speed (v/c)", "Rapidez (v/c)"), min: 0.05, max: 0.75, step: 0.01, def: 0.35 },
    { key: "lines", label: L("Field lines", "L\xEDneas de campo"), min: 8, max: 40, step: 2, def: 24 }
  ],
  make() {
    const DT = 1 / 120, C = 210;
    let hist = [], st = 0, acct = 0;
    const posAt = (tt, mode, beta, w, h) => {
      const LAM = Math.min(w, h) * 0.38, om = TAU * C / LAM, A = beta * C / om;
      if (mode === 0) return [w / 2 + A * Math.sin(om * tt), h / 2];
      if (mode === 1) return [w / 2 + A * Math.cos(om * tt), h / 2 + A * Math.sin(om * tt)];
      const AB = LAM * 0.18, T = AB * 4 / (beta * C), ph = (tt % T + T) % T;
      const x = ph < T / 2 ? -AB + ph / (T / 2) * 2 * AB : AB - (ph - T / 2) / (T / 2) * 2 * AB;
      return [w / 2 + x, h / 2];
    };
    return {
      reset() {
        hist = [];
        st = 0;
        acct = 0;
      },
      step(ctx, w, h, t, acc, P, M) {
        const mode = P.mode | 0;
        const RMAX = Math.hypot(w, h) * 0.52;
        const need = Math.ceil(RMAX / (C * DT)) + 4;
        if (hist.length < need)
          for (let i = hist.length; i < need; i++) hist.push(posAt(st - i * DT, mode, P.beta, w, h));
        acct += 1 / 60;
        while (st < acct) {
          st += DT;
          hist.unshift(posAt(st, mode, P.beta, w, h));
          if (hist.length > need) hist.length = need;
        }
        const N = P.lines | 0, dr = C * DT * 2;
        for (let k = 0; k < N; k++) {
          const th = k / N * TAU;
          const ct = Math.cos(th), sn = Math.sin(th);
          ctx.beginPath();
          let started = false;
          for (let r = 6; r < RMAX; r += dr) {
            const idx = Math.min(hist.length - 1, Math.round(r / (C * DT)));
            const p = hist[idx];
            const x = p[0] + r * ct, y = p[1] + r * sn;
            started ? ctx.lineTo(x, y) : (ctx.moveTo(x, y), started = true);
          }
          ctx.strokeStyle = `rgba(${acc},0.42)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        const now = hist[0];
        ctx.fillStyle = `rgba(${acc},1)`;
        ctx.beginPath();
        ctx.arc(now[0], now[1], 4.5, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = `rgba(${acc},0.14)`;
        ctx.beginPath();
        ctx.arc(now[0], now[1], 5.5, 0, TAU);
        ctx.stroke();
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText([
          "dipole \u2014 the textbook antenna",
          "circular \u2014 this is synchrotron light",
          "hard turns \u2014 every kink is a burst"
        ][mode], 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText("v/c = " + P.beta.toFixed(2) + "   lines point at the charge as it was r/c ago", 12, h - 12);
      }
    };
  }
};

// src/experiments/refraction.js
var refraction_default = {
  id: "refraction",
  name: L("Snell and the trapped ray", "Snell y el rayo atrapado"),
  note: L(
    "Tilt the beam past the critical angle and the interface turns into a mirror.",
    "Inclina el haz m\xE1s all\xE1 del \xE1ngulo cr\xEDtico y la interfaz se vuelve espejo."
  ),
  params: [
    { key: "n1", label: L("n above", "n arriba"), min: 1, max: 2.6, step: 0.01, def: 1.5 },
    { key: "n2", label: L("n below", "n abajo"), min: 1, max: 2.6, step: 0.01, def: 1 },
    { key: "ang", label: L("Angle of incidence", "\xC1ngulo de incidencia"), min: 1, max: 89, step: 0.5, def: 35 }
  ],
  make() {
    return {
      step(ctx, w, h, t, acc, P, M) {
        const iy = h * 0.52, ox = w * 0.5;
        const n1 = P.n1, n2 = P.n2;
        let th1 = P.ang * Math.PI / 180;
        if (M.in && M.y < iy) th1 = Math.max(0.02, Math.min(1.55, Math.atan2(Math.abs(M.x - ox), Math.max(6, iy - M.y))));
        const s2 = n1 / n2 * Math.sin(th1);
        const tir = s2 > 1;
        const th2 = tir ? 0 : Math.asin(s2);
        const critical = n1 > n2 ? Math.asin(n2 / n1) : null;
        const c1 = Math.cos(th1), c2 = Math.cos(th2);
        const rs = tir ? 1 : ((n1 * c1 - n2 * c2) / (n1 * c1 + n2 * c2)) ** 2;
        const rp = tir ? 1 : ((n1 * c2 - n2 * c1) / (n1 * c2 + n2 * c1)) ** 2;
        const R = (rs + rp) / 2, T = 1 - R;
        ctx.fillStyle = `rgba(${acc},0.07)`;
        ctx.fillRect(0, 0, w, iy);
        ctx.fillStyle = `rgba(${acc},0.03)`;
        ctx.fillRect(0, iy, w, h - iy);
        ctx.strokeStyle = `rgba(${acc},0.45)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, iy);
        ctx.lineTo(w, iy);
        ctx.stroke();
        ctx.setLineDash([3, 5]);
        ctx.strokeStyle = `rgba(${acc},0.28)`;
        ctx.beginPath();
        ctx.moveTo(ox, 12);
        ctx.lineTo(ox, h - 44);
        ctx.stroke();
        ctx.setLineDash([]);
        const Lr = Math.min(w, h) * 0.46;
        const beam = (x1, y1, x2, y2, a, wd) => {
          ctx.strokeStyle = `rgba(${acc},${a.toFixed(3)})`;
          ctx.lineWidth = wd;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
          const ux = dx / len, uy = dy / len, sp = 14;
          const ph = t * 60 % sp;
          ctx.lineWidth = 1;
          for (let d = ph; d < len; d += sp) {
            const px = x1 + ux * d, py = y1 + uy * d;
            ctx.strokeStyle = `rgba(${acc},${(a * 0.5).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(px - uy * 4, py + ux * 4);
            ctx.lineTo(px + uy * 4, py - ux * 4);
            ctx.stroke();
          }
        };
        beam(ox - Math.sin(th1) * Lr, iy - Math.cos(th1) * Lr, ox, iy, 0.95, 2);
        beam(ox, iy, ox + Math.sin(th1) * Lr, iy - Math.cos(th1) * Lr, 0.25 + R * 0.7, 1 + R * 2.5);
        if (!tir) beam(ox, iy, ox + Math.sin(th2) * Lr, iy + Math.cos(th2) * Lr, 0.25 + T * 0.7, 1 + T * 2.5);
        if (critical !== null) {
          ctx.setLineDash([2, 4]);
          ctx.strokeStyle = `rgba(${acc},0.3)`;
          ctx.beginPath();
          ctx.moveTo(ox - Math.sin(critical) * Lr, iy - Math.cos(critical) * Lr);
          ctx.lineTo(ox, iy);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = "10px monospace";
          ctx.fillStyle = `rgba(${acc},0.5)`;
          ctx.fillText(
            "\u03B8c = " + (critical * 180 / Math.PI).toFixed(1) + "\xB0",
            ox - Math.sin(critical) * Lr - 4,
            iy - Math.cos(critical) * Lr - 6
          );
        }
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.6)`;
        ctx.fillText("n\u2081 = " + n1.toFixed(2), 12, 20);
        ctx.fillText("n\u2082 = " + n2.toFixed(2), 12, iy + 20);
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("n\u2081 sin \u03B8\u2081 = n\u2082 sin \u03B8\u2082        reflectance from Fresnel", 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText(tir ? "\u03B8\u2081 = " + (th1 * 180 / Math.PI).toFixed(1) + "\xB0  \xB7  total internal reflection  \xB7  R = 100%" : "\u03B8\u2081 = " + (th1 * 180 / Math.PI).toFixed(1) + "\xB0   \u03B8\u2082 = " + (th2 * 180 / Math.PI).toFixed(1) + "\xB0   R = " + (R * 100).toFixed(1) + "%   T = " + (T * 100).toFixed(1) + "%", 12, h - 12);
      }
    };
  }
};

// src/experiments/relativity.js
var relativity_default = {
  id: "relativity",
  name: L("Special relativity", "Relatividad especial"),
  note: L(
    "A light clock, seen from two frames. Same bounces, different elapsed time.",
    "Un reloj de luz visto desde dos marcos. Mismos rebotes, distinto tiempo transcurrido."
  ),
  params: [
    {
      key: "vista",
      label: L("View: 0 same frame \xB7 1 two frames", "Vista: 0 un marco \xB7 1 dos marcos"),
      min: 0,
      max: 1,
      step: 1,
      def: 1
    },
    { key: "beta", label: L("Speed \u03B2 = v/c", "Velocidad \u03B2 = v/c"), min: 0, max: 0.98, step: 5e-3, def: 0.6 },
    { key: "rate", label: L("Clock rate", "Ritmo del reloj"), min: 0.3, max: 2.5, step: 0.05, def: 1 },
    { key: "trail", label: L("Path memory", "Memoria del camino"), min: 0, max: 900, step: 20, def: 420 }
  ],
  make() {
    let ph = 0, lab = 0, tau = 0, ticksM = 0, ticksR = 0, path = [], px0 = 0;
    let xL = 0, yL = 0, prevPm = 1, upL = -1, legs = 0;
    let sIzq = 0, sDer = 0, ultIzq = null, ultDer = null;
    const tri = (u) => Math.abs((u % 2 + 2) % 2 - 1);
    return {
      reset() {
        ph = 0;
        lab = 0;
        tau = 0;
        ticksM = ticksR = 0;
        path = [];
        px0 = 0;
        xL = 0;
        yL = 0;
        prevPm = 1;
        upL = -1;
        legs = 0;
        sIzq = 0;
        sDer = 0;
        ultIzq = null;
        ultDer = null;
      },
      step(ctx, w, h, t, acc, P, M) {
        const beta = M.in ? Math.min(0.98, Math.max(0, M.x / w)) : P.beta;
        const g = 1 / Math.sqrt(1 - beta * beta);
        const dt = 0.016 * P.rate;
        const dos = (P.vista | 0) === 1;
        ctx.font = "11px monospace";
        if (dos) {
          const prev = ph;
          ph += dt * 1.2 / g;
          if (Math.floor(ph) !== Math.floor(prev)) legs++;
          const p = tri(ph);
          const H2 = h * 0.28;
          const topA = h * 0.08, botA = topA + H2;
          const topB = h * 0.46, botB = topB + H2;
          const cV = 1.2 * H2;
          const mirror = (x, y0, y1, wide2, a) => {
            ctx.strokeStyle = `rgba(${acc},${a})`;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(x - wide2 / 2, y0);
            ctx.lineTo(x + wide2 / 2, y0);
            ctx.moveTo(x - wide2 / 2, y1);
            ctx.lineTo(x + wide2 / 2, y1);
            ctx.stroke();
          };
          const wide = Math.min(w * 0.09, 84);
          const ax = w * 0.5, ay = topA + H2 * p;
          mirror(ax, topA, botA, wide, 0.5);
          ctx.strokeStyle = `rgba(${acc},0.18)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ax, topA);
          ctx.lineTo(ax, botA);
          ctx.stroke();
          ctx.fillStyle = `rgba(${acc},0.95)`;
          ctx.beginPath();
          ctx.arc(ax, ay, 4.2, 0, TAU);
          ctx.fill();
          const pad2 = w * 0.1, span2 = w + 2 * pad2;
          if (!px0) px0 = pad2 + w * 0.3;
          px0 += beta * cV * dt;
          let reinicio = false;
          if (px0 > span2) {
            px0 -= span2;
            path.length = 0;
            reinicio = true;
          }
          const bx = -pad2 + px0, by = topB + H2 * p;
          path.push([bx, by]);
          const keep2 = P.trail | 0;
          if (keep2 === 0) path.length = 0;
          else if (path.length > keep2) path.splice(0, path.length - keep2);
          ctx.lineWidth = 1.1;
          for (let k = 1; k < path.length; k++) {
            if (Math.abs(path[k][0] - path[k - 1][0]) > w * 0.5) continue;
            ctx.strokeStyle = `rgba(${acc},${(k / path.length * 0.5).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(path[k - 1][0], path[k - 1][1]);
            ctx.lineTo(path[k][0], path[k][1]);
            ctx.stroke();
          }
          mirror(bx, topB, botB, wide / g, 0.9);
          ctx.strokeStyle = `rgba(${acc},0.18)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bx, topB);
          ctx.lineTo(bx, botB);
          ctx.stroke();
          ctx.fillStyle = `rgba(${acc},1)`;
          ctx.beginPath();
          ctx.arc(bx, by, 4.2, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = `rgba(${acc},0.12)`;
          ctx.lineWidth = 1;
          ctx.setLineDash([1, 5]);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax, ay + (topB - topA));
          ctx.stroke();
          ctx.setLineDash([]);
          if (ultIzq) {
            const d = Math.hypot(ax - ultIzq[0], ay - ultIzq[1]);
            if (d < H2) sIzq += d;
          }
          if (ultDer && !reinicio) {
            const d = Math.hypot(bx - ultDer[0], by - ultDer[1]);
            if (d < H2) sDer += d;
          }
          ultIzq = [ax, ay];
          ultDer = [bx, by];
          ctx.fillStyle = `rgba(${acc},0.5)`;
          ctx.fillText("en el marco del reloj", 14, topA - 10);
          ctx.fillText("en tu marco", 14, topB - 10);
          const propio = (sIzq / cV).toFixed(2);
          const tuyo = (sDer / cV).toFixed(2);
          const medido = sIzq > 1 ? sDer / sIzq : 1;
          ctx.fillStyle = `rgba(${acc},0.9)`;
          ctx.fillText("reloj del cohete  \u03C4 = " + propio + " s     tu reloj  t = " + tuyo + " s", 12, h - 44);
          ctx.fillStyle = `rgba(${acc},0.55)`;
          ctx.fillText("mismos " + legs + " rebotes \xB7 arriba se ve lenta porque ese reloj corre lento en tu tiempo", 12, h - 28);
          ctx.fillStyle = `rgba(${acc},0.95)`;
          ctx.fillText("\u03B2 = " + beta.toFixed(3) + "    \u03B3 = " + g.toFixed(3) + "    t/\u03C4 medido = " + medido.toFixed(3), 12, h - 12);
          return;
        }
        const topY = h * 0.2, botY = h * 0.62, H = botY - topY;
        const restX = w * 0.13;
        const prevR = lab;
        lab += dt;
        const pr = tri(lab * 1.2);
        if (Math.floor(lab * 1.2) !== Math.floor(prevR * 1.2)) ticksR++;
        const prevT = tau;
        tau += dt / g;
        const pm = tri(tau * 1.2);
        if (Math.floor(tau * 1.2) !== Math.floor(prevT * 1.2)) ticksM++;
        const cLuz = 1.2 * H;
        const pad = w * 0.1;
        const span = w + 2 * pad;
        if (!px0) px0 = pad + w * 0.32;
        px0 = px0 + beta * cLuz * dt;
        if (px0 > span) {
          px0 -= span;
          path.length = 0;
        }
        const cxm = -pad + px0;
        const phY = topY + H * pm;
        path.push([cxm, phY]);
        const keep = P.trail | 0;
        if (keep === 0) path.length = 0;
        else if (path.length > keep) path.splice(0, path.length - keep);
        ctx.lineWidth = 1;
        for (let i = 1; i < path.length; i++) {
          if (Math.abs(path[i][0] - path[i - 1][0]) > w * 0.5) continue;
          ctx.strokeStyle = `rgba(${acc},${(i / path.length * 0.55).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(path[i - 1][0], path[i - 1][1]);
          ctx.lineTo(path[i][0], path[i][1]);
          ctx.stroke();
        }
        const mirror2 = (x, alpha, wide) => {
          ctx.strokeStyle = `rgba(${acc},${alpha})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(x - wide / 2, topY);
          ctx.lineTo(x + wide / 2, topY);
          ctx.moveTo(x - wide / 2, botY);
          ctx.lineTo(x + wide / 2, botY);
          ctx.stroke();
        };
        mirror2(restX, 0.3, w * 0.07);
        ctx.strokeStyle = `rgba(${acc},0.18)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(restX, topY);
        ctx.lineTo(restX, botY);
        ctx.stroke();
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.beginPath();
        ctx.arc(restX, topY + H * pr, 3.2, 0, TAU);
        ctx.fill();
        mirror2(cxm, 0.9, w * 0.07 / g);
        ctx.fillStyle = `rgba(${acc},1)`;
        ctx.beginPath();
        ctx.arc(cxm, phY, 3.8, 0, TAU);
        ctx.fill();
        const rulerY = h * 0.79, L0 = w * 0.16;
        ctx.strokeStyle = `rgba(${acc},0.25)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(restX - L0 / 2, rulerY);
        ctx.lineTo(restX + L0 / 2, rulerY);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${acc},0.85)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cxm - L0 / (2 * g), rulerY);
        ctx.lineTo(cxm + L0 / (2 * g), rulerY);
        ctx.stroke();
        ctx.fillStyle = `rgba(${acc},0.9)`;
        ctx.fillText("\u03B2 = " + beta.toFixed(3) + "    \u03B3 = " + g.toFixed(3), 12, h - 44);
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("rest   " + ticksR + " ticks", 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText("moving " + ticksM + " ticks    ratio " + (ticksR ? (ticksM / ticksR).toFixed(3) : "\u2014") + "   1/\u03B3 = " + (1 / g).toFixed(3), 12, h - 12);
      }
    };
  }
};

// src/experiments/rule30.js
var rule30_default = {
  id: "rule30",
  name: L("Rule 30", "Regla 30"),
  note: L(
    "One line, one rule, applied forever. The result looks random.",
    "Una l\xEDnea, una regla, aplicada infinitas veces. El resultado parece azar."
  ),
  params: [
    { key: "rule", label: L("Rule number", "N\xFAmero de regla"), min: 0, max: 255, step: 1, def: 30 },
    { key: "cell", label: L("Cell size", "Tama\xF1o de celda"), min: 2, max: 8, step: 1, def: 3, unit: "px" }
  ],
  make(w) {
    let cols = 0, row = null, y = 0, lastCell = 0;
    const seed = (c) => {
      row = new Uint8Array(c);
      row[c >> 1] = 1;
      y = 0;
    };
    return {
      persist: true,
      resize() {
        cols = 0;
      },
      reset() {
        cols = 0;
      },
      step(ctx, w2, h, t, acc, P, M) {
        const CELL = P.cell | 0;
        if (!cols || CELL !== lastCell) {
          lastCell = CELL;
          cols = Math.max(8, Math.floor(w2 / CELL));
          seed(cols);
          ctx.clearRect(0, 0, w2, h);
        }
        if (y * CELL > h) {
          seed(cols);
          ctx.clearRect(0, 0, w2, h);
        }
        ctx.fillStyle = `rgba(${acc},0.8)`;
        for (let i = 0; i < cols; i++) if (row[i]) ctx.fillRect(i * CELL, y * CELL, CELL - 0.6, CELL - 0.6);
        const R = P.rule | 0, next = new Uint8Array(cols);
        for (let i = 0; i < cols; i++) {
          const l = row[(i - 1 + cols) % cols], c = row[i], r = row[(i + 1) % cols];
          const idx = l << 2 | c << 1 | r;
          next[i] = R >> idx & 1;
        }
        row = next;
        y++;
      }
    };
  }
};

// src/experiments/shortcut.js
var shortcut_default = {
  id: "shortcut",
  name: L("Looking through", "Mirar a trav\xE9s"),
  note: L(
    "Ray-traced view into an Ellis wormhole. Two skies in one image.",
    "Vista trazada por rayos hacia un agujero de Ellis. Dos cielos en una imagen."
  ),
  params: [
    { key: "b0", label: L("Throat radius b\u2080", "Radio de garganta b\u2080"), min: 0.2, max: 3, step: 0.05, def: 1 },
    { key: "dist", label: L("Camera distance", "Distancia de la c\xE1mara"), min: 1.5, max: 14, step: 0.25, def: 5 },
    { key: "fov", label: L("Field of view", "Campo de visi\xF3n"), min: 30, max: 140, step: 2, def: 90, unit: "\xB0" }
  ],
  make() {
    const N = 512;
    let lut = null, key = "", img = null, off = null, ikey = "";
    function buildLUT(b0, l0, fovRad) {
      const r0 = Math.sqrt(b0 * b0 + l0 * l0);
      const t = new Float32Array(N);
      const side = new Uint8Array(N);
      const LINF = 260;
      for (let i = 0; i < N; i++) {
        const psi = i / (N - 1) * (fovRad / 2);
        const b = r0 * Math.sin(psi);
        let l = l0, phi = 0, dir = -1;
        const dphi = 4e-3;
        let guard = 0;
        while (guard++ < 6e3) {
          const r2 = b0 * b0 + l * l;
          const s = 1 - b * b / r2;
          if (s <= 0) {
            dir = -dir;
            l += dir * 1e-3;
            continue;
          }
          const dl = dir * (r2 / Math.max(b, 1e-6)) * Math.sqrt(s);
          l += dl * dphi;
          phi += dphi;
          if (l > LINF || l < -LINF) break;
        }
        side[i] = l < 0 ? 1 : 0;
        t[i] = phi;
      }
      return { t, side, r0 };
    }
    function sky(which, th, az, rgb, px, o) {
      const hash = (a, b) => {
        const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
        return s - Math.floor(s);
      };
      const K = which ? 34 : 22;
      const u = th * K, v = az * K * 0.5;
      let star = 0;
      for (let du = -1; du <= 0; du++) {
        for (let dv = -1; dv <= 0; dv++) {
          const cu = Math.floor(u) + du, cv = Math.floor(v) + dv;
          const h1 = hash(cu, cv);
          if (h1 < (which ? 0.28 : 0.16)) continue;
          const sx = cu + hash(cu + 3.3, cv), sy = cv + hash(cu, cv + 7.7);
          const d = Math.hypot(u - sx, v - sy);
          const mag = 0.35 + hash(cv, cu) * 0.65;
          star = Math.max(star, Math.max(0, 1 - d / 0.42) * mag);
        }
      }
      star = Math.pow(star, 1.7);
      const gA = Math.abs(th * (which ? 7 : 4) % 1 - 0.5);
      const gB = Math.abs(az * (which ? 7 : 4) % 1 - 0.5);
      const grid = Math.max(0, 0.5 - Math.min(gA, gB)) * (which ? 0.2 : 0.13);
      if (which) {
        px[o] = Math.min(255, 205 * star + 110 * grid);
        px[o + 1] = Math.min(255, 222 * star + 130 * grid);
        px[o + 2] = Math.min(255, 255 * star + 165 * grid);
      } else {
        px[o] = Math.min(255, rgb[0] * star + rgb[0] * grid);
        px[o + 1] = Math.min(255, rgb[1] * star + rgb[1] * grid);
        px[o + 2] = Math.min(255, rgb[2] * star + rgb[2] * grid);
      }
      px[o + 3] = 255;
    }
    return {
      reset() {
        key = "";
        ikey = "";
      },
      step(ctx, w, h, t, acc, P, M) {
        const b0 = P.b0, l0 = P.dist, fov = P.fov * Math.PI / 180;
        const spin = M.in ? M.x / w * TAU : t * 0.05;
        const RES = 300;
        const k = [b0.toFixed(2), l0.toFixed(2), P.fov].join("|");
        if (k !== key) {
          key = k;
          lut = buildLUT(b0, l0, fov);
          ikey = "";
        }
        const ik = [k, acc].join("|");
        if (ik !== ikey) {
          ikey = ik;
          if (!img || img.width !== RES) {
            img = ctx.createImageData(RES, RES);
            off = document.createElement("canvas");
            off.width = off.height = RES;
          }
          const rgb = acc.split(",").map(Number), px = img.data;
          const half = RES / 2, tanH = Math.tan(fov / 2);
          for (let j = 0; j < RES; j++) {
            const dy = (j - half) / half;
            for (let i = 0; i < RES; i++) {
              const dx = (i - half) / half;
              const rad = Math.hypot(dx, dy);
              const o = (j * RES + i) * 4;
              const psi = Math.atan(rad * tanH);
              const idx = Math.min(N - 1, Math.round(psi / (fov / 2) * (N - 1)));
              const az = Math.atan2(dy, dx);
              sky(lut.side[idx], lut.t[idx], az, rgb, px, o);
            }
          }
          off.getContext("2d").putImageData(img, 0, 0);
        }
        const S = Math.max(w, h) * 1.45;
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(spin);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, -S / 2, -S / 2, S, S);
        ctx.restore();
        let edge = 0;
        for (let i = 0; i < N; i++) if (lut.side[i]) edge = i;
        const psiE = (edge + 0.5) / (N - 1) * (fov / 2);
        const rE = Math.tan(psiE) / Math.tan(fov / 2);
        ctx.strokeStyle = `rgba(${acc},0.5)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, rE * S / 2, 0, TAU);
        ctx.stroke();
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("dl/d\u03C6 = \xB1(r\xB2/b)\xB7\u221A(1 \u2212 b\xB2/r\xB2)      r\xB2 = b\u2080\xB2 + l\xB2", 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        const frac = lut.side.reduce((a, b) => a + b, 0) / N;
        ctx.fillText("b\u2080 = " + b0.toFixed(2) + "   camera l = " + l0.toFixed(1) + "   other sky covers " + (frac * 100).toFixed(0) + "% of the view", 12, h - 12);
      }
    };
  }
};

// src/experiments/spacetime.js
var spacetime_default = {
  id: "spacetime",
  name: L("Curved spacetime", "Espaciotiempo curvo"),
  note: L(
    "The embedding diagram of a black hole. Orbits are straight lines on a bent surface.",
    "El diagrama de embebimiento de un agujero negro. Las \xF3rbitas son rectas sobre una superficie doblada."
  ),
  params: [
    { key: "rs", label: L("Schwarzschild radius", "Radio de Schwarzschild"), min: 4, max: 40, step: 1, def: 16, unit: "px" },
    { key: "tilt", label: L("View angle", "\xC1ngulo de vista"), min: 0.1, max: 0.9, step: 0.02, def: 0.42 },
    { key: "orbit", label: L("Orbiting particles", "Part\xEDculas en \xF3rbita"), min: 0, max: 6, step: 1, def: 3 }
  ],
  make(w, h) {
    let bodies = [], lw = w, lh = h;
    const seed = (w2, h2) => {
      bodies = [];
      for (let i = 0; i < 6; i++) {
        const r = Math.min(w2, h2) * (0.14 + i * 0.05), a = i * 1.7;
        const v = Math.sqrt(2200 / r);
        bodies.push({
          x: r * Math.cos(a),
          y: r * Math.sin(a),
          vx: -Math.sin(a) * v,
          vy: Math.cos(a) * v,
          p: []
        });
      }
    };
    seed(w, h);
    return {
      resize(w2, h2) {
        lw = w2;
        lh = h2;
        seed(w2, h2);
      },
      reset() {
        seed(lw, lh);
      },
      step(ctx, w2, h2, t, acc, P, M) {
        const cx = M.in ? M.x : w2 / 2, cy = (M.in ? M.y : h2 / 2) - h2 * 0.06;
        const rs = P.rs, tilt = P.tilt, DEPTH = 1.5;
        const zOf = (r) => 2 * Math.sqrt(rs * Math.max(0, r - rs));
        const proj = (dx, dy) => {
          const r = Math.hypot(dx, dy);
          const z = zOf(Math.max(r, rs));
          return [cx + dx, cy + dy * tilt + (zOf(600) - z) * DEPTH * tilt];
        };
        ctx.lineWidth = 1;
        const RINGS = 16, SPOKES = 32, RMAX = Math.max(w2, h2) * 0.62;
        for (let i = 1; i <= RINGS; i++) {
          const r = rs + Math.pow(i / RINGS, 1.7) * RMAX;
          ctx.strokeStyle = `rgba(${acc},${(0.3 - i * 0.012).toFixed(3)})`;
          ctx.beginPath();
          for (let k = 0; k <= SPOKES; k++) {
            const a = k / SPOKES * TAU;
            const p = proj(r * Math.cos(a), r * Math.sin(a));
            k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
          }
          ctx.stroke();
        }
        ctx.strokeStyle = `rgba(${acc},0.14)`;
        for (let k = 0; k < SPOKES; k++) {
          const a = k / SPOKES * TAU;
          ctx.beginPath();
          for (let i = 0; i <= RINGS; i++) {
            const r = rs + Math.pow(i / RINGS, 1.7) * RMAX;
            const p = proj(r * Math.cos(a), r * Math.sin(a));
            i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
          }
          ctx.stroke();
        }
        ctx.strokeStyle = `rgba(${acc},0.9)`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let k = 0; k <= SPOKES; k++) {
          const a = k / SPOKES * TAU;
          const p = proj(rs * Math.cos(a), rs * Math.sin(a));
          k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
        }
        ctx.stroke();
        const n = P.orbit | 0;
        for (let i = 0; i < n && i < bodies.length; i++) {
          const b = bodies[i];
          for (let s = 0; s < 2; s++) {
            const r = Math.hypot(b.x, b.y) + 4;
            const a = 2200 / (r * r) * 0.5;
            b.vx -= b.x / r * a;
            b.vy -= b.y / r * a;
            b.x += b.vx * 0.5;
            b.y += b.vy * 0.5;
          }
          b.p.push([b.x, b.y]);
          if (b.p.length > 520) b.p.shift();
          ctx.strokeStyle = `rgba(${acc},0.6)`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          b.p.forEach((q, k) => {
            const pr = proj(q[0], q[1]);
            k ? ctx.lineTo(pr[0], pr[1]) : ctx.moveTo(pr[0], pr[1]);
          });
          ctx.stroke();
          const pb = proj(b.x, b.y);
          ctx.fillStyle = `rgba(${acc},0.95)`;
          ctx.beginPath();
          ctx.arc(pb[0], pb[1], 3.2, 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${acc},0.75)`;
        ctx.font = "11px monospace";
        ctx.fillText("r_s = " + rs + "px", 12, h2 - 12);
      }
    };
  }
};

// src/experiments/ulam.js
var ulam_default = {
  id: "ulam",
  name: L("Ulam spiral", "Espiral de Ulam"),
  note: L(
    "Primes on a square spiral. Nobody knows why the diagonals are there.",
    "Primos en una espiral cuadrada. Nadie sabe por qu\xE9 est\xE1n las diagonales."
  ),
  params: [
    { key: "size", label: L("Grid", "Rejilla"), min: 60, max: 400, step: 10, def: 200 },
    { key: "start", label: L("Start at", "Empieza en"), min: 0, max: 60, step: 1, def: 0 },
    { key: "euler", label: L("Mark n\xB2+n+41", "Marcar n\xB2+n+41"), min: 0, max: 1, step: 1, def: 0 }
  ],
  make() {
    let cache = null, key = "";
    const sieve = (n) => {
      const p = new Uint8Array(n + 1).fill(1);
      p[0] = p[1] = 0;
      for (let i = 2; i * i <= n; i++) if (p[i]) for (let j = i * i; j <= n; j += i) p[j] = 0;
      return p;
    };
    return {
      step(ctx, w, h, t, acc, P, M) {
        const N = P.size | 0, start = P.start | 0, eu = P.euler | 0;
        const k = N + ":" + start + ":" + eu + ":" + acc;
        if (key !== k) {
          key = k;
          const total = N * N, pr = sieve(total + start + 4);
          const euler = /* @__PURE__ */ new Set();
          if (eu) for (let i = 0; i * i + i + 41 <= total + start; i++) euler.add(i * i + i + 41);
          const img = new ImageData(N, N), d = img.data;
          const rgb = acc.split(",").map(Number);
          let x = N >> 1, y = N >> 1, dx = 1, dy = 0, run = 1, done = 0;
          for (let v = 1; v <= total; v++) {
            if (x >= 0 && x < N && y >= 0 && y < N) {
              const num = v + start, o = (y * N + x) * 4;
              const isP = !!pr[num], isE = euler.has(num);
              const a = isE ? 1 : isP ? 0.85 : 0.04;
              d[o] = isE ? 255 : rgb[0] * a;
              d[o + 1] = isE ? 255 : rgb[1] * a;
              d[o + 2] = isE ? 255 : rgb[2] * a;
              d[o + 3] = 255;
            }
            x += dx;
            y += dy;
            if (++done === run) {
              done = 0;
              const tmp = dx;
              dx = -dy;
              dy = tmp;
              if (dy === 0) run++;
            }
          }
          cache = document.createElement("canvas");
          cache.width = cache.height = N;
          cache.getContext("2d").putImageData(img, 0, 0);
        }
        const S = Math.min(w, h) * 0.84, px = (w - S) / 2, py = (h - S) / 2;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(cache, px, py, S, S);
        ctx.imageSmoothingEnabled = true;
        ctx.strokeStyle = `rgba(${acc},0.25)`;
        ctx.strokeRect(px, py, S, S);
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("every diagonal line is a quadratic n\xB2 + bn + c that is prime unusually often", 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText("1 to " + (N * N + start).toLocaleString("en") + "   offset " + start + (eu ? "   \xB7  white: n\xB2+n+41, prime for n = 0\u202639" : ""), 12, h - 12);
      }
    };
  }
};

// src/experiments/voronoi.js
var voronoi_default = {
  id: "voronoi",
  name: L("Voronoi", "Voronoi"),
  note: L(
    'Every point belongs to whoever is nearest. Change what "near" means and the world changes shape.',
    'Cada punto pertenece a quien tenga m\xE1s cerca. Cambia qu\xE9 significa "cerca" y el mundo cambia de forma.'
  ),
  params: [
    { key: "sites", label: L("Sites", "Sitios"), min: 3, max: 40, step: 1, def: 14 },
    { key: "speed", label: L("Drift", "Deriva"), min: 0, max: 3, step: 0.1, def: 0.8 },
    { key: "metric", label: L("Distance", "Distancia"), min: 0, max: 2, step: 1, def: 0 }
  ],
  make(w, h) {
    let S = [], K = 0;
    const seed = (n, w2, h2) => {
      S = [];
      K = n;
      for (let i = 0; i < n; i++)
        S.push({
          x: Math.random() * w2,
          y: Math.random() * h2,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40
        });
    };
    seed(14, w, h);
    return {
      resize(w2, h2) {
        seed(K, w2, h2);
      },
      reset() {
        seed(K, w, h);
      },
      step(ctx, w2, h2, t, acc, P, M) {
        if ((P.sites | 0) !== K) seed(P.sites | 0, w2, h2);
        const met = P.metric | 0, dt = 1 / 60;
        S.forEach((s) => {
          s.x += s.vx * P.speed * dt;
          s.y += s.vy * P.speed * dt;
          if (s.x < 0 || s.x > w2) s.vx *= -1;
          if (s.y < 0 || s.y > h2) s.vy *= -1;
          s.x = Math.max(0, Math.min(w2, s.x));
          s.y = Math.max(0, Math.min(h2, s.y));
        });
        const pts = M.in ? S.concat([{ x: M.x, y: M.y, cur: 1 }]) : S;
        const dist = (dx, dy) => met === 0 ? dx * dx + dy * dy : met === 1 ? Math.abs(dx) + Math.abs(dy) : Math.max(Math.abs(dx), Math.abs(dy));
        const RES = 150, RH = Math.max(1, Math.round(RES * h2 / w2));
        const own = new Int16Array(RES * RH);
        for (let j = 0; j < RH; j++) {
          const y = (j + 0.5) / RH * h2;
          for (let i = 0; i < RES; i++) {
            const x = (i + 0.5) / RES * w2;
            let best = 1e18, bi = 0;
            for (let s = 0; s < pts.length; s++) {
              const d2 = dist(x - pts[s].x, y - pts[s].y);
              if (d2 < best) {
                best = d2;
                bi = s;
              }
            }
            own[j * RES + i] = bi;
          }
        }
        const img = ctx.createImageData(RES, RH), d = img.data;
        const rgb = acc.split(",").map(Number);
        for (let j = 0; j < RH; j++) for (let i = 0; i < RES; i++) {
          const q = j * RES + i, o = q * 4, id = own[q];
          const edge = i + 1 < RES && own[q + 1] !== id || j + 1 < RH && own[q + RES] !== id;
          const a = edge ? 0.9 : 0.05 + id * 37 % 100 / 100 * 0.22;
          d[o] = rgb[0] * a;
          d[o + 1] = rgb[1] * a;
          d[o + 2] = rgb[2] * a;
          d[o + 3] = 255;
        }
        const off = document.createElement("canvas");
        off.width = RES;
        off.height = RH;
        off.getContext("2d").putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(off, 0, 0, w2, h2);
        pts.forEach((s) => {
          ctx.fillStyle = s.cur ? `rgba(${ink()},1)` : `rgba(${acc},0.95)`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.cur ? 4 : 2.4, 0, TAU);
          ctx.fill();
        });
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText([
          "Euclidean \u2014 straight line, the usual one",
          "Manhattan \u2014 |dx| + |dy|, city blocks",
          "Chebyshev \u2014 max(|dx|,|dy|), king moves"
        ][met], 12, h2 - 28);
        ctx.fillStyle = `rgba(${acc},0.95)`;
        ctx.fillText(pts.length + " sites" + (M.in ? "   \xB7  one of them is your cursor" : ""), 12, h2 - 12);
      }
    };
  }
};

// src/experiments/wormhole.js
var wormhole_default = {
  id: "wormhole",
  name: L("Wormhole", "Agujero de gusano"),
  note: L(
    "A Morris-Thorne throat joining two sheets. Watch something cross it.",
    "Una garganta de Morris-Thorne uniendo dos hojas. Mira algo cruzarla."
  ),
  params: [
    { key: "reach", label: L("Sheet extent", "Alcance de las hojas"), min: 1.4, max: 6, step: 0.1, def: 3.2 },
    { key: "tilt", label: L("View angle", "\xC1ngulo de vista"), min: 0.12, max: 0.9, step: 0.02, def: 0.34 },
    { key: "travel", label: L("Travellers", "Viajeros"), min: 0, max: 4, step: 1, def: 2 }
  ],
  make() {
    let phi = 0, trav = [];
    const seed = (n) => {
      trav = [];
      for (let i = 0; i < 4; i++) trav.push({ l: 1 - i * 0.5, dir: i % 2 ? 1 : -1, p: [] });
    };
    seed();
    return {
      reset() {
        seed();
        phi = 0;
      },
      step(ctx, w, h, t, acc, P, M) {
        const LMAX = P.reach;
        const S = Math.min(w, h) * 0.4 / Math.sqrt(1 + LMAX * LMAX);
        const b0 = S;
        const tilt = M.in ? 0.12 + M.y / h * 0.78 : P.tilt;
        if (M.in) phi = M.x / w * TAU;
        else phi += 35e-4;
        const rOf = (l) => S * Math.sqrt(1 + l * l);
        const zOf = (l) => S * Math.asinh(l);
        const ca = Math.cos(phi), sa = Math.sin(phi);
        const kz = Math.cos(tilt), ky = Math.sin(tilt);
        const cx = w / 2, cy = h / 2;
        const proj = (l, a) => {
          const r = rOf(l), z = zOf(l);
          const x = r * Math.cos(a), y = r * Math.sin(a);
          const xr = x * ca - y * sa, yr = x * sa + y * ca;
          return [cx + xr, cy + yr * ky - z * kz];
        };
        const RINGS = 26, SEG = 40;
        const ls = [];
        for (let i = 0; i <= RINGS; i++) ls.push(-LMAX + 2 * LMAX * i / RINGS);
        ls.sort((A, B) => zOf(B) - zOf(A));
        ctx.lineWidth = 1;
        for (const l of ls) {
          const near = 1 - Math.min(1, Math.abs(l) / LMAX);
          ctx.strokeStyle = `rgba(${acc},${(0.1 + near * 0.45).toFixed(3)})`;
          ctx.beginPath();
          for (let k = 0; k <= SEG; k++) {
            const pnt = proj(l, k / SEG * TAU);
            k ? ctx.lineTo(pnt[0], pnt[1]) : ctx.moveTo(pnt[0], pnt[1]);
          }
          ctx.stroke();
        }
        ctx.strokeStyle = `rgba(${acc},0.14)`;
        for (let k = 0; k < 16; k++) {
          const a = k / 16 * TAU;
          ctx.beginPath();
          for (let i = 0; i <= 60; i++) {
            const l = -LMAX + 2 * LMAX * i / 60;
            const pnt = proj(l, a);
            i ? ctx.lineTo(pnt[0], pnt[1]) : ctx.moveTo(pnt[0], pnt[1]);
          }
          ctx.stroke();
        }
        ctx.strokeStyle = `rgba(${acc},0.95)`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let k = 0; k <= SEG; k++) {
          const pnt = proj(0, k / SEG * TAU);
          k ? ctx.lineTo(pnt[0], pnt[1]) : ctx.moveTo(pnt[0], pnt[1]);
        }
        ctx.stroke();
        const n = P.travel | 0;
        for (let i = 0; i < n && i < trav.length; i++) {
          const tr = trav[i];
          tr.l += tr.dir * 0.016;
          if (tr.l > LMAX) {
            tr.l = LMAX;
            tr.dir = -1;
            tr.p.length = 0;
          }
          if (tr.l < -LMAX) {
            tr.l = -LMAX;
            tr.dir = 1;
            tr.p.length = 0;
          }
          const a = i / Math.max(1, n) * TAU + t * 0.25;
          tr.p.push([tr.l, a]);
          if (tr.p.length > 220) tr.p.shift();
          ctx.lineWidth = 1.2;
          for (let k = 1; k < tr.p.length; k++) {
            ctx.strokeStyle = `rgba(${acc},${(k / tr.p.length * 0.7).toFixed(3)})`;
            const A = proj(tr.p[k - 1][0], tr.p[k - 1][1]), B = proj(tr.p[k][0], tr.p[k][1]);
            ctx.beginPath();
            ctx.moveTo(A[0], A[1]);
            ctx.lineTo(B[0], B[1]);
            ctx.stroke();
          }
          const pnt = proj(tr.l, a);
          ctx.fillStyle = `rgba(${acc},1)`;
          ctx.beginPath();
          ctx.arc(pnt[0], pnt[1], 4.2, 0, TAU);
          ctx.fill();
        }
        ctx.font = "11px monospace";
        ctx.fillStyle = `rgba(${acc},0.55)`;
        ctx.fillText("r(l) = \u221A(b\u2080\xB2 + l\xB2)      z(l) = b\u2080\xB7asinh(l/b\u2080)", 12, h - 28);
        ctx.fillStyle = `rgba(${acc},0.9)`;
        ctx.fillText("b\u2080 = " + S.toFixed(0) + "px    2\u03C0b\u2080 = " + (TAU * S).toFixed(0) + "px    l \u2208 [\u2212" + LMAX.toFixed(1) + ", " + LMAX.toFixed(1) + "]", 12, h - 12);
      }
    };
  }
};

// src/experiments/index.js
var experiments = [
  attention_default,
  boids_default,
  brownian_default,
  chladni_default,
  collatz_default,
  curvature_default,
  doubleslit_default,
  duality_default,
  embedding_default,
  entanglement_default,
  entropy_default,
  flow_default,
  fluid_default,
  fourier_default,
  galaxia_default,
  grayscott_default,
  handle_default,
  hawking_default,
  interference_default,
  ising_default,
  julia_default,
  kepler_default,
  lorenz_default,
  mandelbrot_default,
  neural_default,
  optimizers_default,
  oscillators_default,
  pendulum_default,
  phyllotaxis_default,
  quantum_default,
  quasar_default,
  radiation_default,
  refraction_default,
  relativity_default,
  rule30_default,
  shortcut_default,
  spacetime_default,
  ulam_default,
  voronoi_default,
  wormhole_default
];

// src/index.js
var version = "0.1.0";

// src/bundle.js
register(experiments);
export {
  L,
  TAU,
  core,
  define,
  experiments,
  getExperiment,
  ink,
  label,
  listExperiments,
  mount,
  paper,
  parseColor,
  register,
  resolveTheme,
  themes,
  version
};
