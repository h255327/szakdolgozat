import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecipe, deleteRecipe } from '../services/recipesApi';
import { isAuthenticated, getToken } from '../services/auth';
import { jwtDecode } from '../utils/jwt';
import { getCatMeta } from '../utils/recipeCategories';

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
  const [recipe, setRecipe]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [deleting, setDeleting] = useState(false);

  const currentUserId = isAuthenticated() ? jwtDecode(getToken())?.id : null;

  useEffect(() => {
    getRecipe(id)
      .then(({ data }) => setRecipe(data.recipe))
      .catch(() => setError('Recipe not found.'))
      .finally(() => setLoading(false));
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
    </div>
  );
}

export default RecipeDetailPage;
