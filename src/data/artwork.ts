/**
 * Artwork presentation data (v2.0, extended in v2.1).
 *
 * What the *pages* need to know about the images, as opposed to what the images
 * are. Nothing here is a claim: every drawing is the owner's asset or the
 * site's own vector artwork, and the evidence layer remains the only record of
 * project state.
 *
 *   ARTWORK_LABELS   the spoken description of each drawing. The drawings carry
 *                    meaning, so each one is exposed as a labelled image rather
 *                    than as silent decoration.
 *
 *   ART_ALT          the short alternative text a photograph needs. Deliberately
 *                    not `ARTWORK_LABELS`: that map substitutes for the drawing
 *                    entirely, while a raster asset needs one line that names its
 *                    subject and then gets out of the way.
 *
 *   ART_PLACEMENT    where each asset sits inside its frame, and how tall the
 *                    frame is.
 *
 * Renamed from `home.ts` in v2.1: /projects, /research and /about read from it
 * now, so it is no longer homepage data. The two status maps that used to live
 * here moved to `src/lib/projectStatus.ts`, which is where the decision about
 * *which* evidence field a page prints belongs.
 */
import type { Lang } from '../i18n/ui';

export const ARTWORK_LABELS: Record<string, Record<Lang, string>> = {
  hero: {
    en: 'Homepage artwork: a scientific field drawn as contour lines — a biological state landscape with a stippled ridge, crossed by one trajectory that rises from the lower left and leaves at the upper right.',
    zh: '首页主视觉：一片由等高线画成的科学场域——生物状态地形，场脊以点阵渲染出明暗；一条轨迹自画面左下穿过场域，在右上离开。',
  },
  wennian: {
    en: 'Project artwork: an irregular biological state form with three fainter outlines behind it standing for the same state at later times, a row of fine ticks along the foot for many measured dimensions, and one curve rising from the lower left.',
    zh: '项目主视觉：一个不规则的生物状态形体，其后三条更淡的轮廓表示同一状态在之后时间的位置，底部一排细密刻度表示多维测量，一条曲线自左下升起。',
  },
  hycell: {
    en: 'Project artwork: a cell form with internal structure, one trajectory entering from the left and crossing it to a target state at the upper right, and a shorter branch settling below.',
    zh: '项目主视觉：一个带有内部结构的细胞形体，一条轨迹自左侧穿入、穿过细胞抵达右上角的目标状态，另有一条较短的支线在下方沉降。',
  },
  morn: {
    en: 'Project artwork: three plateaus stepping up the frame, with one thread entering at the lower left, passing through each of them in turn, and leaving at the upper right.',
    zh: '项目主视觉：三个依次抬升的台地，一条线程自左下进入，依次穿过三个台地，从右上离开。',
  },
  biopulse: {
    en: 'Project artwork: six streams entering from the left, gathering into a single channel at the centre of the frame, and continuing to the upper right as one record.',
    zh: '项目主视觉：六束细流自左侧汇入，在画面中部收束为一条记录，随后向右上延伸。',
  },
  /* v2.1 (§23–§24, §30–§31): the two page-level artworks. The owner's official
     raster files were integrated in the FINAL CLOSURE round, so these two
     entries now describe what actually renders rather than the placeholder
     drawings they used to stand for. Same paper and ink weight as the five
     above, but neither repeats the hero's profile nor a project's composition. */
  research: {
    en: 'Page artwork: a warm paper field with a layered neural network at its centre, flanked by mathematical notation — a loss function, a parameterisation, a diffusion term, a log-probability — and by cell forms, a DNA helix, a protein ribbon and molecular structures. AI, mathematics and life science in one drawing.',
    zh: '页面主视觉：一片暖色纸面，中央是分层神经网络，两侧散布数学记号——损失函数、参数化式、扩散项与对数概率——并伴有细胞形态、DNA 双螺旋、蛋白带状结构与分子结构。AI、数学与生命科学共处一图。',
  },
  about: {
    en: 'Page artwork: a personal research desk on warm paper — an open notebook of hand-written mathematics, a cup, a specimen branch, a glass flask and a stack of books, with a neural network, a brain, a DNA helix and a wall of formulas behind them.',
    zh: '页面主视觉：暖色纸面上的一张个人研究工作台——摊开的手写数学笔记、杯子、标本枝叶、玻璃瓶与一摞书，其后是神经网络、大脑、DNA 双螺旋与满墙公式。',
  },
};

/**
 * Where each official raster asset sits inside its frame, and how tall the frame
 * is. Used only when the owner's WebP files are present; the SVG placeholders
 * carry their own proportions.
 *
 * `position` is the CSS `object-position`. §28 is explicit that one value must
 * not be reused across the four project images, and §10 is explicit that the
 * hero must not default to `center center`.
 *
 * Chosen by rendering the actual crop (`object-fit: cover` reproduced in sharp)
 * and looking at it, not by arithmetic — the five sources disagree about where
 * their subject is, and two of them (Morn, BioPulse) put content across the full
 * width, so the crop budget had to be checked against the picture.
 *
 * A note on the vertical component: every source is wider than its frame
 * (1586×992 and 1672×941 against a 3:2 and a 4:3 frame), so `cover` crops width
 * only and the Y value has no effect at the ratios chosen here. It is left at
 * 50% rather than given a value that would look like a decision but do nothing.
 *
 * `ratio` is the frame's aspect ratio. It is uniform across the four project
 * rows, because §26 asks for a consistent row height and visual rhythm, while the
 * source images are allowed to differ (§27) — `object-fit: cover` plus the
 * per-image position is what reconciles the two.
 */
export interface ArtworkPlacement {
  position: string;
  ratio: string;
  /**
   * §26/§27: a phone frame is a different crop, not a smaller one, so a slot may
   * declare its own mobile frame and position. Both fall back to the desktop
   * values, which keeps this optional rather than a second required table.
   */
  mobilePosition?: string;
  mobileRatio?: string;
}

export const ART_PLACEMENT: Record<string, ArtworkPlacement> = {
  /* 4:3 rather than the source's 1.6, cropping 16.6% — all of it from the right.
     The artwork's subject is the profile, and the whole left third of the file is
     bare paper. Taking the crop off the right edge slides the face from the
     middle of the frame to roughly 56–70% across, which is the "right-centre"
     §10 asks for, while the untouched left third becomes the fade zone §9 wants.
     Checked against the alternative (3:2, 6% crop, face near centre): that kept
     more mountain at the right edge but left the face where the text column
     starts, which is the thing §10 is guarding against. */
  hero: { position: '0% 50%', ratio: '4 / 3' },

  /* 3:2 across the four rows: a 15.6% width crop, which every composition
     survives intact (verified per image). The X values differ because the
     subjects do — ZhiShen's figure sits a little left of centre and its rising
     trajectory runs off the right, so its crop is biased right; HyCell's large
     cell sits right of centre with a molecular thread entering from the left, so
     its crop is biased left to keep the cell whole; Morn and BioPulse distribute
     content evenly and are left centred. */
  wennian: { position: '46% 50%', ratio: '3 / 2' },
  hycell: { position: '44% 50%', ratio: '3 / 2' },
  morn: { position: '50% 50%', ratio: '3 / 2' },
  biopulse: { position: '52% 50%', ratio: '3 / 2' },

  /* v2.1 FINAL CLOSURE: the two page bands, now carrying the owner's official
     raster artwork. Both sources are 1774×887 — exactly 2:1 — with the subject
     mass on the right and a wide empty left margin, so the frame and the
     position were both chosen against the picture rather than assumed.

     Measured, not guessed: a per-column luminance-variance profile puts the
     first real ink at 45.3% across for /research and 29.1% for /about, which is
     what makes the left margin safe to spend.

     The frame is 8:5 rather than the source's 2:1. A 2:1 frame crops nothing,
     so `object-position` would be a no-op and the band would be a flat 1088×544
     strip of mostly empty paper. 8:5 spends 20% of the width — all of it the
     dead left margin — and the position is 100% so that *nothing* is taken from
     the right, where every named element sits: for /research the DNA helix, the
     protein ribbon and the molecular structures; for /about the book stack and
     the plant. A 3:2 or 4:3 frame would have cropped that right edge.

     Checked by rendering the crop (`npm run artwork:preview`) and looking at it,
     per §18/§22. The brief's opening values — 70% and 72% — were tried first and
     both clipped the DNA helix, which §18 forbids; 100% is the fine-tune. */
  research: {
    position: '100% 50%',
    ratio: '8 / 5',
    /* §27: the phone frame is tighter so the network reads at 342px wide. 4:3 at
       84% shows 28.0%–94.6% of the source — the neural network, both equations,
       the log-probability, the cell forms and the body of the helix all survive;
       the outer 5.4% is the helix's tail and molecular edge, which the band's
       own right-edge feather softens anyway. */
    mobilePosition: '84% 50%',
    mobileRatio: '4 / 3',
  },
  about: {
    position: '100% 50%',
    ratio: '8 / 5',
    /* §27: /about carries less dead margin (ink starts at 29.1%), so its phone
       crop is gentler than /research's. 3:2 at 90% shows 22.5%–97.5% — the
       notebook, the cup, the desk surface, the flask and the book stack are all
       inside the frame. §22's "do not end up with only the wall formulas" is
       the reason the window stays low and wide. */
    mobilePosition: '90% 50%',
    mobileRatio: '3 / 2',
  },
};

/**
 * How wide each frame actually is, at each breakpoint (§80–§82).
 *
 * Written per layout rather than as a blanket `100vw`, because the three
 * layouts this site uses are genuinely different widths and the difference is
 * large enough to change which file the browser downloads:
 *
 *   hero      one column of the hero grid — 1.08fr of 1.84fr of the shell,
 *             measured at 632px on the widest breakpoint
 *   row       the 59fr track of a featured row (homepage)
 *   entry     one column of the two-column grid on /projects — about 46vw in
 *             the middle band, which is *narrower* than a homepage row, so the
 *             two share an asset but not a `sizes`
 *   band      the /research and /about strip, now capped at 56rem
 *
 * The mobile branch is `calc(100vw - 3rem)` rather than `100vw`: the shell
 * gutters are 1.5rem a side below 768px, and asking for the full viewport would
 * make a 390px phone fetch the 960px file instead of the 640px one — which is
 * exactly the waste §23 is about.
 *
 * These are layout facts, so they live next to `ART_PLACEMENT` and not in the
 * image pipeline. The pipeline knows how wide the files are; only the page
 * knows how wide the hole is.
 */
const ROW_SIZES = '(min-width: 1200px) 662px, (min-width: 900px) 59vw, calc(100vw - 3rem)';
export const ENTRY_SIZES = '(min-width: 1200px) 540px, (min-width: 760px) 46vw, calc(100vw - 3rem)';
export const BAND_SIZES = '(min-width: 900px) 896px, calc(100vw - 3rem)';

export const ART_SIZES: Record<string, string> = {
  hero: '(min-width: 1200px) 632px, (min-width: 900px) 52vw, calc(100vw - 3rem)',
  wennian: ROW_SIZES,
  hycell: ROW_SIZES,
  morn: ROW_SIZES,
  biopulse: ROW_SIZES,
  research: BAND_SIZES,
  about: BAND_SIZES,
};

/**
 * Short alternative text for the raster assets (§50).
 *
 * Deliberately not `ARTWORK_LABELS`: that map is a spoken description of the
 * placeholder drawings, written for a screen reader that has to substitute for
 * the drawing entirely. A photograph needs one line that names its subject and
 * then gets out of the way — and it must not restate the project copy sitting
 * beside it on the same row.
 */
export const ART_ALT: Record<string, Record<Lang, string>> = {
  hero: {
    en: 'Editorial artwork: a profile portrait with a DNA helix and biological structure, set against a landscape.',
    zh: '编辑插画：人物侧面、DNA 双螺旋与生物结构，融入山水背景。',
  },
  wennian: {
    en: 'Concept artwork for ageing assessment and biological state.',
    zh: '衰老评估与生物状态主题概念视觉。',
  },
  hycell: {
    en: 'Concept artwork for cell-state evolution.',
    zh: '细胞状态演化主题概念视觉。',
  },
  morn: {
    en: 'Concept artwork for a local multi-agent workspace.',
    zh: '本地多智能体工作空间主题概念视觉。',
  },
  biopulse: {
    en: 'Concept artwork for converging evidence streams.',
    zh: '多源证据汇聚主题概念视觉。',
  },
  research: {
    en: 'Editorial artwork combining AI, mathematics and life science research',
    zh: 'AI、数学与生命科学交叉研究主题视觉',
  },
  about: {
    en: 'Editorial research desk combining mathematics, biology and computational work',
    zh: '融合数学、生命科学与计算研究元素的个人研究工作台视觉',
  },
};
