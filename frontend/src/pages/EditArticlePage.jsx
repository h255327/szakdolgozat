import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getArticle, updateArticle, deleteArticle } from '../services/articlesApi';

function EditArticlePage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [form, setForm]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  useEffect(() => {
    getArticle(id)
      .then(({ data }) => {
        const a = data.article;
        setForm({ title: a.title ?? '', summary: a.summary ?? '', category: a.category ?? '', content: a.content ?? '' });
      })
      .catch(() => setError('Failed to load article.'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await updateArticle(id, { title: form.title, summary: form.summary || undefined, category: form.category || undefined, content: form.content });
      setSuccess('Article updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update article.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this article?')) return;
    setDeleting(true);
    try {
      await deleteArticle(id);
      navigate('/articles');
    } catch {
      setError('Failed to delete article.');
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
          <Link to={`/articles/${id}`} className="btn btn-ghost btn-sm" style={{ marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            ← Back to article
          </Link>
          <h1 style={{ margin: 0 }}>Edit Article</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Article Info</h2>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Title *</label>
                <input id="title" name="title" type="text" className="form-input" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <input id="category" name="category" type="text" className="form-input" placeholder="e.g. nutrition, lifestyle, recipes" value={form.category} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="summary">Summary</label>
                <textarea id="summary" name="summary" rows={2} className="form-textarea" value={form.summary} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-body">
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600 }}>Content *</h2>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="content">Article body</label>
                <textarea id="content" name="content" rows={14} className="form-textarea" value={form.content} onChange={handleChange} required />
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
              <Link to={`/articles/${id}`} className="btn btn-ghost btn-lg">Cancel</Link>
            </div>
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditArticlePage;
