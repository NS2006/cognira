import { MATH_OPERATION_PHASE_TIME, PHASE_TRANSITION_DELAY } from "../../constants.js";
import { clearPhaseTimer, setPhaseTimer, mathOperationSystem, cardSystem, getLocalPlayer } from "../../main.js";
import { endMinigamePhase } from "../minigamePhase.js";

let mathOperationPhaseTimer = null;

export function startMathOperationPhase() {
  console.log("🧮 Starting math operation game phase");

  // Clear any existing timers
  clearPhaseTimer();

  // Set up math operation game completion callback
  mathOperationSystem.onGameComplete = (isCorrect) => {
    console.log(`🧮 Math operation game completed - Correct: ${isCorrect}`);
    endMathOperationPhase(isCorrect);
  };

  // Show the math operation game
  mathOperationSystem.showGame();

  // Set timer to automatically end math operation game phase after time limit
  mathOperationPhaseTimer = setTimeout(() => {
    console.log("⏰ Math operation game phase time limit reached");
    endMathOperationPhase(false);
  }, (MATH_OPERATION_PHASE_TIME + 1) * 1000 + 500); // Add buffer for animations
  
  setPhaseTimer(mathOperationPhaseTimer);
}

export function endMathOperationPhase(isCorrect = false) {
  console.log("🧮 Ending math operation game phase");

  // Clear timers
  if (mathOperationPhaseTimer) {
    clearTimeout(mathOperationPhaseTimer);
    mathOperationPhaseTimer = null;
  }
  clearPhaseTimer();

  // Hide math operation game if it's still visible
  mathOperationSystem.hideGame();

  // Reset callback
  mathOperationSystem.onGameComplete = null;

  console.log(`🎯 Math operation game result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);

  const localPlayer = getLocalPlayer();
  cardSystem.applyCardEffect(localPlayer.selectedCard.id, isCorrect, localPlayer);
  
  // Add a small delay before ending minigame phase to ensure clean transition
  setTimeout(() => {
    endMinigamePhase();
  }, PHASE_TRANSITION_DELAY * 1000);
}