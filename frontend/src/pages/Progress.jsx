import { useState, useMemo } from 'react';
import Card, { CardHeader } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Field, TextInput } from '../components/ui/Field';
import Icon from '../components/ui/Icon';
import { getUserProfile } from '../utils/profile';
import { formatDay, todayKey } from '../utils/store';
import { getWeights, addWeight, removeWeight, diaryStreak, weekCalorieSummary } from '../utils/data';
import { calorieTarget, calcTDEE } from '../utils/health';

const W = 600;
const H = 190;
const PAD_X = 34;
const PAD_Y = 24;

function WeightChart({ entries }) {
  if (entries.length < 2) {
    return (
      <EmptyState
        icon="chart"
        title="Log two weight entries to see your trend"
        body="Add your weight a couple of times a week — the trend emerges over time."
      />
    );
  }

  const values = entries.map((e) => Number(e.weight));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const top = max + range * 0.25;
  const bottom = min - range * 0.25;

  const x = (i) => PAD_X + (i / (entries.length - 1)) * (W - PAD_X * 2);
  const y = (v) => PAD_Y + ((top - v) / (top - bottom)) * (H - PAD_Y * 2);

  const points = entries.map((e, i) => [x(i), y(Number(e.weight))]);
  const line = points.map((p) => p.join(',')).join(' ');
  const area = `${PAD_X},${H - PAD_Y} ${line} ${W - PAD_X},${H - PAD_Y}`;

  const grid = [0.25, 0.5, 0.75].map((f) => PAD_Y + f * (H - PAD_Y * 2));

  return (
    <div className="chart-box">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-line" preserveAspectRatio="none" style={{ height: 220 }} role="img" aria-label="Weight trend chart">
        {grid.map((gy, i) => (
          <line key={i} x1={PAD_X} x2={W - PAD_X} y1={gy} y2={gy} className="chart-line__grid" />
        ))}
        <polygon points={area} className="chart-line__area" />
        <polyline points={line} className="chart-line__stroke" />
        {points.map(([px, py], i) => (
          <circle
            key={i}
            cx={px}
            cy={py}
            r={i === points.length - 1 ? 4 : 3}
            className={i === points.length - 1 ? 'chart-line__dot chart-line__dot--last' : 'chart-line__dot'}
          />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 1.5rem', fontSize: '0.72rem', color: 'var(--ns-text-3)' }}>
        <span>{formatDay(entries[0].date)}</span>
        <span>{formatDay(entries[entries.length - 1].date)}</span>
      </div>
    </div>
  );
}

export default function Progress() {
  const profile = getUserProfile();
  const [weights, setWeights] = useState(() => getWeights());
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ weight: '', date: '' });
  const [errors, setErrors] = useState({});

  const target = calorieTarget(calcTDEE(profile), profile?.health_goal) || 0;
  const week = useMemo(() => weekCalorieSummary(target), [target]);
  const streak = useMemo(() => diaryStreak(), []);
  const avgKcal = useMemo(() => Math.round(week.reduce((a, d) => a + d.kcal, 0) / 7), [week]);

  const startWeight = profile?.weight;
  const latestWeight = weights.length ? Number(weights[weights.length - 1].weight) : null;
  const change = latestWeight != null && startWeight != null ? Math.round((latestWeight - startWeight) * 10) / 10 : null;
  const avgAdherence = target > 0 ? Math.round((avgKcal / target) * 100) : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.weight === '' || Number.isNaN(Number(form.weight))) {
      setErrors({ weight: 'Enter your weight in kg.' });
      return;
    }
    setWeights(addWeight({ weight: Number(form.weight), date: form.date || new Date().toISOString().slice(0, 10) }));
    setForm({ weight: '', date: '' });
    setModalOpen(false);
  };

  return (
    <>
      <div className="page-head">
        <div className="eyebrow page-head__eyebrow">Your journey</div>
        <div className="page-head__row">
          <div>
            <h1 className="page-head__title">Progress</h1>
            <p className="page-head__sub">
              Watch the small signals — weight trend, logging consistency and calorie adherence.
            </p>
          </div>
          <Button icon="plus" onClick={() => setModalOpen(true)}>Log weight</Button>
        </div>
      </div>

      <div className="grid grid--stats rise">
        <StatCard
          icon="scale"
          label="Current weight"
          value={latestWeight ?? startWeight ?? '—'}
          unit="kg"
          sub={change != null ? `${change > 0 ? '+' : ''}${change} kg since start` : 'Log your first entry'}
          subTone={change != null ? (change <= 0 ? 'good' : 'bad') : undefined}
        />
        <StatCard icon="calendar" iconTone="sage" label="Logging streak" value={streak} unit="days" sub="With diary entries" />
        <StatCard
          icon="flame"
          iconTone="gold"
          label="Avg calories"
          value={avgKcal}
          unit="kcal"
          sub={`${avgAdherence}% of ${target} target`}
        />
        <StatCard icon="chart" label="Weight entries" value={weights.length} sub="All time" />
      </div>

      <div className="dash-stack">
        <Card className="rise rise--1">
          <CardHeader title="Weight trend" sub="Your logged measurements" actions={
            <Button variant="ghost" size="sm" icon="plus" onClick={() => setModalOpen(true)}>Add</Button>
          } />
          <WeightChart entries={weights} />
        </Card>

        <Card className="rise rise--2">
          <CardHeader title="Weekly adherence" sub="Last 7 days vs target" />
          <div style={{ padding: '0.5rem 1.5rem 1.5rem' }}>
            <div className="consistency" title="Days with at least one logged meal">
              <span className="consistency__label">Logging consistency</span>
              <span className="consistency__dots">
                {week.map((d) => (
                  <span
                    key={d.key}
                    className={`consistency__dot${d.kcal > 0 ? ' consistency__dot--on' : ''}`}
                    aria-hidden="true"
                  />
                ))}
              </span>
              <span className="consistency__value">
                {week.filter((d) => d.kcal > 0).length}/7 days
              </span>
            </div>
            <div className="adherence" role="img" aria-label="Daily calorie adherence for the last 7 days">
              {week.map((d) => {
                const isToday = d.key === todayKey();
                const over = target > 0 && d.kcal > target;
                return (
                  <div className={`adherence__col${isToday ? ' adherence__col--today' : ''}`} key={d.key}>
                    <span className="adherence__value">{d.kcal > 0 ? Math.round(d.kcal) : '—'}</span>
                    <div className="adherence__bar">
                      <div
                        className="adherence__fill"
                        style={{
                          height: `${d.kcal > 0 ? Math.max(d.pct, 8) : 2}%`,
                          background: over ? 'var(--ns-gold)' : undefined,
                        }}
                      />
                    </div>
                    <span className="adherence__day">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      <Card className="rise rise--2" style={{ marginTop: '1.5rem' }}>
        <CardHeader title="Weight log" sub={`${weights.length} entries`} />
        <div style={{ padding: '0.25rem 1.5rem 1.5rem' }}>
          {weights.length === 0 ? (
            <EmptyState
              icon="scale"
              title="No weight entries yet"
              body="Log your starting weight and check in a few times a week."
              action={<Button size="sm" icon="plus" onClick={() => setModalOpen(true)}>Log weight</Button>}
            />
          ) : (
            [...weights].reverse().slice(0, 12).map((w) => (
              <div className="entry-row" key={w.id}>
                <div className="entry-row__main">
                  <div className="entry-row__title">{w.weight} kg</div>
                  <div className="entry-row__meta">{formatDay(w.date)}</div>
                </div>
                <button
                  className="meal-line__remove"
                  onClick={() => setWeights(removeWeight(w.id))}
                  aria-label={`Remove entry from ${formatDay(w.date)}`}
                >
                  <Icon name="close" />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title="Log your weight"
        onClose={() => { setModalOpen(false); setErrors({}); }}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setModalOpen(false); setErrors({}); }}>Cancel</Button>
            <Button type="submit" form="weight-form" icon="check">Save entry</Button>
          </>
        }
      >
        <form id="weight-form" onSubmit={handleSubmit} noValidate>
          <Field label="Weight" htmlFor="weight-value" error={errors.weight}>
            <TextInput
              id="weight-value"
              name="weight"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="20"
              max="500"
              unit="kg"
              placeholder="68.5"
              value={form.weight}
              onChange={handleChange}
              error={errors.weight}
              autoFocus
            />
          </Field>
          <Field label="Date" htmlFor="weight-date">
            <TextInput
              id="weight-date"
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
