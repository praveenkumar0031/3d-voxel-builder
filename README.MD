# 🧊 3D-tool

 3D-tool a browser-based, **Spatial Computing** design studio that allows users to build 3D structures in real-time using hand gestures. By combining **MediaPipe** for AI-driven hand tracking and **Three.js** for WebGL rendering, it transforms a standard webcam into a holographic workspace.

[Image of Hand gesture recognition for 3D modeling]

## 🚀 Features

- **Gesture-Based Construction**: Use natural hand movements to place, draw, and erase 3D boxes.
- **Architect OS HUD**: A high-tech "Hacker" aesthetic interface providing real-time biometric feedback and system states.
- **Physics Engine**: Includes "Gravity Burst" mechanics where structures can be scattered and then "Restored" to their original coordinates.
- **Dynamic Manipulation**: Grab, move, and rotate your 3D models using multi-hand synchronization.
- **Visual Effects**: Supports dynamic color cycling and a high-intensity "Disco Mode."

## 🕹️ Controls (Bio-Link Gestures)

| Action | Gesture |
| :--- | :--- |
| **Move Cursor** | Point Right Index Finger |
| **Build/Sketch** | Right Hand Pinch (Index + Thumb) |
| **Erase** | Left Pinch + Right Point |
| **Commit Sketch** | Open Palm (Right Hand) |
| **Grab / Move Scene** | Close Left Fist (Hold 500ms) |
| **Global Rotate** | Two Open Palms |
| **Hard Reset** | Two Fists (Hold 1s) |
| **Cycle Colors** | Left Victory/Peace Sign |
| **Gravity Burst** | Left Thumb Down |
| **Restore Structure** | Left Thumb Up |
| **Disco Mode** | Right Victory/Peace Sign |

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3 (Hacking Theme)
- **Computer Vision**: [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html)
- **3D Engine**: [Three.js](https://threejs.org/)
- **Camera**: MediaPipe Camera Utils

## 📦 Installation & Usage

1. Clone or download the repository.
2. Open `index.html` in any modern web browser (Chrome or Edge recommended for MediaPipe performance).
3. Grant camera permissions when prompted.
4. Wait for `STATE: INITIALIZING` to change to `SCANNING`.

## 📜 Project Structure

- **MediaPipe Integration**: Handles 21-point hand landmark detection.
- **Three.js Scene**: Manages the `VoxelGroup`, lighting, and perspective camera.
- **Animation Loop**: Coordinates the physics engine, `lerp` functions for reconstruction, and the "Disco" HSL cycling.

---
*Developed with a focus on Full-Stack potential and DevOps-inspired UI aesthetics.