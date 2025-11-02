export class QuestionList {
    constructor() {
        this.questions = this._initializeQuestions();
    }

    _initializeQuestions() {
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
            }
        ];
    }

    getRandomQuestion() {
        const types = ['logic', 'spatial'];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        const filteredQuestions = this.questions.filter(q => q.type === chosenType);
        
        if (filteredQuestions.length === 0) {
            // Fallback to any question if no questions of chosen type
            return this.questions[Math.floor(Math.random() * this.questions.length)];
        }
        
        const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
        return filteredQuestions[randomIndex];
    }

    getQuestionsByType(type) {
        return this.questions.filter(q => q.type === type);
    }

    getQuestionById(id) {
        return this.questions.find(q => q.id === id);
    }

    getAllQuestions() {
        return this.questions;
    }

    // Method to add questions dynamically if needed
    addQuestion(question) {
        this.questions.push(question);
    }
}