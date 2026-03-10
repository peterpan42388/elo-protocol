# OSCP Skill Stack / OSCP Skill 栈（中英）

Version: v0.1

## 中文

OSCP 的关键不是平台替所有人开发，而是建立一套低门槛参与基础设施，让需求由用户自己的 Agent 执行。

因此，Skill 是 OSCP 的基础生产力层。

## 核心 Skill 列表

### 1. Idea Intake Skill

作用：
- 接收人类自然语言想法
- 转换为项目提案、任务拆分、需求说明

输入：
- 人类描述的需求

输出：
- 项目 proposal
- task list
- 初始执行建议

### 2. Project Builder Skill

作用：
- 读取项目规则、目标与当前代码上下文
- 驱动用户自己的 Agent 生成实现方案与分支变更

输入：
- 项目目标
- 规则约束
- 代码上下文

输出：
- 实现计划
- 代码提案
- 分支提交

### 3. Review Guard Skill

作用：
- 按 `Rule.md`、`Review.md`、`Legality.md` 检查提交
- 输出拒绝原因或修正建议

输入：
- PR / commit / proposal

输出：
- pass / reject
- rule violations
- suggested fixes

### 4. Contributor Reporter Skill

作用：
- 生成贡献报告
- 更新贡献度、声望、信誉快照

输出：
- contribution record
- contributor score snapshot

### 5. Market Publisher Skill

作用：
- 将 API / Skill / Workflow / Open Service 发布到市场
- 自动生成 listing 元数据

输出：
- listing
- quote model
- usage metadata

### 6. Social Broadcast Skill

作用：
- 将项目进展、模拟结果、贡献变化同步到外部社交出口
- 形成公开可见的共创氛围

输出：
- report post
- weekly summary
- milestone broadcast

## Skill 设计原则

1. 低门槛
- 人类应主要提出需求，而不是必须亲自编程。

2. 自带规则意识
- 每个 skill 都要遵守项目规则，而不是绕过规则。

3. 可组合
- Skill 应该是可拼装、可替换、可复用的。

4. 降低平台成本
- 平台不代替用户开发，skill 负责把开发权交还给用户自己的 Agent。

---

## English

The key design of OSCP is not for the platform to develop everything itself. It must create a low-barrier participation infrastructure where implementation is delegated to each user's own agent.

Skills are therefore the foundational productivity layer of OSCP.

## Core Skill Set

### 1. Idea Intake Skill

Purpose:
- convert natural-language human ideas into proposals, task splits, and structured requirements

### 2. Project Builder Skill

Purpose:
- read project rules, target, and code context
- drive the user's own agent to generate an implementation branch

### 3. Review Guard Skill

Purpose:
- enforce `Rule.md`, `Review.md`, and `Legality.md`
- return pass/reject decisions and fix suggestions

### 4. Contributor Reporter Skill

Purpose:
- generate contribution reports
- update contribution, reputation, and credit snapshots

### 5. Market Publisher Skill

Purpose:
- publish API / Skill / Workflow / Open Service outputs into the market
- generate listing metadata automatically

### 6. Social Broadcast Skill

Purpose:
- sync project progress, simulation outputs, and contributor changes to external social channels
- maintain a visible culture of open co-creation

## Skill Design Principles

1. Low barrier
- humans should mainly contribute requirements, not be required to code manually

2. Rule-aware
- every skill must operate within project rules, not bypass them

3. Composable
- skills should be reusable, replaceable, and combinable

4. Cost-minimizing
- the platform does not absorb the development burden; skills return execution power to the user's own agent
