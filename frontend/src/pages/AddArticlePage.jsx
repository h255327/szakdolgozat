import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createArticle } from '../services/articlesApi';

const EMPTY_FORM = { title: '', summary: '', category: '', content: '' };

function AddArticlePage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState(EMPTY_FORM);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { data } = await createArticle({
        title:    form.title,
        summary:  form.summary   || undefined,
        category: form.category  || undefined,
        content:  form.content,
      });
      navigate(`/articles/${data.article.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create article.');
      setSaving(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/articles" className="btn btn-ghost btn-sm" style={{ marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            ← Back to articles
          </Link>
          <h1 style={{ margin: 0 }}>Add Article</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Article Info</h2>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Title *</label>
                <input id="title" name="title" type="text" className="form-input" placeholder="e.g. The Benefits of Meal Planning" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <input id="category" name="category" type="text" className="form-input" placeholder="e.g. nutrition, lifestyle, recipes" value={form.category} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="summary">Summary</label>
                <textarea id="summary" name="summary" rows={2} className="form-textarea" placeholder="A brief overview of the article…" value={form.summary} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Content *</h2>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="content">Article body</label>
                <textarea id="content" name="content" rows={14} className="form-textarea" placeholder="Write your article here…" value={form.content} onChange={handleChange} required />
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
              {saving ? 'Publishing…' : 'Publish Article'}
            </button>
            <Link to="/articles" className="btn btn-ghost btn-lg">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddArticlePage;
