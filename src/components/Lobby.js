import { getLocalPlayer } from "../main";

// Lobby.js
export class Lobby {
    constructor(socketClient) {
        this.socketClient = socketClient;
        this.players = new Map();
        this.localPlayer = null;
        
        this.lobbyContainer = document.getElementById('lobbyContainer');
        this.playersList = document.getElementById('playersList');
        this.lobbyPlayerCount = document.getElementById('lobbyPlayerCount');
        this.usernameInput = document.getElementById('usernameInput');
        this.updateUsernameButton = document.getElementById('updateUsernameButton');

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.updateUsernameButton.addEventListener('click', () => this.updateUsername());
        this.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.updateUsername();
        });
    }

    show(players = null) {
        this.localPlayer = getLocalPlayer();

        this.lobbyContainer.style.display = 'block';
        this.usernameInput.value = this.localPlayer.username;
        
        if (players) {
            this.updatePlayers(players);
        }
    }

    hide() {
        this.lobbyContainer.style.display = 'none';
    }

    updatePlayers(players) {
        this.players.clear();
        
        // Add all players from the provided list
        players.forEach(playerData => {
            this.players.set(playerData.id, {
                id: playerData.id,
                username: playerData.username
            });
        });
        
        this.updatePlayersList();
    }

    updatePlayersList() {
        this.playersList.innerHTML = '';
        
        this.players.forEach((player, playerId) => {
            const playerCard = this.createPlayerCard(player, playerId);
            this.playersList.appendChild(playerCard);
        });

        const totalPlayers = this.players.size;
        this.lobbyPlayerCount.textContent = `Players: ${totalPlayers}/4`;
    }

    createPlayerCard(player, playerId) {
        const card = document.createElement('div');
        card.className = `player-card ${playerId === this.localPlayer.id ? 'local-player' : ''}`;

        card.innerHTML = `
            <div class="player-avatar">
                <div class="avatar-icon">🐔</div>
            </div>
            <div class="player-info">
                <div class="player-name">${player.username || 'Player'}</div>
                <div class="player-status">
                    ${playerId === this.localPlayer.id ? 'You' : 'Connected'}
                </div>
            </div>
        `;

        return card;
    }

    updateUsername() {
        const newUsername = this.usernameInput.value.trim();
        if (newUsername && newUsername !== this.localPlayer.username) {
            this.localPlayer.setUsername(newUsername);
            
            // Update local display
            if (this.players.has(this.localPlayer.id)) {
                this.players.get(this.localPlayer.id).username = newUsername;
                this.updatePlayersList();
            }

            // Send to server via socket
            console.log("uawiuq1908291")
            if (this.socketClient && this.socketClient.updateUsername) {
                console.log("asdhjkasdl")
                this.socketClient.updateUsername(newUsername);
            }
        }
    }

    setLocalPlayerId(playerId) {
        this.localPlayerId = playerId;
        
        if (this.players.has(playerId)) {
            this.players.get(playerId).username = this.localUsername;
            this.updatePlayersList();
        }
    }

    // Cleanup method
    destroy() {
        this.hide();
        this.players.clear();
    }
}