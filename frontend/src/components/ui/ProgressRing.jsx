/**
 * ProgressRing — circular progress indicator.
 * @param {number} value - 0–100
 * @param {'primary'|'gold'|'sage'|'danger'} tone
 * @param {number} size - diameter in px
 * @param {number} stroke - stroke width in px
 */
export default function ProgressRing({ value = 0, tone = 'primary', size = 132, stroke = 9, label, children }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - pct / 100);

  return (
    <div
      className={`ring${tone !== 'primary' ? ` ring--${tone}` : ''}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="ring__fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring__content">{children}</div>
    </div>
  );
}
