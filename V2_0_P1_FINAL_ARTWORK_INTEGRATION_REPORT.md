# V2.0-P1 — Final Artwork Integration & Homepage Polish

**Status: `WAITING_FOR_OWNER_FINAL_VISUAL_APPROVAL`**

Not a release. Nothing has been merged to `main`, nothing has been deployed. The
round integrates the five confirmed visual assets into the frozen v2.0-P0
structure, removes the last section the brief asked to remove, normalises the
source filenames, and stops.

The brief's own instruction for this round: *do not ask "what else can I design?"
— ask "how do I faithfully place the already-confirmed visual assets into the
already-confirmed structure?"* (§62). That is what the round did, and the places
where the answer was "I cannot do this from here" are in §14.

### Approval round — five narrow changes, no redesign

After the integration was reviewed, the owner asked for five corrections and an
explicit stop. All five are recorded below; none of them touches structure,
layout, artwork content or the evidence layer:

| # | Change | Where it landed |
| --- | --- | --- |
| 1 | Source files renamed to the canonical `<slot>-source.png` set | §2 — verified by MD5 on both sides; WebP output byte-identical |
| 2 | ZhiShen · WenNian status aligned with the evidence wording | §14.3 — now leads with `evidence.headline` verbatim |
| 3 | The 128ms figure relabelled as local resource timing, not Web Vitals | §9 — heading, framing and the number itself all corrected |
| 4 | Screenshot set cut to the four required frames | §11 — White/Night review aids removed from the directory |
| 5 | Stop after the screenshots | §15 — nothing committed, merged or deployed |

The optimizer was extended by one rule so change 1 is honoured rather than
tolerated: a trailing `source` token is stripped before matching, which moves the
canonical names from the alias fallback onto the exact-match pass. The script now
prints how each file was found, so "the contract is being honoured" and "an alias
happened to catch it" are distinguishable at a glance rather than by inference.

---

## 1. Asset list

Five official assets, all present, all integrated. The homepage no longer renders
a placeholder anywhere.

| Slot | Served file | Intrinsic | Weight | Role |
| --- | --- | --- | --- | --- |
| Hero | `public/images/home/v2/hero.webp` | 1586 × 992 | 180 KB | LCP candidate (local) |
| ZhiShen · WenNian | `public/images/home/v2/wennian.webp` | 1600 × 900 | 129 KB | row 1 plate |
| HyCell | `public/images/home/v2/hycell.webp` | 1600 × 900 | 182 KB | row 2 plate |
| Morn | `public/images/home/v2/morn.webp` | 1600 × 900 | 128 KB | row 3 plate |
| BioPulse | `public/images/home/v2/biopulse.webp` | 1600 × 900 | 196 KB | row 4 plate |

**814 KB total**, down from 9.5 MB of source PNG. No image was redrawn, restyled
or substituted (§2). `src/assets/home/*.svg` — the P0 placeholder drawings — is
still in the repository as the fallback branch, but nothing renders it: the
`visual` gate asserts `data-artwork-source="asset"` on all five frames.

## 2. Source → WebP mapping

The source filenames have been normalised to the canonical set the handover
specified. They arrived as `hero.png`, `知身·问年.png`, `hycell.png`, `morn.png`,
`biopulse.png` — one named in Chinese, none matching the `*-source.png` pattern —
and were renamed **without touching a single byte of image data**:

| before | after | MD5 (unchanged) |
| --- | --- | --- |
| `hero.png` | `hero-source.png` | `c539034fc48fb6107869b21ebd4e84bb` |
| `知身·问年.png` | `wennian-source.png` | `90b485645b50b2f0c00c9d6cbdec79e9` |
| `hycell.png` | `hycell-source.png` | `599d8a3b256c7ebb7daa6a961e12c864` |
| `morn.png` | `morn-source.png` | `b4c7bb01b65406ef76a28276fd6e42fb` |
| `biopulse.png` | `biopulse-source.png` | `031101a4a411a25953183baca2f3e79b` |

Each checksum after the rename matches its pre-rename value exactly, and the five
generated WebP files came out byte-identical on the re-run
(`7e21c5fe…` hero, `921fb4b7…` wennian, `11dac0ec…` hycell, `6e63ea53…` morn,
`638c2ec7…` biopulse). The rename changed names and nothing else.

`scripts/optimize-home-images.mjs` (`npm run artwork:v2`) now resolves the
canonical names through its exact-match pass: the `<slot>-source` suffix is
stripped before comparison, so `hero-source.png` is matched as the statement of
intent it is rather than being rescued by an alias. The tolerance underneath is
kept, deliberately — matching is still by normalised stem, exact match first,
then a per-slot alias list (`知身` / `问年` / `zhishen` / `wennian` all resolve to
the WenNian slot), and two files claiming one slot is a hard error rather than a
silent pick. That tolerance is what let the assets be integrated before they were
renamed, and it is what will absorb the next naming surprise instead of failing
the build. The run prints how each file was found (`via alias` when the canonical
name was not what resolved it), so the naming contract can be confirmed from the
output rather than inferred from it.

```
hero-source.png       2.41 MB  →  hero.webp      1586×992   180 KB   (downscale to 2000 target skipped: source is smaller)
wennian-source.png    2.30 MB  →  wennian.webp   1600×900   129 KB
hycell-source.png     2.34 MB  →  hycell.webp    1600×900   182 KB
morn-source.png       2.01 MB  →  morn.webp      1600×900   128 KB
biopulse-source.png   2.42 MB  →  biopulse.webp  1600×900   196 KB
```

Originals are kept verbatim in `public/images/home/v2/source/` as the archival
copy.

⚠ **They are served, contrary to what this report said in the integration round.**
Everything under `public/` is copied verbatim into `dist/` by the Astro build, so
the five source PNGs are published at `/images/home/v2/source/*.png` — 11.9 MB of
unused originals on a public, guessable URL. Verified, not inferred:
`curl -sI …/source/hero-source.png` returns `200` with
`Content-Length: 2527367`. The same applies to `public/images/home/v2/README.md`.
**Not fixed in this round, because the owner's instruction was to stop.** The
remediation is in §14.9 and is a one-line move.

The run also writes `src/data/home-artwork.generated.json`, which is what the
page reads for intrinsic width/height. That is the mechanism behind §49: the row
reserves its space from the manifest before the bytes arrive.

**One deviation, stated plainly:** the hero source is 1586px wide, below the
1800–2200px window §5 asks for. The optimizer does not upscale — blowing a
1586px file up to 1800 would add bytes and lose detail at the same time — so the
hero ships at 1586px and the run prints a warning. At the size the hero actually
renders (606 CSS px, so 1212 device px at 2×) this is still a 1.3× oversupply.
No quality was lost; the brief's window was simply written for a larger original.

## 3. Hero integration

The hero frame is deliberately not a container. There is no card, no border, no
radius, no shadow, no fill (§7) — the image is a `<img>` in the page flow with a
mask on it.

**Frame and crop.** `aspect-ratio: 4 / 3`, `object-fit: cover`,
`object-position: 0% 50%`. The source is 1.6:1, so the frame crops 16.6% — and
all of it comes off the right edge. That is the point: the artwork's subject is
the profile and its entire left third is bare paper, so cropping from the right
slides the face from the middle of the frame to roughly 56–70% across, which is
the "right-centre" §10 asks for, while the untouched left third becomes the fade
zone §9 wants. The alternative (3:2, 6% crop, face near centre) was rendered and
rejected: it kept more mountain at the right edge but left the face exactly where
the text column ends, which is what §10 guards against.

**The left fade (§9).** A `mask-image` ramp on the image — transparent, then
0.22, then 0.68, then solid at 38% — rather than a gradient painted in
`#f0eee8`. A mask keeps the fade correct in all three themes without hard-coding
the canvas colour.

**Edge feathering (§11).** The artwork's own paper ground is a shade warmer than
the canvas (`#f3ebdf` against `#f0eee8`), so an unfeathered frame ends on a
visible vertical step at the right. The same `to right` gradient closes again
over the last 3.5%, and a second mask on the wrapper feathers the top and bottom
by 3%. Masks on nested elements multiply, which is how three extra edges are
handled without `mask-composite` and its vendor-prefix differences. No straight
line survives anywhere on the hero frame.

**Split (§8).** Copy 426px, artwork 606px, measured against the 1088px content
box — **39.2% / 55.7%**, both inside the 38–45% and 55–62% windows. The grid
moved from `1fr / 1.06fr` to `0.76fr / 1.08fr` with a tighter column gap to get
there.

**Structure frozen (§6).** Name, role line, statement, support line, three
buttons — unchanged. No information architecture was touched.

## 4. Project row integration

**Order and alternation (§15, §16).** ZhiShen · WenNian → HyCell → Morn →
BioPulse, top to bottom, image left / right / left / right. Asserted in the
browser suite and printed by the screenshot QA on every run.

**Tracks (§25).** Three explicit grid tracks — `59fr / 7fr / 34fr` — so the
drawing takes 59%, the words 34%, and the empty middle track is the separator.
The previous 12-column grid with a 72px column gap produced the same two blocks
on paper but spent 73% of the row on gutters (eleven ~25px columns separated by
72px of nothing); measured, it came out art 55.6% / copy 29%, and the copy fell
below the 32–40% the brief asks for. Now measured at **art 59% / copy 34%**, both
in band. The 59% is also what puts the row at **428px**, inside §26's 420–520
band, without shrinking the image to get there.

**Not cards (§17, §18).** No border, no card fill, no radius, no shadow, no
panel, no status pill. Rows are separated by whitespace. A very light hairline
between rows was considered and not used — four rules across four rows is the
"borders everywhere" problem §26 of the P0 brief named.

**Content (§19, §20).** Name · type line · one sentence · one status · one link
(plus the repository). No index number, no category eyebrow, no tags, no keyword
list, no capability chips, no proof line, no duplicate status. The `visual` gate
fails the build if any of them returns.

**Copy (§21–§24).** The type line is each project's own `coverType`, unchanged —
it already read exactly as the brief specifies for all four. The sentence below
it is the brief's §21–§24 copy, added verbatim, English equivalent written for
the `/` mirror. The status line is the brief's wording too; see §14 for the one
place that differs from `evidence.headline`.

**Status styling (§41).** A 5px dot and plain text, no pill, no badge. The dot is
a CSS pseudo-element, so the accessible text stays the status alone and a screen
reader never announces a bullet.

**No buttons in the project area (§42).** "查看项目 →" and "GitHub ↗" are text
links. The three buttons are hero-only.

## 5. Removed: the scientific canvas

`GlobalScientificCanvas` was already off the homepage in P0 (`BaseLayout` takes
`canvas={false}`). This round verified it rather than re-doing it: the homepage
carries `data-artwork` five times and `data-global-scientific-canvas` zero times,
and the `visual` gate fails if that changes. The component and its compositions
still exist and still render on the inner pages.

## 6. Removed: Mathematics × Biology × AI

**This was a real, live violation of §32 and it is now fixed.** Both homepages
were still rendering `<MathematicsBiologyAI />` between the work and the contact
band. It is gone from `/` and `/zh/`:

- the component import and the section element were removed from both pages;
- the homepage is now **three content areas**, not four — Hero · Featured
  Projects · Contact (§34);
- with the band went the last standalone formula the homepage printed (`zₜ₊₁ =
  F(zₜ, aₜ)`), which §37 also asked for. There is no MathML anywhere on the
  homepage now;
- the `visual` gate was extended to fail on `id="mathbio"`, on
  `class="statement-band"`, on any `<math>` element, and on more than three
  content areas — so it cannot come back unnoticed.

**§33 respected:** the content was not deleted. `/research` still renders the full
`MathematicalBiology` section — its heading, its four-step loop, its figure set
and its three questions. A browser test now asserts that the band is *absent from
the homepage* and *present on /research*, in one place, so the pair cannot drift.

## 7. Mobile

**Hero (§45, §46).** Text first, then the artwork — 390px, copy at y=120, artwork
at y=487. Full width (342px of the 390 viewport), natural crop, and the desktop
left fade dropped, because there is no text beside it to fade towards and keeping
it would eat a third of a small image.

**Projects (§47).** Image → name → type → sentence → status → link, identical for
all four. Asserted as a set: the QA prints the order of all four rows and fails
the review if they are not all the same.

## 8. Image sizes

Against §5's targets:

| Slot | Target width | Actual | Target weight | Actual |
| --- | --- | --- | --- | --- |
| Hero | 1800–2200 | 1586 (source limit) | < 500–700 KB | **180 KB** |
| Projects | 1400–1800 | 1600 | < 350–500 KB | **128–196 KB** |

Every file is comfortably inside its byte budget — the largest is 196 KB against
a 500 KB ceiling — so §53's "do not over-optimise" never came into play: there was
no pressure to trade quality for weight, and none was traded. WebP quality is 82
for the plates and 84 for the hero. `--avif` is available on the optimizer but was
not used; at these byte counts a second format would add build time for a saving
the LCP candidate does not need.

## 9. LCP candidate and image weight (§52)

**This section reports a local resource-timing observation, not a Web Vitals
result.** There is no field data here and nothing below should be quoted as a
performance figure.

The measurement is a cold load of the local preview server on `127.0.0.1`:
loopback, unthrottled, no network latency, no CDN, no TLS handshake, no content
negotiation, and a warm filesystem. No visitor is ever in those conditions, so the
millisecond value carries no meaning as a claim about the site. It is recorded
only so the run is reproducible.

What the observation *is* good for is the two facts that do not depend on the
machine — which element the browser selects as the LCP candidate, and whether that
element carries the loading hints §48 asks for:

```
LCP candidate     <img>  hero.webp          ← the element the browser picks
candidate hints   loading="eager" fetchpriority="high"
resource timing   128ms / 108ms on two runs (loopback preview — NOT a field measurement)
size              275010px²

  180 KB  eager  /images/home/v2/hero.webp
  129 KB  lazy   /images/home/v2/wennian.webp
  182 KB  lazy   /images/home/v2/hycell.webp
  128 KB  lazy   /images/home/v2/morn.webp
  196 KB  lazy   /images/home/v2/biopulse.webp
  815 KB  total across 5 images
```

**The defensible claims are:** the hero asset is the LCP candidate, it is the only
eager image on the page, it is marked `fetchpriority="high"`, and the four plates
are `loading="lazy"` (§48).

**The millisecond figure is not one of the claims, and it is not a Web Vitals
result.** Two runs of the same harness on the same machine produced 128ms and
108ms; the number is a property of the loopback preview, not of the site. It is
recorded as a local resource-timing observation so the run is reproducible, and
for no other purpose. A production LCP number requires field data (CrUX or RUM)
or a throttled lab run against the deployed origin; neither was done this round,
and nothing here should be quoted as a performance figure. What is structural
rather than timing-dependent — which element is prioritised, and that its
dimensions are declared in advance — is what the round actually verifies.

**CLS (§49).** Every frame carries an `aspect-ratio`, every `<img>` carries
`width` and `height` from the generated manifest, and the `visual` gate fails if
an official asset omits them. The row cannot reflow as the bytes arrive. This one
is structural rather than timing-dependent, so it holds outside the harness.

## 10. Accessibility (§50, §51)

- The hero artwork carries a short descriptive `alt` (it carries the page's
  scientific identity, so it is not `alt=""`); each project plate carries a short
  `alt` that names its subject and does not restate the sentence beside it.
- The placeholder drawings keep their long spoken `aria-label` on the fallback
  branch. The `visual` gate holds both branches to a ≥12-character label.
- The status dot is decorative CSS, not content.
- No information exists only inside an image — every project's name, type,
  sentence, status and link are live text.
- Contrast, focus order and keyboard behaviour are unchanged from P0, and the
  `theme` gate still passes across all three themes.

## 11. Screenshots (§54)

`.qa-screens/v20p1/` — regenerate with `npm run qa:v20p1`.

The export set is exactly four frames:

| File | What |
| --- | --- |
| `hero-paper-1440.png` | first screen, Paper, 1440 × 900 |
| `projects-paper-1440.png` | `#work`, captured as an element |
| `homepage-paper-1440.png` | whole document, Paper (3635px) |
| `homepage-390-mobile.png` | whole document, 390px |

White and Night frames were produced during the round as review aids and are not
part of this set; they have been removed from the directory, and the script now
writes them only when explicitly asked (`npm run qa:v20p1 -- --themes`).

The script prints the geometry §8/§25/§26 are written in numbers about, so a
review does not have to be done by eye:

```
document 3635px   main sections 3   #mathbio absent ✓
hero     684px    copy 39.2% (38–45%)   artwork 55.7% (55–62%)
row 1  wennian   428px  art 59% left   copy 34%   [asset]  开源 MVP · 持续开发中
row 2  hycell    428px  art 59% right  copy 34%   [asset]  研究原型
row 3  morn      428px  art 59% left   copy 34%   [asset]  公开仓库
row 4  biopulse  428px  art 59% right  copy 34%   [asset]  公开仓库
mobile   hero copy first ✓   rows art→copy ×4, consistent ✓
```

All four frames were re-exported after the status-wording change. The geometry is
byte-for-byte the same set of numbers as before the change — 3635px document,
684px hero, 428px rows, 39.2% / 55.7% hero split, 59% / 34% rows — which is the
expected result: the wording is a swap of equal-length strings inside a single
line, and it moved nothing. The ZhiShen row in the capture now reads
`开源 MVP · 持续开发中`; in the English capture the same row reads
`Open-source MVP · Active Development`.

## 12. lint / typecheck / build

```
npm run lint        clean (eslint, 0 problems)
npm run typecheck   clean (astro check, 133 files, 0 errors / 0 warnings / 0 hints)
npm run build       26 pages, complete
npm run verify      PASS  (67 files, 26 HTML pages, 654 internal links, 10 local assets)
npm run theme       PASS  (1420 checks — 3 themes × 45 required tokens)
npm run artifacts   PASS  (145 checks)
npm run science     PASS  (2322 checks)
npm run visual      PASS  (423 checks)
npm run identity    PASS  (462 assertions)
```

Two gates were **extended**, not weakened:

- `check-visual-system.mjs` now branches on `data-artwork-source` and holds the
  official-asset branch to `alt` + declared intrinsic size. Asserting only on the
  placeholder `<svg>` would have made the gate pass exactly while the real assets
  were missing and start failing the moment they landed — backwards. The row text
  budget was raised (zh 60 → 95, en 120 → 240) to admit the §21–§24 sentence; it
  is still a ceiling that a second description or a proof line would trip. Three
  new homepage assertions were added (§6 above).
- `tests/site.spec.ts` gained `expectArtworkLabelled()`, which asserts the
  invariant — a labelled image with a declared size — against whichever source is
  active, rather than against a tag.

## 13. Tests

```
npx playwright test   →   299 passed · 7 skipped · 0 failed   (desktop + mobile)
```

Identical to the P0 baseline: same 299, same 7, no new skips and no test
deleted to get there. Three tests were changed, each for a stated reason:

| Test | Change | Why |
| --- | --- | --- |
| `homepage is reduced to four content areas` | → `…three content areas` | §32 removed the fourth |
| `the statement band is one breath…` | → `the mathematics × biology × AI argument still lives on /research` | The band left the homepage; the argument did not leave the site |
| `home page rows carry one reality status each` | expected strings updated | §21–§24 fix the homepage wording |
| `each featured row shows the project and nothing more` | artwork assertion routed through the shared helper | must hold in both source modes |

## 14. Known issues

1. **The hero is 1586px wide, below §5's 1800–2200px window.** The source is the
   limit and upscaling was refused. At its render size this is a 1.3× oversupply,
   so nothing is soft — but the brief's number is not met and it is not met on
   purpose. A larger original is the only real fix.

2. **`object-position` was chosen from rendered crops, and the horizontal values
   are the only ones that do anything.** All five sources are wider than their
   frames, so `cover` crops width only and every Y value is inert. They are left
   at 50% rather than given numbers that would look like decisions and do
   nothing. If a frame ratio is ever made taller than 1.6, the Y values become
   live and need re-checking. The five X values (hero 0%, wennian 46%, hycell 44%,
   morn 50%, biopulse 52%) were each verified by rendering the crop with
   `npm run artwork:preview` and looking at it; they are defensible, not optimal,
   and a review that disagrees can be acted on in one line.

3. **One status line is a wording variant of the truth layer, not a verbatim
   copy.** The divergence flagged at the end of the integration round is closed:
   ZhiShen · WenNian now leads with `evidence.headline` in both locales
   ("Open-source MVP" / "开源 MVP"), where it previously read "Active Development
   · Open Source" / "持续开发 · 开源". The residual is the second clause — the
   English "Active Development" is `evidence.proof[2]` verbatim, while the
   Chinese "持续开发中" is the owner's preferred wording where `evidence.proof[2]`
   reads "持续迭代". Same fact, approved wording, and the only place left where
   an approved string is a variant rather than the identical token. `evidence.ts`
   is untouched (§57); the mapping lives in `HOME_STATUS_TEXT` in
   `src/data/home.ts` and falls back to the evidence layer for any slug it does
   not list.

4. **Night is eased, not designed (§44).** `opacity: 0.95` plus
   `brightness(0.92)` on the artwork. These are light-canvas artworks and they
   still glare against the dark ground; the treatment takes the edge off without
   muddying them and without a second set of files. Night was checked, not tuned.

5. **White and Night were reviewed by screenshot only.** Paper is the acceptance
   theme (§11) and it is the only one with tuned numbers behind it.

6. **English copy for the §21–§24 sentence is newly written.** The brief supplies
   §21 in Chinese and §22–§24 in English; the `/` mirror needed English for
   ZhiShen and Chinese equivalents for the other three. Both are translations of
   the approved sentence, but they are translations, and the English homepage is
   not the reviewed locale.

7. **The hero's left fade is a fixed 38% of the frame.** It is correct for this
   artwork, whose left third is bare paper. A future hero with content closer to
   its left edge would need the ramp shortened, or the mask would eat the subject.

8. **`scripts/qa-mosaic.mjs` is stale.** It is a v1.7 diagnostic that measures
   `data-mosaic-card` and `.statement-band`, neither of which the homepage has
   had since P0. It is not part of `gate` and it does not fail; it simply prints
   zeros. Left in place rather than deleted because it is not this round's file.

9. **The five source PNGs are published to the site — 11.9 MB of dead weight, and
   a factual error in the previous version of this report.** `public/` is a
   pass-through directory in Astro: the build copies it into `dist/` untouched, so
   `public/images/home/v2/source/hero-source.png` ships as
   `/images/home/v2/source/hero-source.png` and answers `200` with a
   `Content-Length` of 2,527,367. Nothing on any page references those paths; they
   are simply there, in the deployed output and in `git`, at a URL anyone can
   guess. `public/images/home/v2/README.md` ships the same way.

   The integration round asserted the opposite ("They are not served") and did not
   test it. That claim is corrected in §2 above. **The defect is left in place
   because this round's instruction was to stop after the screenshots** — but it
   should not survive the commit. Note that the handover itself names this path
   ("源文件位于：`public/images/home/v2/source/`"), so the destination of the move
   needs the owner's agreement; the point is only that it must leave `public/`.
   The fix is a move, not a redesign:

   ```bash
   git mv public/images/home/v2/source assets-src/home-v2   # outside public/
   # then point SOURCE_DIR in scripts/optimize-home-images.mjs at the new path
   ```

   Nothing about the rendering, the crops, the layout or the served WebP files
   changes: the page never referenced `source/`. Re-running the build after the
   move drops `dist/` from 13 MB of homepage imagery to 815 KB of it, and the
   optimizer keeps working because it reads the originals from disk, not from
   `public/`. **Flagged as the one item in this report that is a genuine defect
   rather than a known limitation.**

## 15. Status

```
WAITING_FOR_OWNER_FINAL_VISUAL_APPROVAL
```

Not `PRODUCTION_READY` (§61). Branch `visual-v20-homepage-reset`, nothing merged
to `main`, nothing deployed (§59). P0 is frozen at `865a169` on the same branch,
so the two states can be compared directly.

Per §59, the intended commit — once the screenshots have been looked at — is a
single one:

```
v2.0: final homepage artwork integration and editorial polish
```

### Review checklist (§55)

| | Question | Answer |
| --- | --- | --- |
| A | Does the hero read as a homepage, not a card? | Yes — no fill, border, radius or shadow; three edges feathered, the fourth faded, nothing rectangular visible |
| B | Is the old scientific canvas gone? | Yes — asserted by the `visual` gate |
| C | Are the four projects still stacked top to bottom? | Yes — 知身·问年 · HyCell · Morn · BioPulse, image left / right / left / right |
| D | Do the projects read as work, not cards? | Yes — whitespace and an empty grid track separate them; no rules, no boxes |
| E | Are the images big enough? | 642px wide per row, 59% of the content column, 428px tall |
| F | Is the text minimal? | Name · type · one sentence · one status · one link — 58–59 zh / 183–214 en characters per row |
| G | Is the extra mathematics section gone? | Yes — from both locales, and the `visual` gate fails if it returns |
| H | Does the page end naturally after Contact? | Yes — three content areas, then the minimal footer; 3635px total |

### What was not touched (§57, §58)

`evidence.ts`, résumé, education, employment, project reality, TaiYi, public-code
truth, SEO, canonical, hreflang, `/projects`, `/research`, `/about` — all
untouched. The round changed the homepage and the artwork assets, and nothing
else. `evidence.ts` was read, not written.
