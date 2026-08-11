import Icon from './Icon';

/**
 * Button — primary | secondary | ghost | danger
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  block = false,
  className = '',
  type = 'button',
  disabled,
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    block ? 'btn--block' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      {!loading && icon && <Icon name={icon} className="btn__icon" />}
      <span>{children}</span>
      {iconRight && !loading && <Icon name={iconRight} className="btn__icon" />}
    </button>
  );
}
