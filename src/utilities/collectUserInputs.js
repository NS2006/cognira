import { getLocalPlayer, getSocketClient, canPlayerMove } from "../main.js";

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
    // Check if player can move first (global movement lock)
    if (!canPlayerMove()) {
        console.log(`🎮 Movement blocked - card selection or question in progress`);
        return;
    }
    
    const localPlayer = getLocalPlayer();
    console.log(`🎮 Move requested: ${direction}, Player exists: ${!!localPlayer}`);
    
    if (localPlayer) {
        // Additional check: ensure player can move based on card effects and steps
        if (!localPlayer.canMove()) {
            console.log(`🎮 Movement blocked by card effects or no steps remaining`);
            return;
        }
        
        console.log(`🎮 Queueing move: ${direction}`);
        localPlayer.queueMove(direction);
        console.log(`🎮 Moves queue:`, localPlayer.movesQueue);
    } else {
        console.log("🎮 No local player found for movement");
    }
}

function handleKeyDown(event) {
    // Check if player can move first
    if (!canPlayerMove()) {
        // Still prevent default for arrow keys to avoid scrolling
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "W", "w", "S", "s", "A", "a", "D", "d"].includes(event.key)) {
            event.preventDefault();
        }
        return;
    }
    
    // Additional check: ensure player can move based on card effects and steps
    const localPlayer = getLocalPlayer();
    if (localPlayer && !localPlayer.canMove()) {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "W", "w", "S", "s", "A", "a", "D", "d"].includes(event.key)) {
            event.preventDefault();
        }
        return;
    }
    
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
function updateMovementUI() {
    const controls = document.getElementById('controls');
    const canMove = canPlayerMove();
    const localPlayer = getLocalPlayer();
    
    if (controls) {
        if (canMove && localPlayer && localPlayer.canMove()) {
            controls.style.opacity = '1';
            controls.style.pointerEvents = 'auto';
            
            // Show step count if available
            const stepInfo = localPlayer.getMovementInfo();
            console.log("Step Info:", stepInfo);
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

// Export function to manually trigger UI update (useful when movement state changes)
export function refreshMovementUI() {
    updateMovementUI();
}