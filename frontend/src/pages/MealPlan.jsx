import { useState, useMemo } from 'react';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { getUserProfile } from '../utils/profile';
import { todayKey, dateKey } from '../utils/store';
import { addMeal } from '../utils/data';
import { calorieTarget, calcTDEE, goalLabel, formatKcal } from '../utils/health';

const PLANS = {
  lose_weight: {
    breakfast: [
      { name: 'Greek yogurt bowl', desc: 'Plain Greek yogurt with mixed berries, chia seeds and a light sprinkle of granola.', protein: 24, carbs: 26, fat: 6 },
      { name: 'Spinach omelette', desc: 'Two-egg omelette folded around spinach, tomato and feta, with a slice of wholegrain toast.', protein: 22, carbs: 18, fat: 11 },
      { name: 'Overnight oats', desc: 'Rolled oats soaked in almond milk with grated apple, cinnamon and a spoon of almond butter.', protein: 13, carbs: 42, fat: 8 },
    ],
    lunch: [
      { name: 'Quinoa power salad', desc: 'Quinoa, roasted chickpeas, cucumber, tomato and a lemon-tahini dressing.', protein: 20, carbs: 46, fat: 12 },
      { name: 'Chicken & vegetable bowl', desc: 'Grilled chicken breast over sautéed greens and brown rice with a yogurt sauce.', protein: 38, carbs: 40, fat: 9 },
      { name: 'Lentil soup + bread', desc: 'Hearty red lentil and vegetable soup with a small wholegrain roll.', protein: 18, carbs: 45, fat: 5 },
    ],
    dinner: [
      { name: 'Salmon & greens', desc: 'Baked salmon fillet with steamed broccoli, asparagus and a squeeze of lemon.', protein: 34, carbs: 12, fat: 18 },
      { name: 'Turkey stir-fry', desc: 'Lean turkey strips stir-fried with mixed vegetables and cauliflower rice.', protein: 32, carbs: 18, fat: 10 },
      { name: 'Ratatouille & white beans', desc: 'Slow-cooked vegetable ratatouille with creamy white beans and fresh basil.', protein: 15, carbs: 38, fat: 8 },
    ],
    snack: [
      { name: 'Apple & walnuts', desc: 'A crisp apple with a small handful of walnuts.', protein: 4, carbs: 22, fat: 9 },
      { name: 'Cottage cheese cup', desc: 'Cottage cheese with a few slices of cucumber and black pepper.', protein: 14, carbs: 5, fat: 3 },
    ],
  },
  maintain_weight: {
    breakfast: [
      { name: 'Avocado toast', desc: 'Wholegrain toast topped with smashed avocado, poached egg and chili flakes.', protein: 15, carbs: 32, fat: 16 },
      { name: 'Fruit & nut porridge', desc: 'Porridge with banana slices, mixed berries and a scatter of pumpkin seeds.', protein: 12, carbs: 48, fat: 9 },
      { name: 'Breakfast burrito', desc: 'Whole-wheat tortilla with scrambled egg, black beans and a little cheese.', protein: 22, carbs: 38, fat: 14 },
    ],
    lunch: [
      { name: 'Buddha-style bowl', desc: 'Roasted sweet potato, edamame, red cabbage and brown rice with tahini.', protein: 18, carbs: 52, fat: 14 },
      { name: 'Tuna & bean salad', desc: 'Tuna, cannellini beans, red onion and parsley with olive oil and vinegar.', protein: 30, carbs: 30, fat: 12 },
      { name: 'Wholegrain pasta', desc: 'Pasta with a rich tomato and lentil sauce, finished with parmesan.', protein: 22, carbs: 60, fat: 10 },
    ],
    dinner: [
      { name: 'Chicken traybake', desc: 'Roasted chicken thighs with potatoes, peppers and rosemary.', protein: 32, carbs: 40, fat: 16 },
      { name: 'Fish tacos', desc: 'Grilled white fish in soft corn tortillas with cabbage slaw and lime crema.', protein: 28, carbs: 34, fat: 12 },
      { name: 'Mushroom risotto', desc: 'Creamy arborio risotto with sautéed mushrooms and a parmesan shaving.', protein: 14, carbs: 62, fat: 14 },
    ],
    snack: [
      { name: 'Greek yogurt & honey', desc: 'Greek yogurt with a drizzle of honey and chopped almonds.', protein: 16, carbs: 14, fat: 6 },
      { name: 'Hummus & veg sticks', desc: 'Creamy hummus with carrot, cucumber and pepper sticks.', protein: 6, carbs: 16, fat: 7 },
    ],
  },
  gain_weight: {
    breakfast: [
      { name: 'Protein oats', desc: 'Oats cooked with whole milk, banana, whey protein and peanut butter.', protein: 34, carbs: 62, fat: 16 },
      { name: 'Big breakfast plate', desc: 'Three-egg scramble, avocado, grilled tomato and two slices of wholegrain toast.', protein: 26, carbs: 42, fat: 24 },
      { name: 'Smoothie bowl', desc: 'Blended banana, berries, oats, milk and protein, topped with granola and seeds.', protein: 28, carbs: 60, fat: 12 },
    ],
    lunch: [
      { name: 'Loaded rice bowl', desc: 'Brown rice with chicken, avocado, edamame and a sesame-soy dressing.', protein: 40, carbs: 70, fat: 20 },
      { name: 'Peanut noodle salad', desc: 'Whole-wheat noodles, tofu, peanut sauce and crunchy vegetables.', protein: 24, carbs: 66, fat: 18 },
      { name: 'Steak & sweet potato', desc: 'Grilled lean steak with a baked sweet potato and garlic butter greens.', protein: 42, carbs: 48, fat: 16 },
    ],
    dinner: [
      { name: 'Beef chilli & rice', desc: 'Rich beef chilli with kidney beans over a generous portion of rice.', protein: 40, carbs: 72, fat: 18 },
      { name: 'Salmon & roast potatoes', desc: 'Salmon fillet with crispy roast potatoes, peas and a yogurt dill sauce.', protein: 36, carbs: 58, fat: 20 },
      { name: 'Pesto pasta & chicken', desc: 'Whole-wheat pasta with chicken breast, basil pesto and cherry tomatoes.', protein: 38, carbs: 64, fat: 18 },
    ],
    snack: [
      { name: 'Trail mix', desc: 'A generous handful of nuts, seeds and dried fruit.', protein: 8, carbs: 26, fat: 16 },
      { name: 'Peanut butter toast', desc: 'Two wholegrain slices with peanut butter and banana.', protein: 14, carbs: 38, fat: 16 },
      { name: 'Protein shake', desc: 'Whey shake blended with milk and a frozen banana.', protein: 30, carbs: 30, fat: 4 },
    ],
  },
  improve_fitness: {
    breakfast: [
      { name: 'Pre-training oats', desc: 'Oats with milk, banana, honey and a scoop of protein.', protein: 28, carbs: 58, fat: 8 },
      { name: 'Egg & avocado plate', desc: 'Scrambled eggs, avocado and wholegrain toast.', protein: 24, carbs: 30, fat: 18 },
    ],
    lunch: [
      { name: 'Chicken rice bowl', desc: 'Grilled chicken with brown rice, peppers and a drizzle of olive oil.', protein: 42, carbs: 55, fat: 12 },
      { name: 'Salmon & quinoa', desc: 'Baked salmon, quinoa, spinach and cherry tomatoes with lemon.', protein: 36, carbs: 46, fat: 16 },
    ],
    dinner: [
      { name: 'Turkey bolognese', desc: 'Lean turkey bolognese over whole-wheat pasta with a side salad.', protein: 38, carbs: 54, fat: 10 },
      { name: 'Steak fajita bowl', desc: 'Flank steak strips with peppers, onions, rice and guacamole.', protein: 40, carbs: 48, fat: 18 },
    ],
    snack: [
      { name: 'Cottage cheese & crackers', desc: 'High-protein cottage cheese with wholegrain crackers.', protein: 18, carbs: 20, fat: 4 },
      { name: 'Energy balls', desc: 'Date, oat and peanut butter energy balls.', protein: 8, carbs: 26, fat: 8 },
    ],
  },
  manage_health: {
    breakfast: [
      { name: 'Berry smoothie bowl', desc: 'Antioxidant-rich smoothie with mixed berries, spinach and flaxseed.', protein: 12, carbs: 38, fat: 8 },
      { name: 'Wholegrain toast & egg', desc: 'Wholegrain toast with a soft-boiled egg and grilled tomatoes.', protein: 14, carbs: 30, fat: 10 },
    ],
    lunch: [
      { name: 'Rainbow salad', desc: 'Mixed greens, beets, carrots, chickpeas and pumpkin seeds with olive oil.', protein: 14, carbs: 34, fat: 14 },
      { name: 'Lentil & vegetable curry', desc: 'Gentle coconut-lentil curry with basmati rice and cilantro.', protein: 18, carbs: 52, fat: 10 },
    ],
    dinner: [
      { name: 'Baked white fish', desc: 'Baked white fish with steamed greens, sweet potato and dill.', protein: 32, carbs: 28, fat: 8 },
      { name: 'Vegetable & tofu stir-fry', desc: 'Tofu and vegetables stir-fried with ginger, garlic and a light sauce.', protein: 22, carbs: 32, fat: 12 },
    ],
    snack: [
      { name: 'Apple & cinnamon tea', desc: 'A crisp apple alongside a warm cup of cinnamon tea.', protein: 0, carbs: 24, fat: 0 },
      { name: 'Edamame', desc: 'Steamed edamame with a pinch of sea salt.', protein: 11, carbs: 10, fat: 5 },
    ],
  },
};

const SLOT_ICONS = { breakfast: 'sun', lunch: 'bowl', dinner: 'fork', snack: 'sparkles' };
const SLOT_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
const DAYS = 7;

function slotKcal(meal) {
  return Math.round(meal.protein * 4 + meal.carbs * 4 + meal.fat * 9);
}

export default function MealPlan() {
  const profile = getUserProfile();
  const goal = profile?.health_goal || 'maintain_weight';
  const target = calorieTarget(calcTDEE(profile), goal);

  const [day, setDay] = useState(1);
  const [seed, setSeed] = useState(7);
  const [added, setAdded] = useState({});

  const weekdays = useMemo(() => {
    const today = new Date();
    const base = today.getDay() === 0 ? 6 : today.getDay() - 1;
    return Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(today.getTime() + (i - base) * 86400000);
      return {
        index: i + 1,
        short: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
        isToday: dateKey(d) === todayKey(),
      };
    });
  }, []);

  const plan = useMemo(() => {
    const base = PLANS[goal] || PLANS.maintain_weight;
    const picks = {};
    let kcal = 0;
    Object.entries(base).forEach(([slot, options]) => {
      const meal = options[(seed + day - 1) % options.length];
      picks[slot] = meal;
      kcal += slotKcal(meal);
    });
    return { picks, kcal };
  }, [goal, day, seed]);

  const handleAdd = (slot, meal) => {
    addMeal(todayKey(), {
      name: meal.name,
      meal: SLOT_LABELS[slot],
      calories: slotKcal(meal),
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
    });
    setAdded((prev) => ({ ...prev, [slot]: true }));
    window.setTimeout(() => {
      setAdded((prev) => ({ ...prev, [slot]: false }));
    }, 1600);
  };

  return (
    <>
      <div className="page-head">
        <div className="eyebrow page-head__eyebrow">Personalized eating</div>
        <div className="page-head__row">
          <div>
            <h1 className="page-head__title">Meal Plan</h1>
            <p className="page-head__sub">
              A practical day of meals built around {goalLabel(goal).toLowerCase()}.
            </p>
          </div>
          <Button variant="secondary" icon="refresh" onClick={() => setSeed((s) => s + 1)}>
            Shuffle plan
          </Button>
        </div>
      </div>

      <div className="day-tabs rise">
        <div className="tabs tabs--week" role="tablist" aria-label="Select a day">
          {weekdays.map((w) => (
            <button
              key={w.index}
              role="tab"
              aria-selected={day === w.index}
              className={`tabs__tab${day === w.index ? ' tabs__tab--active' : ''}${w.isToday ? ' tabs__tab--today' : ''}`}
              onClick={() => setDay(w.index)}
            >
              <span className="tabs__tab-day">{w.short}</span>
              <span className="tabs__tab-num">{w.index}</span>
            </button>
          ))}
        </div>
      </div>

      <Card className="rise rise--1">
        <CardHeader
          title={`Day ${day}`}
          sub={target ? `Designed around a ${formatKcal(target)} kcal target` : 'Designed around your profile'}
        />
        <div className="card__body">
          {Object.entries(plan.picks).map(([slot, meal]) => (
            <div className="plan-meal" key={slot}>
              <div className="plan-meal__slot">
                <span className="plan-meal__slot-badge">
                  <Icon name={SLOT_ICONS[slot]} />
                  {SLOT_LABELS[slot]}
                </span>
              </div>
              <div className="plan-meal__main">
                <div className="plan-meal__name">{meal.name}</div>
                <div className="plan-meal__desc">{meal.desc}</div>
                <div className="plan-meal__macros">
                  <span className="macro-chip">~{slotKcal(meal)} kcal</span>
                  <span className="macro-chip">P {meal.protein}g</span>
                  <span className="macro-chip">C {meal.carbs}g</span>
                  <span className="macro-chip">F {meal.fat}g</span>
                </div>
              </div>
              <Button
                variant={added[slot] ? 'primary' : 'secondary'}
                size="sm"
                icon={added[slot] ? 'check' : 'plus'}
                onClick={() => handleAdd(slot, meal)}
                className="plan-meal__add"
              >
                {added[slot] ? 'Added' : 'Log it'}
              </Button>
            </div>
          ))}

          <div className="total-tile" style={{ marginTop: '1.25rem' }}>
            <div>
              <div className="total-tile__label">Day {day} total</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ns-text-3)', marginTop: 2 }}>
                {target ? `${Math.round((plan.kcal / target) * 100)}% of your calorie target` : 'Estimated total'}
              </div>
            </div>
            <div className="total-tile__value">{plan.kcal.toLocaleString()} kcal</div>
          </div>
        </div>
      </Card>

      <p style={{ fontSize: '0.78rem', color: 'var(--ns-text-3)', marginTop: '1rem' }}>
        Suggestions are for general guidance. Adjust portions and ingredients to your taste, availability and any dietary restrictions.
      </p>
    </>
  );
}
