import type { Lang } from '../i18n/ui';

export type ResearchArea = {
  id: string;
  index: string;
  slug: string;
  title: string;
  question: string;
  interests: string[];
  projects: { label: string; href: string }[];
  /**
   * Which homepage group this direction belongs to.
   *
   * `active`  — tied to code that exists and can be inspected.
   * `concept` — a written direction whose target system does not exist yet.
   *
   * The distinction is a truth claim, not a style choice: the two are never
   * rendered as equally finished.
   */
  tier: 'active' | 'concept';
};

const en: ResearchArea[] = [
  {
    id: 'discovery',
    index: '01',
    slug: 'ai-for-scientific-discovery',
    title: 'AI for Scientific Discovery',
    question:
      'What does an AI system need before it can propose a hypothesis a scientist would actually spend money to test?',
    interests: [
      'Retrieval grounded in primary evidence rather than paraphrase, with provenance carried end to end.',
      'Knowledge graphs as a working substrate for hypotheses — not as a visualisation afterthought.',
      'Causal structure over correlation, and explicit separation between what is observed and what is assumed.',
      'Closed loops where simulation, experiment planning and evidence audit sit in the same workflow.',
    ],
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
    question:
      'How do you make a group of agents reliable enough that a human stops reading every intermediate step?',
    interests: [
      'Explicit role boundaries: analyst, auditor, planner — with outputs that can be inspected and rejected.',
      'Structured tool interfaces and typed hand-offs instead of free-form message passing.',
      'Verification as a first-class stage, not a prompt suffix.',
      'Runtime observability: what the agent saw, what it decided, and why.',
    ],
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
    question:
      'How can physiological state be estimated from noisy, sparse, everyday signals — and reported without overclaiming?',
    interests: [
      'Aging clocks as one signal among many, with confidence intervals and organ-level asynchrony.',
      'Active interviewing: turning vague complaints into structured assessment dimensions.',
      'Representation learning over biological state where labels are scarce and metadata is incomplete.',
      'Guardrails that keep a wellness product from drifting into diagnosis.',
    ],
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
    question:
      'When is a simulated trajectory useful, and when is it just an expensive-looking guess?',
    interests: [
      'Compact, inspectable state spaces that a human reviewer can audit without a GPU.',
      'Intervention as a transition over belief state: bₜ + aₜ + cₜ + hₜ → bₜ₊₁.',
      'PBPK / QSP / ODE style mechanistic models coupled with learned components.',
      'Synthetic data only where its failure modes are documented.',
    ],
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
    question:
      'What does personal software look like when the user owns the data and the graph stays on their device?',
    interests: [
      'A canonical dependency spec with conformance tests across Android, iOS and HarmonyOS.',
      'Local-first sync and repository layers that do not assume a server is reachable.',
      'Cryptographic identity for personal infrastructure without a hosted account system.',
      'Native UI where the platform expects native, rather than one web shell everywhere.',
    ],
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
    question: '一个 AI 系统需要做到什么程度，它提出的假设才值得科学家真正投入实验去验证？',
    interests: [
      '检索必须落在原始证据上，而不是转述；来源信息全程可追溯。',
      '知识图谱作为假设的工作底座，而不是事后补一张可视化图。',
      '因果结构优先于相关性，并明确区分「观测到什么」与「假设了什么」。',
      '把仿真、实验设计与证据审计放进同一条闭环流程。',
    ],
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
    question: '如何让一组智能体足够可靠，可靠到人类不必逐个检查中间步骤？',
    interests: [
      '明确的角色边界：分析者、稽核者、规划者，其输出可被检查与驳回。',
      '结构化工具接口与类型化交接，而非自由文本消息传递。',
      '把校验作为一等阶段，而不是提示词末尾一句「请检查」。',
      '运行时可观测：它看到了什么、决定了什么、为什么。',
    ],
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
    question: '如何从嘈杂、稀疏的日常信号中估计生理状态，并在表达时不夸大？',
    interests: [
      '衰老时钟只是众多信号之一，需给出置信区间与器官级异步性。',
      '主动追问：把模糊主诉转化为结构化评估维度。',
      '标签稀缺、元数据不完整条件下的生物状态表示学习。',
      '让健康产品不越界滑向诊断的护栏设计。',
    ],
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
    question: '一条仿真轨迹什么时候真正有用，什么时候只是看起来很贵的猜测？',
    interests: [
      '紧凑、可检查的状态空间，评审者无需 GPU 就能审计。',
      '把干预建模为信念状态上的转移：bₜ + aₜ + cₜ + hₜ → bₜ₊₁。',
      'PBPK / QSP / ODE 等机理模型与学习组件的耦合。',
      '只在失败模式被写清楚的地方使用合成数据。',
    ],
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
    question: '当用户拥有自己的数据、图谱留在本地设备上时，个人软件应该长什么样？',
    interests: [
      '一份 canonical 依赖规范，并在 Android、iOS、HarmonyOS 上做一致性测试。',
      '不假设服务端始终可达的本地优先同步与仓储层。',
      '不依赖托管账号体系的个人基础设施密码学身份。',
      '在平台期待原生的地方使用原生 UI，而不是一套 Web 壳到处套。',
    ],
    projects: [{ label: 'PDIG', href: '/zh/projects/pdig' }],
    tier: 'active',
  },
];

export function getResearch(lang: Lang): ResearchArea[] {
  return lang === 'zh' ? zh : en;
}

export const RESEARCH_IDS = en.map((a) => a.id);
