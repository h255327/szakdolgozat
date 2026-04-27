import { useState, useEffect, useCallback, useRef } from 'react';
import { getMeals, createMeal, addItem, deleteItem, addItemFromRecipe } from '../services/mealsApi';
import { searchFoods, addItemFromFood } from '../services/foodsApi';
import { getRecipes, getRecipeNutrition } from '../services/recipesApi';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

const EMPTY_ITEM = { name: '', quantity: '', unit: 'g', calories: '', protein: '', carbs: '', fat: '' };

function todayISO() { return new Date().toISOString().slice(0, 10); }

// ── Manual entry form ─────────────────────────────────────────────────────────

function ManualForm({ mealId, onAdded }) {
  const [form, setForm]     = useState(EMPTY_ITEM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await addItem(mealId, {
        name:     form.name,
        quantity: form.quantity ? Number(form.quantity) : undefined,
        unit:     form.unit     || undefined,
        calories: form.calories ? Number(form.calories) : 0,
        protein:  form.protein  ? Number(form.protein)  : 0,
        carbs:    form.carbs    ? Number(form.carbs)    : 0,
        fat:      form.fat      ? Number(form.fat)      : 0,
      });
      setForm(EMPTY_ITEM);
      onAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add item.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="manual-entry-grid">
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Item name *</label>
          <input name="name" type="text" className="form-input" value={form.name} onChange={handleChange} required placeholder="e.g. Chicken breast" />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Qty</label>
          <input name="quantity" type="number" min="0" step="any" className="form-input" value={form.quantity} onChange={handleChange} placeholder="100" />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Unit</label>
          <input name="unit" type="text" className="form-input" value={form.unit} onChange={handleChange} placeholder="g" />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>kcal</label>
          <input name="calories" type="number" min="0" step="any" className="form-input" value={form.calories} onChange={handleChange} placeholder="0" />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Protein g</label>
          <input name="protein" type="number" min="0" step="any" className="form-input" value={form.protein} onChange={handleChange} placeholder="0" />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Carbs g</label>
          <input name="carbs" type="number" min="0" step="any" className="form-input" value={form.carbs} onChange={handleChange} placeholder="0" />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Fat g</label>
          <input name="fat" type="number" min="0" step="any" className="form-input" value={form.fat} onChange={handleChange} placeholder="0" />
        </div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving} style={{ alignSelf: 'flex-end' }}>
          {saving ? '…' : 'Add'}
        </button>
      </div>
      {error && <p style={{ color: '#DC2626', fontSize: '0.85rem', margin: '0.4rem 0 0' }}>{error}</p>}
    </form>
  );
}

// ── Food-database entry form ───────────────────────────────────────────────────

function FoodSearchForm({ mealId, onAdded }) {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [searching,setSearching]= useState(false);
  const [selected, setSelected] = useState(null);   // food object
  const [quantity, setQuantity] = useState('100');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const debounceRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await searchFoods(query.trim());
        setResults(data.foods);
      } catch { setResults([]); }
      finally  { setSearching(false); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function selectFood(food) {
    setSelected(food);
    setResults([]);
    setQuery('');
    setQuantity('100');
    setError('');
  }

  function clearSelection() {
    setSelected(null);
    setQuantity('100');
    setError('');
  }

  // Live macro preview
  const qty = parseFloat(quantity) || 0;
  const preview = selected ? {
    calories: Math.round(selected.calories_per_100g * qty / 100 * 10) / 10,
    protein:  Math.round(selected.protein_per_100g  * qty / 100 * 10) / 10,
    carbs:    Math.round(selected.carbs_per_100g    * qty / 100 * 10) / 10,
    fat:      Math.round(selected.fat_per_100g      * qty / 100 * 10) / 10,
  } : null;

  async function handleAdd() {
    if (!selected) return;
    if (!qty || qty <= 0) { setError('Enter a quantity greater than 0.'); return; }
    setSaving(true);
    setError('');
    try {
      await addItemFromFood(mealId, { food_id: selected.id, quantity: qty });
      setSelected(null);
      setQuantity('100');
      onAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add item.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Search box (hidden once food is selected) */}
      {!selected && (
        <div style={{ position: 'relative' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Search food</label>
            <input
              type="text"
              className="form-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. chicken, oats, banana…"
              autoComplete="off"
            />
          </div>

          {/* Results dropdown */}
          {(searching || results.length > 0) && (
            <div style={{
              position: 'absolute', zIndex: 50, top: '100%', left: 0, right: 0,
              background: '#fff', border: '1px solid var(--border)', borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '2px', maxHeight: '260px', overflowY: 'auto',
            }}>
              {searching && (
                <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Searching…</div>
              )}
              {!searching && results.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => selectFood(food)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '0.6rem 1rem', background: 'none', border: 'none',
                    cursor: 'pointer', borderBottom: '1px solid var(--border)',
                    fontSize: '0.875rem',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ fontWeight: 600 }}>{food.name}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    {food.calories_per_100g} kcal · {food.protein_per_100g}g P · {food.carbs_per_100g}g C · {food.fat_per_100g}g F &nbsp;/&nbsp;100{food.default_unit}
                  </span>
                </button>
              ))}
              {!searching && results.length === 0 && query.trim() && (
                <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No foods found.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected food + quantity + preview */}
      {selected && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* Selected food badge */}
          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Selected food</label>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: '6px',
              padding: '0.45rem 0.7rem', fontSize: '0.875rem', fontWeight: 600,
            }}>
              {selected.name}
              <button type="button" onClick={clearSelection} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1, padding: '0 0 0 0.5rem' }} title="Change food">✕</button>
            </div>
          </div>

          {/* Quantity input */}
          <div style={{ width: '100px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Quantity ({selected.default_unit})</label>
            <input
              type="number"
              min="1"
              step="any"
              className="form-input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="100"
            />
          </div>

          {/* Macro preview */}
          {preview && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', flex: '1 1 auto' }}>
              <span style={{ background: '#FFF7ED', color: 'var(--primary)', border: '1px solid #FED7AA', borderRadius: '5px', padding: '0.3rem 0.55rem', fontSize: '0.8rem', fontWeight: 600 }}>{preview.calories} kcal</span>
              <span style={{ background: '#EFF6FF', color: '#3B82F6', border: '1px solid #BFDBFE', borderRadius: '5px', padding: '0.3rem 0.55rem', fontSize: '0.8rem' }}>{preview.protein}g P</span>
              <span style={{ background: '#F0FDF4', color: '#10B981', border: '1px solid #BBF7D0', borderRadius: '5px', padding: '0.3rem 0.55rem', fontSize: '0.8rem' }}>{preview.carbs}g C</span>
              <span style={{ background: '#FFFBEB', color: '#F59E0B', border: '1px solid #FDE68A', borderRadius: '5px', padding: '0.3rem 0.55rem', fontSize: '0.8rem' }}>{preview.fat}g F</span>
            </div>
          )}

          <button type="button" className="btn btn-primary btn-sm" onClick={handleAdd} disabled={saving} style={{ alignSelf: 'flex-end' }}>
            {saving ? '…' : 'Add'}
          </button>
        </div>
      )}

      {error && <p style={{ color: '#DC2626', fontSize: '0.85rem', margin: '0.4rem 0 0' }}>{error}</p>}
    </div>
  );
}

// ── Recipe-based entry form ───────────────────────────────────────────────────

function RecipeSearchForm({ mealId, onAdded }) {
  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected,  setSelected]  = useState(null);
  const [nutrition, setNutrition] = useState(null);   // { perServing: { calories, protein, carbs, fat } }
  const [servings,  setServings]  = useState('1');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const debounceRef = useRef(null);

  // Debounced recipe search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await getRecipes({ search: query.trim() });
        setResults(data.recipes ?? data);
      } catch { setResults([]); }
      finally  { setSearching(false); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function selectRecipe(recipe) {
    setSelected(recipe);
    setResults([]);
    setQuery('');
    setServings('1');
    setNutrition(null);
    setError('');
    // Fetch calculated nutrition for this recipe
    try {
      const { data } = await getRecipeNutrition(recipe.id);
      setNutrition(data);
    } catch { /* best-effort */ }
  }

  function clearSelection() {
    setSelected(null);
    setNutrition(null);
    setServings('1');
    setError('');
  }

  const qty = parseFloat(servings) || 1;
  const ps  = nutrition?.perServing;
  const r1  = (n) => Math.round(n * qty * 10) / 10;
  const preview = ps ? {
    calories: r1(ps.calories),
    protein:  r1(ps.protein),
    carbs:    r1(ps.carbs),
    fat:      r1(ps.fat),
  } : null;

  async function handleLog() {
    if (!selected) return;
    if (qty <= 0) { setError('Enter a servings count greater than 0.'); return; }
    setSaving(true);
    setError('');
    try {
      await addItemFromRecipe(mealId, { recipe_id: selected.id, servings: qty });
      setSelected(null);
      setNutrition(null);
      setServings('1');
      onAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log recipe.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Search box */}
      {!selected && (
        <div style={{ position: 'relative' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Search recipe</label>
            <input
              type="text"
              className="form-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Pasta, Chicken soup…"
              autoComplete="off"
            />
          </div>

          {(searching || results.length > 0 || (!searching && query.trim())) && (
            <div style={{
              position: 'absolute', zIndex: 50, top: '100%', left: 0, right: 0,
              background: '#fff', border: '1px solid var(--border)', borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '2px', maxHeight: '260px', overflowY: 'auto',
            }}>
              {searching && (
                <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Searching…</div>
              )}
              {!searching && results.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => selectRecipe(recipe)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '0.6rem 1rem', background: 'none', border: 'none',
                    cursor: 'pointer', borderBottom: '1px solid var(--border)',
                    fontSize: '0.875rem',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <span style={{ fontWeight: 600 }}>{recipe.title}</span>
                  {recipe.category && (
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{recipe.category}</span>
                  )}
                  {recipe.servings && (
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>· {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
                  )}
                </button>
              ))}
              {!searching && results.length === 0 && query.trim() && (
                <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recipes found.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected recipe + servings + nutrition preview */}
      {selected && (
        <div>
          {/* Recipe badge */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Selected recipe</label>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px',
              padding: '0.5rem 0.75rem', fontSize: '0.875rem',
            }}>
              <div>
                <span style={{ fontWeight: 600 }}>{selected.title}</span>
                {selected.category && <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{selected.category}</span>}
                {selected.servings  && <span style={{ color: 'var(--text-muted)', marginLeft: '0.75rem' }}>🍽 makes {selected.servings} serving{selected.servings !== 1 ? 's' : ''}</span>}
              </div>
              <button type="button" onClick={clearSelection} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', padding: '0 0 0 0.5rem' }} title="Change recipe">✕</button>
            </div>
          </div>

          {/* Servings + Log button row */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ width: '120px' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Servings eaten</label>
              <input
                type="number" min="0.1" step="0.1" className="form-input"
                value={servings} onChange={(e) => setServings(e.target.value)} placeholder="1"
              />
            </div>

            {/* Nutrition preview badges (auto-calculated × servings) */}
            {preview && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', flex: '1 1 auto' }}>
                <span style={{ background: '#FFF7ED', color: 'var(--primary)', border: '1px solid #FED7AA', borderRadius: '5px', padding: '0.3rem 0.55rem', fontSize: '0.8rem', fontWeight: 600 }}>{preview.calories} kcal</span>
                <span style={{ background: '#EFF6FF', color: '#3B82F6', border: '1px solid #BFDBFE', borderRadius: '5px', padding: '0.3rem 0.55rem', fontSize: '0.8rem' }}>{preview.protein}g P</span>
                <span style={{ background: '#F0FDF4', color: '#10B981', border: '1px solid #BBF7D0', borderRadius: '5px', padding: '0.3rem 0.55rem', fontSize: '0.8rem' }}>{preview.carbs}g C</span>
                <span style={{ background: '#FFFBEB', color: '#F59E0B', border: '1px solid #FDE68A', borderRadius: '5px', padding: '0.3rem 0.55rem', fontSize: '0.8rem' }}>{preview.fat}g F</span>
              </div>
            )}
            {!preview && nutrition === null && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flex: '1 1 auto' }}>Calculating nutrition…</span>
            )}

            <button type="button" className="btn btn-primary btn-sm" onClick={handleLog} disabled={saving} style={{ alignSelf: 'flex-end' }}>
              {saving ? '…' : 'Log'}
            </button>
          </div>
        </div>
      )}

      {error && <p style={{ color: '#DC2626', fontSize: '0.85rem', margin: '0.4rem 0 0' }}>{error}</p>}
    </div>
  );
}

// ── Combined Add Item form (tabbed) ───────────────────────────────────────────

function AddItemForm({ mealId, onAdded }) {
  const [tab, setTab] = useState('food'); // 'food' | 'recipe' | 'manual'

  const tabStyle = (active) => ({
    padding: '0.35rem 0.9rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600,
    background: active ? 'var(--primary)' : 'transparent',
    color:      active ? '#fff'           : 'var(--text-muted)',
    transition: 'background 0.15s',
  });

  return (
    <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '0.75rem', marginTop: '0.75rem' }}>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', background: '#F3F4F6', borderRadius: '8px', padding: '0.25rem', width: 'fit-content' }}>
        <button type="button" style={tabStyle(tab === 'food')}   onClick={() => setTab('food')}>Food database</button>
        <button type="button" style={tabStyle(tab === 'recipe')} onClick={() => setTab('recipe')}>From recipe</button>
        <button type="button" style={tabStyle(tab === 'manual')} onClick={() => setTab('manual')}>Manual entry</button>
      </div>

      {tab === 'food'   && <FoodSearchForm    mealId={mealId} onAdded={onAdded} />}
      {tab === 'recipe' && <RecipeSearchForm  mealId={mealId} onAdded={onAdded} />}
      {tab === 'manual' && <ManualForm        mealId={mealId} onAdded={onAdded} />}
    </div>
  );
}

function MealSection({ type, meal, date, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError]       = useState('');

  async function handleCreate() {
    setCreating(true);
    setError('');
    try {
      await createMeal({ meal_date: date, meal_type: type });
      setShowForm(true);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create meal.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteItem(itemId) {
    try { await deleteItem(meal.id, itemId); } catch { /* ignore */ }
    onRefresh();
  }

  const label = type.charAt(0).toUpperCase() + type.slice(1);
  const mealTotal = meal?.items?.reduce((sum, i) => sum + (Number(i.calories) || 0), 0) || 0;

  return (
    <div className="card" style={{ marginBottom: '1rem', overflow: 'visible' }}>
      <div className="card-body">
        <div className="flex-between" style={{ marginBottom: meal ? '0.75rem' : 0 }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{MEAL_ICONS[type]}</span> {label}
          </h3>
          {meal && mealTotal > 0 && (
            <span className="tag tag-orange">{mealTotal} kcal</span>
          )}
        </div>

        {!meal ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating…' : `+ Log ${label}`}
            </button>
            {error && <span style={{ color: '#DC2626', fontSize: '0.85rem' }}>{error}</span>}
          </div>
        ) : (
          <>
            {meal.items.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', margin: '0 0 0.5rem', fontSize: '0.9rem' }}>No items yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table-clean" style={{ width: '100%', marginBottom: '0.5rem' }}>
                  <thead>
                    <tr>
                      <th>Item</th><th>Qty</th><th>Unit</th>
                      <th>kcal</th><th>Protein</th><th>Carbs</th><th>Fat</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {meal.items.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                        <td><strong>{item.calories}</strong></td>
                        <td>{item.protein}g</td>
                        <td>{item.carbs}g</td>
                        <td>{item.fat}g</td>
                        <td>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '1rem', lineHeight: 1, padding: '0 0.25rem' }}
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {showForm ? (
              <AddItemForm mealId={meal.id} onAdded={() => { setShowForm(false); onRefresh(); }} />
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(true)}>+ Add item</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MacroSummary({ totals, calorieTarget }) {
  const pct = (val, max) => Math.min(100, max > 0 ? Math.round((val / max) * 100) : 0);
  const calPct = pct(totals.calories, calorieTarget || 2000);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div className="macro-grid">
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

      {calorieTarget > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <div className="flex-between" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
            <span>Daily calorie goal</span>
            <span>{totals.calories} / {calorieTarget} kcal ({calPct}%)</span>
          </div>
          <div className="progress-wrap">
            <div className={`progress-bar p-orange`} style={{ width: `${calPct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

function MealLogPage() {
  const [date, setDate]       = useState(todayISO);
  const [dayData, setDayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchDay = useCallback(() => {
    setLoading(true);
    setError('');
    getMeals(date)
      .then(({ data }) => setDayData(data))
      .catch(() => setError('Failed to load meals.'))
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => { fetchDay(); }, [fetchDay]);

  function getMealByType(type) {
    return dayData?.meals?.find((m) => m.meal_type === type) || null;
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.25rem' }}>Meal Log</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track your daily food intake and macros
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label htmlFor="date" style={{ fontWeight: 500, fontSize: '0.9rem' }}>Date:</label>
          <input
            id="date"
            type="date"
            className="form-input"
            style={{ width: 'auto' }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
      {error && (
        <div style={{ color: '#DC2626', background: '#FEF2F2', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {!loading && dayData && (
        <>
          <MacroSummary totals={dayData.totals} calorieTarget={dayData.calorie_target} />
          {MEAL_TYPES.map((type) => (
            <MealSection key={type} type={type} meal={getMealByType(type)} date={date} onRefresh={fetchDay} />
          ))}
        </>
      )}
    </div>
  );
}

export default MealLogPage;
