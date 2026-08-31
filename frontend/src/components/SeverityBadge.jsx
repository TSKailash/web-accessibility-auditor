const SEVERITY_STYLES = {
  critical: { cls: "severity-badge--critical", label: "Critical", mark: "\u25CF\u25CF\u25CF" },
  serious:  { cls: "severity-badge--serious",  label: "Serious",  mark: "\u25CF\u25CF" },
  moderate: { cls: "severity-badge--moderate", label: "Moderate", mark: "\u25CF" },
  minor:    { cls: "severity-badge--minor",    label: "Minor",    mark: "\u25CB" },
};

/**
 * Severity is always communicated through the text label AND a shape
 * (filled-dot count), not color alone — this component is the app's
 * own answer to WCAG 1.4.1 Use of Color.
 */
export default function SeverityBadge({ severity = "minor" }) {
  const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.minor;

  return (
    <span className={`severity-badge ${style.cls}`}>
      <span aria-hidden="true" className="severity-mark">
        {style.mark}
      </span>
      {style.label}
    </span>
  );
}
