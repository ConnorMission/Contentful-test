import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import Search from './Search';

function Navbar() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" className="nav-logo">
            Contentful <span className="accent-text">CMS</span>
          </Link>
          <Search />
        </div>
        
        <div className="nav-actions">
          {isLoading ? (
            <span className="nav-loading">...</span>
          ) : isAuthenticated ? (
            <div className="user-menu">
              <Link to="/profile" className="user-info" style={{ textDecoration: 'none', color: 'inherit' }}>
                <img src={user.picture} alt={user.name} className="user-avatar" />
                <span className="user-name">{user.name}</span>
              </Link>
              <button 
                className="btn-auth btn-logout" 
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                Log Out
              </button>
            </div>
          ) : (
            <button className="btn-auth btn-login" onClick={() => loginWithRedirect()}>
              Log In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
