import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Project content model.
 *
 * Metadata lives in frontmatter so pages never hard-code project copy.
 * The long-form case-study narrative lives in the Markdown/MDX body under a
 * fixed heading structure. Most projects use:
 *
 *   ## Overview
 *   ## Problem
 *   ## Why It Matters
 *   ## Product / Research Thesis
 *   ## System Design
 *   ## Architecture
 *   ## Core Capabilities
 *   ## Technical Decisions
 *   ## Current Status
 *   ## Next
 *
 * A **concept** that has not been implemented (TaiYi Lingjing) uses a different
 * structure on purpose, so it can never read like a build report:
 *
 *   ## Overview
 *   ## Motivation
 *   ## Research Questions
 *   ## Proposed Discovery Loop
 *   ## Proposed Architecture
 *   ## Design Principles
 *   ## What Must Be Validated
 *   ## First Implementation Milestone
 *   ## Current Status
 *   ## Next
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
  /** One-line thesis — used on cards, hero and meta description. */
  summary: z.string(),
  /** Two to three lines of plain explanation. */
  description: z.string(),
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
  cover: z.string().optional(),
  role: z.string(),
  /** Filter buckets on /projects. */
  groups: z.array(z.string()).default([]),
  /**
   * Which system diagram to render.
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

  /* ---------------------------------------------------------------------
   * Project Cover (v1.4.1)
   *
   * A cover describes the *project*, not the science. Mathematics, biology
   * and AI belong to the ambient layer; here they may only appear as a small
   * auxiliary mark, never as the subject.
   * --------------------------------------------------------------------- */

  /** Short type line under the name — "AI aging assessment system". */
  coverType: z.string(),
  /** One sentence: what it is and what it solves. Shorter than `description`. */
  coverDescription: z.string(),
  /** Core capabilities or modules. Three to six, never a feature dump. */
  coverCapabilities: z.array(z.string()).min(3).max(6),
  /**
   * Reality line. Must equal the evidence headline for this locale — it is
   * re-checked by `scripts/check-visual-system.mjs`, so the cover can never
   * drift away from the truth layer.
   */
  coverStatus: z.string(),
  /**
   * Second reality token, e.g. "Active development". Must be one of the
   * project's published proof tokens.
   */
  coverStatusSecondary: z.string(),
  /** Which small auxiliary mark to draw beside the copy. */
  coverVisualHint: z.enum([
    'assessment-flow',
    'cell-state',
    'agent-dag',
    'compliance-triangle',
    'dependency-graph',
    'discovery-loop',
    'care-flow',
  ]),
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
