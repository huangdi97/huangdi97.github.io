---
title: 'HyCell'
slug: 'hycell'
year: 2026
status: 'Prototype'
category: '计算生物学 · AI 虚拟细胞 · 表示学习'
summary: '面向生物表示、状态转移建模与仿真的 AI 虚拟细胞基础设施。'
description: >-
  HyCell 研究如何用模型表示细胞状态，以及该状态在干预下预计会如何变化。当前是研究原型：公开的是工程原型与数据流程，不是经过验证的生物学结论。
publicLine: '面向细胞建模与生命科学研究的 AI 原型'
tags: ['虚拟细胞', '世界模型', 'JEPA', '单细胞', 'Python']
featured: true
order: 2
repo: 'https://github.com/huangdi97/HyCell-JEPA'
role: '系统设计、架构与工程实现'
visual: 'cell-transition'
statusNote: 'v0.1 工程 MVP。可运行原型，不是经过验证的生物学发现系统。'
stack: ['Python 3.10+', 'PyTorch', 'NumPy', 'Streamlit', 'pytest']
---

## 它是什么

HyCell 是一个面向细胞建模与生命科学研究的 AI 原型。它研究如何用模型表示细胞状态，以及该状态在干预下预计会如何变化。

当前产物 HyCell-JEPA 是 v0.1 工程 MVP：一个可在本地运行的细胞世界模型原型。它不是完整的虚拟细胞，不是转录组规模的生成模型，也没有经过湿实验验证。

## 为什么重要

把工程管道当作生物学发现来汇报，是这个方向最容易发生、也最难被发现的失败方式。

HyCell 按相反的顺序组织：先把数据契约、校验与边界写清楚，再谈模型。模型被刻意做小——让它可被审计的东西在它周围。

## 当前公开状态

v0.1 工程 MVP，研究原型。它可以运行，这只说明工程管道跑得通，不说明任何生物学结论已经成立。

没有湿实验验证，没有临床结论，也没有与基础模型的基准对比。

## 已公开内容

- 代码仓库 `HyCell-JEPA`（Python / PyTorch，本地可运行）。
- 真实数据接入的工程验证：GSE130973 子集（默认上限 5000 细胞 × 2000 基因）的「检视 → 预处理 → 校验 → 汇总」路径与独立报告。该子集的 `state_label` 与 `age_label` 在流程中被显式标注为 `unknown`。
- 验收脚本：`scripts/verify_release.sh` 与分目标校验脚本。

## 说明

公开数据用于验证管道，不用于验证生物学。本页不发布任何生物学或临床结论。
