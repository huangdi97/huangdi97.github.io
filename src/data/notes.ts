/**
 * Lab Notes — three recent entries, shown as a dated log on the homepage.
 *
 * Rules: every note maps to something that actually happened and can be
 * pointed at. No invented milestones, no roadmap theatre, no auto-generated
 * "activity". If there is nothing to say, the section stays short rather than
 * growing filler.
 *
 * `href` is a locale-neutral site path; the component prefixes it for the
 * active language. A note with no `href` renders as plain text.
 */

import type { Bi } from './bi';

export type NoteKind = 'snapshot' | 'note' | 'release';

export type LabNote = {
  id: string;
  /** Year and month of the entry. */
  date: string;
  kind: NoteKind;
  title: Bi;
  summary: Bi;
  /** Locale-neutral internal path, or null when there is nothing to open. */
  href: string | null;
};

export const LAB_NOTES: LabNote[] = [
  {
    id: 'wennian-snapshot-2026-09',
    date: '2026.09',
    kind: 'snapshot',
    title: {
      en: 'ZhiShen · WenNian — public snapshot re-read',
      zh: '知身 · 问年 — 公开快照复核',
    },
    summary: {
      en: 'The open MVP still reads the same: four clocks, the organ-clock layer, the integrator and the agent layer are all in the tree. The causal graph remains marked as partially open.',
      zh: '开源 MVP 的结构未变：四个时钟、器官时钟层、融合层与智能体层都在目录内。因果图仍标注为部分开放。',
    },
    href: '/projects/wennian/',
  },
  {
    id: 'hycell-real-matrix-2026-09',
    date: '2026.09',
    kind: 'note',
    title: {
      en: 'HyCell — real-matrix smoke workflow written up',
      zh: 'HyCell — 真实矩阵冒烟流程成文',
    },
    summary: {
      en: 'The GSE130973 subset (5,000 cells × 2,000 genes) has an inspect → prepare → validate → summarise → smoke-train path with its own report. Age and state labels stay explicitly unknown.',
      zh: 'GSE130973 子集（5000 细胞 × 2000 基因）已有“检视 → 预处理 → 校验 → 汇总 → 冒烟训练”的完整路径与独立报告。年龄与状态标签仍被显式标注为未知。',
    },
    href: '/projects/hycell/',
  },
  {
    id: 'site-v1-4-2026-09',
    date: '2026.09',
    kind: 'release',
    title: {
      en: 'Personal AI Lab — visual system v1.4',
      zh: '个人 AI 实验室 — 视觉体系 v1.4',
    },
    summary: {
      en: 'Three themes, a Chinese-first entry, and a mathematical-biology section built from original diagrams. The fact layer underneath did not move.',
      zh: '三套主题、中文优先入口，以及由原创图构建的数学 × 生物板块。底下的事实层没有任何改动。',
    },
    href: null,
  },
];

export function getLabNotes(limit = 3): LabNote[] {
  return LAB_NOTES.slice(0, limit);
}

export const NOTE_KIND_LABELS: Record<NoteKind, Bi> = {
  snapshot: { en: 'Snapshot', zh: '快照' },
  note: { en: 'Note', zh: '札记' },
  release: { en: 'Release', zh: '发布' },
};
