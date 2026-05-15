import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMe } from '../services/usersApi';
import { getMeals } from '../services/mealsApi';
import { getRecipes } from '../services/recipesApi';
import { userKey } from '../utils/sessionStore';

function todayISO() { return new Date().toISOString().slice(0, 10); }

const QUICK_LINKS = [
  { to: '/meals',    icon: '📊', label: 'Log Meals',     desc: 'Track today\'s food intake' },
  { to: '/planner',  icon: '📅', label: 'Diet Planner',  desc: 'Generate your daily plan' },
  { to: '/shopping', icon: '🛒', label: 'Shopping List', desc: 'Build your grocery list' },
  { to: '/chatbot',  icon: '🤖', label: 'AI Assistant',  desc: 'Ask nutrition questions' },
];

const MEAL_ICONS  = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };
const MEAL_TYPES  = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };

// Returns 'breakfast' | 'lunch' | 'dinner' | 'snack' based on current hour
function nextMealByHour() {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 13) return 'lunch';
  if (h < 18) return 'dinner';
  return 'snack';
}

function DashboardPage() {
  const [user,    setUser]    = useState(null);
  const [today,   setToday]   = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [shoppingState, setShoppingState] = useState(null); // { total, done }

  useEffect(() => {
    getMe().then(({ data }) => setUser(data.user)).catch(() => {});
    getMeals(todayISO()).then(({ data }) => setToday(data)).catch(() => {});
    getRecipes().then(({ data }) => setRecipes(data.recipes.slice(0, 3))).catch(() => {});

    // Load shopping list progress from localStorage
    try {
      const key  = userKey('shopping_list');
      const raw  = localStorage.getItem(key);
      if (raw) {
        const { items, checked } = JSON.parse(raw);
        if (items && items.length > 0) {
          const checkedSet = new Set(Array.isArray(checked) ? checked : []);
          setShoppingState({ total: items.length, done: checkedSet.size });
        }
      }
    } catch { /* ignore */ }
  }, []);

  const totals        = today?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const calorieTarget = user?.calorie_target || 0;
  const calPct        = calorieTarget > 0 ? Math.min(100, Math.round((totals.calories / calorieTarget) * 100)) : 0;

  const loggedMeals   = today?.meals || [];
  const nextMealType  = nextMealByHour();
  const nextMealHasEntry = loggedMeals.some((m) => m.meal_type === nextMealType);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      {/* Greeting */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ margin: '0 0 0.25rem' }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}{user ? `, ${user.username}` : ''}! 👋
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Here's your nutrition overview for today.
        </p>
      </div>

      {/* Macro cards */}
      <div className="macro-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="macro-card">
          <div className="macro-value" style={{ color: 'var(--primary)' }}>{totals.calories}</div>
          <div className="macro-label">Calories (kcal)</div>
        </div>
        <div className="macro-card">
          <div className="macro-value" style={{ color: '#3B82F6' }}>{totals.protein}g</div>
          <div className="macro-label">Protein</div>
        </div>
        <div className="macro-card">
          <div className="macro-value" style={{ color: '#10B981' }}>{totals.carbs}g</div>
          <div className="macro-label">Carbs</div>
        </div>
        <div className="macro-card">
          <div className="macro-value" style={{ color: '#F59E0B' }}>{totals.fat}g</div>
          <div className="macro-label">Fat</div>
        </div>
      </div>

      {/* Calorie progress */}
      {calorieTarget > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body">
            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 500 }}>Daily calorie goal</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {totals.calories} / {calorieTarget} kcal ({calPct}%)
              </span>
            </div>
            <div className="progress-wrap">
              <div className={`progress-bar ${calPct >= 100 ? 'p-green' : 'p-orange'}`} style={{ width: `${calPct}%` }} />
            </div>
            {calPct >= 100 && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#10B981', fontWeight: 500 }}>
                ✓ Daily goal reached!
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Left column */}
        <div>
          {/* Quick links */}
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {QUICK_LINKS.map(({ to, icon, label, desc }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div className="card card-lift" style={{ cursor: 'pointer' }}>
                  <div className="card-body" style={{ padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                    <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{label}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{desc}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Today's meals */}
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Today's Meals</h2>
          <div className="card">
            <div className="card-body">
              {loggedMeals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.75rem' }}>
                    No meals logged yet today.
                  </p>
                  <Link to="/meals" className="btn btn-primary btn-sm">+ Log your first meal</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {MEAL_TYPES.map((type) => {
                    const meal = loggedMeals.find((m) => m.meal_type === type);
                    const mealCal = meal?.items?.reduce((s, i) => s + (Number(i.calories) || 0), 0) || 0;
                    return (
                      <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{MEAL_ICONS[type]}</span>
                        <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: meal ? 500 : 400, color: meal ? 'var(--text)' : 'var(--text-muted)' }}>
                          {MEAL_LABELS[type]}
                        </span>
                        {meal ? (
                          <span className="tag tag-orange" style={{ fontSize: '0.78rem' }}>{mealCal} kcal</span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </div>
                    );
                  })}
                  <Link to="/meals" className="btn btn-ghost btn-sm" style={{ marginTop: '0.25rem', textAlign: 'center' }}>
                    Manage meals →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Profile summary */}
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Profile Summary</h2>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {user.goal && (
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Goal</span>
                      <span className="tag tag-green">{user.goal.replace('_', ' ')}</span>
                    </div>
                  )}
                  {user.diet_type && (
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Diet type</span>
                      <span className="tag tag-blue">{user.diet_type}</span>
                    </div>
                  )}
                  {user.weight && (
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Weight</span>
                      <span style={{ fontWeight: 600 }}>{user.weight} kg</span>
                    </div>
                  )}
                  {user.calorie_target && (
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Calorie target</span>
                      <span style={{ fontWeight: 600 }}>{user.calorie_target} kcal</span>
                    </div>
                  )}
                  <Link to="/profile" className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                    Edit Profile
                  </Link>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '1rem 0' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading profile…</p>
                </div>
              )}
            </div>
          </div>

          {/* Next meal suggestion */}
          {!nextMealHasEntry && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="card-body">
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>
                  {MEAL_ICONS[nextMealType]} Next up: {MEAL_LABELS[nextMealType]}
                </h3>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  You haven't logged {nextMealType} yet today.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link to="/meals" className="btn btn-primary btn-sm">Log now</Link>
                  <Link to="/planner" className="btn btn-ghost btn-sm">View plan</Link>
                </div>
              </div>
            </div>
          )}

          {/* Shopping list status */}
          {shoppingState && (
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="card-body">
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>🛒 Shopping List</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {shoppingState.done}/{shoppingState.total} items
                  </span>
                </div>
                <div className="progress-wrap" style={{ marginBottom: '0.5rem' }}>
                  <div
                    className="progress-bar p-green"
                    style={{ width: `${shoppingState.total > 0 ? Math.round((shoppingState.done / shoppingState.total) * 100) : 0}%` }}
                  />
                </div>
                <Link to="/shopping" className="btn btn-ghost btn-sm" style={{ width: '100%', textAlign: 'center' }}>
                  View shopping list →
                </Link>
              </div>
            </div>
          )}

          {/* Featured recipe */}
          {recipes.length > 0 && (
            <div>
              <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Try Today</h2>
                <Link to="/recipes" className="btn btn-ghost btn-sm">More →</Link>
              </div>
              <Link to={`/recipes/${recipes[0].id}`} style={{ textDecoration: 'none' }}>
                <div className="card card-lift">
                  <div className="card-body" style={{ padding: '0.9rem 1.1rem' }}>
                    <span className="tag tag-orange" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
                      {recipes[0].category || 'Recipe'}
                    </span>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{recipes[0].title}</div>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
