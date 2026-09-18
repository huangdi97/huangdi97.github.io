/**
 * Single source of truth for site-wide facts.
 *
 * Fact discipline: every value here is either (a) confirmed from the public
 * GitHub account @huangdi97, (b) confirmed from a repository README shipped
 * by that account, or (c) typographic/structural. Nothing is inferred,
 * rounded up or embellished. If a fact is unverified it is absent from this
 * file rather than guessed.
 */

export const SITE = {
  /**
   * Canonical origin — must match `site` in astro.config.mjs.
   *
   * The custom domain is live: GitHub Pages answers huangdi97.github.io with a
   * 301 to this origin, so canonicals, the sitemap and OG images use it.
   */
  url: 'https://haoleilab.com',
  /** Published custom domain. The CNAME file is committed in public/. */
  domain: 'haoleilab.com',

  name: 'Hao Lei',
  nameEn: 'Hao Lei',
  nameZh: '郝磊',
  brand: 'HAO LEI',
  lab: 'Personal AI Lab',
  tagline: 'AI × Life Science × Agents',
  siteName: 'Hao Lei — Personal AI Lab',

  locale: 'en-US',
  localeZh: 'zh-CN',

  /** Confirmed from the account and from the WenNian README. */
  github: 'https://github.com/huangdi97',
  githubHandle: '@huangdi97',
  /** Published by the author in the WenNian repository README. */
  email: '304418554@qq.com',

  /**
   * Path to a real, owner-supplied resume PDF.
   *
   * Null until such a file exists. The resume page shows a download button
   * only when this is set — a button that 404s is worse than no button, and a
   * generated-but-unreviewed PDF would not match the printed page.
   */
  resumePdf: null as string | null,

  /**
   * Portrait image path, relative to /public.
   *
   * Null until a real photograph is supplied. The About page has a slot for
   * it and keeps its text-only layout while this is null — no placeholder
   * avatar, no generated face, no stock image.
   */
  portrait: null as string | null,

  statement: {
    en: 'Building intelligent systems for discovery, health, simulation and autonomous work.',
    zh: '构建面向科学发现、数字健康、仿真与自主工作的智能系统。',
  },

  description: {
    en: 'Hao Lei — Personal AI Lab. AI systems, agentic systems, computational biology, digital health and simulation, built end to end from problem framing to deployment.',
    zh: '郝磊 — 个人 AI 实验室。AI 系统、智能体系统、计算生物学、数字健康与仿真，从问题定义到部署上线端到端构建。',
  },

  /** Hero capability strip. Six items, deliberately not a skill cloud. */
  focusAreas: [
    { en: 'AI Systems', zh: 'AI 系统' },
    { en: 'Agentic Systems', zh: '智能体系统' },
    { en: 'Digital Health', zh: '数字健康' },
    { en: 'Computational Biology', zh: '计算生物学' },
    { en: 'Simulation', zh: '仿真' },
    { en: 'Research Engineering', zh: '研究工程' },
  ],
} as const;

/**
 * Public repositories confirmed to exist under the `huangdi97` account.
 * `language` and `description` mirror the values GitHub reports.
 */
export type RepoFact = {
  name: string;
  url: string;
  description: string;
  language: string | null;
};

export const PUBLIC_REPOS: RepoFact[] = [
  {
    name: 'WenNian',
    url: 'https://github.com/huangdi97/WenNian',
    description: '问年 — 衰老干预决策系统',
    language: 'Python',
  },
  {
    name: 'HyCell-JEPA',
    url: 'https://github.com/huangdi97/HyCell-JEPA',
    description:
      'Universal-to-Specific Cellular World Model Prototype for HDF Aging, Regeneration, and Partial Reprogramming',
    language: 'Python',
  },
  {
    name: 'wanxiang-world',
    url: 'https://github.com/huangdi97/wanxiang-world',
    description: 'Wanxiang — Semantic Persistent Open-Ended Co-Evolutionary World OS',
    language: 'Python',
  },
  {
    name: 'BioPulse',
    url: 'https://github.com/huangdi97/BioPulse',
    description: '生命科学 Agent-native 销售工作台',
    language: 'Python',
  },
  {
    name: 'morn',
    url: 'https://github.com/huangdi97/morn',
    description: 'morn os',
    language: 'Rust',
  },
  {
    name: 'mdns-scanner',
    url: 'https://github.com/huangdi97/mdns-scanner',
    description: 'mDNS network scanner',
    language: 'Go',
  },
  {
    name: 'zhishen-pricing',
    url: 'https://github.com/huangdi97/zhishen-pricing',
    description: '知身 pricing page',
    language: 'HTML',
  },
];

/** Non-sensitive facts reused in narrative copy. */
export const PROFILE = {
  focus: [
    'AI systems',
    'Agentic systems',
    'Digital health',
    'Computational biology',
    'Simulation',
    'Research engineering',
  ],
  scope: ['Research', 'Product', 'Architecture', 'Implementation', 'Evaluation', 'Deployment'],
} as const;
