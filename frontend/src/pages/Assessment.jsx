import { useState, useMemo } from 'react';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import { getUserProfile } from '../utils/profile';
import { getAssessment, saveAssessment } from '../utils/data';
import {
  calcBMI, bmiCategory, calcBMR, calcTDEE, calorieTarget, macroTargets,
  hydrationTarget, goalLabel, activityLabel, goalDescription, formatKcal,
} from '../utils/health';

const METRIC_TONES = { info: 'info', success: 'success', warning: 'warning', danger: 'danger' };

export default function Assessment() {
  const profile = getUserProfile();
  const [saved, setSaved] = useState(() => getAssessment());
  const [generating, setGenerating] = useState(false);

  const metrics = useMemo(() => {
    if (!profile) return null;
    const bmi = calcBMI(profile.weight, profile.height);
    const bmr = calcBMR(profile.weight, profile.height, profile.age, profile.sex);
    const tdee = calcTDEE(profile);
    const target = calorieTarget(tdee, profile.health_goal);
    const macros = macroTargets(target, profile.health_goal);
    return {
      bmi,
      bmiCat: bmiCategory(bmi),
      bmr,
      tdee,
      target,
      macros,
      water: hydrationTarget(profile.weight),
    };
  }, [profile]);

  const runAssessment = () => {
    if (!metrics) return;
    setGenerating(true);
    setTimeout(() => {
      saveAssessment({
        bmi: metrics.bmi,
        bmiLabel: metrics.bmiCat?.label,
        bmiTone: metrics.bmiCat?.tone,
        bmr: metrics.bmr,
        tdee: metrics.tdee,
        target: metrics.target,
        macros: metrics.macros,
        water: metrics.water,
      });
      setSaved(getAssessment());
      setGenerating(false);
    }, 700);
  };

  const hasResult = Boolean(saved && metrics);

  const recommendations = metrics ? [
    {
      icon: 'flame',
      title: 'Calorie target',
      body: `Aim for ${formatKcal(metrics.target)} kcal per day — your maintenance needs are about ${formatKcal(metrics.tdee)} kcal at a ${activityLabel(profile.activity_level).toLowerCase()} activity level. ${goalDescription(profile.health_goal)}`,
    },
    {
      icon: 'droplet',
      title: 'Hydration',
      body: `Keep water intake near ${metrics.water.toLocaleString()} ml daily. Spread it evenly, and add more on training days or in warm weather.`,
    },
    {
      icon: 'target',
      title: 'Protein priority',
      body: `Target roughly ${metrics.macros?.protein ?? '—'}g of protein daily (${metrics.macros?.protein ? Math.round((metrics.macros.protein * 4 / metrics.target) * 100) : 0}% of calories). Distribute it across meals to support satiety and muscle maintenance.`,
    },
    {
      icon: 'bowl',
      title: 'Whole-food emphasis',
      body: 'Build meals around vegetables, legumes, lean proteins and whole grains. Track consistently for a week before making meaningful changes — single days rarely tell the whole story.',
    },
  ] : [];

  return (
    <>
      <div className="page-head">
        <div className="eyebrow page-head__eyebrow">AI-powered analysis</div>
        <div className="page-head__row">
          <div>
            <h1 className="page-head__title">Assessment</h1>
            <p className="page-head__sub">
              We combine your measurements, lifestyle and goal into a clear, personal nutrition picture.
            </p>
          </div>
          <Button
            icon="sparkles"
            onClick={runAssessment}
            loading={generating}
            disabled={!profile}
          >
            {hasResult ? 'Regenerate assessment' : 'Run my assessment'}
          </Button>
        </div>
      </div>

      {!profile ? (
        <Card>
          <EmptyState
            icon="clipboard"
            title="Complete your profile first"
            body="Your assessment is built from your age, measurements and goals. Head to onboarding to finish your profile."
          />
        </Card>
      ) : !hasResult && !generating ? (
        <Card className="rise">
          <EmptyState
            icon="sparkles"
            title="Ready when you are"
            body="Running the assessment takes your BMI, energy needs and macro targets and turns them into practical daily guidance."
            action={<Button icon="sparkles" onClick={runAssessment} loading={generating}>Run my assessment</Button>}
          />
        </Card>
      ) : (
        <>
          {generating ? (
            <div className="grid grid--stats rise">
              {[0, 1, 2, 3].map((i) => (
                <div className="metric-tile" key={i}>
                  <div className="skeleton" style={{ height: 12, width: '70%', margin: '0 auto 0.9rem' }} />
                  <div className="skeleton" style={{ height: 28, width: '55%', margin: '0 auto 0.6rem' }} />
                  <div className="skeleton" style={{ height: 11, width: '40%', margin: '0 auto' }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="assessment-hero rise">
                <span className="assessment-hero__icon">
                  <Icon name="checkCircle" />
                </span>
                <div>
                  <div className="assessment-hero__title">Your personal assessment is ready</div>
                  <div className="assessment-hero__sub">
                    Built from your profile · {goalLabel(profile.health_goal)} focus
                  </div>
                </div>
              </div>

              <div className="grid grid--stats rise">
                <div className="metric-tile">
                  <div className="metric-tile__label">Body mass index</div>
                  <div className="metric-tile__value">{metrics.bmi}<small> kg/m²</small></div>
                  <div className="metric-tile__sub">
                    <Badge tone={METRIC_TONES[metrics.bmiCat?.tone] || 'neutral'} dot>{metrics.bmiCat?.label}</Badge>
                  </div>
                </div>
                <div className="metric-tile">
                  <div className="metric-tile__label">Basal metabolic rate</div>
                  <div className="metric-tile__value">{formatKcal(metrics.bmr)}<small> kcal</small></div>
                  <div className="metric-tile__sub">At complete rest</div>
                </div>
                <div className="metric-tile">
                  <div className="metric-tile__label">Daily energy needs</div>
                  <div className="metric-tile__value">{formatKcal(metrics.tdee)}<small> kcal</small></div>
                  <div className="metric-tile__sub">{activityLabel(profile.activity_level)}</div>
                </div>
                <div className="metric-tile">
                  <div className="metric-tile__label">Daily calorie target</div>
                  <div className="metric-tile__value" style={{ color: 'var(--ns-primary-600)' }}>{formatKcal(metrics.target)}<small> kcal</small></div>
                  <div className="metric-tile__sub">{goalLabel(profile.health_goal)}</div>
                </div>
              </div>

              <div className="grid grid--3 rise rise--1" style={{ marginTop: '1.25rem' }}>
                <div className="metric-tile">
                  <div className="metric-tile__label">Protein</div>
                  <div className="metric-tile__value">{metrics.macros?.protein ?? '—'}<small> g</small></div>
                </div>
                <div className="metric-tile">
                  <div className="metric-tile__label">Carbohydrates</div>
                  <div className="metric-tile__value">{metrics.macros?.carbs ?? '—'}<small> g</small></div>
                </div>
                <div className="metric-tile">
                  <div className="metric-tile__label">Fat</div>
                  <div className="metric-tile__value">{metrics.macros?.fat ?? '—'}<small> g</small></div>
                </div>
              </div>

              <Card className="rise rise--2" style={{ marginTop: '1.5rem' }}>
                <CardHeader title="Recommendations" sub="Practical guidance for your goal" />
                <div style={{ padding: '0.25rem 1.5rem 1.5rem' }}>
                  {recommendations.map((r) => (
                    <div className="rec" key={r.title}>
                      <div className="rec__icon">
                        <Icon name={r.icon} />
                      </div>
                      <div className="rec__text">
                        <div className="rec__title">{r.title}</div>
                        <div className="rec__body">{r.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </>
  );
}
