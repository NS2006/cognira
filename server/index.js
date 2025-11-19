import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000; // Use environment port for Render

// Production CORS settings
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [
        'https://cognira.netlify.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://cognira-backend.up.railway.app'
      ]
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

const socketio = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

const players = new Map();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        game: 'Cognira',
        players: players.size,
        timestamp: new Date().toISOString()
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 Cognira server listening on port: ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Health check: http://0.0.0.0:${PORT}/health`);
});

server.listen(PORT, () => {
    console.log(`🎮 Cognira server listening on port: ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
});

socketio.on("connection", (socket) => {
    console.log("Socket connected", socket.id);

    // Create new player with initial position and default username
    const newPlayer = {
        id: socket.id,
        username: `Player${socket.id.substring(0, 4)}`,
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
    console.log("New player:", newPlayer);

    // Handle username update
    socket.on("update-username", (newUsername) => {
        console.log("Updating username for:", socket.id, newUsername);
        const player = players.get(socket.id);
        if (player) {
            player.username = newUsername;
            // Broadcast updated player list to all clients
            const updatedPlayers = Array.from(players.values());
            socketio.emit("update-username", updatedPlayers);
        }
    });

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

            // Broadcast to ALL other players
            socket.broadcast.emit("update-player-position", socket.id, position, rotation);
        }
    });
});