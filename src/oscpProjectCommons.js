import { assertBoundedText, assertToken } from "./inputGuards.js";

const PROJECT_STATES = new Set(["P1", "P2", "P3", "Completed", "StableIterating"]);
const PROPOSAL_STATES = new Set(["open", "accepted", "revise", "rejected"]);
const REVIEW_DECISIONS = new Set(["Pass", "Revise", "Reject"]);

export class OSCPProjectCommons {
  constructor() {
    this.projects = new Map();
    this.tasks = new Map();
    this.proposals = new Map();
    this.reviews = [];
    this.projectAccounts = new Map();
    this.contributions = new Map();
  }

  createProject(params) {
    const safeProjectId = assertToken("projectId", params.projectId, 128);
    if (this.projects.has(safeProjectId)) {
      throw new Error(`duplicate projectId: ${safeProjectId}`);
    }
    const state = this.#assertState(params.state ?? "P1");
    const project = {
      projectId: safeProjectId,
      title: assertBoundedText("title", String(params.title ?? safeProjectId), 160) || safeProjectId,
      summary: assertBoundedText("summary", String(params.summary ?? ""), 1000),
      replacementTarget: assertBoundedText("replacementTarget", String(params.replacementTarget ?? ""), 256),
      proposerHumanId: assertToken("proposerHumanId", params.proposerHumanId, 128),
      executionOwner: this.#assertExecutionOwner(params.executionOwner ?? "user_owned_agent"),
      pricing: {
        pricePerUseElo: this.#normalizeNonNegative(params.pricePerUseElo ?? 0),
      },
      publicSkills: {
        reviewSkillId: assertToken("reviewSkillId", String(params.reviewSkillId ?? "elo-review-skill"), 128),
        scoreSkillId: assertToken("scoreSkillId", String(params.scoreSkillId ?? "elo-score-skill"), 128),
      },
      state,
      tags: Array.isArray(params.tags) ? params.tags.map((tag) => assertToken("tag", String(tag), 64)) : [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.projects.set(safeProjectId, project);
    this.projectAccounts.set(safeProjectId, {
      projectId: safeProjectId,
      accountId: `acct:${safeProjectId}`,
      balanceElo: 0,
      totalCreditedElo: 0,
      totalDistributedElo: 0,
    });
    this.contributions.set(safeProjectId, []);
    return this.getProject(safeProjectId);
  }

  createTask(params) {
    const safeTaskId = assertToken("taskId", params.taskId, 128);
    if (this.tasks.has(safeTaskId)) {
      throw new Error(`duplicate taskId: ${safeTaskId}`);
    }
    const safeProjectId = assertToken("projectId", params.projectId, 128);
    this.#getProjectRef(safeProjectId);
    const task = {
      taskId: safeTaskId,
      projectId: safeProjectId,
      title: assertBoundedText("title", String(params.title ?? safeTaskId), 160) || safeTaskId,
      description: assertBoundedText("description", String(params.description ?? ""), 1000),
      status: this.#assertTaskStatus(params.status ?? "open"),
      suggestedExecutionOwner: this.#assertExecutionOwner(params.suggestedExecutionOwner ?? "user_owned_agent"),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.tasks.set(safeTaskId, task);
    return { ...task };
  }

  submitProposal(params) {
    const safeProposalId = assertToken("proposalId", params.proposalId, 128);
    if (this.proposals.has(safeProposalId)) {
      throw new Error(`duplicate proposalId: ${safeProposalId}`);
    }
    const safeProjectId = assertToken("projectId", params.projectId, 128);
    this.#getProjectRef(safeProjectId);
    const proposal = {
      proposalId: safeProposalId,
      projectId: safeProjectId,
      branchName: assertToken("branchName", params.branchName, 128),
      submittedByAgentId: params.submittedByAgentId ? assertToken("submittedByAgentId", params.submittedByAgentId, 128) : "",
      submittedByHumanId: params.submittedByHumanId ? assertToken("submittedByHumanId", params.submittedByHumanId, 128) : "",
      summary: assertBoundedText("summary", String(params.summary ?? ""), 1000),
      commitReportPath: assertBoundedText("commitReportPath", String(params.commitReportPath ?? ""), 256),
      state: "open",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.proposals.set(safeProposalId, proposal);
    return this.getProposal(safeProposalId);
  }

  recordReview(params) {
    const safeReviewId = assertToken("reviewId", params.reviewId, 128);
    const safeProposalId = assertToken("proposalId", params.proposalId, 128);
    const proposal = this.#getProposalRef(safeProposalId);
    const decision = this.#assertDecision(params.decision);
    const review = {
      reviewId: safeReviewId,
      proposalId: safeProposalId,
      reviewerId: assertToken("reviewerId", params.reviewerId, 128),
      decision,
      notes: assertBoundedText("notes", String(params.notes ?? ""), 1000),
      createdAt: Date.now(),
    };
    this.reviews.push(review);
    proposal.state = decision === "Pass" ? "accepted" : decision === "Revise" ? "revise" : "rejected";
    proposal.updatedAt = review.createdAt;
    return { ...review, proposalState: proposal.state };
  }

  recordContribution(params) {
    const safeProjectId = assertToken("projectId", params.projectId, 128);
    this.#getProjectRef(safeProjectId);
    const list = this.contributions.get(safeProjectId);
    const contribution = {
      contributionId: assertToken("contributionId", params.contributionId, 128),
      projectId: safeProjectId,
      contributorInitId: assertToken("contributorInitId", params.contributorInitId, 160),
      contributorAgentId: params.contributorAgentId ? assertToken("contributorAgentId", params.contributorAgentId, 128) : "",
      kind: this.#assertContributionKind(params.kind ?? "implementation"),
      demandRating: this.#normalizeRating(params.demandRating ?? 0),
      usageCount: this.#normalizeNonNegative(params.usageCount ?? 0),
      accepted: Boolean(params.accepted ?? true),
      notes: assertBoundedText("notes", String(params.notes ?? ""), 1000),
      score: 0,
      createdAt: Date.now(),
    };
    contribution.score = this.#computeContributionScore(contribution);
    if (list.some((item) => item.contributionId === contribution.contributionId)) {
      throw new Error(`duplicate contributionId: ${contribution.contributionId}`);
    }
    list.push(contribution);
    return { ...contribution };
  }

  creditProjectAccount(projectId, amount, source = "usage") {
    const account = this.#getProjectAccountRef(projectId);
    const safeAmount = this.#normalizePositive(amount);
    account.balanceElo = this.#round(account.balanceElo + safeAmount);
    account.totalCreditedElo = this.#round(account.totalCreditedElo + safeAmount);
    return { ...account, source: assertBoundedText("source", String(source), 128) || "usage" };
  }

  distributeProjectRevenue(projectId) {
    const safeProjectId = assertToken("projectId", projectId, 128);
    const account = this.#getProjectAccountRef(safeProjectId);
    const accepted = (this.contributions.get(safeProjectId) ?? []).filter((item) => item.accepted && item.score > 0);
    if (account.balanceElo <= 0) {
      return { projectId: safeProjectId, distributableElo: 0, allocations: [] };
    }
    if (accepted.length === 0) {
      return { projectId: safeProjectId, distributableElo: account.balanceElo, allocations: [] };
    }

    const totalScore = accepted.reduce((sum, item) => sum + item.score, 0);
    let remaining = account.balanceElo;
    const allocations = accepted.map((item, index) => {
      const ratio = this.#round(item.score / totalScore);
      const amountElo = index === accepted.length - 1 ? remaining : this.#round(account.balanceElo * ratio);
      remaining = this.#round(remaining - amountElo);
      return {
        contributionId: item.contributionId,
        contributorInitId: item.contributorInitId,
        ratio,
        amountElo,
      };
    });

    account.totalDistributedElo = this.#round(account.totalDistributedElo + account.balanceElo);
    account.balanceElo = 0;

    return {
      projectId: safeProjectId,
      distributableElo: this.#round(allocations.reduce((sum, item) => sum + item.amountElo, 0)),
      allocations,
    };
  }

  transitionProjectState(projectId, nextState) {
    const project = this.#getProjectRef(projectId);
    project.state = this.#assertState(nextState);
    project.updatedAt = Date.now();
    return this.getProject(projectId);
  }

  getProject(projectId) {
    const safeProjectId = assertToken("projectId", projectId, 128);
    return {
      ...this.#getProjectRef(safeProjectId),
      account: { ...this.#getProjectAccountRef(safeProjectId) },
      contributions: (this.contributions.get(safeProjectId) ?? []).map((item) => ({ ...item })),
    };
  }

  getProposal(proposalId) {
    return { ...this.#getProposalRef(proposalId) };
  }

  listProjects() {
    return [...this.projects.values()].map((project) => ({ ...project })).sort((a, b) => a.createdAt - b.createdAt);
  }

  buildSummary() {
    const projects = this.listProjects();
    const byState = Object.fromEntries([...PROJECT_STATES].map((state) => [state, 0]));
    for (const project of projects) byState[project.state] += 1;

    return {
      schemaVersion: "oscp.project.summary.v1",
      totals: {
        projects: projects.length,
        tasks: this.tasks.size,
        proposals: this.proposals.size,
        reviews: this.reviews.length,
        projectAccountBalanceElo: this.#round(
          [...this.projectAccounts.values()].reduce((sum, account) => sum + account.balanceElo, 0)
        ),
      },
      byState,
      projects,
    };
  }

  #getProjectRef(projectId) {
    const safeProjectId = assertToken("projectId", projectId, 128);
    const project = this.projects.get(safeProjectId);
    if (!project) throw new Error(`unknown projectId: ${safeProjectId}`);
    return project;
  }

  #getProposalRef(proposalId) {
    const safeProposalId = assertToken("proposalId", proposalId, 128);
    const proposal = this.proposals.get(safeProposalId);
    if (!proposal) throw new Error(`unknown proposalId: ${safeProposalId}`);
    return proposal;
  }

  #assertState(state) {
    const safeState = assertToken("state", String(state), 32);
    if (!PROJECT_STATES.has(safeState)) {
      throw new Error(`state must be one of ${[...PROJECT_STATES].join("/")}`);
    }
    return safeState;
  }

  #assertTaskStatus(status) {
    const safeStatus = assertToken("status", String(status), 32);
    if (!["open", "in_progress", "done"].includes(safeStatus)) {
      throw new Error("status must be open/in_progress/done");
    }
    return safeStatus;
  }

  #assertExecutionOwner(value) {
    const safeValue = assertToken("executionOwner", String(value), 64);
    if (!["user_owned_agent", "shared_maintainers", "mixed", "governance_review"].includes(safeValue)) {
      throw new Error("executionOwner must be user_owned_agent/shared_maintainers/mixed/governance_review");
    }
    return safeValue;
  }

  #assertDecision(value) {
    const safeValue = assertToken("decision", String(value), 32);
    if (!REVIEW_DECISIONS.has(safeValue)) {
      throw new Error(`decision must be one of ${[...REVIEW_DECISIONS].join("/")}`);
    }
    return safeValue;
  }

  #assertContributionKind(value) {
    const safeValue = assertToken("kind", String(value), 64);
    if (!["requirement", "design", "implementation", "review", "ops", "market_feedback"].includes(safeValue)) {
      throw new Error("kind must be requirement/design/implementation/review/ops/market_feedback");
    }
    return safeValue;
  }

  #getProjectAccountRef(projectId) {
    const safeProjectId = assertToken("projectId", projectId, 128);
    const account = this.projectAccounts.get(safeProjectId);
    if (!account) throw new Error(`missing project account: ${safeProjectId}`);
    return account;
  }

  #normalizeRating(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(5, Math.round(n * 1000) / 1000));
  }

  #normalizeNonNegative(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.round(n * 1000) / 1000;
  }

  #normalizePositive(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) throw new Error("amount must be > 0");
    return Math.round(n * 1_000_000) / 1_000_000;
  }

  #computeContributionScore(contribution) {
    const baseByKind = {
      requirement: 2,
      design: 3,
      implementation: 4,
      review: 2,
      ops: 2,
      market_feedback: 1,
    };
    const base = baseByKind[contribution.kind] ?? 1;
    return this.#round(base + contribution.demandRating * 2 + contribution.usageCount * 0.5);
  }

  #round(value) {
    return Math.round(Number(value) * 1_000_000) / 1_000_000;
  }
}

export const OSCP_PROJECT_STATES = [...PROJECT_STATES];
export const OSCP_PROPOSAL_STATES = [...PROPOSAL_STATES];
