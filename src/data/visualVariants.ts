/**
 * Project visual variants.
 *
 * The Astro compiler hoists `export` declarations out of a component's
 * frontmatter, and its hoist pass splits a multi-line union type after the
 * first member — which leaves an orphaned `| 'cell'` in the component body.
 * Keeping the union in a plain TypeScript module avoids that entirely.
 *
 * Variants share one drawing vocabulary (hairlines, mono micro-labels, a
 * single accent, generous whitespace); what differs is the scientific
 * metaphor each composition is built around.
 */
/**
 * Cover marks (v1.4.1).
 *
 * A cover mark is *auxiliary*: it sits beside the words that describe the
 * project and never carries the explanation itself. These are deliberately
 * small, hairline and formula-free — a reader who hides every cover mark must
 * still know what each project is.
 *
 * Kept in TypeScript for the same reason as the union above: the Astro
 * compiler hoists and truncates multi-line unions declared in frontmatter.
 */
export type CoverVisualHint =
  | 'assessment-flow'
  | 'cell-state'
  | 'agent-dag'
  | 'compliance-triangle'
  | 'dependency-graph'
  | 'discovery-loop'
  | 'care-flow';

export type VisualVariant =
  | 'aging'
  | 'cell'
  | 'discovery'
  | 'pet'
  | 'infra'
  | 'runtime'
  | 'pulse'
  | 'aging-state'
  | 'cell-transition'
  | 'agent-dag'
  | 'compliance-triangle'
  | 'dependency-graph'
  | 'discovery-loop';
