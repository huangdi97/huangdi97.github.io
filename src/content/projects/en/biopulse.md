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
  BioPulse is a workbench for life-science research: literature, data and
  process in one place, with agents taking on the repetitive reading and
  cross-checking. The repository is public and can be deployed and inspected.
publicLine: 'An AI workbench for life-science research'
tags: ['Multi-Agent', 'Compliance', 'Inference Engine', 'Multi-surface', 'Python']
featured: true
order: 4
repo: 'https://github.com/huangdi97/BioPulse'
role: 'System design, architecture and engineering'
visual: 'compliance-triangle'
statusNote: 'Public repository with MIT license detected by GitHub. README claims describe capability; no benchmark or accuracy figure is published.'
stack: ['Python 3.12', 'FastAPI', 'LangGraph', 'Flutter', 'Prometheus']
---

## What it is

BioPulse is an AI workbench for life-science research: literature, data and process in one place, with agents taking on the repetitive reading and cross-checking.

The public tree holds a cloud service, a set of independent agent packages, layered safety guardrails, vector memory with RAG, and four clients.

## Why it matters

An agent that can act — fill a form, flag an anomaly, propose a plan — needs firmer constraints than one that answers a question. In a regulated setting the acceptable failure mode is silence, not confident invention.

That is why the guardrails sit beside the agent runtime rather than after it.

## Current public status

Public repository, with an MIT licence detected by GitHub — the only licence on this site confirmed by a machine.

This site has not run the repository's test suite and claims no pass rate.

## What is publicly available

- The `BioPulse` repository — Python, FastAPI and LangGraph, plus a React admin client, a web client, a Flutter mobile app and a WeChat mini program.
- The `tests/` directory, covering the agent runtime, the individual agents, services, frontend and mini program, including dedicated guardrail cases.
- The licence: MIT.

## Notes

No accuracy figures, customer names or revenue data are published here — none of them can be verified from outside. The README describes capabilities, not results.
