export const CardEffects = {
    moveOrStopPositive(player) {
        console.log("Move or Stop Positive");
    },

    moveOrStopNegative(player) {
        console.log("Move or Stop Negative");
        player.remainingSteps = 0;
    },

    stepModifierPositive(player) {
        console.log("Step Modifier Positive");
        player.remainingSteps += 3;
    },

    stepModifierNegative(player) {
        console.log("Step Modifier Negative");
        player.remainingSteps -= 3;
        player.remainingSteps = player.remainingSteps >= 0 ? player.remainingSteps : 0;
    },

    randomBonusPositive(player) {
        console.log("Random Bonus Positive");
    },

    randomBonusNegative(player) {
        console.log("Random Bonus Negative")
    }
};