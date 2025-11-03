import { clearPhaseTimer } from "../main.js";
import { PHASE_TRANSITION_DELAY } from "../constants.js";
import { startMovementPhase } from "./movePhase.js";
import { startQuestionPhase } from "./minigames/questionPhase.js";
import { startTetrisPhase } from "./minigames/tetrisPhase.js";
import { startMemoryMatrixPhase } from "./minigames/memoryMatrixPhase.js";
import { startMathOperationPhase } from "./minigames/mathOperationPhase.js";

let minigamePhaseActive = false;
let currentMinigameType = null;

export function startMinigamePhase() {
  if (minigamePhaseActive) {
    console.log("🎮 Minigame phase already active, skipping");
    return;
  }

  console.log("🎮 Starting minigame selection phase");
  minigamePhaseActive = true;

  // Clear any existing timers
  clearPhaseTimer();

  // Small delay before starting minigame
  setTimeout(() => {
    // Randomly choose the minigame
    const minigameTypes = ['mathOperation'];
    currentMinigameType = minigameTypes[Math.floor(Math.random() * minigameTypes.length)];
    
    console.log(`🎯 Selected minigame: ${currentMinigameType}`);

    // Start the selected minigame
    if (currentMinigameType === 'question') {
      startQuestionPhase();
    } else if (currentMinigameType === 'tetris') {
      startTetrisPhase();
    } else if (currentMinigameType === 'memoryMatrix') {
      startMemoryMatrixPhase();
    } else if (currentMinigameType === 'mathOperation') {
      startMathOperationPhase();
    } else {
      console.error('Unknown minigame type:', currentMinigameType);
      startQuestionPhase();
    }
  }, PHASE_TRANSITION_DELAY * 1000);
}

export function endMinigamePhase() {
  if (!minigamePhaseActive) {
    console.log("🎮 Minigame phase not active, skipping end");
    return;
  }

  console.log(`🎮 Ending minigame phase (${currentMinigameType})`);
  minigamePhaseActive = false;

  // Clear any existing timers
  clearPhaseTimer();

  // Reset current minigame type
  currentMinigameType = null;

  // Add delay before starting movement phase
  setTimeout(() => {
    console.log("🔄 Transitioning to movement phase...");
    startMovementPhase();
  }, PHASE_TRANSITION_DELAY * 1000);
}

export function getCurrentMinigameType() {
  return currentMinigameType;
}

export function isMinigamePhaseActive() {
  return minigamePhaseActive;
}