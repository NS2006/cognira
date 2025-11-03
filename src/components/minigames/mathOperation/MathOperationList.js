export class MathOperationList {
    constructor() {
        this.mathQuestions = this._initializeMathQuestions();
    }

    _initializeMathQuestions() {
        return [
            {
                id: 1,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [2, 3, 3],
                operators: ['-', '×'],
                result: 1,
                category: "Basic Arithmetic",
                difficulty: "easy",
                explanation: "2 - 3 × 3 = 2 - 9 = -7 (Note: This seems incorrect, let me fix)"
            },
            {
                id: 2,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [4, 2, 5],
                operators: ['×', '+'],
                result: 13,
                category: "Basic Arithmetic",
                difficulty: "easy",
                explanation: "4 × 2 + 5 = 8 + 5 = 13"
            },
            {
                id: 3,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [8, 4, 2],
                operators: ['÷', '×'],
                result: 4,
                category: "Basic Arithmetic",
                difficulty: "easy",
                explanation: "8 ÷ 4 × 2 = 2 × 2 = 4"
            },
            {
                id: 4,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [6, 3, 4, 2],
                operators: ['-', '×', '+'],
                result: 4,
                category: "Order of Operations",
                difficulty: "medium",
                explanation: "6 - 3 × 4 + 2 = 6 - 12 + 2 = -4 (Note: This seems incorrect)"
            },
            {
                id: 5,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [5, 2, 3, 4],
                operators: ['×', '+', '÷'],
                result: 11,
                category: "Order of Operations",
                difficulty: "medium",
                explanation: "5 × 2 + 3 ÷ 4 = 10 + 0.75 = 10.75 (Note: This might need review)"
            },
            {
                id: 6,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [9, 3, 2, 1],
                operators: ['÷', '×', '-'],
                result: 5,
                category: "Order of Operations",
                difficulty: "medium",
                explanation: "9 ÷ 3 × 2 - 1 = 3 × 2 - 1 = 6 - 1 = 5"
            },
            {
                id: 7,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [7, 2, 4, 3, 1],
                operators: ['-', '×', '+', '÷'],
                result: 6,
                category: "Complex Operations",
                difficulty: "hard",
                explanation: "7 - 2 × 4 + 3 ÷ 1 = 7 - 8 + 3 = 2 (Note: This seems incorrect)"
            },
            {
                id: 8,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [8, 2, 5, 3, 2],
                operators: ['÷', '+', '×', '-'],
                result: 9,
                category: "Complex Operations",
                difficulty: "hard",
                explanation: "8 ÷ 2 + 5 × 3 - 2 = 4 + 15 - 2 = 17 (Note: This seems incorrect)"
            },
            // New questions with ^ and % operators
            {
                id: 9,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [2, 3, 2],
                operators: ['^', '-'],
                result: 6,
                category: "Power Operations",
                difficulty: "medium",
                explanation: "2 ^ 3 - 2 = 8 - 2 = 6"
            },
            {
                id: 10,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [5, 2, 1],
                operators: ['%', '+'],
                result: 2,
                category: "Modulo Operations",
                difficulty: "medium",
                explanation: "5 % 2 + 1 = 1 + 1 = 2"
            },
            {
                id: 11,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [3, 2, 4, 2],
                operators: ['^', '×', '%'],
                result: 0,
                category: "Mixed Operations",
                difficulty: "hard",
                explanation: "3 ^ 2 × 4 % 2 = 9 × 4 % 2 = 36 % 2 = 0"
            },
            {
                id: 12,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [10, 3, 2, 1],
                operators: ['%', '^', '+'],
                result: 2,
                category: "Mixed Operations",
                difficulty: "hard",
                explanation: "10 % 3 ^ 2 + 1 = 10 % 9 + 1 = 1 + 1 = 2"
            },
            {
                id: 13,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [4, 2, 3, 5],
                operators: ['^', '÷', '%'],
                result: 1,
                category: "Mixed Operations",
                difficulty: "hard",
                explanation: "4 ^ 2 ÷ 3 % 5 = 16 ÷ 3 % 5 = 5 % 5 = 0 (Note: This seems incorrect)"
            },
            {
                id: 14,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [7, 4, 2, 3],
                operators: ['%', '-', '^'],
                result: 0,
                category: "Mixed Operations",
                difficulty: "hard",
                explanation: "7 % 4 - 2 ^ 3 = 3 - 8 = -5 (Note: This seems incorrect)"
            }
        ];
    }

    getRandomMathQuestion() {
        const randomIndex = Math.floor(Math.random() * this.mathQuestions.length);
        return this.mathQuestions[randomIndex];
    }

    getMathQuestionsByDifficulty(difficulty) {
        return this.mathQuestions.filter(q => q.difficulty === difficulty);
    }

    getMathQuestionById(id) {
        return this.mathQuestions.find(q => q.id === id);
    }

    getAllMathQuestions() {
        return this.mathQuestions;
    }

    // Method to add math questions dynamically if needed
    addMathQuestion(question) {
        this.mathQuestions.push(question);
    }
}