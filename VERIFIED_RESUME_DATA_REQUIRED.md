# RESUME DATA — STATUS

> **The filename is historical.** This file was written on 2026-09-17 as a list of
> the fields that had to be supplied before the résumé could publish an Education
> section. Every one of those fields has since been supplied and is live. The
> file is kept because §2 records the contact decisions and §4 records the
> standing disclosure policy — both are still in force.
>
> Reconciled against source and build output on 2026-09-20.

Nothing on the site is inferred. A value that has not been supplied is **absent
from the page**, never replaced by a placeholder that speaks to the visitor.

---

## 1. Supplied and published

### Education — `src/data/education.ts` → `EDUCATION: EducationEntry[]`

Two entries, both published in full:

| Institution                                     | Degree                                                                           | Period              | Location                              |
| ----------------------------------------------- | -------------------------------------------------------------------------------- | ------------------- | ------------------------------------- |
| Dalian Medical University · 大连医科大学        | Master of Science (M.S.) in Zoology · 理学硕士 · 动物学                          | Aug 2023 — Jun 2026 | Dalian, Liaoning, China · 辽宁 · 大连 |
| Taiyuan University of Technology · 太原理工大学 | Bachelor of Engineering (B.Eng.) in Biological Engineering · 工学学士 · 生物工程 | Sep 2016 — Jul 2020 | Taiyuan, Shanxi, China · 山西 · 太原  |

The master's record also carries an optional research-focus block (focus areas
and methods).

Deliberately **not** published: 211 designation, rankings, promotional
institutional titles, CET-6, GPA, class rank, supervisor names. Education is a
record of study, not a prospectus.

### Employment — `src/data/experience.ts`

Published in full. `scripts/check-public-identity.mjs` asserts the employer names
are present on both language pages, so this cannot silently regress.

### Résumé PDFs — `src/config/site.ts` → `SITE.resumePdfs`

Two generated files, both present in `public/resume/` and linked from both
language pages:

| id               | path                                           |
| ---------------- | ---------------------------------------------- |
| `ai-agent`       | `/resume/Hao-Lei-AI-Agent-Resume-ZH.pdf`       |
| `ai-lifescience` | `/resume/Hao-Lei-AI-LifeScience-Resume-ZH.pdf` |

`availableResumePdfs()` filters the list through `existsSync` at build time, so a
download button is only ever emitted for a file that actually exists — the site
cannot ship a 404 download.

To add one: drop the file in `public/resume/` and add an entry to
`SITE.resumePdfs`. No page-template change is required.

⚠️ **Earlier revisions of this file were wrong here.** They described a single
`SITE.resumePdf` (singular) that was `null`, with a "Print / Save as PDF" button
as the only affordance. That field does not exist; the plural array replaced it,
and both files are real.

## 2. Still open — contact decisions

Not gaps that block release. Each item is absent by default and is added only on
explicit instruction.

| Item                   | Current state                                         | Action                                          |
| ---------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| Name (Latin)           | `Hao Lei` — published                                 | Confirm or correct                              |
| Name (Chinese)         | `郝磊` — published                                    | Confirm or correct                              |
| Email                  | `h30441854@gmail.com`, `304418554@qq.com` — published | Confirm these are the addresses you want public |
| City of residence      | not shown anywhere                                    | Supply if you want it listed                    |
| Phone                  | **not collected, not shown**                          | Added only on written instruction               |
| LinkedIn               | none listed                                           | Supply a real profile URL if you want it linked |
| Google Scholar / ORCID | none listed                                           | Supply if a real profile exists                 |

Not public by policy (`src/config/site.ts`): the 163 address used for doctoral
applications, and the mobile number printed on the private job-application PDFs.
Neither appears in source copy, JSON-LD, OG metadata or any published PDF.

## 3. How to supply

Reply with the values in plain text, one per line. Contact values are edited in
`src/config/site.ts`; identity records in `src/data/`.

## 4. What will never be invented

Regardless of what is or is not supplied, the following are not written from
inference:

- Institution names, majors or dates
- Employment history or job titles
- Awards, publications or citations
- Metrics of any kind
- City of residence
- Any statement about clinical, regulatory or commercial validation
