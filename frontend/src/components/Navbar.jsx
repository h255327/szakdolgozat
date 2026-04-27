import { useState, useEffect } from 'react';
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
  { to: '/progress',  label: 'Progress' },
];

function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const loggedIn  = isAuthenticated();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on every route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Close mobile menu when clicking outside the navbar
  useEffect(() => {
    if (!menuOpen) return;
    function handleOutsideClick(e) {
      if (!e.target.closest('.navbar')) setMenuOpen(false);
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [menuOpen]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function isActive(to) {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  }

  return (
    <nav className={`navbar${menuOpen ? ' nav-mobile-open' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="nav-logo">🥗 HealthyEat</Link>

        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

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
