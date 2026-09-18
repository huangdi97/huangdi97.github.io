---
title: 'PDIG'
slug: 'pdig'
year: 2026
status: 'Research'
category: 'Local-first · Personal Infrastructure · Native Apps'
summary: 'A local-first personal dependency and digital-infrastructure graph across native platforms.'
description: >-
  A specification and design for a personal digital-infrastructure graph: one
  canonical dependency model, implemented natively on Android, iOS and
  HarmonyOS, with conformance tests, a local repository layer and
  cryptography for identity — all without a hosted account system.
tags: ['Local-first', 'Canonical Spec', 'Cross-platform', 'Cryptography', 'Native UI']
featured: true
order: 5
role: 'Specification and system design'
groups: ['infrastructure', 'experiments']
visual: 'infra'
statusNote: 'Specification and design. Not a contact manager — a dependency graph over personal infrastructure.'
stack: ['Canonical spec', 'Android', 'iOS', 'HarmonyOS', 'Conformance tests']
---

## Overview

PDIG (Personal Digital Infrastructure Graph) is a specification and design for
modelling a person's digital infrastructure as a dependency graph: services,
devices, accounts, credentials, data stores and the relationships between
them.

Two things it is not. It is not a contact manager — the nodes are
infrastructure, not people. And it is not related to the Broad Institute
DepMap project; the name is unrelated and the domains have nothing in common.

The design constraint that shapes everything: the graph lives on the user's
device. There is no hosted account system, no server that must be reachable,
and no assumption that sync exists.

## Problem

Personal digital infrastructure has quietly become too complex to hold in
one's head, and there is no tool for it.

A single person now operates dozens of services, devices and accounts with
real dependency relationships between them: this domain resolves through that
provider; this backup depends on that credential; this device is the only
recovery path for that account. Those dependencies are discovered during an
outage, which is the worst possible time to discover them.

Existing tools cover slices of this — password managers, inventory apps,
monitoring dashboards — but each models its own slice with its own schema, and
none of them treats the dependency structure as the object of interest.

## Why It Matters

Dependency graphs answer questions that inventories cannot. Not "what accounts
do I have" but "if this provider goes away, what breaks, and in what order".
That is a graph question, and it is only answerable if the relationships are
modelled as first-class data.

The local-first constraint matters because of what the artifact is. A complete
map of someone's infrastructure is a high-value target. A hosted service
holding it would need to be trusted more than most people should be willing to
trust; keeping it on-device removes that trust requirement rather than
managing it.

## Product / Research Thesis

1. **One canonical spec, many native implementations.** The model is
   specified once; each platform implements it natively and proves conformance
   with a shared test suite.
2. **Local-first is a correctness property, not a feature.** The graph must be
   fully functional with no network and no server.
3. **Cryptography replaces the account system.** Identity and integrity are
   provided by keys the user holds, so there is no central registry of who
   owns what.
4. **Native UI where the platform expects native.** Platform conventions for
   storage, permissions and background execution differ enough that a shared
   web shell would fight all three.

## System Design

```text
canonical spec (schema + semantics + invariants)
        │
        ├── conformance test suite (shared)
        │
        ├── Android implementation ─ native UI
        ├── iOS implementation ───── native UI
        └── HarmonyOS implementation  native UI
                    │
              repository layer (local persistence, sync-optional)
                    │
              cryptography layer (identity, integrity)
```

The spec is the contract. The conformance suite is what makes "implemented on
three platforms" a claim that can be checked rather than asserted.

## Architecture

**Canonical spec.** Node and edge types, invariants, and the semantics of each
relationship — including what it means for one node to depend on another, and
how transitive failure is computed.

**Conformance suite.** A platform-independent test suite run by every
implementation. This is the mechanism that keeps three native codebases from
diverging into three different products.

**Repository layer.** Local persistence with a sync-optional design: the
repository must work fully with no sync configured, and treat sync as an
addition that cannot corrupt local state.

**Cryptography layer.** Key-based identity and integrity verification,
replacing a hosted account system. Keys are the user's; there is no central
registry.

**Native UI.** Platform-native interfaces on Android, iOS and HarmonyOS.
Storage, permission and background-execution models differ substantially, and
the design accepts three UIs rather than one compromised one.

## Core Capabilities

**Dependency modelling.** Typed relationships between infrastructure nodes,
with transitive failure propagation.

**Conformance testing.** One shared suite, run per platform, so cross-platform
claims are verifiable.

**Local-first persistence.** Everything works offline; sync is optional and
non-destructive.

**Cryptographic identity.** Identity and integrity without a hosted account
system.

**Impact analysis.** Given a node, compute what depends on it and in what
order it fails — the question the whole graph exists to answer.

## Technical Decisions

**Spec first, implementations second.** Writing the canonical model before
any platform code is what makes conformance testing possible at all.

**A shared conformance suite as the anti-divergence mechanism.** Three native
implementations will drift unless something forces them not to. The suite is
that something.

**No hosted account system.** Adding one would reintroduce exactly the trust
requirement the project exists to avoid.

**Native UI on each platform.** A cross-platform web shell would mean
fighting each platform's storage and permission model. The cost is three UIs;
the benefit is that none of them is broken.

**Sync-optional, never sync-required.** If sync can corrupt local state, the
local-first guarantee is void.

## Engineering

The specification is the primary artifact: schema, invariants and semantics,
written so an implementation can be checked against it. Implementations are
expected to be independently replaceable without touching the spec.

The repository layer is designed so that persistence is testable in isolation
from UI, and the cryptography layer sits below it so integrity guarantees do
not depend on the storage engine.

## Validation

No results are reported; this is a specification and design. The intended
validation approach:

- **Conformance parity** — all implementations pass the shared suite;
  divergence is a build failure, not a known issue.
- **Offline completeness** — every user-facing operation works with the
  network disabled and no sync configured.
- **Sync non-destructiveness** — a failed or interrupted sync leaves local
  state byte-identical.
- **Impact correctness** — computed transitive failure sets verified against
  hand-constructed graphs.

## Current Status

Specification and design. The canonical model, the conformance-suite
approach, the repository and cryptography layering, and the native-per-platform
UI decision are specified. No implementation is released and no public
repository exists, so no code link is shown.

## What I Learned

Defining the conformance suite before any implementation changed what the spec
had to contain. Vague invariants cannot be tested, so writing the suite forced
the spec to be precise — and a spec precise enough to test is precise enough
to implement three times.

The second lesson is that local-first is a design constraint that propagates.
Once sync cannot be required, the repository layer, the identity model and the
conflict semantics all have to be designed differently — which is why the
constraint belongs at the top rather than in a settings screen.

## Next

- Publish the canonical spec as a standalone document.
- Write the conformance suite against the spec before any platform code.
- Implement the repository layer once, on one platform, and validate offline
  completeness before adding a second platform.
