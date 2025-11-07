import { io } from 'socket.io-client';
import { Player } from './components/Player';
import { physicsWorld } from './utilities/worldRelated';

export class SocketClient {
    constructor(addPlayer, removePlayer, updatePlayerCount) {
        this.addPlayer = addPlayer;
        this.removePlayer = removePlayer;
        this.updatePlayerCount = updatePlayerCount;
        this.players = new Map();

        // Dynamic socket URL for production/development
        const socketUrl = this.getSocketUrl();
        console.log('🎮 Connecting to:', socketUrl);
        
        this.io = io(socketUrl, {
            transports: ['websocket', 'polling'], // ✅ Better compatibility
            timeout: 10000 // ✅ 10 second timeout
        });
        this.handleSocketEvents();
    }

    getSocketUrl() {
        // If we're in development (localhost)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000';
        }
        // If we're on Netlify (production)
        else {
            return 'https://cognira-backend.onrender.com'; // Render backend URL
        }
    }

    handleSocketEvents() {
        this.io.on("connect", () => {
            console.log("✅ Connected to server with ID:", this.io.id);
        });

        this.io.on("disconnect", (reason) => {
            console.log("❌ Disconnected from server:", reason);
        });

        // Handle initial connection with ALL players
        this.io.on("connection", (allPlayers) => {
            console.log("👥 Received all players:", allPlayers);
            for (const playerData of allPlayers) {
                this.addRemotePlayer(playerData);
            }
            // Update player count after adding all initial players
            if (this.updatePlayerCount) {
                this.updatePlayerCount(this.players.size, this.players);
            }
        });

        // Handle new player connections
        this.io.on("player-connected", (playerData) => {
            console.log("🟢 New player connected:", playerData);
            // Don't add ourselves
            if (playerData.id !== this.io.id) {
                this.addRemotePlayer(playerData);
            }
            // Update player count
            if (this.updatePlayerCount) {
                this.updatePlayerCount(this.players.size, this.players);
            }
        });

        // Handle player disconnections
        this.io.on("player-disconnected", (playerData) => {
            console.log("🔴 Player disconnected:", playerData.id);
            this.removeRemotePlayer(playerData.id);
            // Update player count
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

        this.io.on("update-username", (updatedPlayers) => {
            console.log("📝 Username update received:", updatedPlayers);
            for (const playerData of updatedPlayers) {
                const player = this.players.get(playerData.id);
                if (player) {
                    player.setUsername(playerData.username);
                }
            }
            if (this.updatePlayerCount) {
                this.updatePlayerCount(this.players.size, this.players);
            }
        });

        this.io.on("connect_error", (error) => {
            console.error("💥 Connection error:", error);
        });
    }

    addRemotePlayer(playerData) {
        // Skip if player already exists
        if (this.players.has(playerData.id)) {
            return;
        }

        console.log("👤 Creating remote player:", playerData.id);
        const player = new Player(playerData.id, playerData.username, this.players.size, physicsWorld);

        this.addPlayer(player);
        this.players.set(playerData.id, player);
        console.log("✅ Added remote player:", playerData.id, "Total players:", this.players.size);
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
            this.io.emit("update-username", newUsername);
        }
    }

    disconnect() {
        this.io.disconnect();
    }

    get id() {
        return this.io.id;
    }

    // Helper to check connection status
    get isConnected() {
        return this.io.connected;
    }
}