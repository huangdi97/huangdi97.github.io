import type { Lang } from '../i18n/ui';
import { SITE } from '../config/site';

/**
 * About-page copy (v2.1, trimmed in v2.2.1).
 *
 * What changed. v1.6 ran this page as a statement of working method: after the
 * introduction it printed a six-card grid titled "What I work on" in which each
 * card named a technique family and described how it is applied, then a
 * "How I work" section rendering the six-stage process rail — research,
 * product, architecture, implementation, evaluation, deployment — then the
 * background chain, then scope.
 *
 * §29–§33 turns the page into an introduction instead: who this is, what the
 * training was, why the work moved towards AI × life science, what it is aimed
 * at now, and a short path between those. Removed with the method grid and the
 * process rail: the technique vocabulary, the staged workflow and the
 * design-philosophy paragraph. `focus` is now a list of directions rather than
 * a grid of methods, and `approachTitle` / `approachIntro` are gone.
 *
 * v2.2.1 (§28) — "check for a long personal methodology or an over-technical
 * route description; shorten if present". Two survived:
 *
 *   · "Usually as one engineer rather than a team of five." A claim about the
 *     maker rather than about the work, and the one sentence on the page that
 *     asked to be read as a boast. Gone.
 *   · the closing clause of the third paragraph — "mathematics supplies the
 *     language, and learning covers the parts we cannot yet write as
 *     equations". That is the design-philosophy sentence v2.1 said it had
 *     removed, and it had grown back. The paragraph now states the interest and
 *     stops.
 *
 * The structure is untouched: three intro paragraphs, five one-line
 * directions, the path rail, scope and contact.
 */
export type AboutModel = {
  headline: string;
  intro: string[];
  focusTitle: string;
  /** Directions, one line each. Deliberately not a set of method cards. */
  focus: string[];
  /**
   * Short, factual background — how the life-science work led here. The path
   * itself is drawn by `BackgroundTimeline` from `data/background.ts`, whose
   * five nodes map one-to-one onto owner-confirmed résumé fact; this is only
   * the lead that introduces it, so it does not restate the rail.
   */
  backgroundTitle: string;
  backgroundIntro: string;
  scopeTitle: string;
  scope: string[];
  contactTitle: string;
  contactIntro: string;
};

const en: AboutModel = {
  headline: 'AI systems engineer working across agents, scientific computing and life-science applications.',
  intro: [
    'I build AI systems at the intersection of science, health and autonomous software. Most of it starts the same way: a question that is currently answered by hand, and a system that should answer it better.',
    'The work runs from zero to one — a problem that exists only as a description, and something at the end that another person can run.',
    'I am drawn to living systems that can be described as problems of state, dynamics and intervention.',
  ],
  focusTitle: 'What I am working on now',
  focus: [
    'AI systems and agents — retrieval, evaluation, deployment.',
    'Computational biology — single-cell, ageing and multi-omics analysis.',
    'Digital health — assessment products that stay inside their scope.',
    'Simulation and digital twins — compact enough to audit.',
    'Research engineering — turning a question into runnable infrastructure.',
  ],
  backgroundTitle: 'Where this comes from',
  backgroundIntro:
    'Training began in life-science experimental research, then widened into computational biology, and from there into AI systems engineering. The scope moved; the field did not.',
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
    '做的是从 0 到 1 的事——一个仅存在于描述中的问题，最后变成别人真的能跑起来的东西。',
    '我尤其关注那些可以被描述为状态、动力学与干预问题的生命系统。',
  ],
  focusTitle: '当前关注方向',
  focus: [
    'AI 系统与智能体——检索、评估与部署。',
    '计算生物学——单细胞、衰老与多组学分析。',
    '数字健康——待在自身边界内的评估产品。',
    '仿真与数字孪生——紧凑到可以被审计。',
    '研究工程——把一个研究问题变成可运行的基础设施。',
  ],
  backgroundTitle: '来路',
  backgroundIntro:
    '训练从生命科学实验研究开始，随后扩展到计算生物学，再由此进入 AI 系统工程。变的是范围，不是领域。',
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
