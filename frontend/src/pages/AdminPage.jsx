import { Link } from 'react-router-dom';

function AdminPage() {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 0.25rem' }}>Admin Panel</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage content and users
        </p>
      </div>

      <div className="grid-2" style={{ maxWidth: '600px' }}>
        <Link to="/articles/add" style={{ textDecoration: 'none' }}>
          <div className="card card-lift">
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '1.75rem' }}>📰</div>
              <div>
                <div style={{ fontWeight: 600 }}>Add Article</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Publish new content</div>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/articles" style={{ textDecoration: 'none' }}>
          <div className="card card-lift">
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '1.75rem' }}>📋</div>
              <div>
                <div style={{ fontWeight: 600 }}>Manage Articles</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Edit or remove articles</div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default AdminPage;
