/**
 * Project poster captions (v1.5 sample).
 *
 * A project poster is a *cover*, not a diagram: one visual metaphor, one short
 * line, one status chip. Everything else belongs to the text beside it.
 *
 * The caption is the only sentence allowed inside the plate, so it is stored
 * here rather than in the component. It is never a claim about reality — the
 * reality claim is the status chip, and that comes from project content /
 * the evidence layer, never from this file.
 */

import type { Bi } from './bi';

/** One metaphor per project. What differs is the shape; not the vocabulary. */
export type PosterVariant = 'wennian' | 'hycell';

export type ProjectPoster = {
  variant: PosterVariant;
  /** One short line under the plate. Optional by design, capped at one. */
  caption: Bi;
};

export const PROJECT_POSTERS: Record<string, ProjectPoster> = {
  wennian: {
    variant: 'wennian',
    caption: { en: 'AI aging assessment & intervention', zh: 'AI 衰老评估与干预决策' },
  },
  hycell: {
    variant: 'hycell',
    caption: { en: 'AI Virtual Cell', zh: 'AI 虚拟细胞' },
  },
};

export function posterFor(slug: string): ProjectPoster | undefined {
  return PROJECT_POSTERS[slug];
}
