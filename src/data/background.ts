import type { Lang } from '../i18n/ui';
import type { Bi } from './bi';

/**
 * Personal background — the one-paragraph story behind the work, plus the
 * timeline reduced to five nodes.
 *
 * Source constraint: every node maps to owner-confirmed résumé fact. Nothing is
 * added for narrative warmth — no domain appears here unless education,
 * employment or research record already supports it:
 *
 *   life-science training  — education.ts (B.Eng. Biological Engineering, M.S. Zoology)
 *   wet lab                — researchRecord.ts (disease models, mechanistic assays, primary cells)
 *   computational biology  — researchRecord.ts (multi-omics, MD / MM-PBSA, Bayesian networks)
 *   AI systems / agents    — evidence.ts across the public repositories
 */

export type BackgroundNode = {
  id: string;
  title: Bi;
  /** One line. Max ~12 words in English. */
  line: Bi;
};

export type BackgroundModel = {
  title: Bi;
  paragraphs: Bi[];
  nodes: BackgroundNode[];
};

const TITLE: Bi = {
  en: 'From biology to AI systems',
  zh: '从生命科学到 AI 系统',
};

const PARAGRAPHS: Bi[] = [
  {
    en: 'Training began in life-science experimental research — disease animal models, mechanistic assays and multi-omics data, often in the same week. That gave direct experience of how biological data are produced, and of exactly where experimental and batch noise enters an analysis.',
    zh: '最初的训练来自生命科学实验研究——疾病动物模型、机制实验与多组学数据，常常出现在同一周里。这让我直接了解生物数据是如何产生出来的，也清楚实验噪声与批次噪声会从哪里进入分析流程。',
  },
  {
    en: 'The work then widened rather than switched: computational biology over the data those experiments produced — multi-omics pipelines, molecular dynamics, Bayesian networks — and from there into AI systems and agent engineering. The portability is method, not domain.',
    zh: '随后工作范围是逐层外扩，而不是切换赛道：在实验产生的数据上做计算生物学——多组学流程、分子动力学、贝叶斯网络——再由此进入 AI 系统与 Agent 工程。被迁移过来的是方法，而不是领域。',
  },
];

const NODES: BackgroundNode[] = [
  {
    id: 'life-science',
    title: { en: 'Life Science', zh: '生命科学' },
    line: { en: 'B.Eng. Biological Engineering · M.S. Zoology', zh: '本科生物工程 · 硕士动物学' },
  },
  {
    id: 'wet-lab',
    title: { en: 'Wet Lab', zh: '湿实验' },
    line: {
      en: 'Disease models, mechanistic assays, primary cells',
      zh: '疾病模型、机制实验、原代细胞',
    },
  },
  {
    id: 'computational-biology',
    title: { en: 'Computational Biology', zh: '计算生物学' },
    line: {
      en: 'Multi-omics, molecular dynamics, Bayesian networks',
      zh: '多组学、分子动力学、贝叶斯网络',
    },
  },
  {
    id: 'ai-systems',
    title: { en: 'AI Systems', zh: 'AI 系统' },
    line: { en: 'Retrieval, evaluation, deployment', zh: '检索、评测、交付上线' },
  },
  {
    id: 'agents',
    title: { en: 'Agents', zh: '智能体' },
    line: { en: 'Role boundaries, tools, verification', zh: '角色边界、工具调用、校验机制' },
  },
];

export function getBackground(lang: Lang): {
  title: string;
  paragraphs: string[];
  nodes: { id: string; title: string; line: string }[];
} {
  return {
    title: TITLE[lang],
    paragraphs: PARAGRAPHS.map((p) => p[lang]),
    nodes: NODES.map((n) => ({ id: n.id, title: n.title[lang], line: n.line[lang] })),
  };
}
