import { useEffect, useState } from "react";
import { Globe2, ScanLine, Gauge, ListChecks } from "lucide-react";
import axiosClient from "../api/axiosClient.js";
import StatCard from "../components/StatCard.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [issues, setIssues] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [overviewRes, websitesRes, criteriaRes, issuesRes, comparisonRes] =
          await Promise.all([
            axiosClient.get("/dashboard/overview"),
            axiosClient.get("/dashboard/websites"),
            axiosClient.get("/dashboard/criteria-breakdown"),
            axiosClient.get("/dashboard/recent-issues"),
            axiosClient.get("/dashboard/comparison"),
          ]);

        if (cancelled) return;
        setOverview(overviewRes.data);
        setWebsites(websitesRes.data.websites);
        setCriteria(criteriaRes.data.criteria);
        setIssues(issuesRes.data.issues);
        setComparison(comparisonRes.data);
      } catch {
        if (!cancelled) setError("Couldn't load dashboard data. Is the backend running?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="loading-text" role="status">Loading dashboard…</p>;
  }

  if (error) {
    return <p role="alert" className="alert-error">{error}</p>;
  }

  return (
    <div className="reveal">
      {/* Page header */}
      <div className="page-header">
        <div>
          <p className="eyebrow" style={{ marginBottom: '8px' }}>Workspace overview</p>
          <h1 className="heading-display">Dashboard</h1>
          <p className="text-small text-muted" style={{ marginTop: '8px', maxWidth: '36rem' }}>
            A clear view of the issues shaping your accessibility backlog.
          </p>
        </div>
        <div className="text-mono text-xs text-muted">Updated just now</div>
      </div>

      {/* Stat cards */}
      <div className="grid-stats">
        <StatCard label="Websites tracked" value={overview.totalWebsites} icon={Globe2} />
        <StatCard label="Total scans run" value={overview.totalScans} icon={ScanLine} />
        <StatCard label="Average score" value={overview.averageScore} icon={Gauge} sub="out of 100" />
        <StatCard label="WCAG criteria tracked" value={overview.criteriaTracked} icon={ListChecks} />
      </div>

      {/* Websites + Score ring */}
      <div className="grid-main">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-header-row">
              <h2 className="heading-section">Your websites</h2>
              <span className="text-mono text-xs text-muted">{websites.length} tracked</span>
            </div>
          </div>
          <div className="panel-body">
            <ul className="divide-list">
              {websites.map((site) => (
                <li key={site.id} className="divide-item">
                  <div className="website-item">
                    <div>
                      <p className="website-name">{site.name}</p>
                      <p className="website-url">{site.url}</p>
                      <p className="website-scan-date">Last scanned {site.latestScanDate}</p>
                    </div>
                    <div>
                      <span className={`score-trending ${site.trend === "up" ? "score-trending--up" : "score-trending--down"}`}>
                        {site.latestScore}
                        <span aria-hidden="true" style={{ marginLeft: '4px' }}>
                          {site.trend === "up" ? "▲" : "▼"}
                        </span>
                        <span className="sr-only">
                          {site.trend === "up" ? "trending up" : "trending down"}
                        </span>
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Score ring for the top site */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <h2 className="heading-section" style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>
            Latest score — {websites[0]?.name}
          </h2>
          <ScoreRing score={websites[0]?.latestScore ?? 0} />
        </div>
      </div>

      {/* Criteria breakdown + Improvement */}
      <div className="grid-main" style={{ marginTop: '24px' }}>
        <div className="panel">
          <div className="panel-header">
            <p className="eyebrow" style={{ marginBottom: '4px' }}>Coverage</p>
            <h2 className="heading-section">WCAG 2.2 criteria breakdown</h2>
          </div>
          <div className="panel-body overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Criterion</th>
                  <th>Open issues</th>
                  <th>Needs review</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((c) => (
                  <tr key={c.code}>
                    <td>
                      <span className="criteria-code">{c.code}</span>{" "}
                      <span>{c.title}</span>
                    </td>
                    <td className="text-mono">{c.openIssues}</td>
                    <td className="text-mono text-muted">{c.needsReview}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Improvement comparison */}
        <div className="panel" style={{ padding: '20px' }}>
          <h2 className="heading-section" style={{ marginBottom: '16px' }}>Improvement</h2>
          {comparison ? (
            <div>
              <div className="improvement-row">
                <span className="improvement-label">Score change</span>
                <span className="improvement-value improvement-value--good">
                  +{comparison.scoreImprovement}
                </span>
              </div>
              <div className="improvement-row">
                <span className="improvement-label">Issues resolved</span>
                <span className="improvement-value">
                  {comparison.issuesResolved}
                </span>
              </div>
              <div className="improvement-dates">
                {comparison.previousScan.date} → {comparison.currentScan.date}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Recent issues */}
      <div className="panel" style={{ marginTop: '24px' }}>
        <div className="panel-header">
          <div className="panel-header-row">
            <h2 className="heading-section">Recent issues</h2>
            <span className="text-mono text-xs text-muted">Needs attention</span>
          </div>
        </div>
        <div className="panel-body">
          <ul className="divide-list">
            {issues.map((issue) => (
              <li key={issue.id} className="divide-item">
                <div className="issue-item">
                  <div>
                    <p className="issue-description">{issue.description}</p>
                    <p className="issue-meta">
                      {issue.website} · <span className="text-mono">{issue.wcagCriterion}</span>
                    </p>
                  </div>
                  <SeverityBadge severity={issue.severity} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
