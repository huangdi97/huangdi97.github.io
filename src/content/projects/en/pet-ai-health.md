---
title: 'Pet AI Health'
slug: 'pet-ai-health'
year: 2026
status: 'Research'
category: 'AI Health · Multimodal AI · Pet Care'
summary: 'An AI-native pet health platform spanning observation, risk assessment, consultation and care workflows.'
description: >-
  A product architecture for pet health that runs from owner observation
  through multimodal signal intake, risk assessment, consultation and care
  coordination — with explicit escalation to a veterinarian and adapters for
  external care providers.
tags: ['Multimodal', 'Health Assessment', 'Care Workflow', 'Provider Adapters']
featured: false
order: 4
role: 'Product architecture and system design'
groups: ['ai-health', 'agents']
visual: 'pet'
statusNote: 'Product architecture and design. Not a veterinary diagnostic tool; escalation to a veterinarian is designed in.'
stack: ['Multimodal intake', 'Risk assessment', 'Workflow routing', 'Provider adapters']
coverType: 'AI-native Pet Health Platform'
coverDescription: >-
  A product architecture running from owner observation through intake, risk assessment, consultation and care coordination.
coverCapabilities: ['Observation', 'Multimodal Intake', 'Risk Assessment', 'Consultation', 'Care Coordination']
coverStatus: 'Design study'
coverStatusSecondary: 'Product architecture'
coverVisualHint: 'care-flow'
---

## Overview

Pet AI Health is a product architecture for an AI-native pet health platform.
It covers the full path an owner actually walks: something looks wrong, signals
get captured, risk gets assessed, a consultation happens, and care gets
coordinated.

The platform does not diagnose, and does not replace a veterinarian. Escalation
to a human clinician is a designed transition in the workflow, not a fallback
for when the model is unsure.

Disclosure: this is a product and system design, not a released product. No
public repository exists, so no code link is shown.

## Problem

Pet health data is abundant and unusable.

Owners generate continuous observation — appetite, activity, stool, coat,
behaviour, video — but it arrives unstructured, episodic and in the owner's
own vocabulary. Clinics hold structured records that the owner never sees and
cannot easily carry between providers. Nothing reconciles the two.

The second problem is escalation. Most consumer health products treat
professional care as an exception path: the assistant handles what it can, and
when it fails the user is told to "consult a professional". That is not a
workflow, it is an exit. The hard design problem is deciding *when* to hand
over, and carrying the accumulated context across the hand-over.

## Why It Matters

Animals cannot report symptoms. Everything the system knows comes from owner
observation and device signals, which means observation quality is the binding
constraint on everything downstream — the same lesson ZhiShen · WenNian's
interview stage teaches on the human side.

The stakes of a wrong escalation are also asymmetric. Under-escalating an
urgent case is far worse than over-escalating a benign one, so the routing
logic has to be tuned deliberately rather than left to a confidence threshold
someone picked once.

## Product / Research Thesis

1. **Observation is the primary sensor, so structure it first.** Multimodal
   intake — text, image, video, device data — has to be normalised into
   comparable signal before any assessment is meaningful.
2. **Species and breed are parameters, not details.** Risk baselines differ
   substantially across species, breeds and ages; a single model over "pets"
   would be wrong in a way that averages hide.
3. **Escalation is a workflow transition.** Where the platform defers to a
   veterinarian is a designed decision with a carried context payload.
4. **Care coordination is the product.** Assessment without a path to care
   leaves the owner with information and nowhere to take it.

## System Design

```text
observation → multimodal intake → signal normalisation
           → risk assessment → routing decision
           → consultation | escalation → care coordination → follow-up
```

The routing decision is the centre of the system. It is not a confidence
score compared against a threshold; it is an explicit policy over signal
strength, risk tier and urgency pattern.

## Architecture

**Observation.** Owner-reported signals in natural language, plus photo and
video where the owner can supply them. Structured prompts guide what gets
captured, because "how is your pet doing" produces unusable answers.

**Intake and normalisation.** Multimodal signals are converted into
comparable, timestamped observations. Free text is mapped onto a fixed
observation vocabulary; images and video are treated as evidence attached to
an observation rather than as standalone inputs.

**Assessment.** Risk scoring against species-, breed- and age-appropriate
baselines, with the uncertainty stated. Multiple weak signals over time are
weighted differently from one strong signal now.

**Routing.** A policy layer decides among self-care guidance, asynchronous
consultation, and escalation to a veterinarian. The policy is inspectable and
versioned, because it is the part that carries clinical risk.

**Consultation.** Structured history-taking with a bounded number of
follow-up rounds, following the same pattern used in ZhiShen · WenNian's interview
stage.

**Care coordination.** Adapters for external providers — clinics, telehealth,
pharmacy, insurance — so an assessment can lead somewhere. Adapters are
isolated so a provider integration can fail without taking down the
assessment path.

**Follow-up.** The loop closes: outcomes feed back into the observation
history, which is what makes longitudinal signal useful rather than a log.

## Core Capabilities

**Multimodal observation intake.** Text, image, video and device signals
normalised into one comparable observation model.

**Risk assessment with stated uncertainty.** Scores against appropriate
baselines, always with the interval, never as a bare number.

**Explicit escalation policy.** Routing decisions recorded with the signals
and policy version that produced them.

**Provider adapters.** Isolated integrations for external care providers.

**Longitudinal history.** Observations accumulate into a timeline that later
assessments can draw on.

## Technical Decisions

**Normalise before assessing.** Assessment over raw multimodal input produces
confident output from incomparable signals. Normalisation is the unglamorous
stage that determines whether anything downstream works.

**Version the routing policy.** The escalation policy carries clinical risk,
so it is versioned, inspectable and changeable without a redeploy of the
assessment path.

**Isolate provider adapters.** External integrations fail in ways outside the
platform's control; isolating them keeps assessment available when a provider
is down.

**Bias escalation toward caution.** Given asymmetric costs, the routing policy
is tuned to escalate earlier than a pure accuracy objective would.

## Engineering

The architecture separates three concerns that are usually tangled: what was
observed (data), what it means (assessment), and what to do about it
(routing and coordination). Each has its own schema and can evolve
independently.

The assessment path is designed to work with no provider integrations
configured at all. Coordination is an addition, not a dependency.

## Validation

No results are reported; this is a design. The evaluation plan that accompanies
it:

- **Observation normalisation accuracy** — measure agreement between
  normalised observations and veterinarian-labelled reference cases.
- **Escalation policy review** — route decisions reviewed against clinician
  judgement on historical cases, with under-escalation weighted more heavily
  than over-escalation.
- **Adapter failure isolation** — verify assessment remains available with
  every provider adapter disabled.
- **Longitudinal signal value** — measure whether accumulated history improves
  assessment over single-visit input.

## Current Status

Product architecture and system design. Observation vocabulary, normalisation
stage, assessment structure, routing policy shape and adapter isolation
strategy are specified. No implementation is released and no public
repository exists, so no code link is shown.

## What I Learned

The routing policy turned out to be the actual product. Assessment accuracy
matters, but the decision about who handles a case is what determines whether
the platform is safe to use — and it is a policy question, not a model
question.

The second lesson carried over directly from the human-health side: structured
intake beats a better model. Owners describe what they see in their own
vocabulary, and normalising that into comparable observations is worth more
than improving the scorer.

## Next

- Prototype the observation vocabulary and normalisation stage against
  retrospectively collected owner reports.
- Draft the escalation policy as an explicit, reviewable artefact rather than
  a threshold in code.
- Build one provider adapter end to end to validate the isolation boundary.
