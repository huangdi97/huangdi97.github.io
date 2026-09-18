import type { Lang } from '../i18n/ui';

/**
 * Architecture steps rendered by <ArchitectureDiagram /> on each case study.
 * Kept beside the content layer so pages stay free of hard-coded copy.
 */

export const ARCHITECTURE: Record<string, { en: string[]; zh: string[] }> = {
  wennian: {
    en: [
      'User',
      'Observation Layer',
      'Assessment',
      'Aging Drivers',
      'Digital Twin',
      'Intervention Simulation',
      'Decision Support',
    ],
    zh: ['用户', '观察层', '评估', '衰老驱动维度', '数字孪生', '干预仿真', '决策支持'],
  },
  hycell: {
    en: [
      'Toy HDF-like cells',
      'Gene-set scores',
      'Bio-state encoder',
      'JEPA transition core',
      'Predicted compact state',
      'Biological verifier',
      'Target-state planner',
    ],
    zh: [
      'Toy HDF 类细胞',
      '基因集打分',
      '生物状态编码器',
      'JEPA 转移核心',
      '预测的紧凑状态',
      '生物校验器',
      '目标状态规划器',
    ],
  },
  'taiyi-lingjing': {
    en: [
      'Question (proposed)',
      'Evidence retrieval (proposed)',
      'Hypothesis — knowledge graph (proposed)',
      'Simulation (proposed)',
      'Experiment design (proposed)',
      'Evidence audit (proposed)',
      'Human review (proposed)',
    ],
    zh: [
      '问题（拟）',
      '证据检索（拟）',
      '假设——知识图谱（拟）',
      '仿真（拟）',
      '实验设计（拟）',
      '证据审计（拟）',
      '人工评审（拟）',
    ],
  },
  morn: {
    en: [
      'Domain request',
      'Semantic kernel — policy',
      'Approval / simulation',
      'Governed action gateway (E0–E3)',
      'Commit and verify',
      'Append-only ledger',
      'Outcome record',
    ],
    zh: [
      '领域请求',
      '语义内核——策略',
      '审批 / 仿真',
      '受治理动作网关（E0–E3）',
      '提交与校验',
      '只追加账本',
      '结果记录',
    ],
  },
  biopulse: {
    en: [
      'User question',
      'Safety profile (L1–L3)',
      'Agent runtime loop',
      'Tool bridge / MCP',
      'Seven domain agents',
      'Compliance cross-audit',
      'Four client surfaces',
    ],
    zh: [
      '用户提问',
      '安全档案（L1–L3）',
      '智能体运行时循环',
      '工具桥接 / MCP',
      '七个领域智能体',
      '合规交叉稽核',
      '四个客户端界面',
    ],
  },
  'pet-ai-health': {
    en: [
      'Observation',
      'Multimodal intake',
      'Risk assessment',
      'Routing decision',
      'Consultation',
      'Care coordination',
      'Follow-up',
    ],
    zh: ['观察', '多模态接入', '风险评估', '路由决策', '问诊', '照护协调', '随访'],
  },
  pdig: {
    en: [
      'Canonical spec',
      'Conformance suite',
      'Repository layer',
      'Cryptography layer',
      'Native UI',
      'Android / iOS / HarmonyOS',
    ],
    zh: [
      'Canonical 规范',
      '一致性套件',
      '仓储层',
      '密码学层',
      '原生 UI',
      'Android / iOS / HarmonyOS',
    ],
  },
};

export function getArchitecture(slug: string, lang: Lang): string[] {
  const entry = ARCHITECTURE[slug];
  if (!entry) return [];
  return lang === 'zh' ? entry.zh : entry.en;
}
