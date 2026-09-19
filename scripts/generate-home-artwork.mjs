/**
 * Homepage artwork generator — v2.0-P0 visual reset.
 *
 * The v1.4–v1.7 homepage was built out of programmatic hairline geometry: a
 * background of captioned plates, then a page-wide field of contour, formula
 * and node marks, then four project cards each carrying another small diagram.
 * Every element was drawn in the same 1px line language, and the owner's verdict
 * was that it never became beautiful — it read as a research document with
 * illustrations, not as somebody's homepage.
 *
 * This script produces the opposite kind of asset: five *complete* drawings,
 * each one composition rather than a set of marks.
 *
 *   src/assets/home/hero.svg        the hero's single editorial artwork
 *   src/assets/home/wennian.svg     project cover — state, dimension, direction
 *   src/assets/home/hycell.svg      project cover — cell form, trajectory, target
 *   src/assets/home/morn.svg        project cover — plateaus, one thread through them
 *   src/assets/home/biopulse.svg    project cover — many streams, one record
 *
 * Shared material system (§23). Every drawing is built from the same five
 * ingredients at the same weights, so the five read as one body of work:
 *
 *   wash        one soft tonal mass, a radial gradient, giving the drawing depth
 *               without ever becoming a panel or a card.
 *   contour     a smooth scalar field drawn as nested iso-lines. Even spacing in
 *               *value* produces uneven spacing on the page, which is what makes
 *               a topographic drawing look like a real surface rather than a
 *               pattern.
 *   stipple     ink dots sampled inside one value band, so the tone follows the
 *               form. This is the biological ink, and it is the ingredient that
 *               turns a line drawing into something with weight.
 *   one thread  a single smooth trajectory per drawing — the heaviest line in
 *               the frame, and the only one that moves.
 *   one accent  exactly one cobalt moment per drawing. No exceptions.
 *
 * Strokes are sized for the sizes these actually render at (hero column ~590px,
 * cover ~560px against a 1200-unit canvas, so roughly 0.5×), which is why the
 * weights look heavy in the source and delicate on the page.
 *
 * Deliberate prohibitions (§7, §23, §26): no text of any kind, no captions, no
 * plate titles, no grid, no matrices of arrows, no dashed connectors between
 * labelled boxes, no module rectangles, nothing that would
 * look at home in a lecture slide.
 *
 * Colours are emitted as `var(--art-*)` references, never as literals, so the
 * five drawings follow the active theme. The token values live in
 * `src/styles/global.css` and are tuned per theme there.
 *
 * Deterministic: every drawing is driven by a fixed seed, so re-running this
 * script is a no-op in git. Usage: `npm run artwork`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'src', 'assets', 'home');

/* -------------------------------------------------------------------------- */
/* geometry primitives                                                        */
/* -------------------------------------------------------------------------- */

/** Deterministic PRNG — same seed, same drawing, every run. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Trim a coordinate to one decimal and drop the pointless `.0`. */
const n = (value) => {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

/**
 * One anisotropic Gaussian. Rotated, so a field can lean with the page instead
 * of sitting in axis-aligned blobs.
 */
function gauss(x, y, { cx, cy, sx, sy, theta = 0, amp = 1 }) {
  const dx = x - cx;
  const dy = y - cy;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const u = dx * c + dy * s;
  const v = -dx * s + dy * c;
  return amp * Math.exp(-((u * u) / (2 * sx * sx) + (v * v) / (2 * sy * sy)));
}

/**
 * A flat-topped plateau: a super-Gaussian. Contouring it produces a cluster of
 * lines hugging the rim around a broad flat interior, which reads as a physical
 * plate seen slightly from above — the opposite of a diagram rectangle.
 */
function plateau(x, y, { cx, cy, sx, sy, theta = 0, amp = 1, power = 3.4 }) {
  const dx = x - cx;
  const dy = y - cy;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const u = Math.abs(dx * c + dy * s) / sx;
  const v = Math.abs(-dx * s + dy * c) / sy;
  return amp * Math.exp(-(Math.pow(u, power) + Math.pow(v, power)));
}

/** A scalar field is a sum of terms, plus an optional linear tilt. */
function makeField(terms, tilt = { x: 0, y: 0 }) {
  return (x, y) => {
    let value = tilt.x * x + tilt.y * y;
    for (const term of terms) {
      value += term.power ? plateau(x, y, term) : gauss(x, y, term);
    }
    return value;
  };
}

function sample(field, { x0, y0, x1, y1, nx, ny }) {
  const dx = (x1 - x0) / (nx - 1);
  const dy = (y1 - y0) / (ny - 1);
  const grid = [];
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j < ny; j += 1) {
    const row = new Float64Array(nx);
    for (let i = 0; i < nx; i += 1) {
      const value = field(x0 + i * dx, y0 + j * dy);
      row[i] = value;
      if (value < min) min = value;
      if (value > max) max = value;
    }
    grid.push(row);
  }
  return { grid, x0, y0, dx, dy, nx, ny, min, max };
}

/**
 * Marching squares. Returns raw segments; the caller joins them into polylines.
 * The two ambiguous cases (5 and 10) are resolved consistently, which is all
 * that matters for a decorative field.
 */
function marchingSquares(s, level) {
  const { grid, x0, y0, dx, dy, nx, ny } = s;
  const segments = [];

  for (let j = 0; j < ny - 1; j += 1) {
    for (let i = 0; i < nx - 1; i += 1) {
      const v0 = grid[j][i];
      const v1 = grid[j][i + 1];
      const v2 = grid[j + 1][i + 1];
      const v3 = grid[j + 1][i];
      const index = (v0 > level ? 1 : 0) | (v1 > level ? 2 : 0) | (v2 > level ? 4 : 0) | (v3 > level ? 8 : 0);
      if (index === 0 || index === 15) continue;

      const x = x0 + i * dx;
      const y = y0 + j * dy;
      const top = () => [x + dx * ((level - v0) / (v1 - v0)), y];
      const right = () => [x + dx, y + dy * ((level - v1) / (v2 - v1))];
      const bottom = () => [x + dx * ((level - v3) / (v2 - v3)), y + dy];
      const left = () => [x, y + dy * ((level - v0) / (v3 - v0))];

      switch (index) {
        case 1:
        case 14:
          segments.push([left(), top()]);
          break;
        case 2:
        case 13:
          segments.push([top(), right()]);
          break;
        case 3:
        case 12:
          segments.push([left(), right()]);
          break;
        case 4:
        case 11:
          segments.push([right(), bottom()]);
          break;
        case 6:
        case 9:
          segments.push([top(), bottom()]);
          break;
        case 7:
        case 8:
          segments.push([left(), bottom()]);
          break;
        case 5:
          segments.push([left(), top()], [right(), bottom()]);
          break;
        case 10:
          segments.push([top(), right()], [bottom(), left()]);
          break;
        default:
          break;
      }
    }
  }

  return segments;
}

const key = (p) => `${Math.round(p[0] * 20)}:${Math.round(p[1] * 20)}`;

/** Stitch raw segments into polylines by matching endpoints. */
function joinSegments(segments) {
  const ends = new Map();
  segments.forEach((segment, id) => {
    for (const point of segment) {
      const k = key(point);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push(id);
    }
  });

  const used = new Array(segments.length).fill(false);
  const lines = [];
  const other = (segment, point) => (key(segment[0]) === key(point) ? segment[1] : segment[0]);

  for (let id = 0; id < segments.length; id += 1) {
    if (used[id]) continue;
    used[id] = true;
    const line = [segments[id][0], segments[id][1]];

    for (const direction of [1, 0]) {
      let guard = 0;
      while (guard < 100000) {
        guard += 1;
        const tip = direction ? line[line.length - 1] : line[0];
        const next = (ends.get(key(tip)) ?? []).find((candidate) => !used[candidate]);
        if (next === undefined) break;
        used[next] = true;
        const point = other(segments[next], tip);
        if (direction) line.push(point);
        else line.unshift(point);
      }
    }

    if (line.length > 2) lines.push(line);
  }

  return lines;
}

/** Ramer–Douglas–Peucker: fewer points, same shape, smaller file. */
function simplify(points, epsilon) {
  if (points.length < 3) return points;
  const first = points[0];
  const last = points[points.length - 1];
  let index = -1;
  let maxDist = 0;

  const dx = last[0] - first[0];
  const dy = last[1] - first[1];
  const norm = Math.hypot(dx, dy) || 1;

  for (let i = 1; i < points.length - 1; i += 1) {
    const dist =
      Math.abs(dy * points[i][0] - dx * points[i][1] + last[0] * first[1] - last[1] * first[0]) / norm;
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  if (maxDist <= epsilon || index === -1) return [first, last];

  return [
    ...simplify(points.slice(0, index + 1), epsilon).slice(0, -1),
    ...simplify(points.slice(index), epsilon),
  ];
}

/**
 * Catmull-Rom through the points, emitted as cubic beziers. This is what turns
 * a marching-squares polyline into an organic curve — the single most important
 * step for the drawings reading as ink rather than as a plot.
 */
function smoothPath(points, closed, tension = 0.5) {
  const count = points.length;
  if (count < 2) return '';
  const at = (i) => {
    if (closed) return points[(i + count) % count];
    return points[Math.min(Math.max(i, 0), count - 1)];
  };

  let d = `M${n(points[0][0])},${n(points[0][1])}`;
  const last = closed ? count : count - 1;

  for (let i = 0; i < last; i += 1) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * tension * 2, p1[1] + ((p2[1] - p0[1]) / 6) * tension * 2];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * tension * 2, p2[1] - ((p3[1] - p1[1]) / 6) * tension * 2];
    d += `C${n(c1[0])},${n(c1[1])} ${n(c2[0])},${n(c2[1])} ${n(p2[0])},${n(p2[1])}`;
  }

  if (closed) d += 'Z';
  return d;
}

const isClosed = (line) =>
  Math.hypot(line[0][0] - line[line.length - 1][0], line[0][1] - line[line.length - 1][1]) < 3;

/** One iso-level, simplified and smoothed, ready to concatenate into a path. */
function levelPath(line, epsilon) {
  const closed = isClosed(line);
  const points = closed ? line.slice(0, -1) : line;
  if (points.length < 4) return '';
  return smoothPath(simplify(points, epsilon), closed);
}

/* -------------------------------------------------------------------------- */
/* ink                                                                        */
/* -------------------------------------------------------------------------- */

/** Stroke groups: one path per weight, so the file stays small. */
class Ink {
  constructor() {
    this.groups = new Map();
  }

  add(group, d) {
    if (!d) return;
    if (!this.groups.has(group)) this.groups.set(group, []);
    this.groups.get(group).push(d);
  }

  /** Raw markup for the few shapes that are not a stroked path. */
  raw(group, markup) {
    if (!this.groups.has(group)) this.groups.set(group, []);
    this.groups.get(group).push(markup);
  }

  get(group) {
    return (this.groups.get(group) ?? []).join('');
  }
}

/** Dots, as one path of hair-length round-capped segments. Integer coordinates:
    the stipple is a tone, not a line, and half a unit is invisible. */
const stipplePath = (points) =>
  points.map(([x, y]) => `M${Math.round(x)},${Math.round(y)}h.01`).join('');

/**
 * Sample dots inside one value band on a jittered lattice, so the tonal mass
 * follows the drawing's own form instead of forming a rectangle.
 */
function stipple(field, rng, { x0, y0, x1, y1, step, band, jitter = 0.85, keep = 0.45 }) {
  const dots = [];
  for (let y = y0; y <= y1; y += step) {
    for (let x = x0; x <= x1; x += step) {
      const jx = x + (rng() - 0.5) * step * jitter * 2;
      const jy = y + (rng() - 0.5) * step * jitter * 2;
      const value = field(jx, jy);
      if (value < band[0] || value > band[1]) continue;
      if (rng() > keep) continue;
      dots.push([jx, jy]);
    }
  }
  return dots;
}

/** A smooth trajectory through control points — the drawing's one moving line. */
const thread = (points, tension = 0.5) => smoothPath(points, false, tension);

/** Split a trajectory so the tail can take the accent. */
function splitPath(points, at) {
  const i = Math.max(1, Math.min(points.length - 1, Math.round(points.length * at)));
  return [points.slice(0, i + 1), points.slice(i)];
}

/** Shift, then shrink about a pivot — how the time ghosts recede. */
const shift = (points, dx, dy) => points.map(([x, y]) => [x + dx, y + dy]);

function rescale(points, factor, px, py) {
  return points.map(([x, y]) => [px + (x - px) * factor, py + (y - py) * factor]);
}

/* -------------------------------------------------------------------------- */
/* the drawings                                                               */
/* -------------------------------------------------------------------------- */

const CANVAS = { w: 1200, h: 900 };

/**
 * Contour bands for one field.
 *
 * `from`/`to` are fractions of the field's own range, which is what keeps the
 * nesting even in value — and therefore beautiful rather than even in space.
 */
function contourBands(field, options) {
  const {
    seed,
    from = 0.1,
    to = 0.95,
    count = 11,
    grid = 118,
    over = 90,
    epsilon = 0.9,
  } = options;

  const s = sample(field, {
    x0: -over,
    y0: -over,
    x1: CANVAS.w + over,
    y1: CANVAS.h + over,
    nx: grid,
    ny: Math.round((grid * (CANVAS.h + over * 2)) / (CANVAS.w + over * 2)),
  });

  const rng = mulberry32(seed);
  const bands = [];

  for (let i = 0; i < count; i += 1) {
    const t = from + ((to - from) * i) / (count - 1);
    const level = s.min + (s.max - s.min) * t;
    const lines = joinSegments(marchingSquares(s, level)).sort((a, b) => b.length - a.length);
    const paths = lines.map((line) => levelPath(line, epsilon)).filter(Boolean);
    if (!paths.length) continue;
    bands.push({ t, paths, lines: lines.filter((line) => line.length > 12), rng });
  }

  return bands;
}

/** Alternate bands across the two contour weights, so the field has depth. */
function inkBands(ink, bands) {
  bands.forEach((band, i) => {
    const group = i % 2 === 0 ? 'field' : 'fieldSoft';
    for (const d of band.paths) ink.add(group, d);
  });
}

/* The tonal wash that gives each drawing depth is not in the SVG: it is a CSS
   radial-gradient on the artwork frame in `Artwork.astro`. Two reasons — the
   gradient is then a theme token with no serialisation cost, and `stop-color`
   cannot read a custom property from a presentation attribute. */

/* ---- 1. hero ------------------------------------------------------------- */

function buildHero() {
  const ink = new Ink();
  const rng = mulberry32(20260919);

  /* One long ridge sweeping lower-left to upper-right, with two dips opening
     the contours out toward the corners. Long sweeping bands read as landscape;
     concentric ovals read as a fingerprint. */
  const field = makeField(
    [
      { cx: 690, cy: 500, sx: 520, sy: 168, theta: -0.42, amp: 1 },
      { cx: 1000, cy: 240, sx: 190, sy: 118, theta: -0.32, amp: 0.5 },
      { cx: 430, cy: 300, sx: 210, sy: 165, theta: 0.2, amp: -0.36 },
      { cx: 1080, cy: 810, sx: 200, sy: 165, theta: -0.2, amp: -0.34 },
      { cx: 250, cy: 820, sx: 190, sy: 150, theta: 0.3, amp: -0.22 },
    ],
    { x: 0.00014, y: 0.00003 },
  );

  const bands = contourBands(field, { seed: 11, from: 0.14, to: 0.97, count: 11, epsilon: 1.7 });
  inkBands(ink, bands);

  // The thread: one long crossing, from the quiet lower-left into the ridge.
  const run = [
    [30, 752],
    [190, 700],
    [372, 606],
    [540, 500],
    [700, 452],
    [860, 366],
    [1000, 256],
    [1136, 156],
  ];
  const [head, tail] = splitPath(run, 0.72);
  ink.add('thread', thread(head));
  ink.add('accent', thread(tail));

  for (const [x, y] of [
    [30, 752],
    [372, 606],
    [700, 452],
    [1000, 256],
  ]) {
    ink.raw('node', `<circle cx="${n(x)}" cy="${n(y)}" r="5.4"/>`);
  }
  ink.raw('nodeAccent', '<circle cx="1136" cy="156" r="8.4"/>');

  // Biological ink: three quiet arcs in the paper the ridge has left empty.
  ink.add('bio', 'M64,186C148,116 272,110 352,164C414,206 430,278 396,326');
  ink.add('bio', 'M116,282C176,232 264,230 320,268');
  ink.add('bio', 'M204,812C266,764 358,766 414,812C450,842 462,880 458,910');

  const dots = stipple(field, rng, {
    x0: -10,
    y0: -10,
    x1: CANVAS.w + 10,
    y1: CANVAS.h + 10,
    step: 13,
    band: [0.44, 0.9],
    keep: 0.38,
  });

  return render({ ink, dots });
}

/* ---- 2. ZhiShen · WenNian ------------------------------------------------ */

function buildWennian() {
  const ink = new Ink();
  const rng = mulberry32(20260101);

  /* A tall state form: one main lobe with a side bulge and two notches carved
     out of it. The notches are what stop it reading as an oval — an oval is a
     chart, an irregular silhouette is a body. */
  const field = makeField(
    [
      { cx: 596, cy: 438, sx: 150, sy: 244, theta: 0.1, amp: 1 },
      { cx: 712, cy: 618, sx: 112, sy: 128, theta: 0.22, amp: 0.5 },
      { cx: 690, cy: 286, sx: 104, sy: 96, theta: -0.2, amp: 0.3 },
      { cx: 466, cy: 262, sx: 122, sy: 108, theta: 0.3, amp: -0.3 },
      { cx: 764, cy: 424, sx: 96, sy: 104, theta: 0, amp: -0.24 },
      { cx: 250, cy: 236, sx: 200, sy: 190, amp: -0.24 },
      { cx: 1030, cy: 780, sx: 200, sy: 180, amp: -0.2 },
    ],
    { x: 0.00006, y: -0.00007 },
  );

  const bands = contourBands(field, { seed: 21, from: 0.18, to: 0.97, count: 11, epsilon: 1.7 });

  /* The ghosts: the same form, three steps later — lifted, slightly smaller,
     and lighter each time. This is the drawing's "change", and it is the only
     place in the set where a shape repeats. The base is a mid-level contour, so
     the ghosts read as the form rather than as the edge of the frame. */
  const base = bands[3]?.lines[0] ?? bands[2]?.lines[0];
  if (base) {
    for (let i = 1; i <= 3; i += 1) {
      const d = levelPath(rescale(shift(base, i * 58, -i * 74), 1 - i * 0.03, 600, 430), 1.3);
      ink.add('ghost', d);
    }
  }

  inkBands(ink, bands.slice(1));

  /* A rhythm of measured ticks along the foot — many dimensions, no dashboard.
     Drawn as one path so the page keeps a single element. */
  let ticks = '';
  for (let i = 0; i < 44; i += 1) {
    const x = 214 + i * 18.4;
    const h = 10 + Math.abs(Math.sin(i * 0.62)) * 26 + (i % 6) * 2.2;
    ticks += `M${n(x)},${n(852 - h)}V852`;
  }
  ink.add('ticks', ticks);

  // One direction: a calm rise leaving the form for the upper right.
  const rise = [
    [96, 736],
    [250, 700],
    [404, 626],
    [548, 520],
    [688, 384],
    [826, 248],
    [952, 152],
  ];
  const [head, tail] = splitPath(rise, 0.7);
  ink.add('thread', thread(head));
  ink.add('accent', thread(tail));
  ink.raw('node', '<circle cx="96" cy="736" r="5.6"/>');
  ink.raw('node', '<circle cx="548" cy="520" r="5"/>');
  ink.raw('nodeAccent', '<circle cx="952" cy="152" r="8.4"/>');

  const dots = stipple(field, rng, {
    x0: 300,
    y0: 60,
    x1: 980,
    y1: 800,
    step: 14,
    band: [0.28, 0.84],
    keep: 0.38,
  });

  return render({ ink, dots });
}

/* ---- 3. HyCell ----------------------------------------------------------- */

function buildHycell() {
  const ink = new Ink();
  const rng = mulberry32(20260202);

  /* One cell, three lobes: a closed form with internal structure, so the nested
     contours read as a body rather than as a circle. */
  const field = makeField(
    [
      { cx: 600, cy: 470, sx: 252, sy: 224, theta: -0.12, amp: 1 },
      { cx: 452, cy: 602, sx: 132, sy: 116, theta: 0.3, amp: 0.44 },
      { cx: 790, cy: 366, sx: 120, sy: 104, theta: -0.5, amp: 0.4 },
      { cx: 592, cy: 296, sx: 98, sy: 76, theta: 0.1, amp: -0.22 },
    ],
    { x: -0.00005, y: 0.00004 },
  );

  const bands = contourBands(field, { seed: 31, from: 0.1, to: 0.97, count: 12, epsilon: 1.6 });
  inkBands(ink, bands);

  // The trajectory: in from the left edge, through the cell, out to a target.
  const run = [
    [-40, 738],
    [126, 682],
    [282, 618],
    [428, 556],
    [566, 514],
    [704, 448],
    [828, 358],
    [926, 276],
  ];
  const [head, tail] = splitPath(run, 0.66);
  ink.add('thread', thread(head));
  ink.add('accent', thread(tail));

  /* A branch that leaves the main line, curves down and settles — a second,
     shorter story with its own ending. */
  ink.add('branch', thread([[428, 556], [470, 664], [520, 748], [582, 796], [650, 812]]));
  ink.raw('node', '<circle cx="650" cy="812" r="5"/>');

  // The target: two quiet rings where the trajectory arrives.
  ink.raw('targetAccent', '<circle cx="926" cy="276" r="46" fill="none"/>');
  ink.raw('targetAccentSoft', '<circle cx="926" cy="276" r="26" fill="none"/>');
  ink.raw('nodeAccent', '<circle cx="926" cy="276" r="9"/>');
  ink.raw('node', '<circle cx="282" cy="618" r="5.4"/>');
  ink.raw('node', '<circle cx="704" cy="448" r="5.4"/>');

  const dots = stipple(field, rng, {
    x0: 210,
    y0: 130,
    x1: 1020,
    y1: 830,
    step: 13,
    band: [0.26, 0.8],
    keep: 0.38,
  });

  return render({ ink, dots });
}

/* ---- 4. Morn ------------------------------------------------------------- */

function buildMorn() {
  const ink = new Ink();
  const rng = mulberry32(20260303);

  /* Three plateaus stepping up the frame — one field each, contoured
     separately. A single shared field merges them into one long ridge at every
     level below their saddle, which is the hero's drawing rather than this one;
     three separate fields give three islands and a legible diagonal rhythm. */
  const plateaus = [
    { cx: 268, cy: 676, sx: 194, sy: 156, theta: -0.24, amp: 0.94, power: 2.4 },
    { cx: 626, cy: 428, sx: 228, sy: 180, theta: 0.12, amp: 1, power: 2.6 },
    { cx: 980, cy: 236, sx: 150, sy: 122, theta: -0.12, amp: 0.86, power: 2.35 },
  ];

  plateaus.forEach((plateauTerm, k) => {
    const island = makeField([plateauTerm]);
    inkBands(
      ink,
      contourBands(island, { seed: 41 + k * 7, from: 0.3, to: 0.92, count: 6, epsilon: 1.9 }),
    );
  });

  /** Dots follow all three islands, so the stipple needs the combined field. */
  const field = makeField(plateaus, { x: 0.00005, y: 0 });

  /* One thread entering at the lower left, touching each platform in turn and
     leaving at the upper right: the workflow running through the toolchain.
     A node marks every place it meets a platform. */
  const flow = [
    [30, 862],
    [140, 772],
    [268, 676],
    [442, 556],
    [626, 428],
    [800, 330],
    [980, 236],
    [1116, 148],
  ];
  const [head, tail] = splitPath(flow, 0.8);
  ink.add('thread', thread(head));
  ink.add('accent', thread(tail));
  ink.raw('node', '<circle cx="30" cy="862" r="5.4"/>');
  for (const [x, y] of [
    [268, 676],
    [626, 428],
  ]) {
    ink.raw('node', `<circle cx="${n(x)}" cy="${n(y)}" r="6.6"/>`);
  }
  ink.raw('nodeAccent', '<circle cx="1116" cy="148" r="8.2"/>');

  const dots = stipple(field, rng, {
    x0: 40,
    y0: 40,
    x1: 1160,
    y1: 880,
    step: 14,
    band: [0.24, 0.82],
    keep: 0.36,
  });

  return render({ ink, dots });
}

/* ---- 5. BioPulse --------------------------------------------------------- */

function buildBiopulse() {
  const ink = new Ink();
  const rng = mulberry32(20260404);

  /* Diagonal strata rather than concentric rings: the sources are what the eye
     should follow here, so the ground is pushed into long bands that run with
     them instead of a bullseye behind them. */
  const field = makeField(
    [
      { cx: 700, cy: 470, sx: 470, sy: 152, theta: -0.34, amp: 0.9 },
      { cx: 1020, cy: 236, sx: 184, sy: 112, theta: -0.3, amp: 0.42 },
      { cx: 292, cy: 760, sx: 244, sy: 182, theta: 0.3, amp: 0.42 },
      { cx: 212, cy: 196, sx: 232, sy: 182, amp: -0.3 },
      { cx: 1124, cy: 806, sx: 212, sy: 172, amp: -0.28 },
    ],
    { x: 0.00011, y: -0.00005 },
  );

  const bands = contourBands(field, { seed: 51, from: 0.24, to: 0.96, count: 8, epsilon: 2.2 });
  inkBands(ink, bands);

  /* Six sources braiding into one record. Each source is a pair of fine lines;
     they converge through a narrow neck around x = 640 and leave as a single
     ribbon climbing to the top right. The braid — not a straight pipeline — is
     the point: many streams, one verified line. */
  const sources = [
    { y: 138, spread: 9 },
    { y: 246, spread: 8 },
    { y: 354, spread: 8 },
    { y: 462, spread: 9 },
    { y: 570, spread: 8 },
    { y: 678, spread: 9 },
  ];

  sources.forEach(({ y, spread }, i) => {
    for (const side of [-spread, spread]) {
      const d = smoothPath(
        [
          [-40, y + side],
          [128, y + side * 0.94],
          [306, y + side * 0.72 + (i - 2.5) * 3.2],
          [470, 398 + side * 0.42 + (i - 2.5) * 1.6],
          [604, 392 + side * 0.22],
          [716, 372 + side * 0.14],
          [856, 320 + side * 0.1],
          [1010, 244 + side * 0.06],
          [1240, 132],
        ],
        false,
      );
      ink.add(i === 2 || i === 3 ? 'streamMajor' : 'stream', d);
    }
  });

  /* Where the sources become one record: two short arcs that hug the channel
     and tighten it. An earlier pass used a chevron pair here, which read as an
     error marker — the neck has to be a narrowing, not a symbol. */
  ink.add('gate', 'M556,346C592,356 620,372 640,392');
  ink.add('gate', 'M556,442C592,432 620,414 640,392');
  ink.add('accent', thread([[716, 372], [856, 320], [1010, 244], [1146, 156]]));
  ink.raw('nodeAccent', '<circle cx="1146" cy="156" r="8.2"/>');

  // A quiet second reading of the same channel, lower and lighter.
  ink.add('branch', 'M60,782C240,776 400,706 548,634C688,566 828,528 992,516');

  const dots = stipple(field, rng, {
    x0: 120,
    y0: 60,
    x1: 1160,
    y1: 840,
    step: 14,
    band: [0.34, 0.86],
    keep: 0.36,
  });

  return render({ ink, dots });
}

/* -------------------------------------------------------------------------- */
/* serialisation                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Weights, in user units on a 1200 × 900 canvas, sized for a ~0.5× display.
 */
const STROKE = {
  field: 1.75,
  fieldSoft: 1.3,
  ghost: 1.25,
  bio: 1.9,
  ticks: 1.5,
  rule: 1.4,
  stream: 1.5,
  streamMajor: 2.1,
  branch: 1.7,
  gate: 2.2,
  thread: 2.9,
  accent: 3.2,
};

const PAINT = {
  field: 'var(--art-line)',
  fieldSoft: 'var(--art-line-soft)',
  ghost: 'var(--art-ghost)',
  bio: 'var(--art-bio)',
  ticks: 'var(--art-line-soft)',
  rule: 'var(--art-line-soft)',
  stream: 'var(--art-line)',
  streamMajor: 'var(--art-ink)',
  branch: 'var(--art-line)',
  gate: 'var(--art-line)',
  thread: 'var(--art-ink)',
  accent: 'var(--art-accent)',
};

/** Paint order: ground, then the secondary inks, then the moving lines, then
    the nodes and the dots. */
const ORDER = [
  'field',
  'fieldSoft',
  'ghost',
  'bio',
  'ticks',
  'rule',
  'stream',
  'streamMajor',
  'branch',
  'gate',
  'thread',
  'accent',
  'node',
  'nodeAccent',
  'targetAccent',
  'targetAccentSoft',
];

function render({ ink, dots }) {
  const body = [];

  for (const group of ORDER) {
    const d = ink.get(group);
    if (!d) continue;

    if (group === 'node') {
      body.push(`<g fill="var(--art-node)">${d}</g>`);
      continue;
    }
    if (group === 'nodeAccent') {
      body.push(`<g fill="var(--art-accent)">${d}</g>`);
      continue;
    }
    if (group === 'targetAccent') {
      body.push(`<g fill="none" stroke="var(--art-accent)" stroke-width="2.2">${d}</g>`);
      continue;
    }
    if (group === 'targetAccentSoft') {
      body.push(`<g fill="none" stroke="var(--art-accent)" stroke-width="1.7" opacity="0.5">${d}</g>`);
      continue;
    }

    body.push(
      `<path d="${d}" fill="none" stroke="${PAINT[group] ?? 'var(--art-line)'}" stroke-width="${STROKE[group] ?? 1.5}"/>`,
    );
  }

  const dotsPath = dots.length ? stipplePath(dots) : '';

  const svg = [
    `<svg viewBox="0 0 ${CANVAS.w} ${CANVAS.h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" focusable="false">`,
    '<g stroke-linecap="round" stroke-linejoin="round">',
    ...body,
    '</g>',
    dotsPath
      ? `<path d="${dotsPath}" fill="none" stroke="var(--art-stipple)" stroke-width="2.6" stroke-linecap="round"/>`
      : '',
    '</svg>',
  ]
    .filter(Boolean)
    .join('\n');

  return svg;
}

/* -------------------------------------------------------------------------- */

const DRAWINGS = {
  hero: buildHero,
  wennian: buildWennian,
  hycell: buildHycell,
  morn: buildMorn,
  biopulse: buildBiopulse,
};

mkdirSync(OUT, { recursive: true });

let total = 0;
for (const [name, build] of Object.entries(DRAWINGS)) {
  const svg = build();
  writeFileSync(join(OUT, `${name}.svg`), `${svg}\n`, 'utf8');
  const bytes = Buffer.byteLength(svg);
  total += bytes;
  console.log(`  ${name.padEnd(9)} ${(bytes / 1024).toFixed(1).padStart(6)} KB`);
}

console.log(`\n5 drawings, ${(total / 1024).toFixed(1)} KB total → src/assets/home/`);
