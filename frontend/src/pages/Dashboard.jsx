import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getScenes, deleteScene, updateScene } from '../api/scenesApi';
import { getMe } from '../api/authApi';
import Loader from '../components/shared/Loader';

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Local state for inline renaming
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  
  // Local state for inline delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      // Re-fetch user profile to get updated stats (totalScenes, totalVoxels)
      const updatedUser = await getMe();
      setUser(updatedUser);

      // Fetch all user scenes
      const allScenes = await getScenes();
      // Keep only recent 6 scenes for dashboard
      setScenes(allScenes.slice(0, 6));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartRename = (scene) => {
    setRenameId(scene._id);
    setRenameValue(scene.name);
  };

  const handleSaveRename = async (id) => {
    if (!renameValue.trim()) return;
    try {
      await updateScene(id, { name: renameValue });
      setRenameId(null);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      setError('Failed to rename scene.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteScene(id);
      setConfirmDeleteId(null);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      setError('Failed to delete scene.');
    }
  };

  if (loading) {
    return <Loader fullScreen={true} />;
  }

  // Format member date
  const memberDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }).toUpperCase()
    : 'N/A';

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.systemStatus}>// ACTIVE OPERATOR CLEARANCE</span>
          <h1 style={styles.title}>WELCOME BACK, {user?.username.toUpperCase()}</h1>
        </div>
        <button 
          onClick={() => navigate('/builder')} 
          className="btn-primary" 
          style={styles.newSceneBtn}
        >
          + NEW SCENE
        </button>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <span>[ ERROR: {error.toUpperCase()} ]</span>
        </div>
      )}

      {/* Stats Deck */}
      <div style={styles.statsDeck}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>SAVED SCENES</span>
          <span style={styles.statValue}>{String(user?.totalScenes || 0).padStart(3, '0')}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>TOTAL VOXELS</span>
          <span style={styles.statValue}>{String(user?.totalVoxels || 0).padStart(5, '0')}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>OPERATOR SINCE</span>
          <span style={styles.statValue} style={{ ...styles.statValue, fontSize: '20px', letterSpacing: '2px', height: '42px', display: 'flex', alignItems: 'center' }}>
            {memberDate}
          </span>
        </div>
      </div>

      {/* Recent Scenes Grid */}
      <div style={styles.sectionHeader}>
        <span style={styles.sectionNumber}>// 01</span>
        <h2 style={styles.sectionTitle}>RECENT TRANSMISSIONS (MAX 6)</h2>
      </div>

      {scenes.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>NO SAVED VOXEL SCENES DETECTED IN ARCHIVE.</p>
          <button 
            onClick={() => navigate('/builder')} 
            className="btn-secondary" 
            style={styles.emptyBtn}
          >
            CREATE FIRST SCENE
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {scenes.map((scene) => (
            <div key={scene._id} style={styles.card}>
              {/* Thumbnail Container */}
              {scene.thumbnail ? (
                <img src={scene.thumbnail} alt={scene.name} style={styles.thumbnail} />
              ) : (
                <div style={styles.thumbnailPlaceholder}>
                  <span>NO CAPTURED SNAPSHOT</span>
                </div>
              )}

              {/* Card Body */}
              <div style={styles.cardBody}>
                {renameId === scene._id ? (
                  <div style={styles.renameContainer}>
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      style={styles.renameInput}
                      autoFocus
                    />
                    <div style={styles.renameActions}>
                      <button onClick={() => handleSaveRename(scene._id)} style={styles.saveBtn}>SAVE</button>
                      <button onClick={() => setRenameId(null)} style={styles.cancelBtn}>CANCEL</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 style={styles.sceneName}>{scene.name.toUpperCase()}</h3>
                    {scene.description && <p style={styles.sceneDesc}>{scene.description}</p>}
                    
                    <div style={styles.sceneMetadata}>
                      <div>
                        <span style={styles.metaLabel}>VOXELS: </span>
                        <span style={styles.metaValue}>{scene.voxelCount}</span>
                      </div>
                      <div>
                        <span style={styles.metaLabel}>UPDATED: </span>
                        <span style={styles.metaValue}>
                          {new Date(scene.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Card Actions */}
              <div style={styles.cardActions}>
                {confirmDeleteId === scene._id ? (
                  <div style={styles.deleteConfirmContainer}>
                    <span style={styles.deleteConfirmText}>CONFIRM DELETE?</span>
                    <div style={styles.deleteConfirmButtons}>
                      <button 
                        onClick={() => handleDelete(scene._id)} 
                        style={styles.deleteConfirmYes}
                      >
                        [YES]
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(null)} 
                        style={styles.deleteConfirmNo}
                      >
                        [NO]
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => navigate(`/builder/${scene._id}`)} 
                      style={styles.actionBtnOpen}
                    >
                      OPEN
                    </button>
                    <button 
                      onClick={() => handleStartRename(scene)} 
                      style={styles.actionBtnRename}
                      disabled={renameId !== null}
                    >
                      RENAME
                    </button>
                    <button 
                      onClick={() => setConfirmDeleteId(scene._id)} 
                      style={styles.actionBtnDelete}
                      disabled={renameId !== null}
                    >
                      DELETE
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '40px 20px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    borderBottom: '1px solid var(--va-panel-border)',
    paddingBottom: '20px',
  },
  systemStatus: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-tone-active)',
    letterSpacing: '2px',
  },
  title: {
    margin: '8px 0 0 0',
    fontSize: '24px',
    fontFamily: 'var(--va-font-display)',
    color: 'var(--va-text)',
  },
  newSceneBtn: {
    padding: '10px 20px',
  },
  errorAlert: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    border: '1px solid rgba(255, 107, 107, 0.2)',
    padding: '12px',
    borderRadius: 'var(--va-radius-sm)',
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-tone-error)',
    textAlign: 'center',
  },
  statsDeck: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  statCard: {
    backgroundColor: 'var(--va-panel)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statLabel: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-text-faint)',
    letterSpacing: '1.5px',
  },
  statValue: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '36px',
    fontWeight: 'bold',
    color: 'var(--va-text)',
    letterSpacing: '1px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '12px',
  },
  sectionNumber: {
    fontFamily: 'var(--va-font-display)',
    color: 'var(--va-tone-active)',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontFamily: 'var(--va-font-display)',
    color: 'var(--va-text)',
    letterSpacing: '2px',
  },
  emptyState: {
    backgroundColor: 'var(--va-panel)',
    border: '1px dashed var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    padding: '60px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  emptyText: {
    margin: 0,
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-text-faint)',
    letterSpacing: '1.5px',
  },
  emptyBtn: {
    fontSize: '11px',
    padding: '8px 16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: 'var(--va-panel)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
    borderBottom: '1px solid var(--va-panel-border)',
    backgroundColor: '#000',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '160px',
    backgroundColor: '#05070a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    color: 'var(--va-text-faint)',
    borderBottom: '1px solid var(--va-panel-border)',
  },
  cardBody: {
    padding: '16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  sceneName: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '13px',
    fontWeight: 'bold',
    color: 'var(--va-text)',
    margin: '0 0 8px 0',
    letterSpacing: '1px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sceneDesc: {
    margin: '0 0 16px 0',
    fontSize: '12px',
    color: 'var(--va-text-dim)',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    height: '34px',
  },
  sceneMetadata: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
  },
  metaLabel: {
    color: 'var(--va-text-faint)',
  },
  metaValue: {
    color: 'var(--va-text-dim)',
  },
  renameContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  renameInput: {
    width: '100%',
    padding: '6px 10px',
  },
  renameActions: {
    display: 'flex',
    gap: '8px',
  },
  saveBtn: {
    flex: 1,
    background: 'var(--va-tone-active)',
    border: 'none',
    color: 'var(--va-text)',
    fontSize: '10px',
    padding: '4px',
    cursor: 'pointer',
    borderRadius: '2px',
  },
  cancelBtn: {
    flex: 1,
    background: 'transparent',
    border: '1px solid var(--va-text-dim)',
    color: 'var(--va-text-dim)',
    fontSize: '10px',
    padding: '4px',
    cursor: 'pointer',
    borderRadius: '2px',
  },
  cardActions: {
    borderTop: '1px solid var(--va-panel-border)',
    display: 'flex',
    height: '36px',
  },
  actionBtnOpen: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    borderRight: '1px solid var(--va-panel-border)',
    color: 'var(--va-text)',
    cursor: 'pointer',
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    letterSpacing: '1px',
    transition: 'background-color 0.2s ease',
  },
  actionBtnRename: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    borderRight: '1px solid var(--va-panel-border)',
    color: 'var(--va-text-dim)',
    cursor: 'pointer',
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    letterSpacing: '1px',
  },
  actionBtnDelete: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'var(--va-tone-error)',
    cursor: 'pointer',
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    letterSpacing: '1px',
  },
  deleteConfirmContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
  },
  deleteConfirmText: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '9px',
    color: 'var(--va-tone-error)',
    letterSpacing: '1px',
  },
  deleteConfirmButtons: {
    display: 'flex',
    gap: '8px',
  },
  deleteConfirmYes: {
    background: 'none',
    border: 'none',
    color: 'var(--va-tone-error)',
    cursor: 'pointer',
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    padding: 0,
  },
  deleteConfirmNo: {
    background: 'none',
    border: 'none',
    color: 'var(--va-text-dim)',
    cursor: 'pointer',
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    padding: 0,
  },
};

export default Dashboard;
