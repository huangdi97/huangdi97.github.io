import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Lang } from '../i18n/ui';
import { t } from '../i18n/ui';
import { SITE } from '../config/site';
import { getEducation } from './education';
import { getExperience } from './experience';
import { getResearchExperience, getResearchOutputs } from './researchRecord';
import { getContactLinks } from './contact';

/**
 * Résumé content — single source of truth.
 *
 * The page renders whatever this module returns. Education, employment and
 * research each live in their own data file so a fact has exactly one home:
 *
 *   education.ts        institutions, degrees, dates
 *   experience.ts       employment
 *   researchRecord.ts   academic research and output
 *   contact.ts          email / GitHub / résumé links
 *
 * Fact rule: nothing here is invented. Owner-confirmed résumé facts (education,
 * employment, contact) are published as supplied. Project implementation state
 * is not described here beyond what the public repository supports — see
 * `evidence.ts` for that discipline.
 */

export type ResumeItem = { id?: string; label: string; value?: string; href?: string };

export type ResumeEntry = {
  id: string;
  /** Institution, company or project title. */
  title: string;
  /** Degree, or role · department. */
  subtitle?: string;
  /** Research organisation, when it differs from the degree-granting body. */
  org?: string;
  period?: string;
  location?: string;
  lines?: string[];
  /** Status chip — used for manuscript state, never inflated. */
  status?: string;
  /** Master's research focus block. */
  focus?: { label: string; items: string[]; methods?: string[] };
};

export type ResumeBlock = { title: string; id: string } & (
  | { kind: 'text'; paragraphs: string[] }
  | { kind: 'list'; items: ResumeItem[] }
  | { kind: 'entries'; entries: ResumeEntry[] }
  | { kind: 'groups'; groups: { title: string; items: string[] }[] }
  | { kind: 'projects'; items: ResumeItem[] }
  | { kind: 'outputs'; items: { title: string; status: string }[] }
  | { kind: 'contact'; items: ResumeItem[] }
);

export type ResumeModel = {
  name: string;
  headline: string;
  blocks: ResumeBlock[];
};

const TECHNICAL_GROUPS = {
  en: [
    {
      title: 'Engineering',
      items: [
        'Python, TypeScript, Rust, Go — typed services, CLIs, desktop and static delivery.',
        'Backend and data — FastAPI, Pydantic, PostgreSQL / pgvector, Redis, FAISS.',
        'Delivery — Docker, GitHub Actions, Linux / WSL2; agent and LLM engineering: tool / function calling, multi-agent orchestration, MCP, RAG (BM25 + dense), evaluation harnesses.',
      ],
    },
    {
      title: 'Scientific & research methods',
      items: [
        'Multi-omics analysis in R / Python — differential analysis, KEGG / GO annotation, 16S rRNA, metabolomics, microbiome–host interaction.',
        'Molecular dynamics and binding free energy — GROMACS, MM/PBSA, AutoDock, PyMOL.',
        'Aging clocks and probabilistic modeling — PhenoAge / KDM, Bayesian networks (pgmpy).',
      ],
    },
    {
      title: 'Exploration',
      items: [
        'Digital twins and QSP / mechanistic (ODE) modeling — explored as research direction, not production engineering expertise.',
      ],
    },
  ],
  zh: [
    {
      title: '工程',
      items: [
        'Python、TypeScript、Rust、Go — 类型化服务、命令行工具、桌面端与静态站点交付。',
        '后端与数据 — FastAPI、Pydantic、PostgreSQL / pgvector、Redis、FAISS。',
        '交付 — Docker、GitHub Actions、Linux / WSL2；智能体与 LLM 工程：工具 / 函数调用、多智能体编排、MCP、RAG（BM25 + dense）、评测与验收脚本。',
      ],
    },
    {
      title: '科学与研究方法',
      items: [
        'R / Python 多组学分析 — 差异分析、KEGG / GO 注释、16S rRNA、代谢组学、菌群—宿主互作。',
        '分子动力学与结合自由能 — GROMACS、MM/PBSA、AutoDock、PyMOL。',
        '衰老时钟与概率建模 — PhenoAge / KDM、贝叶斯网络（pgmpy）。',
      ],
    },
    {
      title: '探索方向',
      items: ['数字孪生与 QSP / 机理（ODE）建模 — 属于研究探索方向，不作为生产工程能力声明。'],
    },
  ],
};

const PROFILE_TEXT = {
  en: [
    'I build AI systems at the intersection of science, health and autonomous software. The work runs from problem framing through architecture, implementation and evaluation to deployment — usually as one person owning the whole path.',
    'My training started in life-science research: animal models, mechanistic assays and multi-omics analysis. That shapes how I build — data provenance, experimental noise and explicit scope limits are engineering requirements, not documentation.',
    'Most of what I build is open source on GitHub, including ZhiShen · WenNian, an aging-intervention decision engine, and HyCell-JEPA, a cellular world-model prototype.',
  ],
  zh: [
    '我在科学、健康与自主软件的交叉地带构建 AI 系统。工作覆盖问题定义、架构设计、工程实现、评估验证到部署上线，通常由我一个人负责完整链路。',
    '我的训练始于生命科学实验研究：动物模型、机制实验与多组学分析。这决定了我构建系统的方式——数据来源、实验噪声与明确边界是工程需求，而不是文档里的补充说明。',
    '大部分成果以开源形式发布在 GitHub，包括衰老干预决策引擎「知身·问年」与细胞世界模型原型 HyCell-JEPA。',
  ],
};

/**
 * Selected projects, keyed by slug so a PDF variant can pick its own subset and
 * order without a second copy of the wording.
 *
 * TaiYi · Lingjing is deliberately absent: it is a written research concept with
 * no repository, prototype or validation result, and a résumé Selected Projects
 * list is read as a claim about work that exists.
 */
const PROJECT_ITEMS: Record<Lang, ResumeItem[]> = {
  en: [
    {
      id: 'wennian',
      label: 'ZhiShen · WenNian',
      value: 'AI aging assessment, structured interviewing and intervention decision support.',
      href: '/projects/wennian',
    },
    {
      id: 'hycell',
      label: 'HyCell',
      value: 'AI virtual-cell infrastructure for biological representation, transition modeling and simulation.',
      href: '/projects/hycell',
    },
    {
      id: 'morn',
      label: 'Morn',
      value:
        'Agent runtime for persistent work — Rust workspace, durable two-node execution, capability packs and scripted verification.',
      href: '/projects/morn',
    },
    {
      id: 'biopulse',
      label: 'BioPulse',
      value: 'Agent-native workspace for life-science workflows — Python stack, MIT licensed, public repository.',
      href: '/projects/biopulse',
    },
    {
      id: 'pdig',
      label: 'PDIG',
      value: 'Local-first personal dependency and digital-infrastructure graph across native platforms.',
      href: '/projects/pdig',
    },
    {
      id: 'pet-ai-health',
      label: 'Pet AI Health',
      value: 'AI-native pet health platform across observation, risk assessment, consultation and care workflows.',
      href: '/projects/pet-ai-health',
    },
  ],
  zh: [
    {
      id: 'wennian',
      label: '知身·问年',
      value: 'AI 衰老评估、主动追问与干预决策系统。',
      href: '/zh/projects/wennian',
    },
    {
      id: 'hycell',
      label: 'HyCell',
      value: '面向生物表示、状态转移建模与仿真的 AI 虚拟细胞基础设施。',
      href: '/zh/projects/hycell',
    },
    {
      id: 'morn',
      label: 'Morn',
      value:
        '面向长期任务的智能体运行底座 — Rust workspace、双节点持久化执行、能力包与脚本化验证。',
      href: '/zh/projects/morn',
    },
    {
      id: 'biopulse',
      label: 'BioPulse',
      value: '面向生命科学工作流的 Agent-native 工作台 — Python 技术栈，MIT 许可证，代码公开。',
      href: '/zh/projects/biopulse',
    },
    {
      id: 'pdig',
      label: 'PDIG',
      value: '跨原生平台的本地优先个人依赖与数字基础设施图谱。',
      href: '/zh/projects/pdig',
    },
    {
      id: 'pet-ai-health',
      label: 'Pet AI Health',
      value: '覆盖观察、风险评估、问诊与照护流程的 AI 原生宠物健康平台。',
      href: '/zh/projects/pet-ai-health',
    },
  ],
};

const OPEN_SOURCE: Record<Lang, ResumeItem[]> = {
  en: [
    { label: 'GitHub', value: 'github.com/huangdi97', href: SITE.github },
    {
      label: 'WenNian',
      value: 'huangdi97/WenNian — public repository for ZhiShen · WenNian',
      href: 'https://github.com/huangdi97/WenNian',
    },
    {
      label: 'HyCell-JEPA',
      value: 'huangdi97/HyCell-JEPA',
      href: 'https://github.com/huangdi97/HyCell-JEPA',
    },
    { label: 'BioPulse', value: 'huangdi97/BioPulse', href: 'https://github.com/huangdi97/BioPulse' },
  ],
  zh: [
    { label: 'GitHub', value: 'github.com/huangdi97', href: SITE.github },
    {
      label: 'WenNian',
      value: 'huangdi97/WenNian — 知身·问年的公开代码仓库',
      href: 'https://github.com/huangdi97/WenNian',
    },
    {
      label: 'HyCell-JEPA',
      value: 'huangdi97/HyCell-JEPA',
      href: 'https://github.com/huangdi97/HyCell-JEPA',
    },
    { label: 'BioPulse', value: 'huangdi97/BioPulse', href: 'https://github.com/huangdi97/BioPulse' },
  ],
};

function build(lang: Lang): ResumeModel {
  return {
    name: lang === 'zh' ? SITE.nameZh : SITE.nameEn,
    headline: SITE.statement[lang],
    blocks: [
      { id: 'profile', title: t(lang, 'resume.profile'), kind: 'text', paragraphs: PROFILE_TEXT[lang] },
      {
        id: 'focus',
        title: t(lang, 'resume.focus'),
        kind: 'list',
        items: SITE.focusAreas.map((a) => ({ label: lang === 'zh' ? a.zh : a.en })),
      },
      {
        id: 'experience',
        title: t(lang, 'resume.experience'),
        kind: 'entries',
        entries: getExperience(lang).map((e) => ({
          id: e.id,
          title: e.company,
          subtitle: `${e.role} · ${e.department}`,
          period: e.period,
          location: e.location,
          lines: e.lines,
        })),
      },
      {
        id: 'education',
        title: t(lang, 'resume.education'),
        kind: 'entries',
        entries: getEducation(lang).map((e) => ({
          id: e.id,
          title: e.institution,
          subtitle: e.degree,
          period: e.period,
          location: e.location,
          focus: e.focus,
        })),
      },
      {
        id: 'research',
        title: t(lang, 'resume.research'),
        kind: 'entries',
        entries: getResearchExperience(lang).map((e) => ({
          id: e.id,
          title: e.title,
          subtitle: e.role,
          org: e.organisation,
          period: e.period,
          lines: e.lines,
        })),
      },
      {
        id: 'output',
        title: t(lang, 'resume.output'),
        kind: 'outputs',
        items: getResearchOutputs(lang).map((o) => ({ title: o.title, status: o.status })),
      },
      {
        id: 'projects',
        title: t(lang, 'resume.projects'),
        kind: 'projects',
        items: PROJECT_ITEMS[lang],
      },
      { id: 'technical', title: t(lang, 'resume.technical'), kind: 'groups', groups: TECHNICAL_GROUPS[lang] },
      { id: 'opensource', title: t(lang, 'resume.opensource'), kind: 'list', items: OPEN_SOURCE[lang] },
      {
        id: 'contact',
        title: t(lang, 'resume.contact'),
        kind: 'contact',
        items: getContactLinks(lang).map((l) => ({
          label: l.label,
          value: l.value,
          href: l.href,
        })),
      },
    ],
  };
}

export function getResume(lang: Lang): ResumeModel {
  return lang === 'zh' ? build('zh') : build('en');
}

/**
 * Résumé PDFs that actually exist in `public/`.
 *
 * A download button is only ever emitted for a file present at build time, so
 * the site can never ship a 404 download.
 */
export function availableResumePdfs() {
  return SITE.resumePdfs.filter((pdf) => existsSync(join(process.cwd(), 'public', pdf.path)));
}
