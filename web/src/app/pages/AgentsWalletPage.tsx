import { useCallback, useEffect, useMemo, useState } from "react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { formatElo, toShortId } from "../lib/format";
import type { AgentStats } from "../lib/types";
import { useApiClient } from "../state/api";

export function AgentsWalletPage() {
  const api = useApiClient();

  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [agentId, setAgentId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [registerBusy, setRegisterBusy] = useState(false);

  const [rechargeAgentId, setRechargeAgentId] = useState("");
  const [rechargeAmount, setRechargeAmount] = useState("10");
  const [rechargeBusy, setRechargeBusy] = useState(false);

  const [balanceQueryAgentId, setBalanceQueryAgentId] = useState("");
  const [balanceResult, setBalanceResult] = useState<number | null>(null);

  const sortedAgents = useMemo(
    () => agents.slice().sort((a, b) => b.balance - a.balance),
    [agents]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getDashboardAgents();
      setAgents(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load agents");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  async function registerAgent() {
    if (!agentId.trim() || !ownerId.trim()) {
      setError("agentId and ownerId are required");
      return;
    }

    setRegisterBusy(true);
    setError(null);
    try {
      await api.registerAgent(agentId.trim(), ownerId.trim());
      setAgentId("");
      setOwnerId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to register agent");
    } finally {
      setRegisterBusy(false);
    }
  }

  async function recharge() {
    if (!rechargeAgentId.trim()) {
      setError("recharge agentId is required");
      return;
    }

    const amount = Number(rechargeAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("recharge amount must be > 0");
      return;
    }

    setRechargeBusy(true);
    setError(null);
    try {
      await api.recharge(rechargeAgentId.trim(), amount);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to recharge");
    } finally {
      setRechargeBusy(false);
    }
  }

  async function checkBalance() {
    if (!balanceQueryAgentId.trim()) {
      setError("balance agentId is required");
      return;
    }

    setError(null);
    try {
      const response = await api.getBalance(balanceQueryAgentId.trim());
      setBalanceResult(response.balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to query balance");
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Agents & Wallet"
        description="Register agents, track balances, and manage ELO recharge workflows."
        actions={
          <button className="button button-secondary" type="button" onClick={() => void load()} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        }
      />

      {error ? <p className="status-error">{error}</p> : null}

      <section className="panel two-column">
        <div className="form-stack">
          <h2>Register Agent</h2>
          <label className="label">
            Agent ID
            <input className="input code" value={agentId} onChange={(event) => setAgentId(event.target.value)} />
          </label>
          <label className="label">
            Owner ID
            <input className="input code" value={ownerId} onChange={(event) => setOwnerId(event.target.value)} />
          </label>
          <button className="button button-secondary" type="button" onClick={() => void registerAgent()} disabled={registerBusy}>
            {registerBusy ? "Registering..." : "Register"}
          </button>
        </div>

        <div className="form-stack">
          <h2>Recharge Wallet</h2>
          <label className="label">
            Agent ID
            <input
              className="input code"
              value={rechargeAgentId}
              onChange={(event) => setRechargeAgentId(event.target.value)}
              placeholder="agentConsumer"
            />
          </label>
          <label className="label">
            Amount (ELO)
            <input
              className="input"
              type="number"
              min={0.000001}
              step={0.01}
              value={rechargeAmount}
              onChange={(event) => setRechargeAmount(event.target.value)}
            />
          </label>
          <button className="button button-primary" type="button" onClick={() => void recharge()} disabled={rechargeBusy}>
            {rechargeBusy ? "Recharging..." : "Recharge"}
          </button>
        </div>
      </section>

      <section className="panel split-panel">
        <div className="field-grid">
          <input
            className="input code"
            placeholder="Agent ID for balance query"
            value={balanceQueryAgentId}
            onChange={(event) => setBalanceQueryAgentId(event.target.value)}
          />
        </div>
        <div className="inline-actions">
          <button className="button button-secondary" type="button" onClick={() => void checkBalance()}>
            Check Balance
          </button>
          {balanceResult != null ? <span className="chip">{formatElo(balanceResult)}</span> : null}
        </div>
      </section>

      <section className="panel">
        <h2>Agent Registry</h2>
        <div className="agent-grid">
          {sortedAgents.length ? (
            sortedAgents.map((agent) => (
              <article key={agent.agentId} className="agent-card">
                <div className="agent-card-head">
                  <strong>{toShortId(agent.agentId)}</strong>
                  <span className="chip">{toShortId(agent.ownerId)}</span>
                </div>
                <p className="metric-value">{formatElo(agent.balance)}</p>
                <div className="agent-card-meta">
                  <span>Paid: {agent.settlementPaidCount}</span>
                  <span>Earned: {agent.settlementEarnedCount}</span>
                  <span>Free: {agent.settlementFreeCount}</span>
                </div>
              </article>
            ))
          ) : (
            <p className="panel-subtitle">No agents registered yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
