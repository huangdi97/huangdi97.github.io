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
  Morn is a local-first desktop experiment in letting AI collaborate, plan and
  execute work on the user’s own machine. It ships as a public repository you
  can build and inspect yourself.
publicLine: 'A local-first AI desktop system experiment'
tags: ['Rust', 'Control Plane', 'Durable Runtime', 'Governance', 'Desktop']
featured: true
order: 3
repo: 'https://github.com/huangdi97/morn'
role: 'System design, architecture and engineering'
visual: 'agent-dag'
statusNote: 'Public Rust workspace. The README reports v1.0.0-rc.1 with local GA complete; this site quotes that status and does not re-run the suite.'
stack: ['Rust', 'axum', 'React / Vite', 'Tauri v2', 'SQLite']
---

## What it is

Morn is a local-first AI desktop system experiment: it lets AI collaborate, plan and execute work on the user's own machine.

It is a Rust workspace with an axum backend, a React / Vite frontend, a Tauri v2 desktop shell and a developer command-line tool.

## Why it matters

Once software can act on its own, the interesting questions stop being about what it can do and start being about which effects are reversible, who approved them, and what still holds after a node dies mid-run.

Morn puts those questions inside the write path rather than in a log viewer added afterwards.

## Current public status

Public Rust workspace. The repository README reports v1.0.0-rc.1 with local GA complete.

This site cites that state and does not re-run the test suite, so it claims no pass rate.

## What is publicly available

- The `morn` repository — Rust, Tauri v2 and React.
- The full acceptance entry point, `scripts/run_all.ps1`: formatting, linting, Rust tests, frontend checks, desktop build and UI / E2E smoke.
- Two external blockers stated in the README: a real harness smoke run needs real credentials, and a real data pilot needs a lawful dataset. Both are recorded as blocked rather than passed.

## Notes

The behavioural claims on this page come from the public repository, and every figure is quoted from the README rather than produced here.
