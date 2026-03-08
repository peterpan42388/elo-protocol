import { type PropsWithChildren, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthSettingsModal } from "../auth/AuthSettingsModal";
import { useAuth } from "../../state/auth";

const NAV_ITEMS = [
  { to: "/overview", label: "Overview" },
  { to: "/market", label: "Market" },
  { to: "/reviews", label: "Reviews" },
  { to: "/agents", label: "Agents & Wallet" },
];

export function AppLayout({ children }: PropsWithChildren) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { auth } = useAuth();

  const authStatusLabel = useMemo(() => {
    const parts = [];
    if (auth.bearerToken) parts.push("Bearer");
    if (auth.hmacSecret) parts.push("HMAC");
    return parts.length ? parts.join(" + ") : "Open";
  }, [auth.bearerToken, auth.hmacSecret]);

  return (
    <div className="app-root">
      <header className="top-nav">
        <div className="brand-mark">
          <span className="brand-logo">E</span>
          <div>
            <p className="brand-title">ELO Market</p>
            <p className="brand-subtitle">Human Console</p>
          </div>
        </div>

        <nav className="nav-links" aria-label="primary navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <span className="auth-badge">Auth: {authStatusLabel}</span>
          <button className="button button-secondary" type="button" onClick={() => setIsSettingsOpen(true)}>
            API Config
          </button>
        </div>
      </header>

      <main className="app-main">{children}</main>

      <AuthSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
