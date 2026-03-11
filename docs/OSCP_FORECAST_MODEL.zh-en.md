# OSCP Forecast Model / OSCP 预测指标与模拟参数（中英）

Version: v0.1

## 中文

### 当前指标层

1. 阵营指标
- `populationByFaction`
- `initialElo`
- `currentBalanceElo`
- `contributionScore`
- `reputation`

2. 项目指标
- `projectCountByState`
- `projectAccountInflow`
- `projectDistributionOutflow`
- `rewardConcentrationTop10Share`

3. 生态指标
- `activeContributors`
- `reviewPassRate`
- `agentExecutionRate`
- `replacementCoverage`

### 当前参数层

已冻结：
- `factionDistribution = [0.80, 0.18, 0.02]`
- `initialElo = [5000, 500000, 50000000]`
- `agentPerHumanRange = participant_provided`
- `reporting = dashboard + weekly report`

待持续细化：
- `projectCreationRate`
- `serviceDemandRate`
- `reviewStrictness`
- `reusePreference`
- `contributionWeight`
- `usageWeight`
- `distributionInterval`
- `dropoutRate`

当前 API:
- `GET /oscp/forecast/summary`

## English

### Current metrics layer

- faction metrics
- project metrics
- ecosystem health metrics

### Current parameter layer

Frozen:
- `factionDistribution = [0.80, 0.18, 0.02]`
- `initialElo = [5000, 500000, 50000000]`
- `agentPerHumanRange = participant_provided`
- `reporting = dashboard + weekly report`
