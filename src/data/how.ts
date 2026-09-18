import type { Lang } from '../i18n/ui';

export type HowStep = {
  index: string;
  title: string;
  body: string;
};

const en: HowStep[] = [
  {
    index: '01',
    title: 'Research',
    body: 'Read the primary sources before choosing an approach. Most project risk is decided here.',
  },
  {
    index: '02',
    title: 'Product',
    body: 'Decide what the system will refuse to do. Scope limits written early survive contact with users.',
  },
  {
    index: '03',
    title: 'Architecture',
    body: 'Define the contracts between stages first, so any stage can be replaced without rewriting the loop.',
  },
  {
    index: '04',
    title: 'Implementation',
    body: 'Separate what was observed from what it means from what to do about it. Each gets its own schema.',
  },
  {
    index: '05',
    title: 'Evaluation',
    body: 'Verification runs inside the pipeline, not after it. A claim that cannot be traced is rejected.',
  },
  {
    index: '06',
    title: 'Deployment',
    body: 'Ship it where someone else can run it, with the limitations published next to the results.',
  },
];

const zh: HowStep[] = [
  {
    index: '01',
    title: '研究',
    body: '在选择方案之前先读原始来源。项目的大部分风险在这一步就已经被决定了。',
  },
  {
    index: '02',
    title: '产品',
    body: '先决定系统将拒绝做什么。早期写下的边界，才扛得住真实用户的撞击。',
  },
  {
    index: '03',
    title: '架构',
    body: '先定义各阶段之间的契约，这样任何阶段都能被替换，而不必重写整个闭环。',
  },
  {
    index: '04',
    title: '实现',
    body: '把「观察到什么」「意味着什么」「该做什么」分开，各自拥有独立的 schema。',
  },
  {
    index: '05',
    title: '评估',
    body: '校验运行在流水线之内，而不是之后。无法追溯的主张会被直接拒绝。',
  },
  {
    index: '06',
    title: '部署',
    body: '把它交付到别人也能运行的地方，并把局限性写在结果旁边。',
  },
];

export function getHow(lang: Lang): HowStep[] {
  return lang === 'zh' ? zh : en;
}
