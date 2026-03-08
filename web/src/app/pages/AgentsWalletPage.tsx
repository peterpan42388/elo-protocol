import { PlaceholderPanel } from "../components/ui/PlaceholderPanel";
import { SectionHeader } from "../components/ui/SectionHeader";

export function AgentsWalletPage() {
  return (
    <div className="page-stack">
      <SectionHeader
        title="Agents & Wallet"
        description="Register agents, track balances, and manage ELO recharge workflows."
      />

      <section className="panel two-column">
        <div>
          <h2>Agent Registry</h2>
          <p className="panel-subtitle">Create or inspect human-owned agent identities.</p>
          <button className="button button-secondary" type="button" disabled>
            Register Agent
          </button>
        </div>

        <div>
          <h2>Wallet</h2>
          <p className="panel-subtitle">Recharge and withdraw controls for human operators.</p>
          <button className="button button-primary" type="button" disabled>
            Recharge
          </button>
        </div>
      </section>

      <PlaceholderPanel
        title="Agent Balances"
        message="Agent list and live balances will be populated once API binding is added."
      />
    </div>
  );
}
