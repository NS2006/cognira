import { io } from 'socket.io-client';
import { Player } from './components/Player';
import { physicsWorld } from './utilities/worldRelated';
import { MAP_SIZE_Y } from './constants.js';

export class SocketClient {
    constructor(username, addPlayer, removePlayer, updatePlayerCount, onMinigameSequenceReceived) {
        this.addPlayer = addPlayer;
        this.removePlayer = removePlayer;
        this.updatePlayerCount = updatePlayerCount;
        this.username = username;
        this.players = new Map();
        this.finishedPlayers = new Map(); // Track finished players
        this.onMinigameSequenceReceived = onMinigameSequenceReceived;

        // Dynamic socket URL for production/development
        const socketUrl = this.getSocketUrl();
        console.log('🎮 Connecting to:', socketUrl, 'with username:', username);

        this.io = io(socketUrl, {
            auth: {
                username: username
            },
            transports: ['websocket', 'polling'],
            timeout: 10000
        });
        this.handleSocketEvents();
    }

    getSocketUrl() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000';
        }
        else {
            return 'https://cognira-backend.up.railway.app';
        }
    }

    handleSocketEvents() {
        this.io.on("connect", () => {
            console.log("✅ Connected to server with ID:", this.io.id);
        });

        this.io.on("disconnect", (reason) => {
            console.log("❌ Disconnected from server:", reason);
        });

        // Handle minigame sequence from server
        this.io.on("minigame-sequence", (sequence) => {
            console.log("🎲 Received minigame sequence from server:", sequence);
            if (this.onMinigameSequenceReceived) {
                this.onMinigameSequenceReceived(sequence);
            }
        });

        // Handle initial connection with ALL players
        this.io.on("connection", (allPlayers) => {
            console.log("👥 Received all players:", allPlayers);
            for (const playerData of allPlayers) {
                this.addRemotePlayer(playerData);
            }
            if (this.updatePlayerCount) {
                this.updatePlayerCount(this.players.size, this.players);
            }
        });

        // Handle new player connections
        this.io.on("player-connected", (playerData) => {
            console.log("🟢 New player connected:", playerData);
            if (playerData.id !== this.io.id) {
                this.addRemotePlayer(playerData);
            }
            if (this.updatePlayerCount) {
                this.updatePlayerCount(this.players.size, this.players);
            }
        });

        // Handle player disconnections
        this.io.on("player-disconnected", (playerData) => {
            console.log("🔴 Player disconnected:", playerData.id);
            this.removeRemotePlayer(playerData.id);
            if (this.updatePlayerCount) {
                this.updatePlayerCount(this.players.size, this.players);
            }
        });

        // Handle position updates from other players
        this.io.on("update-player-position", (playerId, position, rotation) => {
            console.log("🎯 Position update from:", playerId, position);
            const player = this.players.get(playerId);
            if (player) {
                player.move(position, rotation);
            }
        });

        // Handle username updates from server
        this.io.on("update-username", (updatedPlayers) => {
            console.log("📝 Username update received:", updatedPlayers);
            for (const playerData of updatedPlayers) {
                const player = this.players.get(playerData.id);
                if (player) {
                    player.setUsername(playerData.username);
                    console.log(`🔄 Updated username for ${playerData.id}: ${playerData.username}`);
                }
            }
        });

        // Handle player finish events
        this.io.on("player-finished", (finishData) => {
            console.log("📡 Player finished event received:", finishData.username);
            this.handleRemotePlayerFinish(finishData);
            
            // Dispatch custom event for UI to update
            window.dispatchEvent(new CustomEvent('player-finished-ui', { 
                detail: finishData 
            }));
        });

        this.io.on("connect_error", (error) => {
            console.error("💥 Connection error:", error);
        });
    }

    addRemotePlayer(playerData) {
        if (this.players.has(playerData.id)) {
            return;
        }

        console.log("👤 Creating remote player:", playerData.id, "with username:", playerData.username);
        const player = new Player(playerData.id, playerData.username, this.players.size, physicsWorld);

        this.addPlayer(player);
        this.players.set(playerData.id, player);
        console.log("✅ Added remote player:", playerData.username, "Total players:", this.players.size);
    }

    removeRemotePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            this.removePlayer(player);
            this.players.delete(playerId);
            console.log("🗑️ Removed remote player:", playerId);
        }
    }

    // Finish Game Logic Methods
    checkPlayerFinish(player) {
        if (!player || this.finishedPlayers.has(player.playerId)) {
            return false;
        }

        // Check if player reached the end of the map
        if (player.gridPosition.currentY >= MAP_SIZE_Y - 1) {
            console.log(`🎉 ${player.playerUsername} reached the finish!`);
            
            const finishData = {
                playerId: player.playerId,
                username: player.playerUsername,
                finishTime: Date.now(),
                isLocalPlayer: player.isLocalPlayer
            };

            // Add to finished players
            this.finishedPlayers.set(player.playerId, finishData);

            // Broadcast to other players
            this.broadcastPlayerFinish(finishData);

            // Check if game should end
            this.checkGameEndCondition();

            return true;
        }

        return false;
    }

    checkAllPlayersFinish() {
        const players = Array.from(this.players.values());
        
        players.forEach(player => {
            if (!this.finishedPlayers.has(player.playerId) && player.gridPosition.currentY >= MAP_SIZE_Y - 1) {
                this.checkPlayerFinish(player);
            }
        });
    }

    broadcastPlayerFinish(finishData) {
        if (!this.io.connected) return;

        this.io.emit("player-finished", {
            ...finishData,
            isLocalPlayer: false
        });
    }

    handleRemotePlayerFinish(finishData) {
        if (this.finishedPlayers.has(finishData.playerId)) return;

        console.log(`🎉 Remote player ${finishData.username} finished`);
        this.finishedPlayers.set(finishData.playerId, finishData);

        // Check if game should end
        this.checkGameEndCondition();
    }

    checkGameEndCondition() {
        const players = Array.from(this.players.values());
        const unfinishedPlayers = players.filter(player => !this.finishedPlayers.has(player.playerId));

        console.log(`🎯 ${unfinishedPlayers.length} players remaining, ${this.finishedPlayers.size} finished`);

        // Game ends when only one player remains unfinished
        if (unfinishedPlayers.length <= 1 && players.length > 1) {
            console.log("🏁 Game end condition met");
            // Dispatch event for UI to handle
            window.dispatchEvent(new CustomEvent('game-finished'));
            return true;
        }
        
        return false;
    }

    // Getters for game state
    isPlayerFinished(playerId) {
        return this.finishedPlayers.has(playerId);
    }

    isGameFinished() {
        const players = Array.from(this.players.values());
        const unfinishedPlayers = players.filter(player => !this.finishedPlayers.has(player.playerId));
        return unfinishedPlayers.length <= 1 && players.length > 1;
    }

    getPlayerRank(playerId) {
        const finishedPlayersList = Array.from(this.finishedPlayers.values())
            .sort((a, b) => a.finishTime - b.finishTime);
        
        const rank = finishedPlayersList.findIndex(p => p.playerId === playerId) + 1;
        return rank > 0 ? rank : null;
    }

    getFinishedPlayersCount() {
        return this.finishedPlayers.size;
    }

    getTotalPlayersCount() {
        return this.players.size;
    }

    getRankedPlayers() {
        const players = Array.from(this.players.values());
        
        // Get all players and mark finished ones
        const allPlayerData = players.map(player => ({
            ...player,
            isFinished: this.finishedPlayers.has(player.playerId),
            finishTime: this.finishedPlayers.get(player.playerId)?.finishTime || Date.now()
        }));
        
        // Sort by finish time (finished players) then by position (unfinished players)
        const sortedPlayers = allPlayerData.sort((a, b) => {
            if (a.isFinished && b.isFinished) {
                return a.finishTime - b.finishTime;
            }
            if (a.isFinished && !b.isFinished) return -1;
            if (!a.isFinished && b.isFinished) return 1;
            return b.gridPosition.currentY - a.gridPosition.currentY;
        });
        
        // Assign ranks
        return sortedPlayers.map((player, index) => ({
            ...player,
            rank: index + 1
        }));
    }

    update(position, rotation) {
        if (this.io.connected) {
            this.io.emit("update-player-position", position, rotation);
        } else {
            console.warn("⚠️ Cannot update position: Socket not connected");
        }
    }

    updateUsername(newUsername) {
        if (this.io.connected) {
            console.log("📝 Sending username update to server:", newUsername);
            this.io.emit("update-username", newUsername);
        } else {
            console.warn("⚠️ Cannot update username: Socket not connected");
        }
    }

    disconnect() {
        this.io.disconnect();
    }

    get id() {
        return this.io.id;
    }

    get isConnected() {
        return this.io.connected;
    }
}