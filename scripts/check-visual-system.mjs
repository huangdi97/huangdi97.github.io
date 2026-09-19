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
const SCIENCE_TOKENS = [
  'science-major',
  'science-bio',
  'science-formula',
  'science-grid',
  'science-accent',
];

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
const HERO_C = join(src, 'components', 'HeroComposition.astro');
const MID_C = join(src, 'components', 'MidComposition.astro');
const LOWER_C = join(src, 'components', 'LowerComposition.astro');
const MOSAIC = join(src, 'components', 'ProjectMosaic.astro');
const MOSAIC_VISUAL = join(src, 'components', 'ProjectMosaicVisual.astro');
const CARD = join(src, 'components', 'ProjectCard.astro');
const SHOWCASE = join(src, 'components', 'ProjectShowcase.astro');

for (const [name, path] of [
  ['ProjectCover.astro', COVER],
  ['ProjectScientificVisual.astro', SCIENCE],
  ['GlobalScientificCanvas.astro', CANVAS],
  ['HeroComposition.astro', HERO_C],
  ['MidComposition.astro', MID_C],
  ['LowerComposition.astro', LOWER_C],
  ['ProjectMosaic.astro', MOSAIC],
  ['ProjectMosaicVisual.astro', MOSAIC_VISUAL],
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
  ['HeroComposition.astro', HERO_C],
  ['MidComposition.astro', MID_C],
  ['LowerComposition.astro', LOWER_C],
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
  /* v1.7: three compositions, not a set of independent plates. */
  checks += 1;
  if (
    !/HeroComposition/.test(canvas) ||
    !/MidComposition/.test(canvas) ||
    !/LowerComposition/.test(canvas)
  ) {
    fail('GlobalScientificCanvas.astro must compose the hero, mid and lower compositions');
  }
}

/* All three sciences must appear across the compositions, and the drawings must
   not name themselves. A captioned motif is the v1.6 failure mode: the field
   read as a slide deck rather than as a picture. */
const compositionSources = [HERO_C, MID_C, LOWER_C]
  .filter((p) => existsSync(p))
  .map((p) => readFileSync(p, 'utf8'));

if (compositionSources.length > 0) {
  const joined = compositionSources.join('\n');
  const kinds = new Set([...joined.matchAll(/data-sci-kind="(math|biology|ai)"/g)].map((m) => m[1]));
  for (const kind of ['math', 'biology', 'ai']) {
    checks += 1;
    if (!kinds.has(kind)) {
      fail(`the canvas has no "${kind}" motif — the field must carry all three`);
    }
  }

  checks += 1;
  if (!/data-sci-mobile='drop'|data-sci-mobile="drop"/.test(joined)) {
    fail('canvas marks must declare data-sci-mobile so a phone gets fewer of them');
  }

  /* No captions in the background. These are the exact strings v1.6 shipped,
     and they are still named in the comments of the files that replaced it —
     so comments are stripped before the check. */
  const BANNED_CAPTIONS = [
    'CELL STATE LANDSCAPE',
    'AGENT GRAPH',
    'state space',
    'posterior · likelihood',
    'cells × genes',
    'ten nodes',
    'expression is measured',
  ];
  const compositionCode = joined.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
  for (const caption of BANNED_CAPTIONS) {
    checks += 1;
    if (compositionCode.includes(caption)) {
      fail(`the canvas carries the caption "${caption}" — a background must not label itself`);
    }
  }

  /* Biology may never be only a formula, and AI may never be a robot head. */
  checks += 1;
  if (/robot|circuit head|\bbrain\b/i.test(compositionCode)) {
    fail('the canvas uses a robot / brain / circuit-head shorthand for AI');
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
    'science-major': [0.1, 0.15],
    'science-bio': [0.07, 0.11],
    'science-formula': [0.045, 0.075],
    'science-grid': [0.018, 0.035],
    'science-accent': [0.07, 0.11],
  },
  white: {
    'science-major': [0.07, 0.13],
    'science-bio': [0.05, 0.1],
    'science-formula': [0.035, 0.07],
    'science-grid': [0.015, 0.035],
    'science-accent': [0.05, 0.1],
  },
  night: {
    'science-major': [0.1, 0.2],
    'science-bio': [0.07, 0.15],
    'science-formula': [0.05, 0.1],
    'science-grid': [0.025, 0.06],
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
   formula is inked at the same weight as a 1400px trajectory, the page reads as
   a maths wallpaper. v1.7 replaced the derived factor with an explicit
   --science-formula token, so the check is now that the token exists and sits
   below the major weight. */
const formulaTokens = SCIENCE_TOKENS.includes('science-formula');
checks += 1;
if (!formulaTokens) {
  fail('global.css must define --science-formula so notation has its own weight');
}
for (const theme of ['paper', 'white', 'night']) {
  const start = css.indexOf(`[data-theme='${theme}'] {`);
  if (start === -1) continue;
  const slice = css.slice(start, css.indexOf('}', start));
  const major = Number(/--science-major:\s*([0-9.]+)/.exec(slice)?.[1] ?? 0);
  const formula = Number(/--science-formula:\s*([0-9.]+)/.exec(slice)?.[1] ?? 0);
  const grid = Number(/--science-grid:\s*([0-9.]+)/.exec(slice)?.[1] ?? 0);
  checks += 1;
  if (!(formula < major)) {
    fail(`[${theme}] notation (${formula}) is not quieter than the major weight (${major})`);
  }
  checks += 1;
  if (!(grid < formula)) {
    fail(`[${theme}] ticks (${grid}) are not quieter than notation (${formula})`);
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

/* The canvas wrapper must be document-level and inert. `position: absolute`
   rather than `fixed` is the difference between "a very large sheet of paper"
   and "a wallpaper". */
const canvasRule = /\.global-science\s*\{[^}]*\}/.exec(css);
checks += 1;
if (!canvasRule) {
  fail('global.css has no .global-science rule');
} else {
  checks += 1;
  if (!/position:\s*absolute/.test(canvasRule[0])) {
    fail('.global-science must be document-level (position: absolute), not viewport-fixed');
  }
  checks += 1;
  if (!/pointer-events:\s*none/.test(canvasRule[0])) {
    fail('.global-science must set pointer-events: none');
  }
  checks += 1;
  if (!/z-index:\s*-1/.test(canvasRule[0])) {
    fail('.global-science must sit behind content (z-index: -1)');
  }
  checks += 1;
  if (!/overflow:\s*hidden/.test(canvasRule[0])) {
    fail('.global-science must crop its off-page drawings (overflow: hidden)');
  }
}

/* The one motion in the field is declared once, in global.css, next to the
   `.sci-drift` class it disables. */
checks += 1;
if (
  !/@media \(prefers-reduced-motion: reduce\)[\s\S]{0,300}?\.sci-drift[\s\S]{0,150}?animation:\s*none/.test(
    css,
  )
) {
  fail('global.css must switch .sci-drift off under prefers-reduced-motion');
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
/* 4. Built pages — the mosaic identifies, the canvas is inert and captionless */
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

  /* ---- the mosaic: four cards, identification only ---- */
  const cards = html.split(/<article class="mosaic-card"/).slice(1);
  checks += 1;
  if (cards.length !== 4) {
    fail(`${rel} renders ${cards.length} mosaic cards — the homepage features four`);
  }

  cards.forEach((chunk, i) => {
    const region = chunk.slice(0, chunk.indexOf('</article>'));
    const label = `${rel} mosaic card #${i + 1}`;

    /* Present: a name, one line of type, a labelled illustration, one status,
       one case link. */
    checks += 1;
    if (!/<h3[^>]*class="card-name"[\s\S]*?<\/h3>/.test(region)) fail(`${label} has no name`);
    checks += 1;
    if (!/class="card-type"/.test(region)) fail(`${label} has no one-line type`);
    checks += 1;
    if (!/data-mosaic-visual=/.test(region)) fail(`${label} has no illustration`);
    checks += 1;
    if (!/class="card-status/.test(region)) fail(`${label} has no reality status`);
    checks += 1;
    if (!/class="card-link"/.test(region)) fail(`${label} has no case link`);

    /* The illustration must be a labelled image, not an unlabelled decoration:
       it carries the project's meaning now, so it has to be readable. */
    const svg = /<svg[^>]*data-astro-cid[\s\S]*?<\/svg>/.exec(region)?.[0] ?? '';
    checks += 1;
    if (!/role="img"/.test(svg)) fail(`${label} illustration is not exposed as an image`);
    checks += 1;
    if (!/aria-label="[^"]{12,}"/.test(svg)) {
      fail(`${label} illustration has no descriptive label`);
    }

    /* Removed in v1.7: the chips, the proof line and the tag pills. A homepage
       card identifies a project; the case study explains it. */
    checks += 1;
    if (/data-cover-caps/.test(region)) fail(`${label} still lists capability chips`);
    checks += 1;
    if (/data-proof/.test(region)) fail(`${label} still carries a proof line`);
    checks += 1;
    if (/class="tag"/.test(region)) fail(`${label} still carries tag pills`);
    checks += 1;
    if (/<math|mathml/i.test(region)) fail(`${label} renders MathML`);

    /* Text budget (§58): the card's *body* — the one-line type, the brand
       subtitle and up to three keywords — stays short. The name, the category
       eyebrow and the reality status are identification, not body copy, so they
       are measured separately and not counted here. */
    const bodyOf = (cls) =>
      [...region.matchAll(new RegExp(`class="${cls}[^"]*"[^>]*>([\\s\\S]*?)</(?:p|ul|div)>`, 'g'))]
        .map((m) =>
          m[1]
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim(),
        )
        .join(' ');
    const words = [bodyOf('card-type'), bodyOf('card-sub'), bodyOf('card-keywords')]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const budget = rel.includes('zh') ? 60 : 130;
    checks += 1;
    if (words.length > budget) {
      fail(`${label} carries ${words.length} characters of body copy — the budget is ${budget}`);
    } else {
      notes.push(`${rel} card #${i + 1}: ${words.length} chars of body copy`);
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

  /* v1.7 prototype: four content areas and no more. Research & Notes is hidden
     for this round, and the hero no longer carries a bordered system figure. */
  const sections = (html.match(/<section class="shell[^"]*"/g) ?? []).length;
  checks += 1;
  if (sections > 4) {
    fail(`${rel} renders ${sections} content areas — the prototype keeps four`);
  } else {
    notes.push(`${rel}: ${sections} content areas`);
  }

  checks += 1;
  if (html.includes('class="hero-system"')) {
    fail(`${rel} still renders the hero system figure — the canvas is the hero's right half`);
  }
  checks += 1;
  if (html.includes('class="rn-list"')) {
    fail(`${rel} still renders Research & Notes — hidden for the v1.7 prototype`);
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
