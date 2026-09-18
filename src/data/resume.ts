import type { Lang } from '../i18n/ui';
import { SITE } from '../config/site';

/**
 * Resume content.
 *
 * Fact rule: nothing here is invented. Education, employment history, awards
 * and publications are only rendered when a verified record exists. When it
 * does not, the section states that explicitly instead of filling the space.
 */

export type ResumeBlock = {
  title: string;
  kind: 'text' | 'list' | 'projects' | 'contact' | 'empty';
  paragraphs?: string[];
  items?: { label: string; value?: string; href?: string }[];
  note?: string;
};

export type ResumeModel = {
  name: string;
  headline: string;
  blocks: ResumeBlock[];
};

const en: ResumeModel = {
  name: SITE.nameEn,
  headline: SITE.statement.en,
  blocks: [
    {
      title: 'Profile',
      kind: 'text',
      paragraphs: [
        'I build AI systems at the intersection of science, health and autonomous software. The work runs from problem framing through architecture, implementation and evaluation to deployment — usually as one person owning the whole path.',
        'Most of what I build is open source on GitHub, including an aging-intervention decision engine and a cellular world-model prototype.',
      ],
    },
    {
      title: 'Focus',
      kind: 'list',
      items: SITE.focusAreas.map((a) => ({ label: a.en })),
    },
    {
      title: 'Selected Projects',
      kind: 'projects',
      items: [
        {
          label: 'WenNian / 知身·问年',
          value: 'AI aging assessment, active interviewing, continuous sensing and intervention decision support.',
          href: '/projects/wennian',
        },
        {
          label: 'HyCell',
          value: 'AI virtual-cell infrastructure for biological representation, transition modeling and simulation.',
          href: '/projects/hycell',
        },
        {
          label: 'TaiYi Lingjing / 太一·灵境',
          value: 'Agentic discovery platform connecting biology, evidence, simulation and experimentation.',
          href: '/projects/taiyi-lingjing',
        },
        {
          label: 'Pet AI Health',
          value: 'AI-native pet health platform across observation, risk assessment, consultation and care workflows.',
          href: '/projects/pet-ai-health',
        },
        {
          label: 'PDIG',
          value: 'Local-first personal dependency and digital-infrastructure graph across native platforms.',
          href: '/projects/pdig',
        },
      ],
    },
    {
      title: 'Technical Areas',
      kind: 'list',
      items: [
        { label: 'AI systems architecture — retrieval, agents, evaluation harnesses' },
        { label: 'Agentic and multi-agent systems — role design, verification, runtime observability' },
        { label: 'Computational biology — aging clocks, gene-set scoring, single-cell pipelines' },
        { label: 'Simulation — latent transition models, mechanistic ODE/QSP coupling, digital twins' },
        { label: 'Engineering — Python, TypeScript, Rust, Go; static site and native app delivery' },
      ],
    },
    {
      title: 'Open Source',
      kind: 'list',
      items: [
        { label: 'GitHub', value: 'github.com/huangdi97', href: SITE.github },
        { label: 'WenNian', value: 'huangdi97/WenNian', href: 'https://github.com/huangdi97/WenNian' },
        {
          label: 'HyCell-JEPA',
          value: 'huangdi97/HyCell-JEPA',
          href: 'https://github.com/huangdi97/HyCell-JEPA',
        },
        { label: 'BioPulse', value: 'huangdi97/BioPulse', href: 'https://github.com/huangdi97/BioPulse' },
      ],
    },
    {
      title: 'Contact',
      kind: 'contact',
      items: [
        { label: 'GitHub', value: SITE.github.replace('https://', ''), href: SITE.github },
        ...(SITE.email
          ? [{ label: 'Email', value: SITE.email, href: `mailto:${SITE.email}` }]
          : []),
      ],
    },
    {
      title: 'Education',
      kind: 'empty',
      note: 'Not listed here — no verified record has been supplied for publication.',
    },
  ],
};

const zh: ResumeModel = {
  name: SITE.nameZh,
  headline: SITE.statement.zh,
  blocks: [
    {
      title: '简介',
      kind: 'text',
      paragraphs: [
        '我在科学、健康与自主软件的交叉地带构建 AI 系统。工作覆盖问题定义、架构设计、工程实现、评估验证到部署上线，通常由我一个人负责完整链路。',
        '大部分成果以开源形式发布在 GitHub，包括衰老干预决策引擎与细胞世界模型原型。',
      ],
    },
    {
      title: '方向',
      kind: 'list',
      items: SITE.focusAreas.map((a) => ({ label: a.zh })),
    },
    {
      title: '精选项目',
      kind: 'projects',
      items: [
        {
          label: 'WenNian / 知身·问年',
          value: 'AI 衰老评估、主动追问、连续感知与干预决策系统。',
          href: '/zh/projects/wennian',
        },
        {
          label: 'HyCell',
          value: '面向生物表示、状态转移建模与仿真的 AI 虚拟细胞基础设施。',
          href: '/zh/projects/hycell',
        },
        {
          label: 'TaiYi Lingjing / 太一·灵境',
          value: '连接生物学、证据、仿真与实验的智能体发现平台。',
          href: '/zh/projects/taiyi-lingjing',
        },
        {
          label: 'Pet AI Health',
          value: '覆盖观察、风险评估、问诊与照护流程的 AI 原生宠物健康平台。',
          href: '/zh/projects/pet-ai-health',
        },
        {
          label: 'PDIG',
          value: '跨原生平台的本地优先个人依赖与数字基础设施图谱。',
          href: '/zh/projects/pdig',
        },
      ],
    },
    {
      title: '技术领域',
      kind: 'list',
      items: [
        { label: 'AI 系统架构 — 检索、智能体、评估体系' },
        { label: '智能体与多智能体系统 — 角色设计、校验机制、运行时可观测性' },
        { label: '计算生物学 — 衰老时钟、基因集打分、单细胞流程' },
        { label: '仿真 — 隐空间转移模型、机理 ODE/QSP 耦合、数字孪生' },
        { label: '工程 — Python、TypeScript、Rust、Go；静态站点与原生应用交付' },
      ],
    },
    {
      title: '开源',
      kind: 'list',
      items: [
        { label: 'GitHub', value: 'github.com/huangdi97', href: SITE.github },
        { label: 'WenNian', value: 'huangdi97/WenNian', href: 'https://github.com/huangdi97/WenNian' },
        {
          label: 'HyCell-JEPA',
          value: 'huangdi97/HyCell-JEPA',
          href: 'https://github.com/huangdi97/HyCell-JEPA',
        },
        { label: 'BioPulse', value: 'huangdi97/BioPulse', href: 'https://github.com/huangdi97/BioPulse' },
      ],
    },
    {
      title: '联系',
      kind: 'contact',
      items: [
        { label: 'GitHub', value: SITE.github.replace('https://', ''), href: SITE.github },
        ...(SITE.email
          ? [{ label: '邮箱', value: SITE.email, href: `mailto:${SITE.email}` }]
          : []),
      ],
    },
    {
      title: '教育',
      kind: 'empty',
      note: '此处未列出 — 暂无可供公开发布的已核实记录。',
    },
  ],
};

export function getResume(lang: Lang): ResumeModel {
  return lang === 'zh' ? zh : en;
}
