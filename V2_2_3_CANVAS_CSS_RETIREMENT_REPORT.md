# v2.2.3 — Retired Canvas CSS Removal

**Status: RELEASED.** Shipped as code commit `95dcaaa` (5 files, +22 / −269); CI run
`35521032884` succeeded and the deploy job completed; the published stylesheet was then
verified byte-for-byte against `dist/`. This report is a record commit on top of it.

Owner instruction: "做" — authorising the round proposed as _"删规则 + 删 6 令牌 +
从 `REQUIRED_TOKENS` 移除 + 处理打印表引用 + 决定 `qa-canvas-report.mjs` 去留"_.

---

## 1. Goal

The five v1.7 compositions (`GlobalScientificCanvas` and its three parts, plus
`SelectedArtifacts`) were retired in v2.2. They are **deliberately kept in
`src/components/`** — `check-visual-system.mjs` asserts they exist and that nothing
imports them, and its comment records the reason: removing ~1,000 lines of authored
drawing is a bigger decision than the round that retired them was handed.

What had never been removed is **what those drawings were painted with**. Their CSS was
still shipping in the published stylesheet. This round removes the paint, not the drawing.

## 2. Why the dead CSS was still being published

This is the finding worth keeping. The rules live in `@layer components`, and
`tailwind.config.mjs` sets `content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}']`.
Tailwind keeps `@layer components` rules whose class names it finds in that glob — and
**the retired components are inside `src/`, still carrying those class names**. The
retained record was therefore holding its own dead CSS alive.

That splits the dead CSS into two tiers, which must not be reported as one:

| Dead thing                                           | In the published CSS? | Why                                                                |
| ---------------------------------------------------- | --------------------- | ------------------------------------------------------------------ |
| `.global-science`, `.sci-*`, `@keyframes sci-drift`  | **Yes** — real gain   | class names still present in `src/components/*.astro`              |
| `--science-*`, `--formula-opacity`, `--grid-opacity` | **Yes** — real gain   | declared in `@layer base` `:root`, which is not content-scanned    |
| `.field-grid`, `.concept-note`                       | **No** — zero gain    | referenced by no source file, so Tailwind had already dropped them |

So `.field-grid` / `.concept-note` were removed as **source hygiene only**. They contribute
0 bytes to the measured delta. The earlier estimate of "~1,051 bytes of dead rules" was
narrower than the truth in one direction (it counted only the `.sci-*` block) and wider in
another (it assumed all of it was published).

## 3. What was removed

`src/styles/global.css` (1,124 → 953 lines):

- `.global-science`, `.sci-composition`, `.sci-composition svg`, `.sci-major`, `.sci-bio`,
  `.sci-formula`, `.sci-grid`, `.sci-accent`, `.sci-formula text`, `.sci-drift`,
  `@keyframes sci-drift` (the 78 s drift), and both media queries that referenced them
- the print sheet's `.global-science`, `.canvas-field`, `.ambient` entries
- `--science-major`, `--science-bio`, `--science-formula`, `--science-grid`,
  `--science-accent` — the five weight tokens, consumed only by the rules above
- `--formula-opacity`, `--grid-opacity` — no consumer anywhere in `src/`
- `.field-grid`, `.field-grid > *`, `.concept-note` — dead since v1.7, already purged
- the comment above the artwork tokens that explained the now-deleted `--science-*` layer

`scripts/qa-canvas-report.mjs` and its `package.json` script `qa:canvas` — the whole script
queried `.global-science`, so it had nothing left to read.

`scripts/check-theme-system.mjs` — 8 tokens dropped from `REQUIRED_TOKENS` (44 → 37).

`scripts/check-visual-system.mjs` — comment only, recording that the paint is gone while the
drawings remain, so that a future re-import is understood to need its styling restored too.

## 4. One token had to be kept

`--science-bio-ink` is **not** a dead token, and removing it turned a gate red:

```
Theme gate FAILED:
  ✗ undefined custom property --science-bio-ink in src\components\HeroComposition.astro
  ✗ undefined custom property --science-bio-ink in src\components\MidComposition.astro   (x3)
```

`check-theme-system.mjs` §2 requires every `var()` under `src/` to resolve, and the retained
compositions reference `--science-bio-ink` five times. It is a **live dependency of the
record**. It was restored in all three theme blocks, with a comment in the gate explaining
why it is not to be treated as dead next time.

The distinguishing rule: classify a token by **who consumes it**, not by whether its name
looks like the retired system.

## 5. Attribution — every count change explained

| Gate / count                                    | Before                 | After        | Δ       | Attribution                                                                                                                      |
| ----------------------------------------------- | ---------------------- | ------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `theme` checks                                  | 1074                   | 1022         | **−52** | −21 REQUIRED_TOKENS 44→37 × 3 themes; −14 paper-token parity × 2 themes (paper 56→49); −17 `var()` refs in `global.css` (111→94) |
| `typecheck` files                               | 108                    | 107          | **−1**  | the deleted `.mjs`; `tsconfig.include` lists `**/*.mjs`                                                                          |
| `REQUIRED_TOKENS`                               | 44                     | 37           | **−7**  | 8 removed, 1 (`science-bio-ink`) restored                                                                                        |
| `verify`                                        | 75/26/628/22           | 75/26/628/22 | 0       | —                                                                                                                                |
| `artifacts` / `science` / `visual` / `identity` | 137 / 1895 / 745 / 412 | same         | 0       | —                                                                                                                                |
| Playwright                                      | 327/5/0                | 327/5/0      | 0       | —                                                                                                                                |
| `dist` files                                    | 75                     | 75           | 0       | —                                                                                                                                |

−52 is accounted for in full; no residual.

## 6. Verification

- `lint` exit 0 · `typecheck` 107 files, 0 errors / 0 warnings / 0 hints · `build` exit 0, 26 pages
- all six gates exit 0 (numbers in §5)
- Playwright `--workers=1` (the CI configuration): **327 passed, 5 skipped, 0 failed**
- CI `35521032884`: **success** — build job 23 steps + deploy job 3 steps, **0 non-success**.
  Structurally identical to the previous run (`35519159011`). Note for the record: the
  "26 steps" figure used in earlier reports is the **two jobs added together**, not one job.
- published CSS, measured in the build rather than inferred:
  `dist/_astro/about.*.css` **38,724 → 37,396 bytes (−1,328)**; hash `CGhUF7vN` → `CoQ73op4`
- every removed pattern is now **0 occurrences** in the published CSS, while `--bg-bio-ink`
  (the live v2.2 token, a different token from `--science-bio-ink`) is untouched at 5

## 7. Live verification

- `Content-Length` of `/_astro/about.CoQ73op4.css` = **37,396** = the `dist` size, on the first attempt
- the fetched body `cmp`s **byte-identical** to `dist`
- in that live file: `global-science` 0, `sci-drift` 0, `science-major` 0, `formula-opacity` 0,
  `grid-opacity` 0, `field-grid` 0, `concept-note` 0 — and `science-bio-ink` 3, `bg-bio-ink` 5
- `/` and `/about/` render `global-science` 0 and `sci-` 0, with `editorial-bg` present once

Two traps hit while doing this, both worth recording:

1. **`git checkout -- <file>` destroyed the unstaged work.** It restores from the index, and
   the round's edits were not yet staged — both `global.css` and `check-theme-system.mjs`
   snapped back to HEAD and the whole round had to be redone. Comparisons must use a copy
   (`cp`, or `git show HEAD:<file> > chkver-<name>`), never `checkout`.
2. **This environment has no `/tmp`.** `curl -o /tmp/x.css` fails silently, after which
   `grep` returns 0 for everything — which reads exactly like "the live file is clean".
   A downloaded file must be length-checked with `wc -c` before it is grepped.

## 8. Deliberately not done

- **The five components were not deleted.** That is an explicit, documented Owner decision,
  and the visual gate asserts their presence. Removing their styling does mean a re-import
  would render unstyled; that is now stated in the gate's own comment rather than left to be
  rediscovered.
- **`README.md` was not changed.** It was re-audited against source for this round and found
  to have **zero drift**: it never listed `qa:canvas`, never listed any removed token, and its
  description of the visual gate is still accurate.
- **Three touched files are Prettier-dirty — and were already dirty at HEAD**
  (`global.css`, `check-theme-system.mjs`, `check-visual-system.mjs`). Following the repo's
  annotate-don't-rewrite convention they were left alone; the dirt is pre-existing and does
  not touch any line added here.

## 9. Open items

None from this round. The retired components remain in `src/components/` under the standing
Owner decision; if that decision is ever revisited, the gate's `RETIRED` section, the README
note and the print sheet are the places that reference them.
