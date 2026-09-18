---
title: 'BioPulse'
subtitle: '生命科学 Agent-native 工作台'
seoTitle: 'BioPulse — Agent-native workbench for life science'
slug: 'biopulse'
year: 2026
status: 'Active'
category: 'Agent Systems · Life Science · Compliance'
summary: 'An agent-native workbench where agents do the reading, filling and cross-auditing.'
description: >-
  A public FastAPI service with seven agent packages, a layered safety guard,
  vector memory and a four-surface client set — management console, web,
  Flutter mobile and WeChat mini program. MIT licensed, and no accuracy number
  is claimed anywhere on this page.
tags: ['Multi-Agent', 'Compliance', 'Inference Engine', 'Multi-surface', 'Python']
featured: true
order: 4
repo: 'https://github.com/huangdi97/BioPulse'
role: 'System design, architecture and engineering'
groups: ['agents', 'ai-health']
visual: 'pulse'
statusNote: 'Public repository with MIT license detected by GitHub. README claims describe capability; no benchmark or accuracy figure is published.'
stack: ['Python 3.12', 'FastAPI', 'LangGraph', 'Flutter', 'Prometheus']
---

## Overview

BioPulse is an agent-native workbench for life-science commercial workflows.
The difference it aims at is stated plainly in the repository: not a CRM with AI
bolted on, but software in which agents do the filling, the watching and the
forward simulation.

The published tree contains a FastAPI cloud service, seven agent packages, a
layered safety guard, vector memory with RAG ingestion, and four client
surfaces — a React management console, a web client, a Flutter mobile app and a
WeChat mini program. GitHub detects an MIT license.

Scope note: this page publishes no accuracy figure, no customer and no revenue
number. None is available to check.

## Problem

Life-science commercial teams run on records nobody has time to maintain.
 Representatives enter visits late and incompletely; expense claims arrive
 detached from the visits they belong to; managers read dashboards built from
 those incomplete records and infer trends from them.

Two consequences follow, and they compound:

- **Audit is retrospective.** Visits, expenses and product flow sit in different
  systems, so their inconsistencies are discovered by sampling rather than by
  construction.
- **Questions go through people.** "How did the biologics line convert last
  week?" becomes a request to whoever can write the query.

Both are coordination problems disguised as reporting problems. Adding another
dashboard does not fix either.

## Why It Matters

An agent that can act — fill a form, flag an anomaly, propose a sequence — needs
a harder constraint than "answer the question". In a regulated commercial
context, the acceptable failure mode is silence, not confident invention.

That is why this project puts a layered safety guard next to the agent runtime
rather than after it, and why the compliance module cross-audits visits against
expenses and flow instead of scoring one dimension in isolation. The published
test suite contains dedicated L1 and L3 safety-guard cases, which is the only
part of the safety story this site can actually point at.

## Product / Research Thesis

1. **Agents replace steps, not screens.** The unit of value is a completed
   workflow step with a record attached, not an answer box.
2. **Audit must be structural.** Cross-referencing visits, expenses and flow is
   the product; a monthly sample is a workaround.
3. **Conservative failure is the default.** A layered guard is part of the write
   path, so an unsupported claim is refused rather than softened.
4. **Published capability must equal published evidence.** Where no benchmark
   exists, no accuracy number is stated.

## System Design

```text
agent request → safety profile → agent runtime (loop / retry / circuit breaker)
              → tool bridge → domain services → repositories
              → audit record
```

The runtime owns execution semantics — loop, retry, error taxonomy, circuit
breaking, dead-lettering, metrics — while domain behaviour stays in services.
Safety is layered (L1 through L3 in the tests) rather than a single filter at
the edge.

## Architecture

**Cloud service.** `cloud/app` — agent runtime, agent definitions, safety
guards, analysis and inference evaluation, compliance, repositories, routers and
typed schemas, plus migrations.

**Seven agents.** Compliance monitor, anomaly analysis, sales suggestion, sales
coach analyst, knowledge worker, opportunity scanner and competitor crawler,
each its own package under `agents/`.

**Memory and retrieval.** Vector memory and RAG ingestion modules with tests in
`tests/agent_runtime`.

**Client surfaces.** `frontend/` React management console, `web/`, `mobile_app/`
Flutter (offline-first SQLite), and `weapp/` WeChat mini program.

**Delivery.** `deploy/` carries Nginx + TLS, backup and CI / CD configuration;
monitoring is Prometheus-based per the README's technology table.

## Core Capabilities

**Seven working agents.** Named, separated packages rather than one prompt with
switches.

**Inference with stated uncertainty.** The README describes causal chains with
confidence intervals, back-testing and parallel comparison. No benchmark
accompanies it, so this page states the design and nothing else.

**Representative workbench.** Visit ordering, HCP profiles, competitor alerts,
voice entry, expense pre-review and visit justification.

**Cross-domain compliance.** Visit × expense × flow cross-audit, unannounced
inspection handling and diversion detection.

**Four surfaces, one service.** Management, web, mobile and mini program against
the same cloud deployment.

## Technical Decisions

**Runtime rather than orchestration-only.** Loop semantics, retries and
circuit breaking live in code with their own tests, so failure behaviour is part
of the contract instead of a framework default.

**Safety as layers.** L1 / L3 guards are defined and tested separately from the
agents they constrain.

**Offline-first mobile.** SQLite on device, so a field day does not depend on
connectivity.

**Neither faked nor omitted.** Every capability named here maps to a directory
in the public tree; anything that is only described in prose is labelled as
described, not as verified.

## Current Status

Public repository, MIT license detected by GitHub — the only project in this
portfolio with a machine-confirmed license.

The tree holds 1,297 Python files across the cloud service, agents, tests and
support modules, plus four client surfaces. `tests/` covers the agent runtime,
the agents, services, the front end and the mini program. This site did not run
that suite, so no pass rate is claimed.

Nothing here supports an accuracy, customer or revenue claim, and none is made.

## Next

- Publish a benchmark for the inference engine, or keep stating that none
  exists.
- Extend the compliance cross-audit to generate its own weekly artifact rather
  than being read on demand.
- Decide whether the WeChat mini program and the Flutter client can share one
  typed contract layer.
