export function startTetrisGame(callback, duration = 30000) {
    const container = document.getElementById('spatialMinigame');
    container.innerHTML = '';
    container.style.display = 'block';
    container.style.position = 'fixed';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.zIndex = '1000';
    container.style.background = 'rgba(0,0,0,0.8)';
    container.style.padding = '20px';
    container.style.borderRadius = '10px';

    const COLS = 10, ROWS = 20, BLOCK_SIZE = 30;
    const canvas = document.createElement('canvas');
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Add score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.style.cssText = `
        color: white;
        font-size: 18px;
        text-align: center;
        margin-bottom: 10px;
        font-family: Arial, sans-serif;
    `;
    scoreDisplay.innerHTML = `Score: 0 | Rows Cleared: 0`;
    container.insertBefore(scoreDisplay, canvas);

    // Add objective display
    const objectiveDisplay = document.createElement('div');
    objectiveDisplay.style.cssText = `
        color: #ffcc00;
        font-size: 14px;
        text-align: center;
        margin-bottom: 10px;
        font-family: Arial, sans-serif;
    `;
    objectiveDisplay.innerHTML = `🎯 Objective: Clear at least 1 full row to get card effect!`;
    container.insertBefore(objectiveDisplay, canvas);

    const SHAPES = [
        [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]],
        [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]], [[0,1,1],[1,1,0]],
        [[1,1,0],[0,1,1]]
    ];
    const COLORS = ['cyan','yellow','purple','orange','blue','green','red'];

    let board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
    let currentPiece = null, score = 0, dropCounter = 0, lastTime = 0;
    let rowsCleared = 0; // Track how many full rows were cleared

    function drawBoard() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for(let r=0;r<ROWS;r++)
            for(let c=0;c<COLS;c++)
                if(board[r][c]) {
                    ctx.fillStyle = COLORS[board[r][c]-1];
                    ctx.fillRect(c*BLOCK_SIZE, r*BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
                }
        if(currentPiece){
            for(let r=0;r<currentPiece.shape.length;r++)
                for(let c=0;c<currentPiece.shape[r].length;c++)
                    if(currentPiece.shape[r][c]){
                        ctx.fillStyle = COLORS[currentPiece.color-1];
                        ctx.fillRect((currentPiece.x+c)*BLOCK_SIZE, (currentPiece.y+r)*BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
                    }
        }
    }

    function collide(board, piece) {
        for(let r=0;r<piece.shape.length;r++)
            for(let c=0;c<piece.shape[r].length;c++)
                if(piece.shape[r][c]){
                    let newY = piece.y+r, newX = piece.x+c;
                    if(newY>=ROWS || newX<0 || newX>=COLS || board[newY][newX]) return true;
                }
        return false;
    }

    function merge(board, piece){
        for(let r=0;r<piece.shape.length;r++)
            for(let c=0;c<piece.shape[r].length;c++)
                if(piece.shape[r][c]) board[piece.y+r][piece.x+c] = piece.color;
    }

    function clearLines(){
        let linesClearedThisTurn = 0;
        for(let r=ROWS-1;r>=0;r--){
            if(board[r].every(cell=>cell!==0)){
                board.splice(r,1);
                board.unshift(Array(COLS).fill(0));
                score += 10;
                linesClearedThisTurn++;
                r++; // Check the same row again after shifting
            }
        }
        
        if (linesClearedThisTurn > 0) {
            rowsCleared += linesClearedThisTurn;
            updateScoreDisplay();
            
            // Visual feedback for clearing rows
            if (linesClearedThisTurn === 1) {
                objectiveDisplay.innerHTML = `🎉 Success! You cleared ${rowsCleared} row(s) - You'll get the card effect!`;
                objectiveDisplay.style.color = '#00ff00';
            } else if (linesClearedThisTurn > 1) {
                objectiveDisplay.innerHTML = `🎉 Amazing! You cleared ${linesClearedThisTurn} rows at once! Total: ${rowsCleared} rows`;
                objectiveDisplay.style.color = '#00ff00';
            }
        }
        
        return linesClearedThisTurn;
    }

    function updateScoreDisplay() {
        scoreDisplay.innerHTML = `Score: ${score} | Rows Cleared: ${rowsCleared}`;
        
        // Update objective display based on progress
        if (rowsCleared === 0) {
            objectiveDisplay.innerHTML = `🎯 Objective: Clear at least 1 full row to get card effect!`;
            objectiveDisplay.style.color = '#ffcc00';
        } else if (rowsCleared === 1) {
            objectiveDisplay.innerHTML = `✅ Objective Complete! You cleared 1 row - You'll get the card effect!`;
            objectiveDisplay.style.color = '#00ff00';
        } else {
            objectiveDisplay.innerHTML = `🎉 Excellent! You cleared ${rowsCleared} rows - You'll get the card effect!`;
            objectiveDisplay.style.color = '#00ff00';
        }
    }

    function newPiece(){
        const idx = Math.floor(Math.random()*SHAPES.length);
        currentPiece = { shape: SHAPES[idx], color: idx+1, x: Math.floor(COLS/2)-1, y:0 };
    }

    function dropPiece(){
        currentPiece.y++;
        if(collide(board,currentPiece)){
            currentPiece.y--;
            merge(board,currentPiece);
            clearLines();
            newPiece();
            // Never end the game prematurely
            if(collide(board,currentPiece)){
                // just reset piece
                currentPiece.y = 0;
                currentPiece.x = Math.floor(COLS/2)-1;
            }
        }
    }

    function movePiece(dir){
        currentPiece.x += dir;
        if(collide(board,currentPiece)) currentPiece.x -= dir;
    }

    function rotatePiece(){
        const temp = currentPiece.shape;
        currentPiece.shape = currentPiece.shape[0].map((_,i)=>currentPiece.shape.map(row=>row[i]).reverse());
        if(collide(board,currentPiece)) currentPiece.shape = temp;
    }

    function update(time=0){
        const delta = time - lastTime;
        lastTime = time;
        dropCounter += delta;
        if(dropCounter>500){ dropPiece(); dropCounter=0; }
        drawBoard();
        if(!gameOver) requestAnimationFrame(update);
    }

    document.onkeydown = function(e){
        if(gameOver) return;
        if(e.key==='ArrowLeft') movePiece(-1);
        if(e.key==='ArrowRight') movePiece(1);
        if(e.key==='ArrowDown') dropPiece();
        if(e.key==='ArrowUp') rotatePiece();
    }

    let gameOver = false;
    newPiece();
    update();

    // End game after fixed duration
    // In the setTimeout at the end of startTetrisGame, add more cleanup:
    setTimeout(() => {
        gameOver = true;
        container.style.display = 'none';
        
        // Clear any keyboard events
        document.onkeydown = null;
        
        // Determine success based on rows cleared
        const success = rowsCleared >= 1;
        
        console.log(`🎮 Tetris completed - Rows cleared: ${rowsCleared}, Success: ${success}, Score: ${score}`);
        
        // Ensure callback is called only once
        if (callback) {
            callback(success, score);
        } else {
            console.error('❌ Tetris callback is undefined!');
        }
    }, duration);
}