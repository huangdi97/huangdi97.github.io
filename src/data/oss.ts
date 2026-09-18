/**
 * Public repositories, captured statically at build time.
 *
 * No GitHub API call is made during build or at runtime. Every field below was
 * read from the GitHub REST API and written here by hand; `capturedAt` records
 * when that snapshot was taken so an outdated entry is traceable, not silent.
 *
 * Discipline:
 *  - no star counts. Stars measure visibility, not capability.
 *  - `license: null` means GitHub detected no LICENSE file. It is displayed as
 *    "No license detected", never silently upgraded to "MIT".
 *  - anything private, unconfirmed or renamed is simply absent from this list.
 */

export type OssRole = 'flagship' | 'research' | 'agent-system' | 'tooling';

export type OssRepo = {
  name: string;
  url: string;
  language: string | null;
  /** SPDX identifier as GitHub reports it, or null when it detects none. */
  license: string | null;
  /** ISO date of the last update reported by GitHub. */
  updatedAt: string;
  descriptionEn: string;
  descriptionZh: string;
  /**
   * What this repository *is* to the portfolio — written by hand, never
   * inferred from the language or inferred from commit counts. `flagship` is
   * reserved for work this site builds a case around; `tooling` for utilities
   * that support something else.
   */
  role: OssRole;
  /** Shown on the home page open-source strip. */
  highlight?: boolean;
};

/** Date this snapshot was taken, in ISO 8601 form. Displayed as provenance. */
export const OSS_CAPTURED_AT = '2026-09-17';

export const OSS_REPOS: OssRepo[] = [
  {
    name: 'WenNian',
    url: 'https://github.com/huangdi97/WenNian',
    language: 'Python',
    license: null,
    updatedAt: '2026-07-01',
    role: 'flagship',
    descriptionEn:
      'Aging-intervention decision engine: multi-clock assessment, structured health interview, white-label reporting.',
    descriptionZh: '衰老干预决策引擎：多时钟衰老评估、结构化健康访谈、白标报告生成。',
    highlight: true,
  },
  {
    name: 'HyCell-JEPA',
    url: 'https://github.com/huangdi97/HyCell-JEPA',
    language: 'Python',
    license: null,
    updatedAt: '2026-07-22',
    role: 'research',
    descriptionEn:
      'Cellular world-model prototype: compact belief-state transitions, verifiers, planners and real-matrix smoke validation.',
    descriptionZh: '细胞世界模型原型：紧凑信念状态转移、校验器、规划器与真实矩阵冒烟验证。',
    highlight: true,
  },
  {
    name: 'BioPulse',
    url: 'https://github.com/huangdi97/BioPulse',
    language: 'Python',
    license: 'MIT',
    updatedAt: '2026-07-17',
    role: 'flagship',
    descriptionEn: 'Agent-native workspace for life-science workflows.',
    descriptionZh: '面向生命科学工作流的 Agent-native 工作台。',
    highlight: true,
  },
  {
    name: 'wanxiang-world',
    url: 'https://github.com/huangdi97/wanxiang-world',
    language: 'Python',
    license: 'Apache-2.0',
    updatedAt: '2026-08-17',
    role: 'agent-system',
    descriptionEn: 'Semantic persistent open-ended co-evolutionary world OS.',
    descriptionZh: '语义持久化、开放式协同演化的世界操作系统。',
    highlight: true,
  },
  {
    name: 'morn',
    url: 'https://github.com/huangdi97/morn',
    language: 'Rust',
    license: null,
    updatedAt: '2026-08-16',
    role: 'agent-system',
    descriptionEn: 'Systems-level operating environment written in Rust.',
    descriptionZh: '使用 Rust 编写的系统级运行环境。',
  },
  {
    name: 'mdns-scanner',
    url: 'https://github.com/huangdi97/mdns-scanner',
    language: 'Go',
    license: null,
    updatedAt: '2026-08-21',
    role: 'tooling',
    descriptionEn: 'Local network service discovery scanner.',
    descriptionZh: '本地网络服务发现扫描工具。',
  },
  {
    name: 'zhishen-pricing',
    url: 'https://github.com/huangdi97/zhishen-pricing',
    language: 'HTML',
    license: null,
    updatedAt: '2026-08-26',
    role: 'tooling',
    descriptionEn: 'Pricing page for the 知身 (ZhiShen) health assessment product.',
    descriptionZh: '知身健康评估产品的定价页。',
  },
];

export const OSS_HIGHLIGHTS = OSS_REPOS.filter((r) => r.highlight);
