import test from "node:test";
import assert from "node:assert/strict";
import { OSCPProjectCommons } from "../src/oscpProjectCommons.js";

test("OSCP project commons should create project, task, proposal, and review flow", () => {
  const commons = new OSCPProjectCommons();

  const project = commons.createProject({
    projectId: "project.chat.open",
    proposerHumanId: "human.alice",
    title: "Open Chat",
    replacementTarget: "closed enterprise chat tools",
  });
  assert.equal(project.state, "P1");

  const task = commons.createTask({
    taskId: "task.chat.intake",
    projectId: "project.chat.open",
    title: "Build intake flow",
  });
  assert.equal(task.status, "open");

  const proposal = commons.submitProposal({
    proposalId: "proposal.chat.branch.1",
    projectId: "project.chat.open",
    branchName: "leo/chat-intake",
    submittedByHumanId: "human.alice",
    summary: "Add intake screen",
    commitReportPath: "docs/reports/abc1234.md",
  });
  assert.equal(proposal.state, "open");

  const review = commons.recordReview({
    reviewId: "review.1",
    proposalId: "proposal.chat.branch.1",
    reviewerId: "maintainer.1",
    decision: "Pass",
    notes: "Looks good",
  });
  assert.equal(review.proposalState, "accepted");

  const moved = commons.transitionProjectState("project.chat.open", "P2");
  assert.equal(moved.state, "P2");

  const summary = commons.buildSummary();
  assert.equal(summary.totals.projects, 1);
  assert.equal(summary.totals.tasks, 1);
  assert.equal(summary.totals.proposals, 1);
  assert.equal(summary.totals.reviews, 1);
});
