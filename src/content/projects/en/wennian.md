---
title: 'WenNian / 知身·问年'
slug: 'wennian'
year: 2026
status: 'Active'
category: 'AI Health · Aging Intelligence · Decision Support'
summary: 'AI aging assessment and intervention decision system.'
description: >-
  A decision engine for aging intervention. It runs multi-clock biological age
  assessment over routine blood markers, turns vague complaints into structured
  dimensions through an active interview, and produces intervention priorities
  that carry confidence intervals and an audit trail.
tags: ['Aging Clock', 'Multi-Agent', 'Intervention Priority', 'Decision Support', 'Python']
featured: true
order: 1
repo: 'https://github.com/huangdi97/WenNian'
role: 'System design, architecture and engineering'
groups: ['ai-health', 'agents']
visual: 'aging'
statusNote: 'Open-source MVP. Assessment output only — not a diagnostic device. License unresolved: the README states GPLv3, GitHub detects no LICENSE file.'
stack: ['Python 3.10+', 'FastAPI', 'Gradio', 'pytest', 'YAML config']
---

## Overview

WenNian (问年) is not an aging test. It is a decision engine: it estimates
where a person sits across several biological aging axes, works out which axis
is actually driving that profile, and reasons about what to change first.

The open-source MVP covers three capabilities: a full-spectrum aging
assessment, a structured health interview, and white-label report generation.
Everything downstream of the assessment — driver identification, intervention
priority, report content — is produced by the same pipeline, so a number on a
page and the reasoning behind it never drift apart.

## Problem

Aging assessment products tend to fail in one of two directions.

The first failure is arithmetic. A single clock consumes a blood panel and
returns one number: "your biological age is 41.3". That number is hard to act
on, hard to explain, and usually presented without any interval. Two people
with the same output can have entirely different underlying profiles.

The second failure is narrative. A chatbot is placed in front of a lab report
and asked to interpret it. The interpretation reads well and carries no
contract: no schema, no confidence bounds, no record of which assumption
produced which claim, and no reliable way to stop it from drifting into
medical advice.

Both failure modes share a root cause: the hard part is not the model, it is
the contract around it. What is measured, what is inferred, what is assumed,
and what is explicitly out of scope.

## Why It Matters

Intervention decisions are ranked decisions. If a profile is driven primarily
by vascular aging and secondarily by metabolic aging, the ordering matters
more than the headline number — and a single scalar cannot express it.

There is also an input quality problem. People arrive with complaints, not
measurements: "I get tired in the afternoon", "my sleep broke down six months
ago". Those statements carry real signal, but only after they have been
translated into assessment dimensions. Leaving that translation to a
free-form chat means the downstream assessment is operating on whatever
happened to be mentioned.

## Product / Research Thesis

Three claims shape the system.

1. **Aging is multi-dimensional, so the output must be.** A scalar biological
   age is a reporting convenience, not a state description.
2. **Input quality dominates model quality.** Structured active interviewing
   before assessment produces a better profile than a better clock over a
   worse input.
3. **An intervention recommendation is a claim, and claims need an auditor.**
   Any output that a person might act on must pass a red-line scan and carry
   a stated scope limit.

## System Design

The pipeline is deliberately linear, with a verification stage that cannot be
skipped:

```text
inputs → validation → clocks → organ clocks → integrator
       → driver identification → intervention reasoning
       → auditor → report
```

The interview stage runs *before* assessment and writes into the same
dimension model the integrator consumes, so an interview finding and a
biomarker finding are comparable quantities rather than two parallel
narratives.

## Architecture

Layers, in execution order:

- **Inputs** — typed data models and validation for the nine routine blood
  markers the clocks consume (albumin, creatinine, glucose, CRP and others).
- **Clocks** — PhenoAge, KDM, DNN and LifeClock implementations.
- **Dimensions** — organ-level clocks covering heart, liver, kidney, brain,
  lung, vascular, immune and skeletal muscle, used to surface aging
  asynchrony between organs.
- **Integrator** — fuses clock outputs, identifies the dominant driver
  dimension, and derives intervention priority.
- **Agents** — Analyst, Auditor and HealthInterviewer roles, each with a
  bounded responsibility and an inspectable output.
- **Knowledge** — a symptom-to-aging-dimension mapping library covering 100+
  common presenting complaints.
- **Validation** — input validation, red-line scanning and numeric guards.
- **Outputs** — report construction and PDF rendering with per-page
  disclaimers.
- **Commercial** — white-label branding (logo, name, theme colour) and batch
  generation from CSV, packaged as a ZIP.
- **API / UI** — a FastAPI surface and a Gradio interface for local use.

## Core Capabilities

**Full-spectrum aging assessment.** Nine routine blood markers drive four
classical clocks plus the organ-clock layer. The result is a profile across
organ systems, an asynchrony read, a dominant driver, and a prioritised
intervention list. Every prediction carries a confidence interval.

**Structured health interview.** A person describes how they feel in natural
language. The interviewer agent runs at most three rounds of follow-up, using
the symptom-to-dimension mapping library so the questioning stays anchored to
real assessment dimensions rather than improvising. The output feeds directly
into the assessment.

**White-label reporting.** Clinics and assessment centres configure their own
branding. Reports include an organ radar chart, a biological age summary,
intervention suggestions and a disclaimer on every page. Batch mode accepts a
CSV and returns a ZIP.

## Technical Decisions

**Four clocks instead of one.** A single clock is easy to ship and impossible
to defend. Running PhenoAge, KDM, DNN and LifeClock together makes
disagreement visible, and disagreement between clocks is itself signal.

**Organ clocks as a separate layer.** Organ-level aging is derived
independently from the global clocks. Global biological age and organ
asynchrony answer different questions and should not be collapsed into one
number.

**A bounded interview.** Three rounds maximum, mapped against a fixed
complaint library. An unbounded conversation produces unbounded input, and
unbounded input cannot be validated.

**The Auditor is not optional.** Every output passes a red-line scan that
blocks medical advice and prescribing. This is enforced in the pipeline, not
requested in a prompt.

**Local by default.** A privacy mode keeps data on the user's machine. An
aging profile is among the more sensitive datasets a person can generate; the
architecture treats that as a requirement rather than a setting.

## Engineering

The repository is organised around module boundaries that match the pipeline
stages: `core`, `clocks`, `dimensions`, `integrator`, `causality`, `agents`,
`knowledge`, `inputs`, `outputs`, `validation`, `commercial`, `api` and `ui`.
Configuration lives in YAML under `config/`, and behaviour is changed by
editing config rather than code where that is possible.

The system runs locally — `python src/ui/app.py` serves the interface on
`127.0.0.1` — and the test suite runs with `pytest`.

## Validation

The Guardian-style checks are part of the normal path, not a separate QA
phase:

- **Input validation and numeric guards** reject out-of-range markers before
  any clock runs.
- **Confidence intervals** are attached to predictions, so a point estimate
  is never presented alone.
- **Red-line scanning** blocks medical advice, prescriptions and diagnostic
  language in generated content.
- **Automated tests** cover the clock implementations, integrator behaviour
  and report construction.
- **Per-page disclaimers** state the scope of the report in the artifact
  itself, so the limit travels with the document.

## Current Status

The open-source release is an MVP covering the three capabilities described
above. It is distributed as a local, self-hosted application.

On licensing, one unresolved point: the README states GPLv3, but GitHub detects
no LICENSE file in the repository. Until that is reconciled, treat the license
as unconfirmed rather than settled.

Explicitly out of scope: this is not a diagnostic device, does not provide
medical advice, and does not prescribe. Reports state that they describe
health trends and do not constitute a diagnosis.

## What I Learned

The interview stage was the highest-leverage component and the least obvious
one. Improving input quality moved the assessment more than tuning the
aggregation did, which is a useful thing to learn before spending time on
model complexity.

The Auditor also changed how the rest of the system was written. Once output
is required to pass a red-line scan, downstream components have to emit
structured claims rather than prose, and that constraint improved them.

## Next

- Extend continuous sensing so the profile updates from wearable and
  longitudinal signals rather than a single blood panel.
- Deepen the digital twin: simulate an intervention trajectory over the
  current state instead of returning a static ranked list.
- Complete the causal layer for intervention reasoning, which is only
  partially open in the MVP.
- Strengthen evidence grounding so each intervention suggestion cites the
  class of evidence behind it.
