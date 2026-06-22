import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        <span style={styles.errorCode}>[ ERR_404 ]</span>
        <h1 style={styles.title}>FILE NOT FOUND</h1>
        <p style={styles.message}>
          The directory or page route you are trying to access does not exist on the current system mainframe.
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="btn-primary" 
          style={styles.backBtn}
        >
          RETURN TO SAFETY
        </button>
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
    maxWidth: '460px',
    width: '100%',
    backgroundColor: 'var(--va-panel)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    padding: '48px 36px',
    textAlign: 'center',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  errorCode: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-tone-error)',
    letterSpacing: '3px',
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    padding: '4px 10px',
    border: '1px solid rgba(255, 107, 107, 0.2)',
    borderRadius: 'var(--va-radius-sm)',
    marginBottom: '24px',
  },
  title: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '22px',
    fontWeight: 'bold',
    color: 'var(--va-text)',
    margin: '0 0 16px 0',
    letterSpacing: '2px',
  },
  message: {
    margin: '0 0 32px 0',
    fontSize: '13px',
    color: 'var(--va-text-dim)',
    lineHeight: '1.6',
  },
  backBtn: {
    padding: '12px 24px',
    fontSize: '11px',
  },
};

export default NotFoundPage;
