import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../services/auth';

const NAV_LINKS = [
  { to: '/',          label: 'Home' },
  { to: '/recipes',   label: 'Recipes' },
  { to: '/articles',  label: 'Articles' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/planner',   label: 'Planner' },
  { to: '/meals',     label: 'Meal Log' },
  { to: '/shopping',  label: 'Shopping' },
  { to: '/chatbot',   label: 'Assistant' },
];

function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const loggedIn  = isAuthenticated();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function isActive(to) {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-logo">🥗 HealthyEat</Link>

        <div className="nav-links">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link${isActive(to) ? ' active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          {loggedIn ? (
            <>
              <Link
                to="/profile"
                className={`nav-link${isActive('/profile') ? ' active' : ''}`}
              >
                Profile
              </Link>
              <button className="btn btn-primary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
