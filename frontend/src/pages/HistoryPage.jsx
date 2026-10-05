import { useEffect, useState } from "react";
import { History, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import SeverityBadge from "../components/SeverityBadge.jsx";

const formatAuditDate = (value) => {
  if (!value) return "No date";

  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const scansResponse = await axiosClient.get("/scans");
        const scans = scansResponse.data.scans || [];

        if (cancelled) return;

        const detailedScans = await Promise.all(
          scans.map(async (scan) => {
            const scanResponse = await axiosClient.get(`/scans/${scan._id}`);
            return {
              ...scan,
              issues: scanResponse.data.issues || [],
            };
          })
        );

        setHistory(detailedScans);
      } catch {
        if (!cancelled) {
          setError("Couldn't load your audit history. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRetake = (url) => {
    navigate(`/dashboard/scan?url=${encodeURIComponent(url)}`);
  };

  if (loading) {
    return <p className="loading-text" role="status">Loading audit history…</p>;
  }

  if (error) {
    return <p role="alert" className="alert-error">{error}</p>;
  }

  return (
    <div className="reveal">
      <div className="page-header">
        <div>
          <p className="eyebrow" style={{ marginBottom: "8px" }}>Archive</p>
          <h1 className="heading-display">Past audits</h1>
          <p className="text-small text-muted" style={{ marginTop: "8px", maxWidth: "36rem" }}>
            Review each audit, inspect the issues found, and retake a scan in one click.
          </p>
        </div>
        <div className="text-mono text-xs text-muted">{history.length} saved audit{history.length === 1 ? "" : "s"}</div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="panel-header-row">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <History aria-hidden="true" style={{ width: 18, height: 18, color: "var(--brass)" }} />
              <h2 className="heading-section">Audit record</h2>
            </div>
          </div>
        </div>

        <div className="panel-body">
          {history.length === 0 ? (
            <p className="text-small text-muted">No scans yet. Start with a new audit to build your history.</p>
          ) : (
            <ul className="divide-list">
              {history.map((entry) => (
                <li key={entry._id} className="divide-item">
                  <div className="history-item">
                    <div className="history-item-main">
                      <div className="history-item-header">
                        <div>
                          <p className="eyebrow" style={{ marginBottom: "6px" }}>Scan {formatAuditDate(entry.createdAt)}</p>
                          <h3 className="history-site-name">{entry.website?.name || entry.url}</h3>
                          <p className="history-site-url">{entry.url}</p>
                        </div>
                        <div className="history-score-box">
                          <span className="history-score-label">Score</span>
                          <strong>{entry.accessibilityScore ?? 0}</strong>
                        </div>
                      </div>

                      <div className="history-summary-grid">
                        <div className="history-summary-box">
                          <span className="scan-summary-label">Issues found</span>
                          <strong>{entry.totalIssues ?? 0}</strong>
                        </div>
                        <div className="history-summary-box">
                          <span className="scan-summary-label">Status</span>
                          <strong>{entry.status}</strong>
                        </div>
                      </div>

                      <div className="history-issues">
                        {entry.issues.length === 0 ? (
                          <p className="text-small text-muted">No issues detected in this audit.</p>
                        ) : (
                          <ul className="divide-list">
                            {entry.issues.slice(0, 4).map((issue, index) => (
                              <li key={`${entry._id}-${issue._id || index}`} className="divide-item">
                                <div className="issue-item-scan">
                                  <div style={{ paddingRight: "16px", flex: 1 }}>
                                    <p className="issue-description">{issue.description}</p>
                                    <p className="issue-meta text-mono">{issue.wcagCriterion}</p>
                                    {issue.element ? <code className="issue-element">{issue.element}</code> : null}
                                  </div>
                                  <SeverityBadge severity={issue.severity} />
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="history-actions">
                      <button type="button" className="scan-btn" onClick={() => handleRetake(entry.url)}>
                        <RotateCcw style={{ width: 16, height: 16 }} aria-hidden="true" />
                        Retake audit
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
