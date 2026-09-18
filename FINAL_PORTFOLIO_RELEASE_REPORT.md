# FINAL PORTFOLIO RELEASE REPORT

**Project:** Hao Lei — Personal AI Lab
**Date:** 2026-09-18
**STATUS: PRODUCTION_READY — deployed and verified live**

---

## 1. 最终实现内容

- 完整的 Astro 5 静态站点：EN 为默认语言，简体中文挂载在 `/zh`，语言切换保持当前页面路径。
- 5 个核心项目的完整双语 Case Study（内容经 GitHub 公开仓库事实核验）。
- Research（5 个方向）、About、可打印 Resume、定制 404、双语言 404。
- 统一 Design Token 系统（`#F7F7F4` 纸面 / `#111` 墨色 / `#315CFF` 单一强调色）、系统字体栈、150–500ms 克制动效，完整支持 `prefers-reduced-motion`。
- SEO 全套：canonical、hreflang（en / zh-Hans / x-default）、OG/Twitter 卡片、JSON-LD（Person、WebSite、SoftwareSourceCode）、sitemap、robots、favicon、manifest、11 张静态 OG 图。
- 工程化：ESLint + Prettier + `astro check` + Playwright（71 项断言）+ 构建产物校验器 + 资产生成管线 + GitHub Actions 自动部署。
- 事实纪律：所有事实可溯源至 `@huangdi97` 公开仓库/README；无虚构经历、指标、repo 链接。`src/config/site.ts` 为唯一事实源且逐字段注释。

## 2. 页面列表（22 个构建产物）

| EN | 中文 |
| --- | --- |
| `/` | `/zh/` |
| `/projects/` | `/zh/projects/` |
| `/projects/wennian/` · `hycell/` · `taiyi-lingjing/` · `pet-ai-health/` · `pdig/` | `/zh/projects/…`（同 slug） |
| `/research/` | `/zh/research/` |
| `/about/` | `/zh/about/` |
| `/resume/` | `/zh/resume/` |
| `/404.html`（自定义 404） | `/zh/404/` |

另产出：`sitemap-index.xml`、`sitemap-0.xml`、`robots.txt`、`CNAME`、favicon/icon/manifest、`og/*.png` ×11。

## 3. Project 列表

| # | 项目 | 类别 | 状态 | Repo 链接 |
| --- | --- | --- | --- | --- |
| 01 | WenNian / 知身·问年 | AI Health · Aging Intelligence | Active | github.com/huangdi97/WenNian ✔ 已核验 |
| 02 | HyCell | Computational Biology · AI Virtual Cell | Research | github.com/huangdi97/HyCell-JEPA ✔ 已核验 |
| 03 | TaiYi Lingjing / 太一·灵境 | AI Discovery Platform · Agents | Research | 无公开 repo → 只显示 Case Study |
| 04 | Pet AI Health | AI Health · Multimodal | Prototype | 无公开 repo → 只显示 Case Study |
| 05 | PDIG | Local-first · Personal Infrastructure | Design | 无公开 repo → 只显示 Case Study |

## 4. 技术栈

Astro 5（静态输出）· TypeScript strict · Tailwind CSS 3 + CSS Tokens · Content Collections（schema 校验）· @astrojs/sitemap · Playwright 1.50 · GitHub Actions → GitHub Pages。零运行时框架、零追踪脚本、零后端。

## 5. UI / Design System

- Token：`--canvas #F7F7F4`、`--surface #FFF`、`--ink #111`、`--muted #666`、`--line rgba(0,0,0,.10)`、`--accent #315CFF`（仅链接/单点强调）。
- 字体：Inter → Geist → system-ui → Segoe UI → PingFang SC / Microsoft YaHei（系统栈，零首屏字体成本）。
- 组件：Header、MobileNav、HeroSystem（四节点呼吸图，reduced-motion 下静态完整）、SectionHeading、ProjectShowcase、ProjectCard、ProjectMeta、Tag、ArchitectureDiagram、ProjectVisual（9 套统一线框视觉）、ResearchArea、Timeline、Footer、LanguageSwitcher、Seo。
- 首页结构：Hero → Selected Work（5 项目整段交替布局）→ Research Areas → How I Work → Open Source → About CTA → Footer。

## 6. Responsive 状态

7 档断点实测（Playwright 断言 + 截图人工复核）：375 / 390 / 430 / 768 / 1024 / 1280 / 1920。全部无横向滚动、无文字溢出、无导航崩坏。移动端汉堡菜单可开合（z-index 已修复）、触控区 ≥ 44px。

## 7. SEO

- 每页独立 title/description/canonical/OG/Twitter/JSON-LD；`<html lang>` 区分 `en` / `zh-Hans`。
- hreflang 三向 + sitemap 内嵌 xhtml:link alternate；404 不进 sitemap。
- canonical 源已统一切换为 **https://haoleilab.com**（GitHub Pages 对 github.io 返回 301 到该域名）。

## 8. Accessibility

语义化 HTML 与正确 heading 层级、skip link、`:focus-visible` 全局焦点态、aria-label/aria-expanded/aria-hidden、SVG 图 `role="img"` + aria-label、键盘可导航、reduced-motion 全量降级、对比度达标（正文 #111/#666 on #F7F7F4）。

## 9. Testing

- **Playwright：71 passed / 1 skipped（desktop 上跳过 mobile-only 用例）/ 0 failed**，双视口（Desktop Chrome 1440 + Pixel 5），覆盖 16 条路由渲染、零 console error、项目过滤、Case Study 结构、语言切换保路径、汉堡菜单、7 档视口无溢出、Resume 打印入口、404、外链安全属性、canonical/hreflang/JSON-LD。
- `scripts/verify-build.mjs`：43 文件、22 HTML、**536 条内链全部可解析**、部署产物齐全、每页 title/canonical/og:image 齐备。
- 截图人工复核 27 张（9 路由 × 3 视口）。

## 10. Build result

`npm run check && npm run verify` 全绿：**lint 0 错误 · typecheck 0 错误 · build 22 页 ~3.4s · verify 通过 · test 71 通过**。

## 11. GitHub Pages

- `.github/workflows/deploy.yml`：push main → install → lint → typecheck → build → configure-pages → upload-pages-artifact → deploy-pages。权限最小化（contents: read / pages: write / id-token: write），并发去重。
- Pages `build_type: workflow`（已由 legacy 分支模式切换），DNS + 证书已生效。

## 12. 当前 Deployment URL

- **https://haoleilab.com**（canonical，200 ✔）
- https://huangdi97.github.io（301 → 自定义域名 ✔）
- 线上抽检：`/`、`/zh/`、`/projects/wennian/`、`/sitemap-index.xml`、`/robots.txt`、`/og/home.png` 均 200；任意未知路径返回 404；首页 canonical/hreflang/JSON-LD 线上已确认。

## 13. Git commit

- 初始发布：`acc2b14`（合并远程占位历史 `b52a3c8`，无强推）
- canonical 切换：`e10b99a`
- 远程：`github.com/huangdi97/huangdi97.github.io` main 分支，跟踪已建立

## 14. 尚未解决的问题

1. **简历数据缺口**：仓库内无可核验的教育/工作经历记录，Resume 的 Education 区按事实纪律留白声明。补充真实材料后改 `src/data/resume.ts` 即可。
2. **项目截图**：五个项目均无真实 UI 截图，现用统一生成的系统结构图代替；后续有真实产品截图可放 `public/` 并在 frontmatter `cover` 引用。
3. **TaiYi / Pet AI Health / PDIG 无公开 repo**：页面按规则不显示仓库链接；repo 公开后在对应 frontmatter 加 `repo` 字段即可。
4. **Actions 弃用告警**：GitHub 提示 checkout@v4 等面向 Node 20 的 action 将被强制跑在 Node 24。属 GitHub 官方过渡告警，不影响构建；后续升级 action 大版本即可。
5. **本地截图字体伪影**：本机无头 Chromium 无法枚举系统字体，截图呈衬线体；计算样式已确认字体栈正确（真实浏览器解析到 Segoe UI/system-ui），非站点缺陷。

## 15. 人工需要做的唯一操作

**无需操作。** 推送已完成、双次部署成功、线上已验证。日常更新流程：改内容 → `npm run verify` → push main → 自动部署。
