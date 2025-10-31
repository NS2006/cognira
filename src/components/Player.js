import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TILE_SIZE, MAP_SIZE_X, MAP_SIZE_Y } from "../constants";
import * as CANNON from "cannon-es";

export class Player extends THREE.Object3D {
  constructor(playerId, initX, physicsWorld) {
    super();

    initX %= 4;

    console.log("Player Constructor: " + playerId + " | " + initX);

    this.playerId = playerId;
    this.physicsWorld = physicsWorld;
    this.radius = 5;
    this.movesQueue = [];

    this.gridPosition = {
      currentY: 0,
      currentX: 0
    };

    this.moveClock = new THREE.Clock(false);
    this.movesQueue = [];

    this.chickenModel = null;
    this.isModelLoaded = false;

    // Initialize step system
    this.baseStep = 5; // Base movement steps per turn
    this.remainingSteps = this.baseStep;
    this.activeEffects = [];
    this.cardManager = null;

    this._createPhysicsBody(initX);

    this._createPlayerModel();
    this.initialize(initX);
  }

  get id() {
    return this.playerId;
  }

  _createPlayerModel() {
    // Load the chicken GLTF model
    this._loadChickenGLTF();
  }

  _createPhysicsBody(initX) {
    const shape = new CANNON.Sphere(this.radius);
  
    this.body = new CANNON.Body({
      mass: 10, // static body, no gravity
      shape: shape,
      position: new CANNON.Vec3(initX * TILE_SIZE, 0, -4),
      type: CANNON.Body.KINEMATIC, // allow manual movement
    });
  
    this.physicsWorld.addBody(this.body);
  }

  updatePhysics() {
    // Keep Three synced to Cannon (in case of world step)
    this.position.copy(this.body.position);
  }
  
  dispose() {
    if (this.physicsWorld && this.body) {
      this.physicsWorld.removeBody(this.body);
    }
    this.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }

  _createPlaceholderModel() {
    // Temporary box until chicken model loads
    const placeholder = new THREE.Mesh(
      new THREE.BoxGeometry(10, 10, 10),
      new THREE.MeshLambertMaterial({
        color: 0xffff00, // Yellow placeholder
        flatShading: true,
      })
    );
    placeholder.castShadow = true;
    placeholder.receiveShadow = true;
    this.add(placeholder);
    this.chickenModel = placeholder; // Temporary reference
  }

  _loadChickenGLTF() {
    const loader = new GLTFLoader();

    loader.load(
      'assets/model/chicken.gltf',
      (gltf) => {
        console.log("🐔 Chicken GLTF model loaded successfully");

        this.remove(this.chickenModel);

        // The loaded model is in gltf.scene
        this.chickenModel = gltf.scene;

        // Center the model
        const box = new THREE.Box3().setFromObject(this.chickenModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        console.log("🐔 GLTF Model bounds:", { center, size });

        // Center the model by offsetting its position
        this.chickenModel.position.x = -center.x;
        this.chickenModel.position.y = -center.y;
        this.chickenModel.position.z = -center.z;

        // Apply rotation
        this.chickenModel.rotation.x = Math.PI / 2;
        this.chickenModel.rotation.y = Math.PI;
        this.chickenModel.rotation.z = 0;

        // Scale - adjust as needed for GLTF (might need different scale than OBJ)
        this.chickenModel.scale.set(11, 11, 11);

        // Configure materials and shadows
        this.chickenModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // GLTF materials are usually already set up, but ensure they're visible
            if (child.material) {
              child.material.needsUpdate = true;
              child.material.transparent = false;
              child.material.opacity = 1;
            }
          }
        });

        // Position on platform
        const platformHeight = 3;
        const scaledBox = new THREE.Box3().setFromObject(this.chickenModel);
        const chickenBottomZ = scaledBox.min.z;
        const chickenHeight = platformHeight - chickenBottomZ;
        this.chickenModel.position.z = chickenHeight;

        console.log("🐔 GLTF Chicken positioned on platform:", {
          platformHeight,
          chickenBottomZ,
          finalHeight: chickenHeight
        });

        this.add(this.chickenModel);
        this.isModelLoaded = true;
      },
      (xhr) => {
        console.log(`🐔 Loading GLTF: ${(xhr.loaded / xhr.total * 100)}% loaded`);
      },
      (error) => {
        console.error("🐔 Error loading chicken GLTF model:", error);
        // Keep the placeholder if loading fails
      }
    );
  }

  // Initialize player with base step
  initialize(initX) {
    // Set Z position to 10 at spawn
    this.position.set(initX * TILE_SIZE, 0, -4);
    this.gridPosition.currentY = 0;
    this.gridPosition.currentX = initX;
    this.movesQueue.length = 0;
    this.resetSteps();
  }

  // Apply effect from card system
  // Apply effect from card system
  applyEffect(effect) {
    if (!this.activeEffects) {
      this.activeEffects = [];
    }

    // Check if similar effect already exists and remove it
    this.activeEffects = this.activeEffects.filter(existingEffect =>
      existingEffect.type !== effect.type
    );

    this.activeEffects.push({
      ...effect,
      appliedAt: Date.now()
    });

    console.log(`Effect applied to player ${this.playerId}:`, effect);
    console.log(`Current active effects:`, this.activeEffects);

    // Force immediate step recalculation
    this.updateRemainingSteps();
  }

  // Update remaining steps based on active effects
  updateRemainingSteps() {
    console.log(`🔄 [updateRemainingSteps] Called for player ${this.playerId}`);
    console.log(`🔄 [updateRemainingSteps] cardManager exists: ${!!this.cardManager}`);

    if (!this.cardManager) {
      this.remainingSteps = this.baseStep;
      console.log(`🔄 [updateRemainingSteps] No card manager, using base step: ${this.remainingSteps}`);
      return;
    }

    // Calculate final step based on effects
    console.log(`🔄 [updateRemainingSteps] Calling calculateFinalStep`);
    const finalStep = this.cardManager.calculateFinalStep(this, this.baseStep);

    // Always update remaining steps to match final step when not moving
    if (this.movesQueue.length === 0) {
      this.remainingSteps = finalStep;
      console.log(`🔄 [updateRemainingSteps] Updated remaining steps to final step: ${this.remainingSteps}`);
    } else {
      // If we're moving, only update if the final step changed
      const stepsUsed = this.baseStep - this.remainingSteps;
      this.remainingSteps = Math.max(0, finalStep - stepsUsed);
      console.log(`🔄 [updateRemainingSteps] Adjusted for used steps: ${this.remainingSteps}`);
    }

    console.log(`Player ${this.playerId} steps: Base=${this.baseStep}, Final=${finalStep}, Remaining=${this.remainingSteps}`);
  }

  // Check if player can move
  canMove() {
    if (!this.cardManager) return true;
    return this.cardManager.canPlayerMove(this) && this.remainingSteps > 0;
  }

  // Get movement information for UI
  getMovementInfo() {
    if (!this.cardManager) {
      return {
        canMove: true,
        baseStep: this.baseStep,
        finalStep: this.baseStep,
        remainingSteps: this.remainingSteps,
        messages: ['No card effects active']
      };
    }

    return this.cardManager.getEffectsSummary(this);
  }

  // Set card manager reference
  setCardManager(cardManager) {
    this.cardManager = cardManager;
  }

  queueMove(direction) {
    // Direct check for movement blocking
    if (this.activeEffects && this.activeEffects.some(effect =>
      effect.type === 'move_or_stop_negative')) {
      console.log(`❌ Cannot move: Player ${this.playerId} has movement blocked by move_or_stop_negative`);
      return false;
    }

    // Check if player can move based on card effects
    if (!this.canMove()) {
      console.log(`Cannot move: Player ${this.playerId} has movement blocked or no steps remaining`);
      return false;
    }

    // Check if move is valid within map boundaries
    if (!this._isValidMove(direction)) {
      return false;
    }

    // Check step limit
    if (this.remainingSteps <= 0) {
      console.log(`Cannot queue more moves: Step limit reached (${this.remainingSteps} steps)`);
      return false;
    }

    this.movesQueue.push(direction);

    console.log(`Move queued: ${direction}. Queue: ${this.movesQueue.length}, Remaining: ${this.remainingSteps}`);
    return true;
  }

  _stepCompleted() {
    const direction = this.movesQueue.shift();

    if (direction === "forward") this.gridPosition.currentY += 1;
    if (direction === "backward") this.gridPosition.currentY -= 1;
    if (direction === "left") this.gridPosition.currentX -= 1;
    if (direction === "right") this.gridPosition.currentX += 1;

    // Actually decrease remaining steps
    this.remainingSteps = Math.max(0, this.remainingSteps - 1);

    const scoreDOM = document.getElementById("score");
    if (scoreDOM) scoreDOM.innerText = this.gridPosition.currentY.toString();

    console.log(`Step completed. Remaining steps: ${this.remainingSteps}`);
  }

  // Reset steps for new turn
  resetSteps() {
    // Reset the moves queue
    this.movesQueue.length = 0;

    // Only reset effects and steps at the beginning of a new turn
    // Don't reset during movement phase
    if (this.activeEffects) {
      this.activeEffects = [];
    }

    // Reset to base step
    this.remainingSteps = this.baseStep;

    console.log(`Steps reset for player ${this.playerId}: ${this.remainingSteps} steps`);
  }

  // Clean up effects at end of turn
  cleanupEffects() {
    // Clear moves queue
    this.movesQueue.length = 0;

    // Clear effects
    if (this.activeEffects) {
      this.activeEffects = [];
    }

    // Reset steps for next turn
    this.resetSteps();

    console.log(`Effects cleaned up for player ${this.playerId}`);
  }

  setCardManager(cardManager) {
    console.log(`🔄 [setCardManager] Setting cardManager for player ${this.playerId}`);
    this.cardManager = cardManager;
    console.log(`🔄 [setCardManager] cardManager set:`, !!this.cardManager);
    console.log(`🔄 [setCardManager] cardManager methods:`, {
      calculateFinalStep: !!this.cardManager.calculateFinalStep,
      canPlayerMove: !!this.cardManager.canPlayerMove,
      getEffectsSummary: !!this.cardManager.getEffectsSummary
    });
  }

  _isValidMove(direction) {
    const allDirections = [...this.movesQueue, direction];
    const finalPosition = this._calculateFinalPosition(allDirections);

    if (finalPosition.finalY <= -1 || finalPosition.finalX <= -1 ||
      finalPosition.finalY >= MAP_SIZE_Y || finalPosition.finalX >= MAP_SIZE_X) {
      return false;
    }

    return true;
  }

  _calculateFinalPosition(allDirections) {
    let finalX = this.gridPosition.currentX;
    let finalY = this.gridPosition.currentY;

    allDirections.forEach(direction => {
      if (direction == "forward") finalY++;
      else if (direction == "backward") finalY--;
      else if (direction == "left") finalX--;
      else if (direction == "right") finalX++;
    });

    return { finalX, finalY };
  }

  _update3DPosition(startX, startY, endX, endY, progress) {
    const x = THREE.MathUtils.lerp(startX, endX, progress);
    const y = THREE.MathUtils.lerp(startY, endY, progress);
  
    this.position.x = x;
    this.position.y = y;
  
    // Keep physics body aligned (no jump physics, only ground contact)
    // No forced X/Y snapping; let physics handle movement naturally
  }
  

  setColor(color) {
    if (this.chickenModel && this.isModelLoaded) {
      this.chickenModel.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.color.set(color);
        }
      });
    }
  }

  animatePlayer() {
    if (!this.movesQueue.length) return;
  
    // Start movement
    if (!this.moveClock.running) {
      this.moveClock.start();
    }
  
    const duration = 0.5; // seconds per tile
    const progress = Math.min(this.moveClock.getElapsedTime() / duration, 1);
  
    const direction = this.movesQueue[0];
    const startX = this.gridPosition.currentX * TILE_SIZE;
    const startY = this.gridPosition.currentY * TILE_SIZE;
    const endX = startX + (direction === "left" ? -TILE_SIZE : direction === "right" ? TILE_SIZE : 0);
    const endY = startY + (direction === "forward" ? TILE_SIZE : direction === "backward" ? -TILE_SIZE : 0);
  
    // Interpolate position
    this.position.x = THREE.MathUtils.lerp(startX, endX, progress);
    this.position.y = THREE.MathUtils.lerp(startY, endY, progress);
  
    // Visual jump arc (z only)
    const jumpHeight = Math.sin(progress * Math.PI) * 8;
    this.position.z = -4 + jumpHeight;
  
    // Sync Cannon (even though it's kinematic)
    this.body.position.copy(this.position);
  
    // Complete move
    if (progress >= 1) {
      this._stepCompleted();
      this.moveClock.stop();
      this.position.z = -4; // reset height
      this.body.position.copy(this.position);
    }
  
    // Visual facing direction
    this._setRotation(0.3);
  }  

  _setPosition(progress) {
    const startX = this.gridPosition.currentX * TILE_SIZE;
    const startY = this.gridPosition.currentY * TILE_SIZE;
    let endX = startX;
    let endY = startY;

    if (this.movesQueue[0] === "left") endX -= TILE_SIZE;
    if (this.movesQueue[0] === "right") endX += TILE_SIZE;
    if (this.movesQueue[0] === "forward") endY += TILE_SIZE;
    if (this.movesQueue[0] === "backward") endY -= TILE_SIZE;

    this._update3DPosition(startX, startY, endX, endY, progress);

    // Animate jumping
    const jumpHeight = Math.sin(progress * Math.PI) * 8;
  } 

  _setRotation(progress) {
    let endRotation = 0;
    if (this.movesQueue[0] == "forward") endRotation = 0;
    if (this.movesQueue[0] == "left") endRotation = Math.PI / 2;
    if (this.movesQueue[0] == "right") endRotation = -Math.PI / 2;
    if (this.movesQueue[0] == "backward") endRotation = Math.PI;

    // Rotate the entire player model
    this.rotation.z = THREE.MathUtils.lerp(
      this.rotation.z,
      endRotation,
      progress
    );
  }

  move(position, rotation) {
    if (position !== undefined) {
      this.position.set(position.x, position.y, position.z);
    }

    if (rotation !== undefined) {
      this.rotation.set(rotation.x, rotation.y, rotation.z);
    }
  }
}