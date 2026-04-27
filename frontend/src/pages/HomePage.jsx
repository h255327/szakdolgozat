import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecipes } from '../services/recipesApi';
import { getArticles } from '../services/articlesApi';
import { isAuthenticated } from '../services/auth';
import ImgWithFallback from '../components/ImgWithFallback';

const FEATURES = [
  { icon: '🍽️', title: 'Recipe Library',    desc: 'Browse hundreds of healthy recipes filtered by category and diet type.' },
  { icon: '📅', title: 'Meal Planner',      desc: 'Plan your week ahead and keep your nutrition on track every day.' },
  { icon: '📊', title: 'Calorie Tracking',  desc: 'Log your meals and monitor your daily calorie and macro intake.' },
  { icon: '🛒', title: 'Shopping List',     desc: 'Auto-generate a grocery list straight from your meal plan.' },
];

import { getCatMeta } from '../utils/recipeCategories';

function RecipeCard({ recipe }) {
  const { css: catClass, icon } = getCatMeta(recipe.category);
  return (
    <Link to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none' }}>
      <div className="card card-lift">
        <ImgWithFallback
          src={recipe.image_url}
          alt={recipe.title}
          imgClassName="card-img"
          fallbackClassName={catClass}
          fallbackIcon={icon}
        />
        <div className="card-body">
          {recipe.category && <span className="tag tag-orange" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>{recipe.category}</span>}
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1rem' }}>{recipe.title}</h3>
          {recipe.description && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{recipe.description}</p>}
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ article }) {
  return (
    <Link to={`/articles/${article.id}`} style={{ textDecoration: 'none' }}>
      <div className="card card-lift">
        <ImgWithFallback
          src={article.image_url}
          alt={article.title}
          imgClassName="card-img"
          fallbackClassName="cat-default"
          fallbackStyle={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          fallbackIcon="📰"
        />
        <div className="card-body">
          <h3 style={{ margin: '0 0 0.4rem', fontSize: '1rem' }}>{article.title}</h3>
          {article.summary && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.summary}</p>}
        </div>
      </div>
    </Link>
  );
}

function HomePage() {
  const [recipes, setRecipes]   = useState([]);
  const [articles, setArticles] = useState([]);
  const loggedIn = isAuthenticated();

  useEffect(() => {
    getRecipes().then(({ data }) => setRecipes(data.recipes.slice(0, 3))).catch(() => {});
    getArticles().then(({ data }) => setArticles((data.articles || data).slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      {/* Hero */}
      <section className="hero">
        <p className="hero-eyebrow">Your personal nutrition companion</p>
        <h1 className="hero-title">Eat better.<br /><span className="accent">Feel better.</span></h1>
        <p className="hero-sub">
          Plan your diet, discover nutritious recipes, track your meals,<br />
          and reach your health goals — all in one place.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {loggedIn ? (
            <>
              <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</Link>
              <Link to="/recipes"   className="btn btn-secondary btn-lg">Browse Recipes</Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">Get started free</Link>
              <Link to="/login"    className="btn btn-secondary btn-lg">Sign in</Link>
            </>
          )}
        </div>
      </section>

      <div>
        {/* Features */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Everything you need</h2>
          <div className="grid-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card" style={{ textAlign: 'center' }}>
                <div className="card-body">
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>{f.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Recipes */}
        <section style={{ marginBottom: '3rem' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Featured Recipes</h2>
            <Link to="/recipes" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {recipes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍳</div>
              <p>No recipes yet. <Link to="/recipes/add">Add the first one!</Link></p>
            </div>
          ) : (
            <div className="grid-3">
              {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
            </div>
          )}
        </section>

        {/* Featured Articles */}
        <section style={{ marginBottom: '3rem' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>From the Blog</h2>
            <Link to="/articles" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {articles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📰</div>
              <p>No articles yet.</p>
            </div>
          ) : (
            <div className="grid-3">
              {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          )}
        </section>

        {/* Bottom CTA */}
        {!loggedIn && (
          <section style={{ textAlign: 'center', background: 'var(--primary-light)', borderRadius: '16px', padding: '3rem 2rem', marginBottom: '3rem' }}>
            <h2 style={{ margin: '0 0 0.75rem' }}>Start your journey today</h2>
            <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)' }}>
              Create a free account and take control of your nutrition.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">Sign up for free</Link>
          </section>
        )}
      </div>
    </div>
  );
}

export default HomePage;
