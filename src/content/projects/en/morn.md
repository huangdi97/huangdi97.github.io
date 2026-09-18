---
title: 'Morn'
subtitle: 'Work & Organization Control Plane'
seoTitle: 'Morn — Work & Organization Control Plane'
slug: 'morn'
year: 2026
status: 'Active'
category: 'Agent Runtime · Distributed Systems · Rust'
summary: 'A domain-neutral control plane for governed work, durable execution and safe evolution.'
description: >-
  A Rust workspace that treats work itself as governed state: a stable semantic
  kernel, an append-only ledger, a governed action gateway with graded effect
  classes, and a two-node durable runtime. Four product surfaces, a Tauri
  desktop shell and a scripted full verification run are public.
tags: ['Rust', 'Control Plane', 'Durable Runtime', 'Governance', 'Desktop']
featured: true
order: 3
repo: 'https://github.com/huangdi97/morn'
role: 'System design, architecture and engineering'
groups: ['agents', 'infrastructure']
visual: 'runtime'
statusNote: 'Public Rust workspace. The README reports v1.0.0-rc.1 with local GA complete; this site quotes that status and does not re-run the suite.'
stack: ['Rust', 'axum', 'React / Vite', 'Tauri v2', 'SQLite']
---

## Overview

Morn is a work and organisation control plane: a domain-neutral kernel for
governed work, actors, artifacts, outcomes, evolution and distributed durable
execution.

The repository README describes the current state as **v1.0.0-rc.1, local GA
complete**. Four product surfaces — Workbench, Studio, Console and Hub — sit on
one axum backend with one React / Vite front end, joined by a Tauri v2 desktop
shell and a developer CLI.

How to read this page: behavioural claims come from the public repository, and
every number is quoted from the README rather than from a run this site
performed. No pass rate is asserted.

## Problem

Most workflow and project tools store the same thing twice: the record of what
was decided, and the record of what actually happened. They drift apart, and
nothing in the system notices.

"Durable agent execution" makes this worse rather than better. Once software can
take actions on its own, the interesting question is no longer what it can do —
it is which effects are reversible, who approved them, and what remains true if
a node dies halfway through.

Three requirements follow, and they are not separable:

- A **canonical state change** must be distinguishable from a derived view. A
  runtime that can write canonical state directly can also destroy it silently.
- An **irreversible effect** must be gated differently from a reversible one.
  Uniform permission models either block everything or permit too much.
- A **checkpoint** must survive a node failure, or the work restarts from an
  unclear point and produces duplicate effects.

## Why It Matters

Agent and automation products tend to solve this with a log viewer bolted on
afterwards. That records what happened but does not constrain what is allowed to
happen.

If the constraint lives in the write path instead, three properties become
structural rather than aspirational: claims are auditable because actions pass a
single gateway; interruptions are recoverable because leasing and checkpoints
are part of the runtime; and change is reversible because promotion creates a
new version plus a rollback point instead of editing production.

## Product / Research Thesis

1. **Semantics must be un-redefinable.** Kernel primitives are fixed; plugins
   extend the surface, never the meaning.
2. **Effect class, not role, governs writes.** How hard an effect is to undo is
   a better authorisation boundary than who is asking.
3. **Durability is a storage problem and a coordination problem.** Checkpointing
   without leasing only removes one of the two failure modes.
4. **Domain neutrality is a test.** Starting and running with zero domain packs
   proves the core carries no accidental domain assumptions.

## System Design

Canonical state changes flow through one path:

```text
Proposal → Schema → Domain → Policy → Approval / Simulation
        → Action Gateway → Commit → Verify → Ledger / Outcome
```

Runtimes and providers sit behind stable contracts and cannot commit canonical
world state directly. Effects are graded: E0 read-only through E3 irreversible,
with approval required for E3 and a compensation plan required for E2.

## Architecture

**Semantic kernel** (`morn-kernel`) — identity, workspace, policy, approval,
append-only ledger and versioned contracts.

**Operational world** (`morn-world`) — objects, relations, events, state
snapshots, state diffs and outcomes behind the governed gateway.

**Work and organisation** (`morn-work`, `morn-organization`, `morn-actor`) —
work packages, acceptance specs, durable runtimes, role slots, members and
actors, with representation contracts held as data.

**Evolution** (`morn-evolution`, `morn-foundry`, `morn-assurance`) —
candidate / branch / evaluation / promotion separated from production, plus a
solution compiler, certification and rollback points.

**Capability fabric** (`morn-capability`, `morn-harness`, `morn-runtime`,
`morn-integration`) — replaceable providers, runtimes and connectors; connectors
write only through governed tokens.

**Node and process** (`morn-node`, `morn-process`) — two-node claim, checkpoint,
lease, failover and dedupe.

**Domain SDK** (`morn-domain-sdk`, `morn-package`) — install, enable, disable,
upgrade and uninstall for domain packs with preserved history.

## Core Capabilities

**Governed action gateway.** Four effect classes with different gates, so the
cost of an action determines the friction required to take it.

**Immutable artifacts.** Edits create new versions with lineage; old versions
stay readable.

**Non-mutating promotion.** A new version and a rollback point replace the old
one — production is never edited in place.

**Two-node durable execution.** Claim, checkpoint, lease, failover and dedupe
across two nodes.

**Zero-domain start.** The core boots with no domain pack installed; the
reference `biolab-reference` pack is separate and feature-gated.

## Technical Decisions

**22 crates, ordered by dependency.** kernel → world / work → capability → app.
The ordering is a compile-time statement about what is allowed to depend on
what.

**Domain packs are installed, never imported.** Domain knowledge enters through
the public SDK, so the kernel cannot absorb domain assumptions by accident.

**One verification script.** `scripts/run_all.ps1` covers fmt, clippy, Rust
tests, front-end checks, the desktop build and UI / E2E smokes — acceptance is
scripted rather than described.

**Blockers recorded instead of hidden.** Two known external blockers are written
into the README: a real DeepSeek harness smoke needs real credentials, and a
real BioLab data pilot needs a lawful dataset. Both are reported as blocked, not
as passing.

## Current Status

Public Rust workspace, twenty-two crates, four product surfaces, a Tauri v2
desktop shell and a developer CLI. `scripts/run_all.ps1` is the documented full
verification path.

The README reports v1.0.0-rc.1 with local GA complete, and 218+ Rust tests with
none ignored. This site did not run that suite, so no pass rate is claimed.

Two items remain blocked for reasons outside the repository, and are listed as
blockers rather than quietly omitted.

## Next

- Resolve the two recorded blockers with real credentials and a lawful dataset,
  or keep them marked as blocked.
- Extend the two-node runtime contract beyond two nodes and publish what breaks.
- Move pack lifecycle changes behind the same evidence trail as work actions.
