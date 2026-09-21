/**
 * Works layout facts (v2.3).
 *
 * The same split `src/data/artwork.ts` makes: the image pipeline knows how wide
 * the *files* are, and only the page knows how wide the *hole* is. These are the
 * holes.
 *
 * Every value is measured against the rendered box rather than derived from the
 * grid definition, because the shell's own padding changes at two breakpoints
 * and a `sizes` string that ignores them either over-fetches a rung or — worse —
 * asks for a file narrower than the box and lets the browser upscale.
 *
 *   shell content width   1088px at ≥1280px   (1200px max less 2 × 3.5rem)
 *                          100vw - 5rem at ≥768px
 *                          100vw - 3rem below
 *
 * §21 is the reason this matters: a phone must not be handed a 1440px poster,
 * and the only lever is an accurate `sizes`.
 */

/**
 * Index, landscape work (§10, §65).
 *
 * The entry grid puts the poster in a 68fr track — two thirds of the row, which
 * is the "visual clearly larger than the text" the brief asks for. At the widest
 * breakpoint that is 0.68 × 1088 = 740px.
 */
export const INDEX_LANDSCAPE_SIZES = [
  '(min-width: 1280px) 740px',
  '(min-width: 900px) calc((100vw - 5rem) * 0.68)',
  'calc(100vw - 3rem)',
].join(', ');

/**
 * Index, portrait work (§63).
 *
 * §63 is explicit that a 9:16 piece must not be stretched across the page, so
 * its track is 38fr and the box is 0.38 × 1088 = 414px at the widest
 * breakpoint. On a phone the frame is additionally capped at 78% of the shell
 * by CSS, and the last branch matches that cap so the two cannot disagree.
 */
export const INDEX_PORTRAIT_SIZES = [
  '(min-width: 1280px) 414px',
  '(min-width: 900px) calc((100vw - 5rem) * 0.38)',
  'calc((100vw - 3rem) * 0.78)',
].join(', ');

/**
 * Detail, landscape work (§65).
 *
 * A cinematic piece is allowed the full column here — this is the one surface
 * on the site where a wide band is the point.
 */
export const DETAIL_LANDSCAPE_SIZES = [
  '(min-width: 1280px) 1088px',
  '(min-width: 768px) calc(100vw - 5rem)',
  'calc(100vw - 3rem)',
].join(', ');

/**
 * Detail, portrait work (§63–§64).
 *
 * Capped by width rather than by height, and that is deliberate: capping the
 * height would crop the composition, which §58 forbids. 520px is a comfortable
 * column for a 9:16 poster and keeps a phone poster under a screen tall.
 *
 * The branches mirror `.work-detail-poster--portrait` in `pages/works/[slug]`
 * exactly — `sizes` only chooses a file, so if the two disagree the browser is
 * asked for a rung the box does not need (or, worse, one it must upscale).
 */
export const DETAIL_PORTRAIT_SIZES = [
  '(min-width: 1280px) 520px',
  '(min-width: 768px) calc((100vw - 5rem) * 0.72)',
  'calc((100vw - 3rem) * 0.72)',
].join(', ');
