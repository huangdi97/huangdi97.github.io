---
title: 'TaiYi Lingjing / 太一·灵境'
slug: 'taiyi-lingjing'
year: 2026
status: 'Research'
category: 'AI Discovery Platform · Agents · Scientific Intelligence'
summary: 'An agentic discovery platform connecting biology, evidence, simulation and experimentation.'
description: >-
  A research program for an AI-native scientific discovery environment. It
  connects biological state, evidence retrieval, mechanistic simulation and
  experiment planning into one auditable loop, with agents coordinating each
  stage and an evidence audit layer that every claim must pass.
tags: ['Agents', 'RAG', 'Knowledge Graph', 'Simulation', 'Causal Reasoning']
featured: true
order: 3
role: 'System design and research'
groups: ['agents', 'ai-science']
visual: 'discovery'
statusNote: 'Research program and system design. No public repository — no code link is shown.'
stack: ['Agents', 'RAG', 'Knowledge graph', 'PBPK / QSP / ODE', 'Bayesian optimisation']
---

## Overview

TaiYi Lingjing (太一·灵境) is a research program for an AI-native scientific
discovery environment: one loop that starts from a biological question and
ends at a ranked, evidence-backed experiment plan.

The environment is organised around five subsystems — **Bio**, **Discovery**,
**Experiment**, **Evidence** and **Human** — with agents coordinating the
hand-offs between them.

Disclosure up front: this is a design and research program, not a released
system. There is no public repository, and this page deliberately shows no
code link. Everything below describes the architecture and the reasoning
behind it, and marks what is designed versus what is not built.

## Problem

Scientific discovery tooling is fragmented in a way that destroys provenance.

Retrieval lives in one tool, knowledge graphs in another, simulation in a
third, and experiment planning in a spreadsheet. Each hand-off is manual, and
each manual hand-off loses context: which evidence supported this hypothesis,
which assumptions the simulation encoded, which parameter the planner actually
optimised.

The result is that a hypothesis can look well-supported while being two
transfer steps away from the evidence that supposedly supports it. When the
chain is broken, the failure is invisible — there is no artifact that records
where it broke.

## Why It Matters

A discovery system is only useful if a scientist can audit it. That means:

- Every claim resolves to a citation or an explicitly labelled assumption.
- Every simulated trajectory records the model, parameters and mechanism used.
- Every recommended experiment states what result would falsify the
  hypothesis behind it.

Without those, the system produces text that reads like science without being
checkable — which is worse than producing nothing, because it consumes
someone's experiment budget.

## Product / Research Thesis

1. **Discovery is a loop, not a pipeline.** Simulation output should change
   what gets retrieved; experiment results should change what gets simulated.
2. **Mechanistic and learned models should be coupled, not chosen between.**
   PBPK / QSP / ODE models carry interpretable structure; learned components
   carry coverage where mechanism is unknown.
3. **Evidence audit is infrastructure, not a review step.** Provenance has to
   be captured at generation time, because it cannot be reconstructed later.
4. **The human is a subsystem.** Where the loop defers to a person is a
   design decision, not a gap.

## System Design

The loop, in one pass:

```text
question → evidence retrieval → hypothesis (knowledge graph)
        → simulation → experiment design → evidence audit
        → human review → back to retrieval with new constraints
```

The audit stage is not terminal. Its output feeds back into retrieval as new
constraints, which is what makes this a loop rather than a report generator.

## Architecture

**Bio.** Biological state representation: targets, pathways, cell systems and
perturbation effects. This is the substrate hypotheses are expressed over, and
it is where HyCell's compact-state work plugs in.

**Discovery.** Retrieval-augmented hypothesis generation over primary
literature, grounded in a knowledge graph rather than free text similarity
alone. Candidates are generated with their supporting evidence attached.

**Experiment.** Simulation and experiment planning. Mechanistic layers
(PBPK / QSP / ODE) handle interpretable dynamics; Bayesian optimisation
handles experimental design under a limited budget; causal reasoning
separates what an intervention is expected to cause from what has merely been
observed together.

**Evidence.** Provenance capture and audit. Every generated claim carries
either a citation or an explicit assumption marker, and the audit layer
rejects claims that can produce neither.

**Human.** Review, override and escalation. The loop states where it needs a
person, and keeps the decision record with the hypothesis.

## Core Capabilities

**Retrieval grounded in structure.** RAG over primary evidence, constrained
by a knowledge graph so retrieval returns candidates that are structurally
plausible rather than merely textually similar.

**Simulation with recorded mechanism.** Each trajectory records which model
family produced it, with what parameters, under which assumptions.

**Experiment design under budget.** Bayesian optimisation proposes the next
experiment, with the acquisition criterion exposed rather than hidden — a
scientist should be able to see what the planner is optimising.

**Causal separation.** Explicit distinction between observational association
and expected interventional effect, so a plan does not quietly upgrade
correlation into causation.

**Evidence audit.** Structured output stating, per claim: supported by
citation, supported by assumption, or unsupported.

## Technical Decisions

**Knowledge graph as substrate, not visualisation.** The graph is where
hypotheses live and where retrieval is constrained. A graph rendered after the
fact is a diagram; a graph used for constraint is infrastructure.

**Evidence captured at generation time.** Provenance cannot be reconstructed
afterwards. The generator is required to emit it.

**Explicit assumption markers.** An unlabelled assumption is the primary way
these systems mislead. A claim that rests on an assumption is still useful —
but only if it says so.

**Deferral designed in.** The Human subsystem exists because some decisions
should not be automated. Encoding that as a subsystem keeps it from being
treated as a missing feature.

## Engineering

The program is specified as subsystem contracts first: what each stage
accepts, what it emits, and what it must refuse to emit. Implementation
follows the contracts rather than the reverse, so a stage can be replaced
without changing the loop.

Where a subsystem already exists as a working prototype elsewhere in this
portfolio — compact biological state from HyCell, structured interview and
auditor patterns from WenNian — the design reuses those interfaces instead of
defining new ones.

## Validation

No results are reported here, because no validated system exists yet. The
validation plan is part of the design:

- **Provenance recall** — sample generated claims and trace each to a citation
  or an explicit assumption marker; measure the fraction that cannot be traced.
- **Simulation reproducibility** — a recorded trajectory must be re-runnable
  from its recorded model, parameters and version.
- **Planner honesty** — proposed experiments must state a falsification
  condition; plans without one are rejected.
- **Human-subsystem latency** — measure how often the loop defers, and whether
  deferrals cluster where the design expects them.

## Current Status

Research program and system design. The subsystem contracts, the loop
structure and the evidence-audit requirements are specified. Implementation is
partial and not released, and there is no public repository.

This page is intentionally the only artifact: no repository link is shown,
because none can be verified.

## What I Learned

Designing the audit stage before the retrieval stage changed the shape of the
system. Once every claim must carry provenance at generation time, retrieval
has to return structured candidates with citations attached, which rules out
most of the obvious implementations — and that constraint is worth having.

The second lesson is that "the human reviews it" is not a design. Naming the
Human subsystem forced the question of *where* the loop defers, and the answer
turned out to be specifiable.

## Next

- Implement the Bio subsystem contract over an existing compact-state
  representation.
- Build the evidence-audit layer first and run it against manually written
  hypotheses, so the failure modes are visible before generation exists.
- Add one mechanistic simulation family end to end before adding a second.
- Publish the subsystem contracts as a specification document.
