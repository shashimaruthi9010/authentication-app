const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

const ACTIVITY_LABELS = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly active',
  moderately_active: 'Moderately active',
  very_active: 'Very active',
  extra_active: 'Extra active',
};

const GOAL_LABELS = {
  lose_weight: 'Lose weight',
  maintain_weight: 'Maintain weight',
  gain_weight: 'Gain weight',
  improve_fitness: 'Improve fitness',
  manage_health: 'Manage a health condition',
};

const SEX_LABELS = {
  female: 'Female',
  male: 'Male',
  other: 'Other',
  prefer_not_to_say: 'Prefer not to say',
};

export function activityLabel(value) {
  return ACTIVITY_LABELS[value] || value || '—';
}

export function goalLabel(value) {
  return GOAL_LABELS[value] || value || '—';
}

export function sexLabel(value) {
  return SEX_LABELS[value] || value || '—';
}

export function round(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function calcBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const hM = heightCm / 100;
  return round(weightKg / (hM * hM), 1);
}

export function bmiCategory(bmi) {
  if (bmi == null) return null;
  if (bmi < 18.5) return { label: 'Underweight', tone: 'info' };
  if (bmi < 25) return { label: 'Healthy range', tone: 'success' };
  if (bmi < 30) return { label: 'Overweight', tone: 'warning' };
  return { label: 'Obese', tone: 'danger' };
}

export function calcBMR(weightKg, heightCm, age, sex) {
  if (!weightKg || !heightCm || !age) return null;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? round(base + 5) : round(base - 161);
}

export function calcTDEE(profile) {
  const bmr = calcBMR(profile.weight, profile.height, profile.age, profile.sex);
  if (bmr == null) return null;
  const factor = ACTIVITY_FACTORS[profile.activity_level] || 1.375;
  return Math.round(bmr * factor);
}

export function calorieTarget(tdee, goal) {
  if (tdee == null) return null;
  switch (goal) {
    case 'lose_weight': return Math.round(tdee - 400);
    case 'gain_weight': return Math.round(tdee + 300);
    default: return tdee;
  }
}

export function macroTargets(calories, goal) {
  if (!calories) return null;
  const proteinRatio = goal === 'lose_weight' ? 0.3 : goal === 'gain_weight' ? 0.22 : 0.25;
  const fatRatio = 0.27;
  const carbRatio = 1 - proteinRatio - fatRatio;
  return {
    protein: Math.round((calories * proteinRatio) / 4),
    carbs: Math.round((calories * carbRatio) / 4),
    fat: Math.round((calories * fatRatio) / 9),
  };
}

export function hydrationTarget(weightKg) {
  if (!weightKg) return 2000;
  return Math.round(weightKg * 33 / 50) * 50;
}

export function goalDescription(goal) {
  switch (goal) {
    case 'lose_weight':
      return 'A gentle 400 kcal daily deficit, prioritizing protein to protect lean mass while losing weight gradually.';
    case 'gain_weight':
      return 'A measured 300 kcal daily surplus with emphasis on nutrient-dense foods to support steady, healthy gain.';
    case 'maintain_weight':
      return 'A balanced intake matched to your energy needs, supporting stable weight and everyday energy.';
    case 'improve_fitness':
      return 'Performance-oriented fueling with adequate protein and carbohydrates to support training and recovery.';
    case 'manage_health':
      return 'Whole-food focused nutrition tuned to support your condition, with variety across all food groups.';
    default:
      return 'A balanced, whole-food approach matched to your personal measurements and lifestyle.';
  }
}

export function formatKcal(value) {
  if (value == null) return '—';
  return value.toLocaleString();
}
