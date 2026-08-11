import { read, write, todayKey, dateKey } from './store';

/* ── Food diary ───────────────────────────────────────────────── */

const DIARY_KEY = 'food_diary';

export function getDiaryDay(dateKey) {
  const diary = read(DIARY_KEY, {});
  return diary[dateKey] || [];
}

function saveDiaryDay(dateKey, meals) {
  const diary = read(DIARY_KEY, {});
  diary[dateKey] = meals;
  write(DIARY_KEY, diary);
}

export function addMeal(dateKey, meal) {
  const meals = [...getDiaryDay(dateKey), { id: crypto.randomUUID?.() || `${Date.now()}`, ...meal }];
  saveDiaryDay(dateKey, meals);
  return meals;
}

export function removeMeal(dateKey, id) {
  const meals = getDiaryDay(dateKey).filter((m) => m.id !== id);
  saveDiaryDay(dateKey, meals);
  return meals;
}

export function dayTotals(meals) {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (Number(m.calories) || 0),
      protein: acc.protein + (Number(m.protein) || 0),
      carbs: acc.carbs + (Number(m.carbs) || 0),
      fat: acc.fat + (Number(m.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function diaryStreak() {
  const diary = read(DIARY_KEY, {});
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 366; i += 1) {
    const key = dateKey(cursor);
    if (Array.isArray(diary[key]) && diary[key].length > 0) streak += 1;
    else if (i > 0) break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function weekCalorieSummary(target) {
  const diary = read(DIARY_KEY, {});
  const days = [];
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);
  monday.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const key = dateKey(date);
    const meals = diary[key] || [];
    const kcal = meals.reduce((a, m) => a + (Number(m.calories) || 0), 0);
    days.push({
      key,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
      kcal,
      pct: target > 0 ? Math.min(100, Math.round((kcal / target) * 100)) : 0,
    });
  }
  return days;
}

/* ── Symptoms ─────────────────────────────────────────────────── */

const SYMPTOMS_KEY = 'symptoms';

export function getSymptoms() {
  const list = read(SYMPTOMS_KEY, []);
  return list.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function addSymptom(entry) {
  const list = [
    { id: crypto.randomUUID?.() || `${Date.now()}`, date: todayKey(), ...entry },
    ...getSymptoms(),
  ];
  write(SYMPTOMS_KEY, list);
  return list;
}

export function removeSymptom(id) {
  const list = getSymptoms().filter((s) => s.id !== id);
  write(SYMPTOMS_KEY, list);
  return list;
}

/* ── Lab results ──────────────────────────────────────────────── */

const LABS_KEY = 'lab_results';

export function getLabs() {
  const list = read(LABS_KEY, []);
  return list.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function addLab(entry) {
  const list = [
    { id: crypto.randomUUID?.() || `${Date.now()}`, date: todayKey(), ...entry },
    ...getLabs(),
  ];
  write(LABS_KEY, list);
  return list;
}

export function removeLab(id) {
  const list = getLabs().filter((l) => l.id !== id);
  write(LABS_KEY, list);
  return list;
}

export function labStatus(value, min, max) {
  const v = Number(value);
  if (Number.isNaN(v)) return null;
  if (min != null && max != null && v >= Number(min) && v <= Number(max)) return 'in-range';
  if (max != null && v > Number(max)) return 'high';
  if (min != null && v < Number(min)) return 'low';
  return 'in-range';
}

export const labStatusMeta = {
  'in-range': { label: 'In range', tone: 'success' },
  high: { label: 'High', tone: 'danger' },
  low: { label: 'Low', tone: 'info' },
};

/* ── Weight log ───────────────────────────────────────────────── */

const WEIGHT_KEY = 'weight_log';

export function getWeights() {
  return read(WEIGHT_KEY, []).sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function addWeight(entry) {
  const list = [...getWeights(), { id: crypto.randomUUID?.() || `${Date.now()}`, date: todayKey(), ...entry }];
  write(WEIGHT_KEY, list);
  return list;
}

export function removeWeight(id) {
  const list = getWeights().filter((w) => w.id !== id);
  write(WEIGHT_KEY, list);
  return list;
}

/* ── Assessment ───────────────────────────────────────────────── */

const ASSESSMENT_KEY = 'assessment';

export function getAssessment() {
  return read(ASSESSMENT_KEY, null);
}

export function saveAssessment(data) {
  write(ASSESSMENT_KEY, { ...data, generated_at: new Date().toISOString() });
  return getAssessment();
}
