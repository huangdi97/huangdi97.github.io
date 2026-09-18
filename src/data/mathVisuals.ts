/**
 * Mathematical-biology visual vocabulary.
 *
 * These are lenses for framing a problem, not descriptions of a shipped
 * system. Every piece of notation rendered from this file carries a
 * "conceptual" label in the UI, and none of it is allowed into the evidence
 * layer — evidence is only ever something a visitor can open.
 */

import type { Bi } from './bi';

export type LoopLayer = {
  id: 'observation' | 'representation' | 'dynamics' | 'decision';
  label: Bi;
  /** Notation shown large. */
  expr: string;
  /** Secondary notation shown small — the mechanistic reading of the layer. */
  alt?: string;
  note: Bi;
};

export const CONCEPT_LOOP: LoopLayer[] = [
  {
    id: 'observation',
    label: { en: 'Observation', zh: '观测' },
    expr: 'X',
    note: { en: 'Biological measurements', zh: '生物测量数据' },
  },
  {
    id: 'representation',
    label: { en: 'Representation', zh: '表征' },
    expr: 'z = E(X)',
    note: { en: 'Encoding into a state', zh: '编码为状态' },
  },
  {
    id: 'dynamics',
    label: { en: 'Dynamics', zh: '动力学' },
    expr: 'zₜ₊₁ = Fθ(zₜ, aₜ)',
    alt: 'dx/dt = f(x, u, θ)',
    note: { en: 'Mechanistic or learned transition', zh: '机理式或学习式转移' },
  },
  {
    id: 'decision',
    label: { en: 'Decision', zh: '决策' },
    expr: 'a*',
    note: { en: 'Intervention / action', zh: '干预 / 动作' },
  },
];

export const FEEDBACK_LABEL: Bi = { en: 'New observation', zh: '新的观测' };

/** Three questions the section reduces the whole approach to. */
export const MB_QUESTION_KEYS = ['mathbio.q1', 'mathbio.q2', 'mathbio.q3'] as const;

/** Captions for the four conceptual biological figures. */
export const BIO_FIGURE_CAPTIONS = {
  landscape: {
    en: 'Cell state landscape — contour lines, a trajectory and a target basin. Conceptual diagram, not an experimental result.',
    zh: '细胞状态景观——等高线、一条轨迹与目标盆地。概念示意图，不是实验结果。',
  },
  matrix: {
    en: 'Gene × cell matrix — an abstract rendering of high-dimensional biological observation. Conceptual representation.',
    zh: '基因 × 细胞矩阵——高维生物观测的抽象表达。概念化表达。',
  },
  network: {
    en: 'Gene → pathway → phenotype → intervention. Six nodes, deliberately small. Conceptual diagram.',
    zh: '基因 → 通路 → 表型 → 干预。六个节点，刻意保持精简。概念示意图。',
  },
  phase: {
    en: 'Phase portrait — a vector field, two attractor basins and one trajectory. Conceptual diagram.',
    zh: '相图——向量场、两个吸引子盆地与一条轨迹。概念示意图。',
  },
} satisfies Record<string, Bi>;
