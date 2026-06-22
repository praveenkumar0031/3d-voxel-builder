import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoxelArchitect from '../VoxelArchitect';
import { getSceneById, createScene, updateScene } from '../api/scenesApi';
import { useTheme } from '../context/ThemeContext';

const BuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Scene metadata states
  const [sceneName, setSceneName] = useState('UNTITLED SCENE');
  const [isEditingName, setIsEditingName] = useState(false);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Panel / drawer visibility
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [webcamVisible, setWebcamVisible] = useState(true);

  // 1. Browser Tab Title Sync
  useEffect(() => {
    document.title = `${sceneName} | GesticStudio`;
    return () => {
      document.title = 'GesticStudio';
    };
  }, [sceneName]);

  // 2. Load scene data if ID is present
  useEffect(() => {
    let active = true;
    let intervalId = null;

    if (!id) {
      // If no ID, reset form fields for a clean workspace
      setSceneName('UNTITLED SCENE');
      setDescription('');
      setTags('');
      setIsPublic(false);
      
      // Wait for scene engine and clear it if it exists
      intervalId = setInterval(() => {
        if (window.sceneEngineInstance) {
          clearInterval(intervalId);
          window.sceneEngineInstance.loadVoxelData([]);
        }
      }, 100);
      return () => {
        clearInterval(intervalId);
      };
    }

    const fetchScene = async () => {
      try {
        const data = await getSceneById(id);
        if (!active) return;

        setSceneName(data.name || 'UNTITLED SCENE');
        setDescription(data.description || '');
        setTags(data.tags ? data.tags.join(', ') : '');
        setIsPublic(data.isPublic || false);

        // Periodically check if window.sceneEngineInstance is mounted and ready
        intervalId = setInterval(() => {
          if (window.sceneEngineInstance) {
            clearInterval(intervalId);
            window.sceneEngineInstance.loadVoxelData(data.voxels);
          }
        }, 100);
      } catch (err) {
        console.error('Failed to load scene:', err);
        setStatusMessage('Error loading scene.');
      }
    };

    fetchScene();

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [id]);

  // 3. Clear workspace and navigate to new scene creator
  const handleNewScene = () => {
    if (window.sceneEngineInstance) {
      window.sceneEngineInstance.loadVoxelData([]);
    }
    setSceneName('UNTITLED SCENE');
    setDescription('');
    setTags('');
    setIsPublic(false);
    setShowSavePanel(false);
    setStatusMessage('');
    navigate('/builder');
  };

  // 4. Save/Update operation
  const handleSaveScene = async (e) => {
    e.preventDefault();
    if (!window.sceneEngineInstance) {
      setStatusMessage('ERROR: Engine not initialized.');
      return;
    }

    setSaving(true);
    setStatusMessage('Capturing & uploading...');

    try {
      const voxels = window.sceneEngineInstance.getVoxelData();
      const thumbnail = window.sceneEngineInstance.takeScreenshot();
      
      // Parse tags
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const scenePayload = {
        name: sceneName,
        description,
        voxels,
        thumbnail,
        tags: parsedTags,
        isPublic,
      };

      if (id) {
        // Update existing scene
        const updated = await updateScene(id, scenePayload);
        setStatusMessage('SCENE SAVED SUCCESSFULLY.');
      } else {
        // Create new scene
        const created = await createScene(scenePayload);
        setStatusMessage('SCENE CREATED.');
        // Navigate to edit route of newly created scene
        navigate(`/builder/${created._id}`);
      }

      // Hide save panel after a brief message display
      setTimeout(() => {
        setShowSavePanel(false);
        setStatusMessage('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setStatusMessage(err.response?.data?.error || 'SAVE FAILED.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="builder-page-container" data-webcam={webcamVisible ? 'visible' : 'hidden'} style={styles.builderContainer}>
      {/* Floating Top Control Overlay */}
      <div style={styles.topOverlay}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/dashboard')} style={styles.overlayBtn}>
            &lt; DASHBOARD
          </button>
          <button 
            onClick={() => setWebcamVisible(!webcamVisible)} 
            style={{ 
              ...styles.overlayBtn,
              color: webcamVisible ? 'var(--va-text)' : 'var(--va-tone-warning)',
              borderColor: webcamVisible ? 'var(--va-panel-border)' : 'var(--va-tone-warning)'
            }}
            title="Toggle webcam view background"
          >
            {webcamVisible ? '📷 CAM ON' : '📷 CAM OFF'}
          </button>
        </div>

        <div style={styles.nameContainer}>
          {isEditingName ? (
            <input
              type="text"
              value={sceneName}
              onChange={(e) => setSceneName(e.target.value.toUpperCase())}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingName(false);
              }}
              style={styles.nameInput}
              autoFocus
            />
          ) : (
            <span 
              onClick={() => setIsEditingName(true)} 
              style={styles.nameText}
              title="Click to rename"
            >
              {sceneName || 'UNTITLED SCENE'} <span style={styles.editHint}>[EDIT]</span>
            </span>
          )}
        </div>

        <div style={styles.overlayActions}>
          <button onClick={toggleTheme} style={styles.overlayBtn} title="Toggle theme mode">
            {theme === 'dark' ? '☀ LIGHT' : '☾ DARK'}
          </button>
          <button onClick={handleNewScene} style={styles.overlayBtn}>
            NEW
          </button>
          <button 
            onClick={() => setShowSavePanel(!showSavePanel)} 
            style={{ 
              ...styles.overlayBtn, 
              backgroundColor: showSavePanel ? 'var(--va-panel-border)' : 'transparent',
              color: 'var(--va-tone-active)',
              borderColor: 'var(--va-tone-active)'
            }}
          >
            SAVE
          </button>
        </div>
      </div>

      {/* Slide-out Save Config Panel (Right Edge, transparent overlay feel) */}
      {showSavePanel && (
        <div style={styles.saveDrawer}>
          <div style={styles.drawerHeader}>
            <span style={styles.drawerTitle}>// SAVE PROTOCOL</span>
            <button onClick={() => setShowSavePanel(false)} style={styles.closeBtn}>[X]</button>
          </div>

          <form onSubmit={handleSaveScene} style={styles.drawerForm}>
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>SCENE NAME</label>
              <input
                type="text"
                value={sceneName}
                onChange={(e) => setSceneName(e.target.value.toUpperCase())}
                style={styles.drawerInput}
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>DESCRIPTION</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief log description..."
                style={styles.drawerTextarea}
                rows={3}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel}>TAGS (COMMA SEPARATED)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="architecture, sci-fi, organic"
                style={styles.drawerInput}
              />
            </div>

            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="public-toggle"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={styles.drawerCheckbox}
              />
              <label htmlFor="public-toggle" style={styles.checkboxLabel}>
                PUBLISH TO PUBLIC GALLERY
              </label>
            </div>

            {statusMessage && (
              <div 
                style={{
                  ...styles.statusMessage, 
                  color: statusMessage.includes('FAILED') || statusMessage.includes('ERROR') 
                    ? 'var(--va-tone-error)' 
                    : 'var(--va-tone-active)'
                }}
              >
                {statusMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={styles.saveSubmitBtn}
            >
              {saving ? 'PROCESSING...' : 'COMMIT SAVESTATE'}
            </button>
          </form>
        </div>
      )}

      {/* The Core MediaPipe + Three.js Component */}
      <VoxelArchitect />
    </div>
  );
};

const styles = {
  builderContainer: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: 'var(--va-bg)',
  },
  topOverlay: {
    position: 'absolute',
    top: '48px',
    left: 0,
    right: 0,
    height: '48px',
    backgroundColor: 'var(--va-panel)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid var(--va-panel-border)',
    zIndex: 99, // Above the HUD but below system fingertip cursor (which is zIndex 10000+)
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    boxSizing: 'border-box',
    fontFamily: 'var(--va-font-display)',
  },
  overlayBtn: {
    background: 'transparent',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-sm)',
    color: 'var(--va-text)',
    padding: '6px 12px',
    fontSize: '11px',
    cursor: 'pointer',
    letterSpacing: '1px',
    transition: 'all 0.2s ease',
  },
  nameContainer: {
    flex: 1,
    textAlign: 'center',
    padding: '0 20px',
  },
  nameText: {
    color: 'var(--va-text)',
    fontWeight: 'bold',
    fontSize: '13px',
    letterSpacing: '1.5px',
    cursor: 'pointer',
  },
  editHint: {
    color: 'var(--va-text-faint)',
    fontSize: '9px',
    marginLeft: '6px',
  },
  nameInput: {
    backgroundColor: 'var(--va-input-bg)',
    border: '1px solid var(--va-tone-active)',
    color: 'var(--va-text)',
    fontFamily: 'var(--va-font-display)',
    fontSize: '13px',
    padding: '4px 8px',
    textAlign: 'center',
    borderRadius: 'var(--va-radius-sm)',
    width: '240px',
  },
  overlayActions: {
    display: 'flex',
    gap: '12px',
  },
  saveDrawer: {
    position: 'absolute',
    top: '96px',
    right: 0,
    bottom: 0,
    width: '320px',
    backgroundColor: 'var(--va-panel)',
    backdropFilter: 'blur(12px)',
    borderLeft: '1px solid var(--va-panel-border)',
    zIndex: 8,
    boxSizing: 'border-box',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--va-panel-border)',
    paddingBottom: '12px',
  },
  drawerTitle: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '12px',
    color: 'var(--va-tone-active)',
    fontWeight: 'bold',
    letterSpacing: '1.5px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--va-text-faint)',
    cursor: 'pointer',
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
  },
  drawerForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  fieldLabel: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    color: 'var(--va-text-faint)',
    letterSpacing: '1px',
  },
  drawerInput: {
    width: '100%',
    padding: '8px 10px',
  },
  drawerTextarea: {
    width: '100%',
    padding: '8px 10px',
    fontFamily: 'var(--va-font-display)',
    fontSize: '13px',
    backgroundColor: 'var(--va-input-bg)',
    border: '1px solid var(--va-panel-border)',
    color: 'var(--va-text)',
    borderRadius: 'var(--va-radius-sm)',
    resize: 'vertical',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '6px',
  },
  drawerCheckbox: {
    cursor: 'pointer',
    width: '14px',
    height: '14px',
  },
  checkboxLabel: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    color: 'var(--va-text-dim)',
    letterSpacing: '0.5px',
    cursor: 'pointer',
  },
  statusMessage: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    textAlign: 'center',
    letterSpacing: '1px',
  },
  saveSubmitBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '11px',
    marginTop: '8px',
  },
};

export default BuilderPage;
