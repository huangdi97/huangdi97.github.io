---
title: 'Morn'
subtitle: 'Work & Organization Control Plane'
seoTitle: 'Morn — 工作与组织控制平面'
slug: 'morn'
year: 2026
status: 'Active'
category: '智能体运行时 · 分布式系统 · Rust'
summary: '面向受治理的工作、持久化执行与安全演进的领域无关控制平面。'
description: >-
  Morn 是一个本地优先的桌面实验：让 AI 在用户自己的机器上协作、规划与执行工作。以公开仓库发布，可以自行构建与检视。
publicLine: '本地优先的 AI 桌面系统实验'
tags: ['Rust', '控制平面', '持久化运行时', '治理', '桌面端']
featured: true
order: 3
repo: 'https://github.com/huangdi97/morn'
role: '系统设计、架构与工程实现'
visual: 'agent-dag'
statusNote: '公开 Rust workspace。README 报告 v1.0.0-rc.1 且本地 GA 完成；本站引用该状态，不重新运行测试套件。'
stack: ['Rust', 'axum', 'React / Vite', 'Tauri v2', 'SQLite']
---

## 它是什么

Morn 是一个本地优先的 AI 桌面系统实验：让 AI 在用户自己的机器上协作、规划与执行工作。

它是一个 Rust workspace，配有一套 axum 后端、一套 React / Vite 前端、一个 Tauri v2 桌面外壳与开发者命令行工具。

## 为什么重要

一旦软件能够自行采取行动，真正有意思的问题就不再是它能做什么，而是哪些效应可逆、谁批准了它，以及某个节点中途挂掉之后什么仍然成立。

Morn 把这些问题放进写入路径本身，而不是事后补一个日志查看器。

## 当前公开状态

公开 Rust workspace。仓库 README 报告 v1.0.0-rc.1，且本地 GA 完成。

本站引用该状态，不重新运行测试套件，因此不宣称任何通过率。

## 已公开内容

- 代码仓库 `morn`（Rust / Tauri v2 / React）。
- 全量验收入口 `scripts/run_all.ps1`：覆盖格式化、静态检查、Rust 测试、前端检查、桌面端构建与 UI / E2E 冒烟。
- README 中写明两个外部阻塞项：真实的 Harness 冒烟需要真实凭据，真实的数据试点需要合法数据集。两者都被标注为阻塞，而不是通过。

## 说明

本页的行为层面主张来自公开仓库，数字均引用 README，而非本站亲自运行所得。
