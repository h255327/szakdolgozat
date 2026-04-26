import { useState, useEffect } from 'react';
import { generateShoppingList } from '../services/shoppingApi';
import { userKey } from '../utils/sessionStore';

const STORAGE_KEY = () => userKey('shopping_list');

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
            const key     = item.name;
            const isDone  = checked.has(key);
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
  const [items,      setItems]      = useState([]);
  const [sources,    setSources]    = useState([]);
  const [checked,    setChecked]    = useState(new Set());
  const [source,     setSource]     = useState(null); // 'plan' | null
  const [generating, setGenerating] = useState(false);
  const [genError,   setGenError]   = useState('');
  const [newItem,    setNewItem]    = useState('');
  const [addError,   setAddError]   = useState('');

  // ── Restore persisted list on mount ────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY());
      if (saved) {
        const { items: i, sources: s, checked: c, source: src } = JSON.parse(saved);
        setItems(i);
        setSources(s);
        setChecked(new Set(c));
        setSource(src || null);
      }
    } catch { /* ignore corrupted data */ }
  }, []);

  // ── Persist whenever list state changes ────────────────────────────────────
  useEffect(() => {
    if (items.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY(), JSON.stringify({
        items,
        sources,
        checked: [...checked],
        source,
      }));
    } catch { /* storage quota exceeded – ignore */ }
  }, [items, sources, checked, source]);

  // ── Generate from the saved diet plan ──────────────────────────────────────
  async function handleGenerateFromPlan() {
    setGenerating(true);
    setGenError('');
    try {
      const savedPlan = localStorage.getItem(userKey('diet_plan'));
      if (!savedPlan) {
        setGenError('No diet plan found. Generate a plan on the Diet Planner page first.');
        return;
      }
      const plan = JSON.parse(savedPlan);
      const recipeIds = Object.values(plan.meals).filter(Boolean).map((s) => s.recipe_id);
      if (recipeIds.length === 0) {
        setGenError('The saved plan has no recipes. Regenerate your diet plan first.');
        return;
      }
      const { data } = await generateShoppingList(recipeIds);
      setItems(data.items);
      setSources(data.sources);
      setChecked(new Set());
      setSource('plan');
    } catch (err) {
      setGenError(err.response?.data?.error || 'Failed to generate shopping list.');
    } finally {
      setGenerating(false);
    }
  }

  // ── Add a single item manually ─────────────────────────────────────────────
  function handleAddItem(e) {
    e.preventDefault();
    const trimmed = newItem.trim();
    if (!trimmed) return;

    const normalised = trimmed.toLowerCase();
    if (items.some((i) => i.name === normalised)) {
      setAddError(`"${trimmed}" is already in your list.`);
      return;
    }

    setAddError('');
    setItems((prev) => [
      ...prev,
      { name: normalised, category: 'Other', entries: [trimmed] },
    ]);
    setNewItem('');
  }

  // ── Checkbox / remove / clear ──────────────────────────────────────────────
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

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.25rem' }}>Shopping List</h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Add items manually or generate from your diet plan.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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

        {/* ── Generate from diet plan ────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: '0.75rem' }}>
          <div className="card-body" style={{ padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>📋 Generate from diet plan</span>
              <span style={{ marginLeft: '0.6rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Load ingredients from your saved meal plan.
              </span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleGenerateFromPlan} disabled={generating}>
              {generating ? 'Generating…' : items.length > 0 ? '↺ Replace with plan' : 'Generate from plan'}
            </button>
          </div>
          {genError && (
            <div style={{ padding: '0 1rem 0.75rem', color: '#DC2626', fontSize: '0.85rem' }}>{genError}</div>
          )}
        </div>

        {/* ── Add item manually ──────────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body" style={{ padding: '0.9rem 1rem' }}>
            <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                value={newItem}
                onChange={(e) => { setNewItem(e.target.value); setAddError(''); }}
                placeholder="Add an item, e.g. milk, bread, apples…"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary btn-sm">+ Add item</button>
            </form>
            {addError && (
              <p style={{ color: '#DC2626', fontSize: '0.82rem', margin: '0.35rem 0 0' }}>{addError}</p>
            )}
          </div>
        </div>

        {/* ── Empty state ────────────────────────────────────────────────── */}
        {items.length === 0 && !generating && (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>No items yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Type an item above to start your list, or generate from a diet plan.
            </p>
          </div>
        )}

        {/* ── Progress + item list ───────────────────────────────────────── */}
        {items.length > 0 && (
          <>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-body" style={{ padding: '1rem' }}>
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 500 }}>Shopping progress</span>
                    {source === 'plan' && (
                      <span className="tag tag-purple" style={{ fontSize: '0.75rem' }}>from diet plan</span>
                    )}
                  </div>
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
