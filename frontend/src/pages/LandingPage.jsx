import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicScenes } from '../api/scenesApi';
import Loader from '../components/shared/Loader';

const LandingPage = () => {
  const navigate = useNavigate();
  const [publicScenes, setPublicScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Telemetry simulation states
  const [fps, setFps] = useState(60);
  const [coords, setCoords] = useState({ x: 0.00, y: 0.00, z: 0.00 });
  const [latency, setLatency] = useState(7);
  const [systemLogs, setSystemLogs] = useState([
    'SYSTEM INITIALIZED',
    'MEDIAPIPE HANDS COMPILING: OK',
    'THREE.JS WEBGL CONTAINER STATE: STABLE'
  ]);

  // Voxel Playground State
  const [voxels, setVoxels] = useState([
    { x: 2, y: 2, z: 0, h: 217, s: '90%' },
    { x: 1, y: 2, z: 0, h: 217, s: '90%' },
    { x: 3, y: 2, z: 0, h: 217, s: '90%' },
    { x: 2, y: 1, z: 0, h: 217, s: '90%' },
    { x: 2, y: 3, z: 0, h: 217, s: '90%' },
    { x: 2, y: 2, z: 1, h: 270, s: '85%' },
  ]);
  const [isSwaying, setIsSwaying] = useState(true);
  const [activeColor, setActiveColor] = useState({ name: 'Cyber Blue', h: 217, s: '90%' });
  
  const colorsList = [
    { name: 'Cyber Blue', h: 217, s: '90%' },
    { name: 'Acid Purple', h: 270, s: '85%' },
    { name: 'Lime Green', h: 142, s: '75%' },
    { name: 'Flame Orange', h: 24, s: '95%' },
    { name: 'Cyber Pink', h: 330, s: '90%' },
  ];

  // Calibration Gesture state
  const [activeGesture, setActiveGesture] = useState('PINCH');

  // Simulated hand skeletal coordinates for SVG
  const gesturePoints = {
    PALM: {
      wrist: [50, 85],
      thumb: [[32, 75], [20, 68], [14, 58], [10, 48]],
      index: [[35, 62], [32, 48], [30, 36], [28, 20]],
      middle: [[50, 60], [50, 44], [50, 30], [50, 12]],
      ring: [[65, 62], [68, 48], [70, 36], [72, 22]],
      pinky: [[76, 68], [82, 56], [85, 46], [88, 32]]
    },
    PINCH: {
      wrist: [50, 85],
      thumb: [[35, 78], [30, 68], [33, 56], [42, 48]],
      index: [[40, 65], [44, 54], [44, 46], [42, 48]], // touching thumb tip
      middle: [[52, 65], [55, 58], [52, 52], [47, 50]],
      ring: [[62, 68], [65, 62], [62, 56], [57, 54]],
      pinky: [[72, 74], [75, 68], [72, 62], [67, 60]]
    },
    FIST: {
      wrist: [50, 85],
      thumb: [[36, 76], [32, 70], [36, 64], [44, 64]],
      index: [[38, 72], [35, 65], [38, 59], [43, 61]],
      middle: [[48, 72], [46, 65], [48, 59], [51, 61]],
      ring: [[58, 72], [56, 65], [58, 59], [59, 61]],
      pinky: [[68, 74], [66, 68], [68, 62], [67, 64]]
    }
  };

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

    // Telemetry simulations
    const fpsInterval = setInterval(() => {
      setFps(Math.floor(58 + Math.random() * 4));
      setLatency(Math.floor(6 + Math.random() * 4));
    }, 1000);

    const coordsInterval = setInterval(() => {
      const rx = (Math.random() * 2 - 1).toFixed(2);
      const ry = (Math.random() * 2 - 1).toFixed(2);
      const rz = (Math.random() * 2 - 1).toFixed(2);
      setCoords({ x: rx, y: ry, z: rz });
    }, 1500);

    return () => {
      clearInterval(fpsInterval);
      clearInterval(coordsInterval);
    };
  }, []);

  // Update logs when gesture changes
  useEffect(() => {
    const time = new Date().toLocaleTimeString();
    let message = '';
    if (activeGesture === 'PINCH') {
      message = `[${time}] SIGNAL_DRAW_ON // PINCH DETECTED (STRENGTH: 99.4%)`;
    } else if (activeGesture === 'FIST') {
      message = `[${time}] VIEWPORT_ROTATION // FIST GRAB TRIGGERED`;
    } else {
      message = `[${time}] MENU_RECALL // PALM DOCK ACTIVE`;
    }
    setSystemLogs(prev => [message, ...prev.slice(0, 2)]);
  }, [activeGesture]);

  const handleScrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add voxel to 3D grid
  const handleGroundClick = (x, y) => {
    const existing = voxels.filter(v => v.x === x && v.y === y);
    const nextZ = existing.length > 0 ? Math.max(...existing.map(v => v.z)) + 1 : 0;
    if (nextZ < 5) {
      setVoxels([...voxels, { x, y, z: nextZ, h: activeColor.h, s: activeColor.s }]);
    }
  };

  // Remove specific voxel
  const handleVoxelRemove = (e, index) => {
    e.stopPropagation();
    const updated = [...voxels];
    updated.splice(index, 1);
    setVoxels(updated);
  };

  // Sort voxels back-to-front (isometric Z-depth rendering helper)
  const sortedVoxels = [...voxels].sort((a, b) => {
    if ((a.x + a.y) !== (b.x + b.y)) {
      return (a.x + a.y) - (b.x + b.y);
    }
    return a.z - b.z;
  });

  return (
    <div className="landing-mainframe" style={styles.page}>
      {/* Dynamic Keyframes, scanlines and 3D Isometric styles */}
      <style>{`
        .landing-mainframe {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, var(--va-panel-border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--va-panel-border) 1px, transparent 1px);
          position: relative;
        }
        
        .landing-mainframe::after {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(62, 130, 241, 0.1);
          animation: scanline-pass 8s linear infinite;
          z-index: 100;
          pointer-events: none;
        }

        @keyframes scanline-pass {
          0% { top: -10px; }
          100% { top: 100%; }
        }

        .hover-card {
          transition: all 0.25s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .hover-card:hover {
          transform: translateY(-4px);
          border-color: var(--va-tone-active) !important;
          box-shadow: 0 12px 30px rgba(62, 130, 241, 0.12);
        }

        .hover-btn {
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        .hover-btn::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background-color: rgba(62, 130, 241, 0.15);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.4s ease, height 0.4s ease;
          z-index: -1;
        }
        .hover-btn:hover::before {
          width: 300px;
          height: 300px;
        }

        /* 3D Voxel Engine elements */
        .playground-container {
          perspective: 1200px;
          position: relative;
          width: 100%;
          max-width: 440px;
          height: 440px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--va-panel);
          border: 1px solid var(--va-panel-border);
          border-radius: var(--va-radius-md);
          box-shadow: inset 0 0 35px rgba(0,0,0,0.15);
          overflow: hidden;
          margin-top: 20px;
        }

        .isometric-wrapper {
          position: relative;
          width: 200px;
          height: 200px;
          transform: rotateX(60deg) rotateZ(-45deg);
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }

        .isometric-wrapper.swaying {
          animation: iso-sway-animate 12s ease-in-out infinite alternate;
        }

        @keyframes iso-sway-animate {
          0% { transform: rotateX(60deg) rotateZ(-30deg); }
          100% { transform: rotateX(60deg) rotateZ(-60deg); }
        }

        .ground-grid {
          position: absolute;
          top: 0;
          left: 0;
          width: 200px;
          height: 200px;
          display: grid;
          grid-template-columns: repeat(5, 40px);
          grid-template-rows: repeat(5, 40px);
          transform-style: preserve-3d;
        }

        .ground-cell {
          position: relative;
          width: 40px;
          height: 40px;
          border: 1px solid var(--va-panel-border);
          box-sizing: border-box;
          background: rgba(62, 130, 241, 0.02);
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s;
          transform-style: preserve-3d;
        }

        .ground-cell:hover {
          background-color: rgba(62, 130, 241, 0.16);
          border-color: var(--va-tone-active);
        }

        .voxel-cube {
          position: absolute;
          width: 40px;
          height: 40px;
          transform-style: preserve-3d;
          cursor: pointer;
          left: 0;
          top: 0;
        }

        .voxel-face {
          position: absolute;
          width: 40px;
          height: 40px;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: background-color 0.3s;
        }

        .voxel-face.top {
          transform: translateZ(40px);
          background-color: hsl(var(--h), var(--s), 60%);
        }

        .voxel-face.front-left {
          transform: rotateX(-90deg);
          transform-origin: bottom;
          background-color: hsl(var(--h), var(--s), 48%);
        }

        .voxel-face.front-right {
          transform: rotateY(90deg);
          transform-origin: right;
          background-color: hsl(var(--h), var(--s), 38%);
        }

        .voxel-face.back-left {
          transform: rotateY(-90deg);
          transform-origin: left;
          background-color: hsl(var(--h), var(--s), 38%);
        }

        .voxel-face.back-right {
          transform: rotateX(90deg);
          transform-origin: top;
          background-color: hsl(var(--h), var(--s), 48%);
        }

        .voxel-face.bottom {
          transform: translateZ(0);
          background-color: hsl(var(--h), var(--s), 24%);
        }

        .dev-social-link {
          transition: all 0.3s ease;
        }
        .dev-social-link:hover {
          background: rgba(62, 130, 241, 0.08) !important;
          border-color: var(--va-tone-active) !important;
        }
      `}</style>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.bracketTopLeft} />
        <div style={styles.bracketTopRight} />
        
        <div style={styles.heroGrid}>
          {/* Left Console Deck */}
          <div style={styles.heroLeftConsole}>
            <div style={styles.badge}>
              <span style={styles.statusIndicatorPulse} />
              [ SECURE ACCESS GATEWAY // STABLE ]
            </div>
            
            <h1 style={styles.title}>GESTIC<span style={styles.titleAccent}>STUDIO</span></h1>
            
            <p style={styles.subtitle}>
              An advanced spatial modeling workspace designed for pure touchless creation. 
              Using real-time computer vision, you can construct detailed 3D voxel models with finger pathways, grip anchors to reposition, and open floating docks with hand spreads.
            </p>

            <div style={styles.ctaGroup}>
              <button 
                onClick={() => navigate('/builder')} 
                className="btn-primary hover-btn" 
                style={styles.ctaBtn}
              >
                LAUNCH SUITE
              </button>
              <button 
                onClick={() => handleScrollToSection('gallery')} 
                className="btn-secondary hover-btn" 
                style={styles.ctaBtn}
              >
                EXPLORE ARCHIVES
              </button>
            </div>

            {/* Gesture Calibration Trainer */}
            <div style={styles.trainerCard}>
              <div style={styles.trainerHeader}>
                <span style={styles.trainerTitle}>GESTURE COGNITION TRAINER</span>
                <span style={styles.trainerSubText}>SELECT PRESET TO DEMO</span>
              </div>
              
              <div style={styles.trainerContent}>
                {/* SVG Hand Skeleton */}
                <div style={styles.skeletonContainer}>
                  <svg viewBox="0 0 100 100" style={styles.handSvg}>
                    {/* Palm Base Connections */}
                    <line 
                      x1={gesturePoints[activeGesture].wrist[0]} 
                      y1={gesturePoints[activeGesture].wrist[1]} 
                      x2={gesturePoints[activeGesture].thumb[0][0]} 
                      y2={gesturePoints[activeGesture].thumb[0][1]} 
                      style={styles.svgLine} 
                    />
                    <line 
                      x1={gesturePoints[activeGesture].wrist[0]} 
                      y1={gesturePoints[activeGesture].wrist[1]} 
                      x2={gesturePoints[activeGesture].index[0][0]} 
                      y2={gesturePoints[activeGesture].index[0][1]} 
                      style={styles.svgLine} 
                    />
                    <line 
                      x1={gesturePoints[activeGesture].wrist[0]} 
                      y1={gesturePoints[activeGesture].wrist[1]} 
                      x2={gesturePoints[activeGesture].middle[0][0]} 
                      y2={gesturePoints[activeGesture].middle[0][1]} 
                      style={styles.svgLine} 
                    />
                    <line 
                      x1={gesturePoints[activeGesture].wrist[0]} 
                      y1={gesturePoints[activeGesture].wrist[1]} 
                      x2={gesturePoints[activeGesture].ring[0][0]} 
                      y2={gesturePoints[activeGesture].ring[0][1]} 
                      style={styles.svgLine} 
                    />
                    <line 
                      x1={gesturePoints[activeGesture].wrist[0]} 
                      y1={gesturePoints[activeGesture].wrist[1]} 
                      x2={gesturePoints[activeGesture].pinky[0][0]} 
                      y2={gesturePoints[activeGesture].pinky[0][1]} 
                      style={styles.svgLine} 
                    />

                    {/* Finger Lines */}
                    {/* Thumb */}
                    {gesturePoints[activeGesture].thumb.map((pt, i, arr) => i > 0 && (
                      <line key={`t-${i}`} x1={arr[i-1][0]} y1={arr[i-1][1]} x2={pt[0]} y2={pt[1]} style={styles.svgLine} />
                    ))}
                    {/* Index */}
                    {gesturePoints[activeGesture].index.map((pt, i, arr) => i > 0 && (
                      <line key={`i-${i}`} x1={arr[i-1][0]} y1={arr[i-1][1]} x2={pt[0]} y2={pt[1]} style={styles.svgLine} />
                    ))}
                    {/* Middle */}
                    {gesturePoints[activeGesture].middle.map((pt, i, arr) => i > 0 && (
                      <line key={`m-${i}`} x1={arr[i-1][0]} y1={arr[i-1][1]} x2={pt[0]} y2={pt[1]} style={styles.svgLine} />
                    ))}
                    {/* Ring */}
                    {gesturePoints[activeGesture].ring.map((pt, i, arr) => i > 0 && (
                      <line key={`r-${i}`} x1={arr[i-1][0]} y1={arr[i-1][1]} x2={pt[0]} y2={pt[1]} style={styles.svgLine} />
                    ))}
                    {/* Pinky */}
                    {gesturePoints[activeGesture].pinky.map((pt, i, arr) => i > 0 && (
                      <line key={`p-${i}`} x1={arr[i-1][0]} y1={arr[i-1][1]} x2={pt[0]} y2={pt[1]} style={styles.svgLine} />
                    ))}

                    {/* Joints */}
                    <circle cx={gesturePoints[activeGesture].wrist[0]} cy={gesturePoints[activeGesture].wrist[1]} style={styles.svgJoint} />
                    {gesturePoints[activeGesture].thumb.map((pt, i) => (
                      <circle key={`tc-${i}`} cx={pt[0]} cy={pt[1]} style={styles.svgJoint} />
                    ))}
                    {gesturePoints[activeGesture].index.map((pt, i) => (
                      <circle key={`ic-${i}`} cx={pt[0]} cy={pt[1]} style={styles.svgJoint} />
                    ))}
                    {gesturePoints[activeGesture].middle.map((pt, i) => (
                      <circle key={`mc-${i}`} cx={pt[0]} cy={pt[1]} style={styles.svgJoint} />
                    ))}
                    {gesturePoints[activeGesture].ring.map((pt, i) => (
                      <circle key={`rc-${i}`} cx={pt[0]} cy={pt[1]} style={styles.svgJoint} />
                    ))}
                    {gesturePoints[activeGesture].pinky.map((pt, i) => (
                      <circle key={`pc-${i}`} cx={pt[0]} cy={pt[1]} style={styles.svgJoint} />
                    ))}

                    {/* Highlight Interactive Coordinates */}
                    {activeGesture === 'PINCH' && (
                      <circle cx={42} cy={48} r="6" style={styles.svgHighlightPulse} />
                    )}
                  </svg>
                </div>

                {/* Trainer Settings & Diagnostic Logs */}
                <div style={styles.trainerLogsColumn}>
                  <div style={styles.trainerTabs}>
                    <button 
                      onClick={() => setActiveGesture('PINCH')}
                      style={{
                        ...styles.trainerTabBtn,
                        borderColor: activeGesture === 'PINCH' ? 'var(--va-tone-active)' : 'var(--va-panel-border)',
                        color: activeGesture === 'PINCH' ? 'var(--va-tone-active)' : 'var(--va-text-dim)',
                      }}
                    >
                      PINCH
                    </button>
                    <button 
                      onClick={() => setActiveGesture('FIST')}
                      style={{
                        ...styles.trainerTabBtn,
                        borderColor: activeGesture === 'FIST' ? 'var(--va-tone-active)' : 'var(--va-panel-border)',
                        color: activeGesture === 'FIST' ? 'var(--va-tone-active)' : 'var(--va-text-dim)',
                      }}
                    >
                      FIST
                    </button>
                    <button 
                      onClick={() => setActiveGesture('PALM')}
                      style={{
                        ...styles.trainerTabBtn,
                        borderColor: activeGesture === 'PALM' ? 'var(--va-tone-active)' : 'var(--va-panel-border)',
                        color: activeGesture === 'PALM' ? 'var(--va-tone-active)' : 'var(--va-text-dim)',
                      }}
                    >
                      PALM
                    </button>
                  </div>
                  
                  <div style={styles.terminalConsole}>
                    {systemLogs.map((log, idx) => (
                      <div key={idx} style={styles.terminalLine}>{log}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 3D CSS Voxel Playground */}
          <div style={styles.heroRightVisual}>
            <div style={styles.playgroundHeader}>
              <span style={styles.playgroundTitle}>3D VOXEL CSS PLAYGROUND</span>
              <button 
                onClick={() => setVoxels([])} 
                style={styles.playgroundClearBtn}
              >
                RESET GRID
              </button>
            </div>

            <div className="playground-container">
              <div 
                className={`isometric-wrapper ${isSwaying ? 'swaying' : ''}`}
              >
                {/* 5x5 Ground grid */}
                <div className="ground-grid">
                  {Array.from({ length: 25 }).map((_, i) => {
                    const x = i % 5;
                    const y = Math.floor(i / 5);
                    return (
                      <div 
                        key={i} 
                        className="ground-cell"
                        onClick={() => handleGroundClick(x, y)}
                      />
                    );
                  })}
                </div>

                {/* Drawn Voxels sorted for correct depth display */}
                {sortedVoxels.map((voxel, index) => (
                  <div 
                    key={index} 
                    className="voxel-cube"
                    style={{
                      transform: `translate3d(${voxel.x * 40}px, ${voxel.y * 40}px, ${voxel.z * 40}px)`,
                      '--h': voxel.h,
                      '--s': voxel.s
                    }}
                    onClick={(e) => handleVoxelRemove(e, index)}
                  >
                    <div className="voxel-face top" />
                    <div className="voxel-face front-left" />
                    <div className="voxel-face front-right" />
                    <div className="voxel-face back-left" />
                    <div className="voxel-face back-right" />
                    <div className="voxel-face bottom" />
                  </div>
                ))}
              </div>
            </div>

            {/* Swatch Picker and info */}
            <div style={styles.playgroundControls}>
              <div style={styles.colorPalette}>
                {colorsList.map((col, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveColor(col)}
                    style={{
                      ...styles.colorSwatch,
                      backgroundColor: `hsl(${col.h}, ${col.s}, 60%)`,
                      borderColor: activeColor.name === col.name ? 'var(--va-text)' : 'transparent',
                      transform: activeColor.name === col.name ? 'scale(1.15)' : 'scale(1)'
                    }}
                    title={col.name}
                  />
                ))}
              </div>

              <div style={styles.playgroundStatus}>
                <span style={styles.statusLabel}>ACTIVE COLOR:</span>
                <span style={{ ...styles.statusValue, color: `hsl(${activeColor.h}, ${activeColor.s}, 60%)` }}>
                  {activeColor.name.toUpperCase()}
                </span>
                <span style={styles.statsSeparator}>|</span>
                <span style={styles.statusLabel}>COUNT:</span>
                <span style={styles.statusValue}>{voxels.length} / 125</span>
              </div>
            </div>
            
            <div style={styles.voxelPlaygroundTip}>
              * Click ground grid cells to stack voxel blocks. Click blocks directly to erase them.
            </div>
          </div>
        </div>

        <div style={styles.scrollIndicator} onClick={() => handleScrollToSection('about')}>
          <span style={styles.scrollText}>DIAGNOSTICS & SYSTEM LAYOUT</span>
          <span style={styles.scrollArrow}>↓</span>
        </div>
      </section>

      {/* About & Technical Profile Section */}
      <section id="about" style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionNumber}>// 01</span>
          <h2 style={styles.sectionTitle}>SYSTEM OVERVIEW</h2>
        </div>

        <div style={styles.aboutGrid}>
          <div style={styles.aboutTextCol}>
            <div style={styles.tagline}>[ CV COGNITION DECK ]</div>
            <h3 style={styles.subHeading}>CONTROLLERLESS SPATIAL COGNITION</h3>
            <p style={styles.paragraph}>
              GesticStudio translates real-time camera frames directly into 3D voxel configurations. 
              By computing geometric land-coordinate sets at sub-pixel levels, the pipeline compiles gesture parameters to manipulate Three.js WebGL scenes natively.
            </p>
            <p style={styles.paragraph}>
              Crafted with a premium dark and light theme, the interface reads as a calm technical scaffold. 
              It provides structured visual diagnostics, telemetry monitoring, and rapid scene saving for a completely seamless spatial design loop.
            </p>
          </div>
          
          {/* Live Telemetry Reader */}
          <div style={styles.telemetryCard}>
            <div style={styles.telemetryHeader}>
              <span style={styles.cardBadge}>LIVE SYSTEM TELEMETRY</span>
              <span style={styles.liveFps}>{fps} FPS</span>
            </div>
            
            <div style={styles.telemetryRows}>
              <div style={styles.telemetryRow}>
                <div style={styles.teleRowLabelGroup}>
                  <span style={styles.teleLabel}>CORE ENGINE LATENCY</span>
                  <span style={styles.teleValue}>{latency} ms</span>
                </div>
                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressFill, width: `${(latency / 15) * 100}%`, backgroundColor: 'var(--va-tone-active)' }} />
                </div>
              </div>
              <div style={styles.telemetryRow}>
                <div style={styles.teleRowLabelGroup}>
                  <span style={styles.teleLabel}>WEBGL DRAW CALLS</span>
                  <span style={styles.teleValue}>14 ACTIVE</span>
                </div>
                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressFill, width: '40%', backgroundColor: 'var(--va-tone-active)' }} />
                </div>
              </div>
              <div style={styles.telemetryRow}>
                <div style={styles.teleRowLabelGroup}>
                  <span style={styles.teleLabel}>SYSTEM BUFFER LOAD</span>
                  <span style={styles.teleValue}>24.2 MB / 512 MB</span>
                </div>
                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressFill, width: '8%', backgroundColor: 'var(--va-tone-active)' }} />
                </div>
              </div>
              <div style={styles.telemetryRow}>
                <div style={styles.teleRowLabelGroup}>
                  <span style={styles.teleLabel}>PIPELINE STABILITY</span>
                  <span style={styles.teleValue}>OPERATIONAL / SECURE</span>
                </div>
                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressFill, width: '100%', backgroundColor: 'var(--va-tone-active)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gesture Controls Interface Vocabulary */}
      <section style={styles.sectionAlt}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionNumber}>// 02</span>
          <h2 style={styles.sectionTitle}>GESTURE VOCABULARY</h2>
        </div>
        
        <div style={styles.cardGrid}>
          <div className="hover-card" style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>[01] PINCH & PAINT</span>
              <span style={styles.cardStatusActive}>READY</span>
            </div>
            <div style={styles.cardIconBox}>
              <svg viewBox="0 0 100 100" style={styles.vocabularyHandSvg}>
                {/* Thumb + Index loop for pinch */}
                <path d="M 50,85 C 50,85 30,75 35,60 C 37,55 42,48 42,48 C 42,48 48,52 48,58 C 48,64 50,85 50,85 Z" fill="none" stroke="var(--va-tone-active)" strokeWidth="2" />
                <circle cx="42" cy="48" r="4" fill="var(--va-tone-active)" />
                <path d="M 50,85 C 50,85 62,68 60,52 C 59,48 55,42 55,42" fill="none" stroke="var(--va-text-faint)" strokeWidth="2" />
                <path d="M 50,85 C 50,85 70,72 68,58 C 67,54 62,48 62,48" fill="none" stroke="var(--va-text-faint)" strokeWidth="2" />
              </svg>
            </div>
            <p style={styles.cardText}>
              Align your thumb and index fingers. When the system highlights joint proximity, hold the pinch to project grid coordinate anchors and construct solid voxel blocks.
            </p>
          </div>

          <div className="hover-card" style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>[02] FIST GRAB</span>
              <span style={styles.cardStatusActive}>READY</span>
            </div>
            <div style={styles.cardIconBox}>
              <svg viewBox="0 0 100 100" style={styles.vocabularyHandSvg}>
                {/* Closed fist outline */}
                <rect x="35" y="45" width="30" height="28" rx="6" fill="none" stroke="var(--va-tone-active)" strokeWidth="2" />
                <path d="M 50,85 L 50,73" stroke="var(--va-tone-active)" strokeWidth="2" />
                <circle cx="50" cy="45" r="3" fill="var(--va-text-faint)" />
              </svg>
            </div>
            <p style={styles.cardText}>
              Squeeze your fingers into a closed fist to lock camera rotations. Drag your hand horizontally or vertically to slide the workspace in 3D coordinate space.
            </p>
          </div>

          <div className="hover-card" style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>[03] PALM DOCK</span>
              <span style={styles.cardStatusActive}>READY</span>
            </div>
            <div style={styles.cardIconBox}>
              <svg viewBox="0 0 100 100" style={styles.vocabularyHandSvg}>
                {/* Fully spread open hand */}
                <path d="M 50,85 L 30,70 L 22,55 M 50,85 L 38,55 L 35,32 M 50,85 L 50,50 L 50,25 M 50,85 L 62,55 L 65,32 M 50,85 L 72,70 L 78,55" fill="none" stroke="var(--va-tone-active)" strokeWidth="2" />
                <circle cx="50" cy="25" r="3" fill="var(--va-tone-active)" />
                <circle cx="35" cy="32" r="3" fill="var(--va-tone-active)" />
                <circle cx="65" cy="32" r="3" fill="var(--va-tone-active)" />
              </svg>
            </div>
            <p style={styles.cardText}>
              Spread all five fingers flat toward the viewport lens. The system scans the open hand parameters to toggle the action console and access settings/palette overlays.
            </p>
          </div>
        </div>
      </section>

      {/* Community Gallery Section */}
      <section id="gallery" style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionNumber}>// 03</span>
          <h2 style={styles.sectionTitle}>COMMUNITY ARCHIVES</h2>
        </div>

        {loading ? (
          <Loader size="32px" />
        ) : publicScenes.length === 0 ? (
          <div style={styles.emptyState}>
            NO PUBLIC SAVESTATES CURRENTLY REGISTERED. INITIALIZE A SCENE TO LOG FIRST WORK.
          </div>
        ) : (
          <div style={styles.grid}>
            {publicScenes.map((scene) => (
              <div key={scene._id} className="hover-card" style={styles.galleryCard}>
                {scene.thumbnail ? (
                  <img src={scene.thumbnail} alt={scene.name} style={styles.thumbnail} />
                ) : (
                  <div style={styles.thumbnailPlaceholder}>NO VIEWPORT THUMBNAIL</div>
                )}
                <div style={styles.galleryCardContent}>
                  <div style={styles.galleryCardHeader}>
                    <span style={styles.sceneName}>{scene.name.toUpperCase()}</span>
                    <span style={styles.voxelBadge}>{scene.voxelCount} BLOCKS</span>
                  </div>
                  {scene.description && <p style={styles.sceneDesc}>{scene.description}</p>}
                  <div style={styles.sceneMeta}>
                    <span>CREATOR: {scene.owner?.username ? scene.owner.username.toUpperCase() : 'ANONYMOUS'}</span>
                    <span>{new Date(scene.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Developer Section */}
      <section style={styles.sectionAlt}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionNumber}>// 04</span>
          <h2 style={styles.sectionTitle}>CREATION MATRIX</h2>
        </div>
        
        <div style={styles.devContainer}>
          <div style={styles.devCard}>
            <div style={styles.devBadge}>[ CHIEF ARCHITECT ]</div>
            <span style={styles.devName}>PRAVEEN KUMAR S.</span>
            <p style={styles.devDescription}>
              Designed and built as a modern exploration of web-centric computer vision pipelines and interactive graphics. GesticStudio isolates camera frame capture streams from high-frequency WebGL render operations, ensuring stable frame rates across devices.
            </p>
            
            <div style={styles.devInteractiveMatrix}>
              <div style={styles.matrixRow}>
                <span style={styles.matrixLabel}>ROLE:</span>
                <span style={styles.matrixValue}>LEAD SYSTEM ARCHITECT</span>
              </div>
              <div style={styles.matrixRow}>
                <span style={styles.matrixLabel}>FOCUS:</span>
                <span style={styles.matrixValue}>COMPUTER VISION + GEOMETRIC ALGORITHMS</span>
              </div>
              <div style={styles.matrixRow}>
                <span style={styles.matrixLabel}>ENGINE:</span>
                <span style={styles.matrixValue}>REACT + NODE.JS + THREE.JS + MONGODB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support & System Help Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionNumber}>// 05</span>
          <h2 style={styles.sectionTitle}>SYSTEM SPECIFICATIONS</h2>
        </div>

        <div style={styles.supportGrid}>
          <div style={styles.supportItem}>
            <span style={styles.supportLabel}>[01] OPTIMAL LIGHTING</span>
            <p style={styles.supportText}>
              Ensure your browser has webcam access enabled. For optimal tracking, align the lens to direct light on your palm and stand approximately 2 to 3 feet back from the camera console.
            </p>
          </div>
          
          <div style={styles.supportItem}>
            <span style={styles.supportLabel}>[02] TECHNICAL ENQUIRIES</span>
            <p style={styles.supportText}>
              For system questions, bug logs, coordinate offset corrections, or repository cooperation, reach out to the core technician mail: <strong style={{ color: 'var(--va-tone-active)' }}>praveen0031kumar@gmail.com</strong>.
            </p>
          </div>

          <div style={styles.supportItem}>
            <span style={styles.supportLabel}>[03] STABILITY SPECS</span>
            <p style={styles.supportText}>
              Open-source license: MIT. Built purely with client-side framework mechanics. Operates inside Chrome, Edge, Safari, and Brave web browsers.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Connectivity Section */}
      <section id="contact" style={styles.sectionAlt}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionNumber}>// 06</span>
          <h2 style={styles.sectionTitle}>CONNECTIVITY PORT</h2>
        </div>

        <div style={styles.contactContainer}>
          <p style={{ ...styles.paragraph, textAlign: 'center', marginBottom: '40px', maxWidth: '650px', marginLeft: 'auto', marginRight: 'auto' }}>
            Establish a communication node with the system creator for project inquiries, technical development, or design feedback.
          </p>

          <div style={styles.contactGrid}>
            <a href="mailto:praveen0031kumar@gmail.com" className="hover-card dev-social-link" style={styles.contactCard}>
              <span style={styles.contactIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--va-tone-active)' }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <span style={styles.contactLabel}>EMAIL PORT</span>
              <span style={styles.contactDetail}>praveen0031kumar@gmail.com</span>
            </a>

            <a href="https://github.com/praveenkumar0031" target="_blank" rel="noopener noreferrer" className="hover-card dev-social-link" style={styles.contactCard}>
              <span style={styles.contactIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--va-tone-active)' }}>
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </span>
              <span style={styles.contactLabel}>GITHUB REPO</span>
              <span style={styles.contactDetail}>github.com/praveenkumar0031</span>
            </a>

            <a href="https://www.linkedin.com/in/praveen-kumar-s-38b971288" target="_blank" rel="noopener noreferrer" className="hover-card dev-social-link" style={styles.contactCard}>
              <span style={styles.contactIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--va-tone-active)' }}>
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </span>
              <span style={styles.contactLabel}>LINKEDIN NODE</span>
              <span style={styles.contactDetail}>linkedin.com/in/praveen-kumar-s-38b971288</span>
            </a>

            <a href="https://praveenkumar0031.github.io/portfolio/" target="_blank" rel="noopener noreferrer" className="hover-card dev-social-link" style={styles.contactCard}>
              <span style={styles.contactIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--va-tone-active)' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </span>
              <span style={styles.contactLabel}>PORTFOLIO GATEWAY</span>
              <span style={styles.contactDetail}>praveenkumar0031.github.io/portfolio/</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLine} />
        <div style={styles.footerContent}>
          <span>GESTICSTUDIO MAINFRAME // CHANNELS OPERATIONAL</span>
          <span>© {new Date().getFullYear()} CORE ENGINE GROUP</span>
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
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },
  hero: {
    minHeight: '94vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    borderBottom: '1px solid var(--va-panel-border)',
    backgroundImage: 'radial-gradient(circle at center, rgba(62, 130, 241, 0.04) 0%, transparent 70%)',
    position: 'relative',
    boxSizing: 'border-box',
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '60px',
    width: '100%',
    maxWidth: '1200px',
    alignItems: 'center',
    zIndex: 2,
  },
  heroLeftConsole: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  heroRightVisual: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--va-panel)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    padding: '24px',
    boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
    backdropFilter: 'blur(12px)',
  },
  bracketTopLeft: {
    position: 'absolute',
    top: '32px',
    left: '32px',
    width: '24px',
    height: '24px',
    borderTop: '2px solid var(--va-panel-border)',
    borderLeft: '2px solid var(--va-panel-border)',
  },
  bracketTopRight: {
    position: 'absolute',
    top: '32px',
    right: '32px',
    width: '24px',
    height: '24px',
    borderTop: '2px solid var(--va-panel-border)',
    borderRight: '2px solid var(--va-panel-border)',
  },
  badge: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    color: 'var(--va-tone-active)',
    letterSpacing: '2.5px',
    marginBottom: '20px',
    backgroundColor: 'var(--va-panel)',
    padding: '6px 14px',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusIndicatorPulse: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--va-tone-active)',
    boxShadow: '0 0 8px var(--va-tone-active)',
    display: 'inline-block',
  },
  title: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '3.8rem',
    fontWeight: 'bold',
    color: 'var(--va-text)',
    margin: '0 0 16px 0',
    lineHeight: '1.1',
    letterSpacing: '3px',
  },
  titleAccent: {
    color: 'var(--va-tone-active)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--va-text-dim)',
    lineHeight: '1.65',
    margin: '0 0 32px 0',
    maxWidth: '560px',
  },
  ctaGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '40px',
  },
  ctaBtn: {
    padding: '12px 28px',
    fontSize: '10px',
    letterSpacing: '1.5px',
  },
  trainerCard: {
    width: '100%',
    maxWidth: '520px',
    background: 'var(--va-panel)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.1)',
  },
  trainerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--va-panel-border)',
    paddingBottom: '8px',
  },
  trainerTitle: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    fontWeight: 'bold',
    color: 'var(--va-text)',
    letterSpacing: '1px',
  },
  trainerSubText: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '9px',
    color: 'var(--va-text-faint)',
    letterSpacing: '0.5px',
  },
  trainerContent: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  skeletonContainer: {
    width: '120px',
    height: '120px',
    background: 'var(--va-bg)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '4px',
  },
  handSvg: {
    width: '100%',
    height: '100%',
  },
  svgLine: {
    stroke: 'var(--va-tone-active)',
    strokeWidth: '2.5',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    transition: 'all 0.3s ease',
    opacity: 0.8,
  },
  svgJoint: {
    fill: 'var(--va-text)',
    r: '2.5',
    transition: 'all 0.3s ease',
  },
  svgHighlightPulse: {
    fill: 'var(--va-tone-active)',
    opacity: 0.4,
    animation: 'pulse-glow 1.5s infinite ease-in-out',
  },
  trainerLogsColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  trainerTabs: {
    display: 'flex',
    gap: '6px',
  },
  trainerTabBtn: {
    flex: 1,
    padding: '6px 0',
    fontSize: '9px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    background: 'transparent',
    border: '1px solid',
    borderRadius: 'var(--va-radius-sm)',
  },
  terminalConsole: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-sm)',
    padding: '8px',
    height: '60px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '4px',
    overflow: 'hidden',
  },
  terminalLine: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '8.5px',
    color: 'var(--va-text-dim)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  playgroundHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottom: '1px solid var(--va-panel-border)',
    paddingBottom: '10px',
    marginBottom: '10px',
  },
  playgroundTitle: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'var(--va-text-dim)',
    letterSpacing: '1px',
  },
  playgroundClearBtn: {
    padding: '4px 10px',
    fontSize: '9px',
    border: '1px solid var(--va-panel-border)',
    background: 'transparent',
    color: 'var(--va-text-dim)',
    borderRadius: 'var(--va-radius-sm)',
  },
  playgroundControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: '16px',
    gap: '12px',
  },
  colorPalette: {
    display: 'flex',
    gap: '8px',
  },
  colorSwatch: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    cursor: 'pointer',
    border: '2px solid',
    padding: 0,
    transition: 'all 0.2s ease',
  },
  playgroundStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--va-font-display)',
    fontSize: '9px',
  },
  statusLabel: {
    color: 'var(--va-text-faint)',
  },
  statusValue: {
    fontWeight: 'bold',
    color: 'var(--va-text)',
  },
  statsSeparator: {
    color: 'var(--va-panel-border)',
    margin: '0 4px',
  },
  voxelPlaygroundTip: {
    width: '100%',
    textAlign: 'left',
    marginTop: '10px',
    fontFamily: 'var(--va-font-display)',
    fontSize: '8.5px',
    color: 'var(--va-text-faint)',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    opacity: 0.75,
    transition: 'opacity 0.2s ease',
  },
  scrollText: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '9px',
    color: 'var(--va-text-faint)',
    letterSpacing: '1.5px',
  },
  scrollArrow: {
    color: 'var(--va-tone-active)',
    fontSize: '12px',
  },
  section: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '80px 24px',
    boxSizing: 'border-box',
    borderBottom: '1px solid var(--va-panel-border)',
  },
  sectionAlt: {
    backgroundColor: 'var(--va-panel)',
    borderBottom: '1px solid var(--va-panel-border)',
    width: '100%',
    boxSizing: 'border-box',
    padding: '80px 24px',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '48px',
    width: '100%',
    maxWidth: '1200px',
  },
  sectionNumber: {
    fontFamily: 'var(--va-font-display)',
    color: 'var(--va-tone-active)',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontFamily: 'var(--va-font-display)',
    color: 'var(--va-text)',
    letterSpacing: '2px',
  },
  aboutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '48px',
    alignItems: 'center',
  },
  aboutTextCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  tagline: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    color: 'var(--va-text-faint)',
    letterSpacing: '1.5px',
  },
  subHeading: {
    fontSize: '17px',
    fontFamily: 'var(--va-font-display)',
    color: 'var(--va-text)',
    letterSpacing: '1px',
    margin: 0,
  },
  paragraph: {
    fontSize: '13px',
    color: 'var(--va-text-dim)',
    lineHeight: '1.65',
    margin: 0,
  },
  telemetryCard: {
    backgroundColor: 'var(--va-bg)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.08)',
  },
  telemetryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--va-panel-border)',
    paddingBottom: '10px',
  },
  cardBadge: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '10px',
    color: 'var(--va-text-dim)',
    letterSpacing: '1.5px',
    fontWeight: 'bold',
  },
  liveFps: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-tone-active)',
    backgroundColor: 'rgba(62, 130, 241, 0.08)',
    padding: '2px 8px',
    borderRadius: 'var(--va-radius-sm)',
    fontWeight: 'bold',
  },
  telemetryRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  telemetryRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  teleRowLabelGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teleLabel: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '9px',
    color: 'var(--va-text-faint)',
    letterSpacing: '0.5px',
  },
  teleValue: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '10.5px',
    color: 'var(--va-text)',
  },
  progressTrack: {
    height: '4px',
    backgroundColor: 'var(--va-panel-border)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    width: '100%',
    maxWidth: '1200px',
  },
  card: {
    backgroundColor: 'var(--va-bg)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.25s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px',
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
  },
  cardTitle: {
    color: 'var(--va-text)',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  cardStatusActive: {
    color: 'var(--va-tone-active)',
    letterSpacing: '0.5px',
  },
  cardIconBox: {
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    background: 'rgba(0,0,0,0.1)',
    borderRadius: 'var(--va-radius-sm)',
    border: '1px solid var(--va-panel-border)',
  },
  vocabularyHandSvg: {
    height: '100%',
    width: 'auto',
  },
  cardText: {
    margin: 0,
    fontSize: '12.5px',
    color: 'var(--va-text-dim)',
    lineHeight: '1.6',
  },
  emptyState: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-text-faint)',
    border: '1px dashed var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    padding: '60px 24px',
    textAlign: 'center',
    letterSpacing: '1.5px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    width: '100%',
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
    backgroundColor: 'rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: 'var(--va-text-faint)',
    fontFamily: 'var(--va-font-display)',
    borderBottom: '1px solid var(--va-panel-border)',
    letterSpacing: '1px',
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
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'var(--va-text)',
    letterSpacing: '0.5px',
  },
  voxelBadge: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '8.5px',
    color: 'var(--va-tone-active)',
    backgroundColor: 'rgba(62, 130, 241, 0.08)',
    padding: '2px 6px',
    borderRadius: '2px',
    border: '1px solid rgba(62, 130, 241, 0.15)',
  },
  sceneDesc: {
    margin: '0 0 16px 0',
    fontSize: '11.5px',
    color: 'var(--va-text-dim)',
    lineHeight: '1.45',
    flex: 1,
  },
  sceneMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--va-font-display)',
    fontSize: '9.5px',
    color: 'var(--va-text-faint)',
  },
  devContainer: {
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    justifyContent: 'center',
  },
  devCard: {
    width: '100%',
    maxWidth: '700px',
    backgroundColor: 'var(--va-bg)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    padding: '36px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
    boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
  },
  devBadge: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '9px',
    color: 'var(--va-tone-active)',
    letterSpacing: '2.5px',
    margin: 0,
  },
  devName: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--va-text)',
    letterSpacing: '1.5px',
  },
  devDescription: {
    fontSize: '12.5px',
    color: 'var(--va-text-dim)',
    lineHeight: '1.6',
    margin: '4px 0',
  },
  devInteractiveMatrix: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    borderTop: '1px solid var(--va-panel-border)',
    paddingTop: '20px',
    marginTop: '8px',
  },
  matrixRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--va-font-display)',
    fontSize: '9.5px',
    borderBottom: '1px solid var(--va-panel-border)',
    paddingBottom: '8px',
  },
  matrixLabel: {
    color: 'var(--va-text-faint)',
  },
  matrixValue: {
    color: 'var(--va-text)',
    fontWeight: 'bold',
  },
  supportGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '28px',
    width: '100%',
  },
  supportItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  supportLabel: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '11px',
    color: 'var(--va-text)',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  supportText: {
    margin: 0,
    fontSize: '12.5px',
    color: 'var(--va-text-dim)',
    lineHeight: '1.55',
  },
  contactContainer: {
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    width: '100%',
  },
  contactCard: {
    backgroundColor: 'var(--va-bg)',
    border: '1px solid var(--va-panel-border)',
    borderRadius: 'var(--va-radius-md)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.25s ease',
    cursor: 'pointer',
  },
  contactIcon: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '9.5px',
    color: 'var(--va-text-faint)',
    letterSpacing: '1px',
    fontWeight: 'bold',
  },
  contactDetail: {
    fontFamily: 'var(--va-font-display)',
    fontSize: '10.5px',
    color: 'var(--va-text-dim)',
    wordBreak: 'break-all',
  },
  footer: {
    marginTop: 'auto',
    padding: '48px 24px',
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
    fontSize: '9px',
    color: 'var(--va-text-faint)',
    letterSpacing: '1px',
    flexWrap: 'wrap',
    gap: '10px',
  },
};

export default LandingPage;
