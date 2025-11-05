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
        <div class="card-glow"></div>
        <div class="card-header">
            <div class="card-corner top-left"></div>
            <div class="card-corner top-right"></div>
            <div class="card-title">
                <h1>${this.title}</h1>
            </div>
            <div class="card-corner bottom-left"></div>
            <div class="card-corner bottom-right"></div>
        </div>
        <div class="card-description-container">
            ${this.descriptions.map(desc => `
                <div class="card-description">
                    <div class="card-icon ${desc.type}">
                        <div class="icon-bg"></div>
                        <img src="./assets/images/${desc.type}.png" alt="${desc.type}">
                    </div>
                    <div class="card-attribute">
                        <p>${desc.text}</p>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="card-footer">
            <div class="card-weight">Weight: ${this.weight}</div>
        </div>
    `;

        // Apply modern card styling
        cardElement.style.cssText = `
        width: 300px;
        height: 360px;
        background: linear-gradient(145deg, #1a2f1a 0%, #2d4a2d 100%);
        box-shadow: 
            0 15px 35px rgba(0, 0, 0, 0.4),
            0 0 50px rgba(76, 175, 80, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        cursor: pointer;
        transform-origin: bottom center;
        transform: translateY(250px) scale(0) rotate(5deg);
        opacity: 0;
        animation: modernDealCard 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        animation-fill-mode: forwards;
        animation-delay: ${index * 0.15}s;
        border: none;
        border-radius: 20px;
        padding: 25px;
        display: flex;
        flex-direction: column;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(76, 175, 80, 0.3);
    `;

        // Add hover effects
        cardElement.addEventListener('mouseenter', () => {
            if (!cardElement.classList.contains('selected')) {
                cardElement.style.transform = 'translateY(-50px) scale(1.1) rotate(0deg)';
                cardElement.style.boxShadow =
                    '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 80px rgba(139, 195, 74, 0.4)';
                cardElement.style.zIndex = '10';
                cardElement.style.background = 'linear-gradient(145deg, #2d4a2d 0%, #3a5c3a 100%)';
            }
        });

        cardElement.addEventListener('mouseleave', () => {
            if (!cardElement.classList.contains('selected')) {
                cardElement.style.transform = 'translateY(0) scale(1)';
                cardElement.style.boxShadow =
                    '0 15px 35px rgba(0, 0, 0, 0.4), 0 0 50px rgba(76, 175, 80, 0.1)';
                cardElement.style.zIndex = '1';
                cardElement.style.background = 'linear-gradient(145deg, #1a2f1a 0%, #2d4a2d 100%)';
            }
        });

        return cardElement;
    }
}

// Inject card styles when module loads
if (!document.getElementById('card-styles')) {
    const style = document.createElement('style');
    style.id = 'card-styles';
    style.textContent = `
        @keyframes modernDealCard {
            0% {
                opacity: 0;
                transform: translateY(250px) scale(0) rotate(10deg);
            }
            60% {
                opacity: 1;
                transform: translateY(-30px) scale(1.05) rotate(-2deg);
            }
            80% {
                transform: translateY(10px) scale(0.98) rotate(1deg);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1) rotate(0deg);
            }
        }

        .card-glow {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at center, rgba(76, 175, 80, 0.1) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
            border-radius: 20px;
            pointer-events: none;
        }

        .card:hover .card-glow {
            opacity: 1;
        }

        .card-header {
            position: relative;
            margin-bottom: 25px;
        }

        .card-corner {
            position: absolute;
            width: 15px;
            height: 15px;
            border: 2px solid #4CAF50;
            opacity: 0.6;
        }

        .card-corner.top-left {
            top: 0;
            left: 0;
            border-right: none;
            border-bottom: none;
        }

        .card-corner.top-right {
            top: 0;
            right: 0;
            border-left: none;
            border-bottom: none;
        }

        .card-corner.bottom-left {
            bottom: 0;
            left: 0;
            border-right: none;
            border-top: none;
        }

        .card-corner.bottom-right {
            bottom: 0;
            right: 0;
            border-left: none;
            border-top: none;
        }

        .card-title {
            text-align: center;
            margin-bottom: 0;
            padding-bottom: 15px;
            border-bottom: 2px solid rgba(76, 175, 80, 0.3);
        }

        .card-title h1 {
            font-size: 1.4rem;
            margin: 0;
            font-weight: 700;
            background: linear-gradient(135deg, #8BC34A 0%, #E8F5E8 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            letter-spacing: 1px;
        }

        .card-description-container {
            display: flex;
            flex-direction: column;
            gap: 18px;
            flex: 1;
            justify-content: center;
            margin: 10px 0;
        }

        .card-description {
            display: flex;
            align-items: center;
            gap: 18px;
            padding: 15px;
            background: rgba(76, 175, 80, 0.08);
            transition: all 0.3s ease;
            border: 1px solid rgba(76, 175, 80, 0.15);
            border-radius: 12px;
            backdrop-filter: blur(10px);
        }

        .card-description:hover {
            background: rgba(76, 175, 80, 0.15);
            transform: translateX(5px);
            border-color: rgba(139, 195, 74, 0.3);
        }

        .card-icon {
            position: relative;
            width: 50px;
            height: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
        }

        .icon-bg {
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #4CAF50, #8BC34A);
            border-radius: 12px;
            opacity: 0.2;
            transition: opacity 0.3s ease;
        }

        .card-description:hover .icon-bg {
            opacity: 0.3;
        }

        .card-icon img {
            width: 28px;
            height: 28px;
            filter: brightness(0) invert(1);
            z-index: 1;
            position: relative;
        }

        .card-attribute p {
            margin: 0;
            font-size: 1rem;
            color: #E8F5E8;
            text-align: left;
            font-weight: 500;
            line-height: 1.4;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .card-footer {
            margin-top: auto;
            padding-top: 15px;
            border-top: 1px solid rgba(76, 175, 80, 0.2);
            text-align: center;
        }

        .card-weight {
            font-size: 0.9rem;
            color: #8BC34A;
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            letter-spacing: 0.5px;
        }

        /* Container hover effects */
        #dynamicCardContainer:hover .card:not(.selected) {
            transform: rotate(calc(var(--i) * 8deg)) translate(calc(var(--i) * 60px), -30px) scale(1.05);
        }

        /* Selected card styling */
        .card.selected {
            transform: translateY(-50px) scale(1.2) rotate(0deg) !important;
            box-shadow: 
                0 30px 60px rgba(0, 0, 0, 0.6),
                0 0 100px rgba(139, 195, 74, 0.6) !important;
            z-index: 20 !important;
            border: 2px solid #8BC34A !important;
            background: linear-gradient(145deg, #2d4a2d 0%, #3a5c3a 100%) !important;
        }

        .card.selected .card-glow {
            opacity: 1;
            background: radial-gradient(circle at center, rgba(139, 195, 74, 0.3) 0%, transparent 70%);
        }

        /* Dimmed card styling */
        .card.dimmed {
            opacity: 0.3;
            transform: translateY(20px) scale(0.9);
            filter: blur(2px) grayscale(0.5);
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
    `;
    document.head.appendChild(style);
}