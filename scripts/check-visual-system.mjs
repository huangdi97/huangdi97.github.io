/**
 * Visual system gate (v2.1).
 *
 * The split this gate exists to hold is the one v1.4 broke: a project drawing
 * must not double as a mathematics poster. Four types are kept apart, and none
 * of them may do another's job:
 *
 *   1. PROJECT ARTWORK        — Artwork.astro, driven by `src/data/artwork.ts`
 *      One frame for every page drawing: the homepage hero and its four project
 *      rows, and the /research and /about bands. The drawing carries meaning, so
 *      it is always a labelled image — never silent decoration — and it carries
 *      no notation of its own. In v2.1 it also replaced the words-first project
 *      cover, which is why §10–§14 could put real images back on /projects.
 *   2. CONCEPTUAL SCIENCE VISUAL — ProjectScientificVisual.astro
 *      Case-study only. This is the one place a formula may be the subject.
 *   3. GLOBAL SCIENTIFIC CANVAS  — GlobalScientificCanvas.astro
 *      page atmosphere, mounted once in BaseLayout behind the inner pages.
 *      aria-hidden, pointer-events:none, no canvas, no WebGL, no image, no
 *      network request, inside the theme's opacity budget — and required to
 *      carry mathematics, biology AND AI motifs at once, so the field can never
 *      quietly collapse into "just formulas".
 *   4. THE PUBLIC SURFACE        — the pages themselves.
 *      §10–§14 turn /projects into a curated directory, §22–§28 turn /research
 *      into a page of questions and §29–§33 turn /about into an introduction.
 *      This gate checks that the contraction actually happened and that the
 *      removed sections have not crept back.
 *
 * It also re-checks every project file against the evidence layer, so a page can
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
/* 0. The visual types exist, and none of them does another's job             */
/* -------------------------------------------------------------------------- */

const ARTWORK = join(src, 'components', 'Artwork.astro');
const SCIENCE = join(src, 'components', 'ProjectScientificVisual.astro');
const CANVAS = join(src, 'components', 'GlobalScientificCanvas.astro');
const HERO_C = join(src, 'components', 'HeroComposition.astro');
const MID_C = join(src, 'components', 'MidComposition.astro');
const LOWER_C = join(src, 'components', 'LowerComposition.astro');

for (const [name, path] of [
  ['Artwork.astro', ARTWORK],
  ['ProjectScientificVisual.astro', SCIENCE],
  ['GlobalScientificCanvas.astro', CANVAS],
  ['HeroComposition.astro', HERO_C],
  ['MidComposition.astro', MID_C],
  ['LowerComposition.astro', LOWER_C],
]) {
  checks += 1;
  if (!existsSync(path)) fail(`${name} is missing — the visual types must stay separate`);
}

/* §10–§14: the words-first project cover was retired in v2.1. If any of its
   files comes back, the round has been undone rather than extended. */
for (const retired of ['ProjectCover.astro', 'ProjectMosaic.astro', 'ProjectMosaicVisual.astro']) {
  checks += 1;
  if (existsSync(join(src, 'components', retired))) {
    fail(`${retired} is back — v2.1 replaced the project cover with a real image`);
  }
}

/* The one frame every drawing goes through. It carries no notation of its own:
   a formula belongs to the conceptual science visual or to the canvas. */
if (existsSync(ARTWORK)) {
  const artwork = readFileSync(ARTWORK, 'utf8');
  checks += 1;
  const glyphs = artwork.match(MATH_GLYPHS);
  if (glyphs) {
    fail(
      `Artwork.astro carries ${glyphs.length} formula glyph(s): ${[...new Set(glyphs)].join(' ')} — notation belongs to the conceptual layer`,
    );
  }
  checks += 1;
  if (FORMULA_WORDS.test(artwork)) fail('Artwork.astro contains formula vocabulary');
  checks += 1;
  if (/<math|MathML/i.test(artwork)) fail('Artwork.astro must not render MathML');

  /* Both sources have to be labelled, or the drawing is silent decoration. */
  checks += 1;
  if (!/role="img"/.test(artwork) || !/aria-label=/.test(artwork)) {
    fail('Artwork.astro must expose its placeholder drawing as a labelled image');
  }
  checks += 1;
  if (!/alt=/.test(artwork)) fail('Artwork.astro must give the raster asset alt text');
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
    fail(`${relative(root, page)} should show the conceptual science visual`);
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
/* 3. Project frontmatter — the public fields, and nothing retired            */
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

/** Read one project's evidence headline for a locale. */
function evidenceFor(slug, lang) {
  const key = EVIDENCE_VARS.get(slug);
  if (!key) return null;
  const start = evidenceText.indexOf(`const ${key}: ProjectEvidence = {`);
  if (start === -1) return null;
  const slice = evidenceText.slice(start, start + 4000);
  const headline = /headline:\s*\{[^}]*?\b(?:en|zh):\s*'([^']*)'[^}]*?\b(?:en|zh):\s*'([^']*)'/s.exec(slice);
  if (!headline) return null;
  return { headline: lang === 'zh' ? headline[2] : headline[1] };
}

/* §7–§8 and §13: what a project file must publish. `publicLine` is the single
   positioning sentence the homepage row and /projects both print. */
const REQUIRED_FIELDS = ['slug', 'title', 'publicLine', 'summary', 'description', 'status', 'year'];
/* Retired by v2.1. Any of these reappearing means the contraction was undone. */
const RETIRED_FIELDS = [
  'groups',
  'coverType',
  'coverDescription',
  'coverCapabilities',
  'coverStatus',
  'coverStatusSecondary',
  'coverVisualHint',
  'publicIntro',
];

const normalise = (value) => value.replace(/\s+/g, '').replace(/[，。,.]/g, '');

const projectFiles = walk(contentRoot, ['.md']);
checks += 1;
if (projectFiles.length === 0) fail('no project content files found');

for (const file of projectFiles) {
  const rel = relative(root, file).replace(/\\/g, '/');
  const lang = rel.includes('/zh/') ? 'zh' : 'en';
  const text = readFileSync(file, 'utf8');
  const front = text.slice(0, text.indexOf('\n---\n', 1));
  const slug = /^slug:\s*'?([^'\n]+)'?/m.exec(front)?.[1]?.trim();

  for (const field of REQUIRED_FIELDS) {
    checks += 1;
    if (!new RegExp(`^${field}:`, 'm').test(front)) fail(`${rel} is missing ${field}`);
  }

  for (const field of RETIRED_FIELDS) {
    checks += 1;
    if (new RegExp(`^${field}:`, 'm').test(front)) {
      fail(`${rel} still carries ${field} — retired in v2.1`);
    }
  }

  const line = /^publicLine:\s*(?:'([^']*)'|"([^"]*)")/m.exec(front);
  const publicLine = (line?.[1] ?? line?.[2] ?? '').trim();
  checks += 1;
  if (publicLine.length < 6 || publicLine.length > 90) {
    fail(`${rel} publicLine is ${publicLine.length} characters — the budget is 6 to 90`);
  }

  /* The positioning line must be its own sentence, not the summary or the
     description copied into a second field. */
  const summary = normalise(/^summary:\s*(?:'([^']*)'|"([^"]*)")/m.exec(front)?.[1] ?? '');
  const description = normalise(
    /^description:\s*>-\s*\n((?:\s+.*\n)+)/m.exec(front)?.[1] ?? '',
  );
  checks += 1;
  const flat = normalise(publicLine);
  if (flat && (flat === summary || flat === description)) {
    fail(`${rel} publicLine repeats its summary/description verbatim`);
  }

  /* The status a page prints is the evidence layer's, never the file's own. */
  const ev = slug ? evidenceFor(slug, lang) : null;
  checks += 1;
  if (!ev) fail(`${rel} has no evidence entry — its public status cannot be verified`);
}

/* -------------------------------------------------------------------------- */
/* 4. The built pages — the contraction, and what must not creep back          */
/* -------------------------------------------------------------------------- */

/**
 * What v2.1 enforces on the homepage: five artworks and no sixth (one hero plus
 * one per featured project), four stacked rows carrying a name, one positioning
 * line, one status and one project link, no page-wide canvas, and none of the
 * sections that moved to /projects, /research and /about.
 */
const HOME_PAGES = ['dist/index.html', 'dist/zh/index.html'];
const FEATURED = ['wennian', 'hycell', 'morn', 'biopulse'];

for (const rel of HOME_PAGES) {
  const path = join(root, rel);
  checks += 1;
  if (!existsSync(path)) {
    fail(`${rel} is missing — run the build before this gate`);
    continue;
  }
  const html = readFileSync(path, 'utf8');
  const zh = rel.includes('zh');

  /* ---- four featured rows, identification only ---- */
  const rows = html.split(/<article[^>]*data-featured-row/).slice(1);
  checks += 1;
  if (rows.length !== 4) {
    fail(`${rel} renders ${rows.length} featured rows — the homepage features four`);
  }

  rows.forEach((chunk, i) => {
    const region = chunk.slice(0, chunk.indexOf('</article>'));
    const label = `${rel} featured row #${i + 1}`;

    checks += 1;
    if (!/class="row-name"/.test(region)) fail(`${label} has no name`);
    checks += 1;
    if (!/class="row-position"/.test(region)) fail(`${label} has no positioning line`);
    checks += 1;
    if (!/class="row-status"/.test(region)) fail(`${label} has no status`);
    checks += 1;
    if (!/class="row-link"/.test(region)) fail(`${label} has no project link`);

    /* Exactly one status line. A reality headline plus a second public-code
       label is the four-part apparatus §14 removes. */
    const statusCount = (region.match(/class="row-status"/g) ?? []).length;
    checks += 1;
    if (statusCount !== 1) {
      fail(`${label} prints ${statusCount} status lines — the budget is one`);
    }

    /* The artwork is a labelled image, not silent decoration. Two sources are
       possible and the contract is the same for both: `placeholder` — the
       inlined drawing, `<svg role="img" aria-label>`; `asset` — the owner's
       WebP, `<img alt width height>`. */
    checks += 1;
    if (!/data-artwork=/.test(region)) fail(`${label} has no artwork`);
    const svg = /<svg[^>]*>[\s\S]*?<\/svg>/.exec(region)?.[0] ?? '';
    const img = /<img[^>]*class="art-img"[^>]*>/.exec(region)?.[0] ?? '';
    const isAsset = /data-artwork-source="asset"/.test(region);

    checks += 1;
    if (isAsset) {
      if (!img) fail(`${label} is marked as an official asset but renders no <img>`);
    } else if (!/role="img"/.test(svg)) {
      fail(`${label} artwork is not exposed as an image`);
    }

    checks += 1;
    if (isAsset) {
      if (!/alt="[^"]{12,}"/.test(img)) fail(`${label} artwork has no descriptive label`);
    } else if (!/aria-label="[^"]{12,}"/.test(svg)) {
      fail(`${label} artwork has no descriptive label`);
    }

    /* §49: an official asset has to declare its intrinsic size, or the row
       reflows as the bytes arrive. The placeholder is inline SVG and cannot. */
    if (isAsset) {
      checks += 1;
      if (!/width="\d+"/.test(img) || !/height="\d+"/.test(img)) {
        fail(`${label} official asset declares no intrinsic size — the row will shift`);
      }
    }

    /* Removed in v2.0 and v2.1. */
    for (const [pattern, what] of [
      [/data-mosaic-card/, 'the mosaic card shell'],
      [/class="card-eyebrow/, 'the category eyebrow'],
      [/class="card-index/, 'the index number'],
      [/class="card-keywords/, 'the keyword list'],
      [/data-proof/, 'the proof line'],
      [/data-cover-caps/, 'the capability chips'],
      [/class="tag"/, 'the tag pills'],
      [/<math|mathml/i, 'MathML'],
      [/class="row-type"/, 'the retired type line'],
      [/class="row-desc"/, 'the retired second sentence'],
    ]) {
      checks += 1;
      if (pattern.test(region)) fail(`${label} still renders ${what}`);
    }

    /* Text budget. The row's prose is two short blocks — the project's own
       positioning line and the status — so this is a ceiling, not a target: the
       point is that a row must not become a paragraph, and that a second
       description, a proof line or a capability list cannot be added back
       without tripping this. */
    const body = [...region.matchAll(/class="row-(?:position|status)"[^>]*>([\s\S]*?)<\/p>/g)]
      .map((m) =>
        m[1]
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim(),
      )
      .join(' ')
      .trim();
    const budget = zh ? 95 : 240;
    checks += 1;
    if (body.length > budget) {
      fail(`${label} carries ${body.length} characters of body copy — the budget is ${budget}`);
    } else {
      notes.push(`${rel} row #${i + 1}: ${body.length} chars of body copy`);
    }
  });

  /* Every featured project appears once, in the confirmed order. */
  const order = [...html.matchAll(/data-featured-row[\s\S]{0,120}?data-slug="([a-z]+)"/g)].map(
    (m) => m[1],
  );
  checks += 1;
  if (order.length !== 4 || order.join() !== FEATURED.join()) {
    fail(`${rel} featured order is [${order.join(', ')}] — expected [${FEATURED.join(', ')}]`);
  }

  /* ---- five drawings, and no sixth ---- */
  const artworks = [...html.matchAll(/data-artwork="([a-z]+)"/g)].map((m) => m[1]);
  const distinct = [...new Set(artworks)];
  checks += 1;
  if (distinct.length !== 5) {
    fail(`${rel} renders ${distinct.length} distinct drawings — the set is five`);
  }
  checks += 1;
  if (distinct[0] !== 'hero') {
    fail(`${rel} first drawing is "${distinct[0] ?? 'none'}" — the hero artwork comes first`);
  }

  const workAt = html.indexOf('id="work"');
  checks += 1;
  if (workAt > 0 && /data-artwork="hero"/.test(html.slice(workAt))) {
    fail(`${rel} renders a second hero artwork inside Featured Projects`);
  }

  /* ---- the page-wide canvas is not mounted here (§9) ---- */
  checks += 1;
  if (/data-global-scientific-canvas/.test(html)) {
    fail(`${rel} still mounts the page-wide scientific canvas — the homepage carries its own drawings`);
  } else {
    notes.push(`${rel}: no page-wide canvas, five drawings`);
  }

  /* ---- still reduced ---- */
  for (const [pattern, what] of [
    [/id="artifacts"/, 'the #artifacts evidence room'],
    [/aria-labelledby="now-label"/, 'the NOW strip'],
    [/class="oss-list"/, 'the open-source table'],
    [/class="hero-system"/, 'the hero system figure'],
    [/class="hero-field"/, 'the hero field figure'],
    [/class="rn-list"/, 'Research & Notes'],
    [/id="mathbio"/, 'the Mathematics × Biology × AI band'],
    [/class="statement-band"/, 'the statement band'],
    [/<math[\s>]/, 'a standalone MathML expression'],
    [/class="hero-support"/, 'the hero methodology sentence'],
  ]) {
    checks += 1;
    if (pattern.test(html)) fail(`${rel} still renders ${what}`);
  }

  const sections = (html.match(/<section class="shell[^"]*"/g) ?? []).length;
  checks += 1;
  if (sections > 3) {
    fail(`${rel} renders ${sections} content areas — §34 leaves three`);
  } else {
    notes.push(`${rel}: ${sections} content areas`);
  }
}

/* ---- /projects: a curated directory, not a filterable catalogue (§10–§14) --- */
for (const rel of ['dist/projects/index.html', 'dist/zh/projects/index.html']) {
  const path = join(root, rel);
  checks += 1;
  if (!existsSync(path)) {
    fail(`${rel} is missing — run the build before this gate`);
    continue;
  }
  const html = readFileSync(path, 'utf8');

  const entries = (html.match(/data-project-entry/g) ?? []).length;
  checks += 1;
  if (entries !== 4) fail(`${rel} renders ${entries} project entries — the featured set is four`);

  const entryArt = [...html.matchAll(/data-project-entry[\s\S]{0,400}?data-artwork="([a-z]+)"/g)].map(
    (m) => m[1],
  );
  checks += 1;
  if (new Set(entryArt).size !== 4) {
    fail(`${rel} shows ${new Set(entryArt).size} distinct entry images — every entry needs its own`);
  }

  for (const [pattern, what] of [
    [/data-groups/, 'the retired group attribute'],
    [/data-cover/, 'the retired words-first cover'],
    [/class="filter/, 'the filter bar'],
    [/class="project-grid"/, 'the card grid'],
  ]) {
    checks += 1;
    if (pattern.test(html)) fail(`${rel} still renders ${what}`);
  }

  /* The three projects with no public artwork are indexed as text rather than
     given an invented drawing (§36, §51). */
  const other = (html.match(/class="other-item"/g) ?? []).length;
  checks += 1;
  if (other !== 3) fail(`${rel} indexes ${other} other projects — the expected set is three`);
}

/* ---- /research and /about: a page artwork band each (§23, §30) ------------- */
for (const [rel, slot] of [
  ['dist/research/index.html', 'research'],
  ['dist/zh/research/index.html', 'research'],
  ['dist/about/index.html', 'about'],
  ['dist/zh/about/index.html', 'about'],
]) {
  const path = join(root, rel);
  checks += 1;
  if (!existsSync(path)) {
    fail(`${rel} is missing — run the build before this gate`);
    continue;
  }
  const html = readFileSync(path, 'utf8');

  checks += 1;
  if (!new RegExp(`data-artwork="${slot}"`).test(html)) {
    fail(`${rel} has no "${slot}" page artwork`);
  }

  const svg = new RegExp(`data-artwork="${slot}"[\\s\\S]*?<svg[^>]*>`).exec(html)?.[0] ?? '';
  const img = new RegExp(`data-artwork="${slot}"[\\s\\S]*?<img[^>]*>`).exec(html)?.[0] ?? '';
  const isAsset = new RegExp(`data-artwork="${slot}"[\\s\\S]{0,200}?data-artwork-source="asset"`).test(
    html,
  );
  checks += 1;
  if (isAsset) {
    if (!/alt="[^"]{12,}"/.test(img)) fail(`${rel} page artwork has no descriptive alt text`);
  } else if (!/role="img"/.test(svg)) {
    fail(`${rel} page artwork is not exposed as an image`);
  }
}

/* /research is a page of questions, not a method statement (§22–§28). */
for (const rel of ['dist/research/index.html', 'dist/zh/research/index.html']) {
  const path = join(root, rel);
  if (!existsSync(path)) continue;
  const html = readFileSync(path, 'utf8');

  const areas = (html.match(/class="research-area"/g) ?? []).length;
  checks += 1;
  if (areas !== 5) fail(`${rel} renders ${areas} research directions — the set is five`);

  checks += 1;
  if (!/class="area-summary"/.test(html)) fail(`${rel} states no direction summary`);

  for (const [pattern, what] of [
    [/id="mathbio"/, 'the mathematical-biology figure set'],
    [/class="mb-/, 'a mathematical-biology figure'],
    [/class="area-list"/, 'the interest list'],
    [/<math[\s>]/, 'a standalone MathML expression'],
    [/class="eq-/, 'the standalone equation'],
  ]) {
    checks += 1;
    if (pattern.test(html)) fail(`${rel} still renders ${what}`);
  }
}

/* /about is an introduction, not a statement of working method (§29–§33). */
for (const rel of ['dist/about/index.html', 'dist/zh/about/index.html']) {
  const path = join(root, rel);
  if (!existsSync(path)) continue;
  const html = readFileSync(path, 'utf8');

  checks += 1;
  if (!/class="focus-list"/.test(html)) fail(`${rel} has no current-directions list`);
  checks += 1;
  if (!/class="bt"/.test(html)) fail(`${rel} has no background path rail`);

  for (const [pattern, what] of [
    [/class="focus-grid"/, 'the six-card method grid'],
    [/class="focus-item"/, 'a method card'],
    [/class="about-timeline"/, 'the "How I work" stage rail'],
    [/class="rail"/, 'a process rail'],
  ]) {
    checks += 1;
    if (pattern.test(html)) fail(`${rel} still renders ${what}`);
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
console.log('  • 4 visual types separated: artwork / conceptual science / global canvas / public surface');
console.log(`  • ${projectFiles.length} project file(s), public fields checked against evidence`);
console.log('  • canvas: inline SVG only, aria-hidden, pointer-events:none, math + biology + AI');
console.log('  • canvas: opacity floors and ceilings held, notation kept a step quieter');
console.log('  • homepage: five drawings (hero + four project rows), four stacked rows');
console.log('  • homepage: no page-wide canvas, no cards, no index numbers, no pills');
console.log('  • /projects: four illustrated entries, no filter bar, no words-first cover');
console.log('  • /research: page artwork, five directions, no figure set, no equation');
console.log('  • /about: page artwork, directions list, path rail, no method grid');
for (const note of notes) console.log(`  • ${note}`);
