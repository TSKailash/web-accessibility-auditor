const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TICK_COUNT = 60;

function tierFor(score) {
  if (score >= 85) return { label: "Excellent", color: "var(--verdigris)" };
  if (score >= 70) return { label: "Good", color: "var(--brass)" };
  if (score >= 50) return { label: "Needs Work", color: "var(--amber-ink)" };
  return { label: "Critical", color: "var(--cinnabar)" };
}

/**
 * The dashboard's signature element — an engraved brass barometer.
 * A score is never conveyed by color alone: the ring pairs a filled
 * arc with an explicit numeric read-out, a text tier label, and a
 * dashed stroke below 70 so the "at a glance" read still works
 * without color information (SC 1.4.1).
 */
export default function ScoreRing({ score = 0, size = 148 }) {
  const clamped = Math.max(0, Math.min(100, score));
  const tier = tierFor(clamped);
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;
  const isLow = clamped < 70;

  // Generate tick marks around the circumference
  const ticks = [];
  for (let i = 0; i < TICK_COUNT; i++) {
    const angle = (i / TICK_COUNT) * 360;
    const isMajor = i % 5 === 0;
    const innerR = isMajor ? 43 : 45;
    const outerR = 48;
    const rad = (angle - 90) * (Math.PI / 180);
    ticks.push(
      <line
        key={i}
        x1={66 + innerR * Math.cos(rad)}
        y1={66 + innerR * Math.sin(rad)}
        x2={66 + outerR * Math.cos(rad)}
        y2={66 + outerR * Math.sin(rad)}
        stroke="var(--gilt-line-strong)"
        strokeWidth={isMajor ? 1.5 : 0.75}
        strokeLinecap="round"
      />
    );
  }

  return (
    <div className="score-ring-container">
      <div
        className="score-ring-wrapper"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`Accessibility score ${clamped} out of 100, rated ${tier.label}`}
      >
        <svg width={size} height={size} viewBox="0 0 132 132" style={{ transform: 'rotate(-90deg)' }}>
          {/* Engraved tick marks */}
          <g style={{ transform: 'rotate(90deg)', transformOrigin: '66px 66px' }}>
            {ticks}
          </g>
          {/* Track */}
          <circle
            cx="66"
            cy="66"
            r={RADIUS}
            fill="none"
            stroke="var(--gilt-line)"
            strokeWidth="10"
          />
          {/* Progress arc */}
          <circle
            cx="66"
            cy="66"
            r={RADIUS}
            fill="none"
            stroke={tier.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={isLow ? `${CIRCUMFERENCE / 90} ${CIRCUMFERENCE / 140}` : CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="score-ring-center">
          <span className="score-ring-number" aria-hidden="true">
            {clamped}
          </span>
          <span className="score-ring-denominator" aria-hidden="true">
            / 100
          </span>
        </div>
      </div>
      <span className="score-ring-tier" style={{ color: tier.color }}>
        {tier.label}
      </span>
    </div>
  );
}
