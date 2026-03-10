import crypto from "node:crypto";
import { assertBoundedText, assertFiniteNumber, assertToken } from "./inputGuards.js";

const DEFAULT_FACTIONS = [
  { key: "civilian", weight: 0.6, initialElo: 1_000 },
  { key: "middle", weight: 0.3, initialElo: 10_000 },
  { key: "elite", weight: 0.1, initialElo: 100_000 },
];

function cloneMetrics(metrics) {
  return {
    contributionScore: metrics.contributionScore,
    reputation: metrics.reputation,
    creditScore: metrics.creditScore,
    projectCreatedCount: metrics.projectCreatedCount,
    projectCompletedCount: metrics.projectCompletedCount,
    adoptionCount: metrics.adoptionCount,
  };
}

function defaultMetrics() {
  return {
    contributionScore: 0,
    reputation: 0,
    creditScore: 0,
    projectCreatedCount: 0,
    projectCompletedCount: 0,
    adoptionCount: 0,
  };
}

export class OSCPIdentityRegistry {
  constructor(options = {}) {
    this.humans = new Map();
    this.agents = new Map();
    this.initProfiles = new Map();
    this.subjectToInitId = new Map();
    this.factions = this.#normalizeFactions(options.factions ?? DEFAULT_FACTIONS);
  }

  registerHuman(humanId, metadata = {}) {
    const safeHumanId = assertToken("humanId", humanId, 128);
    if (this.humans.has(safeHumanId)) {
      throw new Error(`duplicate humanId: ${safeHumanId}`);
    }
    const record = {
      humanId: safeHumanId,
      displayName: assertBoundedText("displayName", String(metadata.displayName ?? safeHumanId), 128) || safeHumanId,
      metadata: { ...metadata },
      createdAt: Date.now(),
    };
    this.humans.set(safeHumanId, record);
    return record;
  }

  registerAgent(agentId, humanId, metadata = {}) {
    const safeAgentId = assertToken("agentId", agentId, 128);
    const safeHumanId = assertToken("humanId", humanId, 128);
    if (!this.humans.has(safeHumanId)) {
      throw new Error(`unregistered humanId: ${safeHumanId}`);
    }
    if (this.agents.has(safeAgentId)) {
      throw new Error(`duplicate agentId: ${safeAgentId}`);
    }
    const record = {
      agentId: safeAgentId,
      humanId: safeHumanId,
      label: assertBoundedText("label", String(metadata.label ?? safeAgentId), 128) || safeAgentId,
      metadata: { ...metadata },
      createdAt: Date.now(),
    };
    this.agents.set(safeAgentId, record);
    return record;
  }

  assignInitId({ subjectType, subjectId, metadata = {} }) {
    const safeSubjectType = this.#assertSubjectType(subjectType);
    const safeSubjectId = assertToken("subjectId", subjectId, 128);
    this.#assertSubjectExists(safeSubjectType, safeSubjectId);

    const subjectKey = `${safeSubjectType}:${safeSubjectId}`;
    const existingId = this.subjectToInitId.get(subjectKey);
    if (existingId) {
      return this.getInitProfile(existingId);
    }

    const seed = this.#hashHex(subjectKey);
    const faction = this.#pickFaction(seed);
    const initId = `init:${safeSubjectType}:${safeSubjectId}`;
    const profile = {
      initId,
      subjectType: safeSubjectType,
      subjectId: safeSubjectId,
      faction: faction.key,
      initialElo: faction.initialElo,
      metrics: defaultMetrics(),
      randomSeed: seed,
      metadata: { ...metadata },
      createdAt: Date.now(),
    };

    this.initProfiles.set(initId, profile);
    this.subjectToInitId.set(subjectKey, initId);
    return this.getInitProfile(initId);
  }

  recordMetrics(initId, deltas = {}) {
    const profile = this.#getProfileRef(initId);
    const next = {
      contributionScore: this.#applyDelta(profile.metrics.contributionScore, deltas.contributionScore),
      reputation: this.#applyDelta(profile.metrics.reputation, deltas.reputation),
      creditScore: this.#applyDelta(profile.metrics.creditScore, deltas.creditScore),
      projectCreatedCount: this.#applyDelta(profile.metrics.projectCreatedCount, deltas.projectCreatedCount),
      projectCompletedCount: this.#applyDelta(profile.metrics.projectCompletedCount, deltas.projectCompletedCount),
      adoptionCount: this.#applyDelta(profile.metrics.adoptionCount, deltas.adoptionCount),
    };
    profile.metrics = next;
    return this.getInitProfile(initId);
  }

  getHuman(humanId) {
    const safeHumanId = assertToken("humanId", humanId, 128);
    const record = this.humans.get(safeHumanId);
    if (!record) throw new Error(`unregistered humanId: ${safeHumanId}`);
    return { ...record, metadata: { ...record.metadata } };
  }

  getAgent(agentId) {
    const safeAgentId = assertToken("agentId", agentId, 128);
    const record = this.agents.get(safeAgentId);
    if (!record) throw new Error(`unregistered agentId: ${safeAgentId}`);
    return { ...record, metadata: { ...record.metadata } };
  }

  getInitProfile(initId) {
    const profile = this.#getProfileRef(initId);
    return {
      ...profile,
      metrics: cloneMetrics(profile.metrics),
      metadata: { ...profile.metadata },
    };
  }

  ownerHumanIdOfAgent(agentId) {
    return this.getAgent(agentId).humanId;
  }

  listInitProfiles() {
    return [...this.initProfiles.values()]
      .map((profile) => this.getInitProfile(profile.initId))
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  buildSummary() {
    const profiles = this.listInitProfiles();
    const byFaction = Object.fromEntries(this.factions.map((faction) => [faction.key, { count: 0, initialElo: 0 }]));

    for (const profile of profiles) {
      const bucket = byFaction[profile.faction];
      if (!bucket) continue;
      bucket.count += 1;
      bucket.initialElo += profile.initialElo;
    }

    return {
      schemaVersion: "oscp.identity.summary.v1",
      totals: {
        humans: this.humans.size,
        agents: this.agents.size,
        initProfiles: profiles.length,
      },
      byFaction,
      profiles,
    };
  }

  #normalizeFactions(factions) {
    if (!Array.isArray(factions) || factions.length === 0) {
      throw new Error("factions must be a non-empty array");
    }
    const normalized = factions.map((faction) => ({
      key: assertToken("faction.key", String(faction.key), 64),
      weight: assertFiniteNumber("faction.weight", faction.weight, { min: 0.000001, max: 1 }),
      initialElo: assertFiniteNumber("faction.initialElo", faction.initialElo, { min: 0 }),
    }));
    const totalWeight = normalized.reduce((sum, faction) => sum + faction.weight, 0);
    if (Math.abs(totalWeight - 1) > 0.000001) {
      throw new Error("faction weights must sum to 1");
    }
    return normalized;
  }

  #assertSubjectType(subjectType) {
    const safeSubjectType = assertToken("subjectType", String(subjectType ?? ""), 32);
    if (!["human", "agent"].includes(safeSubjectType)) {
      throw new Error("subjectType must be human/agent");
    }
    return safeSubjectType;
  }

  #assertSubjectExists(subjectType, subjectId) {
    if (subjectType === "human" && !this.humans.has(subjectId)) {
      throw new Error(`unregistered humanId: ${subjectId}`);
    }
    if (subjectType === "agent" && !this.agents.has(subjectId)) {
      throw new Error(`unregistered agentId: ${subjectId}`);
    }
  }

  #getProfileRef(initId) {
    const safeInitId = assertToken("initId", initId, 160);
    const profile = this.initProfiles.get(safeInitId);
    if (!profile) throw new Error(`unknown initId: ${safeInitId}`);
    return profile;
  }

  #pickFaction(seed) {
    const normalized = Number.parseInt(seed.slice(0, 12), 16) / 16 ** 12;
    let cursor = 0;
    for (const faction of this.factions) {
      cursor += faction.weight;
      if (normalized <= cursor) return faction;
    }
    return this.factions[this.factions.length - 1];
  }

  #hashHex(value) {
    return crypto.createHash("sha256").update(value).digest("hex");
  }

  #applyDelta(current, delta) {
    if (delta === undefined || delta === null) return current;
    const safeDelta = assertFiniteNumber("delta", delta);
    return Math.max(0, Math.round((current + safeDelta) * 1_000_000) / 1_000_000);
  }
}
