---
title: 'BioPulse'
subtitle: '生命科学 Agent-native 工作台'
seoTitle: 'BioPulse — 生命科学 Agent-native 工作台'
slug: 'biopulse'
year: 2026
status: 'Active'
category: '智能体系统 · 生命科学 · 合规'
summary: '让智能体替人读数据、填表单、做交叉稽核的工作台。'
description: >-
  BioPulse 是一个面向生命科学研究的 AI 工作台：把文献、数据与流程收在一处，让智能体承担其中重复的阅读与核对。仓库公开，可自行部署与检视。
publicLine: '面向生命科学研究的 AI 工作台'
tags: ['多智能体', '合规', '推演器', '多端', 'Python']
featured: true
order: 4
repo: 'https://github.com/huangdi97/BioPulse'
role: '系统设计、架构与工程实现'
visual: 'compliance-triangle'
statusNote: '公开仓库，GitHub 检测到 MIT 许可证。README 描述的是能力，本页不发布任何基准或准确性数据。'
stack: ['Python 3.12', 'FastAPI', 'LangGraph', 'Flutter', 'Prometheus']
---

## 它是什么

BioPulse 是一个面向生命科学研究的 AI 工作台：把文献、数据与流程收在一处，让智能体承担其中重复的阅读与核对。

公开目录中包含一个云服务、一组各自独立的智能体包、一套分层安全护栏、带 RAG 接入的向量记忆，以及四个客户端。

## 为什么重要

一个能够行动的智能体——填表单、标异常、提方案——需要的约束比「回答这个问题」更硬。在受监管的场景里，可接受的失败模式是沉默，而不是自信地编造。

这也是项目把安全护栏放在智能体运行时旁边、而不是之后的原因。

## 当前公开状态

公开仓库，GitHub 检测到 MIT 许可证——这是本站唯一由机器确认许可证的项目。

本站未运行该仓库的测试套件，因此不宣称任何通过率。

## 已公开内容

- 代码仓库 `BioPulse`（Python / FastAPI / LangGraph，含 React 管理端、Web 端、Flutter 移动端与微信小程序）。
- 测试目录 `tests/`：覆盖智能体运行时、各个智能体、服务、前端与小程序，其中包含专门的护栏用例。
- 许可证：MIT。

## 说明

本页不发布任何准确性数字、客户名或营收数据——这些都无法从外部核实。README 描述的是能力，不是结果。
