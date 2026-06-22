import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScenes, deleteScene, updateScene, getSceneById, createScene } from '../api/scenesApi';
import Loader from '../components/shared/Loader';

const HistoryPage = () => {
  const navigate = useNavigate();

  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering, sorting and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt'); // 'createdAt' | 'updatedAt' | 'voxelCount'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Row edit states
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchHistoryData = async () => {
    try {
      const data = await getScenes();
      setScenes(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch scenes history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  // Filter scenes by name or tag
  const filteredScenes = scenes.filter((scene) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const nameMatch = scene.name?.toLowerCase().includes(query);
    const tagMatch = scene.tags?.some((tag) => tag.toLowerCase().includes(query));
    return nameMatch || tagMatch;
  });

  // Sort scenes
  const sortedScenes = [...filteredScenes].sort((a, b) => {
    if (sortBy === 'voxelCount') {
      return b.voxelCount - a.voxelCount;
    }
    // Dates
    return new Date(b[sortBy]) - new Date(a[sortBy]);
  });

  // Pagination calculations
  const totalItems = sortedScenes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedScenes = sortedScenes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sync pagination page if filter trims count
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [searchQuery, totalPages, currentPage]);

  const handleStartRename = (scene) => {
    setRenameId(scene._id);
    setRenameValue(scene.name);
  };

  const handleSaveRename = async (id) => {
    if (!renameValue.trim()) return;
    setProcessingId(id);
    try {
      await updateScene(id, { name: renameValue });
      setRenameId(null);
      await fetchHistoryData();
    } catch (err) {
      console.error(err);
      setError('Rename failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDuplicate = async (id) => {
    setProcessingId(id);
    try {
      // 1. Fetch full voxel array since list endpoint returns metadata only
      const fullScene = await getSceneById(id);
      
      // 2. Save duplicate
      await createScene({
        name: `${fullScene.name} (COPY)`,
        description: fullScene.description || '',
        voxels: fullScene.voxels,
        thumbnail: fullScene.thumbnail || '',
        tags: fullScene.tags || [],
        isPublic: fullScene.isPublic || false,
      });

      await fetchHistoryData();
    } catch (err) {
      console.error(err);
      setError('Duplicate failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    setProcessingId(id);
    try {
      await deleteScene(id);
      setConfirmDeleteId(null);
      await fetchHistoryData();
    } catch (err) {
      console.error(err);
      setError('Delete failed.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Loader fullScreen={true} />;
  }

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.pathLabel}>// SYSTEM ARCHIVE / SCENES</span>
          <h1 style={styles.title}>SCENE HISTORY LOG</h1>
        </div>
        <button onClick={() => navigate('/builder')} className="btn-primary">
          + NEW SCENE
        </button>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <span>[ ERROR: {error.toUpperCase()} ]</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>&gt;</span>
          <input
            type="text"
            placeholder="FILTER BY NAME OR TAG..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.sortContainer}>
          <span style={styles.sortLabel}>SORT_BY:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            style={styles.sortSelect}
          >
            <option value="updatedAt">DATE UPDATED (DESC)</option>
            <option value="createdAt">DATE CREATED (DESC)</option>
            <option value="voxelCount">VOXEL COUNT (DESC)</option>
          </select>
        </div>
      </div>

      {/* Row List */}
      <div style={styles.tablePanel}>
        {paginatedScenes.length === 0 ? (
          <div style={styles.emptyState}>
            NO MATCHING TRANSMISSIONS FOUND IN THE SYSTEM.
          </div>
        ) : (
          <div style={styles.rows}>
            {paginatedScenes.map((scene) => (
              <div key={scene._id} style={styles.row}>
                {/* 1. Thumbnail */}
                <div style={styles.thumbnailCol}>
                  {scene.thumbnail ? (
                    <img src={scene.thumbnail} alt={scene.name} style={styles.thumbnail} />
                  ) : (
                    <div style={styles.thumbnailPlaceholder}>NO IMG</div>
                  )}
                </div>

                {/* 2. Scene Identity info */}
                <div style={styles.infoCol}>
                  {renameId === scene._id ? (
                    <div style={styles.renameWrapper}>
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        style={styles.renameInput}
                        disabled={processingId === scene._id}
                        autoFocus
                      />
                      <button 
                        onClick={() => handleSaveRename(scene._id)} 
                        disabled={processingId === scene._id}
                        style={styles.inlineSaveBtn}
                      >
                        [SAVE]
                      </button>
                      <button 
                        onClick={() => setRenameId(null)} 
                        disabled={processingId === scene._id}
                        style={styles.inlineCancelBtn}
                      >
                        [X]
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={styles.sceneTitleRow}>
                        <h3 style={styles.sceneName}>{scene.name.toUpperCase()}</h3>
                        {scene.isPublic && <span style={styles.publicBadge}>PUBLIC</span>}
                      </div>
                      <p style={styles.sceneDesc}>
                        {scene.description || 'No database logs registered.'}
                      </p>
                    </>
                  )}
                  
                  {/* Tags */}
                  <div style={styles.tagsContainer}>
                    {scene.tags && scene.tags.map((tag, idx) => (
                      <span key={idx} style={styles.tagBadge}>
                        #{tag.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Voxel and date telemetry */}
                <div style={styles.telemetryCol}>
                  <div style={styles.telemetryItem}>
                    <span style={styles.teleLabel}>VOXELS:</span>
                    <span style={styles.teleValue}>{scene.voxelCount} VX</span>
                  </div>
                  <div style={styles.telemetryItem}>
                    <span style={styles.teleLabel}>UPDATED:</span>
                    <span style={styles.teleValue}>
                      {new Date(scene.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={styles.telemetryItem}>
                    <span style={styles.teleLabel}>CREATED:</span>
                    <span style={styles.teleValue}>
                      {new Date(scene.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* 4. Action triggers */}
                <div style={styles.actionsCol}>
                  {processingId === scene._id ? (
                    <Loader size="16px" />
                  ) : confirmDeleteId === scene._id ? (
                    <div style={styles.inlineDeleteConfirm}>
                      <span style={styles.deleteWarn}>SURE?</span>
                      <button onClick={() => handleDelete(scene._id)} style={styles.yesBtn}>[YES]</button>
                      <button onClick={() => setConfirmDeleteId(null)} style={styles.noBtn}>[NO]</button>
                    </div>
                  ) : (
                    <div style={styles.actionGrid}>
                      <button 
                        onClick={() => navigate(`/builder/${scene._id}`)} 
                        style={styles.actionBtn}
                      >
                        OPEN
                      </button>
                      <button 
                        onClick={() => handleStartRename(scene)} 
                        style={styles.actionBtn}
                      >
                        RENAME
                      </button>
                      <button 
                        onClick={() => handleDuplicate(scene._id)} 
                        style={styles.actionBtn}
                      >
                        CLONE
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(scene._id)} 
                        style={styles.deleteBtn}
                      >
                        DELETE
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button 
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} 
            disabled={currentPage === 1}
            style={styles.pageBtn}
          >
            &lt; PREV
          </button>
          
          <span style={styles.pageStatus}>
            PAGE {String(currentPage).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </span>

          <button 
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} 
            disabled={currentPage === totalPages}
            style={styles.pageBtn}
          >
            NEXT &gt;
          </button>
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
    gap: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--va-panel-border)',
    paddingBottom: '20px',
  },
  pathLabel: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-text-faint)',
    letterSpacing: '2px',
  },
  title: {
    margin: '8px 0 0 0',
    fontSize: '24px',
    fontFamily: 'var(--va-font-display)',
    color: 'var(--va-text)',
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
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: '280px',
    backgroundColor: 'var(--va-input-bg)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-sm)',
    padding: '0 14px',
  },
  searchIcon: {
    fontFamily: 'var(--va-font-display)',
    color: 'var(--va-tone-active)',
    fontSize: '14px',
    marginRight: '10px',
  },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    padding: '10px 0',
    width: '100%',
    outline: 'none',
    boxShadow: 'none',
  },
  sortContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sortLabel: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-text-faint)',
    letterSpacing: '1px',
  },
  sortSelect: {
    padding: '8px 12px',
  },
  tablePanel: {
    backgroundColor: 'var(--va-panel)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    overflow: 'hidden',
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-text-faint)',
    letterSpacing: '1.5px',
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid var(--va-panel-border)',
    padding: '16px 20px',
    gap: '24px',
    flexWrap: 'wrap',
  },
  thumbnailCol: {
    width: '80px',
    height: '60px',
    borderRadius: 'var(--va-radius-sm)',
    overflow: 'hidden',
    border: '1px solid var(--va-panel-border)',
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#05070a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '9px',
    color: 'var(--va-text-faint)',
    fontFamily: 'var(--va-font-display)',
  },
  infoCol: {
    flex: 2,
    minWidth: '240px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  sceneTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sceneName: {
    margin: 0,
    fontFamily: 'var(--va-font-display)',
    fontSize: '13px',
    color: 'var(--va-text)',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  publicBadge: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '8px',
    color: 'var(--va-tone-active)',
    border: '1px solid rgba(62, 130, 241, 0.3)',
    backgroundColor: 'rgba(62, 130, 241, 0.05)',
    padding: '2px 5px',
    borderRadius: '2px',
  },
  sceneDesc: {
    margin: 0,
    fontSize: '12px',
    color: 'var(--va-text-dim)',
    lineHeight: '1.4',
  },
  renameWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  renameInput: {
    padding: '4px 8px',
    fontSize: '12px',
    width: '200px',
  },
  inlineSaveBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--va-tone-active)',
    cursor: 'pointer',
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
  },
  inlineCancelBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--va-text-faint)',
    cursor: 'pointer',
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '2px',
  },
  tagBadge: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '9px',
    color: 'var(--va-text-faint)',
  },
  telemetryCol: {
    flex: 1,
    minWidth: '180px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
  },
  telemetryItem: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  teleLabel: {
    color: 'var(--va-text-faint)',
  },
  teleValue: {
    color: 'var(--va-text-dim)',
  },
  actionsCol: {
    minWidth: '200px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  actionGrid: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    background: 'transparent',
    border: '1px solid var(--va-panel-border)',
    color: 'var(--va-text-dim)',
    fontSize: '10px',
    padding: '6px 12px',
    borderRadius: 'var(--va-radius-sm)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  deleteBtn: {
    background: 'transparent',
    border: '1px solid rgba(255, 107, 107, 0.2)',
    color: 'var(--va-tone-error)',
    fontSize: '10px',
    padding: '6px 12px',
    borderRadius: 'var(--va-radius-sm)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  inlineDeleteConfirm: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    border: '1px solid rgba(255, 107, 107, 0.2)',
    padding: '4px 12px',
    borderRadius: 'var(--va-radius-sm)',
  },
  deleteWarn: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    color: 'var(--va-tone-error)',
  },
  yesBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--va-tone-error)',
    cursor: 'pointer',
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    padding: 0,
  },
  noBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--va-text-dim)',
    cursor: 'pointer',
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    padding: 0,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '24px',
    marginTop: '12px',
  },
  pageBtn: {
    background: 'transparent',
    border: '1px solid var(--va-panel-border)',
    color: 'var(--va-text)',
    fontSize: '11px',
    padding: '6px 14px',
    borderRadius: 'var(--va-radius-sm)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  pageStatus: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-text-dim)',
    letterSpacing: '1px',
  },
};

export default HistoryPage;
