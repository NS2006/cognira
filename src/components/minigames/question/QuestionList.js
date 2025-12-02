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
                    { id: 'A', text: "5 3 1", correct: false },
                    { id: 'B', text: "5 2 1", correct: false },
                    { id: 'C', text: "6 1 2", correct: true },
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
                    { id: 'A', text: "7", correct: false },
                    { id: 'B', text: "1", correct: false },
                    { id: 'C', text: "9", correct: false },
                    { id: 'D', text: "3", correct: true }
                ],
                category: "Numeric Logic"
            },
            {
                id: 3,
                type: "logic",
                description: "NS, JPP, FL, TS, and KF compete in a running race. The current position is NS, JPP, TS, KF, and FL, so NS is the nearest to the finish line. After 3 seconds, KF gets ahead of TS. At the same time, JPP gets ahead of NS. At the last 4 seconds, FL finally gets ahead of NS. Now, who is at the third position?",
                image: null,
                options: [
                    { id: 'A', text: "JPP", correct: false },
                    { id: 'B', text: "NS", correct: true },
                    { id: 'C', text: "KF", correct: false },
                    { id: 'D', text: "TS", correct: false }
                ],
                category: "Numeric Logic"
            },
            {
                id: 4,
                type: "logic",
                description: "&nbsp;&nbsp;&nbsp; S S <br> &nbsp;&nbsp;&nbsp; S S <br> _______ + <br> &nbsp; H S U <br><br>What is H S U?",
                image: null,
                options: [
                    { id: 'A', text: "9 8 1", correct: false },
                    { id: 'B', text: "4 8 2", correct: false },
                    { id: 'C', text: "1 5 1", correct: false },
                    { id: 'D', text: "1 9 8", correct: true }
                ],
                category: "Numeric Logic"
            },
            {
                id: 5,
                type: "logic",
                description: "&nbsp;&nbsp; A D A <br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; D I <br> _______ + <br> &nbsp; D I A<br><br>What is A D I?",
                image: null,
                options: [
                    { id: 'A', text: "4 5 1", correct: false },
                    { id: 'B', text: "5 4 1", correct: false },
                    { id: 'C', text: "4 5 0", correct: true },
                    { id: 'D', text: "5 2 4", correct: false }
                ],
                category: "Numeric Logic"
            },
            {
                id: 6,
                type: "logic",
                description: "&nbsp;&nbsp;&nbsp; I I <br> &nbsp;&nbsp;&nbsp; I I <br> _______ + <br> &nbsp; S I A<br><br>What is S I A?",
                image: null,
                options: [
                    { id: 'A', text: "1 9 8", correct: true },
                    { id: 'B', text: "1 8 1", correct: false },
                    { id: 'C', text: "1 9 9", correct: false },
                    { id: 'D', text: "1 7 8", correct: false }
                ],
                category: "Numeric Logic"
            },
            {
                id: 7,
                type: "logic",
                description: "If 12 → 21, 34 → 43, 56 → 65, then 89 → ?",
                image: null,
                options: [
                    { id: 'A', text: "97", correct: false },
                    { id: 'B', text: "98", correct: true },
                    { id: 'C', text: "89", correct: false },
                    { id: 'D', text: "90", correct: false }
                ],
                category: "Numeric Logic"
            },
            {
                id: 8,
                type: "logic",
                description: "What is the missing number?<br><br>2 → 4<br>3 → 9<br>4 → 16<br>5 → ?",
                image: null,
                options: [
                    { id: 'A', text: "25", correct: true },
                    { id: 'B', text: "20", correct: false },
                    { id: 'C', text: "15", correct: false },
                    { id: 'D', text: "30", correct: false }
                ],
                category: "Numeric Logic"
            },
            {
                id: 9,
                type: "logic",
                description: "Which number completes the pattern?<br><br>7, 10, 15, 22, 31, ?",
                image: null,
                options: [
                    { id: 'A', text: "44", correct: false },
                    { id: 'B', text: "40", correct: false },
                    { id: 'C', text: "38", correct: false },
                    { id: 'D', text: "42", correct: true }
                ],
                category: "Numeric Logic"
            },
            {
                id: 10,
                type: "logic",
                description: "A box contains red, blue, and green marbles. If 2 blue marbles are removed, the number of blue marbles becomes equal to the number of red marbles. What happens if 1 additional red marble is also removed?",
                image: null,
                options: [
                    { id: 'A', text: "Red = Blue", correct: false },
                    { id: 'B', text: "Red > Blue", correct: false },
                    { id: 'C', text: "Blue > Red", correct: true },
                    { id: 'D', text: "Impossible to determine", correct: false }
                ],
                category: "Logic Reasoning"
            },
            {
                id: 11,
                type: "logic",
                description: "In a race, A is ahead of B. C is behind B. D is ahead of C but behind A. Who is in the 2nd position?",
                image: null,
                options: [
                    { id: 'A', text: "C", correct: false },
                    { id: 'B', text: "A", correct: false },
                    { id: 'C', text: "B", correct: false },
                    { id: 'D', text: "D", correct: true }
                ],
                category: "Logic Reasoning"
            },
            {
                id: 12,
                type: "logic",
                description: "Find the missing number:<br><br>14 → 5<br>25 → 7<br>36 → 9<br>49 → ?",
                image: null,
                options: [
                    { id: 'A', text: "11", correct: true },
                    { id: 'B', text: "12", correct: false },
                    { id: 'C', text: "13", correct: false },
                    { id: 'D', text: "10", correct: false }
                ],
                category: "Numeric Logic"
            },
            {
                id: 13,
                type: "logic",
                description: "If A = 1, B = 2, C = 3, ..., Z = 26, what is the value of DOG?",
                image: null,
                options: [
                    { id: 'A', text: "4168", correct: false },
                    { id: 'B', text: "4167", correct: false },
                    { id: 'C', text: "4157", correct: true },
                    { id: 'D', text: "4158", correct: false }
                ],
                category: "Logic Puzzle"
            },
            {
                id: 14,
                type: "logic",
                description: "Which number should replace the question mark?<br><br>3, 6, 12, 24, ?",
                image: null,
                options: [
                    { id: 'A', text: "48", correct: true },
                    { id: 'B', text: "52", correct: false },
                    { id: 'C', text: "36", correct: false },
                    { id: 'D', text: "60", correct: false }
                ],
                category: "Numeric Logic"
            },
            {
                id: 15,
                type: "logic",
                description: "If 2 cats catch 2 mice in 2 minutes, how long will 6 cats take to catch 6 mice?",
                image: null,
                options: [
                    { id: 'A', text: "6 minutes", correct: false },
                    { id: 'B', text: "4 minutes", correct: false },
                    { id: 'C', text: "1 minute", correct: false },
                    { id: 'D', text: "2 minutes", correct: true }
                ],
                category: "Logic Reasoning"
            },
            {
                id: 16,
                type: "logic",
                description: "What is the next number?<br><br>1, 4, 9, 16, 25, ?",
                image: null,
                options: [
                    { id: 'A', text: "36", correct: true },
                    { id: 'B', text: "30", correct: false },
                    { id: 'C', text: "28", correct: false },
                    { id: 'D', text: "32", correct: false }
                ],
                category: "Numeric Logic"
            },
            {
                id: 17,
                type: "logic",
                description: "Find the missing number:<br><br>5 → 12<br>7 → 20<br>9 → 30<br>11 → ?",
                image: null,
                options: [
                    { id: 'A', text: "44", correct: false },
                    { id: 'B', text: "42", correct: true },
                    { id: 'C', text: "40", correct: false },
                    { id: 'D', text: "36", correct: false }
                ],
                category: "Numeric Logic"
            },
            {
                id: 18,
                type: "logic",
                description: "Which number completes the sequence?<br><br>2, 5, 11, 23, 47, ?",
                image: null,
                options: [
                    { id: 'A', text: "98", correct: false },
                    { id: 'B', text: "90", correct: false },
                    { id: 'C', text: "93", correct: false },
                    { id: 'D', text: "95", correct: true }
                ],
                category: "Numeric Logic"
            },
            {
                id: 19,
                type: "logic",
                description: "A number increases by 20%, and then decreases by 20%. What is the overall result?",
                image: null,
                options: [
                    { id: 'A', text: "It becomes larger", correct: false },
                    { id: 'B', text: "It returns to the original", correct: false },
                    { id: 'C', text: "It becomes smaller than the original", correct: true },
                    { id: 'D', text: "Impossible to determine", correct: false }
                ],
                category: "Logic Reasoning"
            },
            {
                id: 20,
                type: "logic",
                description: "Which number replaces the question mark?<br><br>8, 16, 24, 32, ?, 48",
                image: null,
                options: [
                    { id: 'A', text: "44", correct: false },
                    { id: 'B', text: "36", correct: false },
                    { id: 'C', text: "40", correct: true },
                    { id: 'D', text: "52", correct: false }
                ],
                category: "Numeric Logic"
            },
            {
                id: 21,
                type: "logic",
                description: "A, B, C, and D are in a line. A is not first. B is immediately behind A. C is ahead of D but not first. Who is in the first position?",
                image: null,
                options: [
                    { id: 'A', text: "A", correct: false },
                    { id: 'B', text: "B", correct: false },
                    { id: 'C', text: "C", correct: true },
                    { id: 'D', text: "D", correct: false }
                ],
                category: "Logic Reasoning"
            },
            {
                id: 22,
                type: "logic",
                description: "What is the missing number?<br><br>3 → 6<br>4 → 12<br>5 → 20<br>6 → ?",
                image: null,
                options: [
                    { id: 'A', text: "28", correct: false },
                    { id: 'B', text: "32", correct: false },
                    { id: 'C', text: "30", correct: true },
                    { id: 'D', text: "24", correct: false }
                ],
                category: "Numeric Logic"
            },
            {
                id: 23,
                type: "logic",
                description: "If 4 × 6 = 52, 5 × 3 = 28, and 2 × 8 = 40, then 7 × 4 = ?",
                image: null,
                options: [
                    { id: 'A', text: "33", correct: true },
                    { id: 'B', text: "28", correct: false },
                    { id: 'C', text: "30", correct: false },
                    { id: 'D', text: "35", correct: false }
                ],
                category: "Logic Puzzle"
            },
            {
                id: 24,
                type: "logic",
                description: "Which number comes next?<br><br>1, 2, 4, 7, 11, 16, ?",
                image: null,
                options: [
                    { id: 'A', text: "20", correct: false },
                    { id: 'B', text: "22", correct: true },
                    { id: 'C', text: "24", correct: false },
                    { id: 'D', text: "19", correct: false }
                ],
                category: "Numeric Logic"
            },
            {
                id: 25,
                type: "logic",
                description: "If TODAY = 65, TIME = 52, and YEAR = 56, what is DAY?",
                image: null,
                options: [
                    { id: 'A', text: "28", correct: false },
                    { id: 'B', text: "30", correct: true },
                    { id: 'C', text: "26", correct: false },
                    { id: 'D', text: "32", correct: false }
                ],
                category: "Word Logic"
            },
            {
                id: 26,
                type: "logic",
                description: "A car travels 60 km in 1 hour. How far will it travel in 2.5 hours at the same speed?",
                image: null,
                options: [
                    { id: 'A', text: "180 km", correct: false },
                    { id: 'B', text: "120 km", correct: false },
                    { id: 'C', text: "150 km", correct: true },
                    { id: 'D', text: "140 km", correct: false }
                ],
                category: "Logic Reasoning"
            }
        ];
    }

    getRandomQuestion() {
        const types = ['logic'];
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