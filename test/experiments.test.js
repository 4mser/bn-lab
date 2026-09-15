/* Every 2D experiment runs headless for a few hundred frames, with default,
   minimum and maximum parameters, the pointer wandering in and out. It must not
   throw, and no drawing call may receive a non-finite coordinate. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { installGlobals, createContext, createCanvas } from './helpers/canvas.js';
import { setCurrentTheme } from '../src/core/shared.js';
import { themes } from '../src/core/theme.js';
import { experiments } from '../src/experiments/index.js';

installGlobals();

const W = 640, H = 400, FRAMES = 160;

function run(def, pick, theme) {
  const { ctx, stats } = createContext(createCanvas(W, H));
  const P = {};
  for (const p of def.params || []) P[p.key] = pick(p);
  const M = { x: 0, y: 0, in: false, down: false, presses: 0 };
  const env = { canvas: null, theme, dt: 1 / 60, pixelRatio: 1, frame: 0, reducedMotion: false, locale: 'en' };
  setCurrentTheme(theme);
  const inst = def.make(W, H, env);
  let t = 0;
  for (let f = 0; f < FRAMES; f++) {
    // pointer: outside for a while, then sweeping across, then a press
    M.in = f > 50 && f < 130;
    M.x = W * (0.1 + 0.8 * ((f * 7) % 100) / 100);
    M.y = H * (0.2 + 0.6 * ((f * 3) % 100) / 100);
    if (f === 90) { M.down = true; M.presses++; } else M.down = false;
    if (f === 100 && inst.resize) inst.resize(W * 0.6, H * 0.8, env);
    const w = f >= 100 && inst.resize ? W * 0.6 : W, h = f >= 100 && inst.resize ? H * 0.8 : H;
    t += 0.016; env.frame = f;
    inst.step(ctx, w, h, t, theme.accent, P, M, env);
  }
  if (inst.reset) inst.reset();
  return stats;
}

const cases = {
  default: p => p.def,
  minimum: p => p.min,
  maximum: p => p.max
};

for (const def of experiments.filter(e => (e.kind || '2d') === '2d')) {
  test(`${def.id} runs headless`, () => {
    for (const [name, pick] of Object.entries(cases)) {
      for (const theme of [themes.dark, themes.light]) {
        const stats = run(def, pick, theme);
        assert.ok(stats.calls > 0, `${def.id} (${name}) drew nothing`);
        assert.equal(stats.nonFinite, 0,
          `${def.id} (${name}, ${theme.mode}): non-finite coordinates in ${[...stats.where].map(([k, v]) => `${k}×${v}`).join(', ')}`);
      }
    }
  });
}

test('every experiment has bilingual metadata and sane parameters', () => {
  const seen = new Set();
  for (const def of experiments) {
    assert.ok(!seen.has(def.id), `duplicate id ${def.id}`);
    seen.add(def.id);
    for (const k of ['name', 'note']) {
      assert.ok(def[k] && def[k].en && def[k].es, `${def.id}.${k} needs en and es`);
    }
    for (const p of def.params || []) {
      assert.ok(p.label && p.label.en && p.label.es, `${def.id}.${p.key} label`);
      assert.ok(p.min <= p.def && p.def <= p.max, `${def.id}.${p.key} default out of range`);
      assert.ok(p.step > 0, `${def.id}.${p.key} step`);
    }
  }
});
