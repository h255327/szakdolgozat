import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMe } from '../services/usersApi';
import { getMeals } from '../services/mealsApi';
import { getRecipes } from '../services/recipesApi';

function todayISO() { return new Date().toISOString().slice(0, 10); }

const QUICK_LINKS = [
  { to: '/meals',    icon: '📊', label: 'Log Meals',     desc: 'Track today\'s food intake' },
  { to: '/planner',  icon: '📅', label: 'Diet Planner',  desc: 'Generate your daily plan' },
  { to: '/shopping', icon: '🛒', label: 'Shopping List', desc: 'Build your grocery list' },
  { to: '/chatbot',  icon: '🤖', label: 'AI Assistant',  desc: 'Ask nutrition questions' },
];

function DashboardPage() {
  const [user, setUser]       = useState(null);
  const [today, setToday]     = useState(null);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    getMe().then(({ data }) => setUser(data.user)).catch(() => {});
    getMeals(todayISO()).then(({ data }) => setToday(data)).catch(() => {});
    getRecipes().then(({ data }) => setRecipes(data.recipes.slice(0, 3))).catch(() => {});
  }, []);

  const totals        = today?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const calorieTarget = user?.calorie_target || 0;
  const calPct        = calorieTarget > 0 ? Math.min(100, Math.round((totals.calories / calorieTarget) * 100)) : 0;

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
        {/* Quick links */}
        <div>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
        </div>

        {/* Profile summary */}
        <div>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Profile Summary</h2>
          <div className="card">
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

          {/* Featured recipe */}
          {recipes.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
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
