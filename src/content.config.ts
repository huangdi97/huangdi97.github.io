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
 * gone; `publicIntro` duplicated `description`, and /projects now prints
 * `description` directly, so the two cannot drift.
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
   * The short public introduction (v2.1, §13–§14).
   *
   * Two to three lines answering exactly three questions: what it is, what it
   * is roughly for, and how much of it is public today. It is not a mechanism
   * description, not a capability list and not a roadmap. /projects prints it as
   * the entry's paragraph; the case-study body expands it.
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

export const collections = { projects, projectsZh };
