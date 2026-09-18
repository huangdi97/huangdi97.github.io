---
title: 'TaiYi Lingjing / 太一·灵境'
slug: 'taiyi-lingjing'
year: 2026
status: 'Research'
category: 'AI-native Scientific Discovery · Research Concept'
summary: 'A proposed AI-native scientific discovery environment connecting evidence, biological state, simulation and experiment design.'
description: >-
  A concept and research direction for an AI-native scientific discovery
  environment. This is a proposed design — engineering implementation has not
  started. Nothing here has been built, prototyped or validated.
tags: ['Agents', 'RAG', 'Knowledge Graph', 'Simulation', 'Causal Reasoning']
featured: false
order: 9
role: 'Concept and research design'
groups: ['agents', 'ai-science']
visual: 'discovery'
statusNote: 'Concept and research direction. Engineering implementation has not started — there is no repository, prototype or validation result.'
stack: ['Concept design', 'Proposed architecture', 'Evidence provenance', 'PBPK / QSP / ODE (intended)', 'Bayesian optimisation (intended)']
---

## Overview

TaiYi Lingjing (太一·灵境) is a proposed AI-native scientific discovery
environment: one loop that would start from a biological question and end at a
ranked, evidence-backed experiment plan.

The proposed environment is organised around five subsystems — **Bio**,
**Discovery**, **Experiment**, **Evidence** and **Human** — with agents
intended to coordinate the hand-offs between them.

Status first, because it determines how the rest of this page should be read:
this is a **concept and research direction**. Engineering implementation has
**not started**. There is no repository, no prototype, no deployment and no
validation result. Everything below describes a design that is intended, not a
system that runs.

## Motivation

Scientific discovery tooling is fragmented in a way that destroys provenance.

Retrieval lives in one tool, knowledge graphs in another, simulation in a
third, experiment planning in a spreadsheet. Each hand-off is manual, and each
manual hand-off loses context: which evidence supported this hypothesis, which
assumptions the simulation encoded, which parameter the planner actually
optimised.

The consequence is that a hypothesis can look well-supported while sitting two
transfer steps away from the evidence that supposedly supports it. When that
chain breaks, the break is invisible — no artifact records where it happened.
The motivating question is narrow enough to be answerable: if provenance were
captured at generation time rather than reconstructed later, how much of that
loss would become detectable?

## Research Questions

1. **Can provenance be captured at generation time?** A claim should carry its
   citation or an explicit assumption marker the moment it is produced. Whether
   that is enforceable across retrieval, simulation and planning is an open
   question.
2. **Does closing the loop change the hypotheses?** If simulation output is fed
   back as retrieval constraints, do the resulting candidate hypotheses differ
   measurably from a single-pass pipeline?
3. **Where should a discovery loop defer to a person?** Deferral points are
   usually discovered by accident. Treating the human as a subsystem means
   asking whether they can be specified in advance.
4. **Can conservative failure be designed in?** A discovery system should be
   able to report uncertainty rather than fill a gap with plausible text. What
   interface makes that the default rather than the exception?

## Proposed Discovery Loop

The intended loop, in one pass:

```text
question → evidence retrieval → hypothesis (knowledge graph)
        → simulation → experiment design → evidence audit
        → human review → back to retrieval with new constraints
```

The audit stage would not be terminal. Its output is intended to feed back into
retrieval as new constraints, which is what separates a loop from a report
generator.

Nothing here has been implemented. The loop is a specification of control flow,
not a description of behaviour observed in a running system.

## Proposed Architecture

**Bio.** Would hold biological state representation: targets, pathways, cell
systems and perturbation effects. This is intended to be the substrate
hypotheses are expressed over, and the place where HyCell's compact-state work
could eventually plug in.

**Discovery.** Would perform retrieval-augmented hypothesis generation over
primary literature, grounded in a knowledge graph rather than free-text
similarity alone. Candidates would be generated with their supporting evidence
attached.

**Experiment.** Would cover simulation and experiment planning. A mechanistic
layer (PBPK / QSP / ODE) is intended to carry interpretable dynamics; Bayesian
optimisation is planned for experimental design under a limited budget; causal
reasoning is intended to separate what an intervention is expected to cause
from what has merely been observed together.

**Evidence.** Would capture provenance and run audits. Every generated claim
would carry either a citation or an explicit assumption marker, and the audit
layer is intended to reject claims that can produce neither.

**Human.** Would handle review, override and escalation. The design intent is
that the loop states where it needs a person and keeps the decision record with
the hypothesis.

Each of the five is a proposal. No subsystem interface exists in code, and no
repository is planned for publication before the first milestone below.

## Design Principles

**Discovery is a loop, not a pipeline.** Simulation output should change what
gets retrieved; experiment results should change what gets simulated.

**Mechanistic and learned models should be coupled, not chosen between.**
PBPK / QSP / ODE models carry interpretable structure; learned components carry
coverage where mechanism is unknown.

**Evidence audit is infrastructure, not a review step.** Provenance has to be
captured at generation time, because it cannot be reconstructed later.

**The human is a subsystem.** Where the loop defers to a person is a design
decision, not a gap.

**Knowledge graph as substrate, not visualisation.** A graph rendered after the
fact is a diagram; a graph used to constrain retrieval would be
infrastructure.

**Explicit assumption markers.** An unlabelled assumption is the primary way
these systems mislead. A claim resting on an assumption is still useful — but
only if it says so.

## What Must Be Validated

Because nothing has been built, no validation result exists. The following is
the set of checks the design would have to pass before any completion claim
would be defensible:

- **Provenance recall** — sample generated claims and trace each to a citation
  or an explicit assumption marker; measure the fraction that cannot be traced.
- **Simulation reproducibility** — a recorded trajectory must be re-runnable
  from its recorded model, parameters and version.
- **Planner honesty** — proposed experiments must state a falsification
  condition; plans without one would be rejected.
- **Human-subsystem latency** — how often the loop defers, and whether
  deferrals cluster where the design expects them.

Each of these is a criterion, not a result.

## First Implementation Milestone

The smallest piece that would make the rest testable, defined now so it stays
honest later:

1. Write the **Evidence** audit layer first and run it against hand-written
   hypotheses, so its failure modes are visible before any generator exists.
2. Express the **Bio** subsystem contract over a compact biological state
   representation rather than inventing one.
3. Connect one **retrieval** path to one **simulation** family end to end —
   and stop there until that single path is auditable.

No date is attached to this milestone, because no work has started.

## Current Status

Concept and research direction only.

Engineering implementation has not started.

There is no repository, prototype, deployment or validation result.

The architecture shown on this page describes the intended system, not an
implemented one. This page is deliberately the only artifact, and no code link
is shown because none could be verified.

## Next

- Publish the subsystem contracts as a written specification before writing
  any service code.
- Decide whether the first retrieval path uses structured literature sources or
  an existing knowledge graph, and record why.
- Revisit whether the five-subsystem split survives contact with the first
  working Evidence layer — the decomposition is a hypothesis too.
