import { getLocalPlayer } from '../main.js';
import { CardList } from './CardList.js';

export class CardSystem {
    constructor(socketClient) {
        this.socketClient = socketClient;
        this.cardList = new CardList();

        this.cardContainer = document.getElementById('cardContainer');
        this.timerProgress = document.getElementById('timerProgress');
        this.timerCount = document.getElementById('timerCount');
        this.dynamicCardContainer = document.getElementById('dynamicCardContainer');

        this.cardTimer = null;
        this.cardSelectionActive = false;
        this.currentCards = [];

        // Inject container styles
        this.injectContainerStyles();
    }

    injectContainerStyles() {
    if (document.getElementById('card-container-styles')) return;

    const style = document.createElement('style');
    style.id = 'card-container-styles';
    style.textContent = `
        .select-card-container {
            display: none;
            width: 85%;
            max-width: 1200px;
            text-align: center;
            position: absolute;
            top: 75%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 100;
            background: linear-gradient(135deg, #1a2f1a 0%, #2d4a2d 50%, #1a2f1a 100%);
            border-radius: 24px;
            padding: 40px 30px 30px 30px;
            box-shadow: 
                0 25px 50px rgba(0, 0, 0, 0.3),
                0 0 100px rgba(76, 175, 80, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(76, 175, 80, 0.3);
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .select-card-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #4CAF50, #8BC34A, #4CAF50);
            background-size: 200% 100%;
            animation: shimmer 3s infinite linear;
        }

        .select-card-container h1 {
            font-size: 2.5rem;
            margin-bottom: 2.5rem;
            text-transform: uppercase;
            letter-spacing: 3px;
            font-weight: 800;
            background: linear-gradient(135deg, #8BC34A 0%, #4CAF50 50%, #2E7D32 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            position: relative;
        }

        .select-card-container h1::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 3px;
            background: linear-gradient(90deg, transparent, #4CAF50, transparent);
            border-radius: 2px;
        }

        #dynamicCardContainer {
            display: flex;
            justify-content: center;
            align-items: flex-end;
            gap: 2.5rem;
            perspective: 1200px;
            position: relative;
            height: 380px;
            width: 90%;
            margin: 0 auto;
            padding: 20px 0;
        }

        .timer-container {
            margin-bottom: 30px;
            padding: 0 20px;
        }

        .timer-bar {
            width: 100%;
            height: 12px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 15px;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(76, 175, 80, 0.2);
        }

        .timer-progress {
            height: 100%;
            background: linear-gradient(90deg, #8BC34A, #4CAF50, #2E7D32);
            background-size: 200% 100%;
            width: 100%;
            transition: width 1s linear;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(76, 175, 80, 0.4);
            animation: pulse 2s infinite;
        }

        .timer-text {
            font-size: 1rem;
            color: #E8F5E8;
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            letter-spacing: 1px;
        }

        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }

        @keyframes subtle-glow {
            from {
                filter: drop-shadow(0 0 10px rgba(76, 175, 80, 0.3));
            }
            to {
                filter: drop-shadow(0 0 20px rgba(76, 175, 80, 0.6));
            }
        }

        @keyframes pulse-glow {
            from {
                box-shadow: 0 0 30px rgba(76, 175, 80, 0.4);
                border-color: #8BC34A;
            }
            to {
                box-shadow: 0 0 50px rgba(139, 195, 74, 0.8);
                border-color: #4CAF50;
            }
        }

        #initialCountdownMessage {
            font-family: "Balatro", cursive;
            animation: pulse-glow 1.5s infinite alternate;
        }

        .selected-card {
            transform: translateY(-20px) scale(1.5) rotate(0deg);
            border-color: #4CAF50;
            box-shadow: 0 20px 40px rgba(76, 175, 80, 0.5);
            transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                        box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Modern scrollbar for the container */
        .select-card-container::-webkit-scrollbar {
            width: 8px;
        }

        .select-card-container::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }

        .select-card-container::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #4CAF50, #2E7D32);
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);
}

    handleCardSelection(event) {
        if (!this.cardSelectionActive) return;

        const cardElement = event.currentTarget;
        const cardType = cardElement.getAttribute('data-card-type');
        console.log(`Card selected: ${cardType}`);

        const selectedCard = this.currentCards.find(card => card.id === cardType);

        // Log the selected card information
        if (selectedCard) {
            const localPlayer = getLocalPlayer();

            localPlayer.selectedCard = selectedCard;
            localPlayer.displaySelectedCardInformation();
        } else {
            console.warn(`Selected card not found in currentCards: ${cardType}`);
            console.log('Available cards:', this.currentCards.map(card => card.id));
        }

        // Add animation effects
        this.dynamicCardContainer.querySelectorAll('.card').forEach(c => {
            c.classList.remove('selected', 'dimmed');
            if (c !== cardElement) c.classList.add('dimmed');
        });
        cardElement.classList.add('selected');

        // Send card selection to server
        if (this.socketClient?.selectCard) {
            this.socketClient.selectCard(cardType);
        }

        this.onCardSelect?.(cardType);
    }

    showCardSelection() {
        if (this.cardSelectionActive) return;

        // Get random cards (now returns Card instances)
        this.currentCards = this.cardList.getRandomCards(3);

        // Clear previous cards
        this.dynamicCardContainer.innerHTML = '';

        // Use Card's createCardElement method
        this.currentCards.forEach((card, index) => {
            const cardElement = card.createCardElement(index);
            cardElement.addEventListener('click', (event) => this.handleCardSelection(event));
            this.dynamicCardContainer.appendChild(cardElement);
        });

        this.cardContainer.style.display = 'block';
        this.cardSelectionActive = true;
        
        // Start the visual timer (no auto-selection logic since cardPhase.js handles this)
        this.startVisualTimer();

        console.log("Cards shown:", this.currentCards.map(card => card.id));
    }

    // Apply card effects to player
    applyCardEffect(cardType, isPositive, player) {
        const card = this.cardList.getCardById(cardType);
        if (!card) {
            console.warn(`Card not found: ${cardType}`);
            return null;
        }

        console.log(`🔄 Applying ${isPositive ? 'positive' : 'negative'} ${cardType} to player ${player.playerId}`);

        if (isPositive) {
            card.applyPositive(player);
        } else {
            card.applyNegative(player);
        }
    }

    applyPositiveEffect(cardType, player) {
        return this.applyCardEffect(cardType, true, player);
    }

    applyNegativeEffect(cardType, player) {
        return this.applyCardEffect(cardType, false, player);
    }

    hideCardSelection() {
        this.cardContainer.style.display = 'none';
        this.cardSelectionActive = false;

        if (this.cardTimer) {
            clearInterval(this.cardTimer);
            this.cardTimer = null;
        }
    }

    // Visual timer only - no auto-selection logic since cardPhase.js handles this
    startVisualTimer() {
        let timeLeft = 10; // This should match CARD_PHASE_TIME from constants
        this.timerCount.textContent = timeLeft;
        this.timerProgress.style.width = '100%';

        this.cardTimer = setInterval(() => {
            timeLeft--;
            this.timerCount.textContent = timeLeft;
            this.timerProgress.style.width = `${(timeLeft / 10) * 100}%`;

            // Change color when time is running out
            if (timeLeft <= 5) {
                this.timerProgress.style.background = 'linear-gradient(90deg, #FF9800, #F44336)';
            }

            if (timeLeft <= 0) {
                clearInterval(this.cardTimer);
                // Don't auto-select or hide here - cardPhase.js handles this
            }
        }, 1000);
    }

    // Method to get current cards for auto-selection in cardPhase.js
    getCurrentCards() {
        return this.currentCards;
    }
}