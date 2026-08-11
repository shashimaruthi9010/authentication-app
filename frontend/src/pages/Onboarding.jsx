import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUserProfile } from '../utils/profile';
import { Field, TextInput, ChipToggle } from '../components/ui/Field';
import CardSelect from '../components/ui/CardSelect';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import Icon from '../components/ui/Icon';
import AlertBanner from '../components/AlertBanner';

const SEX_OPTIONS = [
  { value: 'female', label: 'Female', desc: 'She / her' },
  { value: 'male', label: 'Male', desc: 'He / him' },
  { value: 'other', label: 'Other', desc: 'A different identity' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', desc: 'I’d rather not share' },
];

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', icon: 'clock' },
  { value: 'lightly_active', label: 'Lightly active', desc: 'Light exercise 1–3 days a week', icon: 'sun' },
  { value: 'moderately_active', label: 'Moderately active', desc: 'Moderate exercise 3–5 days a week', icon: 'activity' },
  { value: 'very_active', label: 'Very active', desc: 'Hard exercise 6–7 days a week', icon: 'trendUp' },
  { value: 'extra_active', label: 'Extra active', desc: 'Intense daily training or physical work', icon: 'flame' },
];

const GOAL_OPTIONS = [
  { value: 'lose_weight', label: 'Manage weight', desc: 'A gentle deficit to lose weight gradually', icon: 'trendDown' },
  { value: 'maintain_weight', label: 'Stay balanced', desc: 'Stable weight and everyday energy', icon: 'target' },
  { value: 'gain_weight', label: 'Gain healthy weight', desc: 'A measured surplus to support steady gain', icon: 'trendUp' },
  { value: 'improve_fitness', label: 'Improve fitness', desc: 'Fuel training, strength and recovery', icon: 'heart' },
  { value: 'manage_health', label: 'Support health', desc: 'Whole-food nutrition tuned to your condition', icon: 'shield' },
];

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut allergy', 'Halal', 'Kosher'];

const STEPS = [
  { key: 'basics', title: 'About you', sub: 'Age, sex and measurements' },
  { key: 'lifestyle', title: 'Lifestyle & goal', sub: 'How you live and what you’re working toward' },
  { key: 'preferences', title: 'Dietary preferences', sub: 'Optional — select what applies to you' },
];

const REQUIRED = ['age', 'sex', 'height', 'weight', 'activity_level', 'health_goal'];

const INITIAL_FIELDS = {
  age: '',
  sex: '',
  height: '',
  weight: '',
  activity_level: '',
  health_goal: '',
  dietary_restrictions: [],
};

function validateStep(step, fields) {
  const errors = {};

  if (step === 0) {
    const age = Number(fields.age);
    if (!fields.age.trim()) errors.age = 'Age is required.';
    else if (!Number.isInteger(age) || age < 13 || age > 120) errors.age = 'Enter a valid age between 13 and 120.';

    if (!fields.sex) errors.sex = 'Please select an option.';

    const height = Number(fields.height);
    if (!fields.height.trim()) errors.height = 'Height is required.';
    else if (Number.isNaN(height) || height < 50 || height > 280) errors.height = 'Enter height in cm (50–280).';

    const weight = Number(fields.weight);
    if (!fields.weight.trim()) errors.weight = 'Weight is required.';
    else if (Number.isNaN(weight) || weight < 20 || weight > 500) errors.weight = 'Enter weight in kg (20–500).';
  }

  if (step === 1) {
    if (!fields.activity_level) errors.activity_level = 'Please select your activity level.';
    if (!fields.health_goal) errors.health_goal = 'Please select a health goal.';
  }

  return errors;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const completion = useMemo(() => {
    const filled = REQUIRED.filter((field) => {
      const value = fields[field];
      return value !== undefined && value !== null && String(value).trim() !== '';
    }).length;
    return Math.round((filled / REQUIRED.length) * 100);
  }, [fields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const pick = (name) => (value) => {
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const toggleDietary = (option) => {
    setFields((prev) => {
      if (option === 'None') return { ...prev, dietary_restrictions: [] };
      const current = prev.dietary_restrictions;
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, dietary_restrictions: next };
    });
    if (apiError) setApiError('');
  };

  const goNext = () => {
    const validationErrors = validateStep(step, fields);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setApiError('');
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateStep(2, fields);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      saveUserProfile({
        age: Number(fields.age),
        sex: fields.sex,
        height: Number(fields.height),
        weight: Number(fields.weight),
        activity_level: fields.activity_level,
        health_goal: fields.health_goal,
        dietary_restrictions: fields.dietary_restrictions,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isLast = step === STEPS.length - 1;

  return (
    <div className="onboarding" id="onboarding-page">
      <div className="onboarding__shell">
        <div className="onboarding__top">
          <Logo size="sm" wordmark />
          <span className="onboarding__privacy">
            <Icon name="shield" />
            Private &amp; on-device
          </span>
        </div>

        <header className="onboarding__head">
          <div className="eyebrow onboarding__eyebrow">
            <span className="onboarding__eyebrow-mark" aria-hidden="true" />
            Health profile
          </div>
          <h1 className="onboarding__title">
            Let&apos;s get to know you.
          </h1>
          <p className="onboarding__sub">
            A few details let NutriSense personalize your nutrition insights,
            targets and meal plans. It takes about a minute.
          </p>
        </header>

        <div className="stepper" role="navigation" aria-label="Onboarding progress">
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              className={`stepper__step${i <= step ? ' stepper__step--done' : ''}${i === step ? ' stepper__step--active' : ''}`}
            >
              <span className="stepper__dot" aria-hidden="true">
                {i < step ? <Icon name="check" /> : i + 1}
              </span>
              <span className="stepper__meta">
                <span className="stepper__label">{s.title}</span>
                <span className="stepper__sub">{s.sub}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="onboarding__meter">
          <div className="onboarding__meter-row">
            <span>Profile completeness</span>
            <strong>{completion}%</strong>
          </div>
          <div className="onboarding__meter-track">
            <div className="onboarding__meter-fill" style={{ width: `${completion}%` }} />
          </div>
        </div>

        <div className="onboarding__card">
          <AlertBanner type="error" message={apiError} />

          <form onSubmit={handleSubmit} noValidate id="onboarding-form">
            {step === 0 && (
              <div className="onboarding__panel">
                <div className="onboarding__section">
                  <h2 className="onboarding__section-title">About you</h2>
                  <p className="onboarding__section-note">
                    Your age and sex help us calibrate your energy needs. Measurements power your body metrics.
                  </p>
                  <div className="onboarding__grid onboarding__grid--2">
                    <Field label="Age" htmlFor="age" error={errors.age}>
                      <TextInput
                        id="age"
                        name="age"
                        type="number"
                        inputMode="numeric"
                        min="13"
                        max="120"
                        placeholder="28"
                        value={fields.age}
                        onChange={handleChange}
                        error={errors.age}
                        autoComplete="off"
                      />
                    </Field>

                    <Field label="Height" htmlFor="height" error={errors.height}>
                      <TextInput
                        id="height"
                        name="height"
                        type="number"
                        inputMode="decimal"
                        min="50"
                        max="280"
                        step="0.1"
                        placeholder="170"
                        unit="cm"
                        value={fields.height}
                        onChange={handleChange}
                        error={errors.height}
                        autoComplete="off"
                      />
                    </Field>

                    <Field label="Weight" htmlFor="weight" error={errors.weight}>
                      <TextInput
                        id="weight"
                        name="weight"
                        type="number"
                        inputMode="decimal"
                        min="20"
                        max="500"
                        step="0.1"
                        placeholder="70"
                        unit="kg"
                        value={fields.weight}
                        onChange={handleChange}
                        error={errors.weight}
                        autoComplete="off"
                      />
                    </Field>
                  </div>

                  <div className="onboarding__grid">
                    <Field label="Sex" htmlFor="sex" error={errors.sex}>
                      <CardSelect
                        name="sex"
                        options={SEX_OPTIONS}
                        value={fields.sex}
                        onChange={pick('sex')}
                        columns="2"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="onboarding__panel">
                <div className="onboarding__section">
                  <h2 className="onboarding__section-title">Activity level</h2>
                  <p className="onboarding__section-note">
                    Sets your daily energy baseline — how active are you on a typical week?
                  </p>
                  {errors.activity_level && (
                    <div className="field__error" role="alert">
                      <Icon name="alert" />
                      <span>{errors.activity_level}</span>
                    </div>
                  )}
                  <CardSelect
                    name="activity_level"
                    options={ACTIVITY_OPTIONS}
                    value={fields.activity_level}
                    onChange={pick('activity_level')}
                  />
                </div>

                <div className="onboarding__section">
                  <h2 className="onboarding__section-title">Your goal</h2>
                  <p className="onboarding__section-note">
                    What do you want NutriSense to help you with most?
                  </p>
                  {errors.health_goal && (
                    <div className="field__error" role="alert">
                      <Icon name="alert" />
                      <span>{errors.health_goal}</span>
                    </div>
                  )}
                  <CardSelect
                    name="health_goal"
                    options={GOAL_OPTIONS}
                    value={fields.health_goal}
                    onChange={pick('health_goal')}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="onboarding__panel">
                <div className="onboarding__section">
                  <h2 className="onboarding__section-title">Dietary preferences</h2>
                  <p className="onboarding__section-note">
                    Optional — select all that apply. Your meal plans will respect these.
                  </p>
                  <div className="onboarding__chips">
                    {DIETARY_OPTIONS.map((option) => (
                      <ChipToggle
                        key={option}
                        checked={fields.dietary_restrictions.includes(option)}
                        onToggle={() => toggleDietary(option)}
                      >
                        {option}
                      </ChipToggle>
                    ))}
                    {fields.dietary_restrictions.length === 0 && (
                      <span className="onboarding__chips-none">No restrictions selected — anything goes.</span>
                    )}
                  </div>
                </div>

                <div className="onboarding__review">
                  <div className="onboarding__review-head">
                    <Icon name="sparkles" />
                    <span>Ready to personalize</span>
                  </div>
                  <div className="onboarding__review-grid">
                    <div className="kv"><span className="kv__k">Age</span><span className="kv__v">{fields.age}</span></div>
                    <div className="kv"><span className="kv__k">Height / Weight</span><span className="kv__v">{fields.height} cm · {fields.weight} kg</span></div>
                    <div className="kv"><span className="kv__k">Activity</span><span className="kv__v">{ACTIVITY_OPTIONS.find((o) => o.value === fields.activity_level)?.label || '—'}</span></div>
                    <div className="kv"><span className="kv__k">Goal</span><span className="kv__v">{GOAL_OPTIONS.find((o) => o.value === fields.health_goal)?.label || '—'}</span></div>
                  </div>
                </div>
              </div>
            )}

            <footer className="onboarding__footer">
              <div className="onboarding__footer-actions">
                {step > 0 && (
                  <Button variant="secondary" onClick={() => setStep((s) => s - 1)} icon="chevronLeft">
                    Back
                  </Button>
                )}
                {isLast ? (
                  <Button
                    id="onboarding-submit"
                    type="submit"
                    size="lg"
                    block={step === 0}
                    iconRight="arrowRight"
                    loading={loading}
                  >
                    {loading ? 'Saving…' : 'Save profile'}
                  </Button>
                ) : (
                  <Button id="onboarding-next" type="button" size="lg" block iconRight="arrowRight" onClick={goNext}>
                    Continue
                  </Button>
                )}
              </div>
              <p className="onboarding__disclaimer">
                Your information is stored securely on this device and used only to
                personalize your health experience.
              </p>
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}
