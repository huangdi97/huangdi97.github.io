/**
 * Artwork crop preview — what `object-fit: cover` + `object-position` will
 * actually show, rendered from the source files.
 *
 * Usage: npm run artwork:preview -- <ratio> <posX> <posY> <outDir> [slot...]
 *        npm run artwork:preview -- 1.5 46 50 .qa-art/crop
 *        npm run artwork:preview -- 1.5 70 50 .qa-art/pages research about
 *
 * §28 asks for each image to be positioned individually, and §10 asks for the
 * hero's subject to land right-of-centre. Neither can be judged from an aspect
 * ratio and a percentage: the sources disagree about where their subject is, and
 * several of them put content across the full width. This reproduces the
 * browser's crop in sharp so the decision is made by looking at the picture.
 *
 * Slots are discovered from the two archives the pipelines read —
 * `.artwork-source/home/v2/` and `.artwork-source/site/v2/pages/` — so the
 * preview can never drift from what will actually be built: the same files, the
 * same `<slot>-source.<ext>` convention. Pass slot names to preview a subset.
 *
 * The percentages it prints are the shares of the source that survive and the
 * window that remains, which is what the crop decision is actually about.
 *
 * Output goes to a scratch directory; nothing here is a build input.
 */
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import sharp from 'sharp';

const [ratioArg, posXArg, posYArg, outDir, ...only] = process.argv.slice(2);
const R = Number(ratioArg);
const px = Number(posXArg);
const py = Number(posYArg);

if (!Number.isFinite(R) || !Number.isFinite(px) || !Number.isFinite(py) || !outDir) {
  console.error('\n  usage: npm run artwork:preview -- <ratio> <posX> <posY> <outDir> [slot...]\n');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const DIRS = ['.artwork-source/home/v2', '.artwork-source/site/v2/pages'];
const ACCEPTED = new Set(['.png', '.jpg', '.jpeg', '.tif', '.tiff', '.webp', '.avif']);
const OUT_W = 560;

const FILES = {};
for (const dir of DIRS) {
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    if (!ACCEPTED.has(extname(file).toLowerCase())) continue;
    const stem = file.slice(0, -extname(file).length).replace(/-source$/i, '');
    FILES[stem] ??= join(dir, file);
  }
}

const wanted = only.length ? only : Object.keys(FILES);
if (wanted.length === 0) {
  console.error('\n  no source artwork found in .artwork-source/ — nothing to preview.\n');
  process.exit(1);
}

const pct = (v) => `${v.toFixed(1)}%`;

for (const key of wanted) {
  const p = FILES[key];
  if (!p) {
    console.log(`  ${key.padEnd(9)} — no source file`);
    continue;
  }

  const { width: w, height: h } = await sharp(p).metadata();
  const sourceAspect = w / h;

  let cropW, cropH, left, top;
  if (sourceAspect > R) {
    // Source is wider than the frame: height fills, width is cropped.
    cropH = h;
    cropW = Math.round(h * R);
    left = Math.round((w - cropW) * (px / 100));
    top = 0;
  } else {
    // Source is taller: width fills, height is cropped.
    cropW = w;
    cropH = Math.round(w / R);
    left = 0;
    top = Math.round((h - cropH) * (py / 100));
  }

  await sharp(p)
    .extract({ left, top, width: cropW, height: cropH })
    .resize({ width: OUT_W })
    .png()
    .toFile(`${outDir}/${key}.png`);

  const lostW = ((w - cropW) / w) * 100;
  const lostH = ((h - cropH) / h) * 100;
  const x0 = (left / w) * 100;
  const x1 = ((left + cropW) / w) * 100;
  const y0 = (top / h) * 100;
  const y1 = ((top + cropH) / h) * 100;

  console.log(
    `  ${key.padEnd(9)} frame ${String(R).padEnd(5)} ${String(w) + '×' + h} → ${cropW}×${cropH}  ` +
      `lost ${pct(lostW)}w ${pct(lostH)}h  ` +
      `window x ${pct(x0)}–${pct(x1)}  y ${pct(y0)}–${pct(y1)}  @ ${px}% ${py}%`,
  );
}
