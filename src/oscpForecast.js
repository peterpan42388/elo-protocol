function round(value) {
  return Math.round(Number(value) * 1_000_000) / 1_000_000;
}

export function buildOSCPForecastSummary(identity, projectCommons, engine) {
  const profiles = identity.listInitProfiles();
  const byFaction = {};
  const humansToAgents = new Map();

  for (const humanId of identity.humans.keys()) {
    humansToAgents.set(humanId, []);
  }
  for (const agent of identity.agents.values()) {
    if (!humansToAgents.has(agent.humanId)) humansToAgents.set(agent.humanId, []);
    humansToAgents.get(agent.humanId).push(agent.agentId);
  }

  for (const profile of profiles) {
    if (!byFaction[profile.faction]) {
      byFaction[profile.faction] = {
        count: 0,
        initialElo: 0,
        currentBalanceElo: 0,
        contributionScore: 0,
        reputation: 0,
      };
    }
    const bucket = byFaction[profile.faction];
    bucket.count += 1;
    bucket.initialElo += profile.initialElo;
    bucket.contributionScore += profile.metrics.contributionScore;
    bucket.reputation += profile.metrics.reputation;
    if (profile.subjectType === "agent") {
      bucket.currentBalanceElo += engine.balanceOf(profile.subjectId);
    }
  }

  const agentCounts = [...humansToAgents.values()].map((agents) => agents.length);
  const projectSummary = projectCommons.buildSummary();
  const accounts = [...projectCommons.projectAccounts.values()];
  const totalCredited = round(accounts.reduce((sum, account) => sum + account.totalCreditedElo, 0));
  const totalDistributed = round(accounts.reduce((sum, account) => sum + account.totalDistributedElo, 0));
  const balances = accounts.map((account) => account.balanceElo).sort((a, b) => b - a);
  const topN = Math.max(1, Math.ceil(balances.length * 0.1));
  const totalBalance = balances.reduce((sum, value) => sum + value, 0);

  return {
    schemaVersion: "oscp.forecast.summary.v1",
    generatedAt: Date.now(),
    assumptions: {
      factionDistribution: { civilian: 0.8, middle: 0.18, elite: 0.02 },
      initialElo: { civilian: 5_000, middle: 500_000, elite: 50_000_000 },
      agentPerHumanRange: {
        source: "participant_provided",
        min: agentCounts.length ? Math.min(...agentCounts) : 0,
        max: agentCounts.length ? Math.max(...agentCounts) : 0,
      },
      reporting: {
        dashboard: true,
        weeklyReport: true,
      },
    },
    metrics: {
      populationByFaction: byFaction,
      activeContributors: profiles.filter((profile) => profile.metrics.contributionScore > 0).length,
      contributionVolume: round(profiles.reduce((sum, profile) => sum + profile.metrics.contributionScore, 0)),
      projectCountByState: projectSummary.byState,
      projectAccountInflow: totalCredited,
      projectDistributionOutflow: totalDistributed,
      rewardConcentrationTop10Share: totalBalance > 0
        ? round(balances.slice(0, topN).reduce((sum, value) => sum + value, 0) / totalBalance)
        : 0,
      dependencyReductionRate: 0,
      replacementCoverage: projectSummary.totals.projects,
      reviewPassRate: projectSummary.totals.reviews > 0
        ? round(projectCommons.reviews.filter((review) => review.decision === "Pass").length / projectSummary.totals.reviews)
        : 0,
      agentExecutionRate: projectSummary.totals.projects > 0
        ? round(projectSummary.projects.filter((project) => project.executionOwner === "user_owned_agent").length / projectSummary.totals.projects)
        : 0,
    },
  };
}
