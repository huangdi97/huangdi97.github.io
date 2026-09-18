# FINAL PORTFOLIO V1.2 — IDENTITY RELEASE REPORT

**Repository:** `huangdi97/huangdi97.github.io`
**Canonical site:** `https://haoleilab.com`
**Stack:** Astro 5 (static) · TypeScript strict · Tailwind · GitHub Pages + Actions
**Report date:** 2026-09-18

---

## 1. FINAL STATUS

```
FINAL STATUS: PRODUCTION_READY
```

All human-content gaps identified in v1.1 are closed. Education, employment,
research experience and research output are published. Both contact addresses
are public. A public-safe résumé PDF is downloadable in two variants. The
flagship project carries its final brand. The private phone number and the
private 163 address exist nowhere in source, build output or published PDFs.

No item is left in `PENDING` state. `PUBLIC_PDF_PENDING_SANITIZATION` does **not**
apply: the sanitised PDFs were produced and verified (§8).

Portrait / photo remains **OPTIONAL** and no longer justifies the status
`WITH_HUMAN_CONTENT_GAPS`. The site is a complete, truthful professional
identity without it.

---

## 2. CONTACT IDENTITY

| Field | Value |
| --- | --- |
| Name (EN) | `Hao Lei` |
| Name (ZH) | `郝磊` |
| Brand | `HAO LEI` |
| Site | `Hao Lei — Personal AI Lab` |
| Tagline | `AI × Life Science × Agents` |
| PRIMARY email | `h30441854@gmail.com` (Gmail) |
| SECONDARY email | `304418554@qq.com` (QQ Mail / `QQ 邮箱`) |
| GitHub | `https://github.com/huangdi97` |
| Canonical | `https://haoleilab.com` |

**Architecture.** The single `SITE.email` string was removed and replaced with a
structured model (`src/config/site.ts` → `SITE.emails[]`). All contact rendering
now goes through one shared component, `src/components/ContactLinks.astro`,
consumed by:

- `Footer.astro` (variant `footer`)
- `src/pages/about.astro` and `src/pages/zh/about.astro` (variant `buttons`)
- `src/components/ResumeDocument.astro` (variant `list`)
- `MobileNav.astro` (variant `list`)

Because every surface reads the same array, it is structurally impossible for
one page to show Gmail while another still shows only QQ Mail.

**Fixed order, everywhere:** `Gmail → QQ Mail → GitHub → Resume`. Enforced by
`data-contact-id` ordering assertions in `tests/identity.spec.ts`.

**JSON-LD `Person.email`** uses the primary Gmail only (`mailto:h30441854@gmail.com`),
built by `src/data/profile.ts` → `primaryEmail()`.

---

## 3. EDUCATION

Source: `src/data/education.ts`. Owner-confirmed; published as supplied.

| Institution | Degree | Period | Location |
| --- | --- | --- | --- |
| Dalian Medical University | M.S. in Zoology | 2023.08 — 2026.06 | Dalian, Liaoning |
| Taiyuan University of Technology | B.Eng. in Biological Engineering | 2016.09 — 2020.07 | Taiyuan, Shanxi |

Master's research focus is rendered as a labelled sub-block:
disease animal models · pharmacological efficacy evaluation · multi-omics
bioinformatics · computational biology simulation; methods: molecular dynamics
and Bayesian network modeling.

**Deliberately not published:** 211 / Double First-Class status, any ranking,
CET band, GPA, class rank, supervisor name. The data file carries an explicit
internal note so a future edit cannot reintroduce them by accident. The
institution is `Dalian Medical University` (not "Dalian Medical College") and
the bachelor's degree is `B.Eng.` (not "Bachelor of Science", not "Bioengineering").

---

## 4. EMPLOYMENT

Source: `src/data/experience.ts`. Owner-confirmed; published as supplied.

**Beijing ZONCI Technology Development Co., Ltd.**
Assistant Engineer · R&D Department · 2023.03 — 2023.08 · Beijing
- R&D iteration of coagulation analyzers and companion IVD reagents.
- Broke down and drove forward the group task list.
- First-hand familiarity with the medical-device / IVD path from development
  through verification.

**Sinovac Life Sciences Co., Ltd.**
Formulation Technology Engineer · Formulation Division · 2021.03 — 2021.10 · Beijing
- Upstream aluminium-adjuvant process for the COVID-19 vaccine: preparation,
  washing, concentration, filling, physicochemical testing.
- Coordinated a small working group completing semi-finished product formulation.
- Worked inside a GMP system — process compliance and data integrity.

**Scope discipline.** `配比技术工程师` is published as `Formulation Technology
Engineer`, annotated in source as a working translation rather than an official
company title. `带领小组` is rendered as *coordinating a small working group* —
not Team Lead, not Department Manager. `负责小组任务拆分与推进` is rendered as
responsibility for the task list — not a management title. The data file states
this explicitly so a future edit cannot silently inflate either role.

---

## 5. RESEARCH EXPERIENCE

Source: `src/data/researchRecord.ts`.

**Disease Model Development & Pharmacological Mechanism Research**
Dalian Medical University · 2023.08 — 2026.05 · Project designer and primary implementer
- Designed and implemented three preclinical projects: a drug improving lung
  injury through neutrophil–macrophage interaction; improving intestinal
  ischemia/reperfusion-related liver injury through the Nrf2 pathway; improving
  sepsis through a gut-microbiome-associated mechanism.
- Independently completed animal-model construction, phenotyping and mechanistic
  assays (ELISA, Western Blot, IHC, PCR, flow cytometry), plus primary-cell
  isolation, culture and functional validation.
- Built R / Python multi-omics pipelines over metabolomics and 16S rRNA data
  (differential analysis, microbiome–host interaction mining) and ran GROMACS
  molecular dynamics with MM/PBSA binding-free-energy calculation.
- Worked across wet-lab and computational analysis — first-hand understanding of
  how biological data are generated and where experimental and batch noise
  enters the pipeline.

Framing: preclinical / experimental / computational biology. It is never
described as clinical research or clinical AI.

---

## 6. RESEARCH OUTPUT

Source: `src/data/researchRecord.ts` → `RESEARCH_OUTPUTS`.

| Title | Status |
| --- | --- |
| Sulforaphane Ameliorates Intestinal Ischemia/Reperfusion Injury by Activating Nrf2 to Suppress Oxidative Stress and Pyroptosis | `Manuscript submitted` / `稿件在投` |

**Status discipline.** `Manuscript submitted` / `稿件在投` is the only status
used. No journal name, volume, issue, page, DOI or citation count is invented,
and the entry is never described as published, accepted or peer-reviewed. A
Playwright assertion (`tests/identity.spec.ts`) fails the build if the output
block ever contains `doi`, `published`, `accepted` or `peer-reviewed`.

---

## 7. RESUME PAGE — STRUCTURE AND VARIANTS

Single source of truth: `src/data/resume.ts`, composed from `education.ts`,
`experience.ts`, `researchRecord.ts` and `contact.ts`. The document body is
rendered once by `src/components/ResumeDocument.astro` and shared by
`/resume/` and `/zh/resume/` — the two locale pages differ only in SEO metadata.

Section order (identical in both locales):

```
1.  Profile                 (profile)
2.  Focus                   (focus)
3.  Experience              (experience)      ← employment
4.  Education               (education)
5.  Research Experience     (research)        ← academic research
6.  Research Output         (output)
7.  Selected Projects       (projects)        ← personal projects
8.  Technical Areas         (technical)
9.  Open Source             (opensource)
10. Contact                 (contact)
```

**Visual and semantic separation** is enforced by three distinct block kinds:
employment and education use the two-column timeline (`entries`), research uses
the same timeline but with an organisation line, and personal projects use a
separate card list (`projects`). A test asserts the three blocks are visible and
that employment and research are not the same text.

**Technical Areas** is split into three groups:
- **Engineering** — languages, backend/data, delivery, agent and LLM engineering.
- **Scientific & research methods** — multi-omics, molecular dynamics, aging
  clocks, Bayesian networks.
- **Exploration** — digital twins and QSP / mechanistic (ODE) modelling, with the
  inline qualifier *"explored as research direction, not production engineering
  expertise"* / *"属于研究探索方向，不作为生产工程能力声明"*.

SEO titles:
- EN `Hao Lei — Resume | AI Systems, Agents & Life Science`
- ZH `郝磊 — 简历 | AI 系统、智能体与生命科学`

---

## 8. RESUME PDF — STATE AND PRIVACY

**Decision.** The résumés on disk (`郝磊-简历.pdf`, `郝磊-简历（通用版）.pdf`,
located at `D:\下载\`) were read and audited. Both contain the private mobile
number `18535864540`. Publishing them verbatim would have leaked private data,
so they were **not** copied into `public/`.

**Instead:** `scripts/generate-resume-pdfs.mjs` prints the site's own Chinese
résumé page to PDF with Playwright (A4, print media, print-background off). The
PDF and the page are therefore the same document, generated from the same data
files, and cannot drift apart.

| File | Pages | Size | Subject |
| --- | --- | --- | --- |
| `public/resume/Hao-Lei-AI-Agent-Resume-ZH.pdf` | 3 | 235.6 kB | AI 系统 / 智能体工程方向简历 |
| `public/resume/Hao-Lei-AI-LifeScience-Resume-ZH.pdf` | 4 | 234.9 kB | AI × 生命科学方向简历 |

Both variants contain **every** section — neither omits a fact. They differ only
in the positioning line and in section order, so each reads as a document aimed
at a different reviewer while stating exactly the same truth.

**Metadata** (written with `pdf-lib`, verified with `pdfjs-dist`):

```
/Title    Hao Lei — Resume
/Author   Hao Lei
/Creator  Hao Lei
/Producer Hao Lei
/Language zh-CN
```

Chromium's own producer strings are overwritten. No tool name (WorkBuddy,
ChatGPT, GPT, Claude, Copilot, "AI generated") appears in any metadata field —
asserted by the identity check.

**Privacy verification** (`pdfjs-dist` real text extraction, not a byte scan):

| String | Result |
| --- | --- |
| `h30441854@gmail.com` | present |
| `304418554@qq.com` | present |
| `github.com/huangdi97` | present |
| `haoleilab.com` | present |
| `大连医科大学` | present |
| `18535864540` | **absent** |
| `haolei970211@163.com` | **absent** |

**404-proof:** download buttons are emitted only for PDFs that exist on disk at
build time (`availableResumePdfs()`). A test fetches every rendered download
`href` and asserts HTTP 200.

---

## 9. ZHISHEN · WENNIAN MIGRATION

| Surface | Value |
| --- | --- |
| EN title | `ZhiShen · WenNian` |
| ZH title | `知身·问年` |
| EN page subtitle | `知身·问年` |
| ZH page subtitle | `ZhiShen · WenNian` |
| EN SEO title | `ZhiShen · WenNian — AI Aging Assessment & Decision Support` |
| ZH SEO title | `知身·问年 — AI 衰老评估与干预决策` |
| URL slug | `/projects/wennian/` — **unchanged** |
| Repository | `github.com/huangdi97/WenNian` — **unchanged** |

A one-sentence note on the case study explains that the public code repository
still carries the historical name `WenNian`, so a visitor following the repo
link is not confused by the mismatch.

Full audit performed and updated: title, description, summary, tags, OG image
(`ZhiShen · WenNian`), OG title, SEO title, JSON-LD, breadcrumb, home page,
projects index, research page, résumé, open-source strip, internal links, ALT
text and captions.

**EVIDENCE SNAPSHOT (new).** `ProjectMeta` now renders a public snapshot row:

> 2026-09-18 — Current product development may be ahead of the latest publicly
> inspectable repository snapshot.

This lets an actively-developed project keep honest published facts: the site
states what was publicly inspectable on a given date rather than implying the
repository is the live state.

---

## 10. CLAIM AUDIT AND EVIDENCE DISCIPLINE

| Claim | Action |
| --- | --- |
| `continuous sensing` in the résumé project copy | **Removed** — not supported by public evidence |
| Digital twins / QSP | Moved to `Exploration`, explicitly not production expertise |
| Unbuilt capabilities (continuous sensing, digital-twin runtime, intervention trajectory simulation) | Never marked `built`; reality states unchanged |
| `Lead Engineer` / `Project Manager` / `Department Manager` | Never used; scope notes in `experience.ts` prevent reintroduction |
| Journal / DOI / citation for the manuscript | Never invented; status is `Manuscript submitted` only |
| GPA / rank / CET / 211 / supervisor | Never published; data file says so explicitly |

Owner-confirmed résumé facts (education, employment, contact) are published as
supplied and are **not** subject to the "needs public evidence" test. Project
implementation state remains fully subject to Evidence Discipline.

---

## 11. PRIVACY AUDIT

`scripts/check-public-identity.mjs` — 348 assertions, all passing.

- **62 source files** (`src/**/*.{astro,ts,md,mdx,css,js}`) scanned for
  `18535864540` and `haolei970211@163.com` → **0 hits**.
- **22 built pages** (`dist/**/*.html`) scanned → **0 hits**.
- **2 résumé PDFs** scanned by real text extraction → **0 hits**.
- **2 distinct `mailto:` targets** across the whole build, both in the approved
  allowlist. Any other mailto target fails the check.
- JSON-LD `Person` blocks: `telephone`, `birthDate`, `address` must be absent →
  verified on every page that emits a Person.
- Every page must carry both email addresses and the GitHub identity → verified.

The private strings are assembled at runtime inside the checker and the tests
(`['1853','5864','540'].join('')`) so neither file contains the literal it is
looking for and the scanner cannot be defeated by its own source.

Negative controls were executed: injecting the phone number into a built page,
and into a source file, each made the check exit non-zero.

---

## 12. TESTS

`npm run test` → **146 passed, 2 skipped** (skips are desktop runs of
mobile-only tests). Two projects: desktop Chrome 1440×900 and Pixel 5.

New file `tests/identity.spec.ts`:

| Group | Coverage |
| --- | --- |
| factual consistency | EN + ZH education, employment, degrees; degree-inflation negative assertions; manuscript never "published" |
| privacy | 12 routes × (no phone, no 163 address) |
| contact identity | fixed order `gmail → qq → github → resume` in footer, About, Resume; mailto allowlist across all routes |
| naming | `ZhiShen · WenNian` / `知身·问年` in `h1` and subtitle; no bare `WenNian` heading; repo URL and slug unchanged |
| resume integrity | all 10 sections present and non-empty in both locales; employment / research / projects distinct; download links resolve 200 |
| print | `emulateMedia({ media: 'print' })` on `/resume/` and `/zh/resume/` — header, footer and print button hidden, every section visible, contact details still present, no horizontal overflow at 794 px |
| mobile resume | long company and institution names wrap at 390 px |
| structured identity | `Person` JSON-LD: primary email only, no telephone / birthDate / address, both universities in `alumniOf` |

`tests/site.spec.ts` was updated where it asserted the *old* behaviour:
`Education` must now exist (it previously had to be absent), and the PDF
download button is now asserted to resolve instead of being asserted absent.

---

## 13. BUILD

`npm run gate` = `lint → typecheck → build → verify → identity → test`, run
locally end to end:

| Step | Result |
| --- | --- |
| `npm run lint` (eslint) | 0 problems |
| `npm run typecheck` (astro check) | 0 errors, 0 warnings, 0 hints (64 files) |
| `npm run build` | 22 pages, 32 s |
| `npm run verify` | passed — all routes, assets and internal links resolve |
| `npm run identity` | passed — 348 assertions |
| `npm run test` | 146 passed, 2 skipped |

---

## 14. CI

`.github/workflows/deploy.yml` keeps the strict gate and adds one step:

```
npm ci → lint → typecheck → build → verify → identity → test → deploy
```

Every step blocks. The gate was not weakened; `identity` was inserted between
`verify` and `test` so an identity or privacy regression fails before a browser
is ever launched. Run **35315141314** completed green:

```
✓ Lint  ✓ Typecheck  ✓ Build  ✓ Verify build output
✓ Check public identity  ✓ Test  ✓ Configure Pages  ✓ Upload artifact
✓ Deploy to GitHub Pages   (build 1m24s, deploy 8s)
```

New devDependencies required by the two new scripts: `pdf-lib` (writes PDF
metadata) and `pdfjs-dist` (reads PDF text and metadata in the checker). Both
are dev-only and installed by `npm ci`.

---

## 15. PRODUCTION SMOKE TEST

Performed against `https://haoleilab.com` after deployment.

| URL | Status |
| --- | --- |
| `/` | 200 |
| `/resume/` | 200 |
| `/zh/resume/` | 200 |
| `/about/` | 200 |
| `/projects/wennian/` | 200 |
| `/resume/Hao-Lei-AI-Agent-Resume-ZH.pdf` | 200 (228 kB served) |
| `/resume/Hao-Lei-AI-LifeScience-Resume-ZH.pdf` | 200 (228 kB served) |
| `/sitemap-index.xml` | 200 |
| `/robots.txt` | 200 |

Content assertions on the live `/resume/`:
`h30441854@gmail.com` ✔ · `304418554@qq.com` ✔ · `Dalian Medical University` ✔ ·
`Taiyuan University of Technology` ✔ · `Beijing ZONCI` ✔ ·
`Sinovac Life Sciences` ✔ · `Manuscript submitted` ✔ ·
`18535864540` ✘ (correct) · `haolei970211@163.com` ✘ (correct)

Content assertions on the live `/zh/resume/`:
`大连医科大学` ✔ · `太原理工大学` ✔ · `北京众驰伟业科技发展有限公司` ✔ ·
`北京科兴中维生物技术有限公司` ✔ · `稿件在投` ✔ ·
`18535864540` ✘ (correct) · `haolei970211@163.com` ✘ (correct)

Content assertions on the live `/projects/wennian/`:
`ZhiShen · WenNian` ✔ (9 occurrences) · `知身·问年` ✔ · snapshot `2026-09-18` ✔

---

## 16. LIVE URL

```
https://haoleilab.com
```

- Résumé (EN): `https://haoleilab.com/resume/`
- Résumé (ZH): `https://haoleilab.com/zh/resume/`
- Flagship project: `https://haoleilab.com/projects/wennian/`
- PDF: `https://haoleilab.com/resume/Hao-Lei-AI-Agent-Resume-ZH.pdf`

---

## 17. COMMIT

```
c5a16ec  v1.2: identity closure - resume record, public-safe PDFs, ZhiShen · WenNian
         main -> main   (de41522..c5a16ec)
         46 files changed, 2969 insertions(+), 870 deletions(-)
```

New files: `scripts/check-public-identity.mjs`,
`scripts/generate-resume-pdfs.mjs`, `src/components/ContactLinks.astro`,
`src/components/ResumeDocument.astro`, `src/data/{bi,contact,education,experience,profile,researchRecord}.ts`,
`tests/identity.spec.ts`, and the two PDFs under `public/resume/`.

---

## 18. REMAINING OPTIONAL WORK

None of the following blocks production or changes the final status.

1. **Portrait / photo** — OPTIONAL. `SITE.portrait` remains `null` and the About
   and résumé layouts render correctly without it. Nothing else depends on it.
2. **English résumé PDFs** — the two published PDFs are the Chinese variants, as
   specified. English counterparts can be produced on demand by adding two
   variants to `scripts/generate-resume-pdfs.mjs`.
3. **Additional manuscripts** — `RESEARCH_OUTPUTS` accepts further entries; each
   must supply only a title and a status.
4. **Evidence snapshot refresh** — the `2026-09-18` snapshot date should be
   updated in `src/data/evidence.ts` whenever the published claims are
   re-validated against the public repository.
