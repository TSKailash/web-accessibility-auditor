export default function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <p className="eyebrow">{label}</p>
        {Icon ? (
          <span className="stat-card-icon">
            <Icon aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="stat-card-value">{value}</p>
      {sub ? <p className="stat-card-sub">{sub}</p> : null}
    </div>
  );
}
