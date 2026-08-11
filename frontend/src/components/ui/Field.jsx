import Icon from './Icon';

/**
 * Field — label + control + error/hint wrapper.
 */
export function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <div className="field__error" role="alert">
          <Icon name="alert" />
          <span>{error}</span>
        </div>
      ) : hint ? (
        <div className="field__hint">{hint}</div>
      ) : null}
    </div>
  );
}

/**
 * TextInput — text/number/password input with optional leading icon,
 * trailing unit, or toggle element.
 */
export function TextInput({ icon, unit, toggle, error, id, className = '', ...rest }) {
  const cls = [
    'field__input',
    icon ? 'has-icon' : '',
    unit ? 'has-unit' : '',
    toggle ? 'has-toggle' : '',
    error ? 'error' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="field__control">
      {icon && <Icon name={icon} className="field__icon" />}
      <input id={id} className={cls} {...rest} />
      {unit && <span className="field__unit">{unit}</span>}
      {toggle}
    </div>
  );
}

/**
 * Select — styled native select.
 */
export function Select({ error, id, className = '', children, ...rest }) {
  const cls = ['field__select', error ? 'error' : '', className].filter(Boolean).join(' ');
  return (
    <div className="field__control">
      <select id={id} className={cls} {...rest}>
        {children}
      </select>
    </div>
  );
}

/**
 * ChipToggle — pill-style checkbox toggle.
 */
export function ChipToggle({ checked, onToggle, children }) {
  return (
    <label className={`chip${checked ? ' chip--selected' : ''}`}>
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <span>{children}</span>
    </label>
  );
}
