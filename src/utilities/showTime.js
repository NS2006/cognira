import { CARD_PHASE_TIME, MOVEMENT_PHASE_TIME, QUESTION_PHASE_TIME, SPATIAL_QUESTION_TIME } from '../constants.js';

let timeDisplay = null;
let phaseDisplay = null;
let countdownInterval = null;
let currentTimeLeft = 0;
let currentPhase = '';

export function initTimeDisplay() {
    // Create the display container if it doesn't exist
    if (!document.getElementById('phaseTimeDisplay')) {
        createTimeDisplay();
    } else {
        timeDisplay = document.getElementById('timeLeft');
        phaseDisplay = document.getElementById('currentPhase');
    }
}

function createTimeDisplay() {
    const container = document.createElement('div');
    container.id = 'phaseTimeDisplay';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        font-size: 16px;
        z-index: 9999;
        min-width: 200px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    `;

    container.innerHTML = `
        <div id="currentPhase" style="font-weight: bold; margin-bottom: 5px; font-size: 18px;">Starting...</div>
        <div id="timeLeft" style="font-size: 14px; opacity: 0.9;">Time: --</div>
    `;

    document.body.appendChild(container);
    
    timeDisplay = document.getElementById('timeLeft');
    phaseDisplay = document.getElementById('currentPhase');
}

export function showPhaseTime(phaseName, timeInSeconds) {
    // Initialize display if not already done
    initTimeDisplay();
    
    // Clear any existing countdown
    clearCountdown();
    
    currentPhase = phaseName;
    currentTimeLeft = timeInSeconds;
    
    // Update displays
    updatePhaseDisplay(phaseName);
    updateTimeDisplay(currentTimeLeft);
    
    // Show the display
    const container = document.getElementById('phaseTimeDisplay');
    if (container) {
        container.style.display = 'block';
    }
    
    // Start countdown
    startCountdown();
}

export function updatePhaseDisplay(phaseName) {
    if (phaseDisplay) {
        // Add emojis based on phase for better visual recognition
        const phaseEmojis = {
            'card': '🃏',
            'movement': '🚶',
            'question': '❓',
            'tetris': '🎮',
            'minigame': '🎯'
        };
        
        const emoji = phaseEmojis[phaseName.toLowerCase()] || '⏱️';
        phaseDisplay.textContent = `${emoji} ${phaseName.charAt(0).toUpperCase() + phaseName.slice(1)} Phase`;
    }
}

export function updateTimeDisplay(seconds) {
    if (timeDisplay) {
        // Color coding based on time remaining
        let color = '#00ff00'; // Green for plenty of time
        if (seconds <= 10) color = '#ff0000'; // Red for critical time
        else if (seconds <= 20) color = '#ffff00'; // Yellow for warning
        
        timeDisplay.innerHTML = `Time: <span style="color: ${color}; font-weight: bold;">${seconds}s</span>`;
    }
}

function startCountdown() {
    countdownInterval = setInterval(() => {
        currentTimeLeft--;
        
        if (currentTimeLeft <= 0) {
            clearCountdown();
            updateTimeDisplay(0);
            // Optional: Add a visual effect when time runs out
            timeUpEffect();
        } else {
            updateTimeDisplay(currentTimeLeft);
        }
    }, 1000);
}

function timeUpEffect() {
    if (timeDisplay) {
        // Add a pulsing effect when time runs out
        timeDisplay.style.animation = 'pulse 0.5s ease-in-out 3';
        setTimeout(() => {
            timeDisplay.style.animation = '';
        }, 1500);
    }
}

export function clearCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

export function hideTimeDisplay() {
    const container = document.getElementById('phaseTimeDisplay');
    if (container) {
        container.style.display = 'none';
    }
    clearCountdown();
}

export function getCurrentPhase() {
    return currentPhase;
}

export function getTimeLeft() {
    return currentTimeLeft;
}

// Predefined phase times for convenience
export const PhaseTimes = {
    CARD: CARD_PHASE_TIME,
    MOVEMENT: MOVEMENT_PHASE_TIME,
    QUESTION: QUESTION_PHASE_TIME,
    TETRIS: SPATIAL_QUESTION_TIME
};

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
`;
document.head.appendChild(style);