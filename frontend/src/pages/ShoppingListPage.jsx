import { useState } from 'react';
import { getDailyPlan }         from '../services/plannerApi';
import { generateShoppingList } from '../services/shoppingApi';

const CATEGORY_ORDER = ['Protein', 'Dairy', 'Vegetables', 'Fruit', 'Grains', 'Nuts & Seeds', 'Pantry', 'Other'];
const CATEGORY_ICONS = { Protein: '🥩', Dairy: '🥛', Vegetables: '🥦', Fruit: '🍎', Grains: '🌾', 'Nuts & Seeds': '🥜', Pantry: '🫙', Other: '🛒' };

function groupByCategory(items) {
  const map = {};
  for (const item of items) {
    const cat = item.category || 'Other';
    if (!map[cat]) map[cat] = [];
    map[cat].push(item);
  }
  return CATEGORY_ORDER.filter((c) => map[c]).map((c) => ({ category: c, items: map[c] }));
}

function CategorySection({ category, items, checked, onToggle, onRemove }) {
  const icon = CATEGORY_ICONS[category] || '🛒';
  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div className="card-body">
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>{icon}</span> {category}
        </h3>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {items.map((item) => {
            const key    = item.name;
            const isDone = checked.has(key);
            const display = item.entries.length === 1 ? item.entries[0] : item.entries.join(' + ');
            return (
              <li key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', opacity: isDone ? 0.45 : 1 }}>
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onToggle(key)}
                  style={{ cursor: 'pointer', flexShrink: 0, width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <span style={{ flex: 1, fontSize: '0.95rem', textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-muted)' : 'var(--text)' }}>
                  {display}
                </span>
                <button
                  onClick={() => onRemove(key)}
                  title="Remove"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', fontSize: '1rem', padding: '0 0.2rem', flexShrink: 0 }}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ShoppingListPage() {
  const [items, setItems]     = useState([]);
  const [sources, setSources] = useState([]);
  const [checked, setChecked] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const { data: planData } = await getDailyPlan();
      const recipeIds = Object.values(planData.plan.meals).filter(Boolean).map((slot) => slot.recipe_id);
      if (recipeIds.length === 0) {
        setError("No recipes in today's plan. Make sure your profile has a diet type set.");
        return;
      }
      const { data } = await generateShoppingList(recipeIds);
      setItems(data.items);
      setSources(data.sources);
      setChecked(new Set());
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate shopping list.');
    } finally {
      setLoading(false);
    }
  }

  function handleToggle(name) {
    setChecked((prev) => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });
  }

  function handleRemove(name) {
    setItems((prev) => prev.filter((i) => i.name !== name));
    setChecked((prev) => { const n = new Set(prev); n.delete(name); return n; });
  }

  function handleClearDone() {
    setItems((prev) => prev.filter((i) => !checked.has(i.name)));
    setChecked(new Set());
  }

  const groups    = groupByCategory(items);
  const doneCount = items.filter((i) => checked.has(i.name)).length;
  const progress  = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.25rem' }}>Shopping List</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Generated from your daily meal plan
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
              {loading ? 'Generating…' : items.length ? '↺ Regenerate' : '✨ Generate from plan'}
            </button>
            {doneCount > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={handleClearDone}>
                Remove checked ({doneCount})
              </button>
            )}
            {items.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
                🖨 Print
              </button>
            )}
          </div>
        </div>

        {error && (
          <div style={{ color: '#DC2626', background: '#FEF2F2', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {items.length === 0 && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>No list yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Click "Generate from plan" to build your grocery list from today's meal plan.
            </p>
          </div>
        )}

        {items.length > 0 && (
          <>
            {/* Progress */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-body" style={{ padding: '1rem' }}>
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500 }}>Shopping progress</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{doneCount} / {items.length} items</span>
                </div>
                <div className="progress-wrap">
                  <div className="progress-bar p-green" style={{ width: `${progress}%` }} />
                </div>
                {sources.length > 0 && (
                  <p style={{ margin: '0.6rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Based on: {sources.map((s) => s.title).join(', ')}
                  </p>
                )}
              </div>
            </div>

            {groups.map(({ category, items: catItems }) => (
              <CategorySection
                key={category}
                category={category}
                items={catItems}
                checked={checked}
                onToggle={handleToggle}
                onRemove={handleRemove}
              />
            ))}
          </>
        )}
      </div>

      <style>{`@media print { nav, button { display: none !important; } body { font-size: 13px; } }`}</style>
    </div>
  );
}

export default ShoppingListPage;
