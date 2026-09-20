import type { Lang } from '../i18n/ui';

/**
 * Research directions (v2.1).
 *
 * What this file is now. In v1.6 each direction was a small specification: a
 * core question, then a four-item list of current interests naming retrieval
 * design, knowledge-graph substrates, causal structure, typed hand-offs,
 * observability, PBPK / QSP coupling and so on. Every item was true, and
 * together they answered "how do you build this" — which is the question a
 * public portfolio page should not be answering (§22–§24).
 *
 * v2.1 keeps one field per direction: a summary of one to three sentences that
 * states the problem, not the method. Removed with the lists: the framework
 * vocabulary, the named techniques, the planned implementation and the
 * speculative system design. What is left is what a reader can use to decide
 * whether the question interests them.
 *
 * `tier` survives, because it is a truth claim rather than a style choice: a
 * direction tied to code that exists is never rendered as the twin of a written
 * concept. TaiYi Lingjing stays in the concept tier and stays "Concept · Not
 * Started" (§28).
 */
export type ResearchArea = {
  id: string;
  index: string;
  slug: string;
  title: string;
  /** One to three sentences. The problem, stated high, with no method attached. */
  summary: string;
  projects: { label: string; href: string }[];
  /**
   * `active`  — tied to code that exists and can be inspected.
   * `concept` — a written direction whose target system does not exist yet.
   */
  tier: 'active' | 'concept';
};

const en: ResearchArea[] = [
  {
    id: 'discovery',
    index: '01',
    slug: 'ai-for-scientific-discovery',
    title: 'AI for Scientific Discovery',
    summary:
      'What would an AI system have to do before a scientist would spend real money testing the hypothesis it proposes? The direction is about that bar — proposing something worth testing, and keeping what was observed separate from what was assumed.',
    projects: [
      { label: 'TaiYi Lingjing', href: '/projects/taiyi-lingjing' },
      { label: 'HyCell', href: '/projects/hycell' },
    ],
    tier: 'concept',
  },
  {
    id: 'agents',
    index: '02',
    slug: 'agentic-systems',
    title: 'Agentic Systems & Multi-Agent Systems',
    summary:
      'How do you make a group of agents reliable enough that a person stops reading every intermediate step? The question is about trust in the run as a whole, not about making any single agent cleverer.',
    projects: [
      { label: 'Morn', href: '/projects/morn' },
      { label: 'ZhiShen · WenNian', href: '/projects/wennian' },
    ],
    tier: 'active',
  },
  {
    id: 'health',
    index: '03',
    slug: 'ai-for-health-and-computational-biology',
    title: 'AI for Health & Computational Biology',
    summary:
      'Can physiological state be estimated from noisy, sparse, everyday signals — and described without overclaiming? This sits where health products meet biological modelling, and its hardest constraint is knowing where to stop.',
    projects: [
      { label: 'ZhiShen · WenNian', href: '/projects/wennian' },
      { label: 'BioPulse', href: '/projects/biopulse' },
      { label: 'HyCell', href: '/projects/hycell' },
      { label: 'Pet AI Health', href: '/projects/pet-ai-health' },
    ],
    tier: 'active',
  },
  {
    id: 'simulation',
    index: '04',
    slug: 'simulation-digital-twins-synthetic-data',
    title: 'Simulation, Digital Twins & Synthetic Data',
    summary:
      'When is a simulated trajectory useful, and when is it an expensive-looking guess? The interesting part is not producing the trajectory but being able to say which of the two you are holding.',
    projects: [
      { label: 'HyCell', href: '/projects/hycell' },
      { label: 'ZhiShen · WenNian', href: '/projects/wennian' },
    ],
    tier: 'active',
  },
  {
    id: 'local-first',
    index: '05',
    slug: 'local-first-personal-intelligence',
    title: 'Local-first Personal Intelligence',
    summary:
      'What does personal software look like when the user owns the data and the graph never leaves their device? The direction treats the device — not a server — as the place where personal intelligence lives.',
    projects: [{ label: 'PDIG', href: '/projects/pdig' }],
    tier: 'active',
  },
];

const zh: ResearchArea[] = [
  {
    id: 'discovery',
    index: '01',
    slug: 'ai-for-scientific-discovery',
    title: 'AI 驱动的科学发现',
    summary:
      '一个 AI 系统要做到什么程度，它提出的假设才值得科学家真正花钱去做实验？这个方向关心的就是这条线：提出值得验证的东西，并把「观测到的」和「假设的」分清楚。',
    projects: [
      { label: 'TaiYi Lingjing / 太一·灵境', href: '/zh/projects/taiyi-lingjing' },
      { label: 'HyCell', href: '/zh/projects/hycell' },
    ],
    tier: 'concept',
  },
  {
    id: 'agents',
    index: '02',
    slug: 'agentic-systems',
    title: '智能体系统 / 多智能体系统',
    summary:
      '如何让一组智能体足够可靠，可靠到人不必逐个检查中间步骤？问题在于整条流程是否可信，而不在于把单个智能体做得更聪明。',
    projects: [
      { label: 'Morn', href: '/zh/projects/morn' },
      { label: '知身·问年', href: '/zh/projects/wennian' },
    ],
    tier: 'active',
  },
  {
    id: 'health',
    index: '03',
    slug: 'ai-for-health-and-computational-biology',
    title: 'AI 与健康 / 计算生物学',
    summary:
      '能否从嘈杂、稀疏的日常信号中估计生理状态，并且在表达时不夸大？这个方向落在健康产品与生物建模的交界处，最难的部分是知道在哪里停下。',
    projects: [
      { label: '知身·问年', href: '/zh/projects/wennian' },
      { label: 'BioPulse', href: '/zh/projects/biopulse' },
      { label: 'HyCell', href: '/zh/projects/hycell' },
      { label: 'Pet AI Health', href: '/zh/projects/pet-ai-health' },
    ],
    tier: 'active',
  },
  {
    id: 'simulation',
    index: '04',
    slug: 'simulation-digital-twins-synthetic-data',
    title: '仿真、数字孪生与合成数据',
    summary:
      '一条仿真轨迹什么时候真正有用，什么时候只是看起来很贵的猜测？关键不在于能不能生成轨迹，而在于能不能说清手上这条属于哪一种。',
    projects: [
      { label: 'HyCell', href: '/zh/projects/hycell' },
      { label: '知身·问年', href: '/zh/projects/wennian' },
    ],
    tier: 'active',
  },
  {
    id: 'local-first',
    index: '05',
    slug: 'local-first-personal-intelligence',
    title: '本地优先的个人智能',
    summary:
      '当用户拥有自己的数据、图谱始终留在自己的设备上时，个人软件应该长什么样？这个方向把设备——而不是服务器——当作个人智能所在的地方。',
    projects: [{ label: 'PDIG', href: '/zh/projects/pdig' }],
    tier: 'active',
  },
];

export function getResearch(lang: Lang): ResearchArea[] {
  return lang === 'zh' ? zh : en;
}
