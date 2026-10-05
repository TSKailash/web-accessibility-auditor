import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, ScanSearch, LogOut, ShieldCheck, History } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/scan", label: "New Scan", icon: ScanSearch },
  { to: "/dashboard/history", label: "History", icon: History },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-shell">
      {/* Skip link for keyboard users — practicing SC 2.4.1 */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <ShieldCheck aria-hidden="true" />
          </div>
          <div>
            <span className="sidebar-brand-name">A11y Auditor</span>
            <p className="sidebar-brand-sub">Control room</p>
          </div>
        </div>

        <nav aria-label="Main navigation" className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sidebar-nav-link${isActive ? " active" : ""}`
              }
            >
              <Icon aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-user-label">Signed in as</p>
          <p className="sidebar-user-name">{user?.name}</p>
          <button
            type="button"
            onClick={logout}
            className="btn-outline"
            style={{ marginTop: '16px' }}
          >
            <LogOut style={{ width: 16, height: 16 }} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="mobile-header">
          <div className="mobile-brand">
            <ShieldCheck aria-hidden="true" />
            <span className="mobile-brand-name">A11y Auditor</span>
          </div>
          <button type="button" onClick={logout} className="mobile-logout">
            Log out
          </button>
        </header>

        <div className="top-bar">
          <p className="eyebrow">Accessibility operations</p>
          <p className="text-mono text-xs text-muted">WCAG 2.2 / live workspace</p>
        </div>

        <main id="main-content" className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
