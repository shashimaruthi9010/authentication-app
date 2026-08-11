/**
 * CardSelect — a premium radio-style option grid.
 * Each option renders as a selectable card with optional icon + description.
 * @param {Array<{value,label,desc?,icon?,meta?}>} options
 * @param {string} value - currently selected option value
 * @param {(value:string) => void} onChange
 * @param {string} name - shared radio group name
 * @param {string} columns - 'auto' | '2' | '3'
 */
import Icon from './Icon';
import { ICONS } from './icons';

export default function CardSelect({ options, value, onChange, name, columns = 'auto' }) {
  return (
    <div className={`card-select${columns !== 'auto' ? ` card-select--${columns}` : ''}`} role="radiogroup">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label key={opt.value} className={`choice-card${selected ? ' choice-card--selected' : ''}`}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
            />
            <span className="choice-card__hit" aria-hidden="true" />
            {opt.icon && (
              <span className="choice-card__icon" aria-hidden="true">
                <span className="choice-card__icon-glyph">
                  {ICONS[opt.icon] ? <Icon name={opt.icon} /> : opt.icon}
                </span>
              </span>
            )}
            <span className="choice-card__body">
              <span className="choice-card__label">{opt.label}</span>
              {opt.desc && <span className="choice-card__desc">{opt.desc}</span>}
            </span>
            <span className="choice-card__check" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
          </label>
        );
      })}
    </div>
  );
}
