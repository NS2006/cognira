import { startTetrisGame } from "../../components/Tetris";
import { clearPhaseTimer, phaseTimer } from "../../main";

let tetrisGameInstance = null;

export function startTetrisPhase() {
  console.log("🎮 Starting Tetris phase");

  // Clear any existing timers
  clearPhaseTimer();

  // Show Tetris container
  const tetrisContainer = document.getElementById('spatialMinigame');
  if (tetrisContainer) {
    tetrisContainer.style.display = 'block';
  }

  // Start Tetris game with 30-second time limit
  const TETRIS_TIME_LIMIT = 30000;
  
  tetrisGameInstance = startTetrisGame((success, score) => {
    console.log(`🎮 Tetris completed - Success: ${success}, Score: ${score}`);
    endTetrisPhase(success);
  }, TETRIS_TIME_LIMIT);

  // Set backup timer in case Tetris doesn't complete properly
  phaseTimer = setTimeout(() => {
    console.log("⏰ Tetris phase time limit reached");
    endTetrisPhase(false);
  }, TETRIS_TIME_LIMIT + 2000);
}

export function endTetrisPhase(success = false) {
  console.log("🎮 Ending Tetris phase");

  // Clear any existing timers
  clearPhaseTimer();

  // Stop Tetris game if active
  if (tetrisGameInstance) {
    tetrisGameInstance.stopGame();
    tetrisGameInstance = null;
  }

  // Hide Tetris container
  const tetrisContainer = document.getElementById('spatialMinigame');
  if (tetrisContainer) {
    tetrisContainer.style.display = 'none';
  }

  // Here you would typically:
  // 1. Apply card effects based on success
  // 2. Move to the next phase
  console.log(`🎯 Tetris result: ${success ? 'SUCCESS' : 'FAILED'}`);
  
  // Example: Move to movement phase or next turn
  // startMovementPhase();
}