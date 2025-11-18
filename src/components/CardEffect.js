export const CardEffects = {
    // moveOrStopPositive(player) {
    //     console.log("Move or Stop Positive");
    // },

    // moveOrStopNegative(player) {
    //     console.log("Move or Stop Negative");
    //     player.remainingSteps = 0;
    // },

    // stepModifierPositive(player) {
    //     console.log("Step Modifier Positive");
    //     player.remainingSteps += 3;
    // },

    // stepModifierNegative(player) {
    //     console.log("Step Modifier Negative");
    //     player.remainingSteps -= 3;
    //     player.remainingSteps = player.remainingSteps >= 0 ? player.remainingSteps : 0;
    // },

    // randomBonusPositive(player) {
    //     console.log("Random Bonus Positive");
    // },

    // randomBonusNegative(player) {
    //     console.log("Random Bonus Negative")
    // }

    value(player, amount) {
        console.log(`Value effect: ${amount > 0 ? "+" : ""}${amount}`);
        player.remainingSteps += amount;

        // prevent negative steps
        if (player.remainingSteps < 0) player.remainingSteps = 0;
    },

    /* ============================================
       MULTIPLIER (x2, x1.5, etc)
    ============================================ */
    multiplier(player, amount) {
        console.log(`Multiplier effect: x${amount}`);
        player.remainingSteps = Math.floor(player.remainingSteps * amount);
    },

    /* ============================================
       MOVE / STOP
    ============================================ */
    move(player) {
        console.log("Move effect: player can move");
        player.canMove = true;
    },

    stop(player) {
        console.log("Stop effect: player cannot move");
        player.canMove = false;
    },

    /* ============================================
       STOP ALL (Falcon negative)
    ============================================ */
    stopAll(players) {
        console.log("Stop All effect: everyone is stopped");

        players.forEach(p => {
            p.canMove = false;
        });
    },

    /* ============================================
       IMMUNE (Mouse/Capybara)
    ============================================ */
    immune(player) {
        console.log("Immune effect applied");
        player.isImmune = true;
    },

    /* ============================================
       STEAL (LEAVE EMPTY for now)
    ============================================ */
    steal(player, target, amount) {
        console.log(`Steal effect placeholder: intended steal ${amount}`);

        // Multiplayer logic will be added later
        // Leaving blank
    },

    /* ============================================
       NO EFFECT
    ============================================ */
    none() {
        console.log("No effect");
    }
};