import type { Bi } from './bi';
import type { Lang } from '../i18n/ui';

/**
 * Employment history.
 *
 * Source annotation (internal, never rendered): owner-confirmed résumé facts.
 * Company English names are the companies' own public English forms:
 *   Beijing ZONCI Technology Development Co., Ltd.
 *   Sinovac Life Sciences Co., Ltd.
 *
 * Translation note: "配比技术工程师" is rendered as "Formulation Technology
 * Engineer". That is a working translation of the Chinese title, not a claim
 * that the company publishes this English title officially.
 *
 * Scope discipline: "负责小组任务拆分与推进" is rendered as responsibility for
 * breaking down and tracking the group's task list — not as a management
 * title. "带领小组" is rendered as coordinating / leading a small working
 * group — not as Team Lead or Department Manager.
 *
 * Employment is kept visually and semantically distinct from personal projects
 * (Selected Work) and from academic research (Research Experience).
 */

export type ExperienceEntry = {
  id: string;
  company: Bi;
  department: Bi;
  role: Bi;
  period: Bi;
  location: Bi;
  lines: Bi[];
};

export const EXPERIENCE: ExperienceEntry[] = [
  {
    id: 'zonci',
    company: {
      en: 'Beijing ZONCI Technology Development Co., Ltd.',
      zh: '北京众驰伟业科技发展有限公司',
    },
    department: { en: 'R&D Department', zh: '研发部' },
    role: { en: 'Assistant Engineer', zh: '助理工程师' },
    period: { en: 'Mar 2023 — Aug 2023', zh: '2023.03 — 2023.08' },
    location: { en: 'Beijing, China', zh: '北京' },
    lines: [
      {
        en: 'Contributed to the R&D iteration of coagulation analyzers and the companion in-vitro diagnostic reagents.',
        zh: '参与凝血分析仪及配套体外诊断试剂的研发迭代。',
      },
      {
        en: 'Responsible for breaking down and driving forward the group task list.',
        zh: '负责小组任务拆分与推进。',
      },
      {
        en: 'Gained first-hand familiarity with the full path of a medical device / IVD product, from development through verification.',
        zh: '熟悉医疗器械 / IVD 产品从开发到验证的完整流程。',
      },
    ],
  },
  {
    id: 'sinovac',
    company: {
      en: 'Sinovac Life Sciences Co., Ltd.',
      zh: '北京科兴中维生物技术有限公司',
    },
    department: { en: 'Formulation Division', zh: '配比事业部' },
    role: { en: 'Formulation Technology Engineer', zh: '配比技术工程师' },
    period: { en: 'Mar 2021 — Oct 2021', zh: '2021.03 — 2021.10' },
    location: { en: 'Beijing, China', zh: '北京' },
    lines: [
      {
        en: 'Handled the upstream aluminium-adjuvant process for the COVID-19 vaccine: preparation, washing, concentration, filling and physicochemical testing.',
        zh: '负责新冠疫苗上游铝佐剂的配制、洗涤、浓缩、分装及理化性质检测。',
      },
      {
        en: 'Coordinated a small working group completing semi-finished product formulation.',
        zh: '带领小组完成半成品配制。',
      },
      {
        en: 'Worked inside a GMP system, which formed strict habits of process compliance and data integrity.',
        zh: '在 GMP 体系下工作，形成严格的流程合规与数据完整性意识。',
      },
    ],
  },
];

/** Flat, locale-resolved view used by the résumé renderer. */
export function getExperience(lang: Lang) {
  return EXPERIENCE.map((entry) => ({
    id: entry.id,
    company: entry.company[lang],
    department: entry.department[lang],
    role: entry.role[lang],
    period: entry.period[lang],
    location: entry.location[lang],
    lines: entry.lines.map((l) => l[lang]),
  }));
}
