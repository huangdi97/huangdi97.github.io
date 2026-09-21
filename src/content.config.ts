import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Project content model.
 *
 * Metadata lives in frontmatter so pages never hard-code project copy.
 *
 * v2.1 (§15–§21): the body is a **public case study**, not a build report. It
 * answers five questions and stops:
 *
 *   ## What it is
 *   ## Why it matters
 *   ## Current public status
 *   ## What is publicly available
 *   ## Notes
 *
 * A **concept** that has not been implemented (TaiYi Lingjing) keeps its own
 * structure on purpose, so it can never read like a build report: the same five
 * headings, with "Current public status" stating plainly that nothing has
 * started.
 *
 * Removed in v2.1 and deliberately not replaced: system design, architecture,
 * core capabilities, technical decisions, engineering implementation,
 * validation internals, "what I learned" and next steps. Those describe how a
 * system is built and where it is going, which is internal design rather than
 * public surface.
 *
 * Also removed in v2.1: the six `cover*` fields, the `groups` buckets and
 * `publicIntro`. The cover belonged to the retired ProjectCover component, and a
 * capability list is the "core capability breakdown" the round takes off the
 * public surface. `groups` existed only for the /projects filter bar, which is
 * gone; `publicIntro` duplicated `description`. v2.2.1 then took `description`
 * off /projects as well, which leaves `publicLine` as the single positioning
 * line that both the homepage row and the directory print.
 *
 * `repo` is only set when the repository has been verified to exist and to be
 * public. Unverified projects simply omit it and show no repository link.
 */

const projectSchema = z.object({
  title: z.string(),
  /**
   * Brand name in the other locale, shown under the title.
   * Product brand and repository slug are allowed to differ; this keeps both
   * visible without turning the page into a rename notice.
   */
  subtitle: z.string().optional(),
  /** Verbatim <title> override when the SEO title is a fixed phrase. */
  seoTitle: z.string().optional(),
  slug: z.string(),
  year: z.number().int(),
  status: z.enum(['Active', 'Research', 'Prototype', 'Stable', 'Archived']),
  category: z.string(),
  /** One-line thesis — used on the hero, the meta description and /projects. */
  summary: z.string(),
  /**
   * The public introduction (v2.1, §13–§14; demoted off /projects in v2.2.1).
   *
   * Two to three lines answering exactly three questions: what it is, what it
   * is roughly for, and how much of it is public today. It is not a mechanism
   * description, not a capability list and not a roadmap.
   *
   * v2.2.1 (§35) removed it from the /projects entry, because the four entries
   * had grown back into project descriptions and a directory page should be a
   * directory. It still supplies the case page's meta and Open Graph
   * description, and the case-study body expands it. `publicLine` is the field
   * /projects prints now.
   */
  description: z.string(),
  /**
   * The one positioning line (v2.1, §7–§8).
   *
   * Says what the project *is*, at the level of the whole project — not how it
   * is built. Rendered on the homepage row and on /projects alike, so the two
   * surfaces cannot drift apart and neither has to own a copy of the other's
   * sentence.
   */
  publicLine: z.string(),
  tags: z.array(z.string()).default([]),
  /**
   * Homepage Selected Work membership.
   *
   * Reserved for work that is actually being done or whose engineering output
   * can be checked. A concept with nothing public does not belong here — for
   * that, see research.ts and the Projects / Research index pages, which still
   * link it.
   */
  featured: z.boolean().default(false),
  order: z.number().int().default(99),
  /** Only present when verified public. */
  repo: z.string().url().optional(),
  demo: z.string().url().optional(),
  role: z.string(),
  /**
   * Which system diagram to render on the case-study page.
   *
   * The stroke, palette, typography and spacing are shared across all of them;
   * what differs is the scientific metaphor — each project gets its own
   * structure rather than a recut version of the same shape.
   */
  visual: z.enum([
    'aging',
    'cell',
    'discovery',
    'pet',
    'infra',
    'runtime',
    'pulse',
    'aging-state',
    'cell-transition',
    'agent-dag',
    'compliance-triangle',
    'dependency-graph',
    'discovery-loop',
  ]),
  /** Short honest status sentence shown under the meta block. */
  statusNote: z.string().optional(),
  /** Extra facts for the project meta block. */
  stack: z.array(z.string()).default([]),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects/en' }),
  schema: projectSchema,
});

const projectsZh = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects/zh' }),
  schema: projectSchema,
});

/**
 * Work content model (v2.3).
 *
 * A **work** is the other output line beside a project, and the schema exists
 * to keep the two from collapsing into each other. Projects answer "what system
 * did I build?" and carry status, evidence and public-code fields; a work
 * answers "what did I make?" and carries a poster, a ratio and somewhere to
 * watch it. There is deliberately no `status`-as-implementation-state here, no
 * `repo`, no evidence panel and no case-study body — §43 rules out applying the
 * project case-study structure to a work.
 *
 * Two fields carry more weight than they look like they do:
 *
 *   `aspectRatio` — §60–§62. A large share of the work is 9:16, so the schema
 *   must not assume 16:9 anywhere. The frame is built from this value rather
 *   than from a fixed card, which is what stops a portrait piece being cropped
 *   into a landscape hole.
 *
 *   `draft` — §69. A work the owner has not approved for publication is a real
 *   entry in the repository that no build renders. `src/lib/works.ts` is the
 *   only place that decides this, and `scripts/check-works.mjs` asserts the
 *   default build emits nothing from a draft. This is what lets the schema and
 *   the routes exist while §30/§31 forbid publishing anything the owner has not
 *   handed over.
 *
 * `poster` is a **base path without a width suffix** — `/images/works/<slug>`.
 * The widths come from the shared ladder, so a poster is never hand-written per
 * breakpoint and a phone never downloads the 1440 file (§21).
 *
 * Video is metadata only in this round. §18–§26 are explicit that nothing may
 * load a video on arrival: the index shows posters, and the detail page shows a
 * poster plus a link out. `videoProvider: 'self-hosted'` is reserved for later
 * (§27) and no page renders a `<video>` element from it today.
 */
const workSchema = z.object({
  title: z.string(),
  slug: z.string(),
  year: z.number().int(),
  /** §16: a fixed, short list. Deliberately not dozens of categories. */
  type: z.enum(['film', 'visual', 'cultural-ai', 'digital-heritage', 'interactive', 'generative']),
  /**
   * §17: `published` is the only state that renders. `experiment` and
   * `archive` are still public works — they say how finished the piece is, not
   * whether it exists. There is no `planned` / `coming soon`, because §17 and
   * §32 forbid publishing something that does not exist.
   */
  status: z.enum(['published', 'experiment', 'archive']).default('published'),
  /** §67: ordering, and the hook for a future homepage selection. */
  featured: z.boolean().default(false),
  /** Base path without a width suffix, e.g. `/images/works/xiakexing-3`. */
  poster: z.string(),
  /** §61: `9/16` | `16/9` | `1/1` | `4/3` | `3/2`. One line — a wrapped union breaks the build. */
  aspectRatio: z.enum(['9/16', '16/9', '1/1', '4/3', '3/2']),
  /** §11: one sentence. The index prints nothing longer. */
  description: z.string(),
  /**
   * §51: what the poster shows, for assistive technology.
   *
   * Optional, but a work that omits it gets `title — type` rather than a
   * generic word: §51 rules out "image", "cover" and "poster image" by name.
   */
  posterAlt: z.string().optional(),
  /** §46: only ever a real role. Omitted when the piece had none. */
  role: z.string().optional(),
  /** §45: high-level tool names only. Never a workflow, a seed or a graph. */
  tools: z.array(z.string()).default([]),
  /**
   * §44: optional, and only when the piece genuinely had collaborators.
   *
   * Names, or `Name — role` pairs. Defaults to empty so a solo piece shows no
   * row at all rather than an empty heading.
   */
  credits: z.array(z.string()).default([]),
  /** §11: shown in the meta line when the piece has a runtime, e.g. `15s`. */
  duration: z.string().optional(),
  /** §22–§23: external hosting is the first-phase model. */
  videoProvider: z.enum(['external', 'self-hosted']).optional(),
  /** §84: https only. A watch link, never an auto-mounted player. */
  videoUrl: z.string().url().optional(),
  /** A non-video work's own page, when it has one. */
  externalUrl: z.string().url().optional(),
  /** ISO date, for the deterministic ordering in `src/lib/works.ts`. */
  publishedAt: z.string().optional(),
  /** §69: excluded from every build until the owner approves publication. */
  draft: z.boolean().default(false),
});

const works = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/works/en' }),
  schema: workSchema,
});

const worksZh = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/works/zh' }),
  schema: workSchema,
});

export const collections = { projects, projectsZh, works, worksZh };
