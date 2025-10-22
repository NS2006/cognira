export class CardList {
    constructor() {
        this.cards = {
            'move_or_stop': {
                id: 'move_or_stop',
                title: 'Move or Stop',
                descriptions: [
                    { type: 'positive', text: 'Able to move if correct answer' },
                    { type: 'negative', text: 'Cannot move at all if wrong answer' }
                ],
                weight: 1
            },
            'step_modifier': {
                id: 'step_modifier',
                title: 'Step Modifier',
                descriptions: [
                    { type: 'positive', text: '+3 base step if correct answer' },
                    { type: 'negative', text: '-3 base step if wrong answer' }
                ],
                weight: 1
            }
        };
    }

    getRandomCards(count = 2) {
        const availableCards = Object.values(this.cards);
        const weightedCards = [];
        
        // Create weighted array based on card weights
        availableCards.forEach(card => {
            const occurrences = Math.ceil(card.weight * 10);
            for (let i = 0; i < occurrences; i++) {
                weightedCards.push(card);
            }
        });
        
        // Shuffle weighted array
        const shuffled = [...weightedCards].sort(() => Math.random() - 0.5);
        
        // Get unique cards
        const selectedCards = [];
        const usedIds = new Set();
        
        for (const card of shuffled) {
            if (!usedIds.has(card.id) && selectedCards.length < count) {
                selectedCards.push(card);
                usedIds.add(card.id);
            }
        }
        
        return selectedCards;
    }

    getCardById(cardId) {
        return this.cards[cardId];
    }

    getAllCards() {
        return Object.values(this.cards);
    }

    addCard(cardData) {
        this.cards[cardData.id] = {
            ...cardData,
            weight: cardData.weight || 1
        };
    }

    removeCard(cardId) {
        delete this.cards[cardId];
    }
}