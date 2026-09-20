---
title: 'PDIG'
slug: 'pdig'
year: 2026
status: 'Research'
category: 'Local-first · Personal Infrastructure · Native Apps'
summary: 'A local-first personal dependency and digital-infrastructure graph across native platforms.'
description: >-
  PDIG is a specification and design: it models the dependencies between a
  person’s accounts, devices, credentials and services as one computable graph.
  What is public today is the specification itself — no implementation has been
  released.
publicLine: 'A local-first specification for personal digital infrastructure'
tags: ['Local-first', 'Canonical Spec', 'Cross-platform', 'Cryptography', 'Native UI']
# v1.6: no longer on the homepage. Selected Work carries four projects; PDIG
# keeps its full case study here on /projects.
featured: false
order: 5
role: 'Specification and system design'
visual: 'dependency-graph'
statusNote: 'Specification and design. Not a contact manager — a dependency graph over personal infrastructure.'
stack: ['Canonical spec', 'Android', 'iOS', 'HarmonyOS', 'Conformance tests']
---

## What it is

PDIG (Personal Digital Infrastructure Graph) is a specification and design: it models the dependencies between a person's accounts, devices, credentials and services as one computable graph.

It is not a contact manager — the nodes are infrastructure, not people. It is also unrelated to the Broad Institute's DepMap project; the shared name implies no connection.

## Why it matters

A dependency graph answers a question an inventory cannot: not "which accounts do I have" but "if this provider disappears, what breaks, and in what order".

A complete map of a person's infrastructure is a high-value target, so the design constraint is that the graph stays on the user's own devices — no hosted account system, and no server assumed to be reachable.

## Current public status

Specification and design. The canonical model, the conformance-suite plan, the repository and cryptographic layers, and the per-platform native UI decisions are defined.

No implementation has been released and there is no public repository.

## What is publicly available

Nothing to open today. This page is the specification's only public account.

## Notes

The specification is the artefact. Anything describing an implementation is design intent, not completed work.
