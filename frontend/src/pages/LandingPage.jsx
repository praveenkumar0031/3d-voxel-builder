import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublicScenes } from '../api/scenesApi';
import Loader from '../components/shared/Loader';

const LandingPage = () => {
  const navigate = useNavigate();
  const [publicScenes, setPublicScenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const scenes = await getPublicScenes();
        setPublicScenes(scenes);
      } catch (err) {
        console.error('Failed to load public scenes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublic();
  }, []);

  const handleScrollToGallery = (e) => {
    e.preventDefault();
    const el = document.getElementById('gallery');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>[ PROTOCOL v1.0.4 ]</div>
          <h1 style={styles.title}>BUILD WITH YOUR HANDS</h1>
          <p style={styles.subtitle}>
            Sculpt 3D voxel architectures in real-time using nothing but hand gestures in front of your webcam. 
            No controllers, no keyboards. Pure creation, accelerated by computer vision.
          </p>
          <div style={styles.ctaGroup}>
            <button onClick={() => navigate('/builder')} className="btn-primary" style={styles.ctaBtn}>
              START BUILDING
            </button>
            <a href="#gallery" onClick={handleScrollToGallery} className="btn-secondary" style={{ ...styles.ctaBtn, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              VIEW GALLERY
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionNumber}>// 01</span>
          <h2 style={styles.sectionTitle}>GESTURAL INTERFACE DECK</h2>
        </div>
        <div style={styles.cardGrid}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>[01] BUILD GESTURE</span>
              <span style={styles.cardStatus}>READY</span>
            </div>
            <p style={styles.cardText}>
              Raise your index finger to track the cursor. Pinch your thumb and index finger to create a wireframe preview in 3D space, and hold the pinch to commit the voxel.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>[02] GRAB GESTURE</span>
              <span style={styles.cardStatus}>READY</span>
            </div>
            <p style={styles.cardText}>
              Close your hand into a fist to grab the coordinate system. Move your hand to translate the model, or flick to rotate your voxel sculpture on its axes.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>[03] MENU GESTURE</span>
              <span style={styles.cardStatus}>READY</span>
            </div>
            <p style={styles.cardText}>
              Spread all five fingers wide and show your palm to the camera. This brings up the interactive color HUD, allowing you to cycle palettes and toggle physics.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" style={styles.gallery}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionNumber}>// 02</span>
          <h2 style={styles.sectionTitle}>COMMUNITY TRANSMISSIONS</h2>
        </div>

        {loading ? (
          <Loader size="32px" />
        ) : publicScenes.length === 0 ? (
          <div style={styles.emptyState}>
            NO PUBLIC TRANSMISSIONS AVAILABLE. BE THE FIRST TO PUBLISH.
          </div>
        ) : (
          <div style={styles.grid}>
            {publicScenes.map((scene) => (
              <div key={scene._id} style={styles.galleryCard}>
                {scene.thumbnail ? (
                  <img src={scene.thumbnail} alt={scene.name} style={styles.thumbnail} />
                ) : (
                  <div style={styles.thumbnailPlaceholder}>NO IMAGE PREVIEW</div>
                )}
                <div style={styles.galleryCardContent}>
                  <div style={styles.galleryCardHeader}>
                    <span style={styles.sceneName}>{scene.name.toUpperCase()}</span>
                    <span style={styles.voxelBadge}>{scene.voxelCount} VX</span>
                  </div>
                  {scene.description && <p style={styles.sceneDesc}>{scene.description}</p>}
                  <div style={styles.sceneMeta}>
                    <span>BY {scene.owner?.username ? scene.owner.username.toUpperCase() : 'UNKNOWN'}</span>
                    <span>{new Date(scene.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLine} />
        <div style={styles.footerContent}>
          <span>VOXEL ARCHITECT SYSTEM [V1.0.4]</span>
          <span>OPERATIVE: STABLE</span>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: 'var(--va-bg)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  hero: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center',
    borderBottom: '1px solid var(--va-panel-border)',
    backgroundImage: 'radial-gradient(circle at center, rgba(62, 130, 241, 0.05) 0%, transparent 70%)',
  },
  heroContent: {
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  badge: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-tone-active)',
    letterSpacing: '3px',
    marginBottom: '20px',
    backgroundColor: 'rgba(62, 130, 241, 0.08)',
    padding: '4px 10px',
    border: '1px solid rgba(62, 130, 241, 0.2)',
    borderRadius: 'var(--va-radius-sm)',
  },
  title: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '3.5rem',
    fontWeight: 'bold',
    color: 'var(--va-text)',
    margin: '0 0 24px 0',
    lineHeight: '1.1',
    letterSpacing: '1px',
  },
  subtitle: {
    fontSize: '15px',
    color: 'var(--va-text-dim)',
    lineHeight: '1.6',
    margin: '0 0 40px 0',
    maxWidth: '650px',
  },
  ctaGroup: {
    display: 'flex',
    gap: '16px',
  },
  ctaBtn: {
    padding: '12px 28px',
    fontSize: '12px',
    letterSpacing: '1.5px',
  },
  features: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '80px 20px',
    boxSizing: 'border-box',
    borderBottom: '1px solid var(--va-panel-border)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
  },
  sectionNumber: {
    fontFamily: 'var(--va-font-display)',
    color: 'var(--va-tone-active)',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '16px',
    fontFamily: 'var(--va-font-display)',
    color: 'var(--va-text)',
    letterSpacing: '2px',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: 'var(--va-panel)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px',
    fontFamily: 'var(--va-font-display)',
    fontSize: '12px',
  },
  cardTitle: {
    color: 'var(--va-text)',
    fontWeight: 'bold',
  },
  cardStatus: {
    color: 'var(--va-tone-active)',
  },
  cardText: {
    margin: 0,
    fontSize: '13px',
    color: 'var(--va-text-dim)',
    lineHeight: '1.6',
  },
  gallery: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '80px 20px',
    boxSizing: 'border-box',
  },
  emptyState: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-text-faint)',
    border: '1px dashed var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    padding: '60px',
    textAlign: 'center',
    letterSpacing: '2px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  galleryCard: {
    backgroundColor: 'var(--va-panel)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  },
  thumbnail: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderBottom: '1px solid var(--va-panel-border)',
    backgroundColor: '#000',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '180px',
    backgroundColor: '#05070a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    color: 'var(--va-text-faint)',
    fontFamily: 'var(--va-font-display)',
    borderBottom: '1px solid var(--va-panel-border)',
  },
  galleryCardContent: {
    padding: '16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  galleryCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  sceneName: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '13px',
    fontWeight: 'bold',
    color: 'var(--va-text)',
    letterSpacing: '1px',
  },
  voxelBadge: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    color: 'var(--va-tone-active)',
    backgroundColor: 'rgba(62, 130, 241, 0.08)',
    padding: '2px 6px',
    borderRadius: '2px',
  },
  sceneDesc: {
    margin: '0 0 16px 0',
    fontSize: '12px',
    color: 'var(--va-text-dim)',
    lineHeight: '1.4',
    flex: 1,
  },
  sceneMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    color: 'var(--va-text-faint)',
  },
  footer: {
    marginTop: 'auto',
    padding: '40px 20px',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  footerLine: {
    height: '1px',
    backgroundColor: 'var(--va-panel-border)',
    marginBottom: '20px',
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    color: 'var(--va-text-faint)',
    letterSpacing: '1px',
  },
};

export default LandingPage;
