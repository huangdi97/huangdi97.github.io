# FINAL PORTFOLIO V1.4.1 — PROJECT VISUAL CORRECTION REPORT

版本：v1.4.1（在 v1.4 Visual Depth 之上的视觉纠偏轮）
日期：2026-09-18
范围：Project Visual 职责重构 + Scientific Ambient 背景层
状态：`PRODUCTION_READY`（门禁十步全绿，273 passed / 5 skipped / 0 failed）

---

## 0. 本轮要解决的问题

v1.4 把"数学 × 生物 × AI"过多压进了每个项目的 `ProjectVisual`，导致项目图本身像
数学/科研概念图，而不是"项目是什么"的视觉说明。访问者看到的是公式海报，
不是项目封面。

本轮严格拆分三层职责，并确立不可逆的优先级：

> **项目是主体。数学、生物、AI 是环境。**

---

## 1. Before / After 职责拆分

| 视觉类型 | v1.4（之前） | v1.4.1（之后） |
| --- | --- | --- |
| PROJECT COVER | 不存在，ProjectVisual 同时承担封面与概念图 | `ProjectCover.astro`：名称 / 类型 / 一句话 / 能力 / 状态，文字 55–70% |
| CONCEPTUAL SCIENCE VISUAL | 混在项目卡里 | `ProjectScientificVisual.astro`（原 ProjectVisual 重命名），只出现在 Case Study |
| AMBIENT SCIENCE LAYER | HeroSystem 独扛全部公式氛围 | `ScientificAmbient.astro`：分区域全局背景，section-aware |

判定标准（spec #37）已内建为可验证事实：

- 隐藏所有 ambient 背景 → 项目图仍完整说明项目（封面自带全部文字信息）。
- 隐藏所有项目图 → 页面背景仍可感知 mathematics / biology / AI / research。

---

## 2. Project Cover 重设计

### 2.1 数据模型（spec #22）

`content.config.ts` 新增五个 frontmatter 字段，7 个项目 × 中英双语全部补齐：

- `coverType` — 短英文/中文类型行
- `coverDescription` — 一句话核心描述
- `coverCapabilities` — 3–6 个核心能力/模块
- `coverStatus` / `coverStatusSecondary` — 真实状态（来自 evidence，不夸大）
- `coverVisualHint` — 辅助视觉类型（`profile` / `states` / `dag` / `triangle` / `graph` / `none`）

所有文案来自数据模块，组件零硬编码。

### 2.2 各项目封面内容

- **知身·问年**：AI 衰老评估与干预决策系统；Active Interview / Aging Assessment /
  Driver Analysis / Intervention Priority / Explainable Report；REALITY：开源 MVP · 持续迭代；
  辅助视觉为小型多维状态轮廓，无 ΔAge、无雷达图、无公式。
- **HyCell**：AI Virtual Cell / Cellular World Model；State Representation / Transition Model /
  Biological Verifier / Target-State Planner / Benchmark；RESEARCH PROTOTYPE；
  辅助视觉为简洁细胞状态箭头；`z_t → z_t+1` 不再是视觉中心。
- **Morn**：Local-first Multi-Agent Desktop System；Agent Runtime / DAG / Tools / Memory /
  Local Models / Desktop；状态取自 evidence 真实值；辅助视觉为 small DAG / nodes，
  `G=(V,E)` 已移除。
- **BioPulse**：Agent-native Life Science Workbench；MCP / Compliance / RAG /
  Cross Validation / Agents；辅助视觉为小型 Expense/Visit/Flow 三角，三角只作辅助。
- **PDIG**：Local-first Personal Dependency Graph；Accounts / Devices / Credentials /
  Providers / Dependencies；REALITY 保持当前真实状态（not-public）；辅助为 small
  dependency graph，不占整图。
- **太一·灵境**：仍为 CONCEPT / NOT STARTED，封面明确显示两层状态，完成度
  未因新视觉提升。

### 2.3 版式（spec #9）

Desktop 结构：`CATEGORY → NAME → one-line → capability chips → small visual → REALITY`。
文字区占 55–70%，辅助图形 30–45%；标题/描述/状态均为真实 HTML text（spec #29）。
封面 description 短，卡片 body 的 thesis 更完整，两侧不重复（spec #25）。

---

## 3. Scientific Ambient 环境层

### 3.1 组成

`ScientificAmbient.astro`：纯 inline SVG，无 canvas / WebGL / 图片 / 网络请求（spec #30）。
元素库严格遵守 spec #12–#14：允许概率曲线、坐标轴、状态landscape轮廓、相位轨迹、
expression matrix 碎片、稀疏神经网络、agent 节点；禁止 DNA stock icon、机器人头、
AI 大脑图标、仿真器官。

### 3.2 Section-aware composition（spec #15）

| 区块 | 氛围 |
| --- | --- |
| Hero | Math + AI 较多（8 个 marks） |
| Selected Work | 最淡（3 个 marks） |
| Background | Biology 较多 |
| Mathematical Biology | Math + Biology 更明显（8 marks，但该区公式本就是内容主体，spec #19） |
| Research | graph / dynamics / evidence |
| Footer | 已移除独立 ambient（几乎消失） |

### 3.3 透明度（spec #16）

通过 CSS 变量随主题自动换色（spec #27），`global.css` 三主题分别定义
`--ambient-opacity-*` 区间，`scripts/check-visual-system.mjs` 校验：

- Paper：0.025–0.055
- White：0.018–0.045
- Night：0.04–0.08

### 3.4 定位与移动端（spec #17 / #28）

元素部分裁切、不围绕文字形成边框，视觉为 research notebook marginalia。
移动端按 `data-ambient-mobile="drop"` 删除约 50–60% 元素（每区实测：
hero 8→4、work 3→2、background 5→3、mathbio 8→5、research 3→2），
处于 spec 要求的 30–50% 保留带。

---

## 4. HeroSystem 简化（spec #18）

- 删除整块公式场（P(H|D)、dx/dt、X∈ℝⁿˣᵖ 等 5 行 formula 文本）及 drift 动画。
- 保留 AI system / research loop：OBSERVATION → REPRESENTATION → DYNAMICS →
  DECISION + FEEDBACK 回路，节点只写功能词（measurements / encoding / transition /
  intervention），数学氛围全部交还 hero ambient。
- Mathematical Biology 区不改定位：公式与科学图仍是该区的内容主体（spec #19）。

---

## 5. Theme QA（spec #35）

人工截图核验（Playwright full-page + 分区 element screenshot，1440×1000）：

- `/zh/` Paper / White / Night 三主题 Hero、Selected Work、Background、
  Mathematical Biology、Research、Footer 逐区检查。
- 结论：公式不抢正文；背景在最浅主题下仍可感知、不至完全不可见；
  Night 下 ambient 不变 wallpaper；封面/文字全部走主题变量自动换色。
- 额外核验：`/` EN、`/zh/projects/wennian/`、`/zh/projects/` 列表页。
- 截图存于 `.qa-screens/`（不进入仓库）。

**Mobile QA（spec #28）**：390px full-page + hero/work 分区截图，文字优先、
辅助视觉缩小、ambient 密度减半，无水平溢出（既有 no-horizontal-overflow 测试继续通过）。

---

## 6. Accessibility（spec #29 / #31 / #32）

- 全部 ambient 容器：`aria-hidden="true"` + `pointer-events: none`，不进 tab tree。
- `prefers-reduced-motion` 下 ambient 完全静态（本轮 ambient 默认静态，仅保留
  极轻 CSS 过渡且在 reduce 介质查询下禁用）。
- 封面 title / description / capabilities / status 均为 HTML text，非 SVG-only。

---

## 7. Performance（spec #30）

- ambient = inline SVG + CSS，零 JS、零网络请求、零 canvas/WebGL。
- 构建产物页面体积无可测量增量级 JS；首帧成本不变。
- 主题切换依旧零网络请求、不重载（既有测试继续通过）。

---

## 8. 新增门禁与测试

### 8.1 `scripts/check-visual-system.mjs`（`npm run visual`）

静态 + 产物双层校验：

1. **Cover 四要素**：每个 featured cover 必须含 title、description、capability、
   reality（HTML text），不得只有 SVG（spec #32）。
2. **公式上限（spec #33）**：cover 区域不得出现 MathML / formula block；
   公式字符数按上限裁断。
3. **Ambient 属性（spec #34）**：首页必须存在 `data-scientific-ambient` 且
   `aria-hidden=true`、`pointer-events:none`。
4. **透明度区间**：三主题 ambient opacity 变量落在 spec #16 区间。
5. **移动端密度**：逐区统计 `data-ambient-mobile="drop"`，确认保留 ≤ 50%。
6. **三类视觉分离**：ProjectCover / ProjectScientificVisual / ScientificAmbient
   三组件各自存在、职责互斥。

### 8.2 `tests/cover.spec.ts`（Playwright，desktop + mobile）

- 每个 featured project cover：title / description / capability / reality 可见。
- cover 内无大型公式块（字符上限断言）。
- 首页存在 `data-scientific-ambient`，`aria-hidden=true`，`pointer-events:none`。
- 隐藏全部 ambient 后封面信息仍完整可读（spec #37 的自动化近似）。

### 8.3 回归保护

- v1.1 evidence layer 的 `.reality-pill` 保留在 ProjectShowcase / ProjectCard 正文
  （evidence headline + public-code label），证据层 UI 未回退。
- ProjectVisual → ProjectScientificVisual 重命名通过 git mv 完成，case study 引用
  双语同步更新。

---

## 9. CI / Deployment

- `package.json` gate 顺序更新为：
  `lint → typecheck → build → verify → theme → artifacts → science → visual → identity → test`
  （十步，新增 `visual`）。
- 本地 `npm run gate` exit=0；Playwright 273 passed / 5 skipped / 0 failed。
- 推送 `main` 后由既有 GitHub Actions 执行同一十步并部署（本次 run 见 commit 记录）。

---

## 10. 变更文件清单

新增：

- `src/components/ProjectCover.astro`
- `src/components/ScientificAmbient.astro`
- `tests/cover.spec.ts`
- `scripts/check-visual-system.mjs`

重命名：

- `src/components/ProjectVisual.astro` → `src/components/ProjectScientificVisual.astro`

修改：

- `src/content.config.ts`（cover 字段 schema）
- `src/content/projects/{en,zh}/*.md`（14 个文件补 cover frontmatter）
- `src/components/ProjectCard.astro` / `ProjectShowcase.astro`（改用 cover，
  保留 evidence reality-pill）
- `src/components/HeroSystem.astro`（公式场移除）
- `src/components/MathematicalBiology.astro`（接入 mathbio ambient）
- `src/layouts/BaseLayout.astro`（body 级 ambient host）
- `src/pages/index.astro` / `src/pages/zh/index.astro`（四个 section ambient host）
- `src/styles/global.css`（ambient opacity 主题变量、print/规则调整）
- `scripts/check-theme-system.mjs`（变量清单更新）
- `package.json`（visual 门禁 + gate 顺序）

---

## 11. 结论

v1.4.1 完成了本轮唯一目标：用户第一次打开网站，首先看到的是
**"这是 Hao Lei 的项目"**；继续浏览才逐渐意识到这个人的视觉世界由
数学、生物、AI、系统与证据构成。三层视觉（PROJECT COVER /
CONCEPTUAL SCIENCE VISUAL / AMBIENT SCIENCE LAYER）职责互斥、
各有门禁守护，优先级不会再反向漂移。

未触碰（spec #38）：Resume、Evidence truth layer、TaiYi 状态、URLs、
SEO 架构、CI 架构、Artifact truth policy。
