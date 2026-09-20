#!/usr/bin/env node
/**
 * Paper texture (v2.2.1) — one small, seamless, **isotropic** tiling grain.
 *
 * What changed, and why. The v2.2 generator gave the noise a direction on
 * purpose: on top of the isotropic octaves it mixed a second noise field with a
 * wide lattice on X and a narrow one on Y, described in that file as "streaks
 * that run across the tile … gives the grain a direction". Measured, the result
 * was a strongly anisotropic tile:
 *
 *     mean |step| along X   1.2575
 *     mean |step| along Y   6.0340
 *     anisotropy X/Y        0.2084      (1.0 is isotropic)
 *     row-profile σ (w=8)  15.88        against 4.59 per column
 *
 * i.e. the picture changed slowly left-to-right and fast top-to-bottom, so
 * every feature in it was a horizontal streak. Repeated every 256px behind
 * every page, that is a 256px-periodic field of horizontal stripes — which is
 * exactly what the owner reported as "horizontal blur bands / faint stripes /
 * horizontal smearing".
 *
 * The owner's brief (§3) is unambiguous: "isotropic grain, no directionality,
 * no horizontal repetition, no visible tile seam". So the fibre layer is gone.
 * There is no longer any term in this file that treats X differently from Y —
 * every octave is generated with the same lattice size on both axes, and the
 * anisotropy of the output is a measured acceptance criterion rather than a
 * design intent. `npm run texture:check` fails if it drifts outside 0.9–1.1.
 *
 * What it still is: **alpha-only noise**. RGB is a constant black and the whole
 * picture lives in the alpha channel, so the layer can only ever darken what is
 * under it — the same behaviour as the inline `--grain` SVG that has carried the
 * paper theme since v1.4, and the reason the texture cannot tint a theme it was
 * not drawn for. Night inverts it in CSS (`filter: invert(1)`) rather than
 * shipping a second file.
 *
 * Two more corrections ride along:
 *
 *   · **Lossless.** v2.2 encoded at `webp({ quality: 88, alphaQuality: 92 })`.
 *     Lossy WebP compresses alpha in blocks, and a block-structured alpha ramp
 *     at this scale is a second, independent source of banding. The file is
 *     small enough to be stored losslessly, so it is.
 *   · **128×128, not 256×256.** §3 names either. The tile is a quarter of the
 *     pixels, which is what makes lossless affordable at all, and fine grain
 *     repeats invisibly — a pattern is what repeats visibly, and this is not a
 *     pattern.
 *
 * Seamlessness is still structural, not eyeballed: every octave is value noise
 * on a *toroidal* lattice — the lattice is indexed modulo its own size — so the
 * left edge continues into the right edge exactly, at every octave, by
 * construction. The check is the same one v2.2 used: wrapped mean |step| must
 * not exceed the interior mean |step| by more than 1%.
 *
 * Determinism matters more here than it looks. A texture that changed on every
 * run would make the QA screenshots unrepeatable and would show up as a diff on
 * every build. The generator is a seeded LCG, so the file is byte-identical
 * across runs and machines.
 *
 * Usage: node scripts/build-paper-texture.mjs [--check]
 *   --check   build into memory, verify the numbers, write nothing
 */
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'texture');
const OUT = join(OUT_DIR, 'paper.webp');

/** 128px: §3's smaller option, and a whole number of tiles across every breakpoint. */
const SIZE = 128;
/** The seed is the round's date. Changing it changes the texture; nothing else does. */
const SEED = 20260921;

/** §3: the layer's own opacity ceiling. Enforced here so the number cannot drift. */
const MAX_BYTES = 30 * 1024;
/** Isotropy acceptance band, measured as mean |step| X divided by mean |step| Y. */
const ISOTROPY = [0.9, 1.1];
/** Tile-seam acceptance: wrapped mean |step| / interior mean |step|. */
const SEAM_MAX = 1.01;

function makeRandom(seed) {
  let s = seed >>> 0;
  return () => {
    // Numerical Recipes LCG. Not cryptographic — it only has to be stable.
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Value noise on a toroidal lattice, normalised to 0…1.
 *
 * `cells` is a single number. v2.2 took two, which is the whole of how the
 * direction got in; one number means the lattice is square and the noise is
 * isotropic by construction rather than by inspection.
 */
function valueNoise(size, cells, rand) {
  const lattice = new Float64Array(cells * cells);
  for (let i = 0; i < lattice.length; i += 1) lattice[i] = rand();

  const wrap = (v, m) => ((v % m) + m) % m;
  const at = (x, y) => lattice[wrap(y, cells) * cells + wrap(x, cells)];
  const smooth = (t) => t * t * (3 - 2 * t);

  const out = new Float64Array(size * size);
  const s = cells / size;

  for (let y = 0; y < size; y += 1) {
    const fy = y * s;
    const y0 = Math.floor(fy);
    const ty = smooth(fy - y0);
    for (let x = 0; x < size; x += 1) {
      const fx = x * s;
      const x0 = Math.floor(fx);
      const tx = smooth(fx - x0);

      const top = at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx;
      const bottom = at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx;
      out[y * size + x] = top * (1 - ty) + bottom * ty;
    }
  }
  return out;
}

/**
 * Octave, weight. Six octaves on a 128px tile reach down to 2px features, which
 * is what makes the field read as grain rather than as cloud. The weights fall
 * off steeply so the coarse octaves set the tone and the fine ones only add
 * tooth.
 */
const OCTAVES = [
  [4, 0.26],
  [8, 0.22],
  [16, 0.2],
  [32, 0.16],
  [64, 0.11],
  [128, 0.05],
];

/** Alpha is quantised to 6 bits. At 2% layer opacity one step is 0.07% of a
 *  level — far below anything the eye can resolve, and it roughly halves the
 *  file, which is what lets the tile be stored losslessly. */
const LEVELS = 64;

async function build() {
  const rand = makeRandom(SEED);

  const field = new Float64Array(SIZE * SIZE);
  for (const [cells, weight] of OCTAVES) {
    const octave = valueNoise(SIZE, cells, rand);
    for (let i = 0; i < field.length; i += 1) field[i] += octave[i] * weight;
  }

  const rgba = Buffer.alloc(SIZE * SIZE * 4);
  const alpha = new Float64Array(SIZE * SIZE);
  let sum = 0;

  for (let i = 0; i < SIZE * SIZE; i += 1) {
    /* Centred on 0.5 and kept low-contrast on purpose: at 2% layer opacity a
       high-contrast grain stops being paper and starts being dirt. */
    const v = Math.max(0, Math.min(1, 0.5 + (field[i] - 0.5) * 0.78));
    const a = Math.round(v * (LEVELS - 1)) / (LEVELS - 1);
    alpha[i] = a;
    sum += a;

    // RGB stays black: the layer is allowed to darken, never to tint.
    rgba[i * 4] = 0;
    rgba[i * 4 + 1] = 0;
    rgba[i * 4 + 2] = 0;
    rgba[i * 4 + 3] = Math.round(a * 255);
  }

  /* Lossless: no block-structured alpha artefacts to reintroduce the banding
     this round removed. */
  const buffer = await sharp(rgba, { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .webp({ lossless: true, effort: 6 })
    .toBuffer();

  /* ---- measured, not asserted ---- */
  const stepX = (wrap) => {
    let s = 0;
    let n = 0;
    for (let y = 0; y < SIZE; y += 1) {
      for (let x = 0; x < SIZE - 1; x += 1) {
        s += Math.abs(alpha[y * SIZE + x + 1] - alpha[y * SIZE + x]);
        n += 1;
      }
      if (wrap) {
        s += Math.abs(alpha[y * SIZE] - alpha[y * SIZE + SIZE - 1]);
        n += 1;
      }
    }
    return s / n;
  };
  const stepY = (wrap) => {
    let s = 0;
    let n = 0;
    for (let x = 0; x < SIZE; x += 1) {
      for (let y = 0; y < SIZE - 1; y += 1) {
        s += Math.abs(alpha[(y + 1) * SIZE + x] - alpha[y * SIZE + x]);
        n += 1;
      }
      if (wrap) {
        s += Math.abs(alpha[x] - alpha[(SIZE - 1) * SIZE + x]);
        n += 1;
      }
    }
    return s / n;
  };

  const ix = stepX(false);
  const iy = stepY(false);
  const isotropy = ix / iy;
  const seamX = stepX(true) / ix;
  const seamY = stepY(true) / iy;
  const meanAlpha = sum / (SIZE * SIZE);

  return { buffer, meanAlpha, isotropy, seamX, seamY, ix, iy };
}

async function run() {
  const check = process.argv.includes('--check');
  const { buffer, meanAlpha, isotropy, seamX, seamY, ix, iy } = await build();

  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  const f = (n) => n.toFixed(4);

  const failures = [];
  if (buffer.length > MAX_BYTES) {
    failures.push(`texture is ${kb(buffer.length)} — §63 caps it at 30 KB`);
  }
  if (isotropy < ISOTROPY[0] || isotropy > ISOTROPY[1]) {
    failures.push(
      `anisotropy X/Y is ${f(isotropy)} — outside ${ISOTROPY[0]}–${ISOTROPY[1]}; ` +
        'the grain has a direction again',
    );
  }
  if (seamX > SEAM_MAX || seamY > SEAM_MAX) {
    failures.push(`tile does not join itself: seam X ${f(seamX)}, seam Y ${f(seamY)}`);
  }

  console.log(`\n  paper texture · ${SIZE}×${SIZE} · ${kb(buffer.length)} · mean alpha ${f(meanAlpha)}`);
  console.log(`    mean |step| X ${f(ix)}   Y ${f(iy)}   anisotropy ${f(isotropy)}`);
  console.log(`    seam X ${f(seamX)}   seam Y ${f(seamY)}   (1.0000 = joins itself)`);

  if (failures.length) {
    console.error('');
    for (const failure of failures) console.error(`  ✗ ${failure}`);
    console.error('');
    process.exit(1);
  }

  if (check) {
    console.log('  ✓ isotropic, seamless, inside the size cap (check only)\n');
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT, buffer);
  console.log(`  ✓ isotropic, seamless, inside the size cap`);
  console.log(`    on disk: ${kb(statSync(OUT).size)} → ${OUT.replace(ROOT, '.')}\n`);
}

run().catch((err) => {
  console.error(`\n  ✗ ${err.stack ?? String(err)}\n`);
  process.exit(1);
});
