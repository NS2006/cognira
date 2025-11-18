export class Card {
    constructor(id, title, descriptions, weight, positiveEffect, negativeEffect) {
        this.id = id;
        this.title = title;
        this.descriptions = descriptions;
        this.weight = weight;
        this.positiveEffect = positiveEffect;
        this.negativeEffect = negativeEffect;
    }

    applyPositive(player) {
        return this.positiveEffect(player);
    }

    applyNegative(player) {
        return this.negativeEffect(player);
    }

    createCardElement(index = 0) {
        const cardElement = document.createElement('button');
        cardElement.className = 'card';
        cardElement.setAttribute('data-card-type', this.id);
        cardElement.style.setProperty('--i', index);

        cardElement.innerHTML = `
            <img 
                src="./assets/model/Cards/${this.file}.png" 
                alt="${this.id}" 
                class="card-image"
            >
        `;

        return cardElement;
    }
}