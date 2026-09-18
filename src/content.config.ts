import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Project content model.
 *
 * Metadata lives in frontmatter so pages never hard-code project copy.
 * The long-form case-study narrative lives in the Markdown/MDX body under a
 * fixed heading structure:
 *
 *   ## Overview
 *   ## Problem
 *   ## Why It Matters
 *   ## Product / Research Thesis
 *   ## System Design
 *   ## Architecture
 *   ## Core Capabilities
 *   ## Technical Decisions
 *   ## Engineering
 *   ## Validation
 *   ## Current Status
 *   ## What I Learned
 *   ## Next
 *
 * `repo` is only set when the repository has been verified to exist and to be
 * public. Unverified projects simply omit it and show no repository link.
 */

const projectSchema = z.object({
  title: z.string(),
  slug: z.string(),
  year: z.number().int(),
  status: z.enum(['Active', 'Research', 'Prototype', 'Stable', 'Archived']),
  category: z.string(),
  /** One-line thesis — used on cards, hero and meta description. */
  summary: z.string(),
  /** Two to three lines of plain explanation. */
  description: z.string(),
  tags: z.array(z.string()).default([]),
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
  visual: z.enum(['aging', 'cell', 'discovery', 'pet', 'infra']),
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
