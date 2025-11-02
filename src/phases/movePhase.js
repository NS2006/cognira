import { clearPhaseTimer, setPhaseTimer, getLocalPlayer } from "../main.js";
import { updateMovementUI } from "../utilities/collectUserInputs.js";
import { startCardPhase } from "./cardPhase.js";
import { 
  MOVEMENT_PHASE_TIME, 
  PHASE_TRANSITION_DELAY, 
  MESSAGE_DISPLAY_TIME, 
  MESSAGE_FADE_OUT_TIME, 
  STEPS_UPDATE_INTERVAL 
} from "../constants.js";
import { hideTimeDisplay, PhaseTimes, showPhaseTime } from "../utilities/showTime.js";

let movementPhaseActive = false;
let movementPhaseTimer = null;

export function startMovementPhase() {
  if (movementPhaseActive) {
    console.log("🚶 Movement phase already active, skipping");
    return;
  }

  console.log(`🚶 Starting movement phase (${MOVEMENT_PHASE_TIME} seconds)`);
  movementPhaseActive = true;

  
  // Clear any existing timers
  clearPhaseTimer();
  
  // Small delay before enabling movement to ensure clean transition
  setTimeout(() => {
    showPhaseTime('movement', PhaseTimes.MOVEMENT);
    
    // Enable movement controls
    updateMovementUI();

    // Display movement instructions
    showMovementPhaseMessage();

    // Set timer to automatically end movement phase
    movementPhaseTimer = setTimeout(() => {
      console.log("⏰ Movement phase time limit reached");
      endMovementPhase();
    }, MOVEMENT_PHASE_TIME * 1000);
    
    // Also set the main phase timer for consistency
    setPhaseTimer(movementPhaseTimer);
  }, PHASE_TRANSITION_DELAY * 1000);
}

export function endMovementPhase() {
  if (!movementPhaseActive) {
    console.log("🚶 Movement phase not active, skipping end");
    return;
  }

  console.log("🚶 Ending movement phase");
  movementPhaseActive = false;

  hideTimeDisplay();

  // Clear timers
  if (movementPhaseTimer) {
    clearTimeout(movementPhaseTimer);
    movementPhaseTimer = null;
  }
  clearPhaseTimer();

  // Remove movement phase message
  removeMovementPhaseMessage();

  // Disable movement controls during transition
  updateMovementUI(false);

  // Process any remaining moves and get final state
  const localPlayer = getLocalPlayer();
  if (localPlayer) {
    console.log(`🎯 Movement phase completed for player ${localPlayer.playerId}`);
    console.log(`📍 Final position: X=${localPlayer.gridPosition.currentX}, Y=${localPlayer.gridPosition.currentY}`);
    console.log(`👣 Remaining steps: ${localPlayer.remainingSteps}`);
  }

  // Add delay before next phase to ensure clean transition
  setTimeout(() => {
    console.log("🔄 Movement phase completed, ready for next phase");
    startCardPhase();
  }, PHASE_TRANSITION_DELAY * 1000);
}

export function isMovementPhaseActive() {
  return movementPhaseActive;
}

function showMovementPhaseMessage() {
  // Remove any existing message first
  removeMovementPhaseMessage();

  // Create movement phase message
  const messageDiv = document.createElement('div');
  messageDiv.id = 'movementPhaseMessage';
  messageDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      z-index: 1000;
      font-family: Arial, sans-serif;
    ">
      <h2>🎯 Movement Phase</h2>
      <p>You have <strong>${MOVEMENT_PHASE_TIME} seconds</strong> to move!</p>
      <p>Use arrow keys or on-screen controls</p>
      <p>Remaining steps: <span id="remainingStepsDisplay">5</span></p>
    </div>
  `;

  document.body.appendChild(messageDiv);

  // Auto-hide after specified time
  setTimeout(() => {
    messageDiv.style.opacity = '0';
    messageDiv.style.transition = `opacity ${MESSAGE_FADE_OUT_TIME}s`;
    setTimeout(() => {
      if (document.body.contains(messageDiv)) {
        document.body.removeChild(messageDiv);
      }
    }, MESSAGE_FADE_OUT_TIME * 1000);
  }, MESSAGE_DISPLAY_TIME * 1000);

  // Start updating remaining steps display
  startStepsDisplayUpdater();
}

function removeMovementPhaseMessage() {
  const existingMessage = document.getElementById('movementPhaseMessage');
  if (existingMessage) {
    document.body.removeChild(existingMessage);
  }
}

function startStepsDisplayUpdater() {
  const stepsDisplay = document.getElementById('remainingStepsDisplay');
  if (!stepsDisplay) return;

  // Update steps display at specified interval
  const updateInterval = setInterval(() => {
    const localPlayer = getLocalPlayer();
    if (localPlayer && stepsDisplay && movementPhaseActive) {
      stepsDisplay.textContent = localPlayer.remainingSteps;
    } else {
      clearInterval(updateInterval);
    }
  }, STEPS_UPDATE_INTERVAL * 1000);

  // Clear interval when movement phase ends
  setTimeout(() => {
    clearInterval(updateInterval);
  }, MOVEMENT_PHASE_TIME * 1000);
}