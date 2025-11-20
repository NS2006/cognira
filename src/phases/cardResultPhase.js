import { clearPhaseTimer, setPhaseTimer, getLocalPlayer } from "../main.js";
import { CARD_RESULT_PHASE_TIME, PHASE_TRANSITION_DELAY } from "../constants.js";
import { startMovementPhase } from "./movePhase.js";

let cardResultPhaseActive = false;
let cardResultPhaseTimer = null;

export function startCardResultPhase(isMinigameWon) {
    if (cardResultPhaseActive) {
        console.log("🎴 Card result phase already active, skipping");
        return;
    }

    console.log(`🎴 Starting card result phase - Minigame ${isMinigameWon ? 'WON' : 'LOST'}`);
    cardResultPhaseActive = true;

    const localPlayer = getLocalPlayer();
    
    if (!localPlayer || !localPlayer.selectedCard) {
        console.log("❌ No local player or selected card found, skipping card result phase");
        endCardResultPhase();
        return;
    }

    // Apply card effect based on minigame result
    const effectDescription = applyCardEffect(localPlayer, isMinigameWon);

    // Clear any existing timers
    clearPhaseTimer();

    // Show simplified card result message
    showCardResultMessage(localPlayer.selectedCard, isMinigameWon, effectDescription);

    // Set timer to automatically move to next phase
    cardResultPhaseTimer = setTimeout(() => {
        console.log("🎴 Card result phase completed");
        endCardResultPhase();
    }, CARD_RESULT_PHASE_TIME * 1000);

    setPhaseTimer(cardResultPhaseTimer);
}

export function endCardResultPhase() {
    if (!cardResultPhaseActive) {
        console.log("🎴 Card result phase not active, skipping end");
        return;
    }

    console.log("🎴 Ending card result phase");
    cardResultPhaseActive = false;

    // Clear timers
    if (cardResultPhaseTimer) {
        clearTimeout(cardResultPhaseTimer);
        cardResultPhaseTimer = null;
    }
    clearPhaseTimer();

    // Remove card result message
    removeCardResultMessage();

    // Add delay before next phase to ensure clean transition
    setTimeout(() => {
        console.log("🎴 Card result phase completed, moving to movement phase");
        startMovementPhase();
    }, PHASE_TRANSITION_DELAY * 1000);
}

export function isCardResultPhaseActive() {
    return cardResultPhaseActive;
}

function applyCardEffect(localPlayer, isMinigameWon) {
    if (!localPlayer.selectedCard) {
        console.log("❌ No card selected to apply effect");
        return "No effect";
    }

    console.log(`🎴 Applying card effect: ${localPlayer.selectedCard.id}, Win: ${isMinigameWon}`);
    
    const card = localPlayer.selectedCard;
    let effectDescription = "No effect";
    
    if (isMinigameWon) {
        // Apply positive effect
        if (card.positive && card.positive.type !== 'none') {
            effectDescription = getEffectDescription(card.positive, true);
            console.log(`✅ Applied positive effect: ${effectDescription}`);
        }
    } else {
        // Apply negative effect
        if (card.negative && card.negative.type !== 'none') {
            effectDescription = getEffectDescription(card.negative, false);
            console.log(`❌ Applied negative effect: ${effectDescription}`);
        }
    }
    
    return effectDescription;
}

function getEffectDescription(effect, isPositive) {
    const prefix = isPositive ? "+" : "";
    
    switch(effect.type) {
        case 'value':
            return `${prefix}${effect.amount} steps`;
        case 'multiplier':
            return `${effect.amount}x multiplier`;
        case 'immune':
            return "Immunity to negative effects";
        case 'move':
            return "Extra movement ability";
        case 'steal':
            return `Steal ${effect.amount} step${effect.amount > 1 ? 's' : ''}`;
        case 'stop':
            return "Stop one player";
        case 'stop_all':
            return "Stop all players";
        case 'none':
            return "No effect";
        default:
            return "Unknown effect";
    }
}

function showCardResultMessage(card, isMinigameWon, effectDescription) {
    // Remove any existing message first
    removeCardResultMessage();

    const resultType = isMinigameWon ? 'win' : 'lose';
    const title = isMinigameWon ? 'Victory! 🎉' : 'Defeat 💫';
    const resultText = isMinigameWon ? 'You gained:' : 'You received:';

    // Create simplified card result message with specific class names
    const messageDiv = document.createElement('div');
    messageDiv.id = 'cardResultMessage';
    messageDiv.className = `card-result-${resultType}`;
    messageDiv.innerHTML = `
        <div class="card-result-popup-container">
            <div class="card-result-popup-title">${title}</div>
            
            <div class="card-result-image-container">
                <img 
                    src="./assets/model/Cards/${card.file || card.id}.png" 
                    alt="${card.id}" 
                    class="card-result-popup-image"
                >
            </div>
            
            <div class="card-result-effect-info">
                <div class="card-result-effect-text">${resultText}</div>
                <div class="card-result-effect-description ${resultType}">${effectDescription}</div>
            </div>

            <div class="card-result-progress-container">
                <div class="card-result-progress-text">Next phase in: <span id="cardResultTimer">${CARD_RESULT_PHASE_TIME}</span>s</div>
            </div>
        </div>
    `;

    document.body.appendChild(messageDiv);

    // Start timer
    startCardResultTimer();

    // Auto-remove after specified time
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 500);
    }, (CARD_RESULT_PHASE_TIME - 0.5) * 1000);
}

function removeCardResultMessage() {
    const existingMessage = document.getElementById('cardResultMessage');
    if (existingMessage) {
        document.body.removeChild(existingMessage);
    }
}

function startCardResultTimer() {
    const timerElement = document.getElementById('cardResultTimer');
    if (!timerElement) return;

    let timeLeft = CARD_RESULT_PHASE_TIME;
    const updateInterval = 1000; // Update every second

    const timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            timeLeft = 0;
            clearInterval(timerInterval);
        }
        
        timerElement.textContent = timeLeft;
    }, updateInterval);

    // Clear interval when phase ends
    setTimeout(() => {
        clearInterval(timerInterval);
    }, CARD_RESULT_PHASE_TIME * 1000);
}