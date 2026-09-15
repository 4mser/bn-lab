export type Locale = 'en' | 'es';
export type Label = string | { en: string; es?: string };
export type ThemeMode = 'dark' | 'light';
export type ColorInput = string | [number, number, number];

/** A resolved theme. Colors are "r,g,b" strings, ready for `rgba(${c},a)`. */
export interface Theme {
  readonly mode: ThemeMode;
  readonly accent: string;
  readonly paper: string;
  readonly ink: string;
  readonly core: string;
}

export interface ThemeInput {
  mode?: ThemeMode;
  accent?: ColorInput;
  paper?: ColorInput;
  ink?: ColorInput;
  core?: ColorInput;
}

export interface Param {
  key: string;
  label: Label;
  min: number;
  max: number;
  step: number;
  def: number;
  unit?: string;
}

/** Pointer in CSS pixels of the canvas. */
export interface Pointer {
  x: number;
  y: number;
  in: boolean;
  down: boolean;
  /** Increments on every pointerdown. */
  presses: number;
}

export interface Env {
  readonly canvas: HTMLCanvasElement;
  readonly theme: Theme;
  readonly locale: Locale;
  readonly reducedMotion: boolean;
  /** Real seconds since the previous frame, capped at 1/20. */
  dt: number;
  pixelRatio: number;
  frame: number;
}

export interface Instance {
  step(
    ctx: CanvasRenderingContext2D | null,
    width: number,
    height: number,
    t: number,
    accent: string,
    params: Record<string, number>,
    pointer: Pointer,
    env: Env
  ): void;
  resize?(width: number, height: number, env: Env): void;
  reset?(): void;
  destroy?(): void;
  /** Paint a veil of `paper` with this alpha each frame instead of clearing. */
  fade?: number;
  /** Never clear the canvas between frames. */
  persist?: boolean;
}

export interface Experiment {
  id: string;
  name: Label;
  note?: Label;
  kind?: '2d' | 'webgl';
  params?: Param[];
  /** Cap on devicePixelRatio for this experiment. */
  pixelRatio?: number;
  make(width: number, height: number, env: Env): Instance;
}

export interface MountOptions {
  theme?: ThemeMode | 'auto' | ThemeInput;
  accent?: ColorInput;
  controls?: HTMLElement;
  locale?: Locale;
  params?: Record<string, number>;
  pixelRatio?: number;
  autoplay?: boolean;
  motion?: 'auto' | 'always' | 'reduce';
  onError?(error: Error & { code?: string }): void;
}

export interface Mounted {
  readonly id: string;
  readonly definition: Experiment;
  readonly canvas: HTMLCanvasElement;
  readonly params: Record<string, number>;
  readonly pointer: Pointer;
  readonly theme: Theme;
  readonly playing: boolean;
  /** false when the experiment could not start (e.g. no WebGL). */
  readonly supported: boolean;
  set(key: string, value: number): this;
  get(key: string): number;
  reset(): this;
  resetParams(): this;
  play(): this;
  pause(): this;
  step(frames?: number): this;
  setTheme(theme: ThemeMode | 'auto' | MountOptions): this;
  destroy(): void;
}

export function mount(canvas: HTMLCanvasElement, experiment: Experiment | string, options?: MountOptions): Mounted;
export function define<E extends Experiment>(experiment: E): E;
export function register(...experiments: Array<Experiment | Experiment[]>): void;
export function getExperiment(id: string): Experiment | undefined;
export function listExperiments(): Experiment[];
export function label(label: Label, locale?: Locale): string;

export const themes: { readonly dark: Theme; readonly light: Theme };
export function resolveTheme(options?: { theme?: MountOptions['theme']; accent?: ColorInput }): Theme;
export function parseColor(color: ColorInput): string;

export const TAU: number;
export function L(en: string, es: string): { en: string; es: string };
export function paper(): string;
export function ink(): string;
export function core(): string;
export const version: string;
