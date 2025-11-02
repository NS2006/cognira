export class TetrisMinigame {
    constructor() {
        this.canvas = document.getElementById('tetrisCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.rows = 20;
        this.cols = 10;
        this.board = [];
        this.currentPiece = null;
        this.gameInterval = null;
        this.score = 0;
        this.gameActive = false;
        this.onGameComplete = null;
        this.timeLeft = 0;
        this.timerInterval = null;
        
        this.init();
    }

    init() {
        // Set canvas size
        this.canvas.width = this.cols * this.gridSize;
        this.canvas.height = this.rows * this.gridSize;
        
        // Initialize empty board
        this.resetBoard();
        
        // Define tetromino shapes
        this.shapes = [
            [[1, 1, 1, 1]], // I
            [[1, 1], [1, 1]], // O
            [[1, 1, 1], [0, 1, 0]], // T
            [[1, 1, 1], [1, 0, 0]], // L
            [[1, 1, 1], [0, 0, 1]], // J
            [[0, 1, 1], [1, 1, 0]], // S
            [[1, 1, 0], [0, 1, 1]]  // Z
        ];
        
        this.colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];
    }

    resetBoard() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }

    createPiece() {
        const shapeIndex = Math.floor(Math.random() * this.shapes.length);
        return {
            shape: this.shapes[shapeIndex],
            color: this.colors[shapeIndex],
            x: Math.floor(this.cols / 2) - Math.floor(this.shapes[shapeIndex][0].length / 2),
            y: 0
        };
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col]) {
                    this.ctx.fillStyle = this.board[row][col];
                    this.ctx.fillRect(col * this.gridSize, row * this.gridSize, this.gridSize, this.gridSize);
                    this.ctx.strokeStyle = '#FFF';
                    this.ctx.strokeRect(col * this.gridSize, row * this.gridSize, this.gridSize, this.gridSize);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (this.currentPiece.shape[row][col]) {
                        this.ctx.fillRect(
                            (this.currentPiece.x + col) * this.gridSize,
                            (this.currentPiece.y + row) * this.gridSize,
                            this.gridSize,
                            this.gridSize
                        );
                        this.ctx.strokeStyle = '#FFF';
                        this.ctx.strokeRect(
                            (this.currentPiece.x + col) * this.gridSize,
                            (this.currentPiece.y + row) * this.gridSize,
                            this.gridSize,
                            this.gridSize
                        );
                    }
                }
            }
        }
        
        // Draw score
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 20);
        this.ctx.fillText(`Time: ${this.timeLeft}s`, 10, 40);
    }

    movePiece(dx, dy) {
        if (!this.currentPiece || !this.gameActive) return false;
        
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;
        
        if (this.checkCollision()) {
            this.currentPiece.x -= dx;
            this.currentPiece.y -= dy;
            return false;
        }
        
        return true;
    }

    rotatePiece() {
        if (!this.currentPiece || !this.gameActive) return;
        
        const originalShape = this.currentPiece.shape;
        const rows = originalShape.length;
        const cols = originalShape[0].length;
        
        // Create rotated shape
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                rotated[col][rows - 1 - row] = originalShape[row][col];
            }
        }
        
        this.currentPiece.shape = rotated;
        
        if (this.checkCollision()) {
            this.currentPiece.shape = originalShape;
        }
    }

    checkCollision() {
        if (!this.currentPiece) return false;
        
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const newX = this.currentPiece.x + col;
                    const newY = this.currentPiece.y + row;
                    
                    if (
                        newX < 0 ||
                        newX >= this.cols ||
                        newY >= this.rows ||
                        (newY >= 0 && this.board[newY][newX])
                    ) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    lockPiece() {
        if (!this.currentPiece) return;
        
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const boardY = this.currentPiece.y + row;
                    const boardX = this.currentPiece.x + col;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        this.clearLines();
        this.currentPiece = this.createPiece();
        
        // Game over if collision immediately
        if (this.checkCollision()) {
            this.endGame(false);
        }
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                row++; // Check the same row again
            }
        }
        
        if (linesCleared > 0) {
            this.score += linesCleared * 100;
        }
    }

    update() {
        if (!this.gameActive) return;
        
        if (!this.movePiece(0, 1)) {
            this.lockPiece();
        }
        
        this.draw();
    }

    startGame(timeLimit, onGameComplete) {
        this.resetBoard();
        this.currentPiece = this.createPiece();
        this.score = 0;
        this.gameActive = true;
        this.onGameComplete = onGameComplete;
        this.timeLeft = timeLimit / 1000;
        
        // Game loop
        this.gameInterval = setInterval(() => this.update(), 500);
        
        // Timer
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 0) {
                this.endGame(this.score > 0);
            }
        }, 1000);
        
        this.draw();
        
        // Setup controls
        this.setupControls();
    }

    setupControls() {
        const handleKeyPress = (event) => {
            if (!this.gameActive) return;
            
            switch(event.key) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    break;
                case ' ':
                    // Hard drop
                    while (this.movePiece(0, 1)) {}
                    this.lockPiece();
                    break;
            }
            
            this.draw();
        };
        
        document.addEventListener('keydown', handleKeyPress);
        this.cleanup = () => document.removeEventListener('keydown', handleKeyPress);
    }

    endGame(success) {
        this.gameActive = false;
        
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        if (this.cleanup) {
            this.cleanup();
        }
        
        if (this.onGameComplete) {
            this.onGameComplete(success, this.score);
        }
    }

    stopGame() {
        this.endGame(false);
    }
}

// Global function to start the Tetris game
export function startTetrisGame(onComplete, timeLimit = 30000) {
    const tetrisContainer = document.getElementById('spatialMinigame');
    const tetrisCanvas = document.getElementById('tetrisCanvas');
    
    if (!tetrisContainer || !tetrisCanvas) {
        console.error('Tetris container or canvas not found');
        onComplete(false, 0);
        return;
    }
    
    const tetris = new TetrisMinigame();
    tetris.startGame(timeLimit, onComplete);
    
    return tetris;
}