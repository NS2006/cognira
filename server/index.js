import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = 3000;
const socketio = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const players = new Map();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

server.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));

socketio.on("connection", (socket) => {
    console.log("Socket connected", socket.id);

    // Create new player with initial position
    const newPlayer = {
        id: socket.id,
        username: "",
        position: { x: players.size % 4, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
    };

    players.set(socket.id, newPlayer);

    // Send ALL players to the new client (including themselves)
    const allPlayers = Array.from(players.values());
    socket.emit("connection", allPlayers);

    // Tell everyone else about the new player
    socket.broadcast.emit("player-connected", newPlayer);

    console.log("Total players:", players.size);
    console.log(newPlayer)

    // When a socket disconnects
    socket.on("disconnect", () => {
        console.log("Socket disconnected", socket.id);
        socket.broadcast.emit("player-disconnected", { id: socket.id });
        players.delete(socket.id);
        console.log("Total players:", players.size);
    });

    // Handle player position updates
    socket.on("update-player-position", (position, rotation) => {
        // Update the player's position on the server
        const player = players.get(socket.id);
        if (player) {
            player.position = position;
            player.rotation = rotation;

            // Broadcast to ALL other players (including the sender for testing)
            socket.broadcast.emit("update-player-position", socket.id, position, rotation);
        }
    });

    // Handle card selection
    socket.on("select-card", (cardType) => {
        console.log("Player selected card:", socket.id, cardType);

        // Broadcast to other players
        socket.broadcast.emit("card-selected", socket.id, cardType);

        // You can add game logic here for card effects
    });
});