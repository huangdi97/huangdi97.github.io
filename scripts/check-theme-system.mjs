/**
 * Theme gate.
 *
 * The v1.4 theme system is a token swap: three `data-theme` blocks in
 * `global.css`, and nothing else in the codebase is allowed to know that a
 * theme exists. This gate is what keeps that true as the site grows.
 *
 * It checks, and fails the build on:
 *   1. all three theme blocks exist and define the same token set;
 *   2. every `var(--token)` used anywhere in `src` is actually defined;
 *   3. no hard-coded white surface outside the theme definitions themselves;
 *   4. the night theme really is dark (no large white block can appear);
 *   5. ink / muted / faint / accent clear WCAG AA against their own canvas;
 *   6. the no-flash bootstrap is in place: `<html data-theme>` is rendered
 *      statically and the inline script runs before any stylesheet.
 *
 * Usage: node scripts/check-theme-system.mjs
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const cssPath = join(src, 'styles', 'global.css');

const THEMES = ['paper', 'white', 'night'];

/** Tokens a theme block must define. Anything missing here is a real gap. */
const REQUIRED_TOKENS = [
  'canvas',
  'surface',
  'card',
  'code-bg',
  'header-bg',
  'ink',
  'muted',
  'faint',
  'line',
  'line-strong',
  'grid-line',
  'accent',
  'accent-soft',
  'artifact-bg',
  'artifact-ink',
  'artifact-muted',
  'artifact-faint',
  'artifact-line',
  'artifact-line-strong',
  'artifact-code-bg',
  'dg-fill',
  'dg-line',
  'dg-line-strong',
  'dg-line-soft',
  'dg-dot',
  'dg-grid',
  'diagram-line',
  'grain-opacity',
  'formula-opacity',
  'grid-opacity',
  'ambient-base',
];

const problems = [];
const notes = [];
let checks = 0;

function fail(message) {
  problems.push(message);
}

/* -------------------------------------------------------------------------- */
/* Source collection                                                          */
/* -------------------------------------------------------------------------- */

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(astro|ts|mjs|css)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const sourceFiles = walk(src);
const css = readFileSync(cssPath, 'utf8');

/* -------------------------------------------------------------------------- */
/* 1. Theme blocks and token parity                                           */
/* -------------------------------------------------------------------------- */

/**
 * Pull one theme block out of the stylesheet. The print block re-declares the
 * same selectors, so the scan stops at `@media print`.
 */
function themeBlock(theme) {
  const start = css.indexOf(`[data-theme='${theme}'] {`);
  if (start === -1) return null;
  const open = css.indexOf('{', start);
  let depth = 0;
  let i = open;
  for (; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  return css.slice(open + 1, i);
}

const printAt = css.indexOf('@media print');
const blocks = {};

for (const theme of THEMES) {
  const raw = themeBlock(theme);
  checks += 1;
  if (!raw) {
    fail(`theme block [data-theme='${theme}'] is missing from global.css`);
    continue;
  }
  if (printAt !== -1 && css.indexOf(`[data-theme='${theme}'] {`) > printAt) {
    fail(`theme block [data-theme='${theme}'] was only found inside @media print`);
    continue;
  }

  const tokens = new Map();
  for (const m of raw.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(m[1], m[2].trim());
  }
  blocks[theme] = tokens;

  for (const token of REQUIRED_TOKENS) {
    checks += 1;
    if (!tokens.has(`--${token}`)) fail(`[${theme}] is missing --${token}`);
  }

  checks += 1;
  if (!/color-scheme\s*:/.test(raw)) fail(`[${theme}] does not set color-scheme`);
}

const paperTokens = blocks.paper ?? new Map();
for (const theme of ['white', 'night']) {
  const tokens = blocks[theme];
  if (!tokens) continue;
  for (const name of paperTokens.keys()) {
    checks += 1;
    if (!tokens.has(name)) fail(`[${theme}] does not redefine ${name} (paper does)`);
  }
}

/* -------------------------------------------------------------------------- */
/* 2. Every var() reference is defined                                        */
/* -------------------------------------------------------------------------- */

const globalDefined = new Set();
for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:/g)) globalDefined.add(m[1]);

for (const file of sourceFiles) {
  const text = readFileSync(file, 'utf8');
  const localDefined = new Set();
  for (const m of text.matchAll(/(--[a-z0-9-]+)\s*:/g)) localDefined.add(m[1]);
  for (const m of text.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
    checks += 1;
    if (globalDefined.has(m[1]) || localDefined.has(m[1])) continue;
    fail(`undefined custom property ${m[1]} in ${relative(root, file)}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 3. No hard-coded white surfaces                                            */
/* -------------------------------------------------------------------------- */

/*
 * A theme swatch has to preview a theme that is *not* the active one, so it
 * cannot read the active theme's variables. Those literals live in one file.
 */
const SWATCH_FILE = 'src/config/themes.ts';

const WHITE_PATTERNS = [
  /\bbg-white\b/,
  /\bbg-\[#fff(?:fff)?\]/i,
  /background(?:-color)?\s*:\s*(?:#fff(?:fff)?\b|white\b|rgb\(\s*255)/i,
  /fill\s*=\s*"#fff(?:fff)?"/i,
];

for (const file of sourceFiles) {
  const rel = relative(root, file).replace(/\\/g, '/');
  if (rel === SWATCH_FILE) continue;

  let text = readFileSync(file, 'utf8');

  // The print stylesheet is deliberately always white-on-black.
  if (rel === 'src/styles/global.css') {
    text = printAt === -1 ? text : text.slice(0, printAt);
    // The white theme's own canvas is the point of that theme.
    text = text.replace(/\[data-theme='white'\]\s*\{[\s\S]*?\n {2}\}/, '');
  }

  for (const pattern of WHITE_PATTERNS) {
    checks += 1;
    const hit = pattern.exec(text);
    if (!hit) continue;
    const line = text.slice(0, hit.index).split('\n').length;
    fail(`hard-coded white surface "${hit[0]}" in ${rel}:${line}`);
  }
}

/* -------------------------------------------------------------------------- */
/* 4 + 5. Night is dark, and every theme clears AA                            */
/* -------------------------------------------------------------------------- */

function parseColor(value) {
  const hex = /^#([0-9a-f]{6})$/i.exec(value.trim());
  if (hex) {
    const int = parseInt(hex[1], 16);
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
  }
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(value.trim());
  if (rgb) {
    const parts = rgb[1].split(',').map((p) => Number.parseFloat(p));
    return [parts[0], parts[1], parts[2]];
  }
  return null;
}

function luminance([r, g, b]) {
  const channel = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function token(theme, name) {
  const value = blocks[theme]?.get(`--${name}`);
  return value ? parseColor(value) : null;
}

const AA = 4.5;

for (const theme of THEMES) {
  if (!blocks[theme]) continue;
  const canvas = token(theme, 'canvas');
  const card = token(theme, 'card');

  if (theme === 'night') {
    checks += 1;
    if (canvas && luminance(canvas) > 0.05) {
      fail(`[night] --canvas is not dark (luminance ${luminance(canvas).toFixed(3)})`);
    }
    checks += 1;
    if (card && luminance(card) > 0.08) {
      fail(`[night] --card would render as a large light block (luminance ${luminance(card).toFixed(3)})`);
    }
    const artifact = token('night', 'artifact-bg');
    checks += 1;
    if (artifact && luminance(artifact) > 0.08) {
      fail(`[night] --artifact-bg is too light (luminance ${luminance(artifact).toFixed(3)})`);
    }
  }

  if (!canvas) continue;

  for (const [name, floor] of [
    ['ink', 7],
    ['muted', AA],
    ['faint', AA],
    ['accent', AA],
  ]) {
    checks += 1;
    const colour = token(theme, name);
    if (!colour) continue;
    const ratio = contrast(colour, canvas);
    if (ratio < floor) {
      fail(`[${theme}] --${name} on --canvas is ${ratio.toFixed(2)}:1, below ${floor}:1`);
    } else {
      notes.push(`[${theme}] --${name} on --canvas: ${ratio.toFixed(2)}:1`);
    }
  }

  const artifactBg = token(theme, 'artifact-bg');
  const artifactInk = token(theme, 'artifact-ink');
  const artifactMuted = token(theme, 'artifact-muted');
  if (artifactBg && artifactInk) {
    checks += 1;
    const ratio = contrast(artifactInk, artifactBg);
    if (ratio < 7) fail(`[${theme}] artifact room ink is ${ratio.toFixed(2)}:1, below 7:1`);
    else notes.push(`[${theme}] artifact room ink: ${ratio.toFixed(2)}:1`);
  }
  if (artifactBg && artifactMuted) {
    checks += 1;
    const ratio = contrast(artifactMuted, artifactBg);
    if (ratio < AA) fail(`[${theme}] artifact room muted text is ${ratio.toFixed(2)}:1, below ${AA}:1`);
    else notes.push(`[${theme}] artifact room muted: ${ratio.toFixed(2)}:1`);
  }
}

/* -------------------------------------------------------------------------- */
/* 6. No flash of the wrong theme                                             */
/* -------------------------------------------------------------------------- */

const layoutPath = join(src, 'layouts', 'BaseLayout.astro');
const layout = readFileSync(layoutPath, 'utf8');

checks += 1;
if (!/<html[^>]*data-theme="paper"/.test(layout)) {
  fail('BaseLayout must render <html data-theme="paper"> so the first paint has a theme');
}

const initPath = join(src, 'components', 'ThemeInit.astro');
checks += 1;
if (readFileSync(initPath, 'utf8').includes('is:inline') === false) {
  fail('ThemeInit must be an is:inline script so it runs before stylesheets');
}

checks += 1;
if (!layout.includes('ThemeInit')) {
  fail('BaseLayout must include <ThemeInit /> inside <head>');
}

checks += 1;
if (!/name="theme-color"/.test(layout)) {
  fail('BaseLayout must declare <meta name="theme-color">');
}

/* -------------------------------------------------------------------------- */

if (problems.length) {
  console.error('Theme gate FAILED:\n');
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  console.error(`\n${checks} checks run, ${problems.length} failed.`);
  process.exit(1);
}

console.log(`Theme gate passed (${checks} checks).`);
console.log(`  • ${THEMES.length} themes × ${REQUIRED_TOKENS.length} required tokens`);
console.log(`  • ${sourceFiles.length} source files scanned for undefined var() and white surfaces`);
for (const note of notes) console.log(`  • ${note}`);
