import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ScanSearch, Loader2, ArrowLeft } from "lucide-react";
import axiosClient from "../api/axiosClient.js";
import SeverityBadge from "../components/SeverityBadge.jsx";
import ScoreRing from "../components/ScoreRing.jsx";

export default function ScanPage() {
  const location = useLocation();
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [showIssues, setShowIssues] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const presetUrl = params.get("url");

    if (presetUrl) {
      setUrl(presetUrl);
    }

    axiosClient
      .get("/scans/criteria")
      .then((res) => setCriteria(res.data.criteria))
      .catch(() => setCriteria([]));
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowIssues(false);
    setScanning(true);

    try {
      const res = await axiosClient.post("/scans", { url });
      setResult(res.data);
      window.dispatchEvent(new CustomEvent("scan:updated"));
      localStorage.setItem("a11y_last_scan", Date.now().toString());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Scan failed. Make sure the URL is reachable and try again."
      );
      setResult(null);
    } finally {
      setScanning(false);
    }
  };

  const resultSummary = result?.scan;
  const issues = result?.issues || [];

  return (
    <div className="reveal max-w-4xl">
      <p className="eyebrow" style={{ marginBottom: '8px' }}>Audit surface</p>
      <h1 className="heading-display" style={{ marginBottom: '8px' }}>New scan</h1>
      <p className="text-small text-muted" style={{ marginBottom: '28px', maxWidth: '36rem' }}>
        Enter a URL to crawl it with Playwright and check it against the 10 WCAG 2.2 criteria
        this scanner covers.
      </p>

      {!result && (
        <>
          <form onSubmit={handleSubmit} className="panel" style={{ marginBottom: '24px' }}>
            <div className="scan-form">
              <label htmlFor="scan-url" className="sr-only">Website URL</label>
              <input
                id="scan-url"
                type="url"
                required
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="scan-input"
              />
              <button type="submit" disabled={scanning} className="scan-btn">
                {scanning ? (
                  <>
                    <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} aria-hidden="true" />
                    Scanning…
                  </>
                ) : (
                  <>
                    <ScanSearch style={{ width: 16, height: 16 }} aria-hidden="true" />
                    Run scan
                  </>
                )}
              </button>
            </div>
          </form>

          {error ? (
            <p role="alert" className="alert-error" style={{ marginBottom: '24px' }}>{error}</p>
          ) : null}

          {criteria.length > 0 ? (
            <div className="panel" style={{ padding: '20px 24px' }}>
              <h2 className="heading-section" style={{ marginBottom: '12px', fontSize: '0.875rem' }}>What this scanner checks</h2>
              <ul className="grid-criteria">
                {criteria.map((c) => (
                  <li key={c.code} className="criteria-item">
                    <span className="criteria-code">{c.code}</span>
                    <span className="criteria-title">
                      {c.title}
                      {c.presenceOnly ? (
                        <span className="criteria-tag">(presence only)</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}

      {result && !showIssues && (
        <div className="scan-stage-panel">
          <div className="scan-result-header">
            <div>
              <p className="text-xs text-muted">Scanned</p>
              <p className="scan-url">{resultSummary?.url}</p>
              <p className="text-xs text-muted" style={{ marginTop: '8px' }}>
                {resultSummary?.totalIssues ?? 0} issue{resultSummary?.totalIssues === 1 ? "" : "s"} found
              </p>
            </div>
            <ScoreRing score={resultSummary?.accessibilityScore ?? 0} />
          </div>

          <div className="scan-summary-grid">
            <div className="scan-summary-box">
              <span className="scan-summary-label">Accessibility score</span>
              <strong>{resultSummary?.accessibilityScore ?? 0}/100</strong>
            </div>
            <div className="scan-summary-box">
              <span className="scan-summary-label">Issues detected</span>
              <strong>{resultSummary?.totalIssues ?? 0}</strong>
            </div>
          </div>

          <button type="button" className="scan-btn scan-btn--wide" onClick={() => setShowIssues(true)}>
            Show issues
          </button>
        </div>
      )}

      {result && showIssues && (
        <div className="scan-stage-panel">
          <div className="scan-results-header">
            <div>
              <p className="eyebrow">Issue report</p>
              <h2 className="heading-section">Results for {resultSummary?.url}</h2>
            </div>
            <button type="button" className="btn-secondary" onClick={() => setShowIssues(false)}>
              <ArrowLeft style={{ width: 16, height: 16 }} aria-hidden="true" />
              Back to summary
            </button>
          </div>

          <div className="panel scan-issue-panel">
            {issues.length === 0 ? (
              <div className="panel-body">
                <p className="text-small text-muted">
                  No issues detected across the 10 tracked criteria.
                </p>
              </div>
            ) : (
              <ul className="divide-list panel-body">
                {issues.map((issue, idx) => (
                  <li key={`${issue.wcagCriterion}-${idx}`} className="divide-item">
                    <div className="issue-item-scan">
                      <div style={{ paddingRight: '16px', flex: 1 }}>
                        <p className="issue-description">{issue.description}</p>
                        <p className="issue-meta text-mono">{issue.wcagCriterion}</p>
                        {issue.element ? (
                          <code className="issue-element">{issue.element}</code>
                        ) : null}
                      </div>
                      <SeverityBadge severity={issue.severity} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
