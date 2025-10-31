import * as THREE from "three";
import { Renderer } from "./components/Renderer";
import { Camera } from "./components/Camera";
import { DirectionalLight } from "./components/DirectionalLight";
import { map, initializeMap, loadTrees, loadRiver } from "./components/Map";
import { SocketClient } from "./socketClient";
import { CardSystem } from "./components/CardSystem";
import { CardManager } from "./components/CardManager";
import { QuestionSystem } from "./components/QuestionSystem";
import { refreshMovementUI } from "./utilities/collectUserInputs";
import "./utilities/collectUserInputs";
import { SkyBox } from "./components/SkyBox";
import { loadingManager } from "./components/LoadingManager"; 
import * as CANNON from 'cannon-es';

export const physicsWorld = new CANNON.World();
physicsWorld.gravity.set(0, 0, -9.82); // Z-axis gravity (you can adjust or disable)
physicsWorld.broadphase = new CANNON.NaiveBroadphase();
physicsWorld.solver.iterations = 10;


const timeStep = 1 / 60;
export function updatePhysics() {
  physicsWorld.step(timeStep);
}

const mainMenu = document.getElementById("mainMenu");
const gameCanvas = document.getElementById("gameCanvas");
const joinGameButton = document.getElementById("joinGameButton");
const controlsButton = document.getElementById("controls");
const waitingMessage = document.getElementById("waitingMessage");
const playerCountSpan = document.getElementById("playerCount");

var scene, socketClient, ambientLight, dirLight, dirLightTarget, camera;
let localPlayer = null;
let lastSentPosition;
let gameInitialized = false;
let cardSystem, cardManager, questionSystem;
let currentCardType = null;
let canMove = false; // Start with movement disabled
let isMinigameActive = false; // Block movement during minigames
window.isMinigameActive = isMinigameActive;
let phaseTimer = null;
let currentPhase = "waiting";

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

    loadingManager.startLoading(3000, () => {
      console.log('Loading complete!');
      renderer.setAnimationLoop(animate);

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
  // Initialize card manager for handling card effects
  cardManager = new CardManager();

  // Initialize card system with socket client and callback
  cardSystem = new CardSystem(socketClient, handleCardSelection);

  // Initialize question system with socket client and callback
  console.log("🔄 Initializing QuestionSystem with callback...");
  questionSystem = new QuestionSystem(socketClient, handleQuestionComplete);
  console.log("✅ QuestionSystem initialized, callback set:", !!questionSystem.onQuestionComplete);
}

function startInitialCountdown() {
  console.log("⏱️ Starting 5-second initial countdown");
  currentPhase = 'initial_countdown';
  canMove = false;

  if (refreshMovementUI) {
    refreshMovementUI();
  }

  // Clear any existing timers
  clearPhaseTimer();

  // Show initial countdown message
  showInitialCountdownMessage();

  // Set timer to automatically move to card phase after 5 seconds
  phaseTimer = setTimeout(() => {
    console.log("✅ Initial countdown over, starting first card phase");
    hideInitialCountdownMessage();
    startCardPhase();
  }, 5000);
}

function showInitialCountdownMessage() {
  // Create or show initial countdown message
  let countdownMsg = document.getElementById('initialCountdownMessage');
  if (!countdownMsg) {
    countdownMsg = document.createElement('div');
    countdownMsg.id = 'initialCountdownMessage';
    countdownMsg.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 25px 50px;
      border-radius: 15px;
      font-size: 2em;
      z-index: 1000;
      text-align: center;
      border: 3px solid #2196F3;
      box-shadow: 0 0 30px rgba(33, 150, 243, 0.5);
    `;
    document.body.appendChild(countdownMsg);
  }

  let timeLeft = 5;
  countdownMsg.textContent = `Game starts in ${timeLeft} seconds`;

  // Update countdown
  const countdown = setInterval(() => {
    timeLeft--;
    countdownMsg.textContent = `Game starts in ${timeLeft} seconds`;

    if (timeLeft <= 0) {
      clearInterval(countdown);
    }
  }, 1000);
}

function hideInitialCountdownMessage() {
  const countdownMsg = document.getElementById('initialCountdownMessage');
  if (countdownMsg) {
    countdownMsg.remove();
  }
}

function startCardPhase() {
  console.log("🃏 Starting card selection phase (10 seconds)");
  currentPhase = 'card';
  canMove = false;

  // Reset steps at the beginning of card phase (new turn)
  if (localPlayer) {
    localPlayer.resetSteps();
  }

  if (refreshMovementUI) {
    refreshMovementUI();
  }

  // Clear any existing timers
  clearPhaseTimer();

  // Show card selection
  cardSystem.showCardSelection();

  // Set timer to automatically move to question phase after 10 seconds
  phaseTimer = setTimeout(() => {
    console.log("⏰ Card phase over, moving to question phase");
    endCardPhase();
  }, 10000);
}

function endCardPhase() {
  // Hide card selection if it's still visible
  cardSystem.hideCardSelection();

  // If no card was selected, automatically select a card
  if (!currentCardType) {
    console.log("No card selected, automatically selecting a card...");
    autoSelectCard();
  }

  // Move to question phase
  startQuestionPhase();
}

// Add auto card selection function
function autoSelectCard() {
  if (!cardSystem.currentCards || cardSystem.currentCards.length === 0) {
    console.log("No cards available for auto-selection");
    currentCardType = 'time_expired';

    // Apply time expired penalty immediately
    if (localPlayer) {
      const effect = cardManager.applyNegativeEffects('time_expired', localPlayer);
      if (effect && localPlayer.applyEffect) {
        localPlayer.applyEffect(effect);
      }
    }
    return;
  }

  // Select a random card instead of always the first one
  const randomIndex = Math.floor(Math.random() * cardSystem.currentCards.length);
  const selectedCard = cardSystem.currentCards[randomIndex];
  currentCardType = selectedCard.id;

  console.log(`🎲 Auto-selected card: ${currentCardType} - ${selectedCard.title}`);

  // Highlight the selected card in UI
  highlightSelectedCard(currentCardType);

  // Send card selection to server
  if (socketClient && socketClient.selectCard) {
    socketClient.selectCard(currentCardType);
  }
}

function handleCardSelection(cardType) {
  console.log("Card selected:", cardType);

  // Store the selected card type for later use
  currentCardType = cardType;

  // Note: We don't immediately move to question phase
  // The phase timer will handle that after 10 seconds
  // But we can update UI to show the card is selected
  highlightSelectedCard(cardType);
}

function highlightSelectedCard(cardType) {
  // Remove highlight from all cards
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.classList.remove('selected');
  });

  // Highlight the selected card
  const selectedCard = document.querySelector(`[data-card-type="${cardType}"]`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }
}

function startQuestionPhase() {
  console.log("❓ Starting question phase");
  currentPhase = 'question';
  canMove = false;

  if (refreshMovementUI) {
      refreshMovementUI();
  }

  // Clear any existing timers
  clearPhaseTimer();

  // Show question
  questionSystem.showQuestion();

  // For logic questions only, set a timer to auto-complete
  // For spatial questions, the minigame callback will handle completion
  if (!questionSystem.isSpatialQuestion) {
      console.log("⏰ Setting 15s timer for logic question");
      phaseTimer = setTimeout(() => {
          console.log("⏰ Logic question timer expired");
          endQuestionPhase();
      }, 15000);
  } else {
      console.log("🎮 Spatial question - no phase timer, minigame will handle completion");
  }
}

function endQuestionPhase() {
  // For logic questions, check if answer was selected
  // For spatial questions, this will be called by the minigame callback
  if (!questionSystem.isSpatialQuestion) {
      const isCorrect = questionSystem.selectedAnswer !== null ?
          questionSystem.isAnswerCorrect(questionSystem.selectedAnswer) : false;

      handleQuestionComplete(isCorrect, questionSystem.selectedAnswer);
  }
  // For spatial questions, completion is handled by the minigame callback
}

function handleQuestionComplete(isCorrect, selectedAnswer) {
  console.log("🔄 [MAIN] handleQuestionComplete called with:", { isCorrect, selectedAnswer });

  // Apply card effects based on question result
  if (localPlayer && currentCardType) {
      console.log("🔄 [MAIN] Applying card effects for card:", currentCardType);
      applyCardEffectsBasedOnQuestion(isCorrect, currentCardType);

      // Show movement info in console
      const movementInfo = localPlayer.getMovementInfo();
      console.log("Movement Info after card effects:", movementInfo);

      // Log the active effects to debug
      console.log("Active effects:", localPlayer.activeEffects);
  } else {
      console.log("🔄 [MAIN] No local player or current card type");
  }

  // Reset current card
  currentCardType = null;

  console.log("🔄 [MAIN] Moving to movement phase...");
  
  // Small delay to ensure all cleanup is done before starting movement
  setTimeout(() => {
      console.log("🔄 [MAIN] Starting movement phase now");
      startMovementPhase();
  }, 500);
}

function isAnyMinigameActive() {
  const spatialMinigame = document.getElementById('spatialMinigame');
  const questionContainer = document.getElementById('questionContainer');
  
  // Check both UI elements and the question system state
  const uiMinigameActive = (spatialMinigame && spatialMinigame.style.display === 'block') ||
                          (questionContainer && questionContainer.style.display === 'block');
  
  // Also check the question system's internal state
  const systemMinigameActive = questionSystem && 
                              (questionSystem.questionActive || questionSystem.spatialMinigameActive);
  
  console.log("🔍 Minigame check - UI:", uiMinigameActive, "System:", systemMinigameActive);
  
  return uiMinigameActive || systemMinigameActive;
}

function startMovementPhase() {
  console.log("🎮 [MAIN] startMovementPhase called");
  currentPhase = 'movement';

  // Double-check that no minigames are active
  if (isAnyMinigameActive()) {
      console.log("⏳ Minigame still active, delaying movement phase");
      // Wait a bit and check again
      setTimeout(() => {
          if (!isAnyMinigameActive()) {
              console.log("✅ Minigame finished, starting movement phase");
              startMovementPhase();
          } else {
              // If still active, wait another second
              console.log("⏳ Minigame still active, waiting...");
              setTimeout(() => startMovementPhase(), 1000);
          }
      }, 500);
      return;
  }

  console.log("✅ [MAIN] All minigames finished, proceeding with movement phase");

  // Rest of your existing movement phase code...
  if (localPlayer) {
      console.log("=== MOVEMENT PHASE DEBUG ===");
      localPlayer.movesQueue.length = 0;
      localPlayer.updateRemainingSteps();

      console.log("Active effects:", localPlayer.activeEffects);

      // Check for move_or_stop_negative effect
      const hasMoveStopNegative = localPlayer.activeEffects &&
          localPlayer.activeEffects.some(effect => effect.type === 'move_or_stop_negative');
      console.log("Has move_or_stop_negative effect:", hasMoveStopNegative);

      // Check movement status
      const canPlayerMove = localPlayer.canMove();
      const movementInfo = localPlayer.getMovementInfo();

      console.log("Movement check - canMove:", canPlayerMove);
      console.log("Remaining steps:", localPlayer.remainingSteps);
      console.log("Final step:", movementInfo.finalStep);
      console.log("=== END DEBUG ===");
  }

  // Allow movement based on card effects
  canMove = localPlayer ? localPlayer.canMove() && !isMinigameActive : false;
  window.isMinigameActive = isMinigameActive;
  
  console.log(`🎮 [MAIN] Movement phase - Player can move: ${canMove}`);

  if (refreshMovementUI) {
      refreshMovementUI();
  }

  showMovementMessage();
  clearPhaseTimer();
  phaseTimer = setTimeout(() => {
      console.log("⏰ Movement phase over, starting next cycle");
      endMovementPhase();
  }, 15000);
}

function endMovementPhase() {
  console.log("🔄 Cleaning up movement phase and preparing for next turn");

  // Clean up player effects at the END of movement phase
  if (localPlayer) {
    localPlayer.cleanupEffects();
  }

  // Start next card cycle
  startCardPhase();
}

function showMovementMessage() {
  // Create or show movement message
  let moveMsg = document.getElementById('movementPhaseMessage');
  if (!moveMsg) {
    moveMsg = document.createElement('div');
    moveMsg.id = 'movementPhaseMessage';
    moveMsg.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 1.2em;
            z-index: 1000;
            text-align: center;
        `;
    document.body.appendChild(moveMsg);
  }

  let timeLeft = 15;

  const updateMessage = () => {
    const hasMoveStopNegative = localPlayer && localPlayer.activeEffects &&
      localPlayer.activeEffects.some(effect => effect.type === 'move_or_stop_negative');

    const canPlayerMove = localPlayer ? localPlayer.canMove() : false;
    const stepInfo = localPlayer ? localPlayer.getMovementInfo() : {
      canMove: false,
      finalStep: 0,
      remainingSteps: 0
    };

    if (hasMoveStopNegative) {
      moveMsg.textContent = `Movement Blocked! - ${timeLeft}s left`;
      moveMsg.style.background = 'rgba(255, 0, 0, 0.8)'; // Red for blocked
    } else if (canPlayerMove) {
      moveMsg.textContent = `Move Now! ${stepInfo.remainingSteps}/${stepInfo.finalStep} steps - ${timeLeft}s left`;
      moveMsg.style.background = 'rgba(0, 255, 0, 0.8)'; // Green for allowed
    } else {
      moveMsg.textContent = `Cannot Move - ${timeLeft}s left`;
      moveMsg.style.background = 'rgba(255, 165, 0, 0.8)'; // Orange for other reasons
    }
  };

  // Update immediately
  updateMessage();

  // Update countdown
  const countdown = setInterval(() => {
    timeLeft--;
    updateMessage();

    if (timeLeft <= 0) {
      clearInterval(countdown);
      moveMsg.remove();
    }
  }, 1000);
}

function clearPhaseTimer() {
  if (phaseTimer) {
    clearTimeout(phaseTimer);
    phaseTimer = null;
  }

  // Remove any phase messages
  const moveMsg = document.getElementById('movementPhaseMessage');
  if (moveMsg) {
    moveMsg.remove();
  }
}

// Add this function for manual testing
function debugForceMovementPhase() {
  console.log("🔄 [DEBUG] Manually forcing movement phase");
  startMovementPhase();
}

// Make it available globally for testing
window.debugForceMovementPhase = debugForceMovementPhase;

function applyCardEffectsBasedOnQuestion(isCorrect, cardType) {
  console.log(`🔄 Applying card effects: isCorrect=${isCorrect}, cardType=${cardType}`);
  
  if (isCorrect) {
    console.log("✅ Question answered correctly! Applying positive card effects...");
    const effect = cardManager.applyPositiveEffects(cardType, localPlayer);
    if (effect && localPlayer.applyEffect) {
      localPlayer.applyEffect(effect);
    }
  } else {
    console.log("❌ Question answered incorrectly! Applying negative card effects...");
    const effect = cardManager.applyNegativeEffects(cardType, localPlayer);
    if (effect && localPlayer.applyEffect) {
      localPlayer.applyEffect(effect);
    }
  }
  
  // Force immediate step update after applying effects
  if (localPlayer) {
    console.log("🔄 Forcing step update after effect application...");
    localPlayer.updateRemainingSteps();
    
    // Get fresh movement info to verify the update
    const movementInfo = localPlayer.getMovementInfo();
    console.log(`🔄 After effect application - Final: ${movementInfo.finalStep}, Remaining: ${movementInfo.remainingSteps}`);
  }
}

// Export function to check if player can move
export function canPlayerMove() {
  return canMove;
}

// Rest of your existing functions remain the same...
function initializeGame() {
  console.log("🟡 Initializing game...");

  scene = new THREE.Scene();

  ambientLight = new THREE.AmbientLight();

  dirLight = DirectionalLight();

  dirLightTarget = new THREE.Object3D();
  dirLight.target = dirLightTarget;

  lastSentPosition = new THREE.Vector3();

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

function animate() {
  updatePhysics();

  if (socketClient && socketClient.players) {
    socketClient.players.forEach(player => {
      if (player.updatePhysics) player.updatePhysics();
    });
  }

  if (localPlayer && canMove) {
    console.log("🎮 Animating with local player");
    localPlayer.animatePlayer();

    // Camera follows player X and Y position but maintains fixed height
    const cameraOffset = new THREE.Vector3(50, -80, 80);

    camera.position.set(
      localPlayer.position.x + cameraOffset.x,
      localPlayer.position.y + cameraOffset.y,
      cameraOffset.z
    );

    const lookAtPoint = new THREE.Vector3(
      localPlayer.position.x,
      localPlayer.position.y,
      0
    );
    camera.lookAt(lookAtPoint);

    // Update directional light
    dirLight.position.set(
      localPlayer.position.x,
      localPlayer.position.y,
      50
    );
    dirLightTarget.position.set(
      localPlayer.position.x,
      localPlayer.position.y,
      0
    );

    if (localPlayer.position.x !== lastSentPosition.x ||
      localPlayer.position.y !== lastSentPosition.y ||
      localPlayer.position.z !== lastSentPosition.z) {

      socketClient.update(
        {
          x: localPlayer.position.x,
          y: localPlayer.position.y,
          z: localPlayer.position.z
        },
        {
          x: localPlayer.rotation.x,
          y: localPlayer.rotation.y,
          z: localPlayer.rotation.z
        }
      );

      // Store last sent position
      lastSentPosition.copy(localPlayer.position);
    }
  } else if (localPlayer && !canMove) {
    // Player exists but can't move (in card/question phase)
    console.log("🎮 Player waiting for movement phase");
  } else {
    // Default overview when no player
    console.log("🎮 No local player, showing default view");

    const mapWidth = 4 * 42;
    const mapHeight = 13 * 42;
    const mapCenterX = mapWidth / 2;
    const mapCenterY = mapHeight / 2;

    camera.position.set(mapCenterX + 50, mapCenterY - 50, 50);
    camera.lookAt(mapCenterX, mapCenterY, 0);

    dirLight.position.set(mapCenterX, mapCenterY, 50);
    dirLightTarget.position.set(mapCenterX, mapCenterY, 0);
  }

  // Animate floating tiles after 4th row
  if (map && map.children) {
    if (!animate._startTime) animate._startTime = performance.now();

    // Ensure appear animation starts once the scene is visible
    if (!animate._initializedAppear) {
      map.children.forEach(tile => {
        if (tile.userData?.appearing) {
          tile.userData.appearing.startTime = performance.now();
          // Force initial position from startZ
          tile.position.z = tile.userData.appearing.startZ;
        }
        // Store originalZ for float animation later
        if (tile.userData?.floating && tile.userData.originalZ === undefined) {
          tile.userData.originalZ = tile.position.z;
        }
      });
      animate._initializedAppear = true;
      console.log("🎬 Tile appear animations initialized!");
    }

    const now = performance.now();
    const elapsed = (now - animate._startTime) / 1000;

    map.children.forEach(tile => {
      const { appearing, floating } = tile.userData || {};
      const originalZ = tile.userData.originalZ ?? 0;
      const now = performance.now();
    
      // --- Appear from below ---
      if (appearing) {
        const progress = (now - appearing.startTime) / appearing.duration;
        if (progress < 1) {
          const eased = 1 - Math.pow(1 - progress, 3);
          tile.position.z = appearing.startZ + (appearing.endZ - appearing.startZ) * eased;
        } else {
          tile.position.z = appearing.endZ;
          delete tile.userData.appearing;
    
          // 👇 start floating *after* appear ends
          if (tile.userData.floating) {
            tile.userData.floating.startTime = now + 200; // small delay (200ms)
            tile.userData.floating.startZ = tile.position.z;
          }
        }
      }
    
      // --- Floating animation (after appear finishes) ---
      else if (floating && now > (floating.startTime ?? 0)) {
        const { amplitude, speed, phase, startZ } = floating;
        const elapsed = (now - floating.startTime) / 1000;
        tile.position.z = startZ - amplitude * (1 - Math.abs(Math.sin(speed * elapsed + phase)));
      }
    });    
  }

  renderer.render(scene, camera);
}

function addPlayer(player) {
  console.log("=== addPlayer CALLED ===");

  if (player.playerId === socketClient.id && !localPlayer) {
    localPlayer = player;
    console.log("✅ LOCAL PLAYER SET!:", player.playerId);

    // Set card manager reference
    if (cardManager) {
      console.log("🔄 Setting cardManager for local player");
      localPlayer.setCardManager(cardManager);
      console.log("🔄 cardManager set:", !!localPlayer.cardManager);
    } else {
      console.log("❌ cardManager is not available!");
    }

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
    if (cardManager) {
      player.setCardManager(cardManager);
    }
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

// Add this function to test the callback manually
function testQuestionCompleteCallback() {
  console.log("🧪 Testing question complete callback manually...");
  if (questionSystem && questionSystem.onQuestionComplete) {
      questionSystem.onQuestionComplete(true, 'test');
  } else {
      console.error("❌ Cannot test - questionSystem or callback not available");
  }
}

window.testQuestionCompleteCallback = testQuestionCompleteCallback;

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