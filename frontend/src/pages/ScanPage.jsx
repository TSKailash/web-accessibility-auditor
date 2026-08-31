import { useEffect, useState } from "react";
import { ScanSearch, Loader2 } from "lucide-react";
import axiosClient from "../api/axiosClient.js";
import SeverityBadge from "../components/SeverityBadge.jsx";
import ScoreRing from "../components/ScoreRing.jsx";

export default function ScanPage() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [criteria, setCriteria] = useState([]);

  useEffect(() => {
    axiosClient
      .get("/scans/criteria")
      .then((res) => setCriteria(res.data.criteria))
      .catch(() => setCriteria([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setScanning(true);
    try {
      const res = await axiosClient.post("/scans", { url });
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Scan failed. Make sure the URL is reachable and try again."
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="reveal max-w-4xl">
      <p className="eyebrow" style={{ marginBottom: '8px' }}>Audit surface</p>
      <h1 className="heading-display" style={{ marginBottom: '8px' }}>New scan</h1>
      <p className="text-small text-muted" style={{ marginBottom: '28px', maxWidth: '36rem' }}>
        Enter a URL to crawl it with Playwright and check it against the 10 WCAG 2.2 criteria
        this scanner covers.
      </p>

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

      {criteria.length > 0 && !result ? (
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

      {result ? (
        <div className="space-y-lg">
          <div className="scan-result-header">
            <div>
              <p className="text-xs text-muted">Scanned</p>
              <p className="scan-url">{result.scan.url}</p>
              <p className="text-xs text-muted" style={{ marginTop: '8px' }}>
                {result.scan.totalIssues} issue{result.scan.totalIssues === 1 ? "" : "s"} found
              </p>
            </div>
            <ScoreRing score={result.scan.accessibilityScore ?? 0} />
          </div>

          <div className="panel" style={{ padding: '20px 24px' }}>
            <h2 className="heading-section" style={{ marginBottom: '16px' }}>Issues found</h2>
            {result.issues.length === 0 ? (
              <p className="text-small text-muted">
                No issues detected across the 10 tracked criteria.
              </p>
            ) : (
              <ul className="divide-list">
                {result.issues.map((issue, idx) => (
                  <li key={idx} className="divide-item">
                    <div className="issue-item-scan">
                      <div style={{ paddingRight: '16px' }}>
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
      ) : null}
    </div>
  );
}
