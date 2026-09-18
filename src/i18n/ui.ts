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
    'Five systems, each built end to end: problem framing, architecture, implementation and evaluation.',
  'work.all': 'View all projects',
  'work.case': 'View Case Study',
  'work.repo': 'Repository',
  'work.more': 'More Experiments',

  'research.eyebrow': 'What I am exploring',
  'research.title': 'Research',
  'research.lead':
    'Five directions I keep returning to. Each one is tied to something I have actually built.',
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
  'oss.lead': 'Public repositories under the same account. Language and status as GitHub reports.',
  'oss.all': 'View GitHub profile',
  'oss.updated': 'Public',

  'about.cta.title': 'About',
  'about.cta.body':
    'How I approach systems, what I am building, and where the work is going.',
  'about.cta.link': 'Read more',

  'meta.year': 'Year',
  'meta.status': 'Status',
  'meta.role': 'Role',
  'meta.category': 'Category',
  'meta.stack': 'Stack',

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

  'resume.print': 'Download / Print Resume',
  'resume.printing': 'Print',
  'resume.profile': 'Profile',
  'resume.focus': 'Focus',
  'resume.projects': 'Selected Projects',
  'resume.technical': 'Technical Areas',
  'resume.education': 'Education',
  'resume.opensource': 'Open Source',
  'resume.contact': 'Contact',
  'resume.note':
    'Print this page to PDF from your browser (Ctrl/Cmd + P) for a single-page-friendly resume.',
  'resume.notlisted': 'Not listed — no verified record.',

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
  'work.lead': '五个端到端构建的系统：问题定义、架构设计、工程实现与验证评估。',
  'work.all': '查看全部项目',
  'work.case': '查看案例',
  'work.repo': '代码仓库',
  'work.more': '更多实验',

  'research.eyebrow': '正在探索',
  'research.title': '研究方向',
  'research.lead': '五个持续投入的方向，每一个都对应真实构建过的系统。',
  'research.question': '核心问题',
  'research.interests': '当前兴趣',
  'research.projects': '关联项目',
  'research.all': '查看全部研究方向',

  'how.eyebrow': '从想法到系统',
  'how.title': '工作方式',
  'how.lead': '调用模型只是其中一环。真正的工作在它周围：问题定义、架构、评估，以及把它交付出去的工程纪律。',

  'oss.eyebrow': '开源',
  'oss.title': '开源与工程',
  'oss.lead': '同一账号下的公开仓库。语言与状态以 GitHub 为准。',
  'oss.all': '查看 GitHub 主页',
  'oss.updated': '公开',

  'about.cta.title': '关于',
  'about.cta.body': '我如何构建系统、正在做什么，以及这些工作将走向哪里。',
  'about.cta.link': '了解更多',

  'meta.year': '年份',
  'meta.status': '状态',
  'meta.role': '角色',
  'meta.category': '类别',
  'meta.stack': '技术栈',

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

  'resume.print': '下载 / 打印简历',
  'resume.printing': '打印',
  'resume.profile': '简介',
  'resume.focus': '方向',
  'resume.projects': '精选项目',
  'resume.technical': '技术领域',
  'resume.education': '教育',
  'resume.opensource': '开源',
  'resume.contact': '联系',
  'resume.note': '使用浏览器打印本页（Ctrl/Cmd + P）即可导出 PDF 版简历。',
  'resume.notlisted': '未列出 — 无已核实记录。',

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
