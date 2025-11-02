import { CardEffects } from './CardEffect.js';
import { Card } from './Card.js';

const cardDefinition = {
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
            { type: 'positive', text: '+3 step' },
            { type: 'negative', text: '-3 step' }
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

export class CardList {
    constructor() {
        this.cards = this._initializeCards();
    }

    _initializeCards() {
        return Object.values(cardDefinition).map(cardDef => {
            let positiveEffect, negativeEffect;

            switch(cardDef.id) {
                case 'move_or_stop':
                    positiveEffect = CardEffects.moveOrStopPositive;
                    negativeEffect = CardEffects.moveOrStopNegative;
                    break;
                case 'step_modifier':
                    positiveEffect = CardEffects.stepModifierPositive;
                    negativeEffect = CardEffects.stepModifierNegative;
                    break;
                case 'random_bonus':
                    positiveEffect = CardEffects.randomBonusPositive;
                    negativeEffect = CardEffects.randomBonusNegative;
                    break;
            }

            return new Card(
                cardDef.id,
                cardDef.title,
                cardDef.descriptions,
                cardDef.weight,
                positiveEffect,
                negativeEffect
            );
        });
    }

    /** 
     * Get N random cards with weighting and without duplicates
     */
    getRandomCards(count = 3, currentCards = null) {
        const availableCards = currentCards ?? this.cards;
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

    // Helper method to get card by ID
    getCardById(id) {
        return this.cards.find(card => card.id === id);
    }
}