/**
 * Homepage presentation data (v2.0).
 *
 * Two things the homepage needs that are *about* the truth layer rather than
 * part of it. Both are declared here, in one place, rather than being
 * special-cased inside a component:
 *
 *   ARTWORK_LABELS   the spoken description of each drawing. The drawings carry
 *                    meaning, so each one is exposed as a labelled image rather
 *                    than as silent decoration.
 *
 *   HOME_STATUS      which single evidence field the homepage surfaces as a
 *                    project's status. Every value is read from the evidence
 *                    layer — nothing here is a new claim. Some projects are best
 *                    identified by the reality headline ("Open-source MVP"),
 *                    others by the public-code fact ("Public repository"); the
 *                    homepage shows exactly one of the two, never both, because
 *                    a status plus a second code label plus a proof line is the
 *                    four-part apparatus this round removes.
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
};

/** Which evidence field the homepage prints as a project's one status line. */
export const HOME_STATUS: Record<string, 'headline' | 'publicCode'> = {
  wennian: 'headline',
  hycell: 'headline',
  morn: 'publicCode',
  biopulse: 'publicCode',
};
