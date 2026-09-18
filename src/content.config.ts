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
  /** Which unified system diagram to render. */
  visual: z.enum(['aging', 'cell', 'discovery', 'pet', 'infra', 'runtime', 'pulse']),
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
