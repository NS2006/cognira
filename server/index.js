import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Minigame types
const minigameTypes = ['question', 'question', 'memoryMatrix', 'mathOperation'];

// Production CORS settings
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [
        'https://cognira.netlify.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://cognira.railway.internal' 
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
let minigameSequence = []; // Store the fixed minigame sequence
let sequenceGenerated = false;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoint
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

function generateMinigameSequence(length = 10) {
    const sequence = [];
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * minigameTypes.length);
        sequence.push(minigameTypes[randomIndex]);
    }
    console.log(`🎲 Generated minigame sequence: ${sequence.join(', ')}`);
    return sequence;
}

socketio.on("connection", (socket) => {
    console.log("Socket connected", socket.id);

    // Generate minigame sequence if not already generated
    if (!sequenceGenerated) {
        minigameSequence = generateMinigameSequence();
        sequenceGenerated = true;
        console.log(`🎲 First player joined, minigame sequence set for all players`);
    }

    // Get username from handshake or use default
    const clientUsername = socket.handshake.auth.username || `Player${players.size + 1}`;
    
    console.log(`🎮 Player ${socket.id} joined with username: "${clientUsername}"`);

    // Create new player with custom username
    const newPlayer = {
        id: socket.id,
        username: clientUsername,
        position: { x: players.size % 4, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
    };

    players.set(socket.id, newPlayer);

    // Send minigame sequence to the connecting player
    socket.emit('minigame-sequence', minigameSequence);
    console.log(`🎲 Sent minigame sequence to player ${socket.id}`);

    // Send ALL players to the new client (including themselves)
    const allPlayers = Array.from(players.values());
    socket.emit("connection", allPlayers);

    // Tell everyone else about the new player
    socket.broadcast.emit("player-connected", newPlayer);

    console.log("Total players:", players.size);
    console.log("New player:", newPlayer);

    // Handle username updates
    socket.on("update-username", (newUsername) => {
        console.log("Updating username for:", socket.id, "to:", newUsername);
        const player = players.get(socket.id);
        if (player) {
            const oldUsername = player.username;
            player.username = newUsername;
            
            const updatedPlayers = Array.from(players.values());
            socketio.emit("update-username", updatedPlayers);
            
            console.log(`🔄 Username updated: ${oldUsername} → ${newUsername}`);
        }
    });

    // When a socket disconnects
    socket.on("disconnect", () => {
        console.log("Socket disconnected", socket.id);
        socket.broadcast.emit("player-disconnected", { id: socket.id });
        players.delete(socket.id);
        console.log("Total players:", players.size);
        
        // Reset if all players disconnect
        if (players.size === 0) {
            sequenceGenerated = false;
            minigameSequence = [];
            console.log('🎲 All players disconnected, game state reset');
        }
    });

    // Handle player position updates
    socket.on("update-player-position", (position, rotation) => {
        const player = players.get(socket.id);
        if (player) {
            player.position = position;
            player.rotation = rotation;
            socket.broadcast.emit("update-player-position", socket.id, position, rotation);
        }
    });

    socket.on("player-finished", (finishData) => {
        console.log(`🏁 Player ${finishData.playerId} (${finishData.username}) finished`);
        // Simply relay to other players
        socket.broadcast.emit("player-finished", finishData);
    });
});