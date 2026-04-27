import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecipe, updateRecipe, deleteRecipe } from '../services/recipesApi';
import { CATEGORIES } from '../utils/recipeCategories';

function EditRecipePage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [form, setForm]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  useEffect(() => {
    getRecipe(id)
      .then(({ data }) => {
        const r = data.recipe;
        const ingredients = r.ingredients
          ? (typeof r.ingredients === 'string' ? (() => { try { return JSON.parse(r.ingredients); } catch { return [r.ingredients]; } })() : r.ingredients)
          : [];
        setForm({
          title: r.title ?? '', description: r.description ?? '', category: r.category ?? '',
          ingredients: ingredients.join('\n'), instructions: r.instructions ?? '',
          prep_time: r.prep_time ?? '', servings: r.servings ?? '',
        });
      })
      .catch(() => setError('Failed to load recipe.'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    const payload = {
      title:        form.title,
      description:  form.description  || undefined,
      category:     form.category     || undefined,
      instructions: form.instructions || undefined,
      prep_time:    form.prep_time    ? Number(form.prep_time) : undefined,
      servings:     form.servings     ? Number(form.servings)  : undefined,
      ingredients:  form.ingredients  ? form.ingredients.split('\n').map((s) => s.trim()).filter(Boolean) : undefined,
    };
    try {
      await updateRecipe(id, payload);
      setSuccess('Recipe updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update recipe.');
    } finally {
      setSaving(false);
    }
  }

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
    <div className="container" style={{ paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
  );
  if (!form) return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ color: '#DC2626', background: '#FEF2F2', borderRadius: '8px', padding: '1rem' }}>{error}</div>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to={`/recipes/${id}`} className="btn btn-ghost btn-sm" style={{ marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            ← Back to recipe
          </Link>
          <h1 style={{ margin: 0 }}>Edit Recipe</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Basic Info</h2>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Title *</label>
                <input id="title" name="title" type="text" className="form-input" value={form.title} onChange={handleChange} required />
              </div>
              <div className="grid-2-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="category">Category</label>
                  <select id="category" name="category" className="form-select" value={form.category} onChange={handleChange}>
                    <option value="">— select —</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="prep_time">Prep time (min)</label>
                  <input id="prep_time" name="prep_time" type="number" min="0" className="form-input" value={form.prep_time} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="servings">Servings</label>
                <input id="servings" name="servings" type="number" min="1" className="form-input" style={{ maxWidth: '120px' }} value={form.servings} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Description</h2>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="description">Short description</label>
                <textarea id="description" name="description" rows={2} className="form-textarea" value={form.description} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Ingredients</h2>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="ingredients">One ingredient per line</label>
                <textarea id="ingredients" name="ingredients" rows={7} className="form-textarea" value={form.ingredients} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Instructions</h2>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="instructions">Step-by-step instructions</label>
                <textarea id="instructions" name="instructions" rows={8} className="form-textarea" value={form.instructions} onChange={handleChange} />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#DC2626', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#16A34A', fontSize: '0.9rem' }}>
              ✓ {success}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <Link to={`/recipes/${id}`} className="btn btn-ghost btn-lg">Cancel</Link>
            </div>
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRecipePage;
