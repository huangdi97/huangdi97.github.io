---
title: 'ZhiShen · WenNian'
subtitle: '知身·问年'
seoTitle: 'ZhiShen · WenNian — AI Aging Assessment & Decision Support'
slug: 'wennian'
year: 2026
status: 'Active'
category: 'AI Health · Aging Intelligence · Decision Support'
summary: 'AI aging assessment and intervention decision system.'
description: >-
  ZhiShen · WenNian turns scattered health information into a readable
  assessment of a person’s ageing state, and says which aspects are worth
  attention now. It is released as an open-source MVP that runs locally.
publicLine: 'An AI product exploration for individual health and ageing research'
tags: ['Aging Clock', 'Multi-Agent', 'Intervention Priority', 'Decision Support', 'Python']
featured: true
order: 1
repo: 'https://github.com/huangdi97/WenNian'
role: 'System design, architecture and engineering'
visual: 'aging-state'
statusNote: 'Open-source MVP. Assessment output only — not a diagnostic device. License unresolved: the README states GPLv3, GitHub detects no LICENSE file.'
stack: ['Python 3.10+', 'FastAPI', 'Gradio', 'pytest', 'YAML config']
---

## What it is

ZhiShen · WenNian is an AI product exploration for individual health and ageing research. It turns scattered health information into a readable assessment of a person's ageing state, and points at the aspects most worth attention now.

It does not diagnose and does not give medical advice. What it produces is an assessment and its explanation, each carrying the limits that apply to it.

## Why it matters

Most ageing conversations stop at one of two extremes: a single number that is hard to act on, or a fluent reading with nothing behind it.

The useful question is not "how old am I" but "what is worth changing first". The project is organised around that question: a readable state first, then what deserves attention.

## Current public status

Open-source MVP, in active development. It runs locally and can be started and inspected by anyone.

Explicitly out of scope: it is not a diagnostic device, it gives no medical advice and it prescribes nothing. The report itself states that it describes health trends only.

## What is publicly available

- The `WenNian` repository — Python, FastAPI and Gradio, served on `127.0.0.1`.
- The assessment path and its report output, with the disclaimer carried by the artefact itself.
- Licence status: the README states GPLv3, but GitHub detects no LICENSE file in the repository. Until that is resolved the licence should be read as unconfirmed rather than settled.

## Notes

No clinical or accuracy figures are published here. Product development may be ahead of the latest publicly inspectable repository snapshot.
