/**
 * Badge — compact status label.
 * @param {string} tone - 'green' | 'sage' | 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
 */
export default function Badge({ tone = 'neutral', dot = false, children }) {
  return (
    <span className={`badge badge--${tone}${dot ? ' badge--dot' : ''}`}>{children}</span>
  );
}
