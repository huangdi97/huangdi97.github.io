/**
 * Theme system — three designed surfaces, not an OS light/dark toggle.
 *
 * `paper` is the default for everyone, including visitors whose system is set
 * to dark. `prefers-color-scheme` is read once, and only to hint: it never
 * overrides an explicit choice, and it never silently switches the site to
 * night on its own.
 *
 * Every visual value lives in `src/styles/global.css` as a custom property.
 * This file only carries the metadata the switcher and the inline bootstrap
 * script need, so the palette has exactly one home.
 */

import type { Bi } from '../data/bi';

export const THEMES = ['paper', 'white', 'night'] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = 'paper';

/** localStorage key — the same string is used by the inline bootstrap script. */
export const THEME_STORAGE_KEY = 'haoleilab-theme';
export const LANG_STORAGE_KEY = 'haoleilab-language';

export type ThemeMeta = {
  id: Theme;
  label: Bi;
  /** Short description shown under the name in the popover. */
  note: Bi;
  /** `<meta name="theme-color">` value for browser chrome. */
  chrome: string;
  /**
   * Two-stop preview for the popover swatch: surface, then ink. These are the
   * only literal colours in the codebase — a swatch has to show a theme that
   * is *not* currently active, so it cannot read the active theme's variables.
   */
  swatch: { a: string; b: string };
};

export const THEME_META: Record<Theme, ThemeMeta> = {
  paper: {
    id: 'paper',
    label: { en: 'Paper', zh: '暖纸' },
    note: { en: 'Warm research notebook', zh: '温润的研究笔记纸' },
    chrome: '#F0EEE8',
    swatch: { a: '#F0EEE8', b: '#151515' },
  },
  white: {
    id: 'white',
    label: { en: 'White', zh: '纯白' },
    note: { en: 'Flat minimal surface', zh: '干净的纯白界面' },
    chrome: '#FFFFFF',
    swatch: { a: '#FFFFFF', b: '#111111' },
  },
  night: {
    id: 'night',
    label: { en: 'Night', zh: '夜色' },
    note: { en: 'Notebook after dark', zh: '入夜后的实验记录' },
    chrome: '#111210',
    swatch: { a: '#111210', b: '#ECECE7' },
  },
};

export const THEME_ORDER: Theme[] = ['paper', 'white', 'night'];

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}
