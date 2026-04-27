import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getArticle, deleteArticle } from '../services/articlesApi';
import { getArticleComments, addArticleComment } from '../services/commentsApi';
import { isAuthenticated, getToken } from '../services/auth';
import { jwtDecode } from '../utils/jwt';
import CommentsSection from '../components/CommentsSection';
import ImgWithFallback from '../components/ImgWithFallback';

function ArticleDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [article, setArticle]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [deleting, setDeleting] = useState(false);

  const currentUserId = isAuthenticated() ? jwtDecode(getToken())?.id : null;
  const isAdmin       = isAuthenticated() && jwtDecode(getToken())?.role === 'admin';

  useEffect(() => {
    getArticle(id)
      .then(({ data }) => setArticle(data.article))
      .catch(() => setError('Article not found.'))
      .finally(() => setLoading(false));
  }, [id]);

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
    <div className="container" style={{ paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading article…
    </div>
  );
  if (error) return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ color: '#DC2626', background: '#FEF2F2', borderRadius: '8px', padding: '1rem' }}>{error}</div>
      <Link to="/articles" className="btn btn-ghost" style={{ marginTop: '1rem' }}>← Back to articles</Link>
    </div>
  );
  if (!article) return null;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem', maxWidth: '780px' }}>
      <Link to="/articles" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        ← Back to articles
      </Link>

      <div className="card">
        <ImgWithFallback
          src={article.image_url}
          alt={article.title}
          imgStyle={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '12px 12px 0 0', display: 'block' }}
          fallbackClassName="cat-article"
          fallbackStyle={{ height: '180px', borderRadius: '12px 12px 0 0', fontSize: '3.5rem' }}
          fallbackIcon="📰"
        />
        <div className="card-body" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              {article.category && (
                <span className="tag tag-purple" style={{ marginBottom: '0.6rem', display: 'inline-block' }}>
                  {article.category}
                </span>
              )}
              <h1 style={{ margin: 0, fontSize: '1.8rem', lineHeight: '1.3' }}>{article.title}</h1>
              {article.summary && (
                <p style={{ margin: '0.75rem 0 0', fontSize: '1.05rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.5' }}>
                  {article.summary}
                </p>
              )}
            </div>
            {isAdmin && (
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <Link to={`/articles/${id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 1.5rem' }} />

          <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', color: 'var(--text)', fontSize: '1rem' }}>
            {article.content}
          </div>
        </div>
      </div>

      <CommentsSection
        entityId={article.id}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        fetchComments={getArticleComments}
        addComment={addArticleComment}
      />
    </div>
  );
}

export default ArticleDetailPage;
