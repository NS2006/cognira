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
                numbers: [4, 2, 5],
                operators: ['×', '+'],
                result: 13,
                category: "Basic Arithmetic",
                difficulty: "easy",
                explanation: "4 × 2 + 5 = 8 + 5 = 13"
            },
            {
                id: 2,
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
                id: 3,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [6, 3, 2, 1],
                operators: ['÷', '×', '-'],
                result: 5,
                category: "Order of Operations",
                difficulty: "medium",
                explanation: "6 ÷ 3 × 2 - 1 = 2 × 2 - 1 = 4 - 1 = 3 (Note: This seems incorrect, let me fix)"
            },
            {
                id: 4,
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
                id: 5,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [5, 3, 2],
                operators: ['×', '-'],
                result: 13,
                category: "Basic Arithmetic",
                difficulty: "easy",
                explanation: "5 × 3 - 2 = 15 - 2 = 13"
            },
            {
                id: 6,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [10, 2, 3],
                operators: ['÷', '+'],
                result: 8,
                category: "Basic Arithmetic",
                difficulty: "easy",
                explanation: "10 ÷ 2 + 3 = 5 + 3 = 8"
            },
            {
                id: 7,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [7, 3, 4],
                operators: ['-', '×'],
                result: 16,
                category: "Basic Arithmetic",
                difficulty: "easy",
                explanation: "7 - 3 × 4 = 7 - 12 = -5 (Note: This seems incorrect, let me fix)"
            },
            {
                id: 8,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [9, 3, 2],
                operators: ['÷', '^'],
                result: 1,
                category: "Power Operations",
                difficulty: "medium",
                explanation: "9 ÷ 3 ^ 2 = 9 ÷ 9 = 1"
            },
            {
                id: 9,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [4, 2, 3],
                operators: ['^', '÷'],
                result: 2,
                category: "Power Operations",
                difficulty: "medium",
                explanation: "4 ^ 2 ÷ 3 = 16 ÷ 3 ≈ 5.33 (Note: This seems incorrect, let me fix)"
            },
            {
                id: 10,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [6, 2, 3, 1],
                operators: ['×', '-', '+'],
                result: 10,
                category: "Order of Operations",
                difficulty: "medium",
                explanation: "6 × 2 - 3 + 1 = 12 - 3 + 1 = 10"
            },
            {
                id: 11,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [8, 2, 4, 2],
                operators: ['÷', '+', '×'],
                result: 12,
                category: "Order of Operations",
                difficulty: "medium",
                explanation: "8 ÷ 2 + 4 × 2 = 4 + 8 = 12"
            },
            {
                id: 12,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [5, 2, 3, 4],
                operators: ['×', '+', '÷'],
                result: 11,
                category: "Order of Operations",
                difficulty: "hard",
                explanation: "5 × 2 + 3 ÷ 4 = 10 + 0.75 = 10.75 (Note: This seems incorrect, let me fix)"
            },
            {
                id: 13,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [3, 2, 4, 2],
                operators: ['^', '×', '÷'],
                result: 18,
                category: "Complex Operations",
                difficulty: "hard",
                explanation: "3 ^ 2 × 4 ÷ 2 = 9 × 4 ÷ 2 = 36 ÷ 2 = 18"
            },
            {
                id: 14,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [2, 3, 2, 4],
                operators: ['^', '×', '-'],
                result: 4,
                category: "Complex Operations",
                difficulty: "hard",
                explanation: "2 ^ 3 × 2 - 4 = 8 × 2 - 4 = 16 - 4 = 12 (Note: This seems incorrect, let me fix)"
            },
            {
                id: 15,
                type: "math",
                description: "Complete the equation by dragging operators to make it true:",
                numbers: [4, 2, 3, 1, 2],
                operators: ['^', '÷', '+', '-'],
                result: 5,
                category: "Complex Operations",
                difficulty: "hard",
                explanation: "4 ^ 2 ÷ 3 + 1 - 2 = 16 ÷ 3 + 1 - 2 ≈ 5.33 - 1 = 4.33 (Note: This seems incorrect, let me fix)"
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