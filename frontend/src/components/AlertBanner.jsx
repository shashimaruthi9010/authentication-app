import Icon from './ui/Icon';

/**
 * Alert banner for global form-level success or error messages.
 * @param {string} type - 'error' | 'success' | 'info' | 'warning'
 * @param {string} message
 */
export default function AlertBanner({ type = 'error', message }) {
  if (!message) return null;
  const tone = type === 'success' ? 'success' : type === 'info' ? 'info' : type === 'warning' ? 'warning' : 'error';
  const icon = tone === 'error' ? 'alert' : tone === 'warning' ? 'alert' : 'checkCircle';

  return (
    <div className={`alert alert--${tone}`} role="alert">
      <Icon name={icon} />
      <span>{message}</span>
    </div>
  );
}
