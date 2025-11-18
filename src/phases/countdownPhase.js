import { clearPhaseTimer, phaseTimer } from "../main";
import { startCardPhase } from "./cardPhase";
import { updateMovementUI } from "../utilities/collectUserInputs";

export function startInitialCountdown() {
  console.log("⏱️ Starting 5-second initial countdown");

  if (updateMovementUI) {
    updateMovementUI();
  }

  // Clear any existing timers
  clearPhaseTimer();

  // Show initial countdown message
  showInitialCountdownMessage();

  // Set timer to automatically move to card phase after 5 seconds
  phaseTimer = setTimeout(() => {
    console.log("✅ Initial countdown over, starting first card phase");
    hideInitialCountdownMessage();
    startCardPhase();
  }, 5000);
}

function showInitialCountdownMessage() {
  // Create or show initial countdown message
  let countdownMsg = document.getElementById('initialCountdownMessage');
  if (!countdownMsg) {
    countdownMsg = document.createElement('div');
    countdownMsg.id = 'initialCountdownMessage';
    countdownMsg.style.cssText = `
      position: fixed;
      top: 10%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 25px 50px;
      border-radius: 15px;
      font-size: 1.5em;
      z-index: 1000;
      text-align: center;
      border: 3px solid #2196F3;
      box-shadow: 0 0 30px rgba(33, 150, 243, 0.5);
    `;
    document.body.appendChild(countdownMsg);
  }

  let timeLeft = 5;
  countdownMsg.textContent = `Game starts in ${timeLeft} seconds`;

  // Update countdown
  const countdown = setInterval(() => {
    timeLeft--;
    countdownMsg.textContent = `Game starts in ${timeLeft} seconds`;

    if (timeLeft <= 0) {
      clearInterval(countdown);
    }
  }, 1000);
}

function hideInitialCountdownMessage() {
  const countdownMsg = document.getElementById('initialCountdownMessage');
  if (countdownMsg) {
    countdownMsg.remove();
  }
}