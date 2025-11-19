import * as THREE from "three";
import { updateMapPhysicsAndAnimation } from "../components/Map";
import { updatePhysics } from "./worldRelated";

let animationState = {
    startTime: null,
    initializedAppear: false,
    lastSentPosition: new THREE.Vector3()
};

export function createAnimationLoop(
    scene,
    camera,
    dirLight,
    dirLightTarget,
    map,
    renderer,
    getLocalPlayer,
    getSocketClient,
    leafParticles // <-- new optional argument
) {
    return function animate() {
        const localPlayer = getLocalPlayer();
        const socketClient = getSocketClient();

        updatePhysics();

        // CHANGED: Added socketClient players physics update
        if (socketClient && socketClient.players) {
            socketClient.players.forEach(player => {
                if (player.updatePhysics) player.updatePhysics();
            });
        }

        // Animate player if exists
        animatePlayer(localPlayer, socketClient);

        updateMapPhysicsAndAnimation();

        // Update player indicators
        updatePlayerIndicators(localPlayer, socketClient, camera);

        // Update camera and lighting
        updateCameraAndLighting(localPlayer, camera, dirLight, dirLightTarget);

        // Animate map tiles
        animateMapTiles(map);

        // Update leaf particles if present
        if (leafParticles && typeof leafParticles.update === "function") {
            leafParticles.update();
        }

        // Render the scene
        renderer.render(scene, camera);
    };
}

function updatePlayerIndicators(localPlayer, socketClient, camera) {
    const deltaTime = 0.016;

    // Update local player indicator
    if (localPlayer && localPlayer.updateIndicatorAnimation) {
        localPlayer.updateIndicatorAnimation(deltaTime);

        if (localPlayer.playerIndicator) {
            localPlayer.playerIndicator.lookAt(camera.position);
        }
    }

    // Update remote players indicators
    if (socketClient && socketClient.players) {
        socketClient.players.forEach(player => {
            if (player.updateIndicatorAnimation) {
                player.updateIndicatorAnimation(deltaTime);

                if (player.playerIndicator) {
                    player.playerIndicator.lookAt(camera.position);
                }
            }
        });
    }
}

function animatePlayer(localPlayer, socketClient) {
    if (!localPlayer) {
        console.log("🎮 No local player, skipping animation");
        return;
    }

    console.log("🎮 Animating with local player");
    localPlayer.animatePlayer();

    // Send position updates to server if position changed

    const currentPos = localPlayer.position;
    const lastPos = animationState.lastSentPosition;

    if (currentPos.x !== lastPos.x ||
        currentPos.y !== lastPos.y ||
        currentPos.z !== lastPos.z) {

            sendPositionUpdate(localPlayer, socketClient);
    }
}

function sendPositionUpdate(localPlayer, socketClient) {
    if (!localPlayer || !socketClient) return;

    const currentPos = localPlayer.position;
    const lastPos = animationState.lastSentPosition;

    if (currentPos.x !== lastPos.x ||
        currentPos.y !== lastPos.y ||
        currentPos.z !== lastPos.z) {

        socketClient.update(
            {
                x: currentPos.x,
                y: currentPos.y,
                z: currentPos.z
            },
            {
                x: localPlayer.rotation.x,
                y: localPlayer.rotation.y,
                z: localPlayer.rotation.z
            }
        );

        // Store last sent position
        animationState.lastSentPosition.copy(currentPos);
    }
}

function updateCameraAndLighting(localPlayer, camera, dirLight, dirLightTarget) {
    if (localPlayer) {
        // Camera follows player X and Y position but maintains fixed height
        const cameraOffset = new THREE.Vector3(50, -80, 80);

        camera.position.set(
            localPlayer.position.x + cameraOffset.x,
            localPlayer.position.y + cameraOffset.y,
            cameraOffset.z
        );

        const lookAtPoint = new THREE.Vector3(
            localPlayer.position.x,
            localPlayer.position.y,
            0
        );
        camera.lookAt(lookAtPoint);

        // Update directional light
        dirLight.position.set(
            localPlayer.position.x,
            localPlayer.position.y,
            50
        );
        dirLightTarget.position.set(
            localPlayer.position.x,
            localPlayer.position.y,
            0
        );
    } else {
        // Default overview when no player
        console.log("🎮 No local player, showing default view");

        const mapWidth = 4 * 42;
        const mapHeight = 13 * 42;
        const mapCenterX = mapWidth / 2;
        const mapCenterY = mapHeight / 2;

        camera.position.set(mapCenterX + 50, mapCenterY - 50, 50);
        camera.lookAt(mapCenterX, mapCenterY, 0);

        dirLight.position.set(mapCenterX, mapCenterY, 50);
        dirLightTarget.position.set(mapCenterX, mapCenterY, 0);
    }
}

function animateMapTiles(map) {
    if (!map || !map.children) return;

    // Initialize animation timing
    if (!animationState.startTime) {
        animationState.startTime = performance.now();
    }

    // Initialize appear animations
    if (!animateMapTiles._initializedAppear) {
        initializeTileAnimations(map);
        animateMapTiles._initializedAppear = true;
        console.log("🎬 Tile appear animations initialized!");
    }

    // Animate tiles
    const now = performance.now();
    map.children.forEach(tile => {
        animateTile(tile, now);
    });
}

function initializeTileAnimations(map) {
    map.children.forEach(tile => {
        if (tile.userData?.appearing) {
            tile.userData.appearing.startTime = performance.now();
            // Force initial position from startZ
            tile.position.z = tile.userData.appearing.startZ;
        }
        // Store originalZ for float animation later
        if (tile.userData?.floating && tile.userData.originalZ === undefined) {
            tile.userData.originalZ = tile.position.z;
        }
    });
}

function animateTile(tile, now) {
    const { appearing, floating } = tile.userData || {};
    const originalZ = tile.userData.originalZ ?? 0;

    if (appearing) {
        animateTileAppear(tile, appearing, now);
    } else if (floating && now > (floating.startTime ?? 0)) {
        animateTileFloat(tile, floating, now);
    }
}

function animateTileAppear(tile, appearing, now) {
    const progress = (now - appearing.startTime) / appearing.duration;
    if (progress < 1) {
        const eased = 1 - Math.pow(1 - progress, 3);
        tile.position.z = appearing.startZ + (appearing.endZ - appearing.startZ) * eased;
    } else {
        tile.position.z = appearing.endZ;
        delete tile.userData.appearing;

        // Start floating after appear ends
        if (tile.userData.floating) {
            tile.userData.floating.startTime = now + 200; // small delay (200ms)
            tile.userData.floating.startZ = tile.position.z;
        }
    }
}

function animateTileFloat(tile, floating, now) {
    const { amplitude, speed, phase, startZ } = floating;
    const elapsed = (now - floating.startTime) / 1000;
    tile.position.z = startZ - amplitude * (1 - Math.abs(Math.sin(speed * elapsed + phase)));
}

export function resetAnimationState() {
    animationState = {
        startTime: null,
        initializedAppear: false,
        lastSentPosition: new THREE.Vector3()
    };

    animateMapTiles._startTime = null;
    animateMapTiles._initializedAppear = false;
}

export function getAnimationState() {
    return { ...animationState };
}