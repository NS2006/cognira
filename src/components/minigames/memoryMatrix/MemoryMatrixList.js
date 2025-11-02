export class MemoryMatrixList {
    constructor() {
        this.matrixQuestions = this._initializeMatrixQuestions();
    }

    _initializeMatrixQuestions() {
        return [
            {
                id: 1,
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
                category: "Memory Pattern",
                difficulty: "easy"
            },
            {
                id: 2,
                type: "memory",
                description: "Memorize the 2×2 color pattern shown below:",
                matrix: [
                    ["#ff00ff", "#00ffff"],
                    ["#ff9900", "#99ff00"]
                ],
                options: [
                    { id: 'A', matrix: [["#ff00ff", "#00ffff"], ["#ff9900", "#99ff00"]], correct: true },
                    { id: 'B', matrix: [["#00ffff", "#ff00ff"], ["#ff9900", "#99ff00"]], correct: false },
                    { id: 'C', matrix: [["#ff00ff", "#ff9900"], ["#00ffff", "#99ff00"]], correct: false },
                    { id: 'D', matrix: [["#99ff00", "#ff00ff"], ["#00ffff", "#ff9900"]], correct: false }
                ],
                category: "Memory Pattern",
                difficulty: "easy"
            },
            {
                id: 3,
                type: "memory",
                description: "Memorize the 3×2 color pattern shown below:",
                matrix: [
                    ["#ff0000", "#00ff00", "#0000ff"],
                    ["#ffff00", "#ff00ff", "#00ffff"]
                ],
                options: [
                    { id: 'A', matrix: [["#ff0000", "#00ff00", "#0000ff"], ["#ffff00", "#ff00ff", "#00ffff"]], correct: true },
                    { id: 'B', matrix: [["#00ff00", "#ff0000", "#0000ff"], ["#ffff00", "#ff00ff", "#00ffff"]], correct: false },
                    { id: 'C', matrix: [["#ff0000", "#ffff00", "#0000ff"], ["#00ff00", "#ff00ff", "#00ffff"]], correct: false },
                    { id: 'D', matrix: [["#ff0000", "#00ff00", "#ff00ff"], ["#ffff00", "#0000ff", "#00ffff"]], correct: false }
                ],
                category: "Memory Pattern",
                difficulty: "medium"
            },
            {
                id: 4,
                type: "memory",
                description: "Memorize the 3×3 color pattern shown below:",
                matrix: [
                    ["#ff0000", "#00ff00", "#0000ff"],
                    ["#ffff00", "#ff00ff", "#00ffff"],
                    ["#800080", "#008080", "#808000"]
                ],
                options: [
                    { id: 'A', matrix: [["#ff0000", "#00ff00", "#0000ff"], ["#ffff00", "#ff00ff", "#00ffff"], ["#800080", "#008080", "#808000"]], correct: true },
                    { id: 'B', matrix: [["#00ff00", "#ff0000", "#0000ff"], ["#ffff00", "#ff00ff", "#00ffff"], ["#800080", "#008080", "#808000"]], correct: false },
                    { id: 'C', matrix: [["#ff0000", "#ffff00", "#00ff00"], ["#0000ff", "#ff00ff", "#00ffff"], ["#800080", "#008080", "#808000"]], correct: false },
                    { id: 'D', matrix: [["#ff0000", "#00ff00", "#ff00ff"], ["#ffff00", "#0000ff", "#00ffff"], ["#800080", "#008080", "#808000"]], correct: false }
                ],
                category: "Memory Pattern",
                difficulty: "hard"
            }
        ];
    }

    getRandomMatrixQuestion() {
        const randomIndex = Math.floor(Math.random() * this.matrixQuestions.length);
        return this.matrixQuestions[randomIndex];
    }

    getMatrixQuestionsByDifficulty(difficulty) {
        return this.matrixQuestions.filter(q => q.difficulty === difficulty);
    }

    getMatrixQuestionById(id) {
        return this.matrixQuestions.find(q => q.id === id);
    }

    getAllMatrixQuestions() {
        return this.matrixQuestions;
    }

    // Method to add matrix questions dynamically if needed
    addMatrixQuestion(question) {
        this.matrixQuestions.push(question);
    }
}