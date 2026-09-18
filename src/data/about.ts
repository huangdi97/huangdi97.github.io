import type { Lang } from '../i18n/ui';
import { SITE } from '../config/site';

/**
 * About-page copy. Deliberately concrete: what is built, how it is built,
 * and what is explicitly not claimed.
 */

export type AboutModel = {
  headline: string;
  intro: string[];
  focusTitle: string;
  focus: { title: string; body: string }[];
  approachTitle: string;
  approachIntro: string;
  scopeTitle: string;
  scope: string[];
  contactTitle: string;
  contactIntro: string;
};

const en: AboutModel = {
  headline: 'I build AI systems at the intersection of science, health and autonomous software.',
  intro: [
    'My work runs across AI systems, agents, computational biology, digital health and simulation. Most of it starts the same way: a question that is currently answered by hand, and a system that should answer it better.',
    'I like building from zero to one — taking a problem that only exists as a description and ending with something someone else can run. That means owning the whole path: product framing, architecture, implementation, evaluation and deployment, usually as one engineer rather than a team of five.',
    'The parts I care about most are the ones that do not demo well: data contracts, verification stages, explicit limits, and reproducibility scripts. A system that states what it cannot do is more useful than one that sounds confident.',
  ],
  focusTitle: 'What I work on',
  focus: [
    {
      title: 'AI systems',
      body: 'Retrieval, agents and evaluation harnesses — designed so a claim can be traced back to the evidence that produced it.',
    },
    {
      title: 'Agentic systems',
      body: 'Role boundaries, structured hand-offs, verification as a pipeline stage, and runtime observability over prompt optimism.',
    },
    {
      title: 'Computational biology',
      body: 'Aging clocks, gene-set scoring and single-cell pipelines, with honest labelling of what public data can and cannot support.',
    },
    {
      title: 'Digital health',
      body: 'Assessment products that stay inside their scope: confidence intervals, guardrails, and escalation paths to human clinicians.',
    },
    {
      title: 'Simulation',
      body: 'Latent transition models, mechanistic ODE / QSP coupling and digital twins — compact enough to audit, honest about failure.',
    },
    {
      title: 'Research engineering',
      body: 'Turning a research question into runnable, reproducible infrastructure: loaders, schema checks, verifiers and acceptance scripts.',
    },
  ],
  approachTitle: 'How I work',
  approachIntro:
    'Six stages, in order. Model capability is one of them — it is not the whole job.',
  scopeTitle: 'Scope',
  scope: [
    'No medical claims. Health projects are positioned as assessment and decision support, with disclaimers carried in the output itself.',
    'No invented metrics. If a number is published, its scope is published next to it.',
    'No unverifiable history. Employment, education and awards are only listed once there is a record worth linking to.',
  ],
  contactTitle: 'Contact',
  contactIntro:
    'Open to collaboration on AI systems, agents, computational biology and health infrastructure. GitHub is the most reliable way to reach me.',
};

const zh: AboutModel = {
  headline: '我在科学、健康与自主软件的交叉地带构建 AI 系统。',
  intro: [
    '我的工作横跨 AI 系统、智能体、计算生物学、数字健康与仿真。它们大多以同样的方式开始：一个目前还靠人工回答的问题，以及一个本该回答得更好的系统。',
    '我喜欢从 0 到 1 地构建——把一个仅存在于描述中的问题，做成别人真的能跑起来的东西。这意味着拥有完整链路：产品定义、架构、实现、评估与部署，通常由我一个人完成，而不是一个五人团队。',
    '我最在意的恰恰是那些不好演示的部分：数据契约、校验阶段、明确边界、可复现脚本。一个能说清自己不能做什么的系统，比一个听起来很自信的系统更有用。',
  ],
  focusTitle: '我在做什么',
  focus: [
    {
      title: 'AI 系统',
      body: '检索、智能体与评估体系——设计目标是让每条主张都能追溯到产出它的证据。',
    },
    {
      title: '智能体系统',
      body: '角色边界、结构化交接、作为流水线阶段的校验机制，以及胜过「提示词乐观主义」的运行时可观测性。',
    },
    {
      title: '计算生物学',
      body: '衰老时钟、基因集打分与单细胞流程，并诚实标注公开数据能支撑什么、不能支撑什么。',
    },
    {
      title: '数字健康',
      body: '待在自身边界内的评估产品：置信区间、护栏，以及通向人类临床医生的升级路径。',
    },
    {
      title: '仿真',
      body: '隐空间转移模型、机理 ODE / QSP 耦合与数字孪生——紧凑到可以被审计，并且对失败保持诚实。',
    },
    {
      title: '研究工程',
      body: '把一个研究问题变成可运行、可复现的基础设施：加载器、schema 校验、校验器与验收脚本。',
    },
  ],
  approachTitle: '我如何工作',
  approachIntro: '六个阶段，按顺序。模型能力只是其中之一——它不是全部工作。',
  scopeTitle: '边界',
  scope: [
    '不做医疗结论。健康类项目定位为评估与决策支持，免责声明随产物一起输出。',
    '不编造指标。如果发布了一个数字，它的适用范围会一起被发布。',
    '不写无法核实的历史。任职、教育与奖项只在有可公开记录时才会列出。',
  ],
  contactTitle: '联系',
  contactIntro:
    '欢迎就 AI 系统、智能体、计算生物学与健康基础设施方向交流合作。GitHub 是最可靠的联系方式。',
};

export function getAbout(lang: Lang): AboutModel {
  return lang === 'zh' ? zh : en;
}

export const ABOUT_FOCUS_AREAS = SITE.focusAreas;
