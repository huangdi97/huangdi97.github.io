#!/usr/bin/env node
/**
 * Page artwork v2.1 — the two inner-page visuals.
 *
 * `/research` and `/about` each need a face, and the brief allows exactly two
 * new assets (§43): `research.webp` and `about.webp`. Both have to read as the
 * same family as the homepage hero — same paper, same ink weight range, same
 * three accents — while repeating neither the hero's profile nor a project's
 * composition (§24, §31).
 *
 * How the slot works. A slot resolves in this order:
 *
 *   1. `.artwork-source/site/v2/pages/<slot>-source.<ext>` — the owner's official
 *      artwork, if it is there. This is the intended end state: the file is
 *      integrated, not designed, and nothing here redraws it. The directory sits
 *      outside `public/` because `public/` is copied verbatim into `dist/` and
 *      would publish the originals on a fetchable URL; the source is an archive,
 *      the WebP written below is the only file the browser ever sees.
 *   2. `src/assets/pages/<slot>.svg` — the vector artwork in this repository,
 *      which is what ships today because no official file exists yet.
 *
 * Either way the output is the same contract: a WebP at a known width plus
 * `src/data/page-artwork.generated.json`, which is what `Artwork.astro` reads
 * for intrinsic size so the band cannot shift as the bytes arrive (§49).
 *
 * The vectors are authored here rather than by hand so the geometry is
 * reviewable and reproducible: contour field, biological network and a rising
 * record for /research; manuscript, specimen, code ticks and one molecular ring
 * for /about. Nothing is a screenshot, a UI mock or a photograph of something
 * that does not exist.
 *
 * Usage: npm run artwork:pages
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { kb, pruneStale, writeLadder } from './lib/artwork-ladder.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'images', 'site', 'v2', 'pages');
const SOURCE_DIR = join(ROOT, '.artwork-source', 'site', 'v2', 'pages');
const SVG_DIR = join(ROOT, 'src', 'assets', 'pages');
const MANIFEST = join(ROOT, 'src', 'data', 'page-artwork.generated.json');
const URL_BASE = '/images/site/v2/pages';

/** Both bands are 2:1, which is the frame `ART_PLACEMENT` reserves. */
const WIDTH = 1600;
const HEIGHT = 800;

const SLOTS = [
  { name: 'research', aliases: ['research', 'researches'] },
  { name: 'about', aliases: ['about', 'bio', 'profile'] },
];

/* -------------------------------------------------------------------------- */
/* Palette — baked, because a raster image cannot read a CSS custom property.  */
/* -------------------------------------------------------------------------- */

const INK = '21, 21, 21';
const BIO = '84, 114, 101';
const COBALT = '46, 86, 242';
const ink = (a) => `rgba(${INK}, ${a})`;
const bio = (a) => `rgba(${BIO}, ${a})`;
const cobalt = (a) => `rgba(${COBALT}, ${a})`;

/* -------------------------------------------------------------------------- */
/* Geometry helpers                                                           */
/* -------------------------------------------------------------------------- */

/** Deterministic PRNG — the same artwork on every machine and every run. */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/** Catmull-Rom through the points, emitted as cubic beziers. */
function smooth(points) {
  if (points.length < 3) return points.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Sample a curve function across the frame. */
function sample(fn, count = 44) {
  return Array.from({ length: count + 1 }, (_, i) => {
    const t = i / count;
    return [t * WIDTH, fn(t)];
  });
}

const round = (value) => Number(value.toFixed(1));

/* -------------------------------------------------------------------------- */
/* Shared paper                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The ground both bands sit on: the warm paper of the hero, a warm wash from
 * the upper left and a cool one from the right, and a sparse dot grid that
 * stops well short of the edges. Identical in both files on purpose — it is
 * what makes them read as one family.
 */
function paper(id) {
  const dots = [];
  const rand = rng(id === 'research' ? 20260919 : 19970101);
  for (let x = 96; x < WIDTH - 96; x += 48) {
    for (let y = 88; y < HEIGHT - 88; y += 48) {
      if (rand() > 0.72) dots.push(`<circle cx="${x}" cy="${y}" r="1.1" fill="${ink(0.09)}"/>`);
    }
  }

  return `
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F3EFE6"/>
      <stop offset="0.52" stop-color="#F0EEE8"/>
      <stop offset="1" stop-color="#ECEEE9"/>
    </linearGradient>
    <radialGradient id="warm" cx="0.16" cy="0.2" r="0.62">
      <stop offset="0" stop-color="rgba(212, 191, 158, 0.5)"/>
      <stop offset="1" stop-color="rgba(212, 191, 158, 0)"/>
    </radialGradient>
    <radialGradient id="cool" cx="0.84" cy="0.34" r="0.58">
      <stop offset="0" stop-color="rgba(122, 152, 184, 0.2)"/>
      <stop offset="1" stop-color="rgba(122, 152, 184, 0)"/>
    </radialGradient>
    <radialGradient id="moss" cx="0.72" cy="0.86" r="0.5">
      <stop offset="0" stop-color="rgba(84, 114, 101, 0.2)"/>
      <stop offset="1" stop-color="rgba(84, 114, 101, 0)"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#ground)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#warm)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#cool)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#moss)"/>
  <g>${dots.join('')}</g>`;
}

/* -------------------------------------------------------------------------- */
/* research — a research field, not a portrait and not a product screen        */
/* -------------------------------------------------------------------------- */

function researchSvg() {
  /* Contour field. Nine lines rising to the right, each a sum of two sines so
     the ridge reads as terrain rather than as a wave pattern. Alpha and stroke
     weight fall off towards the bottom of the field: the near contours are the
     quietest, which is what keeps the band from turning into a texture. */
  const contours = Array.from({ length: 9 }, (_, i) => {
    const base = 430 + i * 38;
    const lift = 132 + i * 5;
    const fn = (t) =>
      base -
      lift * Math.pow(t, 1.55) +
      30 * Math.sin(t * Math.PI * 2.1 + i * 0.55) -
      14 * Math.sin(t * Math.PI * 5.3 + i * 0.31);
    const alpha = round(0.28 - i * 0.021);
    const width = round(1.05 - i * 0.045);
    return `<path d="${smooth(sample(fn))}" fill="none" stroke="${ink(alpha)}" stroke-width="${width}"/>`;
  }).join('');

  /* The rising record. One trajectory that enters at the lower left, crosses
     the field and leaves at the upper right — the same gesture the hero makes,
     at a fraction of the weight, so the two pages are recognisably related. */
  const record = sample((t) => 706 - 512 * Math.pow(t, 0.92) + 16 * Math.sin(t * Math.PI * 3.4), 26);
  const recordPath = `<path d="${smooth(record)}" fill="none" stroke="${cobalt(0.52)}" stroke-width="1.7" stroke-linecap="round"/>`;
  const recordDots = record
    .filter((_, i) => i % 3 === 0)
    .map(([x, y]) => `<circle cx="${round(x)}" cy="${round(y)}" r="2.4" fill="${cobalt(0.72)}"/>`)
    .join('');

  /* A sparse biological network in the upper right. Deliberately not a mesh:
     nodes are placed with a minimum separation and each one joins only its two
     nearest neighbours, so the graph stays legible instead of knotting. */
  const rand = rng(77123);
  const nodes = [];
  for (let guard = 0; nodes.length < 16 && guard < 6000; guard += 1) {
    const x = round(700 + rand() * 840);
    const y = round(58 + rand() * 396);
    if (nodes.every((node) => Math.hypot(node.x - x, node.y - y) > 108)) {
      nodes.push({ x, y, r: round(2.2 + rand() * 2.6) });
    }
  }
  const pairs = new Set();
  nodes.forEach((node, i) => {
    nodes
      .map((other, j) => ({ j, d: Math.hypot(node.x - other.x, node.y - other.y) }))
      .filter((entry) => entry.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach((entry) => pairs.add([i, entry.j].sort((a, b) => a - b).join(':')));
  });
  const edges = [...pairs]
    .map((pair) => {
      const [a, b] = pair.split(':').map(Number);
      return `<path d="M${nodes[a].x},${nodes[a].y} L${nodes[b].x},${nodes[b].y}" stroke="${bio(0.32)}" stroke-width="0.9"/>`;
    })
    .join('');
  const halos = nodes
    .filter((_, i) => i % 5 === 0)
    .map((n) => `<circle cx="${n.x}" cy="${n.y}" r="${round(n.r * 3.6)}" fill="none" stroke="${bio(0.24)}" stroke-width="0.9"/>`)
    .join('');
  const nodeDots = nodes
    .map((n, i) =>
      i % 4 === 0
        ? `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${cobalt(0.5)}"/>`
        : `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${bio(0.6)}"/>`,
    )
    .join('');

  /* A measured axis along the foot: forty ticks, unevenly spaced. */
  const ticks = Array.from({ length: 40 }, (_, i) => {
    const x = round(120 + (i * (WIDTH - 240)) / 39);
    const tall = i % 10 === 0;
    return `<path d="M${x},756 L${x},${tall ? 736 : 745}" stroke="${ink(tall ? 0.26 : 0.15)}" stroke-width="1"/>`;
  }).join('');

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  ${paper('research')}
  <g stroke-linecap="round" stroke-linejoin="round">
    <path d="M120,756 L${WIDTH - 120},756" stroke="${ink(0.14)}" stroke-width="1"/>
    ${contours}
    ${edges}
    ${halos}
    ${nodeDots}
    ${recordPath}
    ${recordDots}
    ${ticks}
  </g>
</svg>`;
}

/* -------------------------------------------------------------------------- */
/* about — a quiet desk: manuscript, specimen, code ticks, one molecular ring  */
/* -------------------------------------------------------------------------- */

function aboutSvg() {
  /* An open manuscript lying on the desk, seen at a shallow angle. It is drawn
     as two leaves around a spine rather than as a rectangle on purpose: a
     rectangle with rules inside it reads as a UI panel, which is the one thing
     this band must not look like. */
  const spineX = 596;
  const spineTop = 452;
  const spineFoot = 632;
  const leafRules = (x0, x1, yTop, yFoot, sign) =>
    Array.from({ length: 5 }, (_, i) => {
      const t = 0.16 + i * 0.16;
      const y = round(yTop + (yFoot - yTop) * t);
      const from = round(x0 + (x1 - x0) * 0.1 + sign * 6);
      const to = round(from + (x1 - x0) * (0.72 - (i % 3) * 0.12));
      return `<path d="M${from},${y} L${to},${y}" stroke="${ink(0.12)}" stroke-width="1"/>`;
    }).join('');

  const book = `
    <path d="M372,486 L${spineX},${spineTop} L${spineX},${spineFoot} L372,666 Z"
          fill="#F7F3EA" fill-opacity="0.92" stroke="${ink(0.17)}" stroke-width="1.1"/>
    <path d="M${spineX},${spineTop} L824,486 L824,666 L${spineX},${spineFoot} Z"
          fill="#F9F6EF" fill-opacity="0.92" stroke="${ink(0.17)}" stroke-width="1.1"/>
    <path d="M${spineX},${spineTop} L${spineX},${spineFoot}" stroke="${ink(0.24)}" stroke-width="1.1"/>
    ${leafRules(372, spineX, 508, 644, 1)}
    ${leafRules(spineX, 824, 508, 644, -1)}`;

  /* A soft wash under the leaves so the manuscript sits on the desk instead of
     floating above it. */
  const bookShadow = `<ellipse cx="598" cy="676" rx="238" ry="17" fill="${ink(0.05)}"/>`;

  /* A specimen branch rising out of the desk. The leaves echo the hero's
     flowers in shape and colour without copying them. */
  const stem = smooth([
    [246, 690],
    [288, 596],
    [318, 500],
    [352, 402],
    [402, 300],
    [462, 214],
  ]);
  const leafShape = (cx, cy, angle, scale) =>
    `<path d="M0,0 C${round(16 * scale)},${round(-13 * scale)} ${round(38 * scale)},${round(-11 * scale)} ${round(48 * scale)},0 C${round(38 * scale)},${round(11 * scale)} ${round(16 * scale)},${round(13 * scale)} 0,0 Z"
       transform="translate(${cx} ${cy}) rotate(${angle})"
       fill="${bio(0.2)}" stroke="${bio(0.42)}" stroke-width="1"/>`;
  const leaves = [
    leafShape(320, 486, -38, 1),
    leafShape(300, 566, -142, 0.82),
    leafShape(356, 396, -30, 0.92),
    leafShape(340, 620, -148, 0.7),
    leafShape(404, 296, -22, 0.78),
    leafShape(452, 226, -58, 0.62),
    leafShape(392, 356, -168, 0.6),
  ].join('');

  /* A column of code-like ticks: three groups, uneven line lengths, no text. */
  const codeColumn = [0, 1, 2]
    .map((group) => {
      const top = 236 + group * 168;
      return Array.from({ length: 6 }, (_, i) => {
        const y = round(top + i * 20);
        const indent = [0, 18, 36, 18, 0, 18][i];
        const width = [104, 138, 76, 122, 88, 60][(i + group) % 6];
        return `<path d="M${round(1058 + indent)},${y} L${round(1058 + indent + width)},${y}" stroke="${ink(0.22)}" stroke-width="1.2"/>`;
      }).join('');
    })
    .join('');

  /* One molecular ring, cobalt, with alternating inner bonds. */
  const centre = [1392, 268];
  const radius = 62;
  const vertices = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return [round(centre[0] + Math.cos(angle) * radius), round(centre[1] + Math.sin(angle) * radius)];
  });
  const ring = `<path d="M${vertices.map((v) => v.join(',')).join(' L')} Z" fill="none" stroke="${cobalt(0.48)}" stroke-width="1.5"/>`;
  const bonds = [0, 2, 4]
    .map((i) => {
      const a = vertices[i];
      const b = vertices[(i + 1) % 6];
      return `<path d="M${round((a[0] + b[0]) / 2)},${round((a[1] + b[1]) / 2)} L${round((b[0] + centre[0]) / 2)},${round((b[1] + centre[1]) / 2)}" stroke="${cobalt(0.3)}" stroke-width="1.1"/>`;
    })
    .join('');
  const atoms = vertices
    .map((v) => `<circle cx="${v[0]}" cy="${v[1]}" r="3.1" fill="${cobalt(0.6)}"/>`)
    .join('');

  /* The desk edge, and a few quiet contours in the lower right so the band
     still belongs to the same drawing family as /research. */
  const corner = [0, 1, 2]
    .map((i) => {
      const fn = (t) => 700 - i * 30 - 74 * Math.pow(t, 1.7) + 20 * Math.sin(t * Math.PI * 2.4 + i * 0.6);
      return `<path d="${smooth(sample(fn))}" fill="none" stroke="${ink(0.13 - i * 0.02)}" stroke-width="1"/>`;
    })
    .join('');

  return `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  ${paper('about')}
  <g stroke-linecap="round" stroke-linejoin="round">
    <path d="M96,690 L${WIDTH - 96},690" stroke="${ink(0.13)}" stroke-width="1"/>
    ${corner}
    <path d="${stem}" fill="none" stroke="${bio(0.46)}" stroke-width="1.4"/>
    ${leaves}
    ${bookShadow}
    ${book}
    ${codeColumn}
    ${ring}
    ${bonds}
    ${atoms}
  </g>
</svg>`;
}

/* -------------------------------------------------------------------------- */
/* Slot resolution and rasterisation                                          */
/* -------------------------------------------------------------------------- */

function ownerSource(slot) {
  if (!existsSync(SOURCE_DIR)) return null;
  const accepted = ['.png', '.jpg', '.jpeg', '.tif', '.tiff', '.webp'];
  const files = readdirSync(SOURCE_DIR).filter((file) => accepted.includes(extname(file).toLowerCase()));
  const stems = files.map((file) => ({ file, stem: file.slice(0, -extname(file).length).toLowerCase() }));

  const exact = stems.find((entry) => entry.stem === `${slot.name}-source`);
  if (exact) return join(SOURCE_DIR, exact.file);
  const alias = stems.find((entry) =>
    slot.aliases.some((name) => entry.stem === name || entry.stem.startsWith(`${name}-`)),
  );
  return alias ? join(SOURCE_DIR, alias.file) : null;
}

const images = {};
const keep = new Set();
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(SVG_DIR, { recursive: true });

for (const slot of SLOTS) {
  const owner = ownerSource(slot);
  const svgPath = join(SVG_DIR, `${slot.name}.svg`);
  const svg = slot.name === 'research' ? researchSvg() : aboutSvg();
  writeFileSync(svgPath, svg);
  console.log(`svg    src/assets/pages/${slot.name}.svg`);

  let source;
  let target;

  if (owner) {
    const meta = await sharp(owner).metadata();
    target = Math.min(WIDTH, meta.width ?? WIDTH);
    source = sharp(owner);
    console.log(`source ${owner.replace(ROOT, '.')} (owner asset, ${meta.width}px)`);
  } else {
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
    target = WIDTH;
    source = sharp(png);
    console.log(`source src/assets/pages/${slot.name}.svg (authored vector)`);
  }

  /* §79: the same three-rung ladder the homepage uses. The band renders at most
     896 CSS px, so the 1440 rung covers it at 1.6× and the 1600px file the
     v2.1 pipeline wrote was a rung no screen could resolve. */
  const variants = await writeLadder({
    source,
    target,
    dir: OUT_DIR,
    name: slot.name,
    urlBase: URL_BASE,
    quality: 88,
  });
  for (const v of variants) keep.add(`${slot.name}-${v.w}.webp`);

  const largest = variants[variants.length - 1];
  const height = Math.round((largest.w * HEIGHT) / WIDTH);
  images[slot.name] = {
    src: largest.src,
    width: largest.w,
    height,
    bytes: largest.bytes,
    variants,
  };

  const ladder = variants.map((v) => `${v.w}:${kb(v.bytes)}`).join(' ');
  console.log(
    `write  ${URL_BASE}/${slot.name}-*.webp — up to ${largest.w}×${height}, ${ladder}`,
  );
}

const stale = pruneStale(OUT_DIR, keep);
for (const file of stale) console.log(`· removed stale ${file}`);


writeFileSync(
  MANIFEST,
  `${JSON.stringify(
    {
      generatedBy: 'scripts/build-page-artwork.mjs',
      note: 'Generated. Intrinsic size for the /research and /about bands; do not edit by hand.',
      images,
    },
    null,
    2,
  )}\n`,
);
console.log(`write  src/data/page-artwork.generated.json`);
