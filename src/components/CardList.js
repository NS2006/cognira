export class CardList {
    constructor() {
        this.cards = {
            move_or_stop: {
                id: 'move_or_stop',
                title: 'Move or Stop',
                descriptions: [
                    { type: 'positive', text: 'Able to move' },
                    { type: 'negative', text: 'Cannot move' }
                ],
                weight: 1
            },
            step_modifier: {
                id: 'step_modifier',
                title: 'Step Modifier',
                descriptions: [
                    { type: 'positive', text: '+3 base step' },
                    { type: 'negative', text: '-3 base step' }
                ],
                weight: 1
            },
            random_bonus: {
                id: 'random_bonus',
                title: 'Random Bonus',
                descriptions: [
                    { type: 'positive', text: '+1 random effect' },
                    { type: 'negative', text: 'No effect this round' }
                ],
                weight: 0.8
            }
        };
    }

    /** 
     * Get N random cards with weighting and without duplicates
     */
    getRandomCards(count = 3) {
        const availableCards = Object.values(this.cards);
        const weightedCards = [];

        // Create a weighted pool
        availableCards.forEach(card => {
            const occurrences = Math.ceil(card.weight * 10);
            for (let i = 0; i < occurrences; i++) {
                weightedCards.push(card);
            }
        });

        // Shuffle
        const shuffled = weightedCards.sort(() => Math.random() - 0.5);

        // Pick unique ones
        const selected = [];
        const used = new Set();

        for (const card of shuffled) {
            if (!used.has(card.id) && selected.length < count) {
                selected.push(card);
                used.add(card.id);
            }
        }

        return selected;
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
