/**
 * Selected Artifacts — the "show me something real" room.
 *
 * Discipline, same as the evidence layer:
 *
 *  · Every artifact has a `source` and a `sourceUrl`. No source, no artifact.
 *  · `body` and `items` are quoted from the cited file. Nothing is typed to
 *    look better than the repository it came from.
 *  · No screenshot exists in any of these repositories, so none is shown. A
 *    repository artifact is used instead of an invented interface mockup.
 *  · `date` is the day the source was read, not a product release date.
 *
 * Two categories are kept strictly apart across the site: an `artifact` has a
 * source you can open; a `conceptualVisual` is a drawing and is always
 * labelled as one. Nothing here is a drawing.
 */

import type { Bi } from './bi';

export type ArtifactType = 'repository' | 'terminal' | 'report' | 'architecture' | 'test';

export type ArtifactKind = 'tree' | 'terminal' | 'list';

export type Artifact = {
  id: string;
  /** Project this artifact belongs to. */
  projectSlug: string;
  /** Displayed project name. */
  project: Bi;
  title: Bi;
  type: ArtifactType;
  /** Where it came from — always rendered, never omitted. */
  source: Bi;
  sourceUrl: string;
  /** Day the source was read (ISO 8601). */
  date: string;
  caption: Bi;
  kind: ArtifactKind;
  /** Verbatim monospace block for `tree` and `terminal`. */
  body?: string;
  /** Enumerated facts for `list`. */
  items?: Bi[];
  /**
   * Layout weight in the mosaic. `large` and `mid` span seven of twelve
   * columns, `tall` and `small` span five, `wide` spans all twelve.
   */
  size: 'large' | 'tall' | 'small' | 'mid' | 'wide';
  /** True when the content was read directly from the cited source. */
  verified: boolean;
};

export const ARTIFACT_TYPE_LABELS: Record<ArtifactType, Bi> = {
  repository: { en: 'Repository artifact', zh: '仓库产物' },
  terminal: { en: 'Command / output', zh: '命令与输出' },
  report: { en: 'Report artifact', zh: '报告产物' },
  architecture: { en: 'Architecture artifact', zh: '架构产物' },
  test: { en: 'Acceptance artifact', zh: '验收产物' },
};

export const ARTIFACTS: Artifact[] = [
  {
    id: 'wennian-repository-index',
    projectSlug: 'wennian',
    project: { en: 'ZhiShen · WenNian', zh: '知身 · 问年' },
    title: { en: 'Repository index', zh: '仓库目录结构' },
    type: 'repository',
    source: {
      en: 'GitHub API — huangdi97/WenNian tree listing, read 2026-09-18.',
      zh: 'GitHub API — huangdi97/WenNian 目录清单，2026-09-18 读取。',
    },
    sourceUrl: 'https://github.com/huangdi97/WenNian',
    date: '2026-09-18',
    caption: {
      en: 'The module boundary follows the assessment pipeline: inputs → validation → clocks → organ clocks → integrator → outputs.',
      zh: '模块边界与评估流水线一致：输入 → 校验 → 时钟 → 器官时钟 → 融合 → 输出。',
    },
    kind: 'tree',
    size: 'large',
    verified: true,
    body: `WenNian/
├── Dockerfile
├── docker-compose.prod.yml
├── nginx/
├── config/                 # YAML-driven behaviour
├── requirements.txt        # Python 3.10+
├── docs/
│   ├── api_reference.md
│   ├── deployment_guide.md
│   └── user_guide.md
├── src/
│   ├── core/               # configuration, logging, exceptions
│   ├── clocks/             # phenoage.py  kdm.py  dnn.py  lifeclock.py
│   ├── dimensions/         # organ clocks
│   ├── integrator/         # fusion and dominant-driver identification
│   ├── causality/          # causal graph (partially open)
│   ├── agents/             # director  analyst  auditor  health_interviewer
│   ├── knowledge/          # complaint → dimension mapping
│   ├── inputs/             # data models and validation
│   ├── outputs/            # report building and PDF generation
│   ├── validation/         # red-line scanning, numeric guards
│   ├── commercial/         # white-label reporting
│   ├── api/                # FastAPI
│   └── ui/                 # Gradio
└── tests/
    ├── test_active_perception/  test_agents/     test_api/
    ├── test_causality/          test_clocks/     test_commercial/
    ├── test_core/               test_deployment/ test_dimensions/
    ├── test_industrial/         test_inputs/     test_integrator/
    ├── test_knowledge/          test_lab/        test_outputs/
    ├── test_production/         test_ui/         test_validation/
    ├── test_additional.py       test_batch_final.py
    ├── test_comprehensive.py    test_edge_cases.py
    ├── test_final_batch2.py     test_final_verify.py
    ├── test_integration.py      test_p1_coverage.py
    └── conftest.py`,
  },
  {
    id: 'hycell-acceptance-contract',
    projectSlug: 'hycell',
    project: { en: 'HyCell-JEPA', zh: 'HyCell-JEPA' },
    title: { en: 'Reproducibility contract', zh: '可复现契约' },
    type: 'test',
    source: {
      en: 'HyCell-JEPA Makefile and README.md, read 2026-09-18.',
      zh: 'HyCell-JEPA Makefile 与 README.md，2026-09-18 读取。',
    },
    sourceUrl: 'https://github.com/huangdi97/HyCell-JEPA#readme',
    date: '2026-09-18',
    caption: {
      en: 'Acceptance is scripted: `make verify` runs pytest plus all seven goal verifiers, so a reviewer can check claims without trusting prose.',
      zh: '验收是被脚本化的：`make verify` 会跑 pytest 与全部七个目标验证脚本，审阅者无需依赖叙述即可核对主张。',
    },
    kind: 'terminal',
    size: 'tall',
    verified: true,
    body: `$ make verify
python -m pytest
bash scripts/verify_goal1.sh
bash scripts/verify_goal2.sh
bash scripts/verify_goal3.sh
bash scripts/verify_goal4.sh
bash scripts/verify_goal4_real_smoke.sh
bash scripts/verify_goal5.sh
bash scripts/verify_goal6.sh
bash scripts/verify_goal7.sh

$ make verify-release
bash scripts/verify_release.sh`,
  },
  {
    id: 'morn-workspace-layout',
    projectSlug: 'morn',
    project: { en: 'morn', zh: 'morn' },
    title: { en: 'Workspace layout', zh: 'Workspace 结构' },
    type: 'architecture',
    source: {
      en: 'GitHub API — huangdi97/morn tree listing, read 2026-09-18.',
      zh: 'GitHub API — huangdi97/morn 目录清单，2026-09-18 读取。',
    },
    sourceUrl: 'https://github.com/huangdi97/morn',
    date: '2026-09-18',
    caption: {
      en: 'Twenty-two crates ordered kernel → world / work → capability → app. The domain pack is separate and feature-gated.',
      zh: '22 个 crate，顺序为 kernel → world / work → capability → app。领域包独立存在并以 feature 开关隔离。',
    },
    kind: 'tree',
    size: 'small',
    verified: true,
    body: `morn/
├── crates/                      22 crates
│   ├── morn-kernel              identity, workspace, policy, approval, ledger
│   ├── morn-world               objects, relations, events, state snapshots
│   ├── morn-work                work packages, acceptance specs, runtimes
│   ├── morn-organization        role slots, members
│   ├── morn-actor               actors and representation contracts
│   ├── morn-evolution           candidate / branch / evaluation / promotion
│   ├── morn-foundry             solution compiler, managed work, pilots
│   ├── morn-assurance           certification, rollback points
│   ├── morn-capability          replaceable providers behind contracts
│   ├── morn-node                claim / checkpoint / lease / failover
│   ├── morn-integration         connectors writing through governed tokens
│   ├── morn-domain-sdk          public SDK for domain packs
│   ├── morn-artifact            immutable, versioned artifacts
│   └── morn-app                 server binary (http://127.0.0.1:8090)
├── frontend/                    React + Vite + TypeScript (four surfaces)
├── src-tauri/                   Tauri v2 desktop shell
├── domain-packs/                biolab-reference (feature-gated)
├── scripts/                     run_all.ps1, domain boundary guard
└── reports/                     Goal 1–5 and v1 GA reports`,
  },
  {
    id: 'biopulse-agent-gateway',
    projectSlug: 'biopulse',
    project: { en: 'BioPulse', zh: 'BioPulse' },
    title: { en: 'Agent gateway call', zh: '智能体网关调用' },
    type: 'terminal',
    source: {
      en: 'BioPulse README.md — quoted verbatim, read 2026-09-18.',
      zh: 'BioPulse README.md — 逐字引用，2026-09-18 读取。',
    },
    sourceUrl: 'https://github.com/huangdi97/BioPulse#readme',
    date: '2026-09-18',
    caption: {
      en: 'The documented quickstart: init, serve, then call the gateway. No credentials or tenant data appear in any artifact shown here.',
      zh: '文档中的快速上手：初始化、启动服务、调用网关。此处展示的任何产物都不含凭据或客户数据。',
    },
    kind: 'terminal',
    size: 'mid',
    verified: true,
    body: `python -c "from cloud.app.database import init_db; init_db()"
uvicorn cloud.app.main:app --reload --port 8000

curl http://localhost:8000/agent-gateway/execute \\
  -H "Content-Type: application/json" \\
  -d '{"agent_key":"analyst","goal":"分析最近的拜访数据"}'

python3 -m pytest cloud/app/tests/ -v`,
  },
  {
    id: 'hycell-benchmark-metrics',
    projectSlug: 'hycell',
    project: { en: 'HyCell-JEPA', zh: 'HyCell-JEPA' },
    title: { en: 'Benchmark smoke metrics', zh: '基准冒烟指标' },
    type: 'report',
    source: {
      en: 'HyCell-JEPA docs/benchmark_report.md — quoted verbatim, read 2026-09-18.',
      zh: 'HyCell-JEPA docs/benchmark_report.md — 逐字引用，2026-09-18 读取。',
    },
    sourceUrl: 'https://github.com/huangdi97/HyCell-JEPA/blob/main/docs/benchmark_report.md',
    date: '2026-09-18',
    caption: {
      en: 'Engineering smoke metrics, published with their own limits attached. The repository states plainly that they do not establish biological validity.',
      zh: '工程冒烟指标，连同其限制一起发布。仓库明确指出这些指标不构成生物学有效性。',
    },
    kind: 'list',
    size: 'wide',
    verified: true,
    items: [
      { en: 'Toy score transitions: 8', zh: 'Toy 转移样本：8' },
      { en: 'Training transitions: 6 · held-out eval: 2', zh: '训练转移 6 · 留出评估 2' },
      { en: 'All-transition evaluation MSE: 0.014585165', zh: '全转移评估 MSE：0.014585165' },
      { en: 'Verifier status counts: {"warn": 8}', zh: '校验器状态计数：{"warn": 8}' },
      { en: 'Planner top-1: aging_stress → regeneration, distance 0.458229', zh: '规划器首位：aging_stress → regeneration，距离 0.458229' },
      { en: 'GSE130973 smoke matrix: 5,000 cells × 2,000 genes', zh: 'GSE130973 冒烟矩阵：5000 细胞 × 2000 基因' },
      { en: 'Stated limit: “All metrics below are engineering smoke metrics. They do not establish biological validity.”', zh: '仓库声明的限制：“以下均为工程冒烟指标，不构成生物学有效性。”' },
    ],
  },
];

export function getArtifacts(): Artifact[] {
  return ARTIFACTS;
}
