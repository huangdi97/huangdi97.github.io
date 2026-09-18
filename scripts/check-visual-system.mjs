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
 *   3. GLOBAL SCIENTIFIC CANVAS  — GlobalScientificCanvas.astro (v1.6)
 *      page atmosphere, mounted once in BaseLayout behind the whole document.
 *      aria-hidden, pointer-events:none, no canvas, no WebGL, no image, no
 *      network request, inside the theme's opacity budget — and, new in v1.6,
 *      required to carry mathematics, biology AND AI motifs at once, so the
 *      field can never quietly collapse into "just formulas".
 *
 *      v1.4/v1.5 kept this field as section-scoped decoration at 2.5–5.5%
 *      opacity. The owner's verdict was that nobody could see it, so the
 *      budget is now deliberately higher (macro 0.06–0.18) and the gate
 *      enforces a *floor* as well as a ceiling: too faint is a failure too.
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
/** The four canvas opacity tokens, checked against a floor and a ceiling. */
const SCIENCE_TOKENS = ['science-macro', 'science-micro', 'science-grid', 'science-accent'];
/** How much lower notation is inked than large line art, read from the CSS. */
let notationFactor = 0;

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
const CANVAS = join(src, 'components', 'GlobalScientificCanvas.astro');
const MACRO = join(src, 'components', 'MacroScienceLayer.astro');
const MICRO = join(src, 'components', 'MicroNotebookLayer.astro');
const CARD = join(src, 'components', 'ProjectCard.astro');
const SHOWCASE = join(src, 'components', 'ProjectShowcase.astro');

for (const [name, path] of [
  ['ProjectCover.astro', COVER],
  ['ProjectScientificVisual.astro', SCIENCE],
  ['GlobalScientificCanvas.astro', CANVAS],
  ['MacroScienceLayer.astro', MACRO],
  ['MicroNotebookLayer.astro', MICRO],
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
/* 1. Global scientific canvas discipline                                     */
/* -------------------------------------------------------------------------- */

const canvasFiles = [
  ['GlobalScientificCanvas.astro', CANVAS],
  ['MacroScienceLayer.astro', MACRO],
  ['MicroNotebookLayer.astro', MICRO],
];

for (const [name, path] of canvasFiles) {
  if (!existsSync(path)) continue;
  const source = readFileSync(path, 'utf8');

  /* Comments say "no WebGL" on purpose; only the code can actually use it. */
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');

  for (const [label, pattern] of [
    ['canvas', /<canvas|getContext\(/i],
    ['WebGL', /webgl|three\.js/i],
    ['an external image', /https?:\/\/[^"'\s)]+\.(?:png|jpe?g|svg|webp|gif)/i],
    ['a CSS background image', /background-image\s*:\s*url\((?!data:)/i],
    ['an <img> element', /<img\b/i],
    ['a network fetch', /\bfetch\(|XMLHttpRequest|importScripts/],
  ]) {
    checks += 1;
    if (pattern.test(code)) fail(`${name} uses ${label} — it must be inline SVG only`);
  }
}

if (existsSync(CANVAS)) {
  const canvas = readFileSync(CANVAS, 'utf8');

  checks += 1;
  if (!/aria-hidden="true"/.test(canvas)) {
    fail('GlobalScientificCanvas.astro must render aria-hidden="true"');
  }
  checks += 1;
  if (!/data-global-scientific-canvas/.test(canvas)) {
    fail('GlobalScientificCanvas.astro must carry data-global-scientific-canvas');
  }
  checks += 1;
  if (!/MacroScienceLayer/.test(canvas) || !/MicroNotebookLayer/.test(canvas)) {
    fail('GlobalScientificCanvas.astro must compose the macro and micro layers');
  }
}

if (existsSync(MACRO)) {
  const macro = readFileSync(MACRO, 'utf8');

  /* The whole point of v1.6: mathematics AND biology AND AI, at once. A field
     made only of formulas is the failure mode this check exists for. */
  const kinds = new Set([...macro.matchAll(/data-sci-kind="(math|biology|ai)"/g)].map((m) => m[1]));
  for (const kind of ['math', 'biology', 'ai']) {
    checks += 1;
    if (!kinds.has(kind)) {
      fail(`MacroScienceLayer.astro has no "${kind}" motif — the field must carry all three`);
    }
  }

  checks += 1;
  if (!/data-sci-mobile='drop'|data-sci-mobile="drop"/.test(macro)) {
    fail('macro plaques must declare data-sci-mobile so a phone gets fewer, larger motifs');
  }
  checks += 1;
  if (!/@media \(prefers-reduced-motion: reduce\)/.test(macro)) {
    fail('the macro drift must be declared off under prefers-reduced-motion');
  }

  /* Biology may never be only a formula, and AI may never be a robot head.
     Comments are stripped first: this file *says* "AI is never a robot, a
     brain or a circuit head", and that sentence must not trip the check. */
  const macroCode = macro.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
  checks += 1;
  if (/robot|circuit head|\bbrain\b/i.test(macroCode)) {
    fail('MacroScienceLayer.astro uses a robot / brain / circuit-head shorthand for AI');
  }
}

/* -------------------------------------------------------------------------- */
/* 2. Canvas opacity budget per theme                                         */
/* -------------------------------------------------------------------------- */

const cssPath = join(src, 'styles', 'global.css');
const css = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : '';

/**
 * Floor AND ceiling per token, per theme. v1.6 raised both: the v1.4 numbers
 * were a "safe design" that nobody could see, which the owner rejected
 * outright. Too faint now fails this gate exactly like too loud does.
 */
const BUDGET = {
  paper: {
    'science-macro': [0.08, 0.14],
    'science-micro': [0.02, 0.05],
    'science-grid': [0.02, 0.04],
    'science-accent': [0.05, 0.12],
  },
  white: {
    'science-macro': [0.06, 0.11],
    'science-micro': [0.015, 0.04],
    'science-grid': [0.015, 0.04],
    'science-accent': [0.04, 0.1],
  },
  night: {
    'science-macro': [0.1, 0.18],
    'science-micro': [0.035, 0.07],
    'science-grid': [0.03, 0.06],
    'science-accent': [0.08, 0.16],
  },
};

for (const [theme, tokens] of Object.entries(BUDGET)) {
  const start = css.indexOf(`[data-theme='${theme}'] {`);
  checks += 1;
  if (start === -1) {
    fail(`theme block [data-theme='${theme}'] not found`);
    continue;
  }
  const slice = css.slice(start, css.indexOf('}', start));

  for (const token of SCIENCE_TOKENS) {
    const [min, max] = tokens[token];
    const match = new RegExp(`--${token}:\\s*([0-9.]+)\\s*;`).exec(slice);
    checks += 1;
    if (!match) {
      fail(`[${theme}] does not define --${token}`);
      continue;
    }
    const value = Number(match[1]);
    if (value > max + 1e-9) {
      fail(`[${theme}] --${token} is ${value} — above the ${max} ceiling`);
    } else if (value < min - 1e-9) {
      fail(`[${theme}] --${token} is ${value} — below the ${min} floor (invisible background)`);
    } else {
      notes.push(`[${theme}] ${token}: ${value}`);
    }
  }
}

/* Notation must stay a step quieter than the composition around it: if a
   formula is inked at the same weight as a 600px trajectory, the page reads as
   a maths wallpaper. */
const notationMatch = /\.sci-notation\s*\{[^}]*opacity:\s*calc\(var\(--science-macro\)\s*\*\s*([0-9.]+)\)/.exec(
  css,
);
checks += 1;
if (!notationMatch) {
  fail('global.css must ink .sci-notation at calc(var(--science-macro) * factor)');
} else {
  notationFactor = Number(notationMatch[1]);
  checks += 1;
  if (notationFactor > 0.7) {
    fail(`notation factor is ${notationFactor} — it must stay at or below 0.7 of the macro layer`);
  } else {
    notes.push(`notation inked at ${notationFactor} × macro`);
  }
}

/* No component may hard-code an alpha for the field. */
for (const [name, path] of canvasFiles) {
  if (!existsSync(path)) continue;
  const code = readFileSync(path, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  for (const m of code.matchAll(/opacity:\s*([^;]+);/g)) {
    checks += 1;
    const value = m[1].trim();
    if (!/^var\(--science-|^calc\(var\(--science-/.test(value)) {
      fail(`${name} hard-codes an opacity (${value}) — it must read a --science-* token`);
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

  /* ---- global scientific canvas ---- */
  checks += 1;
  if (!/data-global-scientific-canvas/.test(html)) {
    fail(`${rel} renders no [data-global-scientific-canvas] layer`);
  }

  const canvasTag = /<div class="global-science"[^>]*data-global-scientific-canvas[^>]*>/.exec(html);
  checks += 1;
  if (!canvasTag) {
    fail(`${rel} canvas layer is missing its .global-science wrapper`);
  } else {
    checks += 1;
    if (!/aria-hidden="true"/.test(canvasTag[0])) fail(`${rel} canvas layer is not aria-hidden`);
  }

  /* All three motif classes must survive the build — not just the source. */
  for (const kind of ['math', 'biology', 'ai']) {
    checks += 1;
    if (!html.includes(`data-sci-kind="${kind}"`)) {
      fail(`${rel} ships no "${kind}" motif in the canvas`);
    }
  }

  const marks = (html.match(/data-sci-mobile=/g) ?? []).length;
  const drops = (html.match(/data-sci-mobile="drop"/g) ?? []).length;
  checks += 1;
  if (marks === 0) {
    fail(`${rel} canvas has no marks`);
  } else {
    const dropRatio = drops / marks;
    checks += 1;
    if (dropRatio < 0.4 || dropRatio > 0.75) {
      fail(
        `${rel} canvas drops ${(dropRatio * 100).toFixed(0)}% of its marks on mobile — the target is 40–75%`,
      );
    } else {
      notes.push(`${rel} canvas: ${marks} marks, ${drops} dropped on mobile`);
    }
  }

  /* The homepage is the page that was reduced. It must not still be carrying
     the sections that moved to /projects, /research and /about. */
  checks += 1;
  if (html.includes('id="artifacts"')) {
    fail(`${rel} still renders the #artifacts evidence room — it moved to /projects`);
  }
  checks += 1;
  if (html.includes('aria-labelledby="now-label"')) {
    fail(`${rel} still renders the NOW strip — it moved to /projects`);
  }
  checks += 1;
  if (/class="oss-list"/.test(html)) {
    fail(`${rel} still renders the open-source table — it moved to /projects`);
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
console.log('  • 3 visual types separated: cover / conceptual science / global canvas');
console.log(`  • ${projectFiles.length} project file(s) × 6 cover fields, re-checked against evidence`);
console.log('  • canvas: inline SVG only, aria-hidden, pointer-events:none, math + biology + AI');
console.log('  • canvas: opacity floors and ceilings held, notation kept a step quieter');
console.log('  • homepage: reduced — no artifact room, no NOW strip, no open-source table');
for (const note of notes) console.log(`  • ${note}`);
