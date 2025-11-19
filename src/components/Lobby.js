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
    }

    show(players = null) {
        this.localPlayer = getLocalPlayer();

        this.lobbyContainer.style.display = 'block';
        
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