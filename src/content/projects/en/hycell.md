---
title: 'HyCell'
slug: 'hycell'
year: 2026
status: 'Prototype'
category: 'Computational Biology · AI Virtual Cell · Representation Learning'
summary: 'AI virtual-cell infrastructure for biological representation and simulation.'
description: >-
  HyCell studies how cell state can be represented by a model, and how that
  state is expected to move under an intervention. It is a research prototype:
  what is public is the engineering prototype and its data path, not a validated
  biological result.
publicLine: 'An AI prototype for cell modelling and life-science research'
tags: ['Virtual Cell', 'World Model', 'JEPA', 'Single-cell', 'Python']
featured: true
order: 2
repo: 'https://github.com/huangdi97/HyCell-JEPA'
role: 'System design, architecture and engineering'
visual: 'cell-transition'
statusNote: 'v0.1 engineering MVP. Runnable prototype, not a validated biological discovery system.'
stack: ['Python 3.10+', 'PyTorch', 'NumPy', 'Streamlit', 'pytest']
---

## What it is

HyCell is an AI prototype for cell modelling and life-science research. It studies how cell state can be represented by a model, and how that state is expected to move under an intervention.

The current artefact, HyCell-JEPA, is a v0.1 engineering MVP: a cell world-model prototype that runs locally. It is not a complete virtual cell, not a transcriptome-scale generative model, and not validated in a wet lab.

## Why it matters

The easiest failure mode in this direction is to report an engineering pipeline as a biological discovery.

HyCell is organised in the opposite order: data contracts, validation and stated limits first; the model second. The model is deliberately small, and what makes it auditable sits around it.

## Current public status

v0.1 engineering MVP, research prototype. It runs, and that says the pipeline works — not that any biology has been established.

There is no wet-lab validation, no clinical conclusion and no benchmark against a foundation model.

## What is publicly available

- The `HyCell-JEPA` repository — Python and PyTorch, runnable locally.
- A real-matrix engineering check: the inspect → prepare → validate → summarise path over a GSE130973 subset (capped at 5,000 cells × 2,000 genes by default), with its own report. The subset's `state_label` and `age_label` are explicitly marked `unknown` in the pipeline.
- Acceptance scripts: `scripts/verify_release.sh` and the per-goal check scripts.

## Notes

Public matrices validate the pipeline, not the biology. No biological or clinical conclusion is published here.
