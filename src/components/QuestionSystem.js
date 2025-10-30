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
                description: "Which shape can be formed by folding this net?",
                image: "assets/images/spatial_net_example.png",
                options: [
                    { id: 'A', text: "Cube", correct: true },
                    { id: 'B', text: "Pyramid", correct: false },
                    { id: 'C', text: "Cylinder", correct: false },
                    { id: 'D', text: "Cone", correct: false }
                ],
                category: "Spatial Reasoning"
            },
            // {
            //     id: 1,
            //     description: "What is the capital of France?",
            //     image: null,
            //     options: [
            //         { id: 'A', text: "London", correct: false },
            //         { id: 'B', text: "Paris", correct: true },
            //         { id: 'C', text: "Berlin", correct: false },
            //         { id: 'D', text: "Madrid", correct: false }
            //     ],
            //     category: "Geography"
            // },
            // {
            //     id: 2,
            //     description: "Which planet is known as the Red Planet?",
            //     image: null,
            //     options: [
            //         { id: 'A', text: "Venus", correct: false },
            //         { id: 'B', text: "Mars", correct: true },
            //         { id: 'C', text: "Jupiter", correct: false },
            //         { id: 'D', text: "Saturn", correct: false }
            //     ],
            //     category: "Science"
            // },
            // {
            //     id: 3,
            //     description: "What is 8 × 7?",
            //     image: null,
            //     options: [
            //         { id: 'A', text: "48", correct: false },
            //         { id: 'B', text: "56", correct: true },
            //         { id: 'C', text: "64", correct: false },
            //         { id: 'D', text: "72", correct: false }
            //     ],
            //     category: "Math"
            // },
            // {
            //     id: 4,
            //     description: "Which programming language is known for web development?",
            //     image: null,
            //     options: [
            //         { id: 'A', text: "Java", correct: false },
            //         { id: 'B', text: "Python", correct: false },
            //         { id: 'C', text: "JavaScript", correct: true },
            //         { id: 'D', text: "C++", correct: false }
            //     ],
            //     category: "Programming"
            // },
            // {
            //     id: 5,
            //     description: "What is the largest mammal in the world?",
            //     image: null,
            //     options: [
            //         { id: 'A', text: "Elephant", correct: false },
            //         { id: 'B', text: "Blue Whale", correct: true },
            //         { id: 'C', text: "Giraffe", correct: false },
            //         { id: 'D', text: "Polar Bear", correct: false }
            //     ],
            //     category: "Biology"
            // }
        ];
    }

    getRandomQuestion() {
        const questions = this.getQuestionBank();
        const types = ['logic', 'spatial'];
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

    showLogicQuestion() {
        if (this.currentQuestion.image) {
            this.questionImage.src = this.currentQuestion.image;
            this.questionImageContainer.style.display = 'block';
        } else {
            this.questionImageContainer.style.display = 'none';
        }

        this.createAnswerButtons();
        this.questionContainer.style.display = 'block';
        this.questionActive = true;
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
        const buttons = this.questionOptions.querySelectorAll('.question-option');
        buttons.forEach(button => {
            button.classList.remove('selected');
            if (button.getAttribute('data-option-id') === optionId) {
                button.classList.add('selected');
            }
        });

        const correctOption = this.currentQuestion.options.find(opt => opt.correct);

        setTimeout(() => {
            buttons.forEach(button => {
                const id = button.getAttribute('data-option-id');
                const option = this.currentQuestion.options.find(opt => opt.id === id);
                if (option.correct) button.classList.add('correct');
                else if (id === optionId && !option.correct) button.classList.add('incorrect');
            });

            setTimeout(() => {
                this.completeQuestion(optionId === correctOption.id);
            }, 1500);
        }, 500);
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