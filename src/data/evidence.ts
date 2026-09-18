/**
 * Project evidence layer.
 *
 * Every row below answers one question: **what actually exists, and how would
 * a visitor check it?** States are deliberately coarse and conservative.
 *
 * State semantics
 * ---------------
 * built      Implemented in code that exists. May still be unverified: this
 *            state says "the module is there", never "it works well".
 * validated  Built *and* checked against an explicit artifact we can point at
 *            (a test, a report, a verifier output). Used sparingly.
 * partial    Present but incomplete or only opened partially.
 * prototype  Runs end to end on toy/sample data; not a production system.
 * designed   Specified — architecture, contracts, scope. No code shown publicly.
 * planned    Identified for future work. Nothing to inspect.
 * not-public Work exists per the author, but **no public artifact can be
 *            checked**. This is a disclosure, not a claim of completion.
 *
 * Evidence discipline: every panel cites a source. Nothing here is a rendered
 * mockup of a product that does not exist, and no number is reproduced unless
 * it appears in the cited source.
 */

export type RealityState =
  | 'built'
  | 'validated'
  | 'partial'
  | 'prototype'
  | 'designed'
  | 'planned'
  | 'not-public';

export type Bi = { en: string; zh: string };

export type RealityRow = {
  label: Bi;
  state: RealityState;
  note: Bi;
};

/**
 * Panel shapes. These map onto the kinds of artifact a reviewer actually wants:
 *  tree      — repository / directory listing (Repository, Artifact)
 *  terminal  — verbatim commands or program output (Test, Terminal)
 *  list      — quoted enumerated facts (Limitations, Dependencies)
 *  note      — prose disclosure, used when nothing exists to show (Status)
 *  screenshot— a real image captured from the running system
 */
export type EvidenceKind = 'tree' | 'terminal' | 'list' | 'note' | 'screenshot';

export type EvidencePanel = {
  kind: EvidenceKind;
  title: Bi;
  /** Where this came from — always visible, never omitted. */
  source: Bi;
  sourceUrl?: string;
  /** Monospace block for `tree` and `terminal` panels. */
  body?: string;
  /** Bullet content for `list` panels. */
  items?: Bi[];
  caption?: Bi;
  /** Optional real screenshot/svg asset. */
  image?: { src: string; width: number; height: number; alt: Bi };
};

export type ProjectEvidence = {
  /** Two-part status shown on cards and the case-study header. */
  headline: Bi;
  /** Short reality sentence used beside the headline. */
  reality: Bi;
  publicCode: 'open' | 'none';
  rows: RealityRow[];
  panels: EvidencePanel[];
};

/* ----------------------------------------------------------------- WenNian */

const wennian: ProjectEvidence = {
  headline: { en: 'Open-source MVP', zh: '开源 MVP' },
  reality: { en: 'Code, tests, UI, API and deployment files are public.', zh: '代码、测试、界面、接口与部署文件均已公开。' },
  publicCode: 'open',
  rows: [
    {
      label: { en: 'Multi-clock assessment engine', zh: '多时钟评估引擎' },
      state: 'built',
      note: {
        en: 'Four clocks implemented as separate modules — PhenoAge, KDM, DNN and LifeClock — over nine routine blood markers.',
        zh: 'PhenoAge、KDM、DNN、LifeClock 四个时钟为独立模块，基于 9 项常规血检指标实现。',
      },
    },
    {
      label: { en: 'Organ clock layer', zh: '器官时钟层' },
      state: 'built',
      note: {
        en: 'Eight organ systems — heart, liver, kidney, brain, lung, vascular, immune, skeletal muscle — assessed for asynchrony.',
        zh: '心、肝、肾、脑、肺、血管、免疫、骨骼肌八个器官系统，用于评估器官衰老异步性。',
      },
    },
    {
      label: { en: 'Integrator — drivers and intervention priority', zh: '融合层——主驱动与干预优先级' },
      state: 'built',
      note: {
        en: 'Fuses clock outputs into dominant driver dimensions and an intervention priority ordering, with confidence intervals.',
        zh: '将各时钟输出融合为主驱动维度与干预优先级排序，并给出置信区间。',
      },
    },
    {
      label: { en: 'Multi-agent layer', zh: '多智能体层' },
      state: 'built',
      note: {
        en: 'Director, Analyst, Auditor and HealthInterviewer agents with shared protocols; the Auditor performs mandatory red-line scanning on every output.',
        zh: 'Director、Analyst、Auditor、HealthInterviewer 四个智能体共享协议层；Auditor 对每条输出执行强制红线扫描。',
      },
    },
    {
      label: { en: 'Structured health interview', zh: '结构化健康访谈' },
      state: 'built',
      note: {
        en: 'Natural-language complaints are resolved into assessment dimensions within at most three follow-up rounds, backed by a 100+ complaint-to-dimension mapping library.',
        zh: '自然语言主诉在最多三轮追问内被解析为评估维度，背后是 100+ 条主诉-维度映射库。',
      },
    },
    {
      label: { en: 'Guards — validation, red lines, numeric sanity', zh: '护栏——输入校验、红线、数值守护' },
      state: 'built',
      note: {
        en: 'Typed input models, range checks and a compliance scan that blocks medical advice, prescriptions and dosage language.',
        zh: '类型化输入模型、区间校验与合规扫描，拦截医疗建议、处方与用量表述。',
      },
    },
    {
      label: { en: 'White-label PDF reporting', zh: '白标 PDF 报告' },
      state: 'built',
      note: {
        en: 'Organ radar chart, biological-age summary, intervention suggestions and a per-page disclaimer; batch CSV input is packaged as a ZIP.',
        zh: '器官雷达图、生物年龄总结、干预建议与逐页免责声明；批量 CSV 输入可打包为 ZIP。',
      },
    },
    {
      label: { en: 'Service layer — REST API and Gradio UI', zh: '服务层——REST 接口与 Gradio 界面' },
      state: 'built',
      note: {
        en: 'FastAPI endpoints alongside a Gradio interface served locally on port 7860.',
        zh: 'FastAPI 接口与 Gradio 界面并存，本地在 7860 端口提供服务。',
      },
    },
    {
      label: { en: 'Deployment artifacts', zh: '部署产物' },
      state: 'built',
      note: {
        en: 'Dockerfile, production compose file and an nginx configuration are present in the repository.',
        zh: '仓库内含 Dockerfile、生产用 compose 文件与 nginx 配置。',
      },
    },
    {
      label: { en: 'Automated test suite', zh: '自动化测试' },
      state: 'built',
      note: {
        en: 'Eighteen test packages plus eight top-level test modules and a shared conftest — test/active-perception, api, causality, clocks, ui, validation and more. This site does not re-run them, so no pass rate is claimed.',
        zh: '18 个测试包、8 个顶层测试模块与共享 conftest，覆盖主动感知、API、因果、时钟、界面、校验等。本站未重新运行这些测试，因此不宣称任何通过率。',
      },
    },
    {
      label: { en: 'Causal layer', zh: '因果层' },
      state: 'partial',
      note: {
        en: 'The repository marks the causal graph as partially released — the module exists in the tree, but the full graph is not in the open MVP.',
        zh: '仓库将因果图标注为“部分开放”——模块存在于目录结构中，但完整图谱不在开源 MVP 内。',
      },
    },
    {
      label: { en: 'Intervention simulation', zh: '干预仿真' },
      state: 'partial',
      note: {
        en: 'The MVP ranks intervention priorities. It does not simulate counterfactual trajectories over time.',
        zh: 'MVP 输出的是干预优先级排序，并未做随时间推进的反事实轨迹仿真。',
      },
    },
    {
      label: { en: 'Continuous sensing and longitudinal ingest', zh: '连续感知与纵向数据接入' },
      state: 'planned',
      note: { en: 'No such module in the public tree.', zh: '公开目录中没有对应模块。' },
    },
    {
      label: { en: 'Digital twin', zh: '数字孪生' },
      state: 'planned',
      note: {
        en: 'Referenced in the product thesis, outside MVP scope. The composable state model exists in code; a persistent individual twin does not.',
        zh: '属于产品论述中的方向，不在 MVP 范围。可组合状态模型在代码中存在，持久化个体孪生体尚未实现。',
      },
    },
    {
      label: { en: 'Clinical validation', zh: '临床验证' },
      state: 'planned',
      note: {
        en: 'Nothing in the repository supports a clinical accuracy claim. Every report carries a non-diagnostic disclaimer.',
        zh: '仓库中没有任何支撑临床准确性主张的证据，每份报告均附有非诊断免责声明。',
      },
    },
  ],
  panels: [
    {
      kind: 'tree',
      title: { en: 'Repository index', zh: '仓库目录' },
      source: {
        en: 'GitHub API — huangdi97/WenNian repository listing, read this week.',
        zh: 'GitHub API — huangdi97/WenNian 仓库目录，本周读取。',
      },
      sourceUrl: 'https://github.com/huangdi97/WenNian',
      caption: {
        en: 'The module boundary follows the assessment pipeline: inputs → validation → clocks → organ clocks → integrator → outputs.',
        zh: '模块边界与评估流水线一致：输入 → 校验 → 时钟 → 器官时钟 → 融合 → 输出。',
      },
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
      kind: 'terminal',
      title: { en: 'Documented entry points', zh: '文档中的运行入口' },
      source: { en: 'WenNian README.md', zh: 'WenNian README.md' },
      sourceUrl: 'https://github.com/huangdi97/WenNian#readme',
      caption: {
        en: 'Quoted verbatim from the repository README — commands are the contract, not a paraphrase.',
        zh: '逐字引用仓库 README——命令本身即是契约，而非改写。',
      },
      body: `# install
pip install -r requirements.txt

# run the test suite
pytest tests/ -v

# launch the interface
python src/ui/app.py
# → serving the Gradio UI on http://127.0.0.1:7860`,
    },
    {
      kind: 'note',
      title: { en: 'License — read carefully', zh: '许可证——请注意' },
      source: {
        en: 'WenNian README.md vs. GitHub license detection.',
        zh: 'WenNian README.md 与 GitHub 许可证检测结果的对比。',
      },
      caption: {
        en: 'The README states GPLv3. GitHub reports no detected LICENSE file for this repository, so the license status is unresolved — treat it as unclear rather than settled.',
        zh: 'README 声明 GPLv3，但 GitHub 未检测到该仓库存在 LICENSE 文件，因此许可证状态尚未确定——应视为“未明确”而非“已确定”。',
      },
    },
  ],
};

/* ------------------------------------------------------------------ HyCell */

const hycell: ProjectEvidence = {
  headline: { en: 'Research prototype', zh: '研究原型' },
  reality: { en: 'Runnable v0.1 prototype with real acceptance scripts.', zh: '可运行的 v0.1 原型，附带真实验收脚本。' },
  publicCode: 'open',
  rows: [
    {
      label: { en: 'Schema and data contracts', zh: '模式与数据契约' },
      state: 'built',
      note: {
        en: 'A typed schema layer plus a real-dataset validation path covering .csv, .npz and optional .h5ad inputs.',
        zh: '类型化模式层，以及覆盖 .csv / .npz / 可选 .h5ad 的真实数据集校验路径。',
      },
    },
    {
      label: { en: 'Core interfaces — encoders and transition head', zh: '核心接口——编码器与转移头' },
      state: 'built',
      note: {
        en: 'Bio-state, action, context and adapter encoders feed a JEPA-style core. In v0.1 the transition head is a compact NumPy ridge regression — small and inspectable by design.',
        zh: '生物状态、动作、上下文与适配器编码器汇入 JEPA 风格的核心。v0.1 的转移头是紧凑 NumPy 岭回归——刻意保持小且可检视。',
      },
    },
    {
      label: { en: 'EvidenceGraph', zh: 'EvidenceGraph 证据图' },
      state: 'built',
      note: {
        en: 'Links toy actions, readouts, assumptions and limits in one structure so caveats travel with the claim.',
        zh: '将 toy 动作、读数、假设与限制连成一张图，让注意事项与主张同行。',
      },
    },
    {
      label: { en: 'Biological verifier', zh: '生物校验器' },
      state: 'built',
      note: {
        en: 'Structured pass / warn / fail output rather than a single score. On the accepted toy benchmark all eight transitions returned warn — the guardrail reports uncertainty instead of hiding it.',
        zh: '输出结构化的 pass / warn / fail，而不是单一分数。在已验收的 toy 基准中 8 条转移全部返回 warn——护栏如实报告不确定性，而非掩盖。',
      },
    },
    {
      label: { en: 'Target-state planner', zh: '目标状态规划器' },
      state: 'built',
      note: {
        en: 'Top-K action-sequence search over toy compact states. The README is explicit that planner output is a demonstration, not a therapy recommendation.',
        zh: '在 toy 紧凑状态上做 Top-K 动作序列搜索。README 明确说明规划器输出是演示，不是治疗建议。',
      },
    },
    {
      label: { en: 'Real-data ingestion — GSE130973', zh: '真实数据接入——GSE130973' },
      state: 'built',
      note: {
        en: 'Matrix Market files are inspected, prepared, validated and summarised; the smoke artifact is capped at 5,000 cells × 2,000 genes.',
        zh: 'Matrix Market 文件经过检视、预处理、校验与汇总；冒烟产物裁剪为 5000 细胞 × 2000 基因。',
      },
    },
    {
      label: { en: 'Real-matrix smoke training', zh: '真实矩阵冒烟训练' },
      state: 'built',
      note: {
        en: 'A lightweight encoder-style training path exists for the prepared real matrix. Labels are explicitly unknown — the smoke run does not infer them.',
        zh: '针对预处理后的真实矩阵存在轻量编码器训练路径。标签被显式标注为未知——冒烟流程不会推断标签。',
      },
    },
    {
      label: { en: 'Acceptance scripts and reproducibility contract', zh: '验收脚本与可复现契约' },
      state: 'built',
      note: {
        en: 'Seven goal verifiers plus a release verifier, invocable through make targets. This is the strongest artifact in the repository.',
        zh: '七个目标验证脚本加一个发布验证脚本，可通过 make 目标调用。这是仓库里最有力的证据。',
      },
    },
    {
      label: { en: 'Test suite', zh: '测试套件' },
      state: 'built',
      note: {
        en: 'Eighteen test modules including real-data loader, schema, verifier, evidence-graph, benchmark and CLI-contract tests.',
        zh: '18 个测试模块，含真实数据加载器、模式、校验器、证据图、基准与命令行契约测试。',
      },
    },
    {
      label: { en: 'Streamlit demo', zh: 'Streamlit 演示' },
      state: 'built',
      note: {
        en: 'A portfolio UI exposing toy states, predicted transitions, verifier messages, planner output and real-data status.',
        zh: '面向作品集的界面，展示 toy 状态、预测转移、校验器信息、规划器输出与真实数据状态。',
      },
    },
    {
      label: { en: 'Cloud GPU scaffold', zh: '云 GPU 脚手架' },
      state: 'prototype',
      note: {
        en: 'An RTX 4090 run script, configuration and result packager exist. It does not download large datasets automatically.',
        zh: '存在 RTX 4090 运行脚本、配置与结果打包器；不会自动下载大型数据集。',
      },
    },
    {
      label: { en: 'Biological validation', zh: '生物学验证' },
      state: 'planned',
      note: {
        en: 'None. The README lists this first among limitations: not wet-lab validated, no clinical claim, no benchmark against a published virtual-cell model.',
        zh: '无。README 把它排在局限列表第一位：未经湿实验验证、无临床主张、未与已发表虚拟细胞模型做基准对比。',
      },
    },
    {
      label: { en: 'Metadata annotation and HDF subset (v0.2)', zh: '元数据注释与 HDF 子集（v0.2）' },
      state: 'planned',
      note: {
        en: 'The current real smoke data is unfiltered human skin single-cell data with unknown age and state labels.',
        zh: '当前真实冒烟数据是未过滤的人皮肤单细胞数据，年龄与状态标签未知。',
      },
    },
    {
      label: { en: 'Real perturbation benchmark (v0.4)', zh: '真实扰动基准（v0.4）' },
      state: 'planned',
      note: { en: 'Roadmap item, not started in v0.1.', zh: '路线图条目，v0.1 尚未开始。' },
    },
  ],
  panels: [
    {
      kind: 'terminal',
      title: { en: 'Reproducibility contract', zh: '可复现契约' },
      source: { en: 'HyCell-JEPA Makefile and README.md', zh: 'HyCell-JEPA Makefile 与 README.md' },
      sourceUrl: 'https://github.com/huangdi97/HyCell-JEPA#readme',
      caption: {
        en: 'Acceptance is scripted. `make verify` runs pytest plus all seven goal verifiers, so a reviewer can check claims without trusting prose.',
        zh: '验收是被脚本化的。`make verify` 会跑 pytest 与全部七个目标验证脚本，审阅者无需依赖叙述即可核对主张。',
      },
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
      kind: 'terminal',
      title: { en: 'Benchmark smoke output', zh: '基准冒烟输出' },
      source: {
        en: 'HyCell-JEPA README.md — quoted verbatim.',
        zh: 'HyCell-JEPA README.md — 逐字引用。',
      },
      sourceUrl: 'https://github.com/huangdi97/HyCell-JEPA#readme',
      caption: {
        en: 'These numbers prove runnable engineering plumbing only. The README states plainly that they do not validate biology.',
        zh: '这些数字只证明工程链路可运行。README 明确指出它们不构成生物学验证。',
      },
      body: `Toy score transitions: 8
Training transitions: 6
Held-out eval transitions: 2
All-transition MSE: 0.014585165
Verifier status counts: {"warn": 8}
Planner sequence: regeneration -> control`,
    },
    {
      kind: 'terminal',
      title: { en: 'Planner output', zh: '规划器输出' },
      source: {
        en: 'HyCell-JEPA README.md — toy smoke path.',
        zh: 'HyCell-JEPA README.md — toy 冒烟路径。',
      },
      sourceUrl: 'https://github.com/huangdi97/HyCell-JEPA#readme',
      caption: {
        en: 'Top-K search over toy compact states, with distances. Demonstration output, not a protocol.',
        zh: '在 toy 紧凑状态上的 Top-K 搜索及距离值。属于演示输出，不是方案建议。',
      },
      body: `Top-K toy action sequences:
1. aging_stress -> regeneration | distance=0.458229
2. partial_reprogramming -> regeneration | distance=0.497030
3. control -> regeneration | distance=0.620774`,
    },
    {
      kind: 'tree',
      title: { en: 'Module inventory', zh: '模块清单' },
      source: {
        en: 'GitHub API — huangdi97/HyCell-JEPA src listing.',
        zh: 'GitHub API — huangdi97/HyCell-JEPA src 目录。',
      },
      sourceUrl: 'https://github.com/huangdi97/HyCell-JEPA',
      body: `src/hycell/
├── schema.py                # typed contracts
├── config.py                # YAML-driven configuration
├── toy_data.py              # deterministic generator
├── data_loaders.py          # csv / npz / h5ad
├── real_datasets.py         # GSE130973 ingestion
├── datasets.py
├── gene_sets.py             # configurable scoring
├── encoders.py              # bio-state, action, context
├── hdf_adapter.py           # cell-system adapter h_t
├── jepa.py                  # transition core
├── verifier.py              # pass / warn / fail
├── planner.py               # top-K target-state search
├── evidence_graph.py        # claims ↔ assumptions ↔ limits
├── real_training.py         # real-matrix smoke training
├── training.py
├── benchmark.py             # reports
└── demo/

tests/  18 modules — data loaders, schema, real-data smoke,
        real-training smoke, CLI contracts, verifier, evidence graph,
        benchmark, encoders, gene sets, planner, packaging

docs/    model_card, design_summary, limitations, ACCEPTANCE,
        data_card, benchmark_report, gse130973_integration,
        gse130973_smoke_report, roadmap, release_v0.1, progress_log`,
    },
    {
      kind: 'list',
      title: { en: 'Limitations, quoted from the repository', zh: '限制，引用自仓库' },
      source: { en: 'HyCell-JEPA README.md — "Limitations First".', zh: 'HyCell-JEPA README.md「Limitations First」章节。' },
      sourceUrl: 'https://github.com/huangdi97/HyCell-JEPA#readme',
      items: [
        { en: 'Not clinical advice.', zh: '非临床建议。' },
        { en: 'Not wet-lab validated.', zh: '未经湿实验验证。' },
        { en: 'Not a complete virtual cell.', zh: '不是完整虚拟细胞。' },
        { en: 'Not Lingshu-Cell-scale transcriptome diffusion.', zh: '不是 Lingshu-Cell 规模的转录组扩散模型。' },
        { en: 'Toy data is engineering validation only.', zh: 'Toy 数据仅用于工程验证。' },
        { en: 'Planner outputs are demonstrations, not therapy recommendations.', zh: '规划器输出为演示，不是治疗建议。' },
        { en: 'GSE130973 smoke workflows are real-matrix engineering validation only.', zh: 'GSE130973 冒烟流程仅用于真实矩阵工程验证。' },
        { en: 'Smoke data is unfiltered human skin single-cell data with unknown age and state labels.', zh: '冒烟数据是未过滤人皮肤单细胞数据，年龄与状态标签未知。' },
      ],
    },
  ],
};

/* ------------------------------------------------------------ TaiYi Lingjing */

const taiyi: ProjectEvidence = {
  headline: { en: 'Research program', zh: '研究计划' },
  reality: { en: 'No public repository and no released system.', zh: '无公开仓库，无已发布系统。' },
  publicCode: 'none',
  rows: [
    {
      label: { en: 'System architecture', zh: '系统架构' },
      state: 'designed',
      note: {
        en: 'A five-subsystem decomposition — Bio, Evidence, Simulation, Experiment, Human — described on this page. Nothing here can be cross-checked against code.',
        zh: '本页描述了 Bio / Evidence / Simulation / Experiment / Human 五子系统划分。此处内容无法与代码交叉核验。',
      },
    },
    {
      label: { en: 'Subsystem contracts', zh: '子系统契约' },
      state: 'designed',
      note: {
        en: 'Interface shapes and evidence-provenance rules are specified in prose only.',
        zh: '接口形态与证据溯源规则仅有文字层面的说明。',
      },
    },
    {
      label: { en: 'Research design', zh: '研究设计' },
      state: 'designed',
      note: {
        en: 'The discovery loop — hypothesis, retrieval, simulation, experiment proposal, evidence audit — is laid out as an operating model, not an implemented pipeline.',
        zh: '发现闭环（假设、检索、仿真、实验提案、证据审计）以运行模型的形式呈现，并非已实现的流水线。',
      },
    },
    {
      label: { en: 'Prototype code', zh: '原型代码' },
      state: 'not-public',
      note: {
        en: 'Reported as partial. Nothing is published, so no claim about its state can be verified by a visitor.',
        zh: '据称为部分原型。没有任何内容公开，访问者无法核实其状态。',
      },
    },
    {
      label: { en: 'Public repository', zh: '公开仓库' },
      state: 'not-public',
      note: { en: 'None. No code link is shown anywhere on this site.', zh: '无。本站任何位置均不显示代码链接。' },
    },
  ],
  panels: [
    {
      kind: 'note',
      title: { en: 'How to read this page', zh: '如何阅读本页' },
      source: { en: 'Site editorial standard.', zh: '本站编写准则。' },
      caption: {
        en: 'This is a research program with a written brief, not a system you can inspect. Everything below describes intent and design. Where an artifact would normally be cited, none exists yet.',
        zh: '这是一个有书面纲领的研究计划，而非可供检视的系统。以下内容描述的是意图与设计。通常在需要引用实物的位置，目前尚无实物。',
      },
    },
  ],
};

/* ------------------------------------------------------------- Pet AI Health */

const pet: ProjectEvidence = {
  headline: { en: 'Design study', zh: '设计研究' },
  reality: { en: 'Architecture and workflow design only.', zh: '仅包含架构与流程设计。' },
  publicCode: 'none',
  rows: [
    {
      label: { en: 'Product architecture', zh: '产品架构' },
      state: 'designed',
      note: {
        en: 'Observation → assessment → consultation → care coordination, with explicit escalation to a veterinarian at defined thresholds.',
        zh: '观察 → 评估 → 问诊 → 照护协同，并在既定阈值明确转诊至执业兽医。',
      },
    },
    {
      label: { en: 'Multimodal intake design', zh: '多模态信息采集设计' },
      state: 'designed',
      note: {
        en: 'Signal types and their contribution to a health assessment are specified, without a trained model behind them.',
        zh: '规定了信号类型及其对健康评估的贡献方式，但其后没有已训练模型。',
      },
    },
    {
      label: { en: 'Provider adapter contracts', zh: '外部服务适配器契约' },
      state: 'designed',
      note: {
        en: 'How an external clinic or telehealth provider would plug into the routing layer.',
        zh: '外部诊所或远程医疗提供方如何接入路由层的设计。',
      },
    },
    {
      label: { en: 'Service implementation', zh: '服务实现' },
      state: 'not-public',
      note: {
        en: 'Reported locally. No repository, no deployment, no test output available for review.',
        zh: '据称存在于本地。无仓库、无部署、无测试产出可供审阅。',
      },
    },
    {
      label: { en: 'Test state', zh: '测试状态' },
      state: 'not-public',
      note: { en: 'No public evidence.', zh: '无公开证据。' },
    },
  ],
  panels: [
    {
      kind: 'note',
      title: { en: 'Public evidence unavailable', zh: '无公开证据' },
      source: { en: 'Site editorial standard.', zh: '本站编写准则。' },
      caption: {
        en: 'Rather than render interface mockups, this page states the design and marks every implementation claim as unverifiable. Any AI output in this workflow is triage support — it does not replace a veterinarian.',
        zh: '本页不使用界面假图，而是陈述设计，并把每一项实现主张标注为不可核实。该流程中的任何 AI 输出都属于分诊辅助——不替代兽医。',
      },
    },
  ],
};

/* --------------------------------------------------------------------- PDIG */

const pdig: ProjectEvidence = {
  headline: { en: 'Specification and design', zh: '规范与设计' },
  reality: { en: 'Spec-level work. No public artifact to inspect.', zh: '规范层工作，无公开实物可检视。' },
  publicCode: 'none',
  rows: [
    {
      label: { en: 'Canonical specification', zh: '权威规范' },
      state: 'designed',
      note: {
        en: 'A single graph model for personal infrastructure — accounts, devices, credentials, providers, domains — plus the invariants that keep two implementations comparable.',
        zh: '面向个人基础设施（账户、设备、凭据、服务方、域名）的统一图谱模型，以及保证不同实现可比较的不变量。',
      },
    },
    {
      label: { en: 'Conformance harness', zh: '一致性测试套件' },
      state: 'not-public',
      note: {
        en: 'A fixture-based conformance suite is reported, including impact-correctness checks against hand-worked expected results. The author reports 64 fixtures; nothing is published, so this site cannot check the count.',
        zh: '据称存在基于 fixture 的一致性测试套件，包含与人工推演结果对照的影响正确性检查。作者报告的 fixture 数为 64 个；由于未公开发布，本站无法核对这一数量。',
      },
    },
    {
      label: { en: 'Android native implementation', zh: 'Android 原生实现' },
      state: 'not-public',
      note: {
        en: 'Reported as the most complete platform target. No build, screenshot or test output is public.',
        zh: '据称是最完整的平台目标。没有任何构建产物、截图或测试输出公开。',
      },
    },
    {
      label: { en: 'Native migration plan', zh: '原生迁移计划' },
      state: 'designed',
      note: {
        en: 'Moving spec primitives out of scripted layers and into native code is specified as a migration step, not completed.',
        zh: '把规范原语从脚本层迁移到原生层被定义为迁移步骤，尚未完成。',
      },
    },
    {
      label: { en: 'Cryptography and privacy rules', zh: '密码学与隐私规则' },
      state: 'designed',
      note: {
        en: 'Local-first storage with explicit handling of secrets and derived keys. Design only — no audit is claimed.',
        zh: '本地优先存储，明确处理密钥与派生密钥。仅停留在设计层面，未声称经过审计。',
      },
    },
    {
      label: { en: 'iOS / HarmonyOS targets', zh: 'iOS / HarmonyOS 目标' },
      state: 'planned',
      note: { en: 'Adapter work not started publicly.', zh: '适配器工作尚未公开启动。' },
    },
    {
      label: { en: 'Public repository', zh: '公开仓库' },
      state: 'not-public',
      note: { en: 'None. This page is the only artifact.', zh: '无。本页是唯一可检视的内容。' },
    },
  ],
  panels: [
    {
      kind: 'note',
      title: { en: 'Why the specification comes first', zh: '为什么先做规范' },
      source: { en: 'Author design notes.', zh: '作者设计笔记。' },
      caption: {
        en: 'The bet is that a written spec with testable invariants is the scarce artifact — native clients are downstream of it. Nothing here asserts that the clients exist in any checkable form.',
        zh: '核心判断是：带有可测不变量的书面规范才是稀缺产物，原生客户端是它的下游。此处不断言客户端以任何可核实形态存在。',
      },
    },
  ],
};

export const PROJECT_EVIDENCE: Record<string, ProjectEvidence> = {
  wennian,
  hycell,
  'taiyi-lingjing': taiyi,
  'pet-ai-health': pet,
  pdig,
};

export function getProjectEvidence(slug: string): ProjectEvidence | undefined {
  return PROJECT_EVIDENCE[slug];
}

export const REALITY_ORDER: RealityState[] = [
  'built',
  'validated',
  'partial',
  'prototype',
  'designed',
  'planned',
  'not-public',
];
