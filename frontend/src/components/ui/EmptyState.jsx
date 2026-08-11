import Icon from './Icon';

/**
 * EmptyState — calm placeholder for empty content.
 */
export default function EmptyState({ icon, title, body, action }) {
  return (
    <div className="empty">
      <div className="empty__icon">
        <Icon name={icon} />
      </div>
      <div className="empty__title">{title}</div>
      {body && <div className="empty__body">{body}</div>}
      {action}
    </div>
  );
}
