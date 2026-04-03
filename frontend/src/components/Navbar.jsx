import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../services/auth';

const NAV_LINKS = [
  { to: '/',          label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/recipes',   label: 'Recipes' },
  { to: '/articles',  label: 'Articles' },
  { to: '/planner',   label: 'Planner' },
  { to: '/meals',     label: 'Meal Log' },
  { to: '/shopping',  label: 'Shopping' },
  { to: '/chatbot',   label: 'Assistant' },
];

function Navbar() {
  const navigate   = useNavigate();
  const loggedIn   = isAuthenticated();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav>
      <div>
        <Link to="/"><strong>HealthyEat</strong></Link>
      </div>
      <ul>
        {NAV_LINKS.map(({ to, label }) => (
          <li key={to}>
            <Link to={to}>{label}</Link>
          </li>
        ))}
      </ul>
      <ul>
        {loggedIn ? (
          <>
            <li><Link to="/profile">Profile</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
