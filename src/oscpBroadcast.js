function scheduleFor(kind) {
  if (kind === "daily") return { platform: "X", frequency: "daily", timeLocal: "11:50" };
  return { platform: "X", frequency: "weekly", timeLocal: "11:50" };
}

export function buildOSCPBroadcast(kind, forecastSummary, projectSummary) {
  const schedule = scheduleFor(kind);
  const topProjects = projectSummary.projects
    .slice()
    .sort((a, b) => (b.contributions?.length ?? 0) - (a.contributions?.length ?? 0))
    .slice(0, 3)
    .map((project) => project.title);

  const population = forecastSummary.metrics.populationByFaction;

  return {
    schemaVersion: "oscp.broadcast.v1",
    generatedAt: Date.now(),
    kind,
    schedule,
    message: [
      `${kind === "daily" ? "OSCP Daily Report" : "OSCP Weekly Report"} @ ${schedule.timeLocal}`,
      `Projects=${projectSummary.totals.projects}`,
      `ActiveContributors=${forecastSummary.metrics.activeContributors}`,
      `ProjectInflow=${forecastSummary.metrics.projectAccountInflow}`,
      `ProjectOutflow=${forecastSummary.metrics.projectDistributionOutflow}`,
      `FactionCounts=civilian:${population.civilian?.count ?? 0},middle:${population.middle?.count ?? 0},elite:${population.elite?.count ?? 0}`,
      `TopProjects=${topProjects.join(", ") || "n/a"}`,
    ].join(" | "),
  };
}
