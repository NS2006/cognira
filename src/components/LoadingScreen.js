import * as THREE from "three";

export function createLoadingScreen() {
  const loadingScene = new THREE.Scene();

  // Create gradient background
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, 0, 32);
  gradient.addColorStop(0, '#1a2980');
  gradient.addColorStop(1, '#26d0ce');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 32, 32);
  loadingScene.background = new THREE.CanvasTexture(canvas);

  // Create a simple rotating cube (safe version)
  const geometry = new THREE.BoxGeometry(20, 20, 20);
  const material = new THREE.MeshPhongMaterial({
    color: 0xff6b6b,
    shininess: 100
  });
  const cube = new THREE.Mesh(geometry, material);
  loadingScene.add(cube);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  loadingScene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 50, 50);
  loadingScene.add(directionalLight);

  // Simple safe animation
  function animateLoadingScreen() {
    // Safe rotation - only animate objects that definitely have rotation
    if (cube && cube.rotation) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.02;
    }
  }

  return {
    scene: loadingScene,
    animate: animateLoadingScreen
  };
}

// Enhanced loading screen utility with progress bar
export function toggleLoadingScreen(show, progress = 0) {
  const loadingOverlay = document.getElementById('loading-overlay');
  const gameCanvas = document.querySelector('canvas.game');
  
  if (!loadingOverlay) {
    createLoadingOverlay();
  }
  
  const overlay = document.getElementById('loading-overlay');
  const progressBar = document.getElementById('loading-progress');
  const progressText = document.getElementById('loading-text');
  
  if (overlay) {
    overlay.style.display = show ? 'flex' : 'none';
    
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    
    if (progressText) {
      progressText.textContent = `Loading... ${Math.round(progress)}%`;
    }
  }
  
  if (gameCanvas) {
    gameCanvas.style.opacity = show ? '0.3' : '1';
  }
}

// Create loading overlay HTML if it doesn't exist
function createLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'loading-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a2980, #26d0ce);
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    align-items: center;
    z-index: 1000;
    color: white;
    font-family: Arial, sans-serif;
  `;
  
  overlay.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 2.5em; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">LOADING</h1>
      <div id="loading-text" style="font-size: 1.2em; margin-bottom: 20px;">Loading... 0%</div>
    </div>
    <div style="width: 300px; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden;">
      <div id="loading-progress" style="height: 100%; background: linear-gradient(90deg, #ff6b6b, #4ecdc4); width: 0%; transition: width 0.3s ease;"></div>
    </div>
    <div style="margin-top: 30px; font-size: 0.9em; opacity: 0.8;">
      2 is the only even prime number
    </div>
  `;
  
  document.body.appendChild(overlay);
}

// Utility to update loading progress
export function updateLoadingProgress(progress) {
  toggleLoadingScreen(true, progress);
}