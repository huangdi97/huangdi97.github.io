import type { Bi } from './bi';
import type { Lang } from '../i18n/ui';

/**
 * Academic research record and research output.
 *
 * Source annotation (internal, never rendered): owner-confirmed résumé facts.
 * This is distinct from `research.ts` (current research *directions*) and from
 * `education.ts` (institutions and degrees). Here: what was actually done.
 *
 * Everything described sits in preclinical / experimental / computational
 * biology. It is never framed as clinical research or clinical AI.
 */

export type ResearchEntry = {
  id: string;
  title: Bi;
  organisation: Bi;
  period: Bi;
  role: Bi;
  lines: Bi[];
};

export const RESEARCH_EXPERIENCE: ResearchEntry[] = [
  {
    id: 'disease-models',
    title: {
      en: 'Disease Model Development & Pharmacological Mechanism Research',
      zh: '疾病模型构建与药理机制研究',
    },
    organisation: { en: 'Dalian Medical University', zh: '大连医科大学' },
    period: { en: 'Aug 2023 — May 2026', zh: '2023.08 — 2026.05' },
    role: {
      en: 'Project designer and primary implementer',
      zh: '课题设计者与主要实施人',
    },
    lines: [
      {
        en: 'Led the design and implementation of three projects: a drug improving lung injury through neutrophil–macrophage interaction; improving intestinal ischemia/reperfusion-related liver injury through the Nrf2 pathway; and improving sepsis through a gut-microbiome-associated mechanism.',
        zh: '主导三项课题的设计与实施：药物经中性粒细胞—巨噬细胞互作改善肺损伤、经 Nrf2 通路改善肠缺血再灌注相关肝损伤、经肠道菌群相关机制改善脓毒症。',
      },
      {
        en: 'Independently completed animal-model construction, phenotyping and mechanistic assays (ELISA, Western Blot, IHC, PCR, flow cytometry), plus primary-cell isolation, culture and functional validation.',
        zh: '独立完成动物模型构建、表型与机制分析（ELISA / WB / IHC / PCR / 流式），以及原代细胞提取、培养与功能验证。',
      },
      {
        en: 'Built R / Python multi-omics analysis pipelines over metabolomics and 16S rRNA sequencing data — differential analysis and microbiome–host interaction mining — and ran GROMACS molecular dynamics with MM/PBSA binding-free-energy calculation.',
        zh: '基于代谢组学与 16S rRNA 测序开发 R / Python 多组学整合分析流程，完成差异分析与菌群—宿主互作挖掘；使用 GROMACS 进行分子动力学模拟与 MM/PBSA 结合自由能计算。',
      },
      {
        en: 'Worked across wet-lab experiments and computational analysis, which provided first-hand understanding of how biological data are generated and where experimental and batch noise enters the pipeline.',
        zh: '长期同时承担湿实验与数据分析，熟悉生物数据的产生方式与噪声来源，能够区分真实信号与批次、操作引入的假阳性。',
      },
    ],
  },
];

/**
 * Research output.
 *
 * Status discipline: "Manuscript submitted" / "稿件在投" is the only status
 * used. No journal, volume, issue, DOI or citation count is invented, and the
 * entry is never described as published, accepted or peer-reviewed.
 */
export type ResearchOutput = {
  id: string;
  title: string;
  status: Bi;
  kind: Bi;
};

export const RESEARCH_OUTPUTS: ResearchOutput[] = [
  {
    id: 'sulforaphane-nrf2',
    title:
      'Sulforaphane Ameliorates Intestinal Ischemia/Reperfusion Injury by Activating Nrf2 to Suppress Oxidative Stress and Pyroptosis',
    status: { en: 'Manuscript submitted', zh: '稿件在投' },
    kind: { en: 'Manuscript', zh: '论文稿件' },
  },
];

export function getResearchExperience(lang: Lang) {
  return RESEARCH_EXPERIENCE.map((entry) => ({
    id: entry.id,
    title: entry.title[lang],
    organisation: entry.organisation[lang],
    period: entry.period[lang],
    role: entry.role[lang],
    lines: entry.lines.map((l) => l[lang]),
  }));
}

export function getResearchOutputs(lang: Lang) {
  return RESEARCH_OUTPUTS.map((entry) => ({
    id: entry.id,
    title: entry.title,
    status: entry.status[lang],
    kind: entry.kind[lang],
  }));
}
