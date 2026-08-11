import { useState, useMemo } from 'react';
import Card, { CardHeader } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Field, TextInput } from '../components/ui/Field';
import Icon from '../components/ui/Icon';
import { todayKey, formatDay, dateKey } from '../utils/store';
import { getSymptoms, addSymptom, removeSymptom } from '../utils/data';

const SEVERITY_LABELS = ['', 'Mild', 'Mild', 'Moderate', 'Severe', 'Severe'];
const EMPTY_FORM = { name: '', severity: 3, note: '', date: '' };

export default function Symptoms() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [list, setList] = useState(() => getSymptoms());

  const stats = useMemo(() => {
    const weekAgo = dateKey(new Date(Date.now() - 6 * 86400000));
    const recent = list.filter((s) => s.date >= weekAgo);
    const avg = recent.length
      ? Math.round((recent.reduce((a, s) => a + s.severity, 0) / recent.length) * 10) / 10
      : 0;
    return { total: list.length, thisWeek: recent.length, avg };
  }, [list]);

  const byDay = useMemo(() => {
    const groups = new Map();
    list.forEach((s) => {
      if (!groups.has(s.date)) groups.set(s.date, []);
      groups.get(s.date).push(s);
    });
    return Array.from(groups.entries()).map(([date, entries]) => ({ date, entries }));
  }, [list]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: 'Describe the symptom.' });
      return;
    }
    setList(addSymptom({
      name: form.name.trim(),
      severity: Number(form.severity),
      note: form.note.trim(),
      date: form.date || todayKey(),
    }));
    setForm(EMPTY_FORM);
    setModalOpen(false);
  };

  return (
    <>
      <div className="page-head">
        <div className="eyebrow page-head__eyebrow">Wellbeing</div>
        <div className="page-head__row">
          <div>
            <h1 className="page-head__title">Symptoms</h1>
            <p className="page-head__sub">
              Log how you feel each day to reveal patterns between symptoms and what you eat.
            </p>
          </div>
          <Button icon="plus" onClick={() => setModalOpen(true)}>Log symptom</Button>
        </div>
      </div>

      <div className="grid grid--stats rise">
        <StatCard icon="activity" label="Total entries" value={stats.total} sub="All time" />
        <StatCard icon="calendar" iconTone="sage" label="This week" value={stats.thisWeek} sub="Last 7 days" />
        <StatCard
          icon="heart"
          iconTone="gold"
          label="Avg severity"
          value={stats.avg || '—'}
          unit="/ 5"
          sub={stats.avg ? (stats.avg <= 2 ? 'Comfortable' : stats.avg <= 3.5 ? 'Manageable' : 'Uncomfortable') : 'No recent data'}
        />
      </div>

      <Card className="rise rise--1" style={{ marginTop: '1.5rem' }}>
        <CardHeader title="Symptom log" sub={`${list.length} entries`} />
        <div className="card__body">
          {list.length === 0 ? (
            <EmptyState
              icon="activity"
              title="No symptoms logged"
              body="Capture symptoms as they come up — a consistent log makes patterns visible."
              action={<Button size="sm" icon="plus" onClick={() => setModalOpen(true)}>Log a symptom</Button>}
            />
          ) : (
            <div className="timeline">
              {byDay.map(({ date, entries }) => (
                <div className="timeline__day" key={date}>
                  <div className="timeline__date">
                    <span className="timeline__date-label">{formatDay(date)}</span>
                    <span className="timeline__date-count">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
                  </div>
                  <div className="timeline__items">
                    {entries.map((s) => (
                      <div className="symptom-row" key={s.id}>
                        <div className="symptom-row__severity">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              className={`severity__dot${i <= s.severity ? ' severity__dot--on' : ''}`}
                            />
                          ))}
                        </div>
                        <div className="symptom-row__name">
                          {s.name}
                          {s.note && <div className="symptom-row__note">{s.note}</div>}
                        </div>
                        <span className="symptom-row__level">{SEVERITY_LABELS[s.severity]}</span>
                        <button
                          className="meal-line__remove"
                          onClick={() => setList(removeSymptom(s.id))}
                          aria-label={`Remove ${s.name}`}
                        >
                          <Icon name="close" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title="Log a symptom"
        onClose={() => { setModalOpen(false); setErrors({}); }}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setModalOpen(false); setErrors({}); }}>Cancel</Button>
            <Button type="submit" form="symptom-form" icon="check">Save entry</Button>
          </>
        }
      >
        <form id="symptom-form" onSubmit={handleSubmit} noValidate>
          <Field label="Symptom" htmlFor="symptom-name" error={errors.name}>
            <TextInput
              id="symptom-name"
              name="name"
              placeholder="e.g. Bloating, fatigue, headache"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              autoFocus
            />
          </Field>

          <Field label="Severity" htmlFor="symptom-severity" hint={SEVERITY_LABELS[form.severity]}>
            <div className="segmented" id="symptom-severity">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`segmented__btn${form.severity === n ? ' segmented__btn--active' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, severity: n }))}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Notes (optional)" htmlFor="symptom-note">
            <TextInput
              id="symptom-note"
              name="note"
              placeholder="Timing, triggers, how it felt…"
              value={form.note}
              onChange={handleChange}
            />
          </Field>

          <Field label="Date" htmlFor="symptom-date">
            <TextInput
              id="symptom-date"
              name="date"
              type="date"
              icon="calendar"
              value={form.date || todayKey()}
              onChange={handleChange}
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}
