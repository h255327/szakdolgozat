import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../services/articlesApi';
import { isAuthenticated, getToken } from '../services/auth';
import { jwtDecode } from '../utils/jwt';

const CAT_GRADIENTS = {
  nutrition:             'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  recipes:               'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  lifestyle:             'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
  fitness:               'linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)',
  'traditional-cuisine': 'linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)',
  'cooking-methods':     'linear-gradient(135deg, #f46b45 0%, #eea849 100%)',
  'healthy-habits':      'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
  'diet-culture':        'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
  'ingredient-knowledge':'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)',
  'meal-planning':       'linear-gradient(135deg, #7f7fd5 0%, #86a8e7 100%)',
  default:               'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};
const CAT_ICON = {
  nutrition:              '🥗',
  recipes:                '🍳',
  lifestyle:              '🌿',
  fitness:                '💪',
  'traditional-cuisine':  '🫕',
  'cooking-methods':      '🔥',
  'healthy-habits':       '🌱',
  'diet-culture':         '🧬',
  'ingredient-knowledge': '🫒',
  'meal-planning':        '📋',
  default:                '📰',
};

function ArticleCard({ article }) {
  const cat  = article.category?.toLowerCase() || 'default';
  const grad = CAT_GRADIENTS[cat] || CAT_GRADIENTS.default;
  const icon = CAT_ICON[cat] || CAT_ICON.default;
  return (
    <Link to={`/articles/${article.id}`} style={{ textDecoration: 'none' }}>
      <div className="card card-lift">
        {article.image_url
          ? <img src={article.image_url} alt={article.title} className="card-img" />
          : <div className="card-img-placeholder" style={{ background: grad }}>{icon}</div>
        }
        <div className="card-body">
          {article.category && (
            <span className="tag tag-purple" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
              {article.category}
            </span>
          )}
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1rem' }}>{article.title}</h3>
          {article.summary && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {article.summary}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const isAdmin = isAuthenticated() && jwtDecode(getToken())?.role === 'admin';

  useEffect(() => {
    getArticles()
      .then(({ data }) => setArticles(data.articles))
      .catch(() => setError('Failed to load articles.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.25rem' }}>Articles</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Nutrition tips, guides, and healthy eating advice
          </p>
        </div>
        {isAdmin && <Link to="/articles/add" className="btn btn-primary">+ Add Article</Link>}
      </div>

      {error && (
        <div style={{ color: '#DC2626', background: '#FEF2F2', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="grid-3">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="card" style={{ opacity: 0.5 }}>
              <div className="card-img-placeholder" style={{ background: '#e5e7eb' }} />
              <div className="card-body">
                <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '8px', width: '40%' }} />
                <div style={{ height: '16px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '4px', width: '80%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📰</div>
          <h3>No articles yet</h3>
          {isAdmin && <Link to="/articles/add" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Add Article</Link>}
        </div>
      )}

      {!loading && articles.length > 0 && (
        <div className="grid-3">
          {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}
    </div>
  );
}

export default ArticlesPage;
