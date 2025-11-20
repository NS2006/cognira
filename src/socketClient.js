import { io } from 'socket.io-client';
import { Player } from './components/Player';
import { physicsWorld } from './utilities/worldRelated';

export class SocketClient {
    constructor(username, addPlayer, removePlayer, updatePlayerCount, onMinigameSequenceReceived) {
        this.addPlayer = addPlayer;
        this.removePlayer = removePlayer;
        this.updatePlayerCount = updatePlayerCount;
        this.username = username;
        this.players = new Map();
        this.onMinigameSequenceReceived = onMinigameSequenceReceived; // Callback for minigame sequence

        // Dynamic socket URL for production/development
        const socketUrl = this.getSocketUrl();
        console.log('🎮 Connecting to:', socketUrl, 'with username:', username);

        // Pass username in auth object
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