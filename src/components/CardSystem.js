import { CardList } from './CardList.js';

export class CardSystem {
    constructor(socketClient, onCardSelectCallback) {
        this.socketClient = socketClient;
        this.onCardSelect = onCardSelectCallback;
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
      
        // Add animation effects
        this.dynamicCardContainer.querySelectorAll('.card').forEach(c => {
          c.classList.remove('selected', 'dimmed');
          if (c !== cardElement) c.classList.add('dimmed');
        });
        cardElement.classList.add('selected');
      
        // Send card selection to server
        if (this.socketClient && this.socketClient.selectCard) {
          this.socketClient.selectCard(cardType);
        }
      
        if (this.onCardSelect) {
          this.onCardSelect(cardType);
        }
    }  

    createCardElement(cardData, index = 0) {
        const cardElement = document.createElement('button');
        cardElement.className = 'card';
        cardElement.setAttribute('data-card-type', cardData.id);
        cardElement.style.setProperty('--i', index);

        cardElement.innerHTML = `
            <div class="card-title">
                <h1>${cardData.title}</h1>
            </div>
            <div class="card-description-container">
                ${cardData.descriptions.map(desc => `
                    <div class="card-description">
                        <div class="card-image ${desc.type}">
                            <img src="./assets/images/${desc.type}.png" alt="${desc.type}">
                        </div>
                        <div class="card-attribute">
                            <p>${desc.text}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        cardElement.addEventListener('click', (event) => this.handleCardSelection(event));
        return cardElement;
    }

    showCardSelection() {
        if (this.cardSelectionActive) return;

        // Get random cards
        this.currentCards = this.cardList.getRandomCards(3);

        // Clear previous cards
        this.dynamicCardContainer.innerHTML = '';

        // Create and append new cards
        this.currentCards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            this.dynamicCardContainer.appendChild(cardElement);
        });

        this.cardContainer.style.display = 'block';
        this.cardSelectionActive = true;
        this.startCardTimer();

        console.log("Cards shown:", this.currentCards.map(card => card.id));
    }

    // Add a method to get current cards for auto-selection
    getCurrentCards() {
        return this.currentCards || [];
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
                // Don't handle time expired here - main.js controls phase transitions
            }
        }, 1000);
    }
}