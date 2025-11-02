import { pauseWorld } from '../../../utilities/worldRelated.js';
import { MEMORY_MATRIX_PHASE_TIME } from '../../../constants.js';
import { MemoryMatrixList } from './MemoryMatrixList.js';

export class MemoryMatrixSystem {
    constructor(socketClient) {
        this.socketClient = socketClient;
        this.memoryMatrixList = new MemoryMatrixList();

        // UI Elements
        this.questionContainer = document.getElementById('questionContainer');
        this.questionTimerProgress = document.getElementById('questionTimerProgress');
        this.questionTimerCount = document.getElementById('questionTimerCount');
        this.questionDescription = document.getElementById('questionDescription');
        this.questionOptions = document.getElementById('questionOptions');

        // State
        this.questionTimer = null;
        this.gameActive = false;
        this.currentQuestion = null;
        this.hasAnswered = false;
        
        // Drag & Drop State
        this.answerGrid = [];
        this.availableColors = [];
        this.draggedColor = null;
        this.correctAnswerCount = 0;
        this.totalCells = 0;
        this.fixedCells = new Set(); // Track cells that are locked

        // Use constants for timing
        this.GAME_TIME = MEMORY_MATRIX_PHASE_TIME * 1000; // Convert to milliseconds
        this.PREVIEW_TIME = (MEMORY_MATRIX_PHASE_TIME * 1000) / 4; // 1/4 of total time for preview
    }

    showGame() {
        if (this.gameActive) return;
        
        this.currentQuestion = this.memoryMatrixList.getRandomMatrixQuestion();
        this.hasAnswered = false;
        this.correctAnswerCount = 0;
        this.fixedCells.clear(); // Reset fixed cells
        
        // Initialize answer grid
        this.initializeAnswerGrid();
        
        // Get available colors from the correct matrix and SHUFFLE them
        this.availableColors = this.shuffleArray(this.getUniqueColors(this.currentQuestion.matrix));
        this.totalCells = this.currentQuestion.matrix.flat().length;

        this.questionDescription.innerHTML = `
            <div class="question-type-label"><b>Type:</b> Memory Matrix</div>
            <div class="question-text">${this.currentQuestion.description}</div>
        `;

        this.showMemoryPreview();
    }

    // Add shuffle method to randomize array
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    initializeAnswerGrid() {
        const matrix = this.currentQuestion.matrix;
        this.answerGrid = matrix.map(row => 
            row.map(() => null) // Initialize all cells as empty
        );
    }

    getUniqueColors(matrix) {
        const flatMatrix = matrix.flat();
        return [...new Set(flatMatrix)]; // Get unique colors
    }

    showMemoryPreview() {
        if (this.gameActive) return;

        const question = this.currentQuestion;
        this.questionContainer.style.display = 'block';
        this.questionOptions.style.display = 'none';
        this.gameActive = true;

        // Start preview timer immediately
        this.startPreviewTimer();

        // Step 1: Show the original matrix to memorize
        const matrixContainer = document.createElement('div');
        matrixContainer.classList.add('memory-matrix-preview');
        this.questionDescription.appendChild(matrixContainer);

        this.renderColorMatrix(matrixContainer, question.matrix);

        // Add preview timer info
        const previewInfo = document.createElement('div');
        previewInfo.innerHTML = `<p style="text-align: center; margin: 10px 0; font-weight: bold;">Memorize this pattern for ${this.PREVIEW_TIME / 1000} seconds...</p>`;
        this.questionDescription.appendChild(previewInfo);

        // Step 2: After preview time, hide it and show drag-drop interface
        setTimeout(() => {
            matrixContainer.remove();
            previewInfo.remove();
            this.showDragDropInterface();
        }, this.PREVIEW_TIME);
    }

    startPreviewTimer() {
        let timeLeft = this.PREVIEW_TIME / 1000;
        this.questionTimerCount.textContent = timeLeft;
        this.questionTimerProgress.style.width = '100%';

        this.previewTimer = setInterval(() => {
            timeLeft--;
            this.questionTimerCount.textContent = timeLeft;
            this.questionTimerProgress.style.width = `${(timeLeft / (this.PREVIEW_TIME / 1000)) * 100}%`;

            if (timeLeft <= 0) {
                clearInterval(this.previewTimer);
            }
        }, 1000);
    }

    showDragDropInterface() {
        const question = this.currentQuestion;
        
        this.questionDescription.innerHTML = `
            <div class="question-type-label"><b>Type:</b> Memory Matrix</div>
            <div class="question-text">Recreate the color pattern you memorized by dragging colors to the grid:</div>
        `;

        // Create the main game area
        const gameArea = document.createElement('div');
        gameArea.className = 'memory-matrix-game-area';
        gameArea.style.display = 'flex';
        gameArea.style.flexDirection = 'column';
        gameArea.style.alignItems = 'center';
        gameArea.style.gap = '20px';

        // Create answer grid (drop zones)
        const answerGridContainer = this.createAnswerGrid();
        gameArea.appendChild(answerGridContainer);

        // Create color palette (drag sources) - colors are already shuffled
        const colorPalette = this.createColorPalette();
        gameArea.appendChild(colorPalette);

        this.questionDescription.appendChild(gameArea);

        // Start the main game timer
        this.startGameTimer(this.GAME_TIME - this.PREVIEW_TIME);
    }

    createAnswerGrid() {
        const matrix = this.currentQuestion.matrix;
        const rows = matrix.length;
        const cols = matrix[0].length;
        const cellSize = '60px';

        const gridContainer = document.createElement('div');
        gridContainer.className = 'answer-grid';
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, ${cellSize})`;
        gridContainer.style.gridTemplateRows = `repeat(${rows}, ${cellSize})`;
        gridContainer.style.gap = '8px';
        gridContainer.style.margin = '20px auto';
        gridContainer.style.padding = '15px';
        gridContainer.style.backgroundColor = '#f0f0f0';
        gridContainer.style.borderRadius = '10px';
        gridContainer.style.border = '2px solid #ccc';

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'answer-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.style.width = cellSize;
                cell.style.height = cellSize;
                cell.style.border = '2px dashed #999';
                cell.style.borderRadius = '6px';
                cell.style.backgroundColor = '#ffffff';
                cell.style.cursor = 'pointer';
                cell.style.display = 'flex';
                cell.style.alignItems = 'center';
                cell.style.justifyContent = 'center';
                cell.style.fontSize = '12px';
                cell.style.color = '#666';
                cell.textContent = 'Drop here';

                // Track if we're currently dragging over this cell
                let isDragOver = false;

                // Add drag and drop events
                cell.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    // Only highlight if cell is empty and not fixed
                    if (!this.answerGrid[row][col] && !this.isCellFixed(row, col)) {
                        isDragOver = true;
                        cell.style.borderColor = '#007bff';
                        cell.style.backgroundColor = '#e3f2fd';
                    }
                });

                cell.addEventListener('dragenter', (e) => {
                    e.preventDefault();
                    // Only highlight if cell is empty and not fixed
                    if (!this.answerGrid[row][col] && !this.isCellFixed(row, col)) {
                        isDragOver = true;
                        cell.style.borderColor = '#007bff';
                        cell.style.backgroundColor = '#e3f2fd';
                    }
                });

                cell.addEventListener('dragleave', () => {
                    if (isDragOver) {
                        isDragOver = false;
                        cell.style.borderColor = '#999';
                        cell.style.backgroundColor = '#ffffff';
                    }
                });

                cell.addEventListener('drop', (e) => {
                    e.preventDefault();
                    isDragOver = false;
                    // Only allow drop if cell is empty and not fixed
                    if (!this.answerGrid[row][col] && !this.isCellFixed(row, col)) {
                        this.handleColorDrop(e, row, col, cell);
                    } else {
                        // Reset appearance if drop is not allowed
                        cell.style.borderColor = '#999';
                        cell.style.backgroundColor = '#ffffff';
                    }
                });

                cell.addEventListener('click', () => {
                    // Only allow removal if cell has color and is not fixed
                    if (this.answerGrid[row][col] && !this.isCellFixed(row, col)) {
                        this.removeColorFromCell(row, col, cell);
                    }
                });

                // Prevent default drag behaviors
                cell.addEventListener('dragstart', (e) => {
                    e.preventDefault();
                });

                gridContainer.appendChild(cell);
            }
        }

        return gridContainer;
    }

    createColorPalette() {
        const paletteContainer = document.createElement('div');
        paletteContainer.className = 'color-palette';
        paletteContainer.style.display = 'flex';
        paletteContainer.style.gap = '15px';
        paletteContainer.style.flexWrap = 'wrap';
        paletteContainer.style.justifyContent = 'center';
        paletteContainer.style.margin = '10px 0';
        paletteContainer.style.padding = '15px';
        paletteContainer.style.backgroundColor = '#f8f9fa';
        paletteContainer.style.borderRadius = '10px';
        paletteContainer.style.border = '2px solid #dee2e6';

        const instruction = document.createElement('div');
        instruction.textContent = 'Drag colors to the grid above:';
        instruction.style.width = '100%';
        instruction.style.textAlign = 'center';
        instruction.style.marginBottom = '10px';
        instruction.style.fontWeight = 'bold';
        paletteContainer.appendChild(instruction);

        const colorsContainer = document.createElement('div');
        colorsContainer.style.display = 'flex';
        colorsContainer.style.gap = '10px';
        colorsContainer.style.justifyContent = 'center';
        colorsContainer.style.flexWrap = 'wrap';

        // The availableColors array is already shuffled, so we just iterate through it
        this.availableColors.forEach((color, index) => {
            const colorCard = document.createElement('div');
            colorCard.className = 'color-card';
            colorCard.dataset.color = color;
            colorCard.style.width = '50px';
            colorCard.style.height = '50px';
            colorCard.style.backgroundColor = color;
            colorCard.style.border = '2px solid #333';
            colorCard.style.borderRadius = '8px';
            colorCard.style.cursor = 'grab';
            colorCard.style.transition = 'all 0.2s ease';
            colorCard.draggable = true;
            colorCard.title = `Color ${index + 1}`;

            colorCard.addEventListener('dragstart', (e) => {
                this.draggedColor = color;
                colorCard.style.opacity = '0.6';
                colorCard.style.cursor = 'grabbing';
                colorCard.style.transform = 'scale(1.1)';
                e.dataTransfer.setData('text/plain', color);
                e.dataTransfer.effectAllowed = 'copy';
            });

            colorCard.addEventListener('dragend', () => {
                colorCard.style.opacity = '1';
                colorCard.style.cursor = 'grab';
                colorCard.style.transform = 'scale(1)';
                this.draggedColor = null;
                
                // Reset all cell appearances after drag ends
                document.querySelectorAll('.answer-cell').forEach(cell => {
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    if (!this.answerGrid[row][col] && !this.isCellFixed(row, col)) {
                        cell.style.borderColor = '#999';
                        cell.style.backgroundColor = '#ffffff';
                    }
                });
            });

            colorCard.addEventListener('mouseenter', () => {
                colorCard.style.transform = 'scale(1.1)';
                colorCard.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            });

            colorCard.addEventListener('mouseleave', () => {
                if (this.draggedColor !== color) {
                    colorCard.style.transform = 'scale(1)';
                    colorCard.style.boxShadow = 'none';
                }
            });

            colorsContainer.appendChild(colorCard);
        });

        paletteContainer.appendChild(colorsContainer);
        return paletteContainer;
    }

    handleColorDrop(e, row, col, cell) {
        const color = e.dataTransfer.getData('text/plain');
        
        if (!color) return;
        
        // Reset cell appearance
        cell.style.borderColor = '#333';
        cell.style.backgroundColor = '#ffffff';
        
        // Update the answer grid
        this.answerGrid[row][col] = color;
        
        // Update cell appearance with the dropped color
        cell.style.background = color;
        cell.style.border = '2px solid #333';
        cell.style.color = 'transparent';
        cell.textContent = ''; // Remove placeholder text
        
        // Check if this placement is correct
        const isCorrect = color === this.currentQuestion.matrix[row][col];
        if (isCorrect) {
            cell.style.borderColor = '#28a745';
            cell.style.boxShadow = '0 0 8px rgba(40, 167, 69, 0.5)';
        } else {
            cell.style.borderColor = '#dc3545';
            cell.style.boxShadow = '0 0 8px rgba(220, 53, 69, 0.5)';
        }

        // Lock the cell immediately after placement
        this.fixCell(row, col, cell);

        // Update correct count
        this.updateCorrectCount();
    }

    removeColorFromCell(row, col, cell) {
        // Only allow removal if cell is not fixed
        if (this.isCellFixed(row, col)) return;
        
        // Clear the answer grid
        this.answerGrid[row][col] = null;
        
        // Reset cell appearance
        cell.style.background = '#ffffff';
        cell.style.border = '2px dashed #999';
        cell.style.color = '#666';
        cell.style.boxShadow = 'none';
        cell.textContent = 'Drop here';
        
        // Update correct count
        this.updateCorrectCount();
    }

    isCellFixed(row, col) {
        return this.fixedCells.has(`${row}-${col}`);
    }

    fixCell(row, col, cell) {
        // Mark cell as fixed
        this.fixedCells.add(`${row}-${col}`);
        
        // Update cell appearance to indicate it's fixed
        cell.style.cursor = 'default';
        cell.style.opacity = '0.9';
        
        // Remove click event for removal
        cell.replaceWith(cell.cloneNode(true));
    }

    updateCorrectCount() {
        const correctMatrix = this.currentQuestion.matrix;
        let correctCount = 0;
        let filledCount = 0;

        for (let row = 0; row < this.answerGrid.length; row++) {
            for (let col = 0; col < this.answerGrid[row].length; col++) {
                if (this.answerGrid[row][col] !== null) {
                    filledCount++;
                    if (this.answerGrid[row][col] === correctMatrix[row][col]) {
                        correctCount++;
                    }
                }
            }
        }

        this.correctAnswerCount = correctCount;
        
        // Update UI to show progress
        this.updateProgressDisplay(correctCount, filledCount);
    }

    updateProgressDisplay(correctCount, filledCount) {
        let progressDisplay = document.getElementById('matrix-progress');
        if (!progressDisplay) {
            progressDisplay = document.createElement('div');
            progressDisplay.id = 'matrix-progress';
            progressDisplay.style.textAlign = 'center';
            progressDisplay.style.margin = '10px 0';
            progressDisplay.style.fontWeight = 'bold';
            progressDisplay.style.fontSize = '14px';
            this.questionDescription.appendChild(progressDisplay);
        }

        const totalCells = this.totalCells;
        const percentage = Math.round((correctCount / totalCells) * 100);
        const requiredToPass = Math.ceil(totalCells / 2);
        
        progressDisplay.innerHTML = `
            <div style="margin-bottom: 5px;">
                Progress: ${filledCount}/${totalCells} filled | 
                Correct: ${correctCount}/${totalCells} (${percentage}%)
            </div>
            <div style="font-size: 12px; color: #666;">
                Need ${requiredToPass} correct to pass
            </div>
        `;
    }

    renderColorMatrix(container, matrix) {
        container.innerHTML = '';
        
        // Determine grid size based on matrix dimensions
        const rows = matrix.length;
        const cols = matrix[0].length;
        const cellSize = rows > 2 || cols > 2 ? '40px' : '50px';
        
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${cols}, ${cellSize})`;
        container.style.gridTemplateRows = `repeat(${rows}, ${cellSize})`;
        container.style.gap = '4px';
        container.style.margin = '10px auto';
        container.style.justifyContent = 'center';

        matrix.forEach(row => {
            row.forEach(color => {
                const cell = document.createElement('div');
                cell.style.width = cellSize;
                cell.style.height = cellSize;
                cell.style.background = color;
                cell.style.border = '1px solid #333';
                cell.style.borderRadius = '4px';
                container.appendChild(cell);
            });
        });
    }

    startGameTimer(time) {
        let timeLeft = time / 1000;
        this.questionTimerCount.textContent = timeLeft;
        this.questionTimerProgress.style.width = '100%';

        this.questionTimer = setInterval(() => {
            timeLeft--;
            this.questionTimerCount.textContent = timeLeft;
            this.questionTimerProgress.style.width = `${(timeLeft / (time / 1000)) * 100}%`;

            if (timeLeft <= 0) {
                clearInterval(this.questionTimer);
                this.handleGameTimeExpired();
            }
        }, 1000);
    }

    handleGameTimeExpired() {
        const totalCells = this.totalCells;
        const halfCells = Math.ceil(totalCells / 2);
        const isCorrect = this.correctAnswerCount >= halfCells;

        console.log(`⏰ Time expired. Correct: ${this.correctAnswerCount}/${totalCells}, required: ${halfCells}, result: ${isCorrect ? 'PASS' : 'FAIL'}`);
        this.completeGame(isCorrect);
    }

    completeGame(isCorrect) {
        if (!this.gameActive) {
            console.log("⚠️ Game already completed, ignoring");
            return;
        }
        
        console.log(`🔄 [MemoryMatrixSystem] completeGame called with isCorrect: ${isCorrect}`);
        
        this.gameActive = false;

        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }

        // Clear preview timer if it's still running
        if (this.previewTimer) {
            clearInterval(this.previewTimer);
            this.previewTimer = null;
        }

        this.questionContainer.style.display = 'none';

        // Ensure world is unpaused
        pauseWorld(false);

        console.log(`🔄 [MemoryMatrixSystem] Calling onGameComplete callback...`);
        
        if (this.onGameComplete) {
            this.onGameComplete(isCorrect, this.correctAnswerCount);
        } else {
            console.error('❌ [MemoryMatrixSystem] onGameComplete callback is not defined!');
        }
    }

    hideGame() {
        this.questionContainer.style.display = 'none';
        this.gameActive = false;
        this.hasAnswered = false;
        this.answerGrid = [];
        this.availableColors = [];
        this.fixedCells.clear();

        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }

        if (this.previewTimer) {
            clearInterval(this.previewTimer);
            this.previewTimer = null;
        }
    }

    // Helper methods to access memory matrix list functionality
    getMatrixQuestionsByDifficulty(difficulty) {
        return this.memoryMatrixList.getMatrixQuestionsByDifficulty(difficulty);
    }

    getMatrixQuestionById(id) {
        return this.memoryMatrixList.getMatrixQuestionById(id);
    }
}