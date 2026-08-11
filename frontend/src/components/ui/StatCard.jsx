import Icon from './Icon';

/**
 * StatCard — labeled metric with optional icon and sub-note.
 */
export default function StatCard({ label, value, unit, sub, subTone, icon, iconTone, className = '' }) {
  const classes = ['stat', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {icon && (
        <div className={`stat__icon${iconTone ? ` stat__icon--${iconTone}` : ''}`}>
          <Icon name={icon} />
        </div>
      )}
      <div className="stat__label">{label}</div>
      <div className="stat__value">
        {value}
        {unit && <span className="stat__unit">{unit}</span>}
      </div>
      {sub && (
        <div className={`stat__sub${subTone ? ` stat__sub--${subTone}` : ''}`}>
          {sub}
        </div>
      )}
    </div>
  );
}
