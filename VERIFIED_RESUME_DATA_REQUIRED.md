# VERIFIED RESUME DATA REQUIRED

This file lists exactly what must be supplied before the Education section —
and any other identity record — appears on haoleilab.com.

Nothing on the site is inferred. Until a value is supplied, the corresponding
section is **absent from the page**, not replaced by a placeholder that speaks
to the visitor.

Status as of 2026-09-17: **no verified education record has been supplied.**
The Education section is therefore not rendered on `/resume/` or `/zh/resume/`.

---

## 1. Education — required fields

Minimum viable entry, per institution:

| Field | Why it is required | Example format |
| --- | --- | --- |
| Official institution name | The diploma name, not a colloquial one | `Tsinghua University` / `清华大学` |
| Degree type | Master / Bachelor / PhD / non-degree | `Master of Engineering` |
| Major or field | Needed to make the degree meaningful | `Computer Science and Technology` |
| Enrolment date | Year-month minimum | `2019-09` |
| Graduation date (or expected) | Year-month minimum | `2022-06` |
| City, country | Disambiguates same-named institutions | `Beijing, China` |

Optional, only if verifiable:

- Thesis or dissertation title
- GPA / ranking — only if a document supports it
- Supervisor name — only with their consent
- Honours, scholarships — only with awarding body and year

For the master's degree specifically, also confirm:

- Whether the programme is full-time or part-time
- Whether it is a professional degree (e.g. M.Eng) or an academic one (M.Sc)

For the undergraduate degree, if you want it listed, supply the same seven
fields. If you do not want it listed, say so explicitly — omission by choice is
different from omission by default.

## 2. Work and internship history

Same standard applies. For each role:

1. Official employer name
2. Job title
3. Start and end dates (year-month)
4. Employment type (full-time / intern / contract)
5. City
6. Three to five outcome statements, each tied to something checkable
   (a shipped system, a measurable result, a public artifact)

Avoid duty lists. "Responsible for X" is not evidence. "Shipped X, which did Y"
is.

## 3. Identity and contact

| Item | Current state | Action |
| --- | --- | --- |
| Name (Latin) | `Hao Lei` — in use | Confirm or correct |
| Name (Chinese) | `郝磊` — in use | Confirm or correct |
| Email | `304418554@qq.com` — published in the WenNian README | Confirm it is the address you want public |
| City | not shown anywhere | Supply if you want it listed |
| Phone | **not collected, not shown** | Only add on explicit instruction |
| LinkedIn | none listed | Supply a real profile URL if you want it linked |
| Google Scholar / ORCID | none listed | Supply if a real profile exists |

Default stance: phone is not published. It is added only when you say so in
writing.

## 4. Resume PDF

`SITE.resumePdf` in `src/config/site.ts` is `null`.

- The `/resume/` page shows **Print / Save as PDF**, which prints the same DOM
  that is on screen. Screen and paper cannot drift.
- A "Download PDF" button appears automatically the moment `resumePdf` points at
  a real file. No other change is needed.
- Do not fill this with an auto-generated file: a PDF that differs from the
  printed page would break the consistency guarantee the page makes.

To wire it up: drop the file in `public/` (e.g. `public/resume.pdf`) and set
`resumePdf: '/resume.pdf'`.

## 5. What will never be invented

Regardless of what is or is not supplied, the following are not written from
inference:

- Institution names, majors or dates
- Employment history or job titles
- Awards, publications or citations
- Metrics of any kind
- City of residence
- Any statement about clinical, regulatory or commercial validation

## 6. How to supply

Reply with the values in plain text, one per line, or edit
`src/data/resume.ts` → `EDUCATION` directly:

```ts
export const EDUCATION: { en: ResumeItem[]; zh: ResumeItem[] } = {
  en: [
    {
      label: 'Master of Engineering, Computer Science and Technology',
      value: 'Tsinghua University · Beijing, China · 2019-09 – 2022-06',
    },
  ],
  zh: [
    {
      label: '工学硕士，计算机科学与技术',
      value: '清华大学 · 中国北京 · 2019-09 – 2022-06',
    },
  ],
};
```

The Education section appears in both languages as soon as the array is
non-empty. No page template changes are required.
