import * as THREE from "three";
import { Renderer } from "./components/Renderer";
import { Camera } from "./components/Camera";
import { DirectionalLight } from "./components/DirectionalLight";
import { map, initializeMap, loadTrees, loadRiver } from "./components/Map";
import { SocketClient } from "./socketClient";
import { CardSystem } from "./components/CardSystem";
import { QuestionSystem } from "./components/minigames/question/QuestionSystem";
import { MemoryMatrixSystem } from "./components/minigames/memoryMatrix/MemoryMatrixSystem";
import { SkyBox } from "./components/SkyBox";
import { loadingManager } from "./components/LoadingManager"; 
import { startInitialCountdown } from "./phases/countdownPhase";
import { createAnimationLoop, resetAnimationState } from "./utilities/animate";
import "./utilities/collectUserInputs";

const mainMenu = document.getElementById("mainMenu");
const gameCanvas = document.getElementById("gameCanvas");
const joinGameButton = document.getElementById("joinGameButton");
const controlsButton = document.getElementById("controls");
const waitingMessage = document.getElementById("waitingMessage");
const playerCountSpan = document.getElementById("playerCount");

var scene, socketClient, ambientLight, dirLight, dirLightTarget, camera;
let localPlayer = null;
let gameInitialized = false;
export let cardSystem, questionSystem, memoryMatrixSystem;
let _phaseTimer = null;
let animateFunction = null;

const renderer = Renderer();

initializeGame();

joinGameButton.addEventListener("click", (e) => {
  e.preventDefault();

  // Hide join button and show waiting message
  joinGameButton.style.display = "none";
  waitingMessage.style.display = "block";

  // Initialize socket connection
  socketClient = new SocketClient(addPlayer, removePlayer, updatePlayerCount);
});

function updatePlayerCount(count) {
  // Update the player count display
  playerCountSpan.textContent = `(${count}/4)`;

  // Check if we have enough players and game isn't initialized yet
  if (count >= 1 && !gameInitialized) {
    // Hide waiting message and show controls
    mainMenu.style.display = "none";
    controlsButton.style.display = "flex";
    gameCanvas.style.display = "flex";

    loadingManager.startLoading(1000, () => {
      console.log('Loading complete!');
      
      // Create animation loop
      animateFunction = createAnimationLoop(
        scene, 
        camera, 
        dirLight, 
        dirLightTarget, 
        map, 
        renderer, 
        getLocalPlayer, 
        getSocketClient
      );
      
      renderer.setAnimationLoop(animateFunction);

      // Initialize game systems after loading
      initializeGameSystems();

      // Start the initial 5-second countdown before first card phase
      startInitialCountdown();
    });

    window.onresize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    gameInitialized = true;
  }
}

function initializeGameSystems() {
  // Initialize system with socket client and callback
  cardSystem = new CardSystem(socketClient);
  questionSystem = new QuestionSystem(socketClient);
  memoryMatrixSystem = new MemoryMatrixSystem(socketClient);

  console.log("🔄 Initializing game systems...");
  console.log("✅ QuestionSystem initialized, callback set:", !!questionSystem.onQuestionComplete);
  console.log("✅ MemoryMatrixSystem initialized, callback set:", !!memoryMatrixSystem.onGameComplete);
}
export function getPhaseTimer() {
  return _phaseTimer;
}

export function setPhaseTimer(timer) {
  _phaseTimer = timer;
}

export function clearPhaseTimer() {
  if (_phaseTimer) {
    clearTimeout(_phaseTimer);
    _phaseTimer = null;
  }

  // Remove any phase messages
  const moveMsg = document.getElementById('movementPhaseMessage');
  if (moveMsg) {
    moveMsg.remove();
  }
}

function initializeGame() {
  console.log("🟡 Initializing game...");

  scene = new THREE.Scene();

  ambientLight = new THREE.AmbientLight();

  dirLight = DirectionalLight();

  dirLightTarget = new THREE.Object3D();
  dirLight.target = dirLightTarget;

  camera = Camera();
  let objects = [
    camera,
    map,
    ambientLight,
    dirLight,
    dirLightTarget
  ];

  objects.forEach(obj => {
    scene.add(obj);
  });

  new SkyBox(scene);

  initializeMap();
  loadTrees();
  loadRiver();
}

function addPlayer(player) {
  console.log("=== addPlayer CALLED ===");

  if (player.playerId === socketClient.id && !localPlayer) {
    localPlayer = player;
    console.log("✅ LOCAL PLAYER SET!:", player.playerId);

    // Set initial positions
    dirLight.position.set(0, 0, 50);
    dirLightTarget.position.set(0, 0, 0);

    // Set player grid position
    localPlayer.gridPosition.currentX = socketClient.players.size % 4;
    localPlayer.gridPosition.currentY = 0;

    // Initialize player steps
    localPlayer.resetSteps();
  } else {
    console.log("🌐 Remote player added:", player.playerId);
  }

  scene.add(player);
  console.log("Player added to scene. Total scene children:", scene.children.length);
}

function removePlayer(player) {
  // Don't remove local player from our reference
  if (player === localPlayer) {
    console.log("Cannot remove local player");
    return;
  }

  scene.remove(player);
  console.log("Player removed from scene:", player.playerId);
}

// Export for input system if needed
export function getLocalPlayer() {
  return localPlayer;
}

export function getSocketClient() {
  return socketClient;
}

export function getQuestionSystem() {
  return questionSystem;
}

// Clean up when game ends
export function cleanupGame() {
  if (cardSystem) {
    cardSystem.stopCardInterval();
  }
  if (questionSystem) {
    questionSystem.hideQuestion();
  }
  clearPhaseTimer();
  resetAnimationState();
  
  // Stop animation loop
  if (animateFunction) {
    renderer.setAnimationLoop(null);
  }
}

// Rest of your debug functions remain the same...
function debugMode() {
  debugScene();
  debugCameraView();
}

function debugScene() {
  // Debug the map and scene
  console.log("🗺️ Map children count:", map.children.length);
  console.log("🗺️ Map position:", map.position);
  console.log("🗺️ Map world position:", new THREE.Vector3().setFromMatrixPosition(map.matrixWorld));

  // Debug scene
  console.log("🎭 Scene children:", scene.children.length);
  scene.children.forEach((child, index) => {
    console.log(`🎭 Child ${index}:`, child.constructor.name, "position:", child.position);
  });
}

function debugCameraView() {
  console.log("📷 Camera view debug:");
  console.log("📷 - Position:", camera.position);
  console.log("📷 - Type:", camera.constructor.name);

  if (camera instanceof THREE.PerspectiveCamera) {
    console.log("📷 - FOV:", camera.fov);
    console.log("📷 - Aspect:", camera.aspect);

    // Calculate visible area at Z=0
    const distance = camera.position.z;
    const fovRad = camera.fov * Math.PI / 180;
    const visibleHeight = 2 * Math.tan(fovRad / 2) * distance;
    const visibleWidth = visibleHeight * camera.aspect;

    console.log("📷 - Visible area at Z=0:", {
      width: visibleWidth,
      height: visibleHeight
    });
  }

  console.log("🗺️ Map bounds:", {
    min: { x: 0, y: 0 },
    max: { x: 126, y: 504 }
  });
}