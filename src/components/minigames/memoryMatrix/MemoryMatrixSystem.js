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
        this.placedCells = new Set();

        // Use constants for timing
        this.GAME_TIME = MEMORY_MATRIX_PHASE_TIME * 1000;
        this.PREVIEW_TIME = (MEMORY_MATRIX_PHASE_TIME * 1000) / 4;
        this.RESULT_TIME = 5000; // 5 seconds for showing results
    }

    showGame() {
        if (this.gameActive) return;
        
        this.currentQuestion = this.memoryMatrixList.getRandomMatrixQuestion();
        this.hasAnswered = false;
        this.correctAnswerCount = 0;
        this.placedCells.clear();
        
        this.initializeAnswerGrid();
        this.availableColors = this.shuffleArray(this.getUniqueColors(this.currentQuestion.matrix));
        this.totalCells = this.currentQuestion.matrix.flat().length;

        this.questionDescription.innerHTML = `
            <div class="question-type-label"><b>Type:</b> Memory Matrix</div>
            <div class="question-text">${this.currentQuestion.description}</div>
        `;

        this.showMemoryPreview();
    }

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
            row.map(() => null)
        );
    }

    getUniqueColors(matrix) {
        const flatMatrix = matrix.flat();
        return [...new Set(flatMatrix)];
    }

    showMemoryPreview() {
        if (this.gameActive) return;

        const question = this.currentQuestion;
        this.questionContainer.style.display = 'block';
        this.questionOptions.style.display = 'none';
        this.gameActive = true;

        this.startPreviewTimer();

        const matrixContainer = document.createElement('div');
        matrixContainer.classList.add('memory-matrix-preview');
        this.questionDescription.appendChild(matrixContainer);

        this.renderColorMatrix(matrixContainer, question.matrix);

        const previewInfo = document.createElement('div');
        previewInfo.innerHTML = `<p style="text-align: center; margin: 10px 0; font-weight: bold;">Memorize this pattern for ${this.PREVIEW_TIME / 1000} seconds...</p>`;
        this.questionDescription.appendChild(previewInfo);

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

        const gameArea = document.createElement('div');
        gameArea.className = 'memory-matrix-game-area';
        gameArea.style.display = 'flex';
        gameArea.style.flexDirection = 'column';
        gameArea.style.alignItems = 'center';
        gameArea.style.gap = '20px';

        const answerGridContainer = this.createAnswerGrid();
        gameArea.appendChild(answerGridContainer);

        const colorPalette = this.createColorPalette();
        gameArea.appendChild(colorPalette);

        this.questionDescription.appendChild(gameArea);

        // Calculate answer time (total time minus preview and result time)
        const answerTime = this.GAME_TIME - this.PREVIEW_TIME - this.RESULT_TIME;
        this.startGameTimer(answerTime);
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

                let isDragOver = false;

                cell.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    isDragOver = true;
                    cell.style.borderColor = '#007bff';
                    cell.style.backgroundColor = '#e3f2fd';
                });

                cell.addEventListener('dragenter', (e) => {
                    e.preventDefault();
                    isDragOver = true;
                    cell.style.borderColor = '#007bff';
                    cell.style.backgroundColor = '#e3f2fd';
                });

                cell.addEventListener('dragleave', () => {
                    if (isDragOver) {
                        isDragOver = false;
                        if (this.answerGrid[row][col]) {
                            cell.style.borderColor = '#333';
                            cell.style.backgroundColor = this.answerGrid[row][col];
                        } else {
                            cell.style.borderColor = '#999';
                            cell.style.backgroundColor = '#ffffff';
                        }
                    }
                });

                cell.addEventListener('drop', (e) => {
                    e.preventDefault();
                    isDragOver = false;
                    this.handleColorDrop(e, row, col, cell);
                });

                cell.addEventListener('click', () => {
                    if (this.answerGrid[row][col]) {
                        this.removeColorFromCell(row, col, cell);
                    }
                });

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
        instruction.textContent = 'Drag colors to the grid above (click to remove):';
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
                
                document.querySelectorAll('.answer-cell').forEach(cell => {
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    if (this.answerGrid[row][col]) {
                        cell.style.borderColor = '#333';
                        cell.style.backgroundColor = this.answerGrid[row][col];
                    } else {
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
        
        this.answerGrid[row][col] = color;
        this.placedCells.add(`${row}-${col}`);
        
        // REMOVED: Immediate correctness feedback
        cell.style.background = color;
        cell.style.border = '2px solid #333';
        cell.style.color = 'transparent';
        cell.textContent = '';
        
        // Only show neutral styling during answer phase
        cell.style.borderColor = '#333';
        cell.style.boxShadow = 'none';

        this.updateCorrectCount();
    }

    removeColorFromCell(row, col, cell) {
        this.answerGrid[row][col] = null;
        this.placedCells.delete(`${row}-${col}`);
        
        cell.style.background = '#ffffff';
        cell.style.border = '2px dashed #999';
        cell.style.color = '#666';
        cell.style.boxShadow = 'none';
        cell.textContent = 'Drop here';
        
        this.updateCorrectCount();
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
                Progress: ${filledCount}/${totalCells} filled
            </div>
            <div style="font-size: 12px; color: #666;">
                Need ${requiredToPass} correct to pass
            </div>
            <div style="font-size: 11px; color: #888; margin-top: 5px;">
                Results will be shown after time ends
            </div>
        `;
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
                this.showResultsPhase();
            }
        }, 1000);
    }

    showResultsPhase() {
        // Disable further interactions
        this.gameActive = false;
        
        // Show the results comparison
        this.showResultsComparison();
        
        // Start result timer
        setTimeout(() => {
            this.finalizeGame();
        }, this.RESULT_TIME);
    }

    showResultsComparison() {
        this.questionDescription.innerHTML = `
            <div class="question-type-label"><b>Type:</b> Memory Matrix - Results</div>
            <div class="question-text">Here's how you did:</div>
        `;

        const resultsContainer = document.createElement('div');
        resultsContainer.style.display = 'flex';
        resultsContainer.style.flexDirection = 'column';
        resultsContainer.style.alignItems = 'center';
        resultsContainer.style.gap = '30px';
        resultsContainer.style.margin = '20px 0';

        // Create comparison grids
        const comparisonContainer = document.createElement('div');
        comparisonContainer.style.display = 'flex';
        comparisonContainer.style.gap = '40px';
        comparisonContainer.style.justifyContent = 'center';
        comparisonContainer.style.flexWrap = 'wrap';

        // Correct Matrix
        const correctSection = document.createElement('div');
        correctSection.style.textAlign = 'center';
        correctSection.innerHTML = '<h3 style="margin-bottom: 10px; color: #28a745;">Correct Pattern</h3>';
        const correctGrid = document.createElement('div');
        this.renderColorMatrix(correctGrid, this.currentQuestion.matrix);
        correctSection.appendChild(correctGrid);

        // Player's Matrix with visual feedback
        const playerSection = document.createElement('div');
        playerSection.style.textAlign = 'center';
        playerSection.innerHTML = '<h3 style="margin-bottom: 10px; color: #007bff;">Your Answer</h3>';
        const playerGrid = document.createElement('div');
        this.renderPlayerMatrixWithFeedback(playerGrid, this.answerGrid);
        playerSection.appendChild(playerGrid);

        comparisonContainer.appendChild(correctSection);
        comparisonContainer.appendChild(playerSection);
        resultsContainer.appendChild(comparisonContainer);

        // Results summary
        const summary = document.createElement('div');
        summary.style.textAlign = 'center';
        summary.style.padding = '20px';
        summary.style.backgroundColor = '#f8f9fa';
        summary.style.borderRadius = '10px';
        summary.style.border = '2px solid #dee2e6';

        const totalCells = this.totalCells;
        const requiredToPass = Math.ceil(totalCells / 2);
        const isPassed = this.correctAnswerCount >= requiredToPass;

        summary.innerHTML = `
            <div style="font-size: 1.5em; font-weight: bold; margin-bottom: 15px; color: ${isPassed ? '#28a745' : '#dc3545'}">
                ${isPassed ? '✓ PASSED' : '✗ FAILED'}
            </div>
            <div style="font-size: 1.2em; margin-bottom: 10px;">
                Correct: <strong>${this.correctAnswerCount}/${totalCells}</strong>
            </div>
            <div style="font-size: 1em; color: #666; margin-bottom: 10px;">
                Required: ${requiredToPass} correct to pass
            </div>
            <div style="font-size: 0.9em; color: #888;">
                Results will auto-continue in ${this.RESULT_TIME / 1000} seconds...
            </div>
        `;

        resultsContainer.appendChild(summary);
        this.questionDescription.appendChild(resultsContainer);
    }

    renderPlayerMatrixWithFeedback(container, playerMatrix) {
        const correctMatrix = this.currentQuestion.matrix;
        const rows = correctMatrix.length;
        const cols = correctMatrix[0].length;
        const cellSize = rows > 2 || cols > 2 ? '40px' : '50px';

        container.innerHTML = '';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${cols}, ${cellSize})`;
        container.style.gridTemplateRows = `repeat(${rows}, ${cellSize})`;
        container.style.gap = '4px';
        container.style.margin = '10px auto';
        container.style.justifyContent = 'center';

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.style.width = cellSize;
                cell.style.height = cellSize;
                cell.style.border = '2px solid';
                cell.style.borderRadius = '4px';
                
                if (playerMatrix[row][col]) {
                    cell.style.background = playerMatrix[row][col];
                    const isCorrect = playerMatrix[row][col] === correctMatrix[row][col];
                    cell.style.borderColor = isCorrect ? '#28a745' : '#dc3545';
                    cell.style.boxShadow = isCorrect ? 
                        '0 0 8px rgba(40, 167, 69, 0.5)' : 
                        '0 0 8px rgba(220, 53, 69, 0.5)';
                } else {
                    cell.style.background = '#f8f9fa';
                    cell.style.borderColor = '#dee2e6';
                    cell.style.color = '#999';
                    cell.style.display = 'flex';
                    cell.style.alignItems = 'center';
                    cell.style.justifyContent = 'center';
                    cell.style.fontSize = '10px';
                    cell.textContent = 'Empty';
                }

                container.appendChild(cell);
            }
        }
    }

    renderColorMatrix(container, matrix) {
        container.innerHTML = '';
        
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
                cell.style.border = '2px solid #333';
                cell.style.borderRadius = '4px';
                container.appendChild(cell);
            });
        });
    }

    finalizeGame() {
        const totalCells = this.totalCells;
        const requiredToPass = Math.ceil(totalCells / 2);
        const isCorrect = this.correctAnswerCount >= requiredToPass;

        console.log(`🎯 Final results - Correct: ${this.correctAnswerCount}/${totalCells}, required: ${requiredToPass}, result: ${isCorrect ? 'PASS' : 'FAIL'}`);
        this.completeGame(isCorrect);
    }

    completeGame(isCorrect) {
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }

        if (this.previewTimer) {
            clearInterval(this.previewTimer);
            this.previewTimer = null;
        }

        this.questionContainer.style.display = 'none';
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
        this.placedCells.clear();

        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }

        if (this.previewTimer) {
            clearInterval(this.previewTimer);
            this.previewTimer = null;
        }
    }

    getMatrixQuestionsByDifficulty(difficulty) {
        return this.memoryMatrixList.getMatrixQuestionsByDifficulty(difficulty);
    }

    getMatrixQuestionById(id) {
        return this.memoryMatrixList.getMatrixQuestionById(id);
    }
}