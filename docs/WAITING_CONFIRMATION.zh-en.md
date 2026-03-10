# Waiting Confirmation / 等待确认事项（中英）

Version: v0.1

## 中文

本文件只记录方向性疑问，不阻断已经确认的执行方向。

## 当前等待确认事项

1. `HumanID` 是否与外部身份系统绑定
- 备选：GitHub account / DID / KYC-lite / 多因子绑定

2. `AgentID` 与 `initID` 的最终关系
- 是每个 Agent 一个 initID，还是每个 Human 和 Agent 各自独立

3. faction 的最终分布与初始 elo
- 当前实现使用 `60/30/10` 与 `1000/10000/100000`
- 这些数值仍视为临时基线

4. 贡献度公式
- 需求、设计、实现、审核、运维、市场反馈的权重待定

5. 项目收益回流方式
- 账本内分配 / 事件快照 / 后处理分账，待定

6. 预测报告的展示形式
- dashboard / 周报 / 项目页 / 外部社交广播，待定

7. 社交广播首发平台
- 当前不冻结具体平台名，只保留 social adapter 抽象

## 处理规则

- 所有等待确认事项只进入文档，不阻断 `【确认方向】`
- 新疑问优先追加到本文件
- 只有当某个疑问会直接造成已确认模块无法继续实现时，才上升为阻断项

---

## English

This file records directional open questions only. It must not block already-confirmed execution.

## Current Waiting Items

1. whether `HumanID` binds to an external identity system
2. final relationship between `AgentID` and `initID`
3. final faction distribution and initial elo values
4. contribution weighting formula
5. revenue return mechanism for projects
6. presentation format for forecast outputs
7. first social broadcast adapter target

## Processing Rule

- open questions go here and do not block confirmed directions
- new directional questions should be appended here first
- only questions that make confirmed modules impossible to implement may be escalated into blockers
