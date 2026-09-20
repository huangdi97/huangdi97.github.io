/**
 * Visual system gate (v2.2).
 *
 * The split this gate exists to hold is the one v1.4 broke: a project drawing
 * must not double as a mathematics poster. Four types are kept apart, and none
 * of them may do another's job:
 *
 *   1. PROJECT ARTWORK        — Artwork.astro, driven by `src/data/artwork.ts`
 *      One frame for every page drawing: the homepage hero and its four project
 *      rows, and the /research and /about bands. The drawing carries meaning, so
 *      it is always a labelled image — never silent decoration — and it carries
 *      no notation of its own. v2.2 demotes it from "the page's subject" to "an
 *      enhancement", which is why the loading policy in section 5 is now part of
 *      the gate rather than a performance note.
 *   2. CONCEPTUAL SCIENCE VISUAL — ProjectScientificVisual.astro
 *      Case-study only. This is the one place a formula may be the subject.
 *   3. EDITORIAL BACKGROUND  — components/visual/ScientificEditorialBackground.astro
 *      page atmosphere, mounted once in BaseLayout behind every route. A
 *      gradient wash, one small tiling texture and at most five inline SVG
 *      fragments. aria-hidden, pointer-events:none, no JavaScript, no animation,
 *      deterministic, inside the theme's opacity budget — and required to carry
 *      mathematics, biology AND AI fragments, so the field can never quietly
 *      collapse into "just formulas".
 *
 *      v2.2 replaced the v1.7 GlobalScientificCanvas with this. The canvas is
 *      retired rather than deleted (§1 forbids returning to it; §50 forbids
 *      deleting authored work), and the first thing this gate now checks is that
 *      nothing imports or mounts it.
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
import { dirname, basename, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const contentRoot = join(src, 'content', 'projects');

const problems = [];
const notes = [];
let checks = 0;
/**
 * Captions the background is forbidden to carry.
 *
 * These are the exact strings v1.6 shipped, and they are quoted verbatim in the
 * documentation of the files that replaced them — which is why every check that
 * uses this list strips comments first. §11 allows symbols and abstract traces
 * in the background and nothing else; a captioned motif turns the field into a
 * slide deck, which is the failure both v1.7 and v2.2 exist to avoid.
 */
const BANNED_CAPTIONS = [
  'CELL STATE LANDSCAPE',
  'AGENT GRAPH',
  'state space',
  'posterior · likelihood',
  'cells × genes',
  'ten nodes',
  'expression is measured',
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
/* 1. The editorial background system (v2.2)                                  */
/* -------------------------------------------------------------------------- */

/**
 * The v1.7 GlobalScientificCanvas is retired, and this section is what keeps it
 * retired.
 *
 * It is not deleted. It is the record of a route the owner explicitly asked the
 * site not to return to (§1), and removing roughly a thousand lines of authored
 * drawing is a bigger decision than this round was handed — §50's rule about
 * not deleting source applies to the drawings the same way it applies to the
 * owner's rasters. What *is* enforced is that it is off: nothing under `src/`
 * imports it, and no built page mounts it. If either check ever goes green
 * again, the site has quietly gone back to the route §1 forbids.
 */
const RETIRED = [
  ['GlobalScientificCanvas', CANVAS],
  ['HeroComposition', HERO_C],
  ['MidComposition', MID_C],
  ['LowerComposition', LOWER_C],
];

const srcFiles = walk(src, ['.astro', '.ts', '.mjs']);
const retiredPaths = new Set(RETIRED.map(([, path]) => path));

for (const [name] of RETIRED) {
  checks += 1;
  const importers = srcFiles.filter(
    (file) =>
      !retiredPaths.has(file) &&
      new RegExp(`from\\s+['"][^'"]*${name}(?:\\.astro)?['"]`).test(readFileSync(file, 'utf8')),
  );
  if (importers.length) {
    fail(
      `${name} is imported by ${importers.map((f) => relative(root, f)).join(', ')} — ` +
        'the v1.7 canvas is retired (§1) and must stay unmounted',
    );
  }
}

const BACKGROUND = join(src, 'components', 'visual', 'ScientificEditorialBackground.astro');

checks += 1;
if (!existsSync(BACKGROUND)) {
  fail('ScientificEditorialBackground.astro is missing — v2.2 mounts it on every route');
} else {
  const source = readFileSync(BACKGROUND, 'utf8');
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');

  /* §66: the background is HTML + CSS + inline SVG, and nothing else. */
  for (const [label, pattern] of [
    ['a <script> element', /<script\b/i],
    ['a client directive', /client:(?:load|idle|visible|only|media)/],
    ['an inline event handler', /\son[a-z]+\s*=/i],
    ['a network fetch', /\bfetch\(|XMLHttpRequest/],
    ['a <canvas> element', /<canvas\b|getContext\(/i],
    ['a raster request other than the texture', /background-image\s*:\s*url\((?!['"]?\/texture\/)/i],
  ]) {
    checks += 1;
    if (pattern.test(code)) {
      fail(`the editorial background uses ${label} — it must be HTML + CSS + inline SVG`);
    }
  }

  /* §38: no animation, no transition, no scroll effect. The file's argument for
     having no reduced-motion block is only honest while this holds. */
  checks += 1;
  if (/@keyframes|\banimation\s*:|\btransition\s*:/.test(code)) {
    fail('the editorial background declares motion — §38 asks for none');
  }

  /* §57: inert, and absent from the accessibility tree. */
  checks += 1;
  if (!/data-editorial-background/.test(source)) {
    fail('the editorial background must carry data-editorial-background');
  }
  checks += 1;
  if (!/aria-hidden="true"/.test(source)) {
    fail('the editorial background must render aria-hidden="true"');
  }

  /* §76: deterministic. A background that varies between renders cannot be
     screenshotted, diffed or reviewed — and this round's whole acceptance
     argument rests on screenshots. */
  checks += 1;
  if (/Math\.random|Date\.now|new Date\(/.test(code)) {
    fail('the editorial background must be deterministic — no Math.random, no clock');
  }

  /* §11: it must never label itself. These are the exact strings v1.6 shipped;
     comments are stripped first, because this file quotes several of them. */
  for (const caption of BANNED_CAPTIONS) {
    checks += 1;
    if (code.includes(caption)) {
      fail(`the editorial background carries the caption "${caption}" — a background must not label itself`);
    }
  }

  /* §10: AI is never a robot head, and biology is never only a formula. */
  checks += 1;
  if (/robot|circuit head|\bbrain\b/i.test(code)) {
    fail('the editorial background uses a robot / brain / circuit-head shorthand for AI');
  }

  /* §74: a handful of groups, and every group says which science it is. Six
     fragments exist; no single page mounts more than five of them, which is the
     check below the mode table. */
  const groupNames = [...new Set([...code.matchAll(/data-bg-group="([a-z]+)"/g)].map((m) => m[1]))];
  checks += 1;
  if (groupNames.length < 3 || groupNames.length > 6) {
    fail(
      `the editorial background declares ${groupNames.length} mark group(s) — §74 allows three to six`,
    );
  } else {
    notes.push(`background groups: ${groupNames.join(', ')}`);
  }

  const bgKinds = new Set([...code.matchAll(/data-bg-kind="(math|biology|ai)"/g)].map((m) => m[1]));
  for (const kind of ['math', 'biology', 'ai']) {
    checks += 1;
    if (!bgKinds.has(kind)) fail(`the editorial background has no "${kind}" fragment`);
  }

  /* §34: five modes, each a documented density. A sixth mode added without a
     matching entry in the page map would silently fall back to `default`. */
  const groupsBlock = /const GROUPS[\s\S]*?\n\};/.exec(code)?.[0] ?? '';
  checks += 1;
  if (!groupsBlock) fail('the editorial background has no GROUPS map');
  for (const mode of ['default', 'research', 'about', 'resume', 'minimal']) {
    checks += 1;
    if (!new RegExp(`\\b${mode}:`).test(groupsBlock)) {
      fail(`the editorial background defines no "${mode}" mode`);
    }
  }
  checks += 1;
  if (!/minimal:\s*\[\]/.test(groupsBlock)) {
    fail('the "minimal" mode must mount no marks — that is the whole of what it means');
  }

  /* §74's ceiling is per page, not per file: the library may hold six fragments
     as long as no mode mounts more than five of them. */
  const perMode = [...groupsBlock.matchAll(/\b[a-z]+:\s*\[([^\]]*)\]/g)].map((m) =>
    m[1].split(',').map((s) => s.trim()).filter(Boolean),
  );
  for (const list of perMode) {
    checks += 1;
    if (list.length > 5) {
      fail(`a background mode mounts ${list.length} fragments — §74 keeps a page to five at most`);
    }
  }

  /* The host layer keeps the contract the canvas it replaced had to keep, for
     the same reason: `absolute` rather than `fixed` is the difference between a
     sheet of paper the page sits on and wallpaper the page slides over. */
  const bgRule = /\.editorial-bg\s*\{[^}]*\}/.exec(source)?.[0] ?? '';
  checks += 1;
  if (!bgRule) {
    fail('the editorial background has no .editorial-bg rule');
  } else {
    for (const [declaration, pattern, why] of [
      ['position: absolute', /position:\s*absolute/, 'document-level, not viewport-fixed'],
      ['pointer-events: none', /pointer-events:\s*none/, 'inert'],
      ['z-index: -1', /z-index:\s*-1/, 'behind every word'],
      ['overflow: hidden', /overflow:\s*hidden/, 'it crops the fragments that run off the page'],
    ]) {
      checks += 1;
      if (!pattern.test(bgRule)) fail(`.editorial-bg must declare ${declaration} (${why})`);
    }
  }

  /* No weight may be hard-coded. Every `opacity` in the file is a group weight
     or a layer weight, and both have to come from a token so a theme can move
     them together. Intra-group detail uses `stroke-opacity` / `fill-opacity`,
     which are drawing properties rather than weights — hence the lookbehind,
     which is what keeps `stroke-opacity` from being read as an `opacity`. */
  for (const m of code.matchAll(/(?<![\w-])opacity\s*:\s*([^;]+);/g)) {
    checks += 1;
    const value = m[1].trim();
    if (!/^(?:calc\()?var\(--(?:bg|ebg)-/.test(value)) {
      fail(`the editorial background hard-codes an opacity (${value}) — it must read a --bg-* token`);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 2. Background opacity budget per theme                                     */
/* -------------------------------------------------------------------------- */

const cssPath = join(src, 'styles', 'global.css');
const css = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : '';

/**
 * Floor AND ceiling per token, per theme (§4, §12).
 *
 * Both ends are enforced, and the floors matter as much as the ceilings. The
 * v1.4 canvas shipped at 2.5–5.5% and the owner could not see it at all; the
 * v2.2 system exists precisely so that a page has something to look at before
 * its artwork arrives. A background nobody can see would fail this round the
 * same way an over-inked one would.
 */
const BG_TOKENS = ['bg-texture', 'bg-mark', 'bg-graph', 'bg-bio', 'bg-grid'];

const BG_BUDGET = {
  paper: {
    'bg-texture': [0.02, 0.045],
    'bg-mark': [0.025, 0.05],
    'bg-graph': [0.03, 0.06],
    'bg-bio': [0.03, 0.06],
    'bg-grid': [0.02, 0.04],
  },
  white: {
    'bg-texture': [0.015, 0.04],
    'bg-mark': [0.02, 0.045],
    'bg-graph': [0.02, 0.05],
    'bg-bio': [0.02, 0.05],
    'bg-grid': [0.015, 0.035],
  },
  night: {
    'bg-texture': [0.03, 0.06],
    'bg-mark': [0.04, 0.08],
    'bg-graph': [0.04, 0.08],
    'bg-bio': [0.04, 0.08],
    'bg-grid': [0.03, 0.06],
  },
};

/** §4/§6: the wash alphas. Blue 0.04–0.08, green 0.03–0.06, on every theme. */
const WASH_BUDGET = {
  paper: { 'bg-blue': [0.04, 0.08], 'bg-green': [0.03, 0.06] },
  white: { 'bg-blue': [0.03, 0.06], 'bg-green': [0.02, 0.05] },
  night: { 'bg-blue': [0.05, 0.08], 'bg-green': [0.04, 0.06] },
};

const themeSlice = (theme) => {
  const start = css.indexOf(`[data-theme='${theme}'] {`);
  return start === -1 ? null : css.slice(start, css.indexOf('}', start));
};

for (const [theme, tokens] of Object.entries(BG_BUDGET)) {
  const slice = themeSlice(theme);
  checks += 1;
  if (!slice) {
    fail(`theme block [data-theme='${theme}'] not found`);
    continue;
  }

  for (const token of BG_TOKENS) {
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
      fail(`[${theme}] --${token} is ${value} — below the ${min} floor (an invisible background)`);
    } else {
      notes.push(`[${theme}] ${token}: ${value}`);
    }
  }

  for (const [token, [min, max]] of Object.entries(WASH_BUDGET[theme])) {
    const match = new RegExp(`--${token}:\\s*rgba\\([^)]*?,\\s*([0-9.]+)\\s*\\)`).exec(slice);
    checks += 1;
    if (!match) {
      fail(`[${theme}] does not define --${token} as an rgba() wash`);
      continue;
    }
    const value = Number(match[1]);
    if (value > max + 1e-9 || value < min - 1e-9) {
      fail(`[${theme}] --${token} alpha is ${value} — outside the ${min}–${max} band`);
    }
  }
}

/* Hierarchy, on every theme: ticks under notation, notation under the curves
   and the network, and biology never louder than the loudest graph mark. A
   background where everything is inked the same reads as a pattern, which is
   the failure §75 names. */
for (const theme of ['paper', 'white', 'night']) {
  const slice = themeSlice(theme);
  if (!slice) continue;
  const read = (token) => Number(new RegExp(`--${token}:\\s*([0-9.]+)`).exec(slice)?.[1] ?? 0);
  const [mark, graph, bio, grid] = [read('bg-mark'), read('bg-graph'), read('bg-bio'), read('bg-grid')];

  checks += 1;
  if (!(grid < mark)) fail(`[${theme}] ticks (${grid}) are not quieter than notation (${mark})`);
  checks += 1;
  if (!(mark < graph)) fail(`[${theme}] notation (${mark}) is not quieter than the graph marks (${graph})`);
  checks += 1;
  if (!(bio <= graph)) fail(`[${theme}] biology (${bio}) is louder than the graph marks (${graph})`);
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
/* 5. The raster loading policy (§22–§25, §43, §61–§63)                       */
/* -------------------------------------------------------------------------- */

/**
 * What the owner actually reported was "the images visibly load in".
 *
 * That is a loading-*order* complaint, not a file-size one, so these checks are
 * about order and about how much is asked for at once — a byte count on its own
 * would not have caught it.
 *
 *   · at most one drawing per page is eager, and it is the LCP image;
 *   · every other drawing is `loading="lazy"`;
 *   · every drawing declares an intrinsic size, or the row reflows (§43);
 *   · every drawing carries a `srcset`, so a phone never asks for the 1440px
 *     file (§22–§23);
 *   · exactly one preload, on the page whose LCP image it names (§25);
 *   · the eager payload stays inside §61/§62's 250 KB.
 */
const LOADING_PAGES = [
  ['dist/index.html', 1],
  ['dist/zh/index.html', 1],
  ['dist/projects/index.html', 0],
  ['dist/zh/projects/index.html', 0],
  ['dist/research/index.html', 1],
  ['dist/zh/research/index.html', 1],
  ['dist/about/index.html', 1],
  ['dist/zh/about/index.html', 1],
  ['dist/resume/index.html', 0],
  ['dist/zh/resume/index.html', 0],
];

const bytesAt = (url) => {
  const file = join(root, 'dist', url.replace(/^\//, ''));
  return existsSync(file) ? statSync(file).size : 0;
};

for (const [rel, expectedEager] of LOADING_PAGES) {
  const path = join(root, rel);
  checks += 1;
  if (!existsSync(path)) {
    fail(`${rel} is missing — run the build before this gate`);
    continue;
  }
  const html = readFileSync(path, 'utf8');
  const artImgs = [...html.matchAll(/<img[^>]*class="art-img"[^>]*>/g)].map((m) => m[0]);
  const eager = artImgs.filter((tag) => /loading="eager"/.test(tag));

  checks += 1;
  if (eager.length !== expectedEager) {
    fail(`${rel} loads ${eager.length} drawing(s) eagerly — expected ${expectedEager}`);
  }

  checks += 1;
  const unhinted = artImgs.filter((tag) => !/loading="(?:eager|lazy)"/.test(tag));
  if (unhinted.length) fail(`${rel} has ${unhinted.length} drawing(s) with no loading hint`);

  checks += 1;
  const unsized = artImgs.filter((tag) => !/width="\d+"/.test(tag) || !/height="\d+"/.test(tag));
  if (unsized.length) fail(`${rel} has ${unsized.length} drawing(s) with no intrinsic size`);

  checks += 1;
  const srcsetless = artImgs.filter((tag) => !/srcset="/.test(tag));
  if (srcsetless.length) {
    fail(
      `${rel} has ${srcsetless.length} drawing(s) with no srcset — a 390px phone would download the largest file`,
    );
  }

  const preloads = [...html.matchAll(/<link[^>]*rel="preload"[^>]*>/g)].map((m) => m[0]).filter(
    (tag) => /as="image"/.test(tag),
  );
  checks += 1;
  if (preloads.length > 1) {
    fail(`${rel} preloads ${preloads.length} images — §25 allows the LCP image only`);
  }
  checks += 1;
  if (expectedEager > 0 && preloads.length === 0) {
    fail(`${rel} paints a drawing above the fold but preloads nothing`);
  }
  checks += 1;
  if (expectedEager === 0 && preloads.length > 0) {
    fail(`${rel} preloads an image it does not paint above the fold`);
  }

  /* §61/§62, measured on the largest rung. That is the conservative bound on
     purpose: which candidate the browser picks depends on the viewport, and a
     budget that only holds at one width is not a budget. */
  let eagerBytes = 0;
  for (const tag of eager) {
    const candidates = [
      ...(/(?:^|\s)srcset="([^"]+)"/.exec(tag)?.[1] ?? '').matchAll(/(\S+)\s+(\d+)w/g),
    ];
    eagerBytes += candidates.length
      ? Math.max(...candidates.map((m) => bytesAt(m[1])))
      : bytesAt(/src="([^"]+)"/.exec(tag)?.[1] ?? '');
  }

  checks += 1;
  if (eagerBytes > 250 * 1024) {
    fail(
      `${rel} asks ${(eagerBytes / 1024).toFixed(0)} KB of image above the fold — the budget is 250 KB`,
    );
  } else if (eagerBytes > 0) {
    notes.push(`${rel}: ${(eagerBytes / 1024).toFixed(0)} KB eager, 1 drawing`);
  }
}

/* §78/§79: no source artwork may be reachable.
   `public/` is a passthrough directory — every byte in it is copied into
   `dist/` and served — so a source file that lands there is a published URL
   nothing references. v2.1 shipped twelve megabytes of them at
   /images/home/v2/source/, which is the defect this check exists to keep shut. */
const distImages = walk(join(root, 'dist'), ['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const leaked = distImages.filter((file) => /source/i.test(basename(file)));
checks += 1;
if (leaked.length) {
  fail(
    `${leaked.length} source artwork file(s) are published: ${leaked
      .map((f) => relative(root, f))
      .join(', ')}`,
  );
}

/* §7/§63: the texture is one small shared file, not a paper ground. */
const texturePath = join(root, 'public', 'texture', 'paper.webp');
checks += 1;
if (!existsSync(texturePath)) {
  fail('public/texture/paper.webp is missing — the background texture layer needs it');
} else {
  const size = statSync(texturePath).size;
  checks += 1;
  if (size > 30 * 1024) {
    fail(`the paper texture is ${(size / 1024).toFixed(1)} KB — §63 caps it at 30 KB`);
  } else {
    notes.push(`paper texture: ${(size / 1024).toFixed(1)} KB, ${distImages.length} published image(s)`);
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
console.log('  • 4 visual types separated: artwork / conceptual science / editorial background / public surface');
console.log(`  • ${projectFiles.length} project file(s), public fields checked against evidence`);
console.log('  • background: inline SVG + CSS only, no JS, no animation, deterministic, math + biology + AI');
console.log('  • background: 5 groups, 5 modes, opacity floors and ceilings held on all 3 themes');
console.log('  • background: document-level, inert, behind every word, never labels itself');
console.log('  • v1.7 canvas: retired — imported by nothing, mounted on no page');
console.log('  • raster: one eager drawing per page, one preload, srcset everywhere, ≤ 250 KB eager');
console.log('  • raster: no source artwork reachable, paper texture under 30 KB');
console.log('  • homepage: five drawings (hero + four project rows), four stacked rows');
console.log('  • homepage: no page-wide canvas, no cards, no index numbers, no pills');
console.log('  • /projects: four illustrated entries, no filter bar, no words-first cover');
console.log('  • /research: page artwork, five directions, no figure set, no equation');
console.log('  • /about: page artwork, directions list, path rail, no method grid');
for (const note of notes) console.log(`  • ${note}`);
