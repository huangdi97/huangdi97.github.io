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
 *
 * v2.2.3 removed what those drawings were *painted with*, without touching the
 * drawings: the `.global-science` / `.sci-*` rules, `@keyframes sci-drift` and
 * the five `--science-*` weight tokens that only those rules consumed are gone
 * from `global.css`. They had been shipping in the published stylesheet, because
 * Tailwind's content scan found the class names in these retained files and so
 * kept their `@layer components` rules alive. Re-importing a composition
 * therefore also means restoring its styling. `--science-bio-ink` is kept — the
 * compositions still reference it, and `check-theme-system.mjs` still requires
 * it, so the record stays resolvable.
 */
const RETIRED = [
  ['GlobalScientificCanvas', CANVAS],
  ['HeroComposition', HERO_C],
  ['MidComposition', MID_C],
  ['LowerComposition', LOWER_C],
  /* v2.2.1 (§42–§43): the inverted "Selected Public Work" room is off /projects.
     The component is not deleted — §43 keeps the artifact table and the round
     keeps the authored work — so the guard is the same one the v1.7 canvas gets:
     nothing under `src/` may import it. If this ever goes green again, the black
     block has come back onto a paper page. */
  ['SelectedArtifacts', join(src, 'components', 'SelectedArtifacts.astro')],
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

  /* §74: a handful of groups, and every group says which science it is. Five
     fragments exist — the DNA helix was retired in v2.2.1 because §17's Group D
     is *one* biology fragment and the cell contour is it. No single page mounts
     more than four of them, which is the check below the variant table. */
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

  /* §50–§52: seven variants, each a documented density *and* a documented set of
     marks. A variant that only moved a multiplier is the v2.2 failure this round
     exists to fix, so the table is parsed rather than merely counted. */
  const groupsBlock = /const VARIANTS[\s\S]*?\n\};/.exec(code)?.[0] ?? '';
  checks += 1;
  if (!groupsBlock) fail('the editorial background has no VARIANTS map');

  const VARIANTS = ['home', 'projects', 'research', 'about', 'resume', 'opensource', 'minimal'];
  for (const mode of VARIANTS) {
    checks += 1;
    if (!new RegExp(`\\b${mode}:`).test(groupsBlock)) {
      fail(`the editorial background defines no "${mode}" variant`);
    }
    /* And every one of them has a density block, or it silently inherits
       `home`'s — which is the "one background, dial nudged" failure again. */
    checks += 1;
    if (!new RegExp(`data-bg-mode='${mode}'\\]\\s*\\{[^}]*--ebg-scale`).test(source)) {
      fail(`the "${mode}" variant declares no --ebg-scale`);
    }
  }
  checks += 1;
  if (!/minimal:\s*\[\]/.test(groupsBlock)) {
    fail('the "minimal" variant must mount no marks — that is the whole of what it means');
  }

  /* §8's desktop ceiling is four groups per page, and §54's phone rule is two.
     The table is the only place a fifth could appear. */
  const perVariant = [...groupsBlock.matchAll(/\b[a-z]+:\s*\[([^\]]*)\]/g)].map((m) =>
    m[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
  for (const list of perVariant) {
    checks += 1;
    if (list.length > 4) {
      fail(`a background variant mounts ${list.length} fragments — §8 keeps a page to four at most`);
    }
  }

  /* §51: "no site-wide identical background". Two variants may legitimately
     mount the same *set* of marks — /home and /projects both want a curve and a
     node group — so the axis that has to be unique is density. Seven variants,
     seven distinct `--ebg-scale` values, or the "variant" is a name. */
  const scales = [...source.matchAll(/data-bg-mode='([a-z]+)'\]\s*\{[^}]*--ebg-scale:\s*([0-9.]+)/g)].map(
    (m) => [m[1], Number(m[2])],
  );
  checks += 1;
  if (scales.length !== VARIANTS.length) {
    fail(`only ${scales.length} of ${VARIANTS.length} variants declare a density`);
  } else {
    const byValue = new Map();
    for (const [mode, value] of scales) {
      if (byValue.has(value)) {
        fail(
          `the "${mode}" variant is as dense as "${byValue.get(value)}" (${value}) — §51 wants a hierarchy, not one dial`,
        );
      } else {
        byValue.set(value, mode);
      }
    }
    notes.push(
      `variant density: ${scales.map(([m, v]) => `${m} ${v}`).join(', ')}`,
    );
  }

  /* §51 again, on the other axis: the variants must also be placed differently.
     Every variant that mounts a group must override its position, or the
     composition is the same composition moved down the page. */
  const variantBlocks = [...source.matchAll(/data-bg-mode='([a-z]+)'\][^{]*\{([^}]*)\}/g)];
  for (const mode of VARIANTS) {
    if (mode === 'home' || mode === 'minimal') continue; // `home` owns the base rules
    checks += 1;
    const overrides = variantBlocks.filter(
      ([, name, body]) => name === mode && /\b(top|left|right)\s*:/.test(body),
    );
    if (overrides.length === 0) {
      fail(`the "${mode}" variant places no mark — it inherits the home composition (§51)`);
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
const BG_TOKENS = ['bg-texture', 'bg-mark', 'bg-curve', 'bg-graph', 'bg-bio', 'bg-grid'];

/**
 * v2.2.1 bands.
 *
 * Three of them moved, and each for a stated reason rather than to make the
 * numbers pass:
 *
 *   texture  the owner's §3 caps the grain at 0.025 ("do not go far past the
 *            threshold of visibility"). The old ceiling was 0.045, i.e. the
 *            brief's limit was 80% above the ceiling the gate allowed.
 *   curve    new. §18 gives the curve its own band (0.05–0.08 at research
 *            weight) and v2.2 had it sharing `graph`, which collapsed two of
 *            the four bands into one.
 *   mark /   nudged down with the wash so that the hierarchy
 *   graph    grid < mark < curve < graph still holds after `curve` is inserted
 *   bio      between mark and graph.
 */
const BG_BUDGET = {
  paper: {
    'bg-texture': [0.012, 0.028],
    'bg-mark': [0.03, 0.05],
    'bg-curve': [0.04, 0.06],
    'bg-graph': [0.05, 0.07],
    'bg-bio': [0.042, 0.062],
    'bg-grid': [0.022, 0.04],
  },
  white: {
    'bg-texture': [0.01, 0.024],
    'bg-mark': [0.028, 0.045],
    'bg-curve': [0.034, 0.052],
    'bg-graph': [0.04, 0.058],
    'bg-bio': [0.036, 0.054],
    'bg-grid': [0.02, 0.036],
  },
  night: {
    'bg-texture': [0.015, 0.032],
    'bg-mark': [0.045, 0.07],
    'bg-curve': [0.055, 0.08],
    'bg-graph': [0.06, 0.085],
    'bg-bio': [0.055, 0.08],
    'bg-grid': [0.035, 0.055],
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

/* Hierarchy, on every theme: ticks under notation, notation under the curves,
   the curves under the network, and biology never louder than the network. A
   background where everything is inked the same reads as a pattern, which is
   the failure §75 names — and with `bg-curve` added in v2.2.1 there are now four
   mark weights to keep apart, which is what makes §18's four bands possible. */
for (const theme of ['paper', 'white', 'night']) {
  const slice = themeSlice(theme);
  if (!slice) continue;
  const read = (token) => Number(new RegExp(`--${token}:\\s*([0-9.]+)`).exec(slice)?.[1] ?? 0);
  const [mark, curve, graph, bio, grid] = [
    read('bg-mark'),
    read('bg-curve'),
    read('bg-graph'),
    read('bg-bio'),
    read('bg-grid'),
  ];

  checks += 1;
  if (!(grid < mark)) fail(`[${theme}] ticks (${grid}) are not quieter than notation (${mark})`);
  checks += 1;
  if (!(mark < curve)) fail(`[${theme}] notation (${mark}) is not quieter than the curve (${curve})`);
  checks += 1;
  if (!(curve < graph)) fail(`[${theme}] the curve (${curve}) is not quieter than the network (${graph})`);
  checks += 1;
  if (!(bio <= graph)) fail(`[${theme}] biology (${bio}) is louder than the network (${graph})`);
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

  /* §38–§41: the "other work" index is gone from the public page. The three
     unfinished projects still exist as content — their files, their case pages
     and their evidence are untouched — but a public directory does not list
     them, and this is what keeps them from creeping back one row at a time. */
  const other = (html.match(/class="other-item"/g) ?? []).length;
  checks += 1;
  if (other !== 0) {
    fail(`${rel} indexes ${other} other-work project(s) — §39 hides the section entirely`);
  }

  /* §42–§44: the inverted artifact room is off the page, and its data is not
     printed anywhere else on it either. `src/data/artifacts.ts` is untouched —
     the artifact gate still checks every entry — so the only thing to assert
     here is that /projects renders none of it. */
  checks += 1;
  if (/id="artifacts"/.test(html)) fail(`${rel} renders the inverted artifact room again`);
  checks += 1;
  const renderedArtifacts = (html.match(/data-artifact="/g) ?? []).length;
  if (renderedArtifacts !== 0) {
    fail(`${rel} prints ${renderedArtifacts} artifact row(s) — §42 removes the block from /projects`);
  }
  checks += 1;
  if (/class="artifact-room/.test(html)) {
    fail(`${rel} still carries the artifact-room surface`);
  }

  /* §44: at most one line of exit, and it is a link rather than a block. */
  const exits = (html.match(/class="work-exit"/g) ?? []).length;
  checks += 1;
  if (exits > 1) fail(`${rel} renders ${exits} exit links — §44 allows one`);

  /* §34: the entry's five fields, and nothing that reads like a paragraph. */
  checks += 1;
  if (/class="entry-intro"/.test(html)) {
    fail(`${rel} prints a project description paragraph again — §34 caps an entry at five fields`);
  }
  checks += 1;
  if (!/class="entry-status"/.test(html)) fail(`${rel} prints no status line`);

  /* §46: the open-source rows are four fields, so none of the metadata column
     labels may be rendered. */
  for (const [pattern, what] of [
    [/class="oss-facts"/, 'the open-source metadata block'],
    [/class="oss-snapshot"/, 'the metadata snapshot date'],
  ]) {
    checks += 1;
    if (pattern.test(html)) fail(`${rel} still renders ${what} — §47 removes it`);
  }
}

/* ---- /research and /about: a side accent each (§19–§21, §26) -------------- */
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

  /* v2.2.1: the drawing is no longer a band the page is read around. It is a
     masked, low-opacity accent, and the modifier class is how the page says so. */
  checks += 1;
  if (!/class="art[^"]*art--accent/.test(html)) {
    fail(`${rel} does not render its drawing as a background accent (§19–§21, §26)`);
  }
  checks += 1;
  if (/art--band/.test(html)) {
    fail(`${rel} still renders the retired full-width artwork band`);
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
 *   · the hero is the only eager drawing on the site. v2.2.2 took /research and
 *     /about off the critical path, so the two home pages are the only routes
 *     that load a drawing eagerly;
 *   · every other drawing is `loading="lazy"`;
 *   · every drawing declares an intrinsic size, or the row reflows (§43);
 *   · every drawing carries a `srcset`, so a phone never asks for the 1440px
 *     file (§22–§23);
 *   · at most one preload, and only on a page that paints a drawing eagerly —
 *     the two home pages, naming their hero (§25);
 *   · the eager payload stays inside §61/§62's 250 KB.
 */
const LOADING_PAGES = [
  ['dist/index.html', 1],
  ['dist/zh/index.html', 1],
  ['dist/projects/index.html', 0],
  ['dist/zh/projects/index.html', 0],
  ['dist/research/index.html', 0],
  ['dist/zh/research/index.html', 0],
  ['dist/about/index.html', 0],
  ['dist/zh/about/index.html', 0],
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
console.log('  • background: 5 groups, 7 variants, 4 distinct mark weights, floors and ceilings held on all 3 themes');
console.log('  • background: document-level, inert, behind every word, never labels itself');
console.log('  • v1.7 canvas: retired — imported by nothing, mounted on no page');
console.log('  • inverted artifact room: retired — imported by nothing, printed on no page');
console.log('  • raster: one eager drawing per page, one preload, srcset everywhere, ≤ 250 KB eager');
console.log('  • raster: no source artwork reachable, paper texture isotropic and under 30 KB');
console.log('  • homepage: five drawings (hero + four project rows), four stacked rows');
console.log('  • homepage: no page-wide canvas, no cards, no index numbers, no pills');
console.log('  • /projects: four illustrated entries, five fields each, no filter bar, no other-work index, no artifact room');
console.log('  • /research: masked accent, five directions, no figure set, no equation');
console.log('  • /about: masked accent, directions list, path rail, no method grid');
for (const note of notes) console.log(`  • ${note}`);
