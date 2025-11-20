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
import { LeafParticles } from "./components/particles/LeafParticleSystem";
import { initializeLeaderboard } from "./phases/leaderboardPhase";
import { 
    initializeUsernameHandlers, 
    showUsernamePopup
} from "./utilities/handleUsernameInput";
import { initializeFinishGame } from "./utilities/finishGame";

const mainMenu = document.getElementById("mainMenu");
const gameCanvas = document.getElementById("gameCanvas");
const joinGameButton = document.getElementById("joinGameButton");
const controlsButton = document.getElementById("controls");

export let currentRound = 0;
export let minigameSequence = []; // Store minigame sequence
export let cardSystem, questionSystem, memoryMatrixSystem, mathOperationSystem;
var scene, socketClient, ambientLight, dirLight, dirLightTarget, camera;
let localPlayer = null;
let gameInitialized = false;
let _phaseTimer = null;
let animateFunction = null;
let lobby;
let leafParticles = null;

const renderer = Renderer();

initializeGame();
setupMainMenuHandlers();

function setupMainMenuHandlers() {
    // Initialize username handlers
    initializeUsernameHandlers();

    // Join Game button click - show username popup
    joinGameButton.addEventListener("click", (e) => {
        e.preventDefault();
        showUsernamePopup();
    });
}

export function initializeSocketConnection(username) {
    console.log(`🎮 Initializing socket connection for: ${username}`);
    
    // Hide join button
    joinGameButton.style.display = "none";

    // Initialize socket connection
    socketClient = new SocketClient(username, addPlayer, removePlayer, updatePlayerCount, handleMinigameSequenceReceived);
}

// Handle received minigame sequence
function handleMinigameSequenceReceived(sequence) {
    minigameSequence = sequence;
    console.log(`🎲 Minigame sequence stored: ${minigameSequence.join(', ')}`);
}

function updatePlayerCount(count, players) {
    if(gameInitialized){
        return;
    }

    if (!lobby) {
        lobby = new Lobby(socketClient);
    }
    lobby.show(players);

    if (count >= MAX_PLAYER && !gameInitialized) {
        lobby.hide();

        gameInitialized = true;

        // Hide main menu
        mainMenu.style.display = "none";
        
        controlsButton.style.display = "flex";
        gameCanvas.style.display = "flex";

        loadingManager.startLoading(1000, () => {
            console.log('Loading complete!');
            showGameUI();
            
            animateFunction = createAnimationLoop(
                scene,
                camera,
                dirLight,
                dirLightTarget,
                map,
                renderer,
                getLocalPlayer,
                getSocketClient,
                leafParticles
            );
            
            renderer.setAnimationLoop(animateFunction);
            initializeGameSystems();
            // Show UI leaf decorations when the game actually starts
            document.querySelectorAll('.ui-leaf').forEach(el => {
                el.style.display = 'flex';
            });
            startInitialCountdown();
        });
    }
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

export function updateRoundDisplay() {
    const roundDisplay = document.getElementById('currentRoundDisplay');
    if (roundDisplay) {
        roundDisplay.textContent = currentRound;
        roundDisplay.classList.add('changed');
        setTimeout(() => roundDisplay.classList.remove('changed'), 500);
    }
}

export function updateStepsDisplay() {
    const stepsDisplay = document.getElementById('currentStepsDisplay');
    const localPlayer = getLocalPlayer();
    
    if (stepsDisplay && localPlayer) {
        stepsDisplay.textContent = localPlayer.remainingSteps;
        stepsDisplay.classList.add('changed');
        setTimeout(() => stepsDisplay.classList.remove('changed'), 500);
    } else if (stepsDisplay) {
        stepsDisplay.textContent = '0';
    }
}

export function showGameUI() {
    const gameInfo = document.getElementById('gameInfo');
    if (gameInfo) {
        gameInfo.style.display = 'block';
    }
}

export function hideGameUI() {
    const gameInfo = document.getElementById('gameInfo');
    if (gameInfo) {
        gameInfo.style.display = 'none';
    }
}

export function incrementRound() {
    currentRound++;
    updateRoundDisplay();
    console.log(`🔄 Round updated to: ${currentRound}`);
}

export function resetRound() {
    currentRound = 0;
    updateRoundDisplay();
    console.log(`🔄 Round updated to: ${currentRound}`);
}

export function isGameInitialized(){
    return gameInitialized;
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

    const moveMsg = document.getElementById('movementPhaseMessage');
    if (moveMsg) {
        moveMsg.remove();
    }
}

function initializeGame() {
    console.log("🟡 Initializing game...");

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xaad0ff, 0.001);

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

    leafParticles = new LeafParticles(scene, 20, 150);

    initializeMap();
    initializeFinishGame();
    initializeLeaderboard();
    loadTrees();
    loadRiver();
}

export function getLocalPlayer() {
    return localPlayer;
}

export function getSocketClient() {
    return socketClient;
}

export function cleanupGame() {
    if (cardSystem) {
        cardSystem.stopCardInterval();
    }
    if (questionSystem) {
        questionSystem.hideQuestion();
    }
    clearPhaseTimer();
    resetAnimationState();
    
    if (animateFunction) {
        renderer.setAnimationLoop(null);
    }

    gameInitialized = false;
}