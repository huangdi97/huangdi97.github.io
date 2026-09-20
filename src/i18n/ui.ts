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

  'nav.language': 'Language',
  'nav.skip': 'Skip to content',

  'lang.switch': '中文',

  'hero.title': 'HAO LEI',
  'hero.subtitle': 'AI × Life Science × Agents',
  'hero.statement':
    'Building intelligent systems for discovery, health, simulation and autonomous work.',
  'hero.cta.work': 'Explore Work',
  'hero.cta.github': 'GitHub',
  'hero.cta.resume': 'Resume',

  'work.eyebrow': 'Selected Work',
  'work.title': 'Selected Work',

  'work.all': 'View all projects',

  /* v2.0 homepage row link (§14): one primary link, and it points at the
     project, not at "a case study". The case-study label stays for /projects. */
  'work.project': 'View project',
  'work.repo': 'Repository',

  /* v2.1 (§10–§14): /projects is a curated directory of public entries, not a
     filterable catalogue. The lead says how to read the list, not how much
     there is — and since v2.2.1 (§35) it no longer promises to say "what it is
     for", because the entry no longer carries a paragraph saying so. */
  'work.public.lead':
    'A short, curated list. Each entry says what the project is and how much of it is public today.',
  'work.other': 'Other work',
  'work.other.lead': 'Specification, architecture and concept work — nothing public to open yet.',

  /* v2.1 (§15–§16): a project page is a public case study, not a build log. */
  'case.eyebrow': 'Public case study',

  'research.eyebrow': 'What I am exploring',

  /* §15–§16: the old lead explained the page's own editorial rules — "Five
     directions I keep returning to. Each one is stated as a question, not as a
     method." A visitor does not need to be told how many directions there are,
     or why the page withholds methods. This says what the work is about. */
  'research.lead':
    'Exploring long-term questions across biological systems, computational models and intelligent systems.',

  'research.projects': 'Related projects',

  'research.active': 'Active / Building',
  'research.concepts': 'Concepts / Exploring',

  'oss.eyebrow': 'Open Source',
  'oss.title': 'Open Source & Engineering',
  /* §48: v1.6 explained the implementation — where the metadata came from and
     what the build does not call. That is a note to a maintainer. One line. */
  'oss.lead': 'Public repositories and selected open-source work.',
  'oss.all': 'View GitHub profile',
  'oss.language': 'Language',
  'oss.license': 'License',
  'oss.role': 'Role',
  'oss.role.flagship': 'Flagship',
  'oss.role.research': 'Research',
  'oss.role.agent-system': 'Agent System',
  'oss.role.tooling': 'Tooling',
  'oss.nolicense': 'No license detected',
  'oss.updated': 'Updated',
  'oss.snapshot': 'Metadata snapshot',

  'meta.year': 'Year',
  'meta.status': 'Status',
  'meta.role': 'Role',
  'meta.category': 'Category',
  'meta.stack': 'Stack',
  'meta.publicCode': 'Public code',
  'meta.reality': 'Reality',

  'meta.snapshot': 'Evidence snapshot',

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

  'evidence.snapshotNote':
    'Current product development may be ahead of the latest publicly inspectable repository snapshot.',

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

  'project.next': 'Next project',
  'project.back': 'All projects',

  'project.noRepo': 'No public repository',

  'resume.print': 'Print / Save as PDF',
  'resume.profile': 'Profile',
  'resume.focus': 'Focus',
  'resume.projects': 'Selected Projects',
  'resume.technical': 'Technical Areas',
  'resume.education': 'Education',
  'resume.experience': 'Experience',
  'resume.research': 'Research Experience',
  'resume.output': 'Research Output',
  'resume.opensource': 'Open Source',
  'resume.contact': 'Contact',
  'resume.downloads': 'Download',
  'resume.note':
    'This page is the resume. Print it from your browser (Ctrl/Cmd + P) for a clean single-column PDF.',

  'footer.rights': 'All rights reserved.',

  'notfound.title': '404',
  'notfound.body': 'This page drifted outside the system.',
  'notfound.home': 'Back Home',

  'appearance.label': 'Appearance',

  'artifacts.eyebrow': 'Selected Public Work',
  'artifacts.title': 'Selected Public Work',
  'artifacts.lead':
    'Three items, each quoted from a public repository and each with the file it was read from. Nothing here was drawn to look like a product.',

  'artifacts.source': 'Source',
  'artifacts.date': 'Snapshot',
  'artifacts.all': 'View all on GitHub',

  'artifacts.footnote':
    'Every item is quoted from a public repository, with its source file and the day it was read. Where no screenshot exists, the repository file itself is cited rather than an invented one.',

  /* v1.6 homepage — the merged "Mathematics × Biology × AI" section. This is
     the section that answers "how do you read a problem?", so the copy is
     three short paragraphs and one figure, not a tour of every diagram. */

  /* v1.6 homepage — Research & Notes, a three-row compact view. */

  /* v1.6 homepage — the closing contact band.
     v2.0 (§29) reduces the band to a name, this one positioning line and four
     links, so the eyebrow and the /about link are no longer rendered here. */

  'home.contact.line': 'Life Science × Computational Biology × AI Systems',

  'notes.eyebrow': 'Lab Notes',
  'notes.title': 'Lab Notes',
  'notes.lead': 'Short notes on what changed in the public record. No roadmap, no internal design.',
  'notes.empty': 'No entries yet.',

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

  'nav.language': '语言',
  'nav.skip': '跳到主要内容',

  'lang.switch': 'EN',

  'hero.title': '郝磊',
  'hero.subtitle': 'AI × 生命科学 × 智能体',
  'hero.statement': '构建面向科学发现、数字健康、仿真与自主工作的智能系统。',
  'hero.cta.work': '查看项目',
  'hero.cta.github': 'GitHub',
  'hero.cta.resume': '简历',

  'work.eyebrow': '精选项目',
  'work.title': '精选项目',

  'work.all': '查看全部项目',

  /* v2.0 首页项目条目主链接（§14）：只保留一个主链接，指向项目本身。 */
  'work.project': '查看项目',
  'work.repo': '代码仓库',

  /* v2.1（§10–§14）：/projects 是精选公开条目目录，不是可筛选的全量清单。 */
  'work.public.lead':
    '一份简短的精选清单。每条只说明：它是什么、用来做什么、今天能打开多少。',
  'work.other': '其他工作',
  'work.other.lead': '规范、架构与概念设计——目前没有可打开的公开内容。',

  /* v2.1（§15–§16）：项目页是公开案例，不是构建日志。 */
  'case.eyebrow': '公开案例',

  'research.eyebrow': '正在探索',

  /* §15–§16：原句是「五个持续投入的方向。每个方向只给出问题本身，不展开方法。」
     访客既不需要知道方向的数量，也不需要被告知本站为什么不展开方法。 */
  'research.lead': '探索生命系统、计算模型与智能系统之间值得长期研究的问题。',

  'research.projects': '关联项目',

  'research.active': '进行中 / 在构建',
  'research.concepts': '概念 / 在探索',

  'oss.eyebrow': '开源',
  'oss.title': '开源与工程',
  /* §48：原句在向访客解释实现细节，那是写给维护者的。收成一句。 */
  'oss.lead': '公开仓库与部分开源工作。',
  'oss.all': '查看 GitHub 主页',
  'oss.language': '语言',
  'oss.license': '许可证',
  'oss.role': '定位',
  'oss.role.flagship': '主项目',
  'oss.role.research': '研究',
  'oss.role.agent-system': '智能体系统',
  'oss.role.tooling': '工具',
  'oss.nolicense': '未检测到许可证',
  'oss.updated': '更新于',
  'oss.snapshot': '元数据快照',

  'meta.year': '年份',
  'meta.status': '状态',
  'meta.role': '角色',
  'meta.category': '类别',
  'meta.stack': '技术栈',
  'meta.publicCode': '公开代码',
  'meta.reality': '实际状态',

  'meta.snapshot': '证据快照',

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

  'evidence.snapshotNote': '当前产品研发进度可能领先于公开可核验仓库快照。',

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

  'project.next': '下一个项目',
  'project.back': '全部项目',

  'project.noRepo': '暂无公开仓库',

  'resume.print': '打印 / 导出 PDF',
  'resume.profile': '简介',
  'resume.focus': '方向',
  'resume.projects': '精选项目',
  'resume.technical': '技术领域',
  'resume.education': '教育经历',
  'resume.experience': '工作经历',
  'resume.research': '科研经历',
  'resume.output': '研究成果',
  'resume.opensource': '开源',
  'resume.contact': '联系',
  'resume.downloads': '下载',
  'resume.note': '本页即为简历。用浏览器打印（Ctrl/Cmd + P）即可得到干净的单栏 PDF。',

  'footer.rights': '保留所有权利。',

  'notfound.title': '404',
  'notfound.body': '这个页面已经离开系统边界。',
  'notfound.home': '返回首页',

  'appearance.label': '外观',

  'artifacts.eyebrow': '公开成果精选',
  'artifacts.title': '公开成果精选',
  'artifacts.lead':
    '三项，均引用自公开仓库，并注明读取的文件。这里没有任何为「看起来像个产品」而绘制的图。',

  'artifacts.source': '来源',
  'artifacts.date': '快照',
  'artifacts.all': '在 GitHub 查看全部',

  'artifacts.footnote':
    '每一项都引用自公开仓库，并给出源文件与读取日期。没有截图的地方，就引用仓库里的文件本身，而不是编一张图。',

  /* v1.6 首页 —— 合并后的「数学 × 生物 × AI」板块。这个板块回答的是
     「你如何理解一个问题」，所以是三段短文加一张主图，而不是图集巡览。 */

  /* v1.6 首页 —— 研究与札记，三行精简视图。 */

  /* v1.6 首页 —— 收尾的联系板块。
     v2.0（§29）把这一块收束为姓名、这一行定位与四个链接，因此 eyebrow 与
     /about 链接不再在首页渲染。 */

  'home.contact.line': '生命科学 × 计算生物学 × AI 系统',

  'notes.eyebrow': '研究札记',
  'notes.title': '研究札记',
  'notes.lead': '关于公开记录变化的简短札记。不含路线图，不含内部设计。',
  'notes.empty': '暂无条目。',

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

  // Strip the locale prefix once, then re-apply the target one. Doing it this
  // way keeps the helper idempotent: asking for `zh` from a `/zh/...` page
  // returns the same page instead of `/zh/zh/...`.
  const stripped = path === '/zh' ? '' : path.replace(/^\/zh(?=\/|$)/, '');

  if (target === 'en') return stripped ? `${stripped}/` : '/';
  return stripped ? `/zh${stripped}/` : '/zh/';
}
