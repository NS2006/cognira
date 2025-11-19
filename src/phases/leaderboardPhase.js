import { clearPhaseTimer, setPhaseTimer, getSocketClient, currentRound } from "../main.js";
import { startRoundPhase } from "./roundPhase.js";
import { LEADERBOARD_PHASE_TIME, PHASE_TRANSITION_DELAY } from "../constants.js";

let leaderboardPhaseActive = false;
let leaderboardPhaseTimer = null;
let previousRankings = new Map(); 

export function startLeaderboardPhase() {
    if (leaderboardPhaseActive) {
        console.log("🏆 Leaderboard phase already active, skipping");
        return;
    }

    console.log("🏆 Starting leaderboard phase");
    leaderboardPhaseActive = true;

    // Clear any existing timers
    clearPhaseTimer();

    // Calculate current rankings
    const currentRankings = calculateRankings();
    
    // Show leaderboard
    showLeaderboard(currentRankings);

    // Set timer to automatically move to next round
    leaderboardPhaseTimer = setTimeout(() => {
        console.log("🏆 Leaderboard phase completed");
        endLeaderboardPhase();
    }, LEADERBOARD_PHASE_TIME * 1000);

    setPhaseTimer(leaderboardPhaseTimer);
}

export function endLeaderboardPhase() {
    if (!leaderboardPhaseActive) {
        console.log("🏆 Leaderboard phase not active, skipping end");
        return;
    }

    console.log("🏆 Ending leaderboard phase");
    leaderboardPhaseActive = false;

    // Clear timers
    if (leaderboardPhaseTimer) {
        clearTimeout(leaderboardPhaseTimer);
        leaderboardPhaseTimer = null;
    }
    clearPhaseTimer();

    // Remove leaderboard
    removeLeaderboard();

    // Store current rankings for next comparison
    storeCurrentRankings();

    // Add delay before next phase to ensure clean transition
    setTimeout(() => {
        // Move to next round phase
        console.log("🏆 Leaderboard phase completed, moving to next round");
        startRoundPhase();
    }, PHASE_TRANSITION_DELAY * 1000);
}

export function isLeaderboardPhaseActive() {
    return leaderboardPhaseActive;
}

function calculateRankings() {
    const players = Array.from(getSocketClient().players.values());

    // Sort players by currentY (descending) and then by username for tie-breaking
    const sortedPlayers = players.sort((a, b) => {
        // Primary sort: Y position (higher = better)
        if (b.gridPosition.currentY !== a.gridPosition.currentY) {
            return b.gridPosition.currentY - a.gridPosition.currentY;
        }
        
        // Secondary sort: Username (alphabetical order)
        return a.playerUsername.localeCompare(b.playerUsername);
    });

    // Simplified ranking assignment
    const rankings = [];
    let currentRank = 1;
    let previousY = null;

    sortedPlayers.forEach((player, index) => {
        // First player always gets rank 1
        if (index === 0) {
            rankings.push({
                playerId: player.playerId,
                username: player.playerUsername,
                position: player.gridPosition,
                rank: currentRank,
                isLocalPlayer: player.isLocalPlayer
            });
            previousY = player.gridPosition.currentY;
            return;
        }

        // Check if current player has same Y as previous player
        if (player.gridPosition.currentY === previousY) {
            // Same Y = same rank as previous player
            rankings.push({
                playerId: player.playerId,
                username: player.playerUsername,
                position: player.gridPosition,
                rank: currentRank, // Same rank as previous
                isLocalPlayer: player.isLocalPlayer
            });
        } else {
            // Different Y = increment rank
            currentRank = index + 1; // Or currentRank++ if you prefer consecutive numbers
            rankings.push({
                playerId: player.playerId,
                username: player.playerUsername,
                position: player.gridPosition,
                rank: currentRank,
                isLocalPlayer: player.isLocalPlayer
            });
            previousY = player.gridPosition.currentY;
        }
    });

    console.log("🏆 Final rankings:", rankings.map(r => `${r.username} (Y:${r.position.currentY}) -> Rank ${r.rank}`));
    return rankings;
}

function showLeaderboard(currentRankings) {
    // Remove any existing leaderboard first
    removeLeaderboard();

    // Create leaderboard container
    const leaderboardDiv = document.createElement('div');
    leaderboardDiv.id = 'leaderboardContainer';
    leaderboardDiv.innerHTML = `
        <div class="leaderboard-overlay">
            <div class="leaderboard-content">
                <div class="leaderboard-header">
                    <h1>Round ${currentRound} Results</h1>
                    <div class="leaderboard-subtitle">Race to the Finish!</div>
                </div>
                <div class="leaderboard-list" id="leaderboardList">
                    <!-- Rankings will be populated here -->
                </div>
                <div class="leaderboard-footer">
                    <div class="leaderboard-timer">
                        <div class="timer-bar">
                            <div class="timer-progress" id="leaderboardProgress"></div>
                        </div>
                        <div class="timer-text">Next round in: <span id="leaderboardTimer">${LEADERBOARD_PHASE_TIME}</span>s</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(leaderboardDiv);

    // Populate leaderboard
    populateLeaderboardList(currentRankings);

    // Start progress bar and timer
    startLeaderboardTimer();

    // Auto-remove after specified time
    setTimeout(() => {
        leaderboardDiv.style.opacity = '0';
        leaderboardDiv.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
            if (document.body.contains(leaderboardDiv)) {
                document.body.removeChild(leaderboardDiv);
            }
        }, 500);
    }, (LEADERBOARD_PHASE_TIME - 0.5) * 1000);
}

function populateLeaderboardList(currentRankings) {
    const leaderboardList = document.getElementById('leaderboardList');
    if (!leaderboardList) return;

    leaderboardList.innerHTML = '';

    currentRankings.forEach((player, index) => {
        const previousRank = getPreviousRank(player.playerId);
        // Only show change if there was a previous rank AND it's different
        const hasChanged = previousRank !== null && previousRank !== player.rank;
        const rankChange = hasChanged ? previousRank - player.rank : 0; // Positive = improved, Negative = dropped

        const playerElement = document.createElement('div');
        playerElement.className = `leaderboard-item ${player.isLocalPlayer ? 'local-player' : ''} ${hasChanged ? 'ranking-changed' : ''}`;
        playerElement.innerHTML = `
            <div class="rank-section">
                <div class="rank-number">${player.rank}</div>
                ${hasChanged ? `
                    <div class="rank-change ${rankChange > 0 ? 'improved' : 'dropped'}">
                        ${rankChange > 0 ? '↑' : '↓'} ${Math.abs(rankChange)}
                    </div>
                ` : ''}
            </div>
            <div class="player-info">
                <div class="player-name">${player.username} ${player.isLocalPlayer ? ' (You)' : ''}</div>
            </div>
            <div class="player-medal">
                ${player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : ''}
            </div>
        `;

        // Add animation delay for staggered entrance
        playerElement.style.animationDelay = `${index * 0.1}s`;

        leaderboardList.appendChild(playerElement);
    });
}

function getPreviousRank(playerId) {
    return previousRankings.get(playerId) || null;
}

function storeCurrentRankings() {
    const currentRankings = calculateRankings();
    previousRankings.clear();
    
    currentRankings.forEach(player => {
        previousRankings.set(player.playerId, player.rank);
    });
    
    console.log("🏆 Stored previous rankings:", Array.from(previousRankings.entries()));
}

function removeLeaderboard() {
    const existingLeaderboard = document.getElementById('leaderboardContainer');
    if (existingLeaderboard) {
        document.body.removeChild(existingLeaderboard);
    }
}

function startLeaderboardTimer() {
    const timerElement = document.getElementById('leaderboardTimer');
    const progressElement = document.getElementById('leaderboardProgress');
    if (!timerElement || !progressElement) return;

    let timeLeft = LEADERBOARD_PHASE_TIME;
    const totalTime = LEADERBOARD_PHASE_TIME * 1000;
    const updateInterval = 100; // Update every 100ms

    const timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        if (timeLeft <= 0) {
            timeLeft = 0;
            clearInterval(timerInterval);
        }
        
        timerElement.textContent = timeLeft.toFixed(1);
        progressElement.style.width = `${((LEADERBOARD_PHASE_TIME - timeLeft) / LEADERBOARD_PHASE_TIME) * 100}%`;
    }, updateInterval);

    // Clear interval when leaderboard phase ends
    setTimeout(() => {
        clearInterval(timerInterval);
    }, totalTime);
}

// Initialize previous rankings on first load
export function initializeLeaderboard() {
    previousRankings = new Map();
    console.log("🏆 Leaderboard system initialized");
}