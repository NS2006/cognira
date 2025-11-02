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
    this.selectedCard = null;

    this._createPhysicsBody(initX);
    this._createPlayerModel();
    this.initialize(initX);
  }

  get id() {
    return this.playerId;
  }

  displaySelectedCardInformation(){
    if(this.selectedCard){
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

  displayPlayerInformation(){
    console.log("Player Information: ", {
      playerId: this.playerId,
      baseStep: this.baseStep,
      remainingSteps: this.remainingSteps
    });
  }

  _createPlayerModel() {
    // Load the chicken GLTF model
    this._loadChickenGLTF();
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

    console.log(`Step completed. Remaining steps: ${this.remainingSteps}`);
  }

  // Reset steps for new turn
  resetSteps() {
    // Reset the moves queue
    this.movesQueue.length = 0;

    // Reset to base step
    this.remainingSteps = this.baseStep;

    this.selectedCard = null;

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
    const jumpHeight = Math.sin(progress * Math.PI) * 8;
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
    }

    if (rotation !== undefined) {
      this.rotation.set(rotation.x, rotation.y, rotation.z);
    }
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
}