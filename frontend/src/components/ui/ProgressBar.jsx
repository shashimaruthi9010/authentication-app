/**
 * ProgressBar — thin linear progress.
 * @param {number} value - 0–100
 * @param {'primary'|'gold'|'sage'} tone
 */
export default function ProgressBar({ value = 0, tone = 'primary', className = '' }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`progress ${className}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`progress__fill${tone !== 'primary' ? ` progress__fill--${tone}` : ''}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
