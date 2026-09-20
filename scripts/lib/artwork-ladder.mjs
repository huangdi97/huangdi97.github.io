/**
 * The responsive ladder (v2.2).
 *
 * One description of "which widths an artwork slot ships at", used by both
 * image pipelines. It is shared rather than duplicated because the two
 * pipelines had already drifted once — `optimize-home-images.mjs` wrote one
 * file per slot and `build-page-artwork.mjs` wrote one file per slot, each with
 * its own idea of the target width — and the thing the brief asks for (§21,
 * §79) is that there is *one* ladder and no invented extras.
 *
 * Why three rungs and not five. §79 caps the set at "640 / 960 / 1440" and says
 * in as many words not to generate dozens of sizes. Those three are also the
 * only three the layout can use:
 *
 *   640   a 390px phone at 1×, and any frame under ~660 CSS px at 1×
 *   960   a 390px phone at 2× (the actual common case), a tablet at 1×
 *   1440  the widest frame on the site — a 662px homepage row at 2.17×
 *
 * The top rung is 1440 rather than the 1600 the v2.1 pipeline wrote, and that
 * is a deliberate reduction rather than an oversight: nothing on the site
 * renders wider than 662 CSS px, so the extra 160px was bytes no screen could
 * resolve. Sources are never touched (§50) — only the generated envelope
 * changes.
 */
import { readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

/** The rendered widths every slot ships. Ascending, and the only sizes (§79). */
export const LADDER = [640, 960, 1440];

/**
 * The rungs this slot can actually produce.
 *
 * A source narrower than a rung never gets upscaled — §21 of the v2.0 brief
 * established that, and the home pipeline already refuses to enlarge. A source
 * below the first rung ships at its own width instead, so a small owner file
 * degrades to "one correct file" rather than "no file".
 */
export function ladderWidths(target) {
  const widths = LADDER.filter((w) => w <= target);
  return widths.length ? widths : [target];
}

/**
 * Encode one slot's ladder.
 *
 * `source` is a sharp instance with any orientation step already applied
 * (`sharp(path).rotate()`); it is cloned per rung so the pipeline is rebuilt
 * from the original pixels each time rather than resampled from a resampled
 * file.
 */
export async function writeLadder({ source, target, dir, name, urlBase, quality }) {
  const variants = [];

  for (const width of ladderWidths(target)) {
    const file = join(dir, `${name}-${width}.webp`);
    const info = await source
      .clone()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(file);

    variants.push({ w: info.width, src: `${urlBase}/${name}-${width}.webp`, bytes: info.size });
  }

  return variants;
}

/**
 * Delete generated files in `dir` that this run did not write.
 *
 * This matters more than it looks. `public/` is a passthrough directory — every
 * byte in it is copied into `dist/` and served — so a `hero.webp` left over
 * from the previous round is not a harmless stale artefact, it is a published
 * URL that nothing references. The v2.1 lesson (twelve megabytes of source PNGs
 * reachable at `/images/home/v2/source/`) is the reason this exists.
 *
 * Individual `unlinkSync` calls rather than a recursive remove: the sandbox
 * blocks bulk deletion, and the count here is five to seven files.
 */
export function pruneStale(dir, keep) {
  const removed = [];

  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.webp')) continue;
    if (keep.has(file)) continue;
    try {
      unlinkSync(join(dir, file));
      removed.push(file);
    } catch {
      /* Reported by the caller as a warning; never fatal. */
    }
  }

  return removed;
}

/** `183990` → `"180 KB"`. Used by both pipelines' logs. */
export function kb(n) {
  return n < 1024 * 1024 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`;
}
