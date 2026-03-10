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
      state,
      tags: Array.isArray(params.tags) ? params.tags.map((tag) => assertToken("tag", String(tag), 64)) : [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.projects.set(safeProjectId, project);
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

  transitionProjectState(projectId, nextState) {
    const project = this.#getProjectRef(projectId);
    project.state = this.#assertState(nextState);
    project.updatedAt = Date.now();
    return this.getProject(projectId);
  }

  getProject(projectId) {
    return { ...this.#getProjectRef(projectId) };
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
}

export const OSCP_PROJECT_STATES = [...PROJECT_STATES];
export const OSCP_PROPOSAL_STATES = [...PROPOSAL_STATES];
