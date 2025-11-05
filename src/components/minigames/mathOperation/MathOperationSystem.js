import { pauseWorld } from '../../../utilities/worldRelated.js';
import { MEMORY_MATRIX_PHASE_TIME } from '../../../constants.js';
import { MathOperationList } from './MathOperationList.js';

export class MathOperationSystem {
    constructor(socketClient) {
        this.socketClient = socketClient;
        this.mathOperationList = new MathOperationList();

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
        this.answerOperators = [];
        this.availableOperators = [];
        this.draggedOperator = null;
        this.isCorrect = false;
        this.playerResult = null;

        // Use constants for timing
        this.GAME_TIME = MEMORY_MATRIX_PHASE_TIME * 1000;
        this.RESULT_TIME = 5000; // 5 seconds for showing results
    }

    showGame() {
        if (this.gameActive) return;
        
        this.currentQuestion = this.mathOperationList.getRandomMathQuestion();
        this.hasAnswered = false;
        this.isCorrect = false;
        this.playerResult = null;
        
        // Initialize answer operators array
        this.initializeAnswerOperators();
        
        // Get available operators and shuffle them (removed %)
        this.availableOperators = this.shuffleArray(['+', '-', '×', '÷', '^']);
        
        this.questionDescription.innerHTML = `
            <div class="question-type-label"><b>Type:</b> Math Operation</div>
            <div class="question-text">${this.currentQuestion.description}</div>
        `;

        // Start directly with drag-drop interface (no preview)
        this.showDragDropInterface();
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

    initializeAnswerOperators() {
        // Create empty slots for operators (one less than numbers count)
        const numbers = this.currentQuestion.numbers;
        this.answerOperators = new Array(numbers.length - 1).fill(null);
    }

    showDragDropInterface() {
        const question = this.currentQuestion;
        
        this.questionContainer.style.display = 'block';
        this.questionOptions.style.display = 'none';
        this.gameActive = true;

        this.questionDescription.innerHTML = `
            <div class="question-type-label"><b>Type:</b> Math Operation</div>
            <div class="question-text">Complete the equation by dragging operators to make it equal ${question.result}:</div>
        `;

        const gameArea = document.createElement('div');
        gameArea.className = 'math-operation-game-area';
        gameArea.style.display = 'flex';
        gameArea.style.flexDirection = 'column';
        gameArea.style.alignItems = 'center';
        gameArea.style.gap = '20px';

        // Create equation with drop zones
        const equationContainer = this.createEquationWithDropZones();
        gameArea.appendChild(equationContainer);

        // Create operator palette
        const operatorPalette = this.createOperatorPalette();
        gameArea.appendChild(operatorPalette);

        this.questionDescription.appendChild(gameArea);

        // Start the main game timer (using full time since no preview)
        const answerTime = this.GAME_TIME - this.RESULT_TIME;
        this.startGameTimer(answerTime);
    }

    createEquationWithDropZones() {
        const numbers = this.currentQuestion.numbers;
        const container = document.createElement('div');
        container.className = 'math-equation';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.gap = '10px';
        container.style.margin = '30px 0';
        container.style.padding = '20px';
        container.style.backgroundColor = '#f8f9fa';
        container.style.borderRadius = '10px';
        container.style.border = '2px solid #dee2e6';
        container.style.fontSize = '24px';
        container.style.fontWeight = 'bold';

        for (let i = 0; i < numbers.length; i++) {
            // Add number
            const numberElement = document.createElement('span');
            numberElement.textContent = numbers[i];
            numberElement.style.padding = '0 5px';
            container.appendChild(numberElement);

            // Add operator drop zone (except after last number)
            if (i < numbers.length - 1) {
                const dropZone = document.createElement('div');
                dropZone.className = 'operator-drop-zone';
                dropZone.dataset.index = i;
                dropZone.style.width = '60px';
                dropZone.style.height = '60px';
                dropZone.style.border = '2px dashed #999';
                dropZone.style.borderRadius = '8px';
                dropZone.style.backgroundColor = '#ffffff';
                dropZone.style.cursor = 'pointer';
                dropZone.style.display = 'flex';
                dropZone.style.alignItems = 'center';
                dropZone.style.justifyContent = 'center';
                dropZone.style.fontSize = '20px';
                dropZone.style.color = '#666';
                dropZone.textContent = '?';
                dropZone.style.transition = 'all 0.2s ease';

                let isDragOver = false;

                dropZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    isDragOver = true;
                    dropZone.style.borderColor = '#007bff';
                    dropZone.style.backgroundColor = '#e3f2fd';
                });

                dropZone.addEventListener('dragenter', (e) => {
                    e.preventDefault();
                    isDragOver = true;
                    dropZone.style.borderColor = '#007bff';
                    dropZone.style.backgroundColor = '#e3f2fd';
                });

                dropZone.addEventListener('dragleave', () => {
                    if (isDragOver) {
                        isDragOver = false;
                        if (this.answerOperators[i]) {
                            dropZone.style.borderColor = '#333';
                            dropZone.style.backgroundColor = '#f8f9fa';
                        } else {
                            dropZone.style.borderColor = '#999';
                            dropZone.style.backgroundColor = '#ffffff';
                        }
                    }
                });

                dropZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    isDragOver = false;
                    this.handleOperatorDrop(e, i, dropZone);
                });

                dropZone.addEventListener('click', () => {
                    if (this.answerOperators[i]) {
                        this.removeOperatorFromSlot(i, dropZone);
                    }
                });

                dropZone.addEventListener('dragstart', (e) => {
                    e.preventDefault();
                });

                container.appendChild(dropZone);
            }
        }

        // Add equals and result
        const equals = document.createElement('span');
        equals.textContent = '=';
        equals.style.padding = '0 10px';
        container.appendChild(equals);

        const result = document.createElement('span');
        result.textContent = this.currentQuestion.result;
        result.style.padding = '0 5px';
        result.style.color = '#28a745';
        container.appendChild(result);

        return container;
    }

    createOperatorPalette() {
        const paletteContainer = document.createElement('div');
        paletteContainer.className = 'operator-palette';
        paletteContainer.style.display = 'flex';
        paletteContainer.style.flexDirection = 'column';
        paletteContainer.style.gap = '15px';
        paletteContainer.style.justifyContent = 'center';
        paletteContainer.style.margin = '10px 0';
        paletteContainer.style.padding = '20px';
        paletteContainer.style.backgroundColor = '#f8f9fa';
        paletteContainer.style.borderRadius = '10px';
        paletteContainer.style.border = '2px solid #dee2e6';

        const instruction = document.createElement('div');
        instruction.textContent = 'Drag operators to the equation above (click to remove):';
        instruction.style.width = '100%';
        instruction.style.textAlign = 'center';
        instruction.style.marginBottom = '15px';
        instruction.style.fontWeight = 'bold';
        instruction.style.fontSize = '16px';
        paletteContainer.appendChild(instruction);

        const operatorsContainer = document.createElement('div');
        operatorsContainer.style.display = 'flex';
        operatorsContainer.style.gap = '15px';
        operatorsContainer.style.justifyContent = 'center';
        operatorsContainer.style.flexWrap = 'wrap';

        this.availableOperators.forEach((operator, index) => {
            const operatorCard = document.createElement('div');
            operatorCard.className = 'operator-card';
            operatorCard.dataset.operator = operator;
            operatorCard.style.width = '70px';
            operatorCard.style.height = '70px';
            operatorCard.style.border = '3px solid #333';
            operatorCard.style.borderRadius = '10px';
            operatorCard.style.backgroundColor = '#ffffff';
            operatorCard.style.cursor = 'grab';
            operatorCard.style.transition = 'all 0.2s ease';
            operatorCard.style.display = 'flex';
            operatorCard.style.alignItems = 'center';
            operatorCard.style.justifyContent = 'center';
            operatorCard.style.fontSize = operator === '^' ? '24px' : '28px';
            operatorCard.style.fontWeight = 'bold';
            operatorCard.textContent = operator;
            operatorCard.draggable = true;
            
            // Add tooltip for power
            let operatorName = '';
            switch(operator) {
                case '+': operatorName = 'Addition'; break;
                case '-': operatorName = 'Subtraction'; break;
                case '×': operatorName = 'Multiplication'; break;
                case '÷': operatorName = 'Division'; break;
                case '^': operatorName = 'Power/Exponent'; break;
            }
            operatorCard.title = `Operator: ${operatorName}`;

            operatorCard.addEventListener('dragstart', (e) => {
                this.draggedOperator = operator;
                operatorCard.style.opacity = '0.6';
                operatorCard.style.cursor = 'grabbing';
                operatorCard.style.transform = 'scale(1.1)';
                operatorCard.style.backgroundColor = '#e3f2fd';
                e.dataTransfer.setData('text/plain', operator);
                e.dataTransfer.effectAllowed = 'copy';
            });

            operatorCard.addEventListener('dragend', () => {
                operatorCard.style.opacity = '1';
                operatorCard.style.cursor = 'grab';
                operatorCard.style.transform = 'scale(1)';
                operatorCard.style.backgroundColor = '#ffffff';
                this.draggedOperator = null;
                
                // Reset all drop zone appearances after drag ends
                document.querySelectorAll('.operator-drop-zone').forEach(zone => {
                    const index = parseInt(zone.dataset.index);
                    if (this.answerOperators[index]) {
                        zone.style.borderColor = '#333';
                        zone.style.backgroundColor = '#f8f9fa';
                    } else {
                        zone.style.borderColor = '#999';
                        zone.style.backgroundColor = '#ffffff';
                    }
                });
            });

            operatorCard.addEventListener('mouseenter', () => {
                operatorCard.style.transform = 'scale(1.1)';
                operatorCard.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            });

            operatorCard.addEventListener('mouseleave', () => {
                if (this.draggedOperator !== operator) {
                    operatorCard.style.transform = 'scale(1)';
                    operatorCard.style.boxShadow = 'none';
                }
            });

            operatorsContainer.appendChild(operatorCard);
        });

        paletteContainer.appendChild(operatorsContainer);
        return paletteContainer;
    }

    handleOperatorDrop(e, index, dropZone) {
        const operator = e.dataTransfer.getData('text/plain');
        
        if (!operator) return;
        
        this.answerOperators[index] = operator;
        
        // Update drop zone appearance
        dropZone.textContent = operator;
        dropZone.style.border = '2px solid #333';
        dropZone.style.backgroundColor = '#f8f9fa';
        dropZone.style.color = '#333';
        dropZone.style.boxShadow = 'none';
        dropZone.style.fontSize = operator === '^' ? '18px' : '20px';
    }

    removeOperatorFromSlot(index, dropZone) {
        this.answerOperators[index] = null;
        
        // Reset drop zone appearance
        dropZone.textContent = '?';
        dropZone.style.border = '2px dashed #999';
        dropZone.style.backgroundColor = '#ffffff';
        dropZone.style.color = '#666';
        dropZone.style.boxShadow = 'none';
        dropZone.style.fontSize = '20px';
    }

    checkAnswer() {
        // Check if all operator slots are filled
        const allFilled = this.answerOperators.every(op => op !== null);
        
        if (allFilled) {
            try {
                // Evaluate the player's expression
                this.playerResult = this.evaluateExpression(
                    this.currentQuestion.numbers, 
                    this.answerOperators
                );
                
                // Check if result matches the target (with floating point tolerance)
                const target = this.currentQuestion.result;
                this.isCorrect = Math.abs(this.playerResult - target) < 0.0001;
            } catch (error) {
                console.error('Error evaluating expression:', error);
                this.isCorrect = false;
            }
        }
    }

    evaluateExpression(numbers, operators) {
        // Convert to JavaScript expression
        let expression = '';
        
        for (let i = 0; i < numbers.length; i++) {
            expression += numbers[i];
            if (i < operators.length) {
                // Convert mathematical operators to JavaScript operators
                switch(operators[i]) {
                    case '×': expression += '*'; break;
                    case '÷': expression += '/'; break;
                    case '^': expression += '**'; break;
                    default: expression += operators[i]; break;
                }
            }
        }
        
        // Evaluate the expression
        // Note: Using Function constructor for safety instead of eval
        return Function(`"use strict"; return (${expression})`)();
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
                // Check answer only when time ends
                this.checkAnswer();
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
            <div class="question-type-label"><b>Type:</b> Math Operation - Results</div>
            <div class="question-text">Here's how you did:</div>
        `;

        const resultsContainer = document.createElement('div');
        resultsContainer.style.display = 'flex';
        resultsContainer.style.flexDirection = 'column';
        resultsContainer.style.alignItems = 'center';
        resultsContainer.style.gap = '30px';
        resultsContainer.style.margin = '20px 0';

        // Player's Equation
        const playerSection = document.createElement('div');
        playerSection.style.textAlign = 'center';
        playerSection.innerHTML = '<h3 style="margin-bottom: 15px; color: #007bff;">Your Answer</h3>';
        const playerEquation = this.renderPlayerEquationWithResult();
        playerSection.appendChild(playerEquation);

        resultsContainer.appendChild(playerSection);

        // Only show correct answer if player was wrong
        if (!this.isCorrect) {
            const correctSection = document.createElement('div');
            correctSection.style.textAlign = 'center';
            correctSection.innerHTML = '<h3 style="margin-bottom: 15px; color: #28a745;">One Possible Solution</h3>';
            const correctEquation = this.renderEquation(this.currentQuestion.numbers, this.currentQuestion.operators);
            correctSection.appendChild(correctEquation);
            resultsContainer.appendChild(correctSection);
        }

        // Results summary
        const summary = document.createElement('div');
        summary.style.textAlign = 'center';
        summary.style.padding = '20px';
        summary.style.backgroundColor = '#f8f9fa';
        summary.style.borderRadius = '10px';
        summary.style.border = '2px solid #dee2e6';

        summary.innerHTML = `
            <div style="font-size: 1.5em; font-weight: bold; margin-bottom: 15px; color: ${this.isCorrect ? '#28a745' : '#dc3545'}">
                ${this.isCorrect ? '✓ PASSED' : '✗ FAILED'}
            </div>
            <div style="font-size: 1.2em; margin-bottom: 10px;">
                Your result: <strong>${this.playerResult !== null ? this.playerResult.toFixed(2) : 'N/A'}</strong>
            </div>
            <div style="font-size: 1.2em; margin-bottom: 10px;">
                Target: <strong>${this.currentQuestion.result}</strong>
            </div>
            <div style="font-size: 1em; color: #666; margin-bottom: 10px;">
                ${this.isCorrect ? 'Your equation is correct!' : 'Your equation did not produce the target result'}
            </div>
            <div style="font-size: 0.9em; color: #888;">
                Results will auto-continue in ${this.RESULT_TIME / 1000} seconds...
            </div>
        `;

        resultsContainer.appendChild(summary);
        this.questionDescription.appendChild(resultsContainer);
    }

    renderPlayerEquationWithResult() {
        const numbers = this.currentQuestion.numbers;
        const equationContainer = document.createElement('div');
        equationContainer.style.display = 'flex';
        equationContainer.style.alignItems = 'center';
        equationContainer.style.justifyContent = 'center';
        equationContainer.style.gap = '10px';
        equationContainer.style.fontSize = '28px';
        equationContainer.style.fontWeight = 'bold';
        equationContainer.style.padding = '20px';
        equationContainer.style.backgroundColor = '#e9ecef';
        equationContainer.style.borderRadius = '10px';
        equationContainer.style.border = '2px solid #ced4da';

        for (let i = 0; i < numbers.length; i++) {
            // Add number
            const numberElement = document.createElement('span');
            numberElement.textContent = numbers[i];
            numberElement.style.padding = '0 5px';
            equationContainer.appendChild(numberElement);

            // Add operator (except after last number)
            if (i < numbers.length - 1) {
                const operatorElement = document.createElement('span');
                const playerOperator = this.answerOperators[i];
                operatorElement.textContent = playerOperator || '?';
                operatorElement.style.padding = '0 10px';
                operatorElement.style.color = '#007bff';
                operatorElement.style.fontSize = playerOperator === '^' ? '24px' : '28px';
                equationContainer.appendChild(operatorElement);
            }
        }

        // Add equals and result
        const equals = document.createElement('span');
        equals.textContent = '=';
        equals.style.padding = '0 15px';
        equationContainer.appendChild(equals);

        const result = document.createElement('span');
        result.textContent = this.playerResult !== null ? this.playerResult.toFixed(2) : '?';
        result.style.padding = '0 5px';
        result.style.color = this.isCorrect ? '#28a745' : '#dc3545';
        equationContainer.appendChild(result);

        return equationContainer;
    }

    renderEquation(numbers, operators) {
        const equationContainer = document.createElement('div');
        equationContainer.style.display = 'flex';
        equationContainer.style.alignItems = 'center';
        equationContainer.style.justifyContent = 'center';
        equationContainer.style.gap = '10px';
        equationContainer.style.fontSize = '28px';
        equationContainer.style.fontWeight = 'bold';
        equationContainer.style.padding = '20px';
        equationContainer.style.backgroundColor = '#e9ecef';
        equationContainer.style.borderRadius = '10px';
        equationContainer.style.border = '2px solid #ced4da';

        for (let i = 0; i < numbers.length; i++) {
            // Add number
            const numberElement = document.createElement('span');
            numberElement.textContent = numbers[i];
            numberElement.style.padding = '0 5px';
            equationContainer.appendChild(numberElement);

            // Add operator (except after last number)
            if (i < numbers.length - 1) {
                const operatorElement = document.createElement('span');
                operatorElement.textContent = operators[i];
                operatorElement.style.padding = '0 10px';
                operatorElement.style.color = '#007bff';
                operatorElement.style.fontSize = operators[i] === '^' ? '24px' : '28px';
                equationContainer.appendChild(operatorElement);
            }
        }

        // Add equals and result
        const equals = document.createElement('span');
        equals.textContent = '=';
        equals.style.padding = '0 15px';
        equationContainer.appendChild(equals);

        const result = document.createElement('span');
        result.textContent = this.currentQuestion.result;
        result.style.padding = '0 5px';
        result.style.color = '#28a745';
        equationContainer.appendChild(result);

        return equationContainer;
    }

    finalizeGame() {
        console.log(`🎯 Final results - Player result: ${this.playerResult}, Target: ${this.currentQuestion.result}, Correct: ${this.isCorrect}`);
        this.completeGame(this.isCorrect);
    }

    completeGame(isCorrect) {
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }

        this.questionContainer.style.display = 'none';
        pauseWorld(false);

        console.log(`🔄 [MathOperationSystem] Calling onGameComplete callback...`);
        
        if (this.onGameComplete) {
            this.onGameComplete(isCorrect);
        } else {
            console.error('❌ [MathOperationSystem] onGameComplete callback is not defined!');
        }
    }

    hideGame() {
        this.questionContainer.style.display = 'none';
        this.gameActive = false;
        this.hasAnswered = false;
        this.answerOperators = [];
        this.availableOperators = [];
        this.playerResult = null;

        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
    }

    // Helper methods to access math operation list functionality
    getMathQuestionsByDifficulty(difficulty) {
        return this.mathOperationList.getMathQuestionsByDifficulty(difficulty);
    }

    getMathQuestionById(id) {
        return this.mathOperationList.getMathQuestionById(id);
    }
}