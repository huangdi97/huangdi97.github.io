/**
 * Work data helper (v2.3).
 *
 * Everything that decides *which* works a page sees, and in what order, lives
 * here — locale, draft, sort, featured. Pages read this and render; no page
 * filters or sorts on its own, so the index and a detail page cannot disagree
 * about whether a work exists.
 *
 * `projects.ts` is the same shape on purpose. The two collections are separate
 * because the two output lines are separate (§6, §91), but the plumbing that
 * reads them should not be, or the site ends up with two conventions for
 * "list the entries in a locale".
 *
 * ## Draft
 *
 * §69 requires a draft to be excluded from a production build, and §30/§31
 * require that nothing the owner has not handed over is ever published. Both
 * are the same rule, so there is one place that applies it.
 *
 * The single exception is the QA mode, and it is deliberately not an
 * environment variable: it is a Vite mode, selected on the command line by the
 * screenshot harness (`astro build --mode works-preview`). A mode is typed, it
 * is visible in the command that produced a build, and `npm run build` — the
 * script CI runs — never sets it. `scripts/check-works.mjs` then asserts
 * against the *default* build that no draft reached `dist/`, which is the claim
 * that actually matters.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type WorkType =
  'film' | 'visual' | 'cultural-ai' | 'digital-heritage' | 'interactive' | 'generative';

export type WorkStatus = 'published' | 'experiment' | 'archive';

export type WorkEntry = CollectionEntry<'works'> | CollectionEntry<'worksZh'>;

/**
 * §21: the shared artwork ladder, reused rather than re-invented.
 *
 * A work's poster ships at the same three rungs as every other image on the
 * site, which is what stops a phone downloading a 1440px file. Kept as a local
 * copy of `LADDER` in `scripts/lib/artwork-ladder.mjs` because that module is
 * Node-side build tooling and cannot be imported into a component.
 */
export const POSTER_WIDTHS = [640, 960, 1440] as const;

/**
 * §82: the minimum number of published works before Works joins the primary
 * navigation. Below it the routes exist and render — they are simply not
 * announced, which is what §71 asks for: unfinished output is not published,
 * it is not described.
 */
export const WORKS_NAV_MIN = 3;

/** The Vite mode the screenshot harness builds under. See the note above. */
const DRAFT_PREVIEW_MODE = 'works-preview';

function previewingDrafts(): boolean {
  return import.meta.env.MODE === DRAFT_PREVIEW_MODE;
}

/**
 * §11/§28: the label a visitor reads for each type. The enum stays short and
 * fixed (§16); this map is the only place the display names live.
 */
export const WORK_TYPE_LABELS: Record<WorkType, Record<Lang, string>> = {
  film: { en: 'Film', zh: '影片' },
  visual: { en: 'Visual Experiment', zh: '视觉实验' },
  'cultural-ai': { en: 'Cultural AI', zh: '文化 AI' },
  'digital-heritage': { en: 'Digital Heritage', zh: '数字遗产' },
  interactive: { en: 'Interactive', zh: '交互作品' },
  generative: { en: 'Generative Visual', zh: '生成视觉' },
};

export const WORK_STATUS_LABELS: Record<WorkStatus, Record<Lang, string>> = {
  published: { en: 'Published', zh: '已发布' },
  experiment: { en: 'Experiment', zh: '实验' },
  archive: { en: 'Archive', zh: '归档' },
};

/**
 * §68: featured first, then year, then publication date, then title.
 *
 * Every step is a total order, and the last one is the title rather than
 * nothing, because a sort that can tie is a sort whose output depends on the
 * order the loader happened to return — which would make two builds of the same
 * content produce different pages.
 */
function compareWorks(a: WorkEntry, b: WorkEntry): number {
  if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1;
  if (a.data.year !== b.data.year) return b.data.year - a.data.year;

  const pa = a.data.publishedAt ?? '';
  const pb = b.data.publishedAt ?? '';
  if (pa !== pb) return pb.localeCompare(pa);

  return a.data.title.localeCompare(b.data.title);
}

/** Every work a build is allowed to render, in the order §68 defines. */
export async function getWorks(lang: Lang): Promise<WorkEntry[]> {
  const entries = lang === 'zh' ? await getCollection('worksZh') : await getCollection('works');
  const visible = previewingDrafts() ? entries : entries.filter((w) => !w.data.draft);
  return [...visible].sort(compareWorks);
}

/** §67: the hook a future homepage selection reads. */
export async function getFeaturedWorks(lang: Lang, limit = 3): Promise<WorkEntry[]> {
  const all = await getWorks(lang);
  return all.filter((w) => w.data.featured).slice(0, limit);
}

/**
 * How many works are public in a locale. Used by the navigation (§82) and by
 * the index to decide whether it has anything to say.
 */
export async function publishedWorkCount(lang: Lang): Promise<number> {
  return (await getWorks(lang)).length;
}

export function workHref(lang: Lang, slug: string): string {
  return lang === 'zh' ? `/zh/works/${slug}/` : `/works/${slug}/`;
}

export function worksHref(lang: Lang): string {
  return lang === 'zh' ? '/zh/works/' : '/works/';
}

/**
 * The `srcset` for one poster, built from the shared ladder.
 *
 * `base` is the schema's `poster` value, which carries no width suffix — the
 * whole point being that a page never hand-writes a per-breakpoint filename
 * and cannot therefore drift from the pipeline (§21).
 */
export function posterSrcset(base: string): string {
  return POSTER_WIDTHS.map((w) => `${base}-${w}.webp ${w}w`).join(', ');
}

/**
 * `9/16` → `9 / 16`, for `aspect-ratio`.
 *
 * §62: the frame is derived from the data rather than fixed at 16:9, which is
 * what keeps a portrait piece from being cropped into a landscape hole.
 */
export function ratioCss(ratio: string): string {
  return ratio.replace('/', ' / ');
}

/**
 * The one line the index prints under a title: `type · year · duration?` (§11).
 *
 * The detail page reuses it rather than reordering the fields. §44's example
 * writes them as `type · duration · year`, but a site whose own meta line
 * changes order between the index and the page it links to reads as a bug, and
 * both orders are illustrations rather than contracts.
 */
export function workMetaLine(data: WorkEntry['data'], lang: Lang): string {
  const parts = [WORK_TYPE_LABELS[data.type][lang], String(data.year)];
  if (data.duration) parts.push(data.duration);
  return parts.join(' · ');
}

/**
 * Where a visitor can actually watch the work, or `null`.
 *
 * §22–§26: an external link is the first-phase model. Nothing here mounts a
 * player — the value is a URL a page renders as an anchor.
 */
export function watchUrl(data: WorkEntry['data']): string | null {
  return data.videoUrl ?? data.externalUrl ?? null;
}
