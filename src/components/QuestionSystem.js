import { startTetrisGame } from './SpatialMinigame.js';

export class QuestionSystem {
    constructor(socketClient, onQuestionCompleteCallback) {
        this.socketClient = socketClient;
        this.onQuestionComplete = onQuestionCompleteCallback;

        this.questionContainer = document.getElementById('questionContainer');
        this.questionTimerProgress = document.getElementById('questionTimerProgress');
        this.questionTimerCount = document.getElementById('questionTimerCount');
        this.questionDescription = document.getElementById('questionDescription');
        this.questionImageContainer = document.getElementById('questionImageContainer');
        this.questionImage = document.getElementById('questionImage');
        this.questionOptions = document.getElementById('questionOptions');

        this.questionTimer = null;
        this.questionActive = false;
        this.currentQuestion = null;
        this.selectedAnswer = null;
        this.LOGIC_QUESTION_TIME = 15000; // 15 seconds for logic questions
        this.SPATIAL_QUESTION_TIME = 30000; // 30 seconds for spatial questions
        this.isSpatialQuestion = false;
        this.spatialMinigameActive = false; // Track spatial minigame separately
    }

    // Sample questions database
    getQuestionBank() {
        return [
            {
                id: 1,
                type: "logic",
                description: "&nbsp;&nbsp;&nbsp; A B <br> &nbsp;&nbsp;&nbsp; A B <br> _______ + <br> &nbsp; B C C <br><br>What is A B C?",
                image: null,
                options: [
                    { id: 'A', text: "6 1 2", correct: true },
                    { id: 'B', text: "5 2 1", correct: false },
                    { id: 'C', text: "5 3 1", correct: false },
                    { id: 'D', text: "6 2 2", correct: false }
                ],
                category: "Numeric Logic"
            },
            {
                id: 2,
                type: "logic",
                description: "What is the last digit of 3<sup>205</sup>?",
                image: null,
                options: [
                    { id: 'A', text: "3", correct: true },
                    { id: 'B', text: "1", correct: false },
                    { id: 'C', text: "9", correct: false },
                    { id: 'D', text: "7", correct: false }
                ],
                category: "Numeric Logic"
            },
            {
                id: 3,
                type: "logic",
                description: "NS, JPP, FL, TS, and KF compete in a running race. The current position is NS, JPP, TS, KF, and FL, so NS is the nearest to the finish line. After 3 seconds, KF gets ahead of TS. At the same time, JPP gets ahead of NS. At the last 4 seconds, FL finally gets ahead of NS. Now, who is at the third position?",
                image: null,
                options: [
                    { id: 'A', text: "NS", correct: true },
                    { id: 'B', text: "JPP", correct: false },
                    { id: 'C', text: "KF", correct: false },
                    { id: 'D', text: "TS", correct: false }
                ],
                category: "Numeric Logic"
            },
            // Example spatial question
            {
                id: 4,
                type: "spatial",
                description: "",
                image: "assets/images/spatial_net_example.png",
                options: [],
                category: "Spatial Reasoning"
            },
            {
                id: 5,
                type: "memory",
                description: "Memorize the 2×2 color pattern shown below:",
                matrix: [
                  ["#ff0000", "#00ff00"],
                  ["#0000ff", "#ffff00"]
                ],
                options: [
                  { id: 'A', matrix: [["#ff0000", "#00ff00"], ["#0000ff", "#ffff00"]], correct: true },
                  { id: 'B', matrix: [["#00ff00", "#ff0000"], ["#0000ff", "#ffff00"]], correct: false },
                  { id: 'C', matrix: [["#ff0000", "#ffff00"], ["#0000ff", "#00ff00"]], correct: false },
                  { id: 'D', matrix: [["#0000ff", "#ff0000"], ["#00ff00", "#ffff00"]], correct: false }
                ],
                category: "Memory Pattern"
              },              
        ];
    }

    getRandomQuestion() {
        const questions = this.getQuestionBank();
        const types = ['logic', 'spatial', 'memory'];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        const filteredQuestions = questions.filter(q => q.type === chosenType);
        const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
        return filteredQuestions[randomIndex];
    }

    showQuestion() {
        if (this.questionActive) return;
        this.currentQuestion = this.getRandomQuestion();
        this.selectedAnswer = null;
        this.isSpatialQuestion = false;
        this.spatialMinigameActive = false;

        if (this.currentQuestion.type === "logic") {
            this.questionDescription.innerHTML = `
                <div class="question-type-label"><b>Type:</b> Logic</div>
                <div class="question-text">${this.currentQuestion.description}</div>
            `;
            this.showLogicQuestion();
        } else if (this.currentQuestion.type === "memory") {
            this.questionDescription.innerHTML = `
                <div class="question-type-label"><b>Type:</b> Logic</div>
                <div class="question-text">${this.currentQuestion.description}</div>
            `;
            this.showMemoryQuestion();
        } else if (this.currentQuestion.type === "spatial") {
            this.isSpatialQuestion = true;
            this.spatialMinigameActive = true;
            this.questionDescription.innerHTML = `<div class="question-type-label"><b>Type:</b> Spatial</div>`;
            this.showSpatialMinigame();
        } 
    }
    
    // In the showSpatialMinigame method, update the callback handling:
    showSpatialMinigame() {
        if (this.questionActive) return;
    
        this.questionOptions.style.display = 'none';
        const tetrisContainer = document.getElementById('spatialMinigame');
        tetrisContainer.style.display = 'block';
    
        pauseWorld(true);
        this.questionActive = true;
        this.spatialMinigameActive = true;
    
        // Clear any existing question phase timer for spatial questions
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
    
        console.log("🎮 Starting spatial minigame (Tetris) for 30 seconds");
        console.log("🔄 onQuestionComplete callback exists:", !!this.onQuestionComplete);
        
        startTetrisGame((success, score) => {
            console.log(`🎮 Spatial minigame callback triggered - Success: ${success}`);
            
            if (!this.questionActive && !this.spatialMinigameActive) {
                console.log("⚠️ Question already inactive, ignoring callback");
                return;
            }
            
            console.log(`🎮 Spatial minigame completed - Success: ${success}, Score: ${score}`);
            
            // For spatial questions, success is based on clearing at least 1 full row
            const isCorrect = success;
            
            if (success) {
                console.log(`✅ Player cleared at least 1 row - will get card effect`);
            } else {
                console.log(`❌ Player failed to clear any rows - will get debuff`);
            }
            
            console.log(`🔄 Calling completeQuestion with isCorrect: ${isCorrect}`);
            this.completeQuestion(isCorrect);
        }, this.SPATIAL_QUESTION_TIME);
    }
    
    showMemoryQuestion() {
        if (this.questionActive) return;
    
        const question = this.currentQuestion;
        this.questionContainer.style.display = 'block';
        this.questionOptions.style.display = 'none';
        this.questionActive = true;
    
        // Step 1: Show the original matrix to memorize
        const matrixContainer = document.createElement('div');
        matrixContainer.classList.add('memory-matrix');
        this.questionDescription.innerHTML = `
            <div class="question-type-label"><b>Type:</b> Memory</div>
            <div class="question-text">${question.description}</div>
        `;
        this.questionDescription.appendChild(matrixContainer);
    
        this.renderColorMatrix(matrixContainer, question.matrix);
    
        // Step 2: After a few seconds, hide it and show answer choices
        setTimeout(() => {
            matrixContainer.remove();
            this.showMemoryOptions();
        }, 3000); // Show for 3 seconds
    }    

    showLogicQuestion() {
        if (this.currentQuestion.image) {
            this.questionImage.src = this.currentQuestion.image;
            this.questionImageContainer.style.display = 'block';
        } else {
            this.questionImageContainer.style.display = 'none';
        }
    
        // 🔧 FIX: Make sure the options container is visible again
        this.questionOptions.style.display = 'grid'; 
        this.questionOptions.style.gridTemplateColumns = 'repeat(2, 1fr)';
        this.questionOptions.style.gap = '12px';
        this.questionOptions.style.justifyContent = 'center';
    
        this.createAnswerButtons();
        this.questionContainer.style.display = 'block';
        this.questionActive = true;
        this.startQuestionTimer(this.LOGIC_QUESTION_TIME);
    }    

    renderColorMatrix(container, matrix) {
        container.innerHTML = '';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(2, 50px)';
        container.style.gridTemplateRows = 'repeat(2, 50px)';
        container.style.gap = '4px';
        container.style.margin = '10px auto';
    
        matrix.forEach(row => {
            row.forEach(color => {
                const cell = document.createElement('div');
                cell.style.width = '50px';
                cell.style.height = '50px';
                cell.style.background = color;
                cell.style.border = '1px solid #333';
                container.appendChild(cell);
            });
        });
    }
    
    showMemoryOptions() {
        const question = this.currentQuestion;
        this.questionOptions.innerHTML = '';
        this.questionOptions.style.display = 'grid';
        this.questionOptions.style.gridTemplateColumns = 'repeat(2, auto)';
        this.questionOptions.style.gap = '20px';
        this.questionOptions.style.justifyContent = 'center';
    
        question.options.forEach(option => {
            const wrapper = document.createElement('div');
            wrapper.className = 'memory-option';
            wrapper.setAttribute('data-option-id', option.id);
            wrapper.style.cursor = 'pointer';
            wrapper.style.padding = '10px';
            wrapper.style.border = '2px solid #888';
            wrapper.style.borderRadius = '8px';
            wrapper.style.transition = '0.2s';
    
            wrapper.innerHTML = `<div class="option-id">${option.id}</div>`;
            const matrixDiv = document.createElement('div');
            this.renderColorMatrix(matrixDiv, option.matrix);
            wrapper.appendChild(matrixDiv);
    
            wrapper.addEventListener('click', () => this.handleAnswerSelection(option.id));
    
            this.questionOptions.appendChild(wrapper);
        });
    
        this.startQuestionTimer(this.LOGIC_QUESTION_TIME);
    }    
    
    createAnswerButtons() {
        this.questionOptions.innerHTML = '';
        this.currentQuestion.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'question-option';
            button.setAttribute('data-option-id', option.id);
            button.innerHTML = `
                <span class="option-id">${option.id}.</span>
                <span class="option-text">${option.text}</span>
            `;
            button.addEventListener('click', () => this.handleAnswerSelection(option.id));
            this.questionOptions.appendChild(button);
        });
    }

    handleAnswerSelection(optionId) {
        if (!this.questionActive || this.selectedAnswer !== null) return;
    
        this.selectedAnswer = optionId;
    
        // Determine correct option
        const correctOption = this.currentQuestion.options.find(opt => opt.correct);
    
        // Handle logic or memory question differently
        const isMemory = this.currentQuestion.type === "memory";
        const elements = isMemory 
            ? this.questionOptions.querySelectorAll('.memory-option')
            : this.questionOptions.querySelectorAll('.question-option');
    
        // Disable all options
        elements.forEach(el => el.style.pointerEvents = 'none');
    
        setTimeout(() => {
            elements.forEach(el => {
                const id = el.getAttribute('data-option-id');
                const option = this.currentQuestion.options.find(opt => opt.id === id);
                if (option.correct) {
                    el.classList.add('correct'); // ✅ green
                } else if (id === optionId && !option.correct) {
                    el.classList.add('incorrect'); // ❌ red
                }
            });
    
            setTimeout(() => {
                this.completeQuestion(optionId === correctOption.id);
            }, 1500);
        }, 300);
    }    

    startQuestionTimer(time) {
        let timeLeft = time / 1000;
        this.questionTimerCount.textContent = timeLeft;
        this.questionTimerProgress.style.width = '100%';

        this.questionTimer = setInterval(() => {
            timeLeft--;
            this.questionTimerCount.textContent = timeLeft;
            this.questionTimerProgress.style.width = `${(timeLeft / (time / 1000)) * 100}%`;

            if (timeLeft <= 0) {
                clearInterval(this.questionTimer);
                this.handleQuestionTimeExpired();
            }
        }, 1000);
    }

    handleQuestionTimeExpired() {
        this.selectedAnswer = null;
        
        if (this.isSpatialQuestion && this.spatialMinigameActive) {
            // For spatial questions, don't complete if minigame is still running
            console.log("⏰ Question timer expired but spatial minigame still active, waiting...");
            return;
        }
        
        this.completeQuestion(false);
    }

    completeQuestion(isCorrect) {
        if (!this.questionActive && !this.spatialMinigameActive) {
            console.log("⚠️ Question already completed, ignoring");
            return;
        }
        
        console.log(`🔄 [QuestionSystem] completeQuestion called with isCorrect: ${isCorrect}`);
        
        this.questionActive = false;
        this.spatialMinigameActive = false;
    
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
    
        this.questionContainer.style.display = 'none';
    
        // Hide spatial minigame if it's visible
        const tetrisContainer = document.getElementById('spatialMinigame');
        if (tetrisContainer) {
            tetrisContainer.style.display = 'none';
        }
    
        // Ensure world is unpaused
        pauseWorld(false);
    
        console.log(`🔄 [QuestionSystem] Calling onQuestionComplete callback...`);
        
        if (this.onQuestionComplete) {
            this.onQuestionComplete(isCorrect, this.selectedAnswer);
        } else {
            console.error('❌ [QuestionSystem] onQuestionComplete callback is not defined!');
        }
    }

    hideQuestion() {
        this.questionContainer.style.display = 'none';
        this.questionActive = false;
        this.spatialMinigameActive = false;

        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
    }

    isMinigameActive() {
        return this.spatialMinigameActive;
    }
}

export function pauseWorld(pause = true) {
    const gameCanvas = document.getElementById('gameCanvas');
    if (!gameCanvas) return;

    if (pause) {
        gameCanvas.classList.add('blur');
        gameCanvas.style.pointerEvents = 'none';
    } else {
        gameCanvas.classList.remove('blur');
        gameCanvas.style.pointerEvents = 'auto';
    }
}