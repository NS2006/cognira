import { io } from 'socket.io-client';
import { Player } from './components/Player';

export class SocketClient {
    constructor(addPlayer, removePlayer, updatePlayerCount) {
        this.addPlayer = addPlayer;
        this.removePlayer = removePlayer;
        this.updatePlayerCount = updatePlayerCount;
        this.players = new Map();

        this.io = io("http://localhost:3000");
        this.handleSocketEvents();
    }

    update(position, rotation) {
        this.io.emit("update-player-position", position, rotation);
    }

    handleSocketEvents() {
        this.io.on("connect", () => {
            console.log("Connected to server with ID:", this.io.id);
        });

        // Handle initial connection with ALL players
        this.io.on("connection", (allPlayers) => {
            console.log("Received all players:", allPlayers);
            for (const playerData of allPlayers) {
                this.addRemotePlayer(playerData);
            }
            // Update player count after adding all initial players
            if (this.updatePlayerCount) {
                this.updatePlayerCount(this.players.size);
            }
        });

        // Handle new player connections
        this.io.on("player-connected", (playerData) => {
            console.log("New player connected:", playerData);
            // Don't add ourselves
            if (playerData.id !== this.io.id) {
                this.addRemotePlayer(playerData);
            }
            // Update player count
            if (this.updatePlayerCount) {
                this.updatePlayerCount(this.players.size);
            }
        });

        // Handle player disconnections
        this.io.on("player-disconnected", (playerData) => {
            console.log("Player disconnected:", playerData.id);
            this.removeRemotePlayer(playerData.id);
            // Update player count
            if (this.updatePlayerCount) {
                this.updatePlayerCount(this.players.size);
            }
        });

        // Handle position updates from other players
        this.io.on("update-player-position", (playerId, position, rotation) => {
            console.log("Position update from:", playerId, position);
            const player = this.players.get(playerId);
            if (player) {
                player.move(position, rotation);
            }
        });

        this.io.on("connect_error", (error) => {
            console.error("Connection error:", error);
        });

        // And add this event listener in handleSocketEvents method
        this.io.on("card-selected", (playerId, cardType) => {
            console.log("Player selected card:", playerId, cardType);
            // Handle other players' card selections if needed
        });

        this.io.on("card-time-expired", (playerId) => {
            console.log("Player failed to select card:", playerId);
            // Handle time expiration for other players
        });

        // And add this event listener in handleSocketEvents
        this.io.on("question-started", (questionData) => {
            console.log("Question started:", questionData);
            // Handle question start from server if needed
        });

        this.io.on("answer-selected", (playerId, questionId, answer, isCorrect) => {
            console.log("Player answered:", playerId, questionId, answer, isCorrect);
            // Handle other players' answers if needed
        });
    }

    addRemotePlayer(playerData) {
        // Skip if player already exists
        if (this.players.has(playerData.id)) {
            return;
        }

        console.log("Creating remote player:", playerData.id);
        const player = new Player(playerData.id, this.players.size);

        // Set initial position if available
        // player.move(playerData.position, playerData.rotation);

        this.addPlayer(player);
        this.players.set(playerData.id, player);
        console.log("Added remote player:", playerData.id, "Total players:", this.players.size);
    }

    removeRemotePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            this.removePlayer(player);
            this.players.delete(playerId);
            console.log("Removed remote player:", playerId);
        }
    }

    // Add this method to your SocketClient class
    selectCard(cardType) {
        this.io.emit("select-card", cardType);
    }

    selectAnswer(questionId, answer) {
        this.io.emit("select-answer", questionId, answer);
    }


    disconnect() {
        this.io.disconnect();
    }

    get id() {
        return this.io.id;
    }
}