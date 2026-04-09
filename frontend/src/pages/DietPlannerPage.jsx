import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getDailyPlan } from '../services/plannerApi';
import { getCatMeta } from '../utils/recipeCategories';

const MEAL_TYPES  = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
const MEAL_ICONS  = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

function MealSlotCard({ type, slot }) {
  const { css: catClass } = getCatMeta(slot?.category || type);

  return (
    <div className="card">
      <div className={`card-img-placeholder ${catClass}`} style={{ height: '80px', fontSize: '2rem' }}>
        {MEAL_ICONS[type]}
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span className="tag tag-gray">{MEAL_LABELS[type]}</span>
          {slot?.calorie_target && (
            <span className="tag tag-orange">~{slot.calorie_target} kcal</span>
          )}
        </div>

        {!slot ? (
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recipe available.</p>
        ) : (
          <>
            <Link to={`/recipes/${slot.recipe_id}`} style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text)', textDecoration: 'none' }}>
              {slot.title}
            </Link>
            {slot.description && (
              <p style={{ margin: '0.4rem 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {slot.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {slot.prep_time && <span>⏱ {slot.prep_time} min</span>}
              {slot.servings  && <span>🍽 {slot.servings} serving{slot.servings !== 1 ? 's' : ''}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DietPlannerPage() {
  const [plan, setPlan]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleGenerate() {
    setLoading(true);
    setError('');
    setPlan(null);
    try {
      const { data } = await getDailyPlan();
      setPlan(data.plan);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate plan.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ margin: '0 0 0.25rem' }}>Diet Planner</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Generate a personalised daily meal plan based on your profile, calorie target, and preferred diet type.
          </p>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Plan is generated based on your <Link to="/profile" style={{ color: 'var(--primary)' }}>profile settings</Link>.
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
              {loading ? 'Generating…' : plan ? '↺ Regenerate plan' : '✨ Generate today\'s plan'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ color: '#DC2626', background: '#FEF2F2', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {plan && (
          <>
            {/* Plan metadata */}
            {(plan.calorie_target || plan.diet_type || plan.note) && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {plan.calorie_target && (
                  <div className="card" style={{ flex: '1', minWidth: '140px', textAlign: 'center' }}>
                    <div className="card-body" style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{plan.calorie_target}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Daily kcal target</div>
                    </div>
                  </div>
                )}
                {plan.diet_type && (
                  <div className="card" style={{ flex: '1', minWidth: '140px', textAlign: 'center' }}>
                    <div className="card-body" style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>{plan.diet_type}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Diet type</div>
                    </div>
                  </div>
                )}
                {plan.note && (
                  <div style={{ flexBasis: '100%', background: 'var(--primary-light)', borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ℹ️ {plan.note}
                  </div>
                )}
              </div>
            )}

            {/* Meal slots */}
            <div className="grid-2">
              {MEAL_TYPES.map((type) => (
                <MealSlotCard key={type} type={type} slot={plan.meals[type]} />
              ))}
            </div>

            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center' }}>
              Calorie targets are split from your daily goal (25 / 35 / 30 / 10 %).
              Update your goal in <Link to="/profile" style={{ color: 'var(--primary)' }}>Profile</Link>.
            </p>
          </>
        )}

        {!plan && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No plan generated yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>Click the button above to get your personalised daily meal plan.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DietPlannerPage;
