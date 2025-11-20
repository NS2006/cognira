import { getSocketClient, getLocalPlayer, clearPhaseTimer } from "../main.js";

let personalRankingDisplayed = false;

export function initializeFinishGame() {
    personalRankingDisplayed = false;
    setupEventListeners();
    console.log("🏁 Finish game UI initialized");
}

function setupEventListeners() {
    // Listen for game finished event from SocketClient
    window.addEventListener('game-finished', () => {
        console.log("🎭 Game finished event received - showing final podium");
        showFinalPodium();
        clearPhaseTimer();
    });

    // Listen for player finished events from SocketClient (custom event)
    window.addEventListener('player-finished-ui', (event) => {
        console.log("🎨 UI: Player finished event received:", event.detail.username);
        // Update the personal ranking display if it's shown
        if (personalRankingDisplayed) {
            updatePersonalRankingDisplay();
        }
    });

    console.log("✅ Event listeners setup for finish game UI");
}

export function checkPlayerFinish(player) {
    const socketClient = getSocketClient();
    const finished = socketClient.checkPlayerFinish(player);
    
    // If this player finished, show their personal ranking
    if (finished && player.isLocalPlayer) {
        console.log("🎯 Local player finished - showing personal ranking");
        showPersonalRanking();
        clearPhaseTimer();
    }
    
    return finished;
}

export function checkAllPlayersFinish() {
    const socketClient = getSocketClient();
    socketClient.checkAllPlayersFinish();
}

export function shouldContinueGame() {
    const localPlayer = getLocalPlayer();
    const socketClient = getSocketClient();
    
    return localPlayer && 
           !socketClient.isPlayerFinished(localPlayer.playerId) && 
           !socketClient.isGameFinished();
}

export function isPlayerFinished(playerId) {
    const socketClient = getSocketClient();
    return socketClient.isPlayerFinished(playerId);
}

export function isGameFinished() {
    const socketClient = getSocketClient();
    return socketClient.isGameFinished();
}

export function getPlayerRank(playerId) {
    const socketClient = getSocketClient();
    return socketClient.getPlayerRank(playerId);
}

// UI Functions
export function showPersonalRanking() {
    const socketClient = getSocketClient();
    const localPlayer = getLocalPlayer();
    
    if (!localPlayer) return;
    
    // Check if game is already finished - if so, show final podium instead
    if (socketClient.isGameFinished()) {
        console.log("🎯 Game is already finished - showing final podium instead");
        showFinalPodium();
        return;
    }
    
    removeAllGameUI();
    personalRankingDisplayed = true;
    
    const finishedCount = socketClient.getFinishedPlayersCount();
    const totalPlayers = socketClient.getTotalPlayersCount();
    const currentRank = socketClient.getPlayerRank(localPlayer.playerId);

    console.log(`🎯 Showing personal ranking: Rank ${currentRank}, ${finishedCount}/${totalPlayers} finished`);

    const personalRankDiv = document.createElement('div');
    personalRankDiv.id = 'personalRanking';
    personalRankDiv.innerHTML = createPersonalRankingHTML(currentRank, finishedCount, totalPlayers);
    document.body.appendChild(personalRankDiv);
}

export function updatePersonalRankingDisplay() {
    const socketClient = getSocketClient();
    const finishedCount = socketClient.getFinishedPlayersCount();
    const totalPlayers = socketClient.getTotalPlayersCount();
    
    console.log(`🔄 Updating personal ranking: ${finishedCount}/${totalPlayers} finished`);
    
    const standingsElement = document.querySelector('#personalRanking .current-standings');
    if (standingsElement) {
        standingsElement.innerHTML = createStandingsHTML(finishedCount, totalPlayers);
    }
    
    // Check if game ended while we were on personal ranking
    if (socketClient.isGameFinished()) {
        console.log("🎯 Game ended while on personal ranking - switching to final podium");
        showFinalPodium();
    }
}

export function showFinalPodium() {
    const socketClient = getSocketClient();
    const localPlayer = getLocalPlayer();
    
    removeAllGameUI();
    personalRankingDisplayed = false;
    
    const rankedPlayers = socketClient.getRankedPlayers();
    const localPlayerRank = localPlayer ? 
        rankedPlayers.find(p => p.playerId === localPlayer.playerId)?.rank : null;

    console.log("🎭 Showing final podium with ranked players:", rankedPlayers.map(p => `${p.username} (${p.rank})`));

    const finalPodiumDiv = document.createElement('div');
    finalPodiumDiv.id = 'finalPodium';
    finalPodiumDiv.innerHTML = createFinalPodiumHTML(rankedPlayers, localPlayerRank);
    document.body.appendChild(finalPodiumDiv);

    document.getElementById('returnToLobby').addEventListener('click', () => {
        window.location.reload();
    });
}

// HTML Template Functions
function createPersonalRankingHTML(rank, finishedCount, totalPlayers) {
    return `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
            color: white;
        ">
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 50px;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                animation: popIn 0.5s ease-out;
            ">
                <div style="font-size: 5em; margin-bottom: 20px;">${getRankEmoji(rank)}</div>
                <h1 style="font-size: 2.5em; margin-bottom: 10px; color: gold;">FINISHED!</h1>
                <div style="font-size: 1.2em; margin-bottom: 30px; opacity: 0.9;">
                    You finished in
                </div>
                <div style="
                    font-size: 4em;
                    font-weight: bold;
                    color: gold;
                    margin: 20px 0;
                    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                ">
                    ${getRankSuffix(rank)} Place
                </div>
                <div class="current-standings" style="
                    background: rgba(255, 255, 255, 0.1);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 30px 0;
                    border-left: 4px solid gold;
                ">
                    ${createStandingsHTML(finishedCount, totalPlayers)}
                </div>
                <div style="
                    padding: 15px;
                    background: rgba(255, 215, 0, 0.2);
                    border-radius: 10px;
                    margin-top: 20px;
                    font-size: 0.9em;
                    border: 1px solid gold;
                ">
                    🎉 Congratulations! You've completed the race!
                </div>
            </div>
        </div>
        <style>
            @keyframes popIn {
                0% { transform: scale(0.8); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
        </style>
    `;
}

function createStandingsHTML(finishedCount, totalPlayers) {
    return `
        <div style="font-size: 1.1em; margin-bottom: 10px;">🏆 Current Standings</div>
        <div style="font-size: 0.9em; opacity: 0.8;">
            ${finishedCount} of ${totalPlayers} players finished
        </div>
        <div style="margin-top: 10px; font-size: 0.8em; opacity: 0.7;">
            Waiting for ${totalPlayers - finishedCount} players...
        </div>
    `;
}

function createFinalPodiumHTML(rankedPlayers, localPlayerRank) {
    return `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
            color: white;
        ">
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px;
                border-radius: 20px;
                max-width: 800px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                text-align: center;
                animation: popIn 0.5s ease-out;
            ">
                <h1 style="font-size: 3em; margin-bottom: 10px; color: gold;">🏆 RACE COMPLETED 🏆</h1>
                <div style="margin-bottom: 30px; opacity: 0.9;">All players have finished!</div>
                
                <!-- Personal Result -->
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    padding: 25px;
                    border-radius: 15px;
                    margin: 20px 0;
                    border: 2px solid gold;
                ">
                    <div style="font-size: 1.5em; margin-bottom: 10px; color: gold;">Your Final Result</div>
                    <div style="font-size: 3em; margin: 10px 0;">${getRankEmoji(localPlayerRank)}</div>
                    <div style="font-size: 2em; font-weight: bold; color: gold;">
                        ${getRankSuffix(localPlayerRank)} Place
                    </div>
                </div>
                
                <!-- Final Rankings -->
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 20px;
                    margin-top: 20px;
                ">
                    <h3 style="margin-bottom: 20px; color: gold;">Final Rankings</h3>
                    ${rankedPlayers.map(player => `
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 12px 15px;
                            margin: 8px 0;
                            background: ${player.isLocalPlayer ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
                            border-radius: 8px;
                            ${player.isLocalPlayer ? 'border: 2px solid gold;' : ''}
                        ">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <span style="font-weight: bold; width: 30px; text-align: center; font-size: 1.1em;">
                                    ${player.rank}
                                </span>
                                <span style="font-size: 1.1em;">
                                    ${player.playerUsername} ${player.isLocalPlayer ? '<strong>(You)</strong>' : ''}
                                </span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 1.2em;">${getRankEmoji(player.rank)}</span>
                                <span style="opacity: 0.8;">${getRankSuffix(player.rank)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <button id="returnToLobby" style="
                    margin-top: 30px;
                    padding: 15px 30px;
                    font-size: 1.2em;
                    background: gold;
                    color: black;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    Return to Lobby
                </button>
            </div>
        </div>
        <style>
            @keyframes popIn {
                0% { transform: scale(0.8); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
        </style>
    `;
}

function removeAllGameUI() {
    const elementsToRemove = [
        'movementPhaseMessage',
        'leaderboardContainer',
        'playerFinishMessage',
        'personalRanking',
        'finalPodium'
    ];
    
    elementsToRemove.forEach(id => {
        const element = document.getElementById(id);
        if (element && document.body.contains(element)) {
            document.body.removeChild(element);
        }
    });
    
    const gameInfo = document.getElementById('gameInfo');
    if (gameInfo) {
        gameInfo.style.display = 'none';
    }
}

function getRankSuffix(rank) {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
}

function getRankEmoji(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '🎯';
}