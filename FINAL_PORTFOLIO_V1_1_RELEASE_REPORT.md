# FINAL PORTFOLIO V1.1 RELEASE REPORT

**Project:** Hao Lei — Personal AI Lab
**Date:** 2026-09-18
**FINAL STATUS: `PRODUCTION_READY_WITH_HUMAN_CONTENT_GAPS`**

含义：站点本身已生产就绪——全部质量门禁通过、CI 全绿、线上已验证。
状态带 `_WITH_HUMAN_CONTENT_GAPS` 是因为有两项内容**必须由本人提供、且不能由本仓库代填**：教育经历记录，以及真实简历 PDF / 肖像照片。这些缺口在页面上以"不渲染"的方式处理，而不是用占位文案填充。

---

## 1. 当前状态

| 项 | 结果 |
| --- | --- |
| `npm run lint` | 0 error / 0 warning |
| `npm run typecheck`（`astro check`，53 个文件） | 0 error / 0 warning / 0 hint |
| `npm run build` | 22 页，约 5s |
| `npm run verify` | 通过：46 文件 / 22 HTML / 548 条内链全部可解析 |
| `npm run test`（Playwright，desktop + mobile） | 83 passed / 1 skipped / 0 failed |
| GitHub Actions | build success → deploy success |
| 线上 | https://haoleilab.com 已验证 |

技术栈与 v1.0 完全一致，**未更换框架、未做大规模重构**：Astro 5 静态输出 · TypeScript strict · Tailwind CSS 3 + CSS Tokens · Content Collections（Zod schema）· @astrojs/sitemap · Playwright · GitHub Actions → GitHub Pages · 自定义域名。零运行时框架、零追踪脚本、零后端。

## 2. 相对 v1.0 的变更

**P0 — 事实一致性**
1. `FINAL_PORTFOLIO_RELEASE_REPORT.md` 的错误表述已更正。原文写作"5 个核心项目内容经 GitHub 公开仓库事实核验"；事实是只有 WenNian 与 HyCell 存在可核对的公开仓库，TaiYi Lingjing / Pet AI Health / PDIG 没有公开代码。该表新增"可核验的公开证据"列并附更正说明。
2. 全站 fact claim 审计：`implemented / built / validated / production / released / tested / deployed` 逐条核对。降级两处：
   - PDIG 的 `description` 原写"在 Android、iOS 与 HarmonyOS 上以原生方式实现" → 改为"面向三端原生客户端的规范模型……规范本身即是产物，目前没有任何实现公开发布"。
   - WenNian 的许可证：README 声明 GPLv3，但 GitHub 未检测到 LICENSE 文件 → 状态标注为"未确定"，不再单方面宣称 GPLv3。
3. WenNian 的 `Digital Twin` 标签移除（数字孪生在实现状态矩阵中仍被列为 planned），分类改为 `AI Health · Aging Intelligence · Decision Support`。
4. 首页 `work.lead` 原写"五个端到端构建的系统"，与研究计划类项目不符 → 改为"五个项目处于五个不同的完成度"。`research.lead` 同步修改。

**P0 — 简历缺口封闭**
5. `src/data/resume.ts` 的 Education 区不再向访问者输出"暂无可供公开发布的已核实记录"。现在**该区在无数据时完全不渲染**。`EDUCATION` 常量为空数组，填入后中英双语自动出现。
6. 新增 `VERIFIED_RESUME_DATA_REQUIRED.md`，列出必须提供的字段（院校官方名称、学位类型与专业、入学/毕业年月、城市，以及工作/实习的同等字段、联系方式取舍、真实 PDF 路径）。
7. 简历按钮由 `Download / Print Resume` 改为 `Print / Save as PDF`（没有真实 PDF 就不该有 Download 字样）。`SITE.resumePdf` 为 null；一旦指向真实文件，下载按钮自动出现。

**P0 — CI 质量门禁**
8. `.github/workflows/deploy.yml` 顺序改为 `npm ci → lint → typecheck → build → verify → test`，`configure-pages / upload-pages-artifact` 排在 test 之后，deploy 是独立 job 且 `needs: build`。**测试失败即不部署**，无例外。
9. Playwright 浏览器在 Ubuntu runner 上通过 `npx playwright install --with-deps chromium` 安装，并按 `@playwright/test` 实际版本号缓存 `~/.cache/ms-playwright`。CI 下跳过重复 build（`playwright.config.ts` 按 `process.env.CI` 分支）。

**P1 — 证据化项目设计**
10. 新增 `src/data/evidence.ts`：五个项目各自的现实状态矩阵 + 带来源的证据面板。
11. 新增 `ProjectReality.astro`（状态矩阵 + 图例）与 `EvidencePanel.astro`（tree / terminal / list / note / screenshot，强制显示来源，图片支持 native `<dialog>` 灯箱、`width/height`、`loading="lazy"`、完整 alt）。
12. Case Study 首屏的 meta 现在回答 **WHAT**（标题 + thesis）/ **STATUS** / **ROLE** / **YEAR** / **PUBLIC CODE** / **REALITY**，并新增直达证据区的按钮。
13. 首页卡片与项目索引页加入克制的 reality pill（如 `OPEN-SOURCE MVP` / `RESEARCH PROTOTYPE` / `RESEARCH PROGRAM`），五个项目不再看起来一样完成。
14. 开源区改用签入的真实 GitHub 元数据：语言、许可证（null 显示为 `No license detected`）、更新日期，并显示快照日期 `2026-09-17`。不显示 star 数，不做运行时 API 调用。

**P2**
15. About 页加入肖像槽位（`SITE.portrait`，为 null 时保持纯文本版式，**不放假照片**）。联系入口在 Footer 与 About 各出现一次（GitHub / Email / Resume）。
16. 文案 AI 味审计：全站扫描 `not just / not only / leverage / seamless / robust / unlock / paradigm` 等套路词，命中数为 0（仅保留"highest-leverage component"这一处真实工程判断）。破折号密度 1.4–1.9 / 千字，属正常区间。
17. 首页层级未新增板块，Hero 未增加新信息；10 秒知道做什么、30 秒看到关键项目、60 秒理解能力、3 分钟决定是否联系或点击。

**P3 — 性能回归**
18. 首页 CSS 4.3 KB，HTML 65.7 KB（gzip 11.4 KB），**0 张 `<img>`、0 个阻塞脚本、0 个 web 字体**，13 段内联 SVG。dist 总计 1174.6 KB（含 22 页 HTML 与 11 张 OG 图）。无新增首屏负担。

## 3. 简历状态

| 区块 | 状态 |
| --- | --- |
| Profile / Focus / Selected Projects / Technical Areas / Open Source / Contact | 正常渲染 |
| **Education** | **不渲染**（等待本人提供已核实记录） |
| 打印入口 | `Print / Save as PDF`，打印的是页面本身，屏幕与纸质一致 |
| Download PDF | 不显示（无真实 PDF） |
| Portrait | 不显示（无真实照片） |

Playwright 已断言：Education 的 `<h2>` 数量为 0，且页面不含 `no verified record` 字样；`/resume/` 不存在 Download PDF 链接。

需补齐清单见 `VERIFIED_RESUME_DATA_REQUIRED.md`。补齐后只需改 `src/data/resume.ts` 的 `EDUCATION`（中英双份），无需改动任何页面模板。

## 4. 证据覆盖

| 项目 | 公开代码 | 状态条目 | 证据面板 | 面板类型 |
| --- | --- | --- | --- | --- |
| WenNian | 有 | 15（built 10 / partial 2 / planned 3） | 3 | 仓库目录、README 命令、许可证说明 |
| HyCell | 有 | 14（built 10 / prototype 1 / planned 3） | 5 | 可复现契约、基准输出、规划器输出、模块清单、引用限制 |
| TaiYi Lingjing | 无 | 5（designed 3 / not-public 2） | 1 | 说明：如何阅读本页 |
| Pet AI Health | 无 | 5（designed 3 / not-public 2） | 1 | 说明：无公开证据 |
| PDIG | 无 | 7（designed 3 / not-public 3 / planned 1） | 1 | 说明：为什么先做规范 |
| **合计** | — | **46** | **11** | — |

统一状态集：`BUILT / VALIDATED / PARTIAL / PROTOTYPE / DESIGNED / PLANNED / NOT PUBLIC`。没有 `COMING SOON`。每个状态在图例中都有公开定义，`NOT PUBLIC` 的斜纹底纹在视觉上也与"已完成"区分开。

**没有伪造任何 UI 截图。** WenNian 与 HyCell 的仓库内不存在可复制的演示截图（HyCell 的 `docs/assets` 只有一个 `README_ASSETS.md`），因此这两页的证据是：真实目录结构（GitHub API）、README 逐字命令、真实的基准与规划器输出、真实的验收脚本与模块清单。TaiYi / Pet / PDIG 无实物，页面直接说明"无公开证据"，而不是渲染界面假图。

## 5. 逐项目现实矩阵

**WenNian — OPEN-SOURCE MVP / ACTIVE**
现实：代码、测试、界面、接口与部署文件均已公开。
已实现：多时钟评估引擎（PhenoAge / KDM / DNN / LifeClock，9 项血检指标）、器官时钟层（8 个系统）、融合层（主驱动 + 干预优先级 + 置信区间）、多智能体层（Director / Analyst / Auditor / HealthInterviewer，Auditor 强制红线扫描）、结构化健康访谈（≤3 轮，100+ 映射）、护栏、白标 PDF 报告、FastAPI + Gradio、Dockerfile / compose.prod / nginx、测试套件（18 包 + 8 模块）。
部分：因果层（仓库自述"部分开放"）、干预仿真（排序，不是反事实轨迹）。
计划：连续感知、数字孪生、临床验证。

**HyCell — RESEARCH PROTOTYPE / PROTOTYPE**
现实：可运行的 v0.1 原型，附带真实验收脚本。
已实现：schema 与数据契约、编码器与转移头（v0.1 为 NumPy 岭回归）、EvidenceGraph、生物校验器（toy 基准 8 条转移全部返回 warn）、目标状态规划器、GSE130973 接入（裁剪至 5000 细胞 × 2000 基因）、真实矩阵冒烟训练、验收脚本（`make verify` = pytest + 7 个目标验证）、18 个测试模块、Streamlit 演示。
原型：云 GPU 脚手架。
计划：生物学验证（无）、v0.2 元数据注释、v0.4 真实扰动基准。

**TaiYi Lingjing — RESEARCH PROGRAM / RESEARCH**
现实：无公开仓库，无已发布系统。
已设计：系统架构（五子系统）、子系统契约、研究设计。未公开：原型代码、公开仓库。

**Pet AI Health — DESIGN STUDY / RESEARCH**
现实：仅包含架构与流程设计。
已设计：产品架构（含向兽医升级）、多模态采集设计、外部服务适配器契约。未公开：服务实现、测试状态。

**PDIG — SPECIFICATION AND DESIGN / RESEARCH**
现实：规范层工作，无公开实物可检视。
已设计：权威规范（图谱模型 + 不变量）、密码学与隐私规则、原生迁移计划。
未公开：一致性测试套件（作者报告 64 个 fixture，无法核对）、Android 原生实现（据称最完整）、公开仓库。
计划：iOS / HarmonyOS 目标。

## 6. CI 质量门禁

```
npm ci
  → npm run lint        (eslint .)
  → npm run typecheck   (astro check)
  → npm run build       (assets + astro build)
  → npm run verify      (scripts/verify-build.mjs)
  → Resolve Playwright version
  → Cache ~/.cache/ms-playwright  (key: OS + @playwright/test 版本)
  → npx playwright install --with-deps chromium   (仅缓存未命中时)
  → npm run test        (playwright test)
  → actions/configure-pages@v6.0.0
  → actions/upload-pages-artifact@v5.0.0  (path: dist)
deploy (needs: build)
  → actions/deploy-pages@v5.0.1
```

- `verify` 已从 `npm run check && node scripts/verify-build.mjs` 收窄为只做构建产物校验，避免在 CI 里重复跑 lint/typecheck/build。另新增 `npm run gate` 供本地一次跑完全部门禁。
- 权限仍为最小化：`contents: read / pages: write / id-token: write`；`concurrency.group: pages` + `cancel-in-progress: true`。
- 失败行为：任一前置步骤失败 → `build` job 失败 → `deploy` job 因 `needs` 不执行 → Pages 保持上一版本。

## 7. Actions 版本与告警

已升级到官方当前稳定大版本（逐项通过 GitHub Releases API 核对，非 beta）：

| Action | 之前 | 现在 |
| --- | --- | --- |
| actions/checkout | v4 | **v7.0.1** |
| actions/setup-node | v4 | **v7.0.0** |
| actions/configure-pages | v5 | **v6.0.0** |
| actions/upload-pages-artifact | v3 | **v5.0.0** |
| actions/deploy-pages | v4 | **v5.0.1** |
| actions/cache（新增） | — | **v6.1.0** |

**弃用告警：0 条。** v1.0 报告第 14 节记录的"checkout@v4 等面向 Node 20 的 action 将被强制跑在 Node 24"告警已随本次升级消除。

运行内唯一的 annotation 是 runner 镜像通知，不是 action 弃用：

> "The ubuntu-latest label will migrate to Ubuntu 26 beginning October 19, 2026."
> 来源：`actions/runner-images#14748`。属于 GitHub 官方 runner 迁移公告，与 workflow 内容无关；如需要固定镜像，将来可把 `runs-on` 改为 `ubuntu-24.04`。

## 8. 测试

Playwright 1.50，双项目（Desktop Chrome 1440×900 + Pixel 5），**83 passed / 1 skipped / 0 failed**，webServer 走 `astro preview`。

覆盖范围（v1.1 新增 5 条）：
- 16 条路由渲染 + 零 console error
- 项目过滤、Case Study 结构、语言切换保路径、汉堡菜单、外链安全属性
- 7 档视口（375 / 390 / 430 / 768 / 1024 / 1280 / 1920）无横向溢出
- canonical / hreflang / JSON-LD
- **证据层**：Case Study 首屏回答 PUBLIC CODE 与 REALITY；状态矩阵渲染且 built / planned 徽章存在；每个证据面板的来源非空；无公开代码的项目显示 `None — nothing published` 且仍有来源标注；首页卡片带 reality pill；开源区显示 `Metadata snapshot` 与 `No license detected`
- **简历**：Education 不渲染、无占位文案、无 PDF 下载按钮

`scripts/verify-build.mjs`：46 文件 / 22 HTML / **548 条内链全部可解析** / 部署产物齐全 / 每页 title + canonical + og:image 齐备。

## 9. 构建

- 22 页（11 路由 × 2 语言），构建约 5s。
- dist 总计 1174.6 KB：22 个 HTML + 4 个 CSS（首页 4.3 KB）+ 11 张 OG 图 + favicon / manifest / sitemap / robots / CNAME。
- 首页 HTML 65.7 KB 原始 / 11.4 KB gzip，13 段内联 SVG，**0 张图片、0 个阻塞脚本、0 个 web 字体**。
- 首屏无新增重量级资源；证据面板中的等宽代码块横向滚动而非重排，移动端字号降一档。

## 10. 部署

- 仓库：`github.com/huangdi97/huangdi97.github.io`，分支 `main`。
- Pages `build_type: workflow`；DNS 与证书生效；`github.io` 对自定义域名返回 301。
- CI run `35304568846`：`build` success（1m43s）→ `deploy` success（10s）。
- 线上抽检（2026-09-18）：
  - `/`、`/zh/`、`/projects/`、`/projects/wennian/`、`/projects/hycell/`、`/projects/pdig/`、`/resume/`、`/zh/resume/`、`/about/` → **200**
  - `/sitemap-index.xml`、`/robots.txt`、`/og/home.png` → **200**
  - `/no-such-page-xyz/` → **404**
  - `/projects/wennian/`：reality 锚点存在、18 个状态徽章、3 个证据面板、3 处来源标注、PUBLIC CODE 行存在
  - `/resume/`：Education `<h2>` 数 0、无 `no verified record` 文案、按钮为 `Print / Save as PDF`
  - `/`：7 个 reality pill、`Metadata snapshot` 与 `No license detected` 可见

## 11. 仍需人工提供的内容

1. **教育经历**（阻塞 Education 区块出现）：院校官方名称、学位类型与专业、入学与毕业年月、城市；如需列出本科，同样字段。见 `VERIFIED_RESUME_DATA_REQUIRED.md`。
2. **工作 / 实习经历**：雇主官方名称、职位、起止年月、雇佣类型、城市、3–5 条可核查的产出陈述。
3. **真实简历 PDF**：放到 `public/`（如 `public/resume.pdf`）并把 `SITE.resumePdf` 设为 `/resume.pdf`，下载按钮即自动出现。在此之前"打印本页"就是正式简历。
4. **肖像照片**：把真实照片放 `public/` 并设置 `SITE.portrait`。在提供之前，About 保持纯文本版式，不使用占位头像或生成的人脸。
5. **联系方式取舍**：邮箱 `304418554@qq.com` 来自 WenNian README 的公开发布，如需更换请说明；**电话默认不公开**，仅在明确要求时添加；LinkedIn / Scholar / ORCID 有真实主页才链接。
6. **可选**：五个项目的真实 UI 截图。仓库中目前没有可复制的演示截图；一旦有真实截图，放入 `public/`，`EvidencePanel` 已支持 `image`（含灯箱、lazy load、width/height、完整 alt）。

## 12. 线上地址

- **https://haoleilab.com**（canonical，200 ✔）
- https://huangdi97.github.io（301 → 自定义域名 ✔）

## 13. Git commit

- `5c5da82` — v1.1 主体：证据层、现实状态、简历缺口封闭、CI 质量门禁、Actions 升级、事实修正
- `3fbafa2` — 把 `resumePdf` / `portrait` 的类型放宽为 `string | null`，便于后续填入
- 远程 `main` 已推送，CI 两次运行均 success，线上已验证

---

### 一句话结论

站点已在生产环境运行并通过全部门禁；剩下的不是工程问题，而是三项必须由本人提供的事实——教育经历、真实简历 PDF、真实肖像。在提供之前，页面对这三处的处理都是**不渲染**，而不是编造或填充占位文案。
