import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader } from '../components/ui/Card';
import ProgressRing from '../components/ui/ProgressRing';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { getUserProfile } from '../utils/profile';
import { todayKey, dateKey, formatDay } from '../utils/store';
import {
  getDiaryDay, dayTotals, getWeights, getSymptoms, getAssessment,
} from '../utils/data';
import {
  calcTDEE, calorieTarget, macroTargets,
  hydrationTarget, activityLabel, formatKcal,
} from '../utils/health';

const MICRO_WATCHLIST = [
  { key: 'iron', label: 'Iron', ref: '18 mg', icon: 'target' },
  { key: 'calcium', label: 'Calcium', ref: '1000 mg', icon: 'shield' },
  { key: 'vitamin_d', label: 'Vitamin D', ref: '20 µg', icon: 'sun' },
  { key: 'vitamin_b12', label: 'Vitamin B12', ref: '2.4 µg', icon: 'sparkles' },
  { key: 'folate', label: 'Folate', ref: '400 µg', icon: 'leaf' },
  { key: 'vitamin_a', label: 'Vitamin A', ref: '900 µg', icon: 'heart' },
];

const MACRO_ICONS = { calories: 'flame', protein: 'sparkles', carbs: 'bowl', fat: 'droplet' };

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Good evening';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function todayLong() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function heroCopy(pct, mealsLogged, target) {
  if (mealsLogged === 0) {
    return {
      title: 'Nothing logged yet',
      body: 'Your day is a blank page. Log one meal and your snapshot starts to take shape.',
    };
  }
  if (pct < 50) {
    return { title: 'A gentle start', body: `You've logged ${pct}% of your ${formatKcal(target)} kcal target so far today.` };
  }
  if (pct < 90) {
    return { title: 'Great momentum', body: `You're at ${pct}% of today's target — close to the mark, and the day isn't over.` };
  }
  if (pct <= 105) {
    return { title: 'Right on target', body: `You've reached today's ${formatKcal(target)} kcal goal. Steady, consistent work.` };
  }
  return { title: 'Above target today', body: `You're at ${pct}% of your target. No stress — tomorrow is a fresh start.` };
}

export default function Dashboard() {
  const profile = getUserProfile();
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);

  const tdee = calcTDEE(profile) || 0;
  const target = calorieTarget(tdee, profile?.health_goal) || 0;
  const macros = macroTargets(target, profile?.health_goal) || {};
  const waterGoal = hydrationTarget(profile?.weight);

  const today = todayKey();
  const meals = getDiaryDay(today);
  const totals = dayTotals(meals);
  const caloriePct = target > 0 ? Math.min(150, Math.round((totals.calories / target) * 100)) : 0;
  const pctForBar = Math.min(100, caloriePct);
  const proteinPct = macros.protein > 0 ? Math.min(100, Math.round((totals.protein / macros.protein) * 100)) : 0;
  const carbPct = macros.carbs > 0 ? Math.min(100, Math.round((totals.carbs / macros.carbs) * 100)) : 0;
  const fatPct = macros.fat > 0 ? Math.min(100, Math.round((totals.fat / macros.fat) * 100)) : 0;

  const assessed = Boolean(getAssessment());
  const weights = getWeights();
  const symptoms = getSymptoms();
  const symptomsThisWeek = symptoms.filter((s) => s.date >= dateKey(new Date(Date.now() - 6 * 86400000)));

  const focus = useMemo(() => {
    const items = [];
    if (meals.length === 0) items.push({ to: '/food-diary', icon: 'bowl', title: 'Log your first meal', desc: 'Start building today\u2019s picture.' });
    if (!assessed) items.push({ to: '/assessment', icon: 'sparkles', title: 'Complete your assessment', desc: 'Turn your profile into daily guidance.' });
    if (weights.length === 0) items.push({ to: '/progress', icon: 'scale', title: 'Log your starting weight', desc: 'A baseline makes your trend visible.' });
    if (symptomsThisWeek.length === 0) items.push({ to: '/symptoms', icon: 'activity', title: 'Check in with symptoms', desc: 'A two-minute check keeps patterns clear.' });
    if (items.length === 0) {
      items.push({ to: '/food-diary', icon: 'bowl', title: 'Keep logging meals', desc: 'Consistency reveals what works for you.' });
      items.push({ to: '/progress', icon: 'chart', title: 'Review your progress', desc: 'See how your week is shaping up.' });
    }
    return items.slice(0, 4);
  }, [meals.length, assessed, weights.length, symptomsThisWeek.length]);

  const activity = useMemo(() => {
    const rows = [];
    for (let i = 0; i < 5; i += 1) {
      const d = new Date(Date.now() - i * 86400000);
      const key = dateKey(d);
      const dayMeals = getDiaryDay(key);
      if (dayMeals.length === 0) continue;
      dayMeals.forEach((m) => rows.push({
        id: `d-${key}-${m.id}`, icon: 'bowl', title: m.name,
        meta: `${formatDay(key)} · ${m.meal}`, value: `${m.calories || 0} kcal`, date: key,
      }));
    }
    symptoms.slice(0, 4).forEach((s) => rows.push({
      id: `s-${s.id}`, icon: 'activity', title: s.name,
      meta: `${formatDay(s.date)} · severity ${s.severity}/5`, value: '', date: s.date,
    }));
    return rows.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8);
  }, [symptoms]);

  const insights = useMemo(() => {
    const list = [];
    if (meals.length > 0 && macros.protein && totals.protein < macros.protein * 0.6) {
      list.push({ icon: 'sparkles', text: `Protein is running below your ${macros.protein}g target — adding a protein-rich food to your next meal can help.` });
    }
    if (meals.length > 0) {
      list.push({ icon: 'checkCircle', text: `You've logged ${meals.length} ${meals.length === 1 ? 'meal' : 'meals'} today — consistency builds the signal.` });
    }
    if (weights.length > 0 && profile?.weight) {
      const latest = Number(weights[weights.length - 1].weight);
      const change = Math.round((latest - Number(profile.weight)) * 10) / 10;
      if (change !== 0) {
        list.push({ icon: 'scale', text: `Your weight is ${change > 0 ? '+' : ''}${change} kg since you started tracking.` });
      }
    }
    if (symptomsThisWeek.length > 0) {
      const avg = Math.round((symptomsThisWeek.reduce((a, s) => a + s.severity, 0) / symptomsThisWeek.length) * 10) / 10;
      list.push({ icon: 'activity', text: `Average symptom severity this week is ${avg}/5 across ${symptomsThisWeek.length} entries.` });
    }
    if (list.length === 0) {
      list.push({ icon: 'leaf', text: 'Everything is in motion. Log a meal or two, and your insights will start to appear.' });
    }
    return list;
  }, [meals.length, totals.protein, macros, weights, profile, symptomsThisWeek.length]);

  const firstName = storedUser?.first_name || 'there';
  const status = heroCopy(caloriePct, meals.length, target);

  const macroRows = [
    { key: 'calories', label: 'Calories', value: formatKcal(totals.calories), unit: '', pct: pctForBar, targetValue: formatKcal(target), tone: 'primary' },
    { key: 'protein', label: 'Protein', value: totals.protein, unit: 'g', pct: proteinPct, targetValue: `${macros.protein ?? '—'}g`, tone: 'sage' },
    { key: 'carbs', label: 'Carbs', value: totals.carbs, unit: 'g', pct: carbPct, targetValue: `${macros.carbs ?? '—'}g`, tone: 'gold' },
    { key: 'fat', label: 'Fat', value: totals.fat, unit: 'g', pct: fatPct, targetValue: `${macros.fat ?? '—'}g`, tone: 'neutral' },
  ];

  return (
    <div id="dashboard-page">
      <div className="page-head dash-hello">
        <div className="eyebrow dash-hello__eyebrow">
          <span id="user-last-name">{storedUser?.last_name || ''}</span>
          {' '}· {todayLong()}
        </div>
        <h1 className="dash-hello__title" id="welcome-message">
          {greeting()}, <em className="dash-hello__name" id="user-first-name">{firstName}</em>
        </h1>
        <p className="dash-hello__sub">Here&apos;s your health snapshot for today.</p>
      </div>

      <Card className="hero rise">
        <div className="hero__main">
          <div className="hero__ring-wrap">
            <ProgressRing
              value={caloriePct}
              tone={caloriePct >= 100 ? 'sage' : 'primary'}
              size={148}
              stroke={10}
              label="Calories eaten today"
            >
              <div className="hero__ring-value">{caloriePct}%</div>
              <div className="hero__ring-label">of target</div>
            </ProgressRing>
          </div>
          <div className="hero__copy">
            <div className="hero__eyebrow">
              <Badge tone={caloriePct >= 100 ? 'success' : 'sage'} dot>
                {meals.length === 0 ? 'Ready to log' : caloriePct >= 100 ? 'Target reached' : 'In progress'}
              </Badge>
            </div>
            <h2 className="hero__status">{status.title}</h2>
            <p className="hero__body">{status.body}</p>
          </div>
        </div>
        <div className="hero__stats">
          <div className="hero-stat">
            <span className="hero-stat__icon"><Icon name="flame" /></span>
            <div className="hero-stat__main">
              <div className="hero-stat__value">{formatKcal(totals.calories)} <span className="hero-stat__unit">kcal</span></div>
              <div className="hero-stat__label">Logged · target {formatKcal(target)}</div>
            </div>
          </div>
          <div className="hero-stat">
            <span className="hero-stat__icon"><Icon name="sparkles" /></span>
            <div className="hero-stat__main">
              <div className="hero-stat__value">{totals.protein} <span className="hero-stat__unit">g</span></div>
              <div className="hero-stat__label">Protein · {macros.protein ?? '—'}g target</div>
            </div>
          </div>
          <div className="hero-stat">
            <span className="hero-stat__icon"><Icon name="droplet" /></span>
            <div className="hero-stat__main">
              <div className="hero-stat__value">{waterGoal.toLocaleString()} <span className="hero-stat__unit">ml</span></div>
              <div className="hero-stat__label">Hydration · {activityLabel(profile?.activity_level).toLowerCase()}</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="section-head rise rise--1">
        <div className="section-head__title">Today&apos;s priorities</div>
        <div className="section-head__sub">Highest priority first — work down the list.</div>
      </div>
      <div className="focus-grid rise rise--1">
        {focus.map((f, i) => (
          <Link to={f.to} className={`focus-card${i === 0 ? ' focus-card--top' : ''}`} key={f.title}>
            <span className="focus-card__rank" aria-hidden="true">{i + 1}</span>
            <span className="focus-card__icon"><Icon name={f.icon} /></span>
            <span className="focus-card__text">
              <span className="focus-card__title">{f.title}</span>
              <span className="focus-card__desc">{f.desc}</span>
            </span>
            <span className="focus-card__arrow"><Icon name="arrowRight" size={16} /></span>
          </Link>
        ))}
      </div>

      <div className="dash-stack">
        <Card className="rise rise--1">
          <CardHeader title="Nutrition snapshot" sub="Today vs your personalized targets" />
          <div className="card__body">
            {meals.length === 0 ? (
              <EmptyState
                icon="flame"
                title="No nutrition data yet"
                body="Log a meal to start comparing your intake against your daily targets."
                action={
                  <Link to="/food-diary">
                    <Button variant="secondary" size="sm" icon="plus">Log a meal</Button>
                  </Link>
                }
              />
            ) : (
              <div className="nutri-strip">
                {macroRows.map((m) => (
                  <div className="nutri-strip__row" key={m.key}>
                    <span className="nutri-strip__icon" aria-hidden="true"><Icon name={MACRO_ICONS[m.key]} /></span>
                    <span className="nutri-strip__label">{m.label}</span>
                    <span className="nutri-strip__track">
                      <span
                        className={`nutri-strip__fill${m.tone !== 'primary' ? ` nutri-strip__fill--${m.tone}` : ''}`}
                        style={{ width: `${m.pct}%` }}
                      />
                    </span>
                    <span className="nutri-strip__value">
                      {m.value}{m.unit} <span className="nutri-strip__target">/ {m.targetValue}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="rise rise--2">
          <CardHeader title="Insights" sub="Based on what you've tracked" />
          <div className="card__body">
            <div className="insight-list">
              {insights.map((ins, i) => (
                <div className="insight-row" key={i}>
                  <span className="insight-row__icon"><Icon name={ins.icon} /></span>
                  <p className="insight-row__text">{ins.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="rise rise--3">
          <CardHeader
            title="Micronutrient watchlist"
            sub="Daily reference intakes — general guidance"
          />
          <div className="card__body">
            <div className="micro-grid">
              {MICRO_WATCHLIST.map((m) => (
                <div className="micro-tile" key={m.key}>
                  <span className="micro-tile__icon"><Icon name={m.icon} /></span>
                  <span className="micro-tile__meta">
                    <span className="micro-tile__label">{m.label}</span>
                    <span className="micro-tile__value">{m.ref}</span>
                  </span>
                  <span className="micro-tile__status">Daily reference</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="rise rise--3">
          <CardHeader title="Recent activity" sub="Your latest tracked moments, in order" />
          <div className="card__body">
            {activity.length === 0 ? (
              <EmptyState
                icon="clock"
                title="No activity yet"
                body="Meals, symptoms and weight checks will gather here as you track."
                action={
                  <Link to="/food-diary">
                    <Button size="sm" icon="plus">Start tracking</Button>
                  </Link>
                }
              />
            ) : (
              <div className="activity-list">
                {activity.map((a) => (
                  <div className="activity-row" key={a.id}>
                    <span className="activity-row__icon"><Icon name={a.icon} /></span>
                    <span className="activity-row__main">
                      <span className="activity-row__title">{a.title}</span>
                      <span className="activity-row__meta">{a.meta}</span>
                    </span>
                    {a.value && <span className="activity-row__value">{a.value}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
