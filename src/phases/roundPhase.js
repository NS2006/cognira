import { clearPhaseTimer, setPhaseTimer, currentRound, incrementRound, getLocalPlayer, updateRoundDisplay, updateStepsDisplay } from "../main.js";
import { startCardPhase } from "./cardPhase.js";
import { PHASE_TRANSITION_DELAY, ROUND_PHASE_TIME } from "../constants.js";

let roundPhaseActive = false;
let roundPhaseTimer = null;

export function startRoundPhase() {
    if (roundPhaseActive) {
        console.log("🔄 Round phase already active, skipping");
        return;
    }

    console.log(`🔄 Starting round phase for round ${currentRound}`);
    roundPhaseActive = true;
    incrementRound();
    
    const localPlayer = getLocalPlayer();
    
    // Get additional two base step every new round
    localPlayer.baseStep += 3; 
    
    // Reset step
    localPlayer.resetSteps();

    updateRoundDisplay();
    updateStepsDisplay();

    // Clear any existing timers
    clearPhaseTimer();

    // Show round transition message
    showRoundTransitionMessage();

    // Set timer to automatically move to card phase
    roundPhaseTimer = setTimeout(() => {
        console.log(`🔄 Round ${currentRound} phase completed`);
        endRoundPhase();
    }, ROUND_PHASE_TIME * 1000);

    setPhaseTimer(roundPhaseTimer);
}

export function endRoundPhase() {
    if (!roundPhaseActive) {
        console.log("🔄 Round phase not active, skipping end");
        return;
    }

    console.log("🔄 Ending round phase");
    roundPhaseActive = false;

    // Clear timers
    if (roundPhaseTimer) {
        clearTimeout(roundPhaseTimer);
        roundPhaseTimer = null;
    }
    clearPhaseTimer();

    // Remove round message
    removeRoundTransitionMessage();

    // Add delay before next phase to ensure clean transition
    setTimeout(() => {
        // Move to card phase
        console.log("🔄 Round phase completed, moving to card phase");
        startCardPhase();
    }, PHASE_TRANSITION_DELAY * 1000);
}

export function isRoundPhaseActive() {
    return roundPhaseActive;
}

function showRoundTransitionMessage() {
    // Remove any existing message first
    removeRoundTransitionMessage();

    // Determine message based on round number
    let roundTitle, roundSubtitle;
    
    roundTitle = `Round ${currentRound}`;
    if (currentRound === 1) {
        roundSubtitle = "New Adventure Begins!";
    } else if (currentRound % 5 === 0) {
        roundSubtitle = "Win or Win!";
    } else if (currentRound % 3 === 0) {
        roundSubtitle = "Don't Fall Behind! Go Go!";
    } else if (currentRound % 2 === 0) {
        roundSubtitle = "Go Go!!! First to the Finish Wins!";
    } else {
        roundSubtitle = "Finding Your Pace!";
    }

    if (currentRound !== 1){
        roundSubtitle += "<br><br> +1 base step";
    }

    // Create round transition message
    const messageDiv = document.createElement('div');
    messageDiv.id = 'roundTransitionMessage';
    messageDiv.innerHTML = `
        <div class="round-message-container">
            <div class="round-title">${roundTitle}</div>
            <div class="round-subtitle">${roundSubtitle}</div>
            <div class="round-progress">
                <div class="round-progress-bar">
                    <div class="round-progress-fill" id="roundProgressFill"></div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(messageDiv);

    // Start progress bar animation
    startRoundProgressBar();

    // Auto-remove after specified time (with fade out)
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 500);
    }, (ROUND_PHASE_TIME - 0.5) * 1000);
}

function removeRoundTransitionMessage() {
    const existingMessage = document.getElementById('roundTransitionMessage');
    if (existingMessage) {
        document.body.removeChild(existingMessage);
    }
}

function startRoundProgressBar() {
    const progressFill = document.getElementById('roundProgressFill');
    if (!progressFill) return;

    let progress = 0;
    const totalTime = (ROUND_PHASE_TIME - 0.5) * 1000; // Convert to milliseconds
    const updateInterval = 50; // Update every 50ms for smooth animation
    const increment = (updateInterval / totalTime) * 100;

    const progressInterval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
        }
        progressFill.style.width = `${progress}%`;
    }, updateInterval);

    // Clear interval when round phase ends
    setTimeout(() => {
        clearInterval(progressInterval);
    }, totalTime);
}