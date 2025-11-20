import { CardEffects } from './CardEffect.js';
import { Card } from './Card.js';

// const cardDefinition = {
//     move_or_stop: {
//         id: 'move_or_stop',
//         title: 'Move or Stop',
//         descriptions: [
//             { type: 'positive', text: 'Able to move' },
//             { type: 'negative', text: 'Cannot move' }
//         ],
//         weight: 1
//     },
//     step_modifier: {
//         id: 'step_modifier',
//         title: 'Step Modifier',
//         descriptions: [
//             { type: 'positive', text: '+3 step' },
//             { type: 'negative', text: '-3 step' }
//         ],
//         weight: 1
//     },
//     random_bonus: {
//         id: 'random_bonus',
//         title: 'Random Bonus',
//         descriptions: [
//             { type: 'positive', text: '+1 random effect' },
//             { type: 'negative', text: 'No effect this round' }
//         ],
//         weight: 0.8
//     }
// }; 

const cardDefinition = {
// bad_monkey: {
//     id: 'bad_monkey',
//     file: 'Bad Monkey',
//     positive: { type: 'value', amount: 6 },          // +6
//     negative: { type: 'stop_all' } // stop all
// },
    // bad_monkey: {
    //     id: 'bad_monkey',
    //     file: 'Bad Monkey',
    //     positive: { type: 'value', amount: 6 },          // +6
    //     negative: { type: 'stop' } // stop
    // },
    bear: {
        id: 'bear',
        file: 'Bear',
        positive: { type: 'value', amount: 4 },     // +4
        negative: { type: 'value', amount: -7 }      // -7
    },
    chicken: {
        id: 'chicken',
        file: 'Chicken',
        positive: { type: 'multiplier', amount: 2 }, // x2
        negative: { type: 'none' }
    },
    falcon: {
        id: 'falcon',
        file: 'Falcon',
        positive: { type: 'multiplier', amount: 1.5 }, // 1.5×
        negative: { type: 'value', amount: -15 }
    },
    monkey: {
        id: 'monkey',
        file: 'Monkey',
        positive: { type: 'value', amount: 3 },
        negative: { type: 'value', amount: -3 }
    },
    mouse: {
        id: 'mouse',
        file: 'Mouse',
        positive: { type: 'immune' },
        negative: { type: 'none' }
    },
    // pig: {
    //     id: 'pig',
    //     file: 'Pig',
    //     positive: { type: 'multiplier', amount: 2 },
    //     negative: { type: 'stop' }
    // },
    raven: {
        id: 'raven',
        file: 'Raven',
        positive: { type: 'value', amount: 11 },
        negative: { type: 'none' }
    },
    snake: {
        id: 'snake',
        file: 'Snake',
        positive: { type: 'value', amount: 13 },
        negative: { type: 'value', amount: -10 }
    },
    tiger: {
        id: 'tiger',
        file: 'Tiger',
        positive: { type: 'value', amount: 8 },
        negative: { type: 'none' }
    }
};

// Helper to map effect descriptor to function
function mapEffectDescriptorToFunction(effectDesc) {
    if (!effectDesc || !effectDesc.type) return CardEffects.none;

    switch (effectDesc.type) {
        case 'value':
            return (player) => CardEffects.value(player, effectDesc.amount);
        case 'multiplier':
            return (player) => CardEffects.multiplier(player, effectDesc.amount);
        // case 'move':
        //     return (player) => CardEffects.move(player);
        case 'stop':
            return (player) => CardEffects.stop(player);
        // case 'stop_all':
        //     // Needs access to all players; here, just log or no-op
        //     return (player, players) => CardEffects.stopAll(players || [player]);
        case 'immune':
            return (player) => CardEffects.immune(player);
        // case 'steal':
        //     // Placeholder: needs target and amount
        //     return (player, target) => CardEffects.steal(player, target, effectDesc.amount);
        case 'none':
        default:
            return () => CardEffects.none();
    }
}

export class CardList {
    constructor() {
        this.cards = this._initializeCards();
    }

    _initializeCards() {
        return Object.values(cardDefinition).map(cardDef => {
            // Map effect descriptors to functions
            const positiveEffect = mapEffectDescriptorToFunction(cardDef.positive, true);
            const negativeEffect = mapEffectDescriptorToFunction(cardDef.negative, false);

            // Provide file property to Card for image rendering
            const card = new Card(
                cardDef.id,
                cardDef.title || cardDef.id, // fallback to id if no title
                cardDef.weight || 1,
                cardDef.file,
                {positive: cardDef.positive, negative: cardDef.negative},
                positiveEffect,
                negativeEffect
            );
            return card;
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