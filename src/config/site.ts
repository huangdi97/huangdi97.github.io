/**
 * Single source of truth for site-wide facts.
 *
 * Fact discipline: every value here is either (a) an owner-confirmed resume
 * fact, (b) confirmed from the public GitHub account @huangdi97, (c) confirmed
 * from a repository README shipped by that account, or (d) typographic /
 * structural. Nothing is inferred, rounded up or embellished. If a fact is
 * unverified it is absent from this file rather than guessed.
 *
 * Owner-confirmed resume facts (education, employment, contact addresses) are
 * personal history, not engineering claims — they are published as supplied and
 * are never "downgraded" for want of a repository to point at. Project
 * implementation state stays under strict evidence discipline.
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

  /**
   * Public contact addresses, in display order: Gmail, then QQ Mail.
   *
   * Source: owner-confirmed (v1.2 identity closure). Both are rendered
   * everywhere through `ContactLinks`, so no page can drift out of sync.
   *
   * Not public by policy: the 163 address used for doctoral applications and
   * the mobile number printed on the private job-application PDFs. Neither
   * appears in source copy, JSON-LD, OG metadata or any published PDF.
   */
  emails: [
    { id: 'gmail', label: { en: 'Gmail', zh: 'Gmail' }, value: 'h30441854@gmail.com' },
    { id: 'qq', label: { en: 'QQ Mail', zh: 'QQ 邮箱' }, value: '304418554@qq.com' },
  ],

  /**
   * Public-safe resume PDFs, generated from this site's own resume data.
   *
   * Empty until a sanitised file exists at the given path. The resume page
   * shows a download button only for files that are actually present — a
   * button that 404s is worse than no button.
   */
  resumePdfs: [
    {
      id: 'ai-agent',
      path: '/resume/Hao-Lei-AI-Agent-Resume-ZH.pdf',
      label: { en: 'AI / Agent Resume', zh: 'AI / Agent 简历' },
      note: { en: 'PDF · 中文', zh: 'PDF · 中文' },
    },
    {
      id: 'ai-lifescience',
      path: '/resume/Hao-Lei-AI-LifeScience-Resume-ZH.pdf',
      label: { en: 'AI × Life Science Resume', zh: 'AI × 生命科学简历' },
      note: { en: 'PDF · 中文', zh: 'PDF · 中文' },
    },
  ],

  /**
   * Portrait image path, relative to /public.
   *
   * Null until a real photograph is supplied. The About page has a slot for
   * it and keeps its text-only layout while this is null — no placeholder
   * avatar, no generated face, no stock image. A portrait is optional and is
   * not treated as a gap that blocks release.
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

/** The address used in structured data. Only the primary one is published. */
export function primaryEmail(): string {
  return SITE.emails[0].value;
}

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
