import type { Bi } from './bi';
import type { Lang } from '../i18n/ui';

/**
 * Education records.
 *
 * Source annotation (internal, never rendered): owner-confirmed résumé facts
 * plus the institution's own English name. Two entries exist and both are
 * published in full — institution, degree, field, period, city.
 *
 * Deliberately not published: 211 designation, rankings, promotional
 * institutional titles, CET-6, GPA, class rank, supervisor names. Education is
 * a record of study, not a prospectus.
 *
 * Institution English names are the current official forms:
 *   Dalian Medical University      (not the historical "Dalian Medical College")
 *   Taiyuan University of Technology
 */

export type EducationEntry = {
  id: string;
  institution: Bi;
  /** Degree and field, written formally. */
  degree: Bi;
  period: Bi;
  location: Bi;
  /** Master's research focus. Absent for the undergraduate record. */
  focus?: {
    label: Bi;
    items: Bi[];
    methods: Bi[];
  };
};

export const EDUCATION: EducationEntry[] = [
  {
    id: 'dalian-medical',
    institution: { en: 'Dalian Medical University', zh: '大连医科大学' },
    degree: {
      en: 'Master of Science (M.S.) in Zoology',
      zh: '理学硕士 · 动物学',
    },
    period: { en: 'Aug 2023 — Jun 2026', zh: '2023.08 — 2026.06' },
    location: { en: 'Dalian, Liaoning, China', zh: '辽宁 · 大连' },
    focus: {
      label: { en: 'Research Focus', zh: '研究方向' },
      items: [
        { en: 'Disease models', zh: '疾病动物模型构建' },
        { en: 'Pharmacology & efficacy evaluation', zh: '药理药效评价' },
        { en: 'Multi-omics bioinformatics', zh: '多组学生物信息分析' },
        { en: 'Computational biology', zh: '计算生物学模拟' },
      ],
      methods: [
        { en: 'Molecular dynamics', zh: '分子动力学' },
        { en: 'Bayesian network modeling', zh: '贝叶斯网络建模' },
      ],
    },
  },
  {
    id: 'taiyuan-ut',
    institution: { en: 'Taiyuan University of Technology', zh: '太原理工大学' },
    degree: {
      en: 'Bachelor of Engineering (B.Eng.) in Biological Engineering',
      zh: '工学学士 · 生物工程',
    },
    period: { en: 'Sep 2016 — Jul 2020', zh: '2016.09 — 2020.07' },
    location: { en: 'Taiyuan, Shanxi, China', zh: '山西 · 太原' },
  },
];

/** Flat, locale-resolved view used by the résumé renderer. */
export function getEducation(lang: Lang) {
  return EDUCATION.map((entry) => ({
    id: entry.id,
    institution: entry.institution[lang],
    degree: entry.degree[lang],
    period: entry.period[lang],
    location: entry.location[lang],
    focus: entry.focus
      ? {
          label: entry.focus.label[lang],
          items: entry.focus.items.map((i) => i[lang]),
          methods: entry.focus.methods.map((m) => m[lang]),
        }
      : undefined,
  }));
}
