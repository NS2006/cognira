import { pauseWorld } from '../../../utilities/worldRelated.js';
import { QuestionList } from './QuestionList.js';
import { QUESTION_PHASE_TIME } from '../../../constants.js';

export class QuestionSystem {
    constructor(socketClient) {
        this.socketClient = socketClient;
        this.questionList = new QuestionList();

        // UI Elements
        this.questionContainer = document.getElementById('questionContainer');
        this.questionTimerProgress = document.getElementById('questionTimerProgress');
        this.questionTimerCount = document.getElementById('questionTimerCount');
        this.questionDescription = document.getElementById('questionDescription');
        this.questionImageContainer = document.getElementById('questionImageContainer');
        this.questionImage = document.getElementById('questionImage');
        this.questionOptions = document.getElementById('questionOptions');

        // State
        this.questionTimer = null;
        this.questionActive = false;
        this.currentQuestion = null;
        this.selectedAnswer = null;
        this.hasAnswered = false;

        // Use constants for timing
        this.QUESTION_TIME = QUESTION_PHASE_TIME * 1000; // Convert to milliseconds
    }

    showQuestion() {
        if (this.questionActive) return;
        
        this.currentQuestion = this.questionList.getRandomQuestion();
        this.selectedAnswer = null;
        this.hasAnswered = false;

        this.questionDescription.innerHTML = `
            <div class="question-type-label"><b>Type:</b> ${this.currentQuestion.type.charAt(0).toUpperCase() + this.currentQuestion.type.slice(1)}</div>
            <div class="question-text">${this.currentQuestion.description}</div>
        `;
        
        if (this.currentQuestion.image) {
            this.questionImage.src = this.currentQuestion.image;
            this.questionImageContainer.style.display = 'block';
        } else {
            this.questionImageContainer.style.display = 'none';
        }

        this.createAnswerButtons();
        this.questionContainer.style.display = 'block';
        this.questionActive = true;
        this.startQuestionTimer(this.QUESTION_TIME);
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
        if (!this.questionActive || this.hasAnswered) return;

        this.selectedAnswer = optionId;
        this.hasAnswered = true;
        
        const buttons = this.questionOptions.querySelectorAll('.question-option');
        buttons.forEach(button => {
            button.classList.remove('selected');
            if (button.getAttribute('data-option-id') === optionId) {
                button.classList.add('selected');
            }
        });

        const correctOption = this.currentQuestion.options.find(opt => opt.correct);

        // Show feedback immediately but don't complete the question yet
        buttons.forEach(button => {
            const id = button.getAttribute('data-option-id');
            const option = this.currentQuestion.options.find(opt => opt.id === id);
            if (option.correct) button.classList.add('correct');
            else if (id === optionId && !option.correct) button.classList.add('incorrect');
        });

        console.log(`✅ Answer selected: ${optionId}, waiting for timer to complete...`);
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
        // Determine if the answer was correct (if answered)
        let isCorrect = false;
        if (this.hasAnswered && this.selectedAnswer) {
            const correctOption = this.currentQuestion.options.find(opt => opt.correct);
            isCorrect = this.selectedAnswer === correctOption.id;
        }
        
        console.log(`⏰ Time expired. Answered: ${this.hasAnswered}, Correct: ${isCorrect}`);
        this.completeQuestion(isCorrect);
    }

    completeQuestion(isCorrect) {
        if (!this.questionActive) {
            console.log("⚠️ Question already completed, ignoring");
            return;
        }
        
        console.log(`🔄 [QuestionSystem] completeQuestion called with isCorrect: ${isCorrect}`);
        
        this.questionActive = false;
    
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
    
        this.questionContainer.style.display = 'none';
    
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
        this.hasAnswered = false;

        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
    }

    // Helper methods to access question list functionality
    getQuestionsByType(type) {
        return this.questionList.getQuestionsByType(type);
    }

    getQuestionById(id) {
        return this.questionList.getQuestionById(id);
    }
}