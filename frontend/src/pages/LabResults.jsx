import { useState, useMemo } from 'react';
import Card, { CardHeader } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import AlertBanner from '../components/AlertBanner';
import { Field, TextInput } from '../components/ui/Field';
import Icon from '../components/ui/Icon';
import { formatDay } from '../utils/store';
import { getLabs, addLab, removeLab, labStatus, labStatusMeta } from '../utils/data';

const EMPTY_FORM = { name: '', value: '', unit: '', min: '', max: '', date: '' };

export default function LabResults() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [list, setList] = useState(() => getLabs());

  const summary = useMemo(() => {
    const counts = { 'in-range': 0, high: 0, low: 0 };
    list.forEach((l) => {
      const status = labStatus(l.value, l.min, l.max);
      if (counts[status] != null) counts[status] += 1;
    });
    return counts;
  }, [list]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Enter a marker name.';
    if (form.value === '' || Number.isNaN(Number(form.value))) next.value = 'Enter a numeric value.';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setList(addLab({
      name: form.name.trim(),
      value: Number(form.value),
      unit: form.unit.trim() || '',
      min: form.min === '' ? null : Number(form.min),
      max: form.max === '' ? null : Number(form.max),
      date: form.date || new Date().toISOString().slice(0, 10),
    }));
    setForm(EMPTY_FORM);
    setModalOpen(false);
  };

  return (
    <>
      <div className="page-head">
        <div className="eyebrow page-head__eyebrow">Clinical data</div>
        <div className="page-head__row">
          <div>
            <h1 className="page-head__title">Lab Results</h1>
            <p className="page-head__sub">
              Keep your markers in one place and see how they compare with reference ranges.
            </p>
          </div>
          <Button icon="plus" onClick={() => setModalOpen(true)}>Add result</Button>
        </div>
      </div>

      <AlertBanner
        type="info"
        message="Results are informational and stored on your device. Always discuss clinical values with your healthcare provider."
      />

      {list.length > 0 && (
        <div className="lab-summary rise" style={{ marginTop: '1.25rem' }}>
          <div className="lab-summary__chip lab-summary__chip--total">
            <span className="lab-summary__value">{list.length}</span>
            <span className="lab-summary__label">Recorded</span>
          </div>
          <div className="lab-summary__chip lab-summary__chip--good">
            <span className="lab-summary__value">{summary['in-range']}</span>
            <span className="lab-summary__label">In range</span>
          </div>
          <div className="lab-summary__chip lab-summary__chip--warn">
            <span className="lab-summary__value">{summary.high}</span>
            <span className="lab-summary__label">High</span>
          </div>
          <div className="lab-summary__chip lab-summary__chip--low">
            <span className="lab-summary__value">{summary.low}</span>
            <span className="lab-summary__label">Low</span>
          </div>
        </div>
      )}

      <Card className="rise" style={{ marginTop: '1.25rem' }}>
        <CardHeader title="Markers" sub={`${list.length} recorded`} />
        {list.length === 0 ? (
          <EmptyState
            icon="flask"
            title="No lab results yet"
            body="Add a recent blood panel or biomarker to start comparing your values over time."
            action={<Button size="sm" icon="plus" onClick={() => setModalOpen(true)}>Add your first result</Button>}
          />
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Marker</th>
                  <th>Result</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.slice(0, 30).map((l) => {
                  const status = labStatus(l.value, l.min, l.max);
                  const meta = labStatusMeta[status] || labStatusMeta['in-range'];
                  const tone = meta.tone === 'danger' ? 'danger' : meta.tone === 'info' ? 'info' : 'success';
                  return (
                    <tr key={l.id}>
                      <td>
                        <div className="lab-cell">
                          <span className="lab-cell__name">{l.name}</span>
                          {l.unit && <span className="lab-cell__meta">{l.unit}</span>}
                        </div>
                      </td>
                      <td className={`lab-value lab-value--${tone}`}>{l.value}</td>
                      <td className="lab-range">
                        {l.min != null && l.max != null
                          ? `${l.min} – ${l.max}`
                          : l.max != null ? `≤ ${l.max}` : l.min != null ? `≥ ${l.min}` : '—'}
                      </td>
                      <td><Badge tone={tone} dot>{meta.label}</Badge></td>
                      <td className="lab-range">{formatDay(l.date)}</td>
                      <td>
                        <button
                          className="meal-line__remove"
                          onClick={() => setList(removeLab(l.id))}
                          aria-label={`Remove ${l.name}`}
                        >
                          <Icon name="close" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        title="Add a lab result"
        onClose={() => { setModalOpen(false); setErrors({}); }}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setModalOpen(false); setErrors({}); }}>Cancel</Button>
            <Button type="submit" form="lab-form" icon="check">Save result</Button>
          </>
        }
      >
        <form id="lab-form" onSubmit={handleSubmit} noValidate>
          <Field label="Marker" htmlFor="lab-name" error={errors.name}>
            <TextInput
              id="lab-name"
              name="name"
              placeholder="e.g. Total cholesterol, Vitamin D, Ferritin"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              autoFocus
            />
          </Field>

          <div className="form-grid">
            <Field label="Value" htmlFor="lab-value" error={errors.value}>
              <TextInput
                id="lab-value"
                name="value"
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="5.2"
                value={form.value}
                onChange={handleChange}
                error={errors.value}
              />
            </Field>
            <Field label="Unit" htmlFor="lab-unit">
              <TextInput
                id="lab-unit"
                name="unit"
                placeholder="mmol/L"
                value={form.unit}
                onChange={handleChange}
              />
            </Field>
          </div>

          <div className="form-grid">
            <Field label="Lower range" htmlFor="lab-min">
              <TextInput
                id="lab-min"
                name="min"
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="3.6"
                value={form.min}
                onChange={handleChange}
              />
            </Field>
            <Field label="Upper range" htmlFor="lab-max">
              <TextInput
                id="lab-max"
                name="max"
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="5.2"
                value={form.max}
                onChange={handleChange}
              />
            </Field>
          </div>

          <Field label="Date" htmlFor="lab-date">
            <TextInput
              id="lab-date"
              name="date"
              type="date"
              icon="calendar"
              value={form.date || new Date().toISOString().slice(0, 10)}
              onChange={handleChange}
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}
