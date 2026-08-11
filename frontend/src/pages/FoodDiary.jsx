import { useState, useMemo } from 'react';
import Card, { CardHeader } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Field, TextInput } from '../components/ui/Field';
import Icon from '../components/ui/Icon';
import { getUserProfile } from '../utils/profile';
import { todayKey, shiftDay, formatDay } from '../utils/store';
import { getDiaryDay, addMeal, removeMeal, dayTotals } from '../utils/data';
import { calorieTarget, calcTDEE, macroTargets, formatKcal } from '../utils/health';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const MEAL_ICONS = { Breakfast: 'sun', Lunch: 'bowl', Dinner: 'fork', Snack: 'sparkles' };
const MEAL_TONES = { Breakfast: '', Lunch: 'gold', Dinner: '', Snack: 'sage' };

const EMPTY_FORM = { name: '', meal: 'Breakfast', calories: '', protein: '', carbs: '', fat: '' };

function MealGroup({ label, icon, meals, tone, onRemove }) {
  const groupTotals = dayTotals(meals);
  return (
    <div className="meal-group">
      <div className="meal-group__head">
        <span className={`meal-group__badge${tone ? ` meal-group__badge--${tone}` : ''}`}>
          <Icon name={icon} />
        </span>
        <span className="meal-group__label">{label}</span>
        <span className="meal-group__count">{meals.length} {meals.length === 1 ? 'entry' : 'entries'}</span>
        <span className="meal-group__kcal">{formatKcal(groupTotals.calories)} kcal</span>
      </div>
      {meals.map((meal) => (
        <div className="meal-line" key={meal.id}>
          <div className="meal-line__main">
            <div className="meal-line__name">{meal.name}</div>
            <div className="meal-line__meta">
              P {meal.protein || 0}g · C {meal.carbs || 0}g · F {meal.fat || 0}g
            </div>
          </div>
          <div className="meal-line__kcal">{meal.calories || 0} kcal</div>
          <button
            className="meal-line__remove"
            onClick={() => onRemove(meal.id)}
            aria-label={`Remove ${meal.name}`}
          >
            <Icon name="close" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function FoodDiary() {
  const profile = getUserProfile();
  const [day, setDay] = useState(() => todayKey());
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const meals = useMemo(() => getDiaryDay(day), [day]);
  const totals = useMemo(() => dayTotals(meals), [meals]);
  const isToday = day === todayKey();

  const target = calorieTarget(calcTDEE(profile), profile?.health_goal) || 0;
  const macros = macroTargets(target, profile?.health_goal) || {};
  const kcalPct = target > 0 ? Math.round((totals.calories / target) * 100) : 0;

  const filtered = useMemo(() => {
    if (!query.trim()) return meals;
    const q = query.trim().toLowerCase();
    return meals.filter((m) => m.name.toLowerCase().includes(q));
  }, [meals, query]);

  const grouped = useMemo(() => (
    MEAL_TYPES.map((type) => ({
      type,
      items: filtered.filter((m) => m.meal === type),
    }))
  ), [filtered]);

  const shownTotal = filtered.length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Give this meal a name.';
    if (!form.calories || Number(form.calories) <= 0) next.calories = 'Enter calories.';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    addMeal(day, {
      name: form.name.trim(),
      meal: form.meal,
      calories: Number(form.calories),
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    });
    setForm(EMPTY_FORM);
    setQuery('');
    setModalOpen(false);
  };

  return (
    <>
      <div className="page-head">
        <div className="eyebrow page-head__eyebrow">Nutrition tracking</div>
        <div className="page-head__row">
          <div>
            <h1 className="page-head__title">Food Diary</h1>
            <p className="page-head__sub">
              Log what you eat and see how it lines up with your daily targets.
            </p>
          </div>
          <div className="page-actions">
            <div className="date-bar">
              <button className="date-bar__btn" onClick={() => setDay((d) => shiftDay(d, -1))} aria-label="Previous day">
                <Icon name="chevronLeft" />
              </button>
              <span className="date-bar__label">
                {formatDay(day)}
                {isToday && <span className="date-bar__today"> · Today</span>}
              </span>
              <button
                className="date-bar__btn"
                onClick={() => setDay((d) => shiftDay(d, 1))}
                aria-label="Next day"
                disabled={isToday}
              >
                <Icon name="chevronRight" />
              </button>
            </div>
            <Button icon="plus" onClick={() => setModalOpen(true)}>Log meal</Button>
          </div>
        </div>
      </div>

      <div className="grid grid--stats rise">
        <StatCard
          icon="flame"
          iconTone="gold"
          label="Calories"
          value={formatKcal(totals.calories)}
          sub={`${kcalPct}% of ${formatKcal(target)} target`}
        />
        <StatCard icon="sparkles" label="Protein" value={totals.protein} unit="g" sub={`${macros.protein ?? '—'}g target`} />
        <StatCard icon="bowl" iconTone="sage" label="Carbs" value={totals.carbs} unit="g" sub={`${macros.carbs ?? '—'}g target`} />
        <StatCard icon="droplet" label="Fat" value={totals.fat} unit="g" sub={`${macros.fat ?? '—'}g target`} />
      </div>

      <Card className="rise rise--1" style={{ marginTop: '1.5rem' }}>
        <CardHeader
          title={`Meals · ${formatDay(day)}`}
          sub={shownTotal === 0 ? 'Nothing logged' : `${shownTotal} ${shownTotal === 1 ? 'entry' : 'entries'}`}
          actions={
            <div className="diary-search">
              <Icon name="search" />
              <input
                type="search"
                className="diary-search__input"
                placeholder="Search meals…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search meals"
              />
            </div>
          }
        />
        <div className="card__body">
          {meals.length === 0 ? (
            <EmptyState
              icon="bowl"
              title="No meals logged for this day"
              body="Add your first meal to start building today's picture — every entry counts toward your targets."
              action={<Button size="sm" icon="plus" onClick={() => setModalOpen(true)}>Log a meal</Button>}
            />
          ) : shownTotal === 0 ? (
            <EmptyState
              icon="search"
              title="No matching meals"
              body={`Nothing on this day matches "${query}". Try a different search.`}
              action={<Button variant="secondary" size="sm" onClick={() => setQuery('')}>Clear search</Button>}
            />
          ) : (
            <>
              {grouped.filter((g) => g.items.length > 0).map((g) => (
                <MealGroup
                  key={g.type}
                  label={g.type}
                  icon={MEAL_ICONS[g.type]}
                  tone={MEAL_TONES[g.type]}
                  meals={g.items}
                  onRemove={(id) => removeMeal(day, id)}
                />
              ))}
              <div className="total-tile" style={{ marginTop: '1.25rem' }}>
                <div>
                  <div className="total-tile__label">Daily total</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ns-text-3)', marginTop: 2 }}>
                    {target ? `${Math.round((totals.calories / target) * 100)}% of target` : 'Estimated'}
                  </div>
                </div>
                <div className="total-tile__value">
                  {formatKcal(totals.calories)} <span style={{ fontSize: '0.9rem', color: 'var(--ns-primary-600)' }}>kcal</span>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title="Log a meal"
        onClose={() => { setModalOpen(false); setErrors({}); }}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setModalOpen(false); setErrors({}); }}>Cancel</Button>
            <Button type="submit" form="meal-form" icon="check">Save meal</Button>
          </>
        }
      >
        <form id="meal-form" onSubmit={handleSubmit} noValidate>
          <Field label="Meal" htmlFor="meal-type" error={errors.meal}>
            <div className="segmented" style={{ gridTemplateColumns: `repeat(${MEAL_TYPES.length}, 1fr)` }}>
              {MEAL_TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`segmented__btn${form.meal === t ? ' segmented__btn--active' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, meal: t }))}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Meal name" htmlFor="meal-name" error={errors.name}>
            <TextInput
              id="meal-name"
              name="name"
              placeholder="Oatmeal with berries"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              autoFocus
            />
          </Field>

          <Field label="Calories" htmlFor="meal-calories" error={errors.calories}>
            <TextInput
              id="meal-calories"
              name="calories"
              type="number"
              inputMode="numeric"
              min="0"
              unit="kcal"
              placeholder="320"
              value={form.calories}
              onChange={handleChange}
              error={errors.calories}
            />
          </Field>

          <div className="form-grid">
            <Field label="Protein (g)" htmlFor="meal-protein" error={errors.protein}>
              <TextInput
                id="meal-protein"
                name="protein"
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="14"
                value={form.protein}
                onChange={handleChange}
                error={errors.protein}
              />
            </Field>
            <Field label="Carbs (g)" htmlFor="meal-carbs" error={errors.carbs}>
              <TextInput
                id="meal-carbs"
                name="carbs"
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="48"
                value={form.carbs}
                onChange={handleChange}
                error={errors.carbs}
              />
            </Field>
          </div>

          <Field label="Fat (g)" htmlFor="meal-fat" error={errors.fat}>
            <TextInput
              id="meal-fat"
              name="fat"
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="9"
              value={form.fat}
              onChange={handleChange}
              error={errors.fat}
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}
