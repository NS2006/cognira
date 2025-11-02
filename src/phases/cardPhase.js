import { clearPhaseTimer, setPhaseTimer, cardSystem, getLocalPlayer } from "../main.js";
import { startMinigamePhase } from "./minigamePhase.js";
import { CARD_PHASE_TIME, PHASE_TRANSITION_DELAY } from "../constants.js";

let cardPhaseTimer = null;

export function startCardPhase() {
  console.log(`🃏 Starting card selection phase (${CARD_PHASE_TIME} seconds)`);

  // Clear any existing timers
  clearPhaseTimer();

  // Show card selection
  cardSystem.showCardSelection();

  // Set timer to automatically move to minigame phase
  cardPhaseTimer = setTimeout(() => {
    console.log("⏰ Card phase over, moving to minigame phase");

    // Choose random card if player doesn't pick any card
    const localPlayer = getLocalPlayer();
    if(localPlayer.selectedCard == null){
      localPlayer.selectedCard = cardSystem.cardList.getRandomCards(1, cardSystem.currentCards)[0];

      console.log("Player doesn't pick any card. Choose random card...");
      localPlayer.displaySelectedCardInformation();
    }

    endCardPhase();
  }, (CARD_PHASE_TIME + 1) * 1000);

  setPhaseTimer(cardPhaseTimer);
}

export function endCardPhase() {
  console.log("🃏 Ending card phase");

  // Clear timers
  if (cardPhaseTimer) {
    clearTimeout(cardPhaseTimer);
    cardPhaseTimer = null;
  }
  clearPhaseTimer();

  // Hide card selection if it's still visible
  cardSystem.hideCardSelection();

  // Add delay before starting minigame phase
  setTimeout(() => {
    console.log("🔄 Transitioning to minigame phase...");
    startMinigamePhase();
  }, PHASE_TRANSITION_DELAY * 1000);
}