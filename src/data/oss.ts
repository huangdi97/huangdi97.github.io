/**
 * Public repositories, captured statically at build time.
 *
 * No GitHub API call is made during build. Every entry below was verified
 * against the live GitHub account before being written. If a repository is
 * private, unconfirmed or renamed, it is simply not listed here — the site
 * never invents a link.
 */

export type OssRepo = {
  name: string;
  url: string;
  language: string | null;
  descriptionEn: string;
  descriptionZh: string;
  /** Shown on the home page open-source strip. */
  highlight?: boolean;
};

export const OSS_REPOS: OssRepo[] = [
  {
    name: 'WenNian',
    url: 'https://github.com/huangdi97/WenNian',
    language: 'Python',
    descriptionEn: 'Aging-intervention decision engine: multi-clock assessment, structured health interview, white-label reporting.',
    descriptionZh: '衰老干预决策引擎：多时钟衰老评估、结构化健康访谈、白标报告生成。',
    highlight: true,
  },
  {
    name: 'HyCell-JEPA',
    url: 'https://github.com/huangdi97/HyCell-JEPA',
    language: 'Python',
    descriptionEn: 'Cellular world-model prototype: compact belief-state transitions, verifiers, planners and real-matrix smoke validation.',
    descriptionZh: '细胞世界模型原型：紧凑信念状态转移、校验器、规划器与真实矩阵冒烟验证。',
    highlight: true,
  },
  {
    name: 'BioPulse',
    url: 'https://github.com/huangdi97/BioPulse',
    language: 'Python',
    descriptionEn: 'Agent-native workspace for life-science workflows.',
    descriptionZh: '面向生命科学工作流的 Agent-native 工作台。',
    highlight: true,
  },
  {
    name: 'wanxiang-world',
    url: 'https://github.com/huangdi97/wanxiang-world',
    language: 'Python',
    descriptionEn: 'Semantic persistent open-ended co-evolutionary world OS.',
    descriptionZh: '语义持久化、开放式协同演化的世界操作系统。',
    highlight: true,
  },
  {
    name: 'morn',
    url: 'https://github.com/huangdi97/morn',
    language: 'Rust',
    descriptionEn: 'Systems-level operating environment written in Rust.',
    descriptionZh: '使用 Rust 编写的系统级运行环境。',
  },
  {
    name: 'mdns-scanner',
    url: 'https://github.com/huangdi97/mdns-scanner',
    language: 'Go',
    descriptionEn: 'Local network service discovery scanner.',
    descriptionZh: '本地网络服务发现扫描工具。',
  },
  {
    name: 'zhishen-pricing',
    url: 'https://github.com/huangdi97/zhishen-pricing',
    language: 'HTML',
    descriptionEn: 'Pricing page for the 知身 (ZhiShen) health assessment product.',
    descriptionZh: '知身健康评估产品的定价页。',
  },
];

export const OSS_HIGHLIGHTS = OSS_REPOS.filter((r) => r.highlight);
