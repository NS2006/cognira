import { clearPhaseTimer, setPhaseTimer, questionSystem, cardSystem, getLocalPlayer } from "../../main.js";
import { endMinigamePhase } from "../minigamePhase.js";
import { QUESTION_PHASE_TIME, PHASE_TRANSITION_DELAY } from "../../constants.js";

let questionPhaseTimer = null;

export function startQuestionPhase() {
  console.log(`❓ Starting question phase (${QUESTION_PHASE_TIME} seconds)`);

  // Clear any existing timers
  clearPhaseTimer();

  // Set up question completion callback
  questionSystem.onQuestionComplete = (isCorrect, selectedAnswer) => {
    console.log(`❓ Question completed - Correct: ${isCorrect}, Answer: ${selectedAnswer}`);
    endQuestionPhase(isCorrect);
  };

  // Show the question
  questionSystem.showQuestion();

  // Set timer to automatically end question phase after time limit
  // Note: Question system has its own internal timer, this is a backup
  questionPhaseTimer = setTimeout(() => {
    console.log("⏰ Question phase time limit reached");
    endQuestionPhase(false);
  }, (QUESTION_PHASE_TIME + 1) * 1000 + 500); // Add buffer for animations
  
  setPhaseTimer(questionPhaseTimer);
}

export function endQuestionPhase(isCorrect = false) {
  console.log("❓ Ending question phase");

  // Clear timers
  if (questionPhaseTimer) {
    clearTimeout(questionPhaseTimer);
    questionPhaseTimer = null;
  }
  clearPhaseTimer();

  // Hide question if it's still visible
  questionSystem.hideQuestion();

  // Reset callback
  questionSystem.onQuestionComplete = null;

  console.log(`🎯 Question result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);

  const localPlayer = getLocalPlayer();
  cardSystem.applyCardEffect(localPlayer.selectedCard.id, isCorrect, localPlayer);
  
  // Add a small delay before ending minigame phase to ensure clean transition
  setTimeout(() => {
    endMinigamePhase();
  }, PHASE_TRANSITION_DELAY * 1000);
}