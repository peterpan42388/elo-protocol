import { type PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/overview", label: "Overview" },
  { to: "/market", label: "Market" },
  { to: "/reviews", label: "Reviews" },
  { to: "/agents", label: "Agents & Wallet" },
];

export function AppLayout({ children }: PropsWithChildren) {
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

        <div className="header-search">
          <input
            type="search"
            placeholder="Quick search..."
            aria-label="quick search"
            className="input"
            disabled
          />
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}
