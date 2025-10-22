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
        this.QUESTION_TIME = 15000; // 15 seconds
    }

    // Sample questions database
    getQuestionBank() {
        return [
            {
                id: 1,
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
        const randomIndex = Math.floor(Math.random() * questions.length);
        return questions[randomIndex];
    }

    showQuestion() {
        if (this.questionActive) return;

        this.currentQuestion = this.getRandomQuestion();
        this.selectedAnswer = null;

        // Update question content
        this.questionDescription.innerHTML = this.currentQuestion.description;

        // Handle image (if any)
        if (this.currentQuestion.image) {
            this.questionImage.src = this.currentQuestion.image;
            this.questionImageContainer.style.display = 'block';
        } else {
            this.questionImageContainer.style.display = 'none';
        }

        // Create answer buttons
        this.createAnswerButtons();

        // Show question container
        this.questionContainer.style.display = 'block';
        this.questionActive = true;

        // Start timer
        this.startQuestionTimer();
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

    isAnswerCorrect(selectedAnswer) {
        if (!this.currentQuestion || !selectedAnswer) return false;

        const correctOption = this.currentQuestion.options.find(opt => opt.correct);
        return correctOption && selectedAnswer === correctOption.id;
    }

    handleAnswerSelection(optionId) {
        if (!this.questionActive || this.selectedAnswer !== null) return;

        this.selectedAnswer = optionId;

        // Highlight selected answer
        const buttons = this.questionOptions.querySelectorAll('.question-option');
        buttons.forEach(button => {
            button.classList.remove('selected');
            if (button.getAttribute('data-option-id') === optionId) {
                button.classList.add('selected');
            }
        });

        // Find the correct answer
        const correctOption = this.currentQuestion.options.find(opt => opt.correct);

        // Show correct/incorrect styling after a brief delay
        setTimeout(() => {
            buttons.forEach(button => {
                const buttonOptionId = button.getAttribute('data-option-id');
                const option = this.currentQuestion.options.find(opt => opt.id === buttonOptionId);

                if (option.correct) {
                    button.classList.add('correct');
                } else if (buttonOptionId === optionId && !option.correct) {
                    button.classList.add('incorrect');
                }
            });

            // Complete the question after showing results
            setTimeout(() => {
                this.completeQuestion(optionId === correctOption.id);
            }, 1500);
        }, 500);
    }

    startQuestionTimer() {
        let timeLeft = 15;
        this.questionTimerCount.textContent = timeLeft;
        this.questionTimerProgress.style.width = '100%';

        this.questionTimer = setInterval(() => {
            timeLeft--;
            this.questionTimerCount.textContent = timeLeft;
            this.questionTimerProgress.style.width = `${(timeLeft / 15) * 100}%`;

            if (timeLeft <= 0) {
                clearInterval(this.questionTimer);
                this.handleQuestionTimeExpired();
            }
        }, 1000);
    }

    handleQuestionTimeExpired() {
        console.log("Question time expired!");

        // Auto-select no answer (failed)
        this.selectedAnswer = null;
        this.completeQuestion(false);
    }

    completeQuestion(isCorrect) {
        this.questionActive = false;

        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }

        // Hide question after a delay to show results
        setTimeout(() => {
            this.questionContainer.style.display = 'none';

            // Notify main.js about question completion
            if (this.onQuestionComplete) {
                this.onQuestionComplete(isCorrect, this.selectedAnswer);
            }
        }, 1000);
    }

    hideQuestion() {
        this.questionContainer.style.display = 'none';
        this.questionActive = false;

        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
    }
}