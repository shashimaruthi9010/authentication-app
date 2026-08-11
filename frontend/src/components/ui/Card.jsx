/**
 * Card — surface container.
 * @param {'card'|'flat'|'hover'} variant
 * @param {'md'|'lg'} padding
 */
export default function Card({ variant = 'card', padding = 'md', className = '', children }) {
  const classes = [
    'card',
    variant === 'flat' ? 'card--flat' : '',
    variant === 'hover' ? 'card--hover' : '',
    padding === 'lg' ? 'card__body--lg' : 'card__body',
    className,
  ].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}

/**
 * CardHeader — title row with optional actions.
 */
export function CardHeader({ title, sub, actions }) {
  return (
    <div className="card-header">
      <div>
        <div className="card-header__title">{title}</div>
        {sub && <div className="card-header__sub">{sub}</div>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
