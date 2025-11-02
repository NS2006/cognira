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
        this.startCardTimer();

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

    startCardTimer() {
        let timeLeft = 10;
        this.timerCount.textContent = timeLeft;
        this.timerProgress.style.width = '100%';

        this.cardTimer = setInterval(() => {
            timeLeft--;
            this.timerCount.textContent = timeLeft;
            this.timerProgress.style.width = `${(timeLeft / 10) * 100}%`;

            if (timeLeft <= 0) {
                clearInterval(this.cardTimer);
            }
        }, 1000);
    }
}