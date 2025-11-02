import { getLocalPlayer } from "../main.js";
import { isMovementPhaseActive } from "../phases/movePhase.js";

function setupInputHandlers() {
    console.log("🎮 Setting up input handlers");
    
    const forwardBtn = document.getElementById("forward");
    const backwardBtn = document.getElementById("backward");
    const leftBtn = document.getElementById("left");
    const rightBtn = document.getElementById("right");

    // Add event listeners
    forwardBtn?.addEventListener("click", () => handleMove("forward"));
    backwardBtn?.addEventListener("click", () => handleMove("backward"));
    leftBtn?.addEventListener("click", () => handleMove("left"));
    rightBtn?.addEventListener("click", () => handleMove("right"));

    // Keyboard events
    window.addEventListener("keydown", handleKeyDown);
    
    console.log("🎮 Input handlers setup complete");
}

function handleMove(direction) {
    // Check if movement phase is active
    if (!isMovementPhaseActive()) {
        console.log(`🎮 Movement not allowed: Not in movement phase`);
        return;
    }

    const localPlayer = getLocalPlayer();
    console.log(`🎮 Move requested: ${direction}, Player exists: ${!!localPlayer}`);
    
    if (localPlayer) {
        console.log(`🎮 Queueing move: ${direction}`);
        localPlayer.queueMove(direction);
        console.log(`🎮 Moves queue:`, localPlayer.movesQueue);
    } else {
        console.log("🎮 No local player found for movement");
    }
}

function handleKeyDown(event) {
    
    if (event.key === "ArrowUp" || event.key === "W" || event.key === "w") {
        event.preventDefault();
        handleMove("forward");
    } else if (event.key === "ArrowDown" || event.key === "S" || event.key === "s") {
        event.preventDefault();
        handleMove("backward");
    } else if (event.key === "ArrowLeft" || event.key === "A" || event.key === "a") {
        event.preventDefault();
        handleMove("left");
    } else if (event.key === "ArrowRight" || event.key === "D" || event.key === "d") {
        event.preventDefault();
        handleMove("right");
    }
}

// Add visual feedback for blocked movement
export function updateMovementUI() {
    const controls = document.getElementById('controls');
    const localPlayer = getLocalPlayer();
    
    if (controls) {
        if (localPlayer) {
            controls.style.opacity = '1';
            controls.style.pointerEvents = 'auto';
        } else {
            controls.style.opacity = '0.5';
            controls.style.pointerEvents = 'none';
        }
    }
}

// Periodically update UI to reflect movement state
function startMovementUIUpdater() {
    setInterval(updateMovementUI, 500);
}

// Initialize input handlers when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupInputHandlers();
        // Start UI updater after a short delay to ensure controls are rendered
        setTimeout(startMovementUIUpdater, 1000);
    });
} else {
    setupInputHandlers();
    setTimeout(startMovementUIUpdater, 1000);
}