#!/usr/bin/env node
/**
 * Paper texture (v2.2) — one small, seamless, tiling grain.
 *
 * The v2.2 brief asks the site's base visual to come from three layers, and the
 * second of them is "very light paper / noise texture" (§2). §7 bounds it hard:
 * 128–512px, WebP, ideally under 20–30 KB, and explicitly *not* a large
 * paper-ground image. §63 repeats the ceiling. §60 says the homepage should add
 * as few non-HTML resources as it can get away with.
 *
 * Those last two pull in opposite directions, so the texture is built to be
 * cheap enough that both hold: 256×256, one channel of variation, repeated.
 *
 * What it is, precisely: **alpha-only noise**. RGB is a constant black and the
 * whole picture lives in the alpha channel, so the layer can only ever darken
 * what is under it — the same behaviour as the inline `--grain` SVG that has
 * carried the paper theme since v1.4, and the reason the texture cannot tint a
 * theme it was not drawn for. Night inverts it in CSS (`filter: invert(1)`)
 * rather than shipping a second file.
 *
 * Seamlessness is structural, not eyeballed. Every octave is value noise on a
 * *toroidal* lattice — the lattice is indexed modulo its own size — so the left
 * edge continues into the right edge exactly, at every octave, by construction.
 * The fibre layer is the same noise with a wide lattice on X and a narrow one
 * on Y, which stretches the cells into horizontal streaks and gives the grain a
 * direction; isotropic noise alone reads as digital sand rather than paper.
 *
 * Determinism matters more here than it looks. A texture that changes on every
 * run would make the QA screenshots unrepeatable and would show up as a diff on
 * every build. The generator is a seeded LCG, so the file is byte-identical
 * across runs and machines.
 *
 * Usage: node scripts/build-paper-texture.mjs [--check]
 *   --check   build into memory and report the size without writing the file
 */
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'texture');
const OUT = join(OUT_DIR, 'paper.webp');

/** 256px: §7's middle option, and a whole number of tiles across every breakpoint. */
const SIZE = 256;
/** The seed is the round's date. Changing it changes the texture; nothing else does. */
const SEED = 20260920;

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
 * `cellsX`/`cellsY` are separate so the same function can produce the
 * horizontal fibre streaks as well as the isotropic grain.
 */
function valueNoise(size, cellsX, cellsY, rand) {
  const lattice = new Float64Array(cellsX * cellsY);
  for (let i = 0; i < lattice.length; i += 1) lattice[i] = rand();

  const wrap = (v, m) => ((v % m) + m) % m;
  const at = (x, y) => lattice[wrap(y, cellsY) * cellsX + wrap(x, cellsX)];
  const smooth = (t) => t * t * (3 - 2 * t);

  const out = new Float64Array(size * size);
  const sx = cellsX / size;
  const sy = cellsY / size;

  for (let y = 0; y < size; y += 1) {
    const fy = y * sy;
    const y0 = Math.floor(fy);
    const ty = smooth(fy - y0);
    for (let x = 0; x < size; x += 1) {
      const fx = x * sx;
      const x0 = Math.floor(fx);
      const tx = smooth(fx - x0);

      const top = at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx;
      const bottom = at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx;
      out[y * size + x] = top * (1 - ty) + bottom * ty;
    }
  }
  return out;
}

/** Octave, weight. Four is enough: a fifth is invisible under 4% opacity. */
const OCTAVES = [
  [4, 0.42],
  [8, 0.26],
  [16, 0.16],
  [32, 0.09],
];

async function build() {
  const rand = makeRandom(SEED);

  const field = new Float64Array(SIZE * SIZE);
  for (const [cells, weight] of OCTAVES) {
    const octave = valueNoise(SIZE, cells, cells, rand);
    for (let i = 0; i < field.length; i += 1) field[i] += octave[i] * weight;
  }

  // 3 × 48: wide and short cells, i.e. streaks that run across the tile.
  const fibre = valueNoise(SIZE, 3, 48, rand);

  const rgba = Buffer.alloc(SIZE * SIZE * 4);
  let sum = 0;

  for (let i = 0; i < SIZE * SIZE; i += 1) {
    // Centred on 0.5 and kept low-contrast on purpose: at 3.5% layer opacity a
    // high-contrast grain stops being paper and starts being dirt.
    const v = 0.5 + (field[i] - 0.5) * 0.82 + (fibre[i] - 0.5) * 0.5;
    const a = Math.max(0, Math.min(1, v));
    sum += a;

    // RGB stays black: the layer is allowed to darken, never to tint.
    rgba[i * 4] = 0;
    rgba[i * 4 + 1] = 0;
    rgba[i * 4 + 2] = 0;
    rgba[i * 4 + 3] = Math.round(a * 255);
  }

  const buffer = await sharp(rgba, {
    raw: { width: SIZE, height: SIZE, channels: 4 },
  })
    .webp({ quality: 88, effort: 6, alphaQuality: 92 })
    .toBuffer();

  const meanAlpha = sum / (SIZE * SIZE);
  return { buffer, meanAlpha };
}

async function run() {
  const check = process.argv.includes('--check');
  const { buffer, meanAlpha } = await build();

  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  const line =
    `  ${SIZE}×${SIZE} · ${kb(buffer.length)} · mean alpha ${meanAlpha.toFixed(3)} ` +
    `· ${check ? '(check only)' : `→ ${OUT.replace(ROOT, '.')}`}`;

  if (buffer.length > 30 * 1024) {
    console.error(`\n  ✗ texture is ${kb(buffer.length)} — §63 caps it at 30 KB\n`);
    process.exit(1);
  }

  if (!check) {
    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(OUT, buffer);
    const onDisk = statSync(OUT).size;
    console.log(`\n  paper texture written${line}`);
    console.log(`  on disk: ${kb(onDisk)}\n`);
    return;
  }

  console.log(`\n  paper texture${line}\n`);
}

run().catch((err) => {
  console.error(`\n  ✗ ${err.stack ?? String(err)}\n`);
  process.exit(1);
});
