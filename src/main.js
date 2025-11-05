import * as THREE from "three";
import { Renderer } from "./components/Renderer";
import { Camera } from "./components/Camera";
import { DirectionalLight } from "./components/DirectionalLight";
import { map, initializeMap, loadTrees, loadRiver } from "./components/Map";
import { SocketClient } from "./socketClient";
import { CardSystem } from "./components/CardSystem";
import { QuestionSystem } from "./components/minigames/question/QuestionSystem";
import { MemoryMatrixSystem } from "./components/minigames/memoryMatrix/MemoryMatrixSystem";
import { MathOperationSystem } from "./components/minigames/mathOperation/MathOperationSystem";
import { SkyBox } from "./components/SkyBox";
import { loadingManager } from "./components/LoadingManager"; 
import { startInitialCountdown } from "./phases/countdownPhase";
import { createAnimationLoop, resetAnimationState } from "./utilities/animate";
import "./utilities/collectUserInputs";
import { Lobby } from "./components/lobby";
import { MAX_PLAYER } from "./constants";

const mainMenu = document.getElementById("mainMenu");
const gameCanvas = document.getElementById("gameCanvas");
const joinGameButton = document.getElementById("joinGameButton");
const controlsButton = document.getElementById("controls");

export let cardSystem, questionSystem, memoryMatrixSystem, mathOperationSystem;
var scene, socketClient, ambientLight, dirLight, dirLightTarget, camera;
let localPlayer = null;
let gameInitialized = false;
let _phaseTimer = null;
let animateFunction = null;
let lobby;

const renderer = Renderer();

initializeGame();

joinGameButton.addEventListener("click", (e) => {
  e.preventDefault();

  // Hide join button and show waiting message
  joinGameButton.style.display = "none";

  // Initialize socket connection
  socketClient = new SocketClient(addPlayer, removePlayer, updatePlayerCount);
});

function updatePlayerCount(count, players) {
  if(gameInitialized){
    return;
  }

  if (!lobby) {
      lobby = new Lobby(socketClient);
    }
  lobby.show(players);

  if (count == MAX_PLAYER && !gameInitialized) {
    lobby.hide();

    gameInitialized = true;

    // Hide main menu
    mainMenu.style.display = "none";
    
    controlsButton.style.display = "flex";
    gameCanvas.style.display = "flex";

    loadingManager.startLoading(1000, () => {
      console.log('Loading complete!');
      
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
      initializeGameSystems();
      startInitialCountdown();
    });
  }
}

function initializeGameSystems() {
  // Initialize system with socket client and callback
  cardSystem = new CardSystem(socketClient);
  questionSystem = new QuestionSystem(socketClient);
  memoryMatrixSystem = new MemoryMatrixSystem(socketClient);
  mathOperationSystem = new MathOperationSystem(socketClient);

  console.log("🔄 Initializing game systems...");
  console.log("✅ QuestionSystem initialized, callback set:", !!questionSystem.onQuestionComplete);
  console.log("✅ MemoryMatrixSystem initialized, callback set:", !!memoryMatrixSystem.onGameComplete);
  console.log("✅ MathOperationSystem initialized, callback set:", !!mathOperationSystem.onGameComplete);
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
    localPlayer.setAsLocalPlayer();
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

  gameInitialized = false;
}