import { ShieldCheck } from "lucide-react";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-icon-wrapper">
            <ShieldCheck aria-hidden="true" />
          </div>
          <p className="eyebrow" style={{ marginBottom: '8px' }}>A11y Auditor</p>
          <h1 className="heading-display">{title}</h1>
          {subtitle ? <p className="text-small text-muted" style={{ marginTop: '4px' }}>{subtitle}</p> : null}
        </div>

        <div className="auth-card">
          {children}
        </div>
      </div>
    </div>
  );
}
