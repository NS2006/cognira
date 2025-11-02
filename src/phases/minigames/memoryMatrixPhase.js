import { MEMORY_MATRIX_PHASE_TIME, PHASE_TRANSITION_DELAY } from "../../constants.js";
import { clearPhaseTimer, setPhaseTimer, memoryMatrixSystem, cardSystem, getLocalPlayer } from "../../main.js";
import { endMinigamePhase } from "../minigamePhase.js";

let matrixGamePhaseTimer = null;

export function startMemoryMatrixPhase() {
  console.log("🧠 Starting memory matrix game phase");

  // Clear any existing timers
  clearPhaseTimer();

  // Set up memory matrix game completion callback
  memoryMatrixSystem.onGameComplete = (isCorrect, selectedAnswer) => {
    console.log(`🧠 Memory matrix game completed - Correct: ${isCorrect}, Answer: ${selectedAnswer}`);
    endMemoryMatrixPhase(isCorrect);
  };

  // Show the memory matrix game
  memoryMatrixSystem.showGame();

  // Set timer to automatically end matrix game phase after time limit
  matrixGamePhaseTimer = setTimeout(() => {
    console.log("⏰ Memory matrix game phase time limit reached");
    endMemoryMatrixPhase(false);
  }, (MEMORY_MATRIX_PHASE_TIME  + 1) * 1000 + 500); // Add buffer for animations
  
  setPhaseTimer(matrixGamePhaseTimer);
}

export function endMemoryMatrixPhase(isCorrect = false) {
  console.log("🧠 Ending memory matrix game phase");

  // Clear timers
  if (matrixGamePhaseTimer) {
    clearTimeout(matrixGamePhaseTimer);
    matrixGamePhaseTimer = null;
  }
  clearPhaseTimer();

  // Hide memory matrix game if it's still visible
  memoryMatrixSystem.hideGame();

  // Reset callback
  memoryMatrixSystem.onGameComplete = null;

  console.log(`🎯 Memory matrix game result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);

  const localPlayer = getLocalPlayer();
  cardSystem.applyCardEffect(localPlayer.selectedCard.id, isCorrect, localPlayer);
  
  // Add a small delay before ending minigame phase to ensure clean transition
  setTimeout(() => {
    endMinigamePhase();
  }, PHASE_TRANSITION_DELAY * 1000);
}