import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TILE_SIZE, MAP_SIZE_X, MAP_SIZE_Y } from "../constants";
import * as CANNON from "cannon-es";
import { updateStepsDisplay } from "../main";

export class Player extends THREE.Object3D {
  constructor(playerId, playerUsername, initX, physicsWorld) {
    super();

    initX %= 4;

    console.log("Player Constructor: " + playerId + " | " + initX);

    this.playerId = playerId;
    this.playerUsername = playerUsername;
    this.physicsWorld = physicsWorld;
    this.radius = 5;
    this.movesQueue = [];
    this.isLocalPlayer = false;

    this.gridPosition = {
      currentY: 0,
      currentX: 0
    };

    this.moveClock = new THREE.Clock(false);
    this.movesQueue = [];

    this.chickenModel = null;
    this.isModelLoaded = false;

    // Initialize step system
    this.baseStep = 2; // Base movement steps per turn
    this.remainingSteps = this.baseStep;
    this.selectedCard = null;

    this._createPhysicsBody(initX);
    this._createPlayerModel();

    // Create player indicator
    this.playerIndicator = null;

    this.initialize(initX);
  }

  get id() {
    return this.playerId;
  }

  get username() {
    return this.playerUsername;
  }

  setUsername(username) {
    this.playerUsername = username;
  }

  setAsLocalPlayer() {
    this.isLocalPlayer = true;

    if (this.isLocalPlayer) {
      this._createPlayerIndicator();
    }
  }

  displaySelectedCardInformation() {
    if (this.selectedCard) {
      console.log('Selected Card Information:', {
        id: this.selectedCard.id,
        title: this.selectedCard.title,
        descriptions: this.selectedCard.descriptions,
        weight: this.selectedCard.weight,
        positiveEffect: this.selectedCard.positiveEffect ? 'Function defined' : 'No function',
        negativeEffect: this.selectedCard.negativeEffect ? 'Function defined' : 'No function'
      });
    }
  }

  displayPlayerInformation() {
    console.log("Player Information: ", {
      playerId: this.playerId,
      baseStep: this.baseStep,
      remainingSteps: this.remainingSteps
    });
  }

  _createPlayerModel() {
    // Load the chicken GLTF model
    this._loadRandomAnimal();
  }

  _createPhysicsBody(initX) {
    const shape = new CANNON.Sphere(this.radius);
    const baseZ = -4 + this.radius; // center at ground level

    this.body = new CANNON.Body({
      mass: 0, // 🔧 static, no gravity or falling
      shape: shape,
      position: new CANNON.Vec3(initX * TILE_SIZE, 0, baseZ),
      fixedRotation: true,
    });

    this.physicsWorld.addBody(this.body);
  }

  updatePhysics() {
    if (!this.body) return;
    // keep model aligned with physics body
    this.position.x = this.body.position.x;
    this.position.y = this.body.position.y;
    this.position.z = -4; // always grounded baseline
  }

  _loadRandomAnimal() {
    const loader = new GLTFLoader();
    const ANIMAL_MODELS = [
      "Animal/Bear/Bear.gltf",
      "Animal/Bunny/Bunny.gltf",
      "Animal/Chicken/Chicken.gltf",
      "Animal/Fox/Fox.gltf",
      "Animal/Monkey/Monkey.gltf",
      "Animal/Mouse/Mouse.gltf",
      "Animal/Parrot/Parrot.gltf"
    ];

    // Pick random animal path
    const randomPath = ANIMAL_MODELS[Math.floor(Math.random() * ANIMAL_MODELS.length)];
    const fullPath = `assets/model/${randomPath}`;

    console.log("🎲 Loading animal model:", fullPath);

    loader.load(
      fullPath,
      (gltf) => {
        console.log("✅ Animal GLTF loaded:", fullPath);

        // Remove previous model if exists
        if (this.chickenModel) this.remove(this.chickenModel);

        this.chickenModel = gltf.scene;

        // Center model
        const box = new THREE.Box3().setFromObject(this.chickenModel);
        const center = box.getCenter(new THREE.Vector3());
        this.chickenModel.position.x = -center.x;
        this.chickenModel.position.y = -center.y;
        this.chickenModel.position.z = -center.z;

        if (randomPath.includes("Bear")) {
          this.chickenModel.rotation.set(
              Math.PI/2, -Math.PI/2, 0
          );
        } else {
            this.chickenModel.rotation.set(Math.PI/2, Math.PI, 0);
        }


        this.chickenModel.scale.set(10, 10, 10);

        // Setup materials & shadows
        this.chickenModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) child.material.needsUpdate = true;
          }
        });

        const platformHeight = 3;
            const scaledBox = new THREE.Box3().setFromObject(this.chickenModel);
            const animalBottomZ = scaledBox.min.z;
            const offsetToPlatform = platformHeight - animalBottomZ;

            this.chickenModel.position.z += offsetToPlatform;

            console.log("🐾 Positioned on platform:", {
                platformHeight,
                animalBottomZ,
                offsetToPlatform
            });

            // ------ 6️⃣ ADD TO PLAYER ------
            this.add(this.chickenModel);
            this.isModelLoaded = true;
          },
          (xhr) => {
              console.log(`🐾 Loading ${fullPath}: ${(xhr.loaded / xhr.total) * 100}%`);
          },
          (err) => {
              console.error("🐾 Error loading animal:", err);
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

  queueMove(direction) {
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

    updateStepsDisplay();

    console.log(`Step completed. Remaining steps: ${this.remainingSteps}`);
  }

  // Reset steps for new turn
  resetSteps() {
    // Reset the moves queue
    this.movesQueue.length = 0;

    // Reset to base step
    this.remainingSteps = this.baseStep;

    this.selectedCard = null;

    updateStepsDisplay();

    console.log(`Steps reset for player ${this.playerId}: ${this.remainingSteps} steps`);
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
    this.position.x = THREE.MathUtils.lerp(startX, endX, progress);
    this.position.y = THREE.MathUtils.lerp(startY, endY, progress);
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

  _createPlayerIndicator() {
    // Create a group for the indicator
    this.playerIndicator = new THREE.Group();

    // Create large text sprite with wider box
    const canvas = this._createTextCanvas("YOU", "bold 60px Arial", "white", "rgba(230, 13, 13, 0.9)");
    const texture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false // Ensure text always renders on top
    });
    const textSprite = new THREE.Sprite(textMaterial);
    textSprite.scale.set(25, 10, 1); // Wider scale (40 instead of 30)
    textSprite.position.set(0, 0, 15); // Positioned above the model

    // Add both to indicator group
    this.playerIndicator.add(textSprite);

    // Position the entire indicator group high above the player
    this.playerIndicator.position.set(0, 0, 40); // High above the model

    // Add indicator to player
    this.add(this.playerIndicator);

    console.log("Large 'YOU' indicator with arrow created");

    // Add subtle floating animation
    this._startIndicatorAnimation();
  }

  _createTextCanvas(text, font, textColor, backgroundColor) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Set very large canvas size for high-quality text - make it wider
    canvas.width = 350; // Wider canvas (was 2048)
    canvas.height = 200;

    // Fill background with rounded corners - wider rectangle
    if (backgroundColor) {
      context.fillStyle = backgroundColor;
      context.beginPath();
      context.roundRect(0, 0, canvas.width, canvas.height, 40); // Slightly larger corners
      context.fill();
    }

    // Draw text with enhanced styling - slightly larger font
    context.font = font;
    context.fillStyle = textColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Add strong text shadow for maximum readability
    context.shadowColor = 'rgba(0, 0, 0, 0.8)';
    context.shadowBlur = 10;
    context.shadowOffsetX = 4;
    context.shadowOffsetY = 4;

    context.fillText(text, canvas.width / 2, canvas.height / 2);

    return canvas;
  }

  _startIndicatorAnimation() {
    // Store original position for animation
    this.indicatorOriginalY = this.playerIndicator.position.y;
    this.animationTime = 0;
  }

  updateIndicatorAnimation(deltaTime) {
    if (!this.playerIndicator || !this.isLocalPlayer) return;

    // Very subtle floating animation - barely noticeable
    this.animationTime += deltaTime;
    // const floatHeight = Math.sin(this.animationTime * 1.5) * 0.3; // Much smaller movement
    this.playerIndicator.position.y = this.indicatorOriginalY;

    // Remove scale pulsing to keep it simple and not distracting
  }

  // Update your animatePlayer method to also update indicator animation
  animatePlayer() {
    if (!this.movesQueue.length) return;

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

    this.position.x = THREE.MathUtils.lerp(startX, endX, progress);
    this.position.y = THREE.MathUtils.lerp(startY, endY, progress);

    // Jump arc
    const jumpHeight = Math.sin(progress * Math.PI) * 8;
    this.position.z = -4 + jumpHeight;

    // Complete move
    if (progress >= 1) {
      this._stepCompleted();
      this.moveClock.stop();

      // ✅ Snap player exactly to target tile
      this.position.set(
        this.gridPosition.currentX * TILE_SIZE,
        this.gridPosition.currentY * TILE_SIZE,
        -4
      );

      // ✅ Sync Cannon body center (if used)
      if (this.body) {
        this.body.position.set(
          this.position.x,
          this.position.y,
          this.position.z + this.radius
        );
      }
    }

    // Rotate player facing direction
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
    // const jumpHeight = Math.sin(progress * Math.PI) * 8;
    // this.position.z = jumpHeight;
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

      this.gridPosition.currentX = Math.round(position.x / TILE_SIZE);
      this.gridPosition.currentY = Math.round(position.y / TILE_SIZE);

      // ✅ Sync Cannon body center (if used)
      if (this.body) {
        this.body.position.set(
          this.position.x,
          this.position.y,
          this.position.z + this.radius
        );
      }
    }

    if (rotation !== undefined) {
      this.rotation.set(rotation.x, rotation.y, rotation.z);
    }
  }

  dispose() {
    if (this.physicsWorld && this.body) {
      this.physicsWorld.removeBody(this.body);
    }

    // Clean up indicator
    if (this.playerIndicator) {
      this.playerIndicator.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.remove(this.playerIndicator);
    }

    // Clean up main model
    this.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}