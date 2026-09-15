import test from 'node:test';
import assert from 'node:assert/strict';
import { parseColor, resolveTheme, themes } from '../src/core/theme.js';
import { define, register, getExperiment, listExperiments, label, mount } from '../src/core/mount.js';
import { ink, core, paper, setCurrentTheme } from '../src/core/shared.js';

test('parseColor accepts the usual spellings', () => {
  assert.equal(parseColor('#0a5cff'), '10,92,255');
  assert.equal(parseColor('#fff'), '255,255,255');
  assert.equal(parseColor('rgb(10 92 255)'), '10,92,255');
  assert.equal(parseColor('rgba(10, 92, 255, .5)'), '10,92,255');
  assert.equal(parseColor('10,92,255'), '10,92,255');
  assert.equal(parseColor([10.4, 92, 255]), '10,92,255');
  assert.throws(() => parseColor('tomato'));
});

test('resolveTheme merges mode, slots and accent', () => {
  assert.deepEqual({ ...resolveTheme() }, { ...themes.dark });
  assert.equal(resolveTheme({ theme: 'light' }).paper, themes.light.paper);
  const t = resolveTheme({ theme: { mode: 'light', paper: '#ffffff' }, accent: '#0a5cff' });
  assert.equal(t.mode, 'light');
  assert.equal(t.paper, '255,255,255');
  assert.equal(t.accent, '10,92,255');
  assert.equal(t.ink, themes.light.ink);
  assert.ok(Object.isFrozen(t));
});

test('theme helpers follow the theme currently drawing', () => {
  setCurrentTheme(themes.light);
  assert.equal(ink(), themes.light.ink);
  assert.equal(core(), themes.light.core);
  assert.equal(paper(), themes.light.paper);
  setCurrentTheme(themes.dark);
  assert.equal(ink(), themes.dark.ink);
});

test('define validates experiments', () => {
  const ok = { id: 'x', make: () => ({ step() {} }), params: [{ key: 'a', min: 0, max: 1, def: 0.5, step: 0.1 }] };
  assert.equal(define(ok), ok);
  assert.throws(() => define({ make() {} }), /id/);
  assert.throws(() => define({ id: 'y' }), /make/);
  assert.throws(() => define({ id: 'z', make() {}, params: [{ key: 'a', min: 0, max: 1, def: 3 }] }), /min <= def <= max/);
});

test('register makes experiments available by id', () => {
  const e = { id: 'registered', make: () => ({ step() {} }) };
  register(e);
  assert.equal(getExperiment('registered'), e);
  assert.ok(listExperiments().includes(e));
});

test('label picks a locale and falls back to English', () => {
  assert.equal(label({ en: 'Wave', es: 'Onda' }, 'es'), 'Onda');
  assert.equal(label({ en: 'Wave' }, 'es'), 'Wave');
  assert.equal(label('plain'), 'plain');
});

test('mount rejects non-canvas targets and unknown ids', () => {
  assert.throws(() => mount({}, 'registered'), /canvas/);
  assert.throws(() => mount({ getContext() {} }, 'nope'), /unknown experiment/);
});
