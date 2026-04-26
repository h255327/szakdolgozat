import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecipe, deleteRecipe, getRecipeNutrition } from '../services/recipesApi';
import { logRecipeDirect } from '../services/mealsApi';
import { getRecipeComments, addRecipeComment } from '../services/commentsApi';
import { getRecipeRating, rateRecipe } from '../services/ratingsApi';
import { isAuthenticated, getToken } from '../services/auth';
import { jwtDecode } from '../utils/jwt';
import { getCatMeta } from '../utils/recipeCategories';
import CommentsSection from '../components/CommentsSection';

const MEAL_TYPES  = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };

function todayISO() { return new Date().toISOString().slice(0, 10); }

// nutrition: { perServing: { calories, protein, carbs, fat } } | null
function LogRecipePanel({ recipeId, nutrition }) {
  const [open,     setOpen]     = useState(false);
  const [mealType, setMealType] = useState('lunch');
  const [servings, setServings] = useState('1');
  const [logging,  setLogging]  = useState(false);
  const [success,  setSuccess]  = useState('');
  const [error,    setError]    = useState('');

  const qty = parseFloat(servings) || 1;
  const ps  = nutrition?.perServing;
  const r1  = (n) => Math.round(n * qty * 10) / 10;
  const preview = ps ? {
    calories: r1(ps.calories),
    protein:  r1(ps.protein),
    carbs:    r1(ps.carbs),
    fat:      r1(ps.fat),
  } : null;

  async function handleLog(e) {
    e.preventDefault();
    if (qty <= 0) { setError('Servings must be greater than 0.'); return; }
    setLogging(true);
    setError('');
    setSuccess('');
    try {
      await logRecipeDirect({
        recipe_id: recipeId,
        meal_type: mealType,
        meal_date: todayISO(),
        servings:  qty,
      });
      setSuccess(`Logged to ${MEAL_LABELS[mealType].toLowerCase()} for today ✓`);
      setOpen(false);
      setServings('1');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log recipe.');
    } finally {
      setLogging(false);
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Meal Log</h3>

        {success && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: '#16A34A', marginBottom: '0.75rem' }}>
            {success}
          </div>
        )}

        {!open ? (
          <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => { setOpen(true); setSuccess(''); }}>
            + Log this recipe
          </button>
        ) : (
          <form onSubmit={handleLog}>
            <div className="form-group" style={{ margin: '0 0 0.6rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Meal</label>
              <select className="form-input" value={mealType} onChange={(e) => setMealType(e.target.value)}>
                {MEAL_TYPES.map((t) => (
                  <option key={t} value={t}>{MEAL_LABELS[t]}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: '0 0 0.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Servings eaten</label>
              <input
                type="number" min="0.1" step="0.1" className="form-input"
                value={servings} onChange={(e) => setServings(e.target.value)} placeholder="1"
              />
            </div>

            {/* Nutrition preview (calculated) */}
            {preview && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <span style={{ background: '#FFF7ED', color: 'var(--primary)', border: '1px solid #FED7AA', borderRadius: '5px', padding: '0.25rem 0.5rem', fontSize: '0.78rem', fontWeight: 600 }}>{preview.calories} kcal</span>
                <span style={{ background: '#EFF6FF', color: '#3B82F6', border: '1px solid #BFDBFE', borderRadius: '5px', padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}>{preview.protein}g P</span>
                <span style={{ background: '#F0FDF4', color: '#10B981', border: '1px solid #BBF7D0', borderRadius: '5px', padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}>{preview.carbs}g C</span>
                <span style={{ background: '#FFFBEB', color: '#F59E0B', border: '1px solid #FDE68A', borderRadius: '5px', padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}>{preview.fat}g F</span>
              </div>
            )}

            {error && <p style={{ color: '#DC2626', fontSize: '0.82rem', margin: '0 0 0.5rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={logging} style={{ flex: 1 }}>
                {logging ? 'Logging…' : 'Log recipe'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setOpen(false); setError(''); }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── StarRatingCard ─────────────────────────────────────────────────────────────

function StarRatingCard({ recipeId, refreshKey }) {
  const [rating,  setRating]  = useState(null);  // { average, count, userScore }
  const [hovered, setHovered] = useState(0);
  const [saving,  setSaving]  = useState(false);
  const loggedIn = isAuthenticated();

  useEffect(() => {
    getRecipeRating(recipeId)
      .then(({ data }) => setRating(data))
      .catch(() => {});
  }, [recipeId, refreshKey]);

  async function handleRate(score) {
    if (!loggedIn || saving) return;
    setSaving(true);
    try {
      const { data } = await rateRecipe(recipeId, score);
      setRating(data);
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  }

  const displayScore = hovered || rating?.userScore || 0;

  return (
    <div className="card">
      <div className="card-body">
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Rating</h3>

        {/* Average */}
        {rating?.count > 0 ? (
          <div style={{ marginBottom: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F59E0B' }}>
              {'★'.repeat(Math.round(rating.average))}{'☆'.repeat(5 - Math.round(rating.average))}
            </span>
            <span style={{ marginLeft: '0.4rem' }}>
              {rating.average} / 5 &nbsp;·&nbsp; {rating.count} rating{rating.count !== 1 ? 's' : ''}
            </span>
          </div>
        ) : (
          <p style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            No ratings yet.
          </p>
        )}

        {/* Interactive stars */}
        {loggedIn ? (
          <div>
            <div
              style={{ display: 'flex', gap: '0.15rem', fontSize: '1.6rem', lineHeight: 1, cursor: saving ? 'wait' : 'pointer' }}
              onMouseLeave={() => setHovered(0)}
            >
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  style={{
                    color: star <= displayScore ? '#F59E0B' : '#D1D5DB',
                    transition: 'color 0.1s',
                    userSelect: 'none',
                  }}
                  onMouseEnter={() => setHovered(star)}
                  onClick={() => handleRate(star)}
                >
                  ★
                </span>
              ))}
            </div>
            {rating?.userScore && (
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Your rating: {rating.userScore} / 5
              </p>
            )}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <Link to="/login" style={{ color: 'var(--primary)' }}>Log in</Link> to rate this recipe.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Ingredient parser ──────────────────────────────────────────────────────────

function parseIngredients(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* not JSON */ }
    return value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function RecipeDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [recipe,           setRecipe]           = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [deleting,         setDeleting]         = useState(false);
  const [nutrition,        setNutrition]        = useState(null);
  const [ratingRefreshKey, setRatingRefreshKey] = useState(0);

  const currentUserId = isAuthenticated() ? jwtDecode(getToken())?.id : null;
  const isAdmin       = isAuthenticated() && jwtDecode(getToken())?.role === 'admin';

  useEffect(() => {
    getRecipe(id)
      .then(({ data }) => setRecipe(data.recipe))
      .catch(() => setError('Recipe not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getRecipeNutrition(id)
      .then(({ data }) => setNutrition(data))
      .catch(() => { /* nutrition is best-effort; ignore errors */ });
  }, [id]);

  async function handleDelete() {
    if (!window.confirm('Delete this recipe?')) return;
    setDeleting(true);
    try {
      await deleteRecipe(id);
      navigate('/recipes');
    } catch {
      setError('Failed to delete recipe.');
      setDeleting(false);
    }
  }

  if (loading) return (
    <div className="container" style={{ paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading recipe…
    </div>
  );
  if (error) return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ color: '#DC2626', background: '#FEF2F2', borderRadius: '8px', padding: '1rem' }}>{error}</div>
      <Link to="/recipes" className="btn btn-ghost" style={{ marginTop: '1rem' }}>← Back to recipes</Link>
    </div>
  );
  if (!recipe) return null;

  const ingredients = parseIngredients(recipe.ingredients);
  const isOwner     = currentUserId === recipe.user_id;
  const { css: catClass, icon } = getCatMeta(recipe.category);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <Link to="/recipes" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        ← Back to recipes
      </Link>

      <div className="two-col" style={{ alignItems: 'start' }}>
        {/* Main content */}
        <div>
          {/* Hero banner */}
          {recipe.image_url
            ? <img
                src={recipe.image_url}
                alt={recipe.title}
                style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1.5rem', display: 'block' }}
              />
            : <div className={`card-img-placeholder ${catClass}`} style={{ borderRadius: '12px', height: '220px', marginBottom: '1.5rem', fontSize: '4rem' }}>
                {icon}
              </div>
          }

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div>
              {recipe.category && (
                <span className="tag tag-orange" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                  {recipe.category}
                </span>
              )}
              <h1 style={{ margin: 0, fontSize: '1.8rem' }}>{recipe.title}</h1>
            </div>
            {isOwner && (
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <Link to={`/recipes/${id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            )}
          </div>

          {recipe.description && (
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {recipe.description}
            </p>
          )}

          {/* Instructions */}
          {recipe.instructions && (
            <div className="card">
              <div className="card-body">
                <h2 style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>Instructions</h2>
                <p style={{ margin: 0, whiteSpace: 'pre-line', lineHeight: '1.7', color: 'var(--text)' }}>
                  {recipe.instructions}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Log this recipe */}
          {isAuthenticated() && <LogRecipePanel recipeId={recipe.id} nutrition={nutrition} />}

          {/* Nutrition per serving */}
          {nutrition && (
            <div className="card">
              <div className="card-body">
                <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>
                  Nutrition
                  {nutrition.servings > 1 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.4rem' }}>per serving</span>
                  )}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { label: '🔥 Calories', value: `${nutrition.perServing.calories} kcal`, color: 'var(--primary)' },
                    { label: '💪 Protein',  value: `${nutrition.perServing.protein} g`,    color: '#3B82F6' },
                    { label: '🌾 Carbs',    value: `${nutrition.perServing.carbs} g`,      color: '#10B981' },
                    { label: '🧈 Fat',      value: `${nutrition.perServing.fat} g`,        color: '#F59E0B' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>
                      <span style={{ fontWeight: 600, color }}>{value}</span>
                    </div>
                  ))}
                </div>
                {nutrition.unmatched?.length > 0 && (
                  <p style={{ margin: '0.6rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    * Based on {nutrition.matched?.length} matched ingredient{nutrition.matched?.length !== 1 ? 's' : ''}. {nutrition.unmatched.length} could not be matched.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quick info */}
          <div className="card">
            <div className="card-body">
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Recipe Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recipe.prep_time && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>⏱ Prep time</span>
                    <span style={{ fontWeight: 600 }}>{recipe.prep_time} min</span>
                  </div>
                )}
                {recipe.servings && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>🍽 Servings</span>
                    <span style={{ fontWeight: 600 }}>{recipe.servings}</span>
                  </div>
                )}
                {recipe.category && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>🏷 Category</span>
                    <span className="tag tag-orange">{recipe.category}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Star rating */}
          <StarRatingCard recipeId={recipe.id} refreshKey={ratingRefreshKey} />

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div className="card">
              <div className="card-body">
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Ingredients</h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {ingredients.map((item, i) => (
                    <li key={i} style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <CommentsSection
        entityId={recipe.id}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        fetchComments={getRecipeComments}
        addComment={addRecipeComment}
        onDelete={() => setRatingRefreshKey(k => k + 1)}
      />
    </div>
  );
}

export default RecipeDetailPage;
