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
        <Link to="/" style={styles.logo}>
          VOXEL ARCHITECT
        </Link>
        
        <div style={styles.links}>
          <button onClick={toggleTheme} style={styles.themeToggle} title="Toggle theme mode">
            {theme === 'dark' ? '☀ LIGHT' : '☾ DARK'}
          </button>
          
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                style={{ ...styles.link, ...(isActive('/dashboard') ? styles.activeLink : {}) }}
              >
                DASHBOARD
              </Link>
              <Link 
                to="/history" 
                style={{ ...styles.link, ...(isActive('/history') ? styles.activeLink : {}) }}
              >
                HISTORY
              </Link>
              <Link 
                to="/builder" 
                style={{ ...styles.link, ...(isActive('/builder') ? styles.activeLink : {}) }}
              >
                BUILDER
              </Link>
              
              <div style={styles.userSection}>
                <span style={styles.username}>
                  [{user.username.toUpperCase()}]
                </span>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                  LOGOUT
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                style={{ ...styles.link, ...(isActive('/login') ? styles.activeLink : {}) }}
              >
                LOGIN
              </Link>
              <Link 
                to="/register" 
                style={{ ...styles.link, ...(isActive('/register') ? styles.activeLink : {}) }}
              >
                REGISTER
              </Link>
            </>
          )}
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
    height: '48px',
    backgroundColor: 'var(--va-panel)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--va-panel-border)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'var(--va-text)',
    textDecoration: 'none',
    letterSpacing: '2px',
    textShadow: '0 0 8px rgba(237, 232, 223, 0.2)',
    transition: 'opacity 0.2s ease',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    letterSpacing: '1px',
  },
  link: {
    color: 'var(--va-text-dim)',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    padding: '4px 8px',
    borderRadius: 'var(--va-radius-sm)',
  },
  activeLink: {
    color: 'var(--va-tone-active)',
    backgroundColor: 'rgba(62, 130, 241, 0.08)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    borderLeft: '1px solid var(--va-panel-border)',
    paddingLeft: '16px',
  },
  username: {
    color: 'var(--va-text-faint)',
    fontWeight: 'normal',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--va-tone-error)',
    cursor: 'pointer',
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    letterSpacing: '1px',
    padding: '4px 8px',
    borderRadius: 'var(--va-radius-sm)',
    transition: 'background-color 0.2s ease, opacity 0.2s ease',
  },
  themeToggle: {
    background: 'transparent',
    border: '1px solid var(--va-panel-border)',
    color: 'var(--va-text-dim)',
    cursor: 'pointer',
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    letterSpacing: '1px',
    padding: '4px 8px',
    borderRadius: 'var(--va-radius-sm)',
    transition: 'all 0.2s ease',
    marginRight: '8px',
  },
};

export default Navbar;
