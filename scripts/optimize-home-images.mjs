#!/usr/bin/env node
/**
 * Homepage artwork v2 — source images in, web-ready WebP out.
 *
 * This script exists because of one constraint in the v2.0-P1 brief: the five
 * official visual assets are the owner's, and they may arrive as anything —
 * a 6000px PNG export, a 4 MB JPEG, a phone screenshot. What the page needs is
 * a bounded set of files: five WebP images at a known width, with their
 * intrinsic dimensions recorded so the layout can reserve space before the
 * bytes arrive.
 *
 * So the split is: the owner supplies pixels, this script supplies the envelope.
 *
 *   .artwork-source/home/v2/  ──►  hero.webp · wennian.webp · hycell.webp ·
 *                                  morn.webp · biopulse.webp
 *                                  +  src/data/home-artwork.generated.json
 *
 * The sources live outside `public/` on purpose. Everything under `public/` is
 * copied verbatim into `dist/` and is therefore publicly fetchable, so keeping
 * 12 MB of originals there published them at `/images/home/v2/source/*.png`
 * with nothing referencing them. `.artwork-source/` is an archive, not a served
 * directory; the WebP files written next to this script are the only images the
 * browser ever sees.
 *
 * The manifest is the part that matters to correctness. `Artwork.astro` reads
 * width/height from it and sets `aspect-ratio`, which is what keeps CLS at zero
 * (§49). Without it the browser would have to discover the dimensions after
 * decoding, and the hero would jump.
 *
 * The canonical input name is `<slot>-source.<ext>` (`hero-source.png`), and that
 * name resolves through the exact-match pass. Matching is nonetheless by stem
 * rather than by exact filename, because the inputs are the owner's and have not
 * always arrived canonical: `hero.png`, `Hero-final.jpg` and `hero@2x.png` all
 * land in the `hero` slot too. An exact stem match always wins over a substring
 * match, so a file literally called `morn.png` cannot be stolen by an alias.
 *
 * Nothing here designs, redraws or substitutes an asset (§2). With no sources
 * present the script reports that and exits 0 — a missing owner asset is a
 * known state, not a build failure.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { kb, pruneStale, writeLadder } from './lib/artwork-ladder.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_DIR = join(ROOT, 'public', 'images', 'home', 'v2');
const SOURCE_DIR = join(ROOT, '.artwork-source', 'home', 'v2');
const MANIFEST = join(ROOT, 'src', 'data', 'home-artwork.generated.json');
const URL_BASE = '/images/home/v2';

/** The five slots, in page order, with the width each one is allowed to land on. */
const SLOTS = [
  {
    name: 'hero',
    /** §5: Hero is the one image allowed to be large. */
    width: 2000,
    minWidth: 1800,
    maxWidth: 2200,
    maxBytes: 700 * 1024,
    quality: 84,
    aliases: ['hero', 'home', 'homepage', 'haolei'],
  },
  {
    name: 'wennian',
    width: 1600,
    minWidth: 1400,
    maxWidth: 1800,
    maxBytes: 500 * 1024,
    quality: 82,
    aliases: ['wennian', 'zhishen', '知身', '问年'],
  },
  {
    name: 'hycell',
    width: 1600,
    minWidth: 1400,
    maxWidth: 1800,
    maxBytes: 500 * 1024,
    quality: 82,
    aliases: ['hycell', 'cell'],
  },
  {
    name: 'morn',
    width: 1600,
    minWidth: 1400,
    maxWidth: 1800,
    maxBytes: 500 * 1024,
    quality: 82,
    aliases: ['morn'],
  },
  {
    name: 'biopulse',
    width: 1600,
    minWidth: 1400,
    maxWidth: 1800,
    maxBytes: 500 * 1024,
    quality: 82,
    aliases: ['biopulse', 'pulse'],
  },
];

const ACCEPTED = new Set(['.png', '.jpg', '.jpeg', '.tif', '.tiff', '.webp', '.avif']);

/** Lowercase, drop every separator, keep CJK. `Hero (final).PNG` → `herofinalpng`. */
const normalise = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

/**
 * The canonical handover name for a slot is `<slot>-source.png`, so that suffix
 * is removed before matching. Without it `hero-source` normalises to
 * `herosource`, misses the exact-match pass, and is only rescued later by the
 * `hero` alias — the right file either way, but the documented name would be
 * riding a fallback. Stripping it lets the canonical name resolve as the
 * statement of intent it is, and leaves the alias list doing what it is for:
 * absorbing names that were never canonical in the first place.
 */
const stemOf = (base) => {
  const stem = normalise(base);
  const canonical = stem.replace(/source$/, '');
  return canonical.length ? canonical : stem;
};

function fail(message) {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(1);
}

function readSources() {
  if (!existsSync(SOURCE_DIR)) return [];
  return readdirSync(SOURCE_DIR)
    .filter((f) => !f.startsWith('.') && ACCEPTED.has(extname(f).toLowerCase()))
    .map((f) => ({ file: f, path: join(SOURCE_DIR, f), stem: stemOf(f.slice(0, -extname(f).length)) }));
}

/**
 * Assign each slot exactly one source file.
 *
 * Two passes on purpose: an exact stem match is a statement of intent and must
 * not lose to a substring match on a different file. Only when no slot claims a
 * file by exact name does substring matching run.
 */
function assign(sources) {
  const taken = new Map();
  const claimed = new Set();

  for (const slot of SLOTS) {
    const hit = sources.find((s) => s.stem === slot.name);
    if (hit && !claimed.has(hit.path)) {
      taken.set(slot.name, { ...hit, via: 'exact' });
      claimed.add(hit.path);
    }
  }

  for (const slot of SLOTS) {
    if (taken.has(slot.name)) continue;
    const hits = sources.filter(
      (s) => !claimed.has(s.path) && slot.aliases.some((a) => s.stem.includes(normalise(a))),
    );
    if (hits.length > 1) {
      fail(
        `two source files both look like "${slot.name}": ${hits.map((h) => h.file).join(', ')}. ` +
          `Rename one, or name the intended file exactly "${slot.name}".`,
      );
    }
    if (hits.length === 1) {
      taken.set(slot.name, { ...hits[0], via: 'alias' });
      claimed.add(hits[0].path);
    }
  }

  return { taken, unmatched: sources.filter((s) => !claimed.has(s.path)) };
}

async function run() {
  /* No `--avif` flag any more. §46 makes AVIF optional and asks that the format
     not complicate the engineering; the flag was never used and its output was
     a single full-size file, which would have fought the srcset rather than
     joined it. `Artwork.astro` still renders an AVIF `<source>` when a slot
     carries `avifVariants`, so the capability is there for a round that wants
     it — it just has to arrive as a ladder, like everything else. */
  mkdirSync(SOURCE_DIR, { recursive: true });

  const sources = readSources();
  if (sources.length === 0) {
    console.log('\n  Homepage artwork v2 — no source images yet.');
    console.log(`  Drop the five official files into ${SOURCE_DIR.replace(ROOT, '.')} and run this again.`);
    console.log('  The homepage is currently rendering its placeholder drawings.\n');
    return;
  }

  const { taken, unmatched } = assign(sources);

  for (const s of unmatched) console.log(`  · skipped (no slot): ${s.file}`);
  const missing = SLOTS.filter((s) => !taken.has(s.name)).map((s) => s.name);
  if (missing.length) console.log(`  · no source yet: ${missing.join(', ')}`);

  const images = {};
  let written = 0;
  let total = 0;
  const keep = new Set();

  for (const slot of SLOTS) {
    const source = taken.get(slot.name);
    if (!source) continue;

    const meta = await sharp(source.path).metadata();
    if (!meta.width || !meta.height) fail(`${source.file} has no readable dimensions.`);

    // Never upscale: a 900px source stays 900px. Blowing it up would add bytes
    // and lose detail at the same time.
    const target = Math.min(slot.width, meta.width);
    if (target < slot.minWidth) {
      console.log(
        `  ! ${source.file} is only ${meta.width}px wide — below the ${slot.minWidth}px target for ${slot.name}.`,
      );
    }

    /* §21/§79: one ladder per slot, shared with the page pipeline. `rotate()`
       first so an EXIF-oriented phone export is upright before it is resized. */
    const variants = await writeLadder({
      source: sharp(source.path).rotate(),
      target,
      dir: ASSET_DIR,
      name: slot.name,
      urlBase: URL_BASE,
      quality: slot.quality,
    });
    for (const v of variants) keep.add(`${slot.name}-${v.w}.webp`);

    const largest = variants[variants.length - 1];
    const size = largest.bytes;
    total += variants.reduce((sum, v) => sum + v.bytes, 0);
    written += 1;

    const entry = {
      src: largest.src,
      width: largest.w,
      height: Math.round((largest.w * meta.height) / meta.width),
      bytes: size,
      variants,
    };

    images[slot.name] = entry;

    const flag = size > slot.maxBytes ? '!' : ' ';
    // How the file was found is printed, because "the canonical name resolved"
    // and "an alias happened to catch it" are different states and only one of
    // them means the naming contract is being honoured.
    const via = source.via === 'alias' ? '  (via alias)' : '';
    const ladder = variants.map((v) => `${v.w}:${kb(v.bytes)}`).join(' ');
    console.log(
      `  ${flag} ${slot.name.padEnd(9)} ${String(largest.w).padStart(5)}×${String(entry.height).padEnd(5)}  ${kb(size).padStart(8)}  ${ladder.padEnd(30)}  ${source.file}${via}`,
    );
  }

  const stale = pruneStale(ASSET_DIR, keep);
  for (const file of stale) console.log(`  · removed stale ${file}`);

  // The manifest is written even when only some slots landed, so a partial drop
  // integrates partially instead of not at all.
  writeFileSync(
    MANIFEST,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        note: 'Generated by `npm run artwork:v2` (scripts/optimize-home-images.mjs). Do not edit by hand.',
        images: Object.fromEntries(SLOTS.map((s) => [s.name, images[s.name] ?? null])),
      },
      null,
      2,
    )}\n`,
  );

  console.log(`\n  ${written}/5 integrated · ${kb(total)} across all rungs → ${MANIFEST.replace(ROOT, '.')}`);
  console.log('  Re-run the screenshot QA; the per-image object-position still needs a human eye.\n');
}

run().catch((err) => fail(err.stack ?? String(err)));
