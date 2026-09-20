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
 * The case-study diagram vocabulary.
 *
 * v2.1: the `CoverVisualHint` union that used to sit above this one is gone,
 * together with the ProjectCover component it typed. The cover was a
 * words-first panel with a small auxiliary mark; /projects now shows each
 * project's own artwork instead, and the case-study page keeps this visual as
 * its one conceptual figure.
 */
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
