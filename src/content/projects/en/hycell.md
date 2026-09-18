---
title: 'HyCell'
slug: 'hycell'
year: 2026
status: 'Prototype'
category: 'Computational Biology · AI Virtual Cell · Representation Learning'
summary: 'AI virtual-cell infrastructure for biological representation and simulation.'
description: >-
  A cellular world-model prototype that treats interventions as transitions
  over compact, inspectable biological belief states — surrounded by the
  data contracts, verifiers and reproducibility scripts a larger virtual-cell
  effort would need.
tags: ['Virtual Cell', 'World Model', 'JEPA', 'Single-cell', 'Python']
featured: true
order: 2
repo: 'https://github.com/huangdi97/HyCell-JEPA'
role: 'System design, architecture and engineering'
groups: ['ai-science', 'experiments']
visual: 'cell-transition'
statusNote: 'v0.1 engineering MVP. Runnable prototype, not a validated biological discovery system.'
stack: ['Python 3.10+', 'PyTorch', 'NumPy', 'Streamlit', 'pytest']
---

## Overview

HyCell is an AI virtual-cell infrastructure project. The current artefact,
HyCell-JEPA, is a v0.1 engineering MVP: a cellular world-model prototype for
HDF aging, regeneration and perturbation planning.

The project asks a deliberately narrow engineering question — can a system
represent cell-state dynamics as transitions over a compact, inspectable
belief state, while keeping verification, planning, real-data ingestion and
documentation honest enough to review? In v0.1 the answer is a runnable local
prototype.

What HyCell is not, stated as plainly as possible: not clinical advice, not
wet-lab validated, not a complete virtual cell, and not a
transcriptome-scale generative model.

## Problem

Cellular perturbation modelling hits a practical tension.

Full transcriptome generation is expensive, data-hungry and hard to validate
inside a small MVP. Biological planning needs interpretable state transitions
and explicit limits *before* any claim about an intervention is safe to make.
Meanwhile public single-cell matrices are genuinely useful for engineering
validation — and their metadata gaps make overclaiming very easy.

The failure mode across the field is not a bad model. It is a software smoke
test that gets reported as a biological finding.

## Why It Matters

AI-for-science systems need more than a checkpoint. They need data contracts,
provenance-aware labels, explicit limits, reproducible commands, and
guardrails against turning engineering plumbing into biological claims.

HyCell is built around that discipline. The model is intentionally modest;
everything around it — loaders, schema checks, encoders, transition
modelling, verifier outputs, planner reporting, demo UX, acceptance
scripts, living documentation — is what a larger virtual-cell effort
actually requires.

## Product / Research Thesis

1. **Compact and inspectable beats high-dimensional and impressive.** A
   reviewer should be able to audit the state without a GPU.
2. **Intervention is a transition, not a generation step.** Model
   `b + a + c + h` → next belief state, and keep each term separable.
3. **Verifiers are part of the model loop.** A prediction that fails sanity
   or overclaim checks should say so, in structured form.
4. **Real data is for engineering validation until proven otherwise.** Public
   matrices validate plumbing; they do not validate biology on their own.

## System Design

The transition interface is the centre of the system:

```text
b_t + a_t + c_t + h_t  →  b_{t+1}
```

Where `b` is a biological belief state, `a` an intervention or action, `c`
context, and `h` a cell-system-specific adapter state. Keeping these
separate is what makes the same core reusable across cell systems instead of
being retrained into the data.

Around the core, the pipeline runs:

```text
cells → gene-set scoring → bio-state encoder ┐
action encoder  ─────────────────────────────┤→ JEPA transition core
context encoder ─────────────────────────────┤      ↓
HDF adapter h_t ─────────────────────────────┘  predicted compact state
                                                     ↓
                                        verifier → planner → demo/report
```

## Architecture

- **Data layer** — a deterministic toy HDF-like generator plus real-data
  ingestion for GSE130973 Matrix Market files, with schema validation over
  `.csv`, `.npz` and optional `.h5ad`.
- **Gene-set scoring** — converts cell-level data into compact, interpretable
  readouts instead of full transcriptomes.
- **Encoders** — bio-state, action, context and HDF adapter encoders, each
  feeding the transition core.
- **JEPA transition core** — a compact ridge-regression transition head over
  the toy compact state.
- **EvidenceGraph** — links toy actions, readouts, assumptions and limits, so
  claims and caveats are represented explicitly rather than in prose.
- **Biological verifier** — structured pass / warn / fail output.
- **Target-state planner** — top-K toy action sequence search, reported as a
  demonstration.
- **Demo** — a Streamlit interface for inspecting the toy loop and real-data
  smoke status.
- **Acceptance scripts** — per-goal verifiers plus a release verification
  script.

## Core Capabilities

**Compact state representation.** Gene-set scoring produces interpretable
belief-state features instead of a high-dimensional black box.

**Transition modelling.** The core predicts the next compact state from
`b`, `a`, `c` and `h`. The adapter slot is what makes the interface portable
across cell systems.

**Verification.** Every run produces structured verifier output. In the
accepted toy workflow the verifier returns warnings rather than silent
passes, which is the intended behaviour: the system is supposed to be
sceptical of its own toy data.

**Planning.** A top-K search over toy action sequences, with distances
reported and an explicit note that output is a software demonstration.

**Real-data smoke workflow.** GSE130973 is ingested, validated, summarised
and projected — capped at 5000 cells × 2000 genes by default — as real-matrix
engineering validation.

## Technical Decisions

**JEPA-style latent transition over transcriptome generation.** v0.1
prioritises runnable local experiments, inspectable readouts, verifier and
planner plumbing, and real-data smoke validation without inventing labels or
transitions. Full generation is deferred until it can be validated.

**An adapter slot in the transition interface.** The `h` term carries
cell-system-specific state, so a skin-fibroblast adapter and a future
different cell system share one transition core.

**EvidenceGraph as a first-class object.** Assumptions and limits are data,
not documentation prose that drifts away from the code.

**Real data labelled honestly.** The GSE130973 smoke data is unfiltered human
skin single-cell data. `cell_system = skin_single_cell_unfiltered`;
`state_label` and `age_label` are `unknown` from the three GEO files alone.
That is written into the pipeline rather than left as a caveat.

**Reproducibility as a contract.** `pytest`, per-goal verifier scripts and
`scripts/verify_release.sh` are the acceptance criteria.

## Engineering

A local toy workflow runs end to end: generate data, score gene sets, build
the evidence graph, train the encoder, train the transition model, evaluate
the benchmark, run the planner. Each stage is a separate script with a config
file, so any stage can be re-run and inspected in isolation.

The cloud workflow — an RTX 4090 config, run script and result packager — exists
as a reproducibility scaffold. It does not silently launch large jobs or
download large datasets.

## Validation

Published numbers from the accepted toy workflow, with their scope stated:

- Toy score transitions: 8 (6 training, 2 held-out evaluation).
- All-transition MSE: 0.014585165.
- Verifier status counts: 8 warnings.

These values demonstrate that the engineering plumbing runs. They do not
validate biology, and the repository says so. The GSE130973 smoke workflow is
likewise real-matrix engineering validation only.

There is no wet-lab validation, no clinical claim and no benchmark against a
foundation model. That is a property of v0.1, not an oversight.

## Current Status

**Implemented in v0.1:** toy data generation, gene-set scoring, EvidenceGraph,
all four encoders, the JEPA transition core, the HDF adapter, the biological
verifier, the target-state planner, the Streamlit demo, real-data schema
validation, the GSE130973 smoke workflow, the cloud scaffold and the
acceptance scripts.

**Research direction, not yet built:** v0.2 GSE130973 metadata and cell-type
annotation with a documented HDF/fibroblast subset; v0.3 small scPerturb
integration; v0.4 a real perturbation benchmark; v0.5 a stronger biological
verifier with evidence grounding; v1.0 a reproducible AI4LifeScience research
prototype.

**Relationship to virtual-cell foundation models.** Complementary, not
competitive. Foundation models target broad high-dimensional representation
or generation; HyCell v0.1 targets the engineering shell around cellular
transition modelling. A future version could replace the toy compact state
with a stronger biological representation.

## What I Learned

Writing the limitations section first changed the design. Once every claim
has to name the data it rests on, the planner stops producing
recommendations and starts producing demonstrations, and the verifier stops
being decoration.

The adapter slot was the second useful decision. Separating cell-system
state from the transition core is what turns a toy experiment into an
interface other work can plug into.

## Next

- v0.2: GSE130973 metadata and cell-type annotation, documented HDF/fibroblast
  subset.
- v0.3: small scPerturb integration.
- v0.4: a real perturbation benchmark.
- v0.5: stronger biological verifier and evidence grounding.
- v1.0: a reproducible AI4LifeScience research prototype.
