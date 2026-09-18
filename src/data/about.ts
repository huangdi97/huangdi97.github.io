import type { Lang } from '../i18n/ui';
import { SITE } from '../config/site';

/**
 * About-page copy. Deliberately concrete: what is built, how it is built,
 * where the background comes from, and what is explicitly not claimed.
 */

export type AboutModel = {
  headline: string;
  intro: string[];
  focusTitle: string;
  focus: { title: string; body: string }[];
  /** Short, factual background chain — how the life-science work led here. */
  backgroundTitle: string;
  backgroundIntro: string;
  background: { title: string; body: string }[];
  approachTitle: string;
  approachIntro: string;
  scopeTitle: string;
  scope: string[];
  contactTitle: string;
  contactIntro: string;
};

const en: AboutModel = {
  headline: 'AI systems engineer working across agents, scientific computing and life-science applications.',
  intro: [
    'I build AI systems at the intersection of science, health and autonomous software. Most of it starts the same way: a question that is currently answered by hand, and a system that should answer it better.',
    'I like building from zero to one — taking a problem that only exists as a description and ending with something someone else can run. That means owning the whole path: product framing, architecture, implementation, evaluation and deployment, usually as one engineer rather than a team of five.',
    'The parts I care about most are the ones that do not demo well: data contracts, verification stages, explicit limits, and reproducibility scripts. A system that states what it cannot do is more useful than one that sounds confident.',
    'I am especially drawn to living systems that can be written down as problems of state, dynamics and intervention — where mathematics supplies the language, and learning covers the parts we cannot yet write as equations.',
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
  backgroundTitle: 'Where this comes from',
  backgroundIntro:
    'My first training was in life-science experimental research — animal models, mechanistic assays and multi-omics data, often in the same week. That gave me direct experience of how biological data are produced and where noise enters an analysis. The work then widened into computational biology, and from there into AI systems engineering. Not a switch into AI from nowhere — a widening of scope.',
  background: [
    {
      title: 'Life Science',
      body: 'Undergraduate training in biological engineering, postgraduate training in zoology.',
    },
    {
      title: 'Experimental Research',
      body: 'Disease-model construction, pharmacological mechanism work and primary-cell experiments across three preclinical projects.',
    },
    {
      title: 'Computational Biology',
      body: 'Multi-omics analysis, molecular dynamics and Bayesian modeling over the data those experiments produced.',
    },
    {
      title: 'AI Systems / Agents',
      body: 'Agent and LLM engineering, retrieval, evaluation and deployment — the main line of work today.',
    },
  ],
  approachTitle: 'How I work',
  approachIntro:
    'Six stages, in order. Model capability is one of them — it is not the whole job.',
  scopeTitle: 'Scope',
  scope: [
    'No medical claims. Health projects are positioned as assessment and decision support, with disclaimers carried in the output itself.',
    'No invented metrics. If a number is published, its scope is published next to it.',
    'No inferred history. Education, employment and research are published as supplied by the owner — GPA, class rank, supervisors, journal names and job performance are never inferred or filled in.',
  ],
  contactTitle: 'Contact',
  contactIntro:
    'Open to collaboration on AI systems, agents, computational biology and health infrastructure. Email and GitHub both work.',
};

const zh: AboutModel = {
  headline: '构建 AI 系统的工程师，工作横跨智能体、科学计算与生命科学应用。',
  intro: [
    '我在科学、健康与自主软件的交叉地带构建 AI 系统。它们大多以同样的方式开始：一个目前还靠人工回答的问题，以及一个本该回答得更好的系统。',
    '我喜欢从 0 到 1 地构建——把一个仅存在于描述中的问题，做成别人真的能跑起来的东西。这意味着拥有完整链路：产品定义、架构、实现、评估与部署，通常由我一个人完成，而不是一个五人团队。',
    '我最在意的恰恰是那些不好演示的部分：数据契约、校验阶段、明确边界、可复现脚本。一个能说清自己不能做什么的系统，比一个听起来很自信的系统更有用。',
    '我尤其关注那些可以被描述为状态、动力学与干预问题的生命系统——数学提供语言，而学习补足那些我们还无法写成方程的部分。',
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
  backgroundTitle: '来路',
  backgroundIntro:
    '我最初的训练来自生命科学实验研究——动物模型、机制实验与多组学数据，常常出现在同一周里。这让我对数据如何产生、噪声从哪里进入分析流程有直接经验。随后工作逐渐扩展到计算生物学，再到 AI 系统工程。这不是「突然转做 AI」，而是范围的逐层外扩。',
  background: [
    { title: '生命科学', body: '本科生物工程，硕士动物学。' },
    {
      title: '实验研究',
      body: '在三项临床前课题中完成疾病模型构建、药理机制研究与原代细胞实验。',
    },
    {
      title: '计算生物学',
      body: '在实验产生的数据上做多组学分析、分子动力学与贝叶斯建模。',
    },
    {
      title: 'AI 系统 / 智能体',
      body: '智能体与 LLM 工程、检索、评估与部署——现在是工作主线。',
    },
  ],
  approachTitle: '我如何工作',
  approachIntro: '六个阶段，按顺序。模型能力只是其中之一——它不是全部工作。',
  scopeTitle: '边界',
  scope: [
    '不做医疗结论。健康类项目定位为评估与决策支持，免责声明随产物一起输出。',
    '不编造指标。如果发布了一个数字，它的适用范围会一起被发布。',
    '不推断履历。教育、工作与科研经历按本人提供的信息发布——GPA、排名、导师、论文期刊与工作绩效一律不做推断填充。',
  ],
  contactTitle: '联系',
  contactIntro:
    '欢迎就 AI 系统、智能体、计算生物学与健康基础设施方向交流合作。邮箱与 GitHub 都可以。',
};

export function getAbout(lang: Lang): AboutModel {
  return lang === 'zh' ? zh : en;
}

export const ABOUT_FOCUS_AREAS = SITE.focusAreas;
