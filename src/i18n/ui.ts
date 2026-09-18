/**
 * UI string table. English is the default locale; Simplified Chinese is
 * served under /zh. Chinese entries are written as natural Chinese, not
 * as literal translations — product names stay in their original form.
 */

export const LANGS = ['en', 'zh'] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'en';

type Dict = Record<string, string>;

const en = {
  'nav.work': 'Work',
  'nav.research': 'Research',
  'nav.about': 'About',
  'nav.resume': 'Resume',
  'nav.menu': 'Menu',
  'nav.close': 'Close',
  'nav.primary': 'Primary',
  'nav.github': 'GitHub profile',
  'nav.language': 'Language',
  'nav.skip': 'Skip to content',

  'lang.switch': '中文',
  'lang.name': 'English',

  'hero.eyebrow': 'Personal AI Lab',
  'hero.title': 'HAO LEI',
  'hero.subtitle': 'AI × Life Science × Agents',
  'hero.statement':
    'Building intelligent systems for discovery, health, simulation and autonomous work.',
  'hero.support':
    'I explore how AI systems can reason, simulate, coordinate and act across scientific and real-world workflows.',
  'hero.cta.work': 'Explore Work',
  'hero.cta.github': 'GitHub',
  'hero.cta.resume': 'Resume',
  'hero.capabilities': 'Capabilities',

  'work.eyebrow': 'Selected Work',
  'work.title': 'Selected Work',
  'work.lead':
    'Five projects at five different levels of completion — from a public MVP with tests to a written research program. Each page says which it is.',
  'work.all': 'View all projects',
  'work.case': 'View Case Study',
  'work.repo': 'Repository',
  'work.more': 'More Experiments',

  'research.eyebrow': 'What I am exploring',
  'research.title': 'Research',
  'research.lead':
    'Five directions I keep returning to. Most are tied to code I have written; each page states what exists and what does not.',
  'research.question': 'Core question',
  'research.interests': 'Current interests',
  'research.projects': 'Related projects',
  'research.all': 'All research directions',

  'how.eyebrow': 'From idea to system',
  'how.title': 'How I Work',
  'how.lead':
    'Model calls are the easy part. The work is everything around them: framing, architecture, evaluation and the discipline to ship.',

  'oss.eyebrow': 'Open Source',
  'oss.title': 'Open Source & Engineering',
  'oss.lead':
    'Public repositories under the same account. Language, license and update date are checked in from GitHub metadata — no star counts, no runtime API calls.',
  'oss.all': 'View GitHub profile',
  'oss.language': 'Language',
  'oss.license': 'License',
  'oss.nolicense': 'No license detected',
  'oss.updated': 'Updated',
  'oss.snapshot': 'Metadata snapshot',

  'about.portraitAlt': 'Portrait of Hao Lei',
  'about.cta.title': 'About',
  'about.cta.body':
    'How I approach systems, what I am building, and where the work is going.',
  'about.cta.link': 'Read more',

  'meta.year': 'Year',
  'meta.status': 'Status',
  'meta.role': 'Role',
  'meta.category': 'Category',
  'meta.stack': 'Stack',
  'meta.publicCode': 'Public code',
  'meta.reality': 'Reality',
  'meta.what': 'What',

  'publiccode.open': 'Public repository',
  'publiccode.none': 'None — nothing published',

  'evidence.title': 'Evidence',
  'evidence.reality': 'Implementation status',
  'evidence.lead':
    'What exists today, and how you would check it. Nothing below is a rendered mockup of something that does not exist.',
  'evidence.source': 'Source',
  'evidence.view': 'Open source artifact',
  'evidence.kind.tree': 'Repository',
  'evidence.kind.terminal': 'Command / Output',
  'evidence.kind.list': 'Quoted',
  'evidence.kind.note': 'Note',
  'evidence.kind.screenshot': 'Screenshot',
  'evidence.legend': 'How to read these states',
  'evidence.expand': 'Enlarge image',
  'evidence.close': 'Close enlarged view',
  'evidence.tableCaption':
    'States describe what a visitor can verify, not how finished something feels.',
  'evidence.stateCount': 'Rows marked',

  'reality.built': 'Built',
  'reality.validated': 'Validated',
  'reality.partial': 'Partial',
  'reality.prototype': 'Prototype',
  'reality.designed': 'Designed',
  'reality.planned': 'Planned',
  'reality.not-public': 'Not public',
  'reality.legend.built': 'Implemented in code. Says nothing about how good it is.',
  'reality.legend.validated': 'Built and checked against a specific artifact we can point at.',
  'reality.legend.partial': 'Present but incomplete, or opened only partially.',
  'reality.legend.prototype': 'Runs end to end on toy or sample data. Not a production system.',
  'reality.legend.designed': 'Specified — architecture, contracts and scope exist in writing.',
  'reality.legend.planned': 'Identified for future work. Nothing to inspect yet.',
  'reality.legend.not-public': 'Reported to exist, but no public artifact can be checked.',

  'project.overview': 'Overview',
  'project.next': 'Next project',
  'project.back': 'All projects',
  'project.links': 'Links',
  'project.contents': 'Contents',
  'project.noRepo': 'No public repository',

  'filter.all': 'All',
  'filter.label': 'Filter projects',
  'filter.empty': 'No projects in this category yet.',
  'filter.count': 'projects',

  'resume.print': 'Print / Save as PDF',
  'resume.profile': 'Profile',
  'resume.focus': 'Focus',
  'resume.projects': 'Selected Projects',
  'resume.technical': 'Technical Areas',
  'resume.education': 'Education',
  'resume.opensource': 'Open Source',
  'resume.contact': 'Contact',
  'resume.note':
    'This page is the resume. Print it from your browser (Ctrl/Cmd + P) for a clean single-column PDF.',
  'resume.download': 'Download PDF',

  'status.active': 'Active',
  'status.research': 'Research',
  'status.prototype': 'Prototype',
  'status.stable': 'Stable',
  'status.archived': 'Archived',

  'contact.viaGithub': 'Contact via GitHub',

  'footer.rights': 'All rights reserved.',
  'footer.built': 'Built with Astro. Static, no tracking.',

  'notfound.title': '404',
  'notfound.body': 'This page drifted outside the system.',
  'notfound.home': 'Back Home',

  'a11y.diagram': 'System diagram',
  'a11y.external': 'opens in a new tab',
} satisfies Dict;

const zh: Dict = {
  'nav.work': '项目',
  'nav.research': '研究',
  'nav.about': '关于',
  'nav.resume': '简历',
  'nav.menu': '菜单',
  'nav.close': '关闭',
  'nav.primary': '主导航',
  'nav.github': 'GitHub 主页',
  'nav.language': '语言',
  'nav.skip': '跳到主要内容',

  'lang.switch': 'EN',
  'lang.name': '中文',

  'hero.eyebrow': '个人 AI 实验室',
  'hero.title': '郝磊',
  'hero.subtitle': 'AI × 生命科学 × 智能体',
  'hero.statement': '构建面向科学发现、数字健康、仿真与自主工作的智能系统。',
  'hero.support': '关注 AI 如何在科学与真实世界流程中完成推理、模拟、协作与行动。',
  'hero.cta.work': '查看项目',
  'hero.cta.github': 'GitHub',
  'hero.cta.resume': '简历',
  'hero.capabilities': '能力方向',

  'work.eyebrow': '精选项目',
  'work.title': '精选项目',
  'work.lead': '五个项目处于五个不同的完成度——从带测试的公开 MVP，到只有成文纲领的研究计划。每个页面都会说明它属于哪一种。',
  'work.all': '查看全部项目',
  'work.case': '查看案例',
  'work.repo': '代码仓库',
  'work.more': '更多实验',

  'research.eyebrow': '正在探索',
  'research.title': '研究方向',
  'research.lead': '五个持续投入的方向。多数对应我写过的代码；每个页面都会说明什么存在、什么不存在。',
  'research.question': '核心问题',
  'research.interests': '当前兴趣',
  'research.projects': '关联项目',
  'research.all': '查看全部研究方向',

  'how.eyebrow': '从想法到系统',
  'how.title': '工作方式',
  'how.lead': '调用模型只是其中一环。真正的工作在它周围：问题定义、架构、评估，以及把它交付出去的工程纪律。',

  'oss.eyebrow': '开源',
  'oss.title': '开源与工程',
  'oss.lead': '同一账号下的公开仓库。语言、许可证与更新日期来自已签入的 GitHub 元数据——不显示 star 数，不做运行时 API 调用。',
  'oss.all': '查看 GitHub 主页',
  'oss.language': '语言',
  'oss.license': '许可证',
  'oss.nolicense': '未检测到许可证',
  'oss.updated': '更新于',
  'oss.snapshot': '元数据快照',

  'about.portraitAlt': '郝磊肖像',
  'about.cta.title': '关于',
  'about.cta.body': '我如何构建系统、正在做什么，以及这些工作将走向哪里。',
  'about.cta.link': '了解更多',

  'meta.year': '年份',
  'meta.status': '状态',
  'meta.role': '角色',
  'meta.category': '类别',
  'meta.stack': '技术栈',
  'meta.publicCode': '公开代码',
  'meta.reality': '实际状态',
  'meta.what': '是什么',

  'publiccode.open': '公开仓库',
  'publiccode.none': '无 — 未公开发布',

  'evidence.title': '证据',
  'evidence.reality': '实现状态',
  'evidence.lead': '当前实际存在什么，以及如何核验。以下内容均不是为不存在的产品绘制的界面假图。',
  'evidence.source': '来源',
  'evidence.view': '打开来源原件',
  'evidence.kind.tree': '仓库结构',
  'evidence.kind.terminal': '命令与输出',
  'evidence.kind.list': '引用条目',
  'evidence.kind.note': '说明',
  'evidence.kind.screenshot': '截图',
  'evidence.legend': '如何理解这些状态',
  'evidence.expand': '放大图片',
  'evidence.close': '关闭大图',
  'evidence.tableCaption': '状态描述的是访问者能够核实的内容，而不是"看起来完成了多少"。',
  'evidence.stateCount': '已标注条目',

  'reality.built': '已实现',
  'reality.validated': '已验证',
  'reality.partial': '部分',
  'reality.prototype': '原型',
  'reality.designed': '已设计',
  'reality.planned': '计划中',
  'reality.not-public': '未公开',
  'reality.legend.built': '代码中已实现。不代表质量已被验证。',
  'reality.legend.validated': '已实现，并有可指明的产出物作为核验依据。',
  'reality.legend.partial': '存在但不完整，或仅部分开放。',
  'reality.legend.prototype': '可在 toy 或样例数据上端到端运行，不是生产系统。',
  'reality.legend.designed': '已有书面定义——架构、契约与范围成文存在。',
  'reality.legend.planned': '已列为后续工作，目前无可检视内容。',
  'reality.legend.not-public': '据称存在，但没有任何公开内容可供核实。',

  'project.overview': '概览',
  'project.next': '下一个项目',
  'project.back': '全部项目',
  'project.links': '链接',
  'project.contents': '目录',
  'project.noRepo': '暂无公开仓库',

  'filter.all': '全部',
  'filter.label': '筛选项目',
  'filter.empty': '该分类下暂无项目。',
  'filter.count': '个项目',

  'resume.print': '打印 / 导出 PDF',
  'resume.profile': '简介',
  'resume.focus': '方向',
  'resume.projects': '精选项目',
  'resume.technical': '技术领域',
  'resume.education': '教育',
  'resume.opensource': '开源',
  'resume.contact': '联系',
  'resume.note': '本页即为简历。用浏览器打印（Ctrl/Cmd + P）即可得到干净的单栏 PDF。',
  'resume.download': '下载 PDF',

  'status.active': '进行中',
  'status.research': '研究中',
  'status.prototype': '原型',
  'status.stable': '稳定',
  'status.archived': '已归档',

  'contact.viaGithub': '通过 GitHub 联系',

  'footer.rights': '保留所有权利。',
  'footer.built': '基于 Astro 构建。纯静态，无追踪脚本。',

  'notfound.title': '404',
  'notfound.body': '这个页面已经离开系统边界。',
  'notfound.home': '返回首页',

  'a11y.diagram': '系统架构图',
  'a11y.external': '在新标签页打开',
};

const dicts: Record<Lang, Dict> = { en, zh };

export function t(lang: Lang, key: keyof typeof en | string): string {
  return dicts[lang][key] ?? dicts.en[key] ?? key;
}

export function useT(lang: Lang) {
  return (key: keyof typeof en | string): string => t(lang, key);
}

/**
 * Maps a source path onto one locale: `/projects/wennian` <-> `/zh/projects/wennian`.
 *
 * Internal links match the canonical URLs the build emits (directory format,
 * trailing slash), so navigation never depends on a host redirect.
 */
export function localizedPath(lang: Lang, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  const withSlash = clean.endsWith('/') ? clean : `${clean}/`;
  if (lang === 'en') return withSlash === '/' ? '/' : withSlash;
  const zhBase = clean === '/' ? '/zh' : `/zh${clean}`;
  return `${zhBase}/`.replace(/\/{2,}$/, '/');
}

/** Strip (or add) the /zh prefix so a link can point at the other locale. */
export function switchLocalePath(currentPath: string, target: Lang): string {
  const path = currentPath.replace(/\/+$/, '');

  // The root not-found page is emitted as `404.html`, not as a directory, so
  // it is the one path that does not have a trailing-slash counterpart.
  if (path === '/404') return '/zh/404/';
  if (path === '/zh/404') return '/404.html';

  if (target === 'en') {
    const stripped = path === '/zh' ? '' : path.replace(/^\/zh(?=\/|$)/, '');
    return stripped ? `${stripped}/` : '/';
  }
  return path === '' || path === '/' ? '/zh/' : `/zh${path}/`;
}
