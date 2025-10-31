import { getLocalPlayer, getSocketClient, canPlayerMove } from "../main.js";

// Track which directions are currently held (to prevent repeat moves)
const keyHeld = {
    forward: false,
    backward: false,
    left: false,
    right: false
};

function setupInputHandlers() {
    console.log("🎮 Setting up input handlers");
    
    const forwardBtn = document.getElementById("forward");
    const backwardBtn = document.getElementById("backward");
    const leftBtn = document.getElementById("left");
    const rightBtn = document.getElementById("right");

    // Add event listeners for buttons (one move per press)
    forwardBtn?.addEventListener("mousedown", () => handleMoveOnce("forward"));
    backwardBtn?.addEventListener("mousedown", () => handleMoveOnce("backward"));
    leftBtn?.addEventListener("mousedown", () => handleMoveOnce("left"));
    rightBtn?.addEventListener("mousedown", () => handleMoveOnce("right"));

    // Reset on mouse up (to allow next click)
    ["mouseup", "mouseleave"].forEach(evt => {
        forwardBtn?.addEventListener(evt, () => (keyHeld.forward = false));
        backwardBtn?.addEventListener(evt, () => (keyHeld.backward = false));
        leftBtn?.addEventListener(evt, () => (keyHeld.left = false));
        rightBtn?.addEventListener(evt, () => (keyHeld.right = false));
    });

    // Keyboard events
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
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

// Button handler with anti-repeat lock
function handleMoveOnce(direction) {
    if (keyHeld[direction]) return; // prevent holding spam
    keyHeld[direction] = true;
    handleMove(direction);

    // Slight debounce to prevent double triggering
    setTimeout(() => (keyHeld[direction] = false), 150);
}

function handleKeyDown(event) {
    const keyMap = {
        "ArrowUp": "forward",
        "w": "forward",
        "W": "forward",
        "ArrowDown": "backward",
        "s": "backward",
        "S": "backward",
        "ArrowLeft": "left",
        "a": "left",
        "A": "left",
        "ArrowRight": "right",
        "d": "right",
        "D": "right"
    };

    const direction = keyMap[event.key];
    if (!direction) return;

    event.preventDefault();

    // Prevent repeat fire when holding down key
    if (keyHeld[direction]) return;

    keyHeld[direction] = true;
    handleMove(direction);
}

function handleKeyUp(event) {
    const keyMap = {
        "ArrowUp": "forward",
        "w": "forward",
        "W": "forward",
        "ArrowDown": "backward",
        "s": "backward",
        "S": "backward",
        "ArrowLeft": "left",
        "a": "left",
        "A": "left",
        "ArrowRight": "right",
        "d": "right",
        "D": "right"
    };

    const direction = keyMap[event.key];
    if (!direction) return;

    keyHeld[direction] = false;
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
