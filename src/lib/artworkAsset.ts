/**
 * Artwork asset resolution (v2.2).
 *
 * One place that answers "which files exist for this slot, and at which
 * widths". It exists because two callers now need the same answer and they must
 * not disagree:
 *
 *   · `Artwork.astro` renders the `<img srcset sizes>` that the browser picks
 *     from;
 *   · `BaseLayout.astro` preloads the current page's LCP image (§25) — and a
 *     preload whose candidate list differs from the `<img>`'s by even one
 *     descriptor makes the browser fetch the picture twice, which is strictly
 *     worse than not preloading at all.
 *
 * Both read the descriptor string from here, so they cannot drift.
 *
 * The manifests are generated JSON written by `npm run artwork:v2` and
 * `npm run artwork:pages`. A slot is either a filled record or `null`; `null`
 * is the documented state while an owner asset is outstanding, and it is what
 * makes `Artwork.astro` fall back to its inlined vector drawing.
 */
import homeManifest from '../data/home-artwork.generated.json';
import pageManifest from '../data/page-artwork.generated.json';

/**
 * The seven artwork slots the site has. Declared here rather than in
 * `Artwork.astro` so the layout can name a preload target without importing a
 * component for its types; `Artwork.astro` re-exports it as `ArtworkName`.
 */
export type ArtworkSlot =
  'hero' | 'wennian' | 'hycell' | 'morn' | 'biopulse' | 'research' | 'about';

/** One rendered width of one slot. */
export interface ArtworkVariant {
  w: number;
  src: string;
  bytes: number;
}

export interface ArtworkAsset {
  /** The largest variant. Used as the `src`, i.e. the no-srcset fallback. */
  src: string;
  width: number;
  height: number;
  bytes: number;
  /** Ascending by width. Present on every asset the v2.2 pipeline writes. */
  variants?: ArtworkVariant[];
  /** Only produced when the pipeline is run with `--avif` (§46). */
  avifVariants?: ArtworkVariant[];
}

/* Both manifests are generated JSON, so their keys are inferred as `null` until
   the optimizer runs. The cast is the honest description of the runtime
   contract: a slot is either a filled asset record or absent. */
const assets: Record<string, ArtworkAsset | null> = {
  ...((homeManifest.images ?? {}) as unknown as Record<string, ArtworkAsset | null>),
  ...((pageManifest.images ?? {}) as unknown as Record<string, ArtworkAsset | null>),
};

export function artworkAsset(name: string): ArtworkAsset | null {
  return assets[name] ?? null;
}

/**
 * The `srcset` for one set of variants.
 *
 * Width descriptors (`640w`) rather than density descriptors (`2x`): density
 * cannot express a viewport-relative layout, and every frame on this site is
 * viewport-relative.
 *
 * A single-variant set returns `undefined` instead of a one-entry srcset. A
 * srcset with one candidate is legal but pointless, and emitting one would make
 * the "does this page have a responsive pipeline" question unanswerable by
 * looking at the markup.
 */
export function srcsetFor(variants: ArtworkVariant[] | undefined): string | undefined {
  if (!variants || variants.length < 2) return undefined;
  return variants.map((v) => `${v.src} ${v.w}w`).join(', ');
}

/** The largest variant, or `null`. Used as the preload's `href` fallback. */
export function largestOf(variants: ArtworkVariant[] | undefined): ArtworkVariant | null {
  if (!variants?.length) return null;
  return variants.reduce((a, b) => (b.w > a.w ? b : a));
}
