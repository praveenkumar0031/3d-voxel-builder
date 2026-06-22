import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirection target after successful registration
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ username, email, password });
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed. Try a different username/email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <span style={styles.badge}>NEW OPERATOR</span>
          <h2 style={styles.title}>REGISTRATION FORM</h2>
          <p style={styles.subtitle}>Provision a new security clearance for the builder deck</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span>[ ERROR: {error.toUpperCase()} ]</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>USERNAME IDENTIFIER</label>
            <input
              type="text"
              placeholder="e.g. architect01"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={submitting}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>EMAIL ADDRESS</label>
            <input
              type="email"
              placeholder="operator@system.domain"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>PASSWORD CODE</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>CONFIRM PASSWORD</label>
            <input
              type="password"
              placeholder="Repeat password code"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={styles.submitBtn}
          >
            {submitting ? 'PROVISIONING...' : 'REGISTER OPERATOR'}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>ALREADY REGISTERED?</span>
          <Link to="/login" style={styles.link}>
            LOGIN SYSTEM
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: 'var(--va-bg)',
    minHeight: 'calc(100vh - 48px)',
    boxSizing: 'border-box',
  },
  panel: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: 'var(--va-panel)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    padding: '36px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  badge: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '9px',
    color: 'var(--va-tone-active)',
    letterSpacing: '2px',
    border: '1px solid rgba(62, 130, 241, 0.3)',
    backgroundColor: 'rgba(62, 130, 241, 0.05)',
    padding: '3px 8px',
    borderRadius: 'var(--va-radius-sm)',
  },
  title: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'var(--va-text)',
    margin: '16px 0 8px 0',
    letterSpacing: '1.5px',
  },
  subtitle: {
    margin: 0,
    fontSize: '12px',
    color: 'var(--va-text-dim)',
    lineHeight: '1.4',
  },
  errorAlert: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    border: '1px solid rgba(255, 107, 107, 0.2)',
    padding: '12px',
    borderRadius: 'var(--va-radius-sm)',
    marginBottom: '20px',
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-tone-error)',
    lineHeight: '1.4',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    color: 'var(--va-text-faint)',
    letterSpacing: '1px',
  },
  input: {
    width: '100%',
  },
  submitBtn: {
    marginTop: '12px',
    width: '100%',
    padding: '12px',
  },
  footer: {
    marginTop: '28px',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '11px',
    fontFamily: 'var(--va-font-display)',
  },
  footerText: {
    color: 'var(--va-text-faint)',
  },
  link: {
    color: 'var(--va-tone-active)',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

export default RegisterPage;
