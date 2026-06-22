import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide the navbar on the full-screen builder route
  if (location.pathname.startsWith('/builder')) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Brand Logo Wordmark */}
        <Link to="/" style={styles.logo}>
          GESTIC<span style={styles.logoAccent}>STUDIO</span>
          <span style={styles.logoDot}>•</span>
        </Link>
        
        {/* Navigation & Controls */}
        <div style={styles.navGroup}>
          <div style={styles.links}>
            {user ? (
              <>
                <div style={styles.linkWrapper}>
                  <Link 
                    to="/dashboard" 
                    style={{ ...styles.link, ...(isActive('/dashboard') ? styles.activeLink : {}) }}
                  >
                    DASHBOARD
                  </Link>
                  {isActive('/dashboard') && <div style={styles.activeIndicator} />}
                </div>
                
                <div style={styles.linkWrapper}>
                  <Link 
                    to="/history" 
                    style={{ ...styles.link, ...(isActive('/history') ? styles.activeLink : {}) }}
                  >
                    HISTORY
                  </Link>
                  {isActive('/history') && <div style={styles.activeIndicator} />}
                </div>

                <div style={styles.linkWrapper}>
                  <Link 
                    to="/builder" 
                    style={{ ...styles.link, ...(isActive('/builder') ? styles.activeLink : {}) }}
                  >
                    BUILDER
                  </Link>
                  {isActive('/builder') && <div style={styles.activeIndicator} />}
                </div>
              </>
            ) : (
              <>
                <div style={styles.linkWrapper}>
                  <Link 
                    to="/login" 
                    style={{ ...styles.link, ...(isActive('/login') ? styles.activeLink : {}) }}
                  >
                    LOGIN
                  </Link>
                  {isActive('/login') && <div style={styles.activeIndicator} />}
                </div>

                <div style={styles.linkWrapper}>
                  <Link 
                    to="/register" 
                    style={{ ...styles.link, ...(isActive('/register') ? styles.activeLink : {}) }}
                  >
                    REGISTER
                  </Link>
                  {isActive('/register') && <div style={styles.activeIndicator} />}
                </div>
              </>
            )}
          </div>

          <div style={styles.controlSeparator} />

          {/* Action Row: Theme Switch & Session info */}
          <div style={styles.actions}>
            <button onClick={toggleTheme} style={styles.themeToggle} title="Toggle interface theme">
              {theme === 'dark' ? '☀' : '☾'}
            </button>

            {user && (
              <div style={styles.userSection}>
                <span style={styles.username}>
                  [{user.username.toUpperCase()}]
                </span>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                  LOGOUT
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '54px', // Slightly taller for cleaner padding
    backgroundColor: 'var(--va-panel)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--va-panel-border)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '15px',
    fontWeight: 'bold',
    color: 'var(--va-text)',
    textDecoration: 'none',
    letterSpacing: '2.5px',
    display: 'flex',
    alignItems: 'center',
    transition: 'opacity 0.2s ease',
  },
  logoAccent: {
    color: 'var(--va-text-dim)',
    fontWeight: 'normal',
  },
  logoDot: {
    color: 'var(--va-tone-active)',
    marginLeft: '4px',
    fontSize: '18px',
    lineHeight: 0,
  },
  navGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  linkWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  link: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    fontWeight: '500',
    letterSpacing: '1px',
    color: 'var(--va-text-dim)',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: 'var(--va-radius-sm)',
    transition: 'color 0.25s ease, background-color 0.25s ease',
  },
  activeLink: {
    color: 'var(--va-tone-active)',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: '-8px',
    left: '12px',
    right: '12px',
    height: '2px',
    backgroundColor: 'var(--va-tone-active)',
    boxShadow: '0 0 8px var(--va-tone-active)',
    borderRadius: '2px',
  },
  controlSeparator: {
    width: '1px',
    height: '20px',
    backgroundColor: 'var(--va-panel-border)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  themeToggle: {
    background: 'none',
    border: 'none',
    color: 'var(--va-text-dim)',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease, background-color 0.2s ease',
    width: '28px',
    height: '28px',
    ':hover': {
      backgroundColor: 'var(--va-panel-border)',
      color: 'var(--va-text)',
    }
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    borderLeft: '1px solid var(--va-panel-border)',
    paddingLeft: '16px',
  },
  username: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-text-faint)',
    letterSpacing: '0.5px',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid rgba(255, 107, 107, 0.2)',
    color: 'var(--va-tone-error)',
    cursor: 'pointer',
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    letterSpacing: '1px',
    padding: '4px 10px',
    borderRadius: 'var(--va-radius-sm)',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 107, 107, 0.08)',
      borderColor: 'var(--va-tone-error)',
    }
  },
};

export default Navbar;
