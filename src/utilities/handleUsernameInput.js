import { initializeSocketConnection } from "../main.js";

// DOM elements
let usernamePopup, usernameInput, submitUsernameBtn, cancelUsernameBtn, charCount;
let playerUsername = '';

export function initializeUsernameHandlers() {
    // Get DOM elements
    usernamePopup = document.getElementById("usernamePopup");
    usernameInput = document.getElementById("usernameInput");
    submitUsernameBtn = document.getElementById("submitUsername");
    cancelUsernameBtn = document.getElementById("cancelUsername");
    charCount = document.getElementById("charCount");

    // Validate that all elements exist
    if (!usernamePopup || !usernameInput || !submitUsernameBtn || !cancelUsernameBtn || !charCount) {
        console.error("❌ Username popup elements not found in DOM");
        return;
    }

    // Set up event listeners
    setupEventListeners();
    console.log("✅ Username input handlers initialized");
}

function setupEventListeners() {
    // Cancel button in username popup
    cancelUsernameBtn.addEventListener("click", hideUsernamePopup);

    // Submit username button
    submitUsernameBtn.addEventListener("click", handleUsernameSubmit);

    // Enter key in username input
    usernameInput.addEventListener("keypress", (e) => {
        if (e.key === 'Enter' && !submitUsernameBtn.disabled) {
            handleUsernameSubmit();
        }
    });

    // Real-time input validation
    usernameInput.addEventListener("input", validateUsernameInput);

    // Close popup when clicking outside
    usernamePopup.addEventListener("click", (e) => {
        if (e.target === usernamePopup) {
            hideUsernamePopup();
        }
    });

    // Escape key to close popup
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && usernamePopup.style.display === 'flex') {
            hideUsernamePopup();
        }
    });
}

export function showUsernamePopup() {
    if (!usernamePopup) {
        console.error("❌ Username popup element not found");
        return;
    }

    usernamePopup.style.display = 'flex';
    usernameInput.value = '';
    usernameInput.focus();
    validateUsernameInput();
    
    console.log("🎮 Username popup shown");
}

export function hideUsernamePopup() {
    if (!usernamePopup) return;

    usernamePopup.style.display = 'none';
    usernameInput.classList.remove('valid', 'invalid');
    
    console.log("🎮 Username popup hidden");
}

function validateUsernameInput() {
    if (!usernameInput || !submitUsernameBtn || !charCount) return;

    const username = usernameInput.value.trim();
    const charCountValue = username.length;
    
    // Update character count
    charCount.textContent = charCountValue;
    
    // Validate username (1-15 characters, no empty or only spaces)
    const isValid = username.length >= 1 && 
                   username.length <= 15 && 
                   username.replace(/\s/g, '').length > 0;
    
    // Update input styling
    usernameInput.classList.remove('valid', 'invalid');
    if (username.length > 0) {
        usernameInput.classList.add(isValid ? 'valid' : 'invalid');
    }
    
    // Update submit button state
    submitUsernameBtn.disabled = !isValid;
    
    return isValid;
}

function handleUsernameSubmit() {
    if (!validateUsernameInput()) {
        // Shake animation for invalid input
        usernameInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            usernameInput.style.animation = '';
        }, 500);
        return;
    }
    
    const username = usernameInput.value.trim();
    
    // Store the player's username
    playerUsername = username;
    console.log(`🎮 Player username set to: "${playerUsername}"`);
    
    // Hide the popup
    hideUsernamePopup();
    
    // Initialize socket connection with username
    initializeSocketConnection(playerUsername);
}

export function getPlayerUsername() {
    return playerUsername;
}

export function setPlayerUsername(username) {
    playerUsername = username;
}

// Add shake animation for invalid input
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);