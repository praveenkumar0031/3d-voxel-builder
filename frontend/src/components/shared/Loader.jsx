import React from 'react';

const Loader = ({ fullScreen = false, size = '40px' }) => {
  const loaderStyle = {
    width: size,
    height: size,
    border: '2px solid rgba(237, 232, 223, 0.1)',
    borderTop: '2px solid var(--va-tone-active)',
    borderRadius: '50%',
    animation: 'va-spin 0.8s linear infinite',
  };

  const containerStyle = fullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--va-bg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '12px',
      };

  return (
    <div style={containerStyle}>
      {/* Inject custom keyframe stylesheet if not already injected */}
      <style>{`
        @keyframes va-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={loaderStyle} />
      {fullScreen && (
        <span
          style={{
            fontFamily: 'var(--va-font-display)',
            fontSize: '11px',
            color: 'var(--va-text-dim)',
            letterSpacing: '2px',
          }}
        >
          INITIALIZING VIEWPORT...
        </span>
      )}
    </div>
  );
};

export default Loader;
