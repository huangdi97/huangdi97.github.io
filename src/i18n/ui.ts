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

  'now.eyebrow': 'NOW',
  'now.updated': 'Updated',

  'work.eyebrow': 'Selected Work',
  'work.title': 'Selected Work',
  'work.lead':
    'Work whose state you can check yourself — public repositories, real artifacts, honest labels. Nothing here is a rendered mockup.',
  'work.all': 'View all projects',
  'work.case': 'View Case Study',
  'work.repo': 'Repository',
  'work.more': 'More Experiments',

  'background.eyebrow': 'Background',
  'background.intro':
    'Where the life-science training comes from, and why it still shapes how these systems get built.',

  'research.eyebrow': 'What I am exploring',
  'research.title': 'Research',
  'research.lead':
    'Five directions I keep returning to. Most are tied to code I have written; each page states what exists and what does not.',
  'research.question': 'Core question',
  'research.interests': 'Current interests',
  'research.projects': 'Related projects',
  'research.all': 'All research directions',
  'research.active': 'Active / Building',
  'research.concepts': 'Concepts / Exploring',
  'concept.notstarted': 'Not started',

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
  'oss.role': 'Role',
  'oss.role.flagship': 'Flagship',
  'oss.role.research': 'Research',
  'oss.role.agent-system': 'Agent System',
  'oss.role.tooling': 'Tooling',
  'oss.nolicense': 'No license detected',
  'oss.updated': 'Updated',
  'oss.snapshot': 'Metadata snapshot',

  'about.portraitAlt': 'Portrait of Hao Lei',
  'about.cta.title': 'About',
  'about.cta.body':
    'How I approach systems, what I am building, and where the work is going.',
  'about.cta.link': 'Read more',
  'about.context.eyebrow': 'A little more context',
  'about.context.line':
    'AI systems engineer with a life-science and computational biology background.',

  'meta.year': 'Year',
  'meta.status': 'Status',
  'meta.role': 'Role',
  'meta.category': 'Category',
  'meta.stack': 'Stack',
  'meta.publicCode': 'Public code',
  'meta.reality': 'Reality',
  'meta.what': 'What',
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
  'evidence.stateCount': 'Rows marked',
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
  'resume.experience': 'Experience',
  'resume.research': 'Research Experience',
  'resume.output': 'Research Output',
  'resume.opensource': 'Open Source',
  'resume.contact': 'Contact',
  'resume.downloads': 'Download',
  'resume.note':
    'This page is the resume. Print it from your browser (Ctrl/Cmd + P) for a clean single-column PDF.',
  'resume.download': 'Download PDF',

  'about.background': 'Where this comes from',

  'status.active': 'Active',
  'status.research': 'Research',
  'status.prototype': 'Prototype',
  'status.stable': 'Stable',
  'status.archived': 'Archived',

  'contact.viaGithub': 'Contact via GitHub',
  'contact.title': 'Contact',

  'footer.rights': 'All rights reserved.',
  'footer.built': 'Built with Astro. Static, no tracking.',

  'notfound.title': '404',
  'notfound.body': 'This page drifted outside the system.',
  'notfound.home': 'Back Home',

  'appearance.label': 'Appearance',
  'appearance.paper': 'Paper',
  'appearance.white': 'White',
  'appearance.night': 'Night',

  'artifacts.eyebrow': 'Selected Artifacts',
  'artifacts.title': 'Selected Artifacts',
  'artifacts.lead':
    'Repository structures, acceptance scripts, benchmark output and release reports — quoted from the public repositories. Nothing in this room was drawn to look like a product.',
  'artifacts.project': 'Project',
  'artifacts.type': 'Type',
  'artifacts.source': 'Source',
  'artifacts.date': 'Snapshot',
  'artifacts.expand': 'Enlarge artifact',
  'artifacts.close': 'Close enlarged view',
  'artifacts.viewSource': 'Open source artifact',
  'artifacts.footnote':
    'Every artifact here is quoted from a public repository. Where no screenshot exists, the repository artifact itself is shown instead of an invented one.',

  'mathbio.eyebrow': 'Mathematical Biology',
  'mathbio.title': 'Understanding living systems with mathematics',
  'mathbio.lead':
    'Biology gives observations. Mathematics gives structure. AI approximates the parts we cannot yet write down.',
  'mathbio.body':
    'A living system can be observed, but never read out completely. Mathematics supplies the language of state, change, probability and constraint; learned models cover what cannot be written as equations.',
  'mathbio.questions': 'Most of these problems reduce to three questions.',
  'mathbio.q1': 'What state are we in?',
  'mathbio.q2': 'Why did it change?',
  'mathbio.q3': 'Where would an intervention move it?',
  'mathbio.figureCaption':
    'One lens I keep returning to: observation, representation, dynamics, decision — then a new observation.',

  /* v1.6 homepage — the merged "Mathematics × Biology × AI" section. This is
     the section that answers "how do you read a problem?", so the copy is
     three short paragraphs and one figure, not a tour of every diagram. */
  'mbai.eyebrow': 'Mathematics × Biology × AI',
  'mbai.title': 'Living systems have state, change, noise and intervention.',
  'mbai.statement':
    'Living systems have state, change, noise and intervention. Mathematics supplies the structure. AI learns the parts that cannot be written down as an equation.',
  'mbai.body.1':
    'Biology supplies the observations. Mathematics supplies the structure that describes them: state, probability, dynamics and constraint.',
  'mbai.body.2':
    'AI learns the parts that cannot yet be written down as an equation.',
  'mbai.body.3': 'Most of the problems I work on reduce to the same three questions.',
  'mbai.equation.label': 'State transition',
  'mbai.equation.caption':
    'The current state, an action, the next state. A lens for framing an intervention, not a claim that any system here implements this expression.',

  /* v1.6 homepage — Research & Notes, a three-row compact view. */
  'rnotes.eyebrow': 'Research & Notes',
  'rnotes.title': 'Research & Notes',
  'rnotes.lead': 'What I am thinking about now — a direction, a note, a release.',
  'rnotes.all': 'All research directions',
  'rnotes.kind.direction': 'Research Direction',
  'rnotes.state.concept': 'Concept / Not Started',
  'rnotes.entryHint': 'Read the case study',
  'rnotes.snapshot': 'Compiled from the research and notes records',

  /* v1.6 homepage — the closing contact band. */
  'home.contact.eyebrow': 'About / Contact',
  'home.contact.line':
    'AI systems and agents, with a life-science and computational biology background.',
  'home.contact.more': 'More about how I work',

  'equation.eyebrow': 'Equation',
  'equation.label': 'Conceptual model',
  'equation.body':
    'A useful way to think about many biological interventions is as state transitions: given the current state and an action, what state comes next?',
  'equation.caption':
    'This is a lens for framing problems, not a claim that every system on this site implements this formula.',

  'notes.eyebrow': 'Lab Notes',
  'notes.title': 'Lab Notes',
  'notes.lead': 'Recent entries. Short by design — a log, not a blog.',
  'notes.empty': 'No entries yet.',

  'conceptual.notation': 'Conceptual notation',
  'conceptual.diagram': 'Conceptual diagram',
  'conceptual.representation': 'Conceptual representation',

  'a11y.diagram': 'System diagram',
  'a11y.external': 'opens in a new tab',
  'a11y.heroField':
    'Conceptual field: observation, representation, dynamics and decision, closed by a feedback loop that produces a new observation.',
  'a11y.conceptLoop':
    'Conceptual loop: a biological observation is encoded into a state, a dynamics model predicts the next state under an action, a decision selects the action, and the outcome is observed again.',
  'a11y.cellLandscape':
    'Conceptual cell state landscape: contour lines with a trajectory from an aged state toward a target state.',
  'a11y.expressionMatrix':
    'Conceptual gene-by-cell matrix: a grid of abstract expression intensities, not a real experiment.',
  'a11y.bioNetwork':
    'Conceptual network linking genes, pathways, phenotype and intervention with six nodes.',
  'a11y.phasePortrait':
    'Conceptual phase portrait: a vector field with two attractor basins and one state trajectory.',
  'a11y.formula': 'Formula',
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

  'now.eyebrow': '当前',
  'now.updated': '更新于',

  'work.eyebrow': '精选项目',
  'work.title': '精选项目',
  'work.lead':
    '可以自己打开核查的项目——公开仓库、真实产物、如实标注。这里没有为不存在的产品绘制的界面假图。',
  'work.all': '查看全部项目',
  'work.case': '查看案例',
  'work.repo': '代码仓库',
  'work.more': '更多实验',

  'background.eyebrow': '背景',
  'background.intro': '生命科学训练从何而来，以及它为何至今仍在影响这些系统的构建方式。',

  'research.eyebrow': '正在探索',
  'research.title': '研究方向',
  'research.lead': '五个持续投入的方向。多数对应我写过的代码；每个页面都会说明什么存在、什么不存在。',
  'research.question': '核心问题',
  'research.interests': '当前兴趣',
  'research.projects': '关联项目',
  'research.all': '查看全部研究方向',
  'research.active': '进行中 / 在构建',
  'research.concepts': '概念 / 在探索',
  'concept.notstarted': '尚未开始',

  'how.eyebrow': '从想法到系统',
  'how.title': '工作方式',
  'how.lead': '调用模型只是其中一环。真正的工作在它周围：问题定义、架构、评估，以及把它交付出去的工程纪律。',

  'oss.eyebrow': '开源',
  'oss.title': '开源与工程',
  'oss.lead': '同一账号下的公开仓库。语言、许可证与更新日期来自已签入的 GitHub 元数据——不显示 star 数，不做运行时 API 调用。',
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

  'about.portraitAlt': '郝磊肖像',
  'about.cta.title': '关于',
  'about.cta.body': '我如何构建系统、正在做什么，以及这些工作将走向哪里。',
  'about.cta.link': '了解更多',
  'about.context.eyebrow': '更多背景',
  'about.context.line':
    '具备生命科学与计算生物学背景的 AI 系统 / Agent 工程开发者。',

  'meta.year': '年份',
  'meta.status': '状态',
  'meta.role': '角色',
  'meta.category': '类别',
  'meta.stack': '技术栈',
  'meta.publicCode': '公开代码',
  'meta.reality': '实际状态',
  'meta.what': '是什么',
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
  'evidence.stateCount': '已标注条目',
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
  'resume.education': '教育经历',
  'resume.experience': '工作经历',
  'resume.research': '科研经历',
  'resume.output': '研究成果',
  'resume.opensource': '开源',
  'resume.contact': '联系',
  'resume.downloads': '下载',
  'resume.note': '本页即为简历。用浏览器打印（Ctrl/Cmd + P）即可得到干净的单栏 PDF。',
  'resume.download': '下载 PDF',

  'about.background': '来路',

  'status.active': '进行中',
  'status.research': '研究中',
  'status.prototype': '原型',
  'status.stable': '稳定',
  'status.archived': '已归档',

  'contact.viaGithub': '通过 GitHub 联系',
  'contact.title': '联系',

  'footer.rights': '保留所有权利。',
  'footer.built': '基于 Astro 构建。纯静态，无追踪脚本。',

  'notfound.title': '404',
  'notfound.body': '这个页面已经离开系统边界。',
  'notfound.home': '返回首页',

  'appearance.label': '外观',
  'appearance.paper': '暖纸',
  'appearance.white': '纯白',
  'appearance.night': '夜色',

  'artifacts.eyebrow': '精选实物',
  'artifacts.title': '实验台',
  'artifacts.lead':
    '仓库结构、验收脚本、基准输出与发布报告——均引用自公开仓库。这里没有任何为“看起来像个产品”而绘制的图。',
  'artifacts.project': '项目',
  'artifacts.type': '类型',
  'artifacts.source': '来源',
  'artifacts.date': '快照',
  'artifacts.expand': '放大查看',
  'artifacts.close': '关闭大图',
  'artifacts.viewSource': '打开来源原件',
  'artifacts.footnote':
    '此处每件实物都引用自公开仓库。没有截图的地方，就展示仓库本身的产物，而不是编一张图。',

  'mathbio.eyebrow': '数学 × 生物',
  'mathbio.title': '用数学理解生命系统',
  'mathbio.lead': '生物提供观测。数学提供结构。AI 逼近那些我们还写不下来的部分。',
  'mathbio.body':
    '生命系统可以被观察，但无法被完整读取。数学提供状态、变化、概率与约束的语言；学习模型补足那些无法写成方程的部分。',
  'mathbio.questions': '这些问题大多可以归结为三个提问。',
  'mathbio.q1': '当前处于什么状态？',
  'mathbio.q2': '它为什么变成这样？',
  'mathbio.q3': '一次干预会把它带向哪里？',
  'mathbio.figureCaption':
    '一个我反复使用的视角：观测、表征、动力学、决策，然后回到新的观测。',

  /* v1.6 首页 —— 合并后的「数学 × 生物 × AI」板块。这个板块回答的是
     「你如何理解一个问题」，所以是三段短文加一张主图，而不是图集巡览。 */
  'mbai.eyebrow': '数学 × 生物 × AI',
  'mbai.title': '生命系统具有状态、变化、噪声与干预。',
  'mbai.statement':
    '生命系统有状态、变化、噪声与干预。数学提供结构。AI 学习那些无法被完整写成方程的部分。',
  'mbai.body.1': '生物提供观测；数学提供描述它们的结构：状态、概率、动力学和约束。',
  'mbai.body.2': 'AI 帮助学习那些无法被完整写成方程的部分。',
  'mbai.body.3': '我经常把问题重新表达为同样的三个提问。',
  'mbai.equation.label': '状态转移',
  'mbai.equation.caption':
    '当前状态、一个动作、下一个状态。这是用于界定干预的视角，不是在声称本站任何系统都实现了这个表达式。',

  /* v1.6 首页 —— 研究与札记，三行精简视图。 */
  'rnotes.eyebrow': '研究与札记',
  'rnotes.title': '研究与札记',
  'rnotes.lead': '当前在思考什么——一个方向、一条札记、一次发布。',
  'rnotes.all': '全部研究方向',
  'rnotes.kind.direction': '研究方向',
  'rnotes.state.concept': '概念 / 尚未开始',
  'rnotes.entryHint': '查看案例',
  'rnotes.snapshot': '整理自研究方向与札记记录',

  /* v1.6 首页 —— 收尾的联系板块。 */
  'home.contact.eyebrow': '关于 / 联系',
  'home.contact.line': 'AI 系统与智能体，来自生命科学与计算生物学背景。',
  'home.contact.more': '进一步了解我的工作方式',

  'equation.eyebrow': '公式',
  'equation.label': '概念模型',
  'equation.body':
    '理解许多生物干预的一种有效方式，是把它看作状态转移：给定当前状态与一个动作，下一个状态是什么？',
  'equation.caption':
    '这是用于界定问题的视角，不是在声称本站每个系统都实现了这个公式。',

  'notes.eyebrow': '研究札记',
  'notes.title': '研究札记',
  'notes.lead': '近期的记录。刻意写得短——是日志，不是博客。',
  'notes.empty': '暂无条目。',

  'conceptual.notation': '概念记法',
  'conceptual.diagram': '概念示意图',
  'conceptual.representation': '概念化表达',

  'a11y.diagram': '系统架构图',
  'a11y.external': '在新标签页打开',
  'a11y.heroField': '概念系统场：观测、表征、动力学与决策，由一条回到新观测的反馈回路闭合。',
  'a11y.conceptLoop':
    '概念闭环：生物观测被编码为状态，动力学模型预测某动作下的下一状态，决策选择动作，结果再次被观测。',
  'a11y.cellLandscape': '概念性细胞状态景观：等高线上一条从衰老态指向目标态的轨迹。',
  'a11y.expressionMatrix': '概念性基因 × 细胞矩阵：抽象表达强度的网格，不是真实实验数据。',
  'a11y.bioNetwork': '概念性网络：基因、通路、表型与干预，共六个节点。',
  'a11y.phasePortrait': '概念性相图：带两个吸引子盆地与一条状态轨迹的向量场。',
  'a11y.formula': '公式',
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
