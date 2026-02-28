# Open Source Management Plan (ZH/EN) / 开源管理计划（中英）

## 中文

### 目标
在不牺牲协议透明度的前提下，控制交易规则被套利、滥用和攻击的风险。

### 管理策略
1. 开放核心协议，不开放生产风控参数。
2. 通过 CI 强制执行安全和策略检查。
3. 对 `main` 采用受保护分支策略（评审 + 必过检查）。
4. 安全漏洞走私密通道（GitHub Security Advisory）。
5. 所有破坏性规则变更必须包含迁移说明与回归测试。

### 版本策略
1. 协议变更：语义化版本。
2. 风险策略接口变更：必须向后兼容一个次版本周期。
3. 破坏性变更：提前公告窗口。

## English

### Goal
Keep protocol transparency while reducing rule-arbitrage, abuse, and attack surface.

### Management Strategy
1. Open the core protocol, keep production risk parameters private.
2. Enforce security and policy checks via CI.
3. Protect `main` with required reviews and required checks.
4. Route vulnerabilities through private channels (GitHub Security Advisory).
5. Any breaking rule change must include migration notes and regression tests.

### Versioning
1. Protocol changes: semantic versioning.
2. Risk interface changes: backward compatibility for at least one minor cycle.
3. Breaking changes: announced deprecation window.

## Current Repository Controls / 当前仓库控制

### 中文
- `main` 强制检查：`test`, `gitleaks`
- 禁止强推与删除分支
- 强制线性历史
- 强制对话解决

### English
- required checks on `main`: `test`, `gitleaks`
- force-push and branch deletion disabled
- linear history enforced
- conversation resolution enforced
