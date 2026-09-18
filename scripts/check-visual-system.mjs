/**
 * Visual system gate (v1.4.1).
 *
 * v1.4 made every project drawing double as a mathematics poster. This gate is
 * the thing that stops that from happening again. It enforces the split:
 *
 *   1. PROJECT COVER             — ProjectCover.astro
 *      describes the project in words: name, type, one sentence, capabilities,
 *      real status. No MathML, no formula block, no notation-heavy artwork.
 *   2. CONCEPTUAL SCIENCE VISUAL — ProjectScientificVisual.astro
 *      case-study only. This is the one place a formula may be the subject.
 *   3. AMBIENT SCIENCE LAYER     — ScientificAmbient.astro
 *      page atmosphere. aria-hidden, pointer-events:none, no canvas, no WebGL,
 *      no image, no network request, and inside the theme's opacity budget.
 *
 * It also re-checks every cover against the evidence layer, so a cover can
 * never quietly claim a status the truth layer does not support.
 *
 * Usage: node scripts/check-visual-system.mjs
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const contentRoot = join(src, 'content', 'projects');

const problems = [];
const notes = [];
let checks = 0;
/** Per-zone ambient strength, read from the component and reused in the budget. */
let ambientZones = {};

function fail(message) {
  problems.push(message);
}

function walk(dir, extensions) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full, extensions));
    else if (extensions.some((ext) => entry.endsWith(ext))) out.push(full);
  }
  return out;
}

/** Formula notation: the alphabet that used to end up on project covers. */
const MATH_GLYPHS = /[∈∝Σ∫∇∂√≈≤≥θλσΩΔαβγπℝⁿˣᵖₜ₊₁₂₃₀₄₅₆₇₈₉]/g;
const FORMULA_WORDS = /\b(?:argmin|argmax|softmax|log-likelihood)\b/i;

/* -------------------------------------------------------------------------- */
/* 0. The three components exist, and none of them does another's job         */
/* -------------------------------------------------------------------------- */

const COVER = join(src, 'components', 'ProjectCover.astro');
const SCIENCE = join(src, 'components', 'ProjectScientificVisual.astro');
const AMBIENT = join(src, 'components', 'ScientificAmbient.astro');
const CARD = join(src, 'components', 'ProjectCard.astro');
const SHOWCASE = join(src, 'components', 'ProjectShowcase.astro');

for (const [name, path] of [
  ['ProjectCover.astro', COVER],
  ['ProjectScientificVisual.astro', SCIENCE],
  ['ScientificAmbient.astro', AMBIENT],
]) {
  checks += 1;
  if (!existsSync(path)) fail(`${name} is missing — the three visual types must stay separate`);
}

if (existsSync(COVER)) {
  const cover = readFileSync(COVER, 'utf8');
  checks += 1;
  const glyphs = cover.match(MATH_GLYPHS);
  if (glyphs) {
    fail(
      `ProjectCover.astro carries ${glyphs.length} formula glyph(s): ${[...new Set(glyphs)].join(' ')} — notation belongs to the ambient layer`,
    );
  }
  checks += 1;
  if (FORMULA_WORDS.test(cover)) fail('ProjectCover.astro contains formula vocabulary');
  checks += 1;
  if (/<math|MathML/i.test(cover)) fail('ProjectCover.astro must not render MathML');
  checks += 1;
  if (!/aria-hidden="true"/.test(cover)) {
    fail('ProjectCover.astro must mark its auxiliary drawing aria-hidden');
  }
  checks += 1;
  if (!/data-cover-title/.test(cover)) fail('ProjectCover.astro must expose data-cover-title');
}

for (const [name, path] of [
  ['ProjectCard.astro', CARD],
  ['ProjectShowcase.astro', SHOWCASE],
]) {
  if (!existsSync(path)) continue;
  const text = readFileSync(path, 'utf8');
  checks += 1;
  if (/ProjectVisual|ProjectScientificVisual/.test(text)) {
    fail(`${name} must use ProjectCover, not the conceptual science visual`);
  }
  checks += 1;
  if (!/ProjectCover/.test(text)) fail(`${name} does not render a ProjectCover`);
}

const caseStudyPages = walk(join(src, 'pages'), ['.astro']).filter((file) =>
  /projects[\\/]\[slug\]\.astro$/.test(file),
);
checks += 1;
if (caseStudyPages.length === 0) fail('no case-study page found');
for (const page of caseStudyPages) {
  const text = readFileSync(page, 'utf8');
  checks += 1;
  if (!/ProjectScientificVisual/.test(text)) {
    fail(`${relative(root, page)} should show the conceptual science visual, not a cover`);
  }
}

/* -------------------------------------------------------------------------- */
/* 1. Ambient layer discipline                                                */
/* -------------------------------------------------------------------------- */

if (existsSync(AMBIENT)) {
  const ambientSource = readFileSync(AMBIENT, 'utf8');

  /* Comments say "no WebGL" on purpose; only the code can actually use it. */
  const ambient = ambientSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');

  for (const [label, pattern] of [
    ['canvas', /<canvas|getContext\(/i],
    ['WebGL', /webgl|three\.js/i],
    ['an external image', /https?:\/\/[^"'\s)]+\.(?:png|jpe?g|svg|webp|gif)/i],
    ['a CSS background image', /background-image\s*:\s*url\((?!data:)/i],
    ['an <img> element', /<img\b/i],
    ['a network fetch', /\bfetch\(|XMLHttpRequest|importScripts/],
  ]) {
    checks += 1;
    if (pattern.test(ambient)) fail(`ScientificAmbient.astro uses ${label} — it must be inline SVG only`);
  }

  checks += 1;
  if (!/aria-hidden="true"/.test(ambient)) {
    fail('ScientificAmbient.astro must render aria-hidden="true"');
  }
  checks += 1;
  if (!/data-scientific-ambient/.test(ambient)) {
    fail('ScientificAmbient.astro must carry data-scientific-ambient');
  }
  checks += 1;
  if (!/pointer-events:\s*none/.test(ambient)) {
    fail('ScientificAmbient.astro must set pointer-events: none');
  }
  checks += 1;
  if (!/opacity:\s*calc\(var\(--ambient-base\)\s*\*\s*var\(--ambient-zone\)\)/.test(ambient)) {
    fail('ambient opacity must be calc(var(--ambient-base) * var(--ambient-zone))');
  }
  checks += 1;
  if (!/data-ambient-mobile='drop'/.test(ambient)) {
    fail('ambient elements must declare data-ambient-mobile so small screens show fewer marks');
  }
  checks += 1;
  if (!/@media \(prefers-reduced-motion: reduce\)/.test(ambient)) {
    fail('ambient drift must be disabled under prefers-reduced-motion');
  }
  checks += 1;
  if (!/z-index:\s*-1/.test(ambient)) fail('ambient must sit behind content (z-index: -1)');

  /* Per-zone strength, reused for the opacity budget below. */
  const zoneBlock = /const ZONE_STRENGTH[\s\S]*?\n\};/.exec(ambient);
  checks += 1;
  if (!zoneBlock) fail('ZONE_STRENGTH table not found in ScientificAmbient.astro');
  if (zoneBlock) {
    for (const m of zoneBlock[0].matchAll(/(\w+):\s*([0-9.]+),/g)) ambientZones[m[1]] = Number(m[2]);
  }
}

/* -------------------------------------------------------------------------- */
/* 2. Ambient opacity budget per theme                                        */
/* -------------------------------------------------------------------------- */

const cssPath = join(src, 'styles', 'global.css');
const css = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : '';

const BUDGET = {
  paper: [0.025, 0.055],
  white: [0.018, 0.045],
  night: [0.04, 0.08],
};

for (const [theme, [min, max]] of Object.entries(BUDGET)) {
  const start = css.indexOf(`[data-theme='${theme}'] {`);
  checks += 1;
  if (start === -1) {
    fail(`theme block [data-theme='${theme}'] not found`);
    continue;
  }
  const slice = css.slice(start, css.indexOf('}', start));
  const match = /--ambient-base:\s*([0-9.]+)\s*;/.exec(slice);
  checks += 1;
  if (!match) {
    fail(`[${theme}] does not define --ambient-base`);
    continue;
  }
  const base = Number(match[1]);
  for (const [zone, mult] of Object.entries(ambientZones)) {
    checks += 1;
    const effective = base * mult;
    if (effective > max + 1e-9) {
      fail(`[${theme}] ambient ${zone} is ${effective.toFixed(4)} — above the ${max} ceiling`);
    } else if (effective < min - 1e-9) {
      fail(`[${theme}] ambient ${zone} is ${effective.toFixed(4)} — below the ${min} floor`);
    } else {
      notes.push(`[${theme}] ambient ${zone}: ${effective.toFixed(4)}`);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 3. Project cover data — present, honest, and not a copy of the body        */
/* -------------------------------------------------------------------------- */

const EVIDENCE = join(src, 'data', 'evidence.ts');
const evidenceText = existsSync(EVIDENCE) ? readFileSync(EVIDENCE, 'utf8') : '';

/**
 * Slug → evidence const. Read from the exported map rather than guessed from
 * the slug, because the two deliberately differ (`pet-ai-health` → `pet`).
 */
const EVIDENCE_VARS = (() => {
  const map = new Map();
  const block = /export const PROJECT_EVIDENCE[\s\S]*?\n\};/.exec(evidenceText);
  if (!block) return map;
  for (const line of block[0].split('\n')) {
    const named = /^\s*'([^']+)'\s*:\s*([A-Za-z]\w*)\s*,/.exec(line);
    if (named) {
      map.set(named[1], named[2]);
      continue;
    }
    const bare = /^\s*([A-Za-z]\w*)\s*,/.exec(line);
    if (bare) map.set(bare[1], bare[1]);
  }
  return map;
})();

/** Read one project's evidence headline and proof tokens for a locale. */
function evidenceFor(slug, lang) {
  const key = EVIDENCE_VARS.get(slug);
  if (!key) return null;
  const start = evidenceText.indexOf(`const ${key}: ProjectEvidence = {`);
  if (start === -1) return null;
  const slice = evidenceText.slice(start, start + 4000);

  const headline = /headline:\s*\{[^}]*?\b(?:en|zh):\s*'([^']*)'[^}]*?\b(?:en|zh):\s*'([^']*)'/s.exec(slice);
  const proofBlock = /proof:\s*\[([\s\S]*?)\],/.exec(slice);
  if (!headline || !proofBlock) return null;

  const en = headline[1];
  const zh = headline[2];
  const tokens = [...proofBlock[1].matchAll(/\{\s*en:\s*'([^']*)',\s*zh:\s*'([^']*)'\s*\}/g)].map((m) =>
    lang === 'zh' ? m[2] : m[1],
  );
  return { headline: lang === 'zh' ? zh : en, tokens };
}

const COVER_FIELDS = [
  'coverType',
  'coverDescription',
  'coverCapabilities',
  'coverStatus',
  'coverStatusSecondary',
  'coverVisualHint',
];

const projectFiles = walk(contentRoot, ['.md']);
checks += 1;
if (projectFiles.length === 0) fail('no project content files found');

for (const file of projectFiles) {
  const rel = relative(root, file).replace(/\\/g, '/');
  const lang = rel.includes('/zh/') ? 'zh' : 'en';
  const text = readFileSync(file, 'utf8');
  const front = text.slice(0, text.indexOf('\n---\n', 1));
  const slug = /^slug:\s*'?([^'\n]+)'?/m.exec(front)?.[1]?.trim();

  for (const field of COVER_FIELDS) {
    checks += 1;
    if (!new RegExp(`^${field}:`, 'm').test(front)) fail(`${rel} is missing ${field}`);
  }

  const caps = /^coverCapabilities:\s*\[(.*)\]/m.exec(front)?.[1] ?? '';
  const capCount = caps ? caps.split("',").length : 0;
  checks += 1;
  if (capCount < 3 || capCount > 6) {
    fail(`${rel} has ${capCount} cover capabilities — the range is 3 to 6`);
  }

  const status = /^coverStatus:\s*(?:'([^']*)'|"([^"]*)")/m.exec(front);
  const secondary = /^coverStatusSecondary:\s*(?:'([^']*)'|"([^"]*)")/m.exec(front);
  const ev = slug ? evidenceFor(slug, lang) : null;

  if (status && ev) {
    checks += 1;
    const value = (status[1] ?? status[2] ?? '').trim();
    if (value !== ev.headline) {
      fail(`${rel} coverStatus "${value}" does not match the evidence headline "${ev.headline}"`);
    }
  } else if (!ev && slug) {
    checks += 1;
    fail(`${rel} has no evidence entry — cover status cannot be verified`);
  }

  if (secondary && ev) {
    checks += 1;
    const value = (secondary[1] ?? secondary[2] ?? '').trim();
    if (!ev.tokens.includes(value)) {
      fail(`${rel} coverStatusSecondary "${value}" is not one of the project's proof tokens`);
    }
  }

  /* A cover sentence and a body sentence must never be the same sentence. */
  const coverDesc = /^coverDescription:\s*>-\s*\n((?:\s+.*\n)+)/m.exec(front)?.[1] ?? '';
  const normalise = (value) => value.replace(/\s+/g, '').replace(/[，。,.]/g, '');
  const summary = normalise(/^summary:\s*(?:'([^']*)'|"([^"]*)")/m.exec(front)?.[1] ?? '');
  const description = normalise(
    /^description:\s*>-\s*\n((?:\s+.*\n)+)/m.exec(front)?.[1] ?? '',
  );
  const flat = normalise(coverDesc);
  checks += 1;
  if (flat && (flat === summary || flat === description)) {
    fail(`${rel} repeats its summary/description verbatim in coverDescription`);
  }
  checks += 1;
  if (flat.length < 12) fail(`${rel} coverDescription is too short to explain the project`);
}

/* -------------------------------------------------------------------------- */
/* 4. Built pages — a cover explains itself, and the ambient layer is inert    */
/* -------------------------------------------------------------------------- */

const HOME_PAGES = ['dist/index.html', 'dist/zh/index.html'];

for (const rel of HOME_PAGES) {
  const path = join(root, rel);
  checks += 1;
  if (!existsSync(path)) {
    fail(`${rel} is missing — run the build before this gate`);
    continue;
  }
  const html = readFileSync(path, 'utf8');

  /* ---- covers ---- */
  const chunks = html.split(/<article class="showcase/).slice(1);
  checks += 1;
  if (chunks.length < 3) fail(`${rel} renders ${chunks.length} featured covers, expected at least 3`);

  chunks.forEach((chunk, i) => {
    const start = chunk.indexOf('data-cover ');
    const end = chunk.indexOf('class="showcase-body"');
    const region = start === -1 ? '' : chunk.slice(start, end === -1 ? chunk.length : end);
    const label = `${rel} cover #${i + 1}`;

    checks += 1;
    if (!region) {
      fail(`${label} is missing a ProjectCover`);
      return;
    }

    checks += 1;
    if (!/data-cover-title/.test(region)) fail(`${label} has no title`);
    checks += 1;
    if (!/data-cover-type/.test(region)) fail(`${label} has no type line`);
    checks += 1;
    if (!/data-cover-desc/.test(region)) fail(`${label} has no description`);
    checks += 1;
    if (!/data-cover-status/.test(region)) fail(`${label} has no reality line`);

    const capsBlock = /data-cover-caps[\s\S]*?<\/ul>/.exec(region)?.[0] ?? '';
    const capItems = (capsBlock.match(/<li/g) ?? []).length;
    checks += 1;
    if (capItems < 3) fail(`${label} lists ${capItems} capabilities, expected at least 3`);

    checks += 1;
    if (/<math|mathml/i.test(region)) fail(`${label} renders MathML`);

    const glyphs = region.match(MATH_GLYPHS) ?? [];
    checks += 1;
    if (glyphs.length > 12) {
      fail(`${label} carries ${glyphs.length} formula glyphs — the cap is 12`);
    }

    /* The words have to be HTML text, not paths inside the SVG. */
    const text = region.replace(/<svg[\s\S]*?<\/svg>/g, '');
    checks += 1;
    if ((text.match(/[A-Za-z一-鿿]/g) ?? []).length < 40) {
      fail(`${label} would still be an SVG with almost no words beside it`);
    }
  });

  /* ---- ambient ---- */
  const layers = [...html.matchAll(/<div class="ambient"[^>]*data-ambient-zone="([a-z]+)"([^>]*)>/g)];
  checks += 1;
  if (layers.length === 0) fail(`${rel} renders no [data-scientific-ambient] layer`);

  for (const [, zone, attrs] of layers) {
    checks += 1;
    if (!/aria-hidden="true"/.test(attrs)) {
      fail(`${rel} ambient zone "${zone}" is not aria-hidden`);
    }
    checks += 1;
    if (!/data-scientific-ambient/.test(attrs) && !html.includes('data-scientific-ambient')) {
      fail(`${rel} ambient zone "${zone}" is missing data-scientific-ambient`);
    }
  }

  const ambientBlocks = [
    ...html.matchAll(/<div class="ambient"[^>]*data-ambient-zone="([a-z]+)"[\s\S]*?<\/div>/g),
  ];
  for (const ambientMatch of ambientBlocks) {
    const zone = ambientMatch[1];
    const block = ambientMatch[0];
    const items = (block.match(/data-ambient-mobile=/g) ?? []).length;
    const drops = (block.match(/data-ambient-mobile="drop"/g) ?? []).length;
    checks += 1;
    if (items === 0) fail(`${rel} ambient zone "${zone}" has no elements`);
    const dropRatio = items ? drops / items : 0;
    checks += 1;
    if (dropRatio < 0.4 || dropRatio > 0.75) {
      fail(
        `${rel} ambient zone "${zone}" drops ${(dropRatio * 100).toFixed(0)}% of its marks on mobile — the target is 50–70%`,
      );
    } else {
      notes.push(`${rel} ambient ${zone}: ${items} marks, ${drops} dropped on mobile`);
    }
  }
}

/* -------------------------------------------------------------------------- */

if (problems.length) {
  console.error('Visual gate FAILED:\n');
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  console.error(`\n${checks} checks run, ${problems.length} failed.`);
  process.exit(1);
}

console.log(`Visual gate passed (${checks} checks).`);
console.log(`  • 3 visual types separated: cover / conceptual science / ambient`);
console.log(`  • ${projectFiles.length} project file(s) × 6 cover fields, re-checked against evidence`);
console.log('  • ambient: inline SVG only, aria-hidden, pointer-events:none, themed opacity');
for (const note of notes) console.log(`  • ${note}`);
