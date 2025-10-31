export class CardManager {
    constructor() {
        this.cardEffects = {
            'move_or_stop': {
                positive: this.applyMoveOrStopPositive.bind(this),
                negative: this.applyMoveOrStopNegative.bind(this)
            },
            'step_modifier': {
                positive: this.applyStepModifierPositive.bind(this),
                negative: this.applyStepModifierNegative.bind(this)
            },
            'time_expired': {
                positive: () => { }, // No positive effect for time expired
                negative: this.applyTimeExpiredPenalty.bind(this)
            }
        };
    }

    applyPositiveEffects(cardType, player) {
  console.log(`🔄 [applyPositiveEffects] Applying ${cardType} to player ${player.playerId}`);
  
  // Clear previous effects before applying new ones
  if (player.activeEffects) {
    player.activeEffects = [];
  }

  const effectFunction = this.cardEffects[cardType]?.positive;
  if (effectFunction) {
    const effectResult = effectFunction(player);
    console.log(`✅ Applied positive ${cardType} effect to player:`, effectResult);
    
    // Force immediate step recalculation
    if (player.updateRemainingSteps) {
      console.log(`🔄 [applyPositiveEffects] Calling updateRemainingSteps`);
      player.updateRemainingSteps();
    }
    
    return effectResult;
  } else {
    console.warn(`Unknown card type for positive effect: ${cardType}`);
    return null;
  }
}

applyNegativeEffects(cardType, player) {
  console.log(`🔄 [applyNegativeEffects] Applying ${cardType} to player ${player.playerId}`);
  
  // Clear previous effects before applying new ones
  if (player.activeEffects) {
    player.activeEffects = [];
  }

  const effectFunction = this.cardEffects[cardType]?.negative;
  if (effectFunction) {
    const effectResult = effectFunction(player);
    console.log(`❌ Applied negative ${cardType} effect to player:`, effectResult);
    
    // Force immediate step recalculation
    if (player.updateRemainingSteps) {
      console.log(`🔄 [applyNegativeEffects] Calling updateRemainingSteps`);
      player.updateRemainingSteps();
    }
    
    return effectResult;
  } else {
    console.warn(`Unknown card type for negative effect: ${cardType}`);
    return null;
  }
}

    // Card 1: Move or Stop
    applyMoveOrStopPositive(player) {
        if (!player.activeEffects) player.activeEffects = [];

        const effect = {
            type: 'move_or_stop_positive',
            movementAllowed: true,
            message: 'Correct answer! You can move normally.'
        };

        player.activeEffects.push(effect);
        return effect;
    }

    applyMoveOrStopNegative(player) {
        if (!player.activeEffects) player.activeEffects = [];

        const effect = {
            type: 'move_or_stop_negative',
            movementBlocked: true, // Use a clearer property name
            message: 'Wrong answer! You cannot move this turn.'
        };

        player.activeEffects.push(effect);

        console.log(`🔒 Applied move_or_stop_negative effect to player ${player.playerId}`);

        return effect;
    }

    // Card 2: Step Modifier
    // Card 2: Step Modifier
    applyStepModifierPositive(player) {
        if (!player.activeEffects) player.activeEffects = [];

        const effect = {
            type: 'step_modifier_positive',
            stepBonus: 3,
            message: 'Correct answer! +3 steps this turn.'
        };

        player.activeEffects.push(effect);

        console.log(`✅ Applied step_modifier_positive: +3 steps`);

        return effect;
    }

    applyStepModifierNegative(player) {
        if (!player.activeEffects) player.activeEffects = [];

        const effect = {
            type: 'step_modifier_negative',
            stepPenalty: 3,
            message: 'Wrong answer! -3 steps this turn.'
        };

        player.activeEffects.push(effect);

        console.log(`❌ Applied step_modifier_negative: -3 steps`);

        return effect;
    }

    applyTimeExpiredPenalty(player) {
        if (!player.activeEffects) player.activeEffects = [];

        const effect = {
            type: 'time_expired_penalty',
            stepPenalty: 2,
            message: 'Time expired! -2 steps this turn.'
        };

        player.activeEffects.push(effect);

        // Immediately update the player's steps
        player.updateRemainingSteps();

        return effect;
    }

    // Method to check if player can move
    canPlayerMove(player) {
        if (!player.activeEffects || player.activeEffects.length === 0) {
            console.log(`No active effects for player ${player.playerId}, allowing movement`);
            return true;
        }

        // Check for move_or_stop_negative effect
        const moveBlockEffect = player.activeEffects.find(effect =>
            effect.type === 'move_or_stop_negative'
        );

        if (moveBlockEffect) {
            console.log(`🚫 Movement blocked by move_or_stop_negative effect for player ${player.playerId}`);
            return false;
        }

        console.log(`✅ No movement blocking effects for player ${player.playerId}, allowing movement`);
        return true;
    }

    // Method to calculate final step count
    calculateFinalStep(player, baseStep = 5) {
      console.log(`🔢 [calculateFinalStep] Starting calculation for player ${player.playerId}`);
      console.log(`🔢 [calculateFinalStep] baseStep: ${baseStep}, activeEffects:`, player.activeEffects);
      
      if (!player.activeEffects || player.activeEffects.length === 0) {
        console.log(`🔢 [calculateFinalStep] No active effects, returning base step: ${baseStep}`);
        return baseStep;
      }

      // Check for move_or_stop_negative effect - if found, return 0 steps immediately
      const moveStopNegativeEffect = player.activeEffects.find(effect => 
        effect.type === 'move_or_stop_negative'
      );
      
      if (moveStopNegativeEffect) {
        console.log(`🔢 [calculateFinalStep] Move or Stop negative effect found, returning 0 steps`);
        return 0;
      }

      let finalStep = baseStep;
      console.log(`🔢 [calculateFinalStep] Starting with base: ${baseStep}`);

      player.activeEffects.forEach((effect, index) => {
        console.log(`🔢 [calculateFinalStep] Processing effect ${index}:`, effect);

        if (effect.stepBonus) {
          finalStep += effect.stepBonus;
          console.log(`🔢 [calculateFinalStep] Added step bonus: +${effect.stepBonus}, total: ${finalStep}`);
        }
        if (effect.stepPenalty) {
          finalStep = Math.max(0, finalStep - effect.stepPenalty);
          console.log(`🔢 [calculateFinalStep] Applied step penalty: -${effect.stepPenalty}, total: ${finalStep}`);
        }
      });

      console.log(`🔢 [calculateFinalStep] Final step calculated: ${finalStep}`);
      return finalStep;
    }

    // Method to check if player has active effects
    hasActiveEffect(player, effectType) {
        return player.activeEffects && player.activeEffects.some(effect => effect.type === effectType);
    }

    // Method to remove expired effects (called at the end of each turn)
    cleanupTurnEffects(player) {
        if (!player.activeEffects) return;

        // Remove all turn-based effects (reset for next turn)
        player.activeEffects = [];
        console.log(`Cleaned up all effects for player ${player.playerId}`);
    }

    // Method to get current effects summary
    getEffectsSummary(player) {
        if (!player.activeEffects || player.activeEffects.length === 0) {
            return {
                canMove: true,
                baseStep: 5,
                finalStep: 5,
                remainingSteps: player.remainingSteps || 5,
                messages: ['No active effects']
            };
        }

        const canMove = this.canPlayerMove(player);
        const finalStep = this.calculateFinalStep(player, 5);

        // Use the player's actual remainingSteps, not the finalStep
        const remainingSteps = player.remainingSteps !== undefined ? player.remainingSteps : finalStep;
        const messages = player.activeEffects.map(effect => effect.message);

        console.log(`Effects summary - canMove: ${canMove}, finalStep: ${finalStep}, remainingSteps: ${remainingSteps}, messages:`, messages);

        return {
            canMove,
            baseStep: 5,
            finalStep,
            remainingSteps: remainingSteps,
            messages
        };
    }
}