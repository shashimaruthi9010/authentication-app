/**
 * PageHeader — consistent page title block: eyebrow + title + description + actions.
 */
export default function PageHeader({ eyebrow, title, sub, actions, align }) {
  return (
    <div className={`page-head${align === 'center' ? ' page-head--center' : ''}`}>
      {eyebrow && <div className="eyebrow page-head__eyebrow">{eyebrow}</div>}
      <div className="page-head__row">
        <div>
          <h1 className="page-head__title">{title}</h1>
          {sub && <p className="page-head__sub">{sub}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </div>
  );
}
