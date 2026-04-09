import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecipes, getCategories } from '../services/recipesApi';
import { isAuthenticated } from '../services/auth';
import { getCatMeta } from '../utils/recipeCategories';

function RecipeCard({ recipe }) {
  const { css: catClass, icon } = getCatMeta(recipe.category);
  return (
    <Link to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none' }}>
      <div className="card card-lift">
        {recipe.image_url
          ? <img src={recipe.image_url} alt={recipe.title} className="card-img" />
          : <div className={`card-img-placeholder ${catClass}`}>{icon}</div>
        }
        <div className="card-body">
          {recipe.category && (
            <span className="tag tag-orange" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
              {recipe.category}
            </span>
          )}
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1rem' }}>{recipe.title}</h3>
          {recipe.description && (
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {recipe.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {recipe.prep_time && <span>⏱ {recipe.prep_time} min</span>}
            {recipe.servings  && <span>🍽 {recipe.servings} servings</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

function RecipesPage() {
  const [recipes, setRecipes]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const timer = setTimeout(() => {
      getRecipes({ search: search.trim() || undefined, category: category || undefined })
        .then(({ data }) => setRecipes(data.recipes))
        .catch(() => setError('Failed to load recipes.'))
        .finally(() => setLoading(false));
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, category]);

  function handleReset() {
    setSearch('');
    setCategory('');
  }

  const hasFilters = search || category;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.25rem' }}>Recipes</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {loading ? 'Loading…' : `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        {isAuthenticated() && (
          <Link to="/recipes/add" className="btn btn-primary">+ Add Recipe</Link>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: '1', minWidth: '180px' }}
              placeholder="Search recipes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="form-select"
              style={{ flex: '0 0 auto', minWidth: '160px' }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {hasFilters && (
              <button className="btn btn-ghost btn-sm" onClick={handleReset}>
                ✕ Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {error && (
        <div style={{ color: '#DC2626', background: '#FEF2F2', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && recipes.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🍳</div>
          <h3>No recipes found</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {hasFilters ? 'Try adjusting your search filters.' : 'Be the first to add a recipe!'}
          </p>
          {isAuthenticated() && !hasFilters && (
            <Link to="/recipes/add" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Add Recipe
            </Link>
          )}
        </div>
      )}

      {!loading && recipes.length > 0 && (
        <div className="grid-3">
          {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}

      {loading && (
        <div className="grid-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card" style={{ opacity: 0.5 }}>
              <div className="card-img-placeholder cat-default" />
              <div className="card-body">
                <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '8px', width: '60%' }} />
                <div style={{ height: '16px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '4px', width: '80%' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecipesPage;
