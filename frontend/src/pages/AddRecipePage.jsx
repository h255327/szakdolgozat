import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createRecipe } from '../services/recipesApi';
import { CATEGORIES } from '../utils/recipeCategories';

const EMPTY_FORM = { title: '', description: '', category: '', ingredients: '', instructions: '', prep_time: '', servings: '' };

function AddRecipePage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState(EMPTY_FORM);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      title:        form.title,
      description:  form.description  || undefined,
      category:     form.category     || undefined,
      instructions: form.instructions || undefined,
      prep_time:    form.prep_time    ? Number(form.prep_time)  : undefined,
      servings:     form.servings     ? Number(form.servings)   : undefined,
      ingredients:  form.ingredients  ? form.ingredients.split('\n').map((s) => s.trim()).filter(Boolean) : undefined,
    };
    try {
      const { data } = await createRecipe(payload);
      navigate(`/recipes/${data.recipe.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create recipe.');
      setSaving(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/recipes" className="btn btn-ghost btn-sm" style={{ marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            ← Back to recipes
          </Link>
          <h1 style={{ margin: 0 }}>Add Recipe</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Basic Info</h2>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Title *</label>
                <input id="title" name="title" type="text" className="form-input" value={form.title} onChange={handleChange} placeholder="e.g. Overnight Oats with Berries" required />
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
                  <input id="prep_time" name="prep_time" type="number" min="0" className="form-input" placeholder="e.g. 15" value={form.prep_time} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="servings">Servings</label>
                <input id="servings" name="servings" type="number" min="1" className="form-input" style={{ maxWidth: '120px' }} placeholder="e.g. 2" value={form.servings} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Description</h2>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="description">Short description</label>
                <textarea id="description" name="description" rows={2} className="form-textarea" placeholder="A brief description of the dish…" value={form.description} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Ingredients</h2>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="ingredients">One ingredient per line</label>
                <textarea id="ingredients" name="ingredients" rows={7} className="form-textarea" placeholder={"200g oats\n1 banana\n2 tbsp honey\n100ml almond milk"} value={form.ingredients} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Instructions</h2>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="instructions">Step-by-step instructions</label>
                <textarea id="instructions" name="instructions" rows={8} className="form-textarea" placeholder="Describe the preparation steps…" value={form.instructions} onChange={handleChange} />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#DC2626', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? 'Creating…' : 'Create Recipe'}
            </button>
            <Link to="/recipes" className="btn btn-ghost btn-lg">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRecipePage;
