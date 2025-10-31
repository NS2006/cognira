import * as THREE from "three";
import { Tile } from "./Tile";
import { MAP_SIZE_X, MAP_SIZE_Y, TILE_SIZE } from "../constants";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const metadata = [];
export const map = new THREE.Group();

const loader = new GLTFLoader();

export function initializeMap() {
  // Clear old map
  while (map.children.length > 0) {
    map.remove(map.children[0]);
  }
  metadata.length = 0;

  for (let positionY = 0; positionY < MAP_SIZE_Y; positionY++) {
    for (let positionX = 0; positionX < MAP_SIZE_X; positionX++) {
      let tile;

      // Normal walkable platform rows
      if (positionY < 4) {
        tile = Tile(positionY, 1, "walktile.gltf");
      } else {
        // Floating grass tiles
        const grassVariants = [
          "grass.gltf",
          "grass2.gltf",
          "grassFlower1.gltf",
          "grassFlower2.gltf",
        ];
        const randomModel =
          grassVariants[Math.floor(Math.random() * grassVariants.length)];
        tile = Tile(positionY, 0.7, randomModel);

        // Animated floating tiles
        tile.userData.isAnimated = true;
        tile.userData.originalZ = tile.position.z || 0;
        tile.userData.phase = Math.random() * 2 * Math.PI;
        tile.userData.speed = 0.5 + Math.random() * 0.5;
        tile.userData.amplitude = 0.8 + Math.random() * 0.7;

        // 🧩 Assign finalZ based on model type
        let finalZ = 6; // default
        if (randomModel === "grass2.gltf" ||
            randomModel === "grassFlower1.gltf" ||
            randomModel === "grassFlower2.gltf") {
          finalZ = 6;
        }

        // 👇 Appear animation info
        tile.userData.appearing = {
          startZ: -100,
          endZ: finalZ,
          duration: 3000 + Math.random() * 500,
        };

        // 👇 Floating motion info
        tile.userData.floating = {
          amplitude: 0.8 + Math.random() * 0.7,
          speed: 0.5 + Math.random() * 0.5,
          phase: Math.random() * 2 * Math.PI,
        };

        // 👇 Random tilt for natural variation
        tile.rotation.z = (Math.random() - 0.5) * (Math.PI / 16);

        // 👇 Start below the surface (for appear animation)
        tile.position.z = tile.userData.appearing.startZ;
      }

      // Common positioning
      tile.position.x = positionX * TILE_SIZE;
      tile.position.y = positionY * TILE_SIZE;

      // Add to scene
      map.add(tile);

      // Metadata for lookup
      metadata.push({
        positionY,
        positionX,
        coordinate: { x: tile.position.x, y: tile.position.y },
        hasPlatform: true,
      });
    }
  }
}

const treeModels = [
  "assets/model/tree_1.gltf",
  "assets/model/tree_2.gltf",
  "assets/model/tree_3.gltf",
];

// 📍 Manual positions for trees
// You can tweak or expand this as needed
// const treePositions = [
//   { model: 0, x: -200, y: 50, z: -90 },
//   { model: 0, x: -100, y: 120, z: -100 },
//   { model: 1, x: -110, y: 200, z: -80 },
//   { model: 2, x: -200, y: 20, z: -80 },
//   { model: 2, x: -200, y: 200, z: -80 },
//   { model: 1, x: -200, y: 0, z: -100 },
//   { model: 1, x: 200, y: 220, z: -70 },
//   { model: 2, x: 350, y: 100, z: -95 },
//   { model: 2, x: 220, y: 50, z: -100 },
// ];

export function loadTrees() {
  const promises = treeModels.map((path) => loadModel(path));

  Promise.all(promises).then((models) => {
    const treeCount = 70;
    const yMin = -100;
    const yMax = 1000;
    const yStep = (yMax - yMin) / (treeCount - 1);
    for (let i = 0; i < treeCount; i++) {
      // 🎲 pick a random model
      const baseModel = models[Math.floor(Math.random() * models.length)];
      if (!baseModel) continue;

      const tree = baseModel.clone();

      // 🎯 pick random zone for X
      let x;
      if (Math.random() < 0.5) {
        // left zone
        x = THREE.MathUtils.randFloat(-200, -190);
      } else {
        // right zone
        x = THREE.MathUtils.randFloat(200, 300);
      }

      // 🎯 random Y and Z
      const y = yMin + i * yStep;
      const z = THREE.MathUtils.randFloat(-100, -80);

      // 🪵 apply transforms
      tree.position.set(x, y, z);
      tree.scale.set(0.5, 0.5, 0.5);
      tree.rotation.x = Math.PI / 2;
      tree.rotation.z = (Math.random() - 1) * 0.1;

      map.add(tree);
    }

    console.log("🌲 Random trees added across both zones!");
  });
}


// Helper to load a glTF model
function loadModel(path) {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const scene = gltf.scene;
        resolve(scene);
      },
      undefined,
      (err) => {
        console.error("Error loading", path, err);
        reject(err);
      }
    );
  });
}

export function loadRiver() {
  loader.load(
    '/assets/model/River.gltf',
    (gltf) => {
      const river = gltf.scene;

      // Set position — ground level
      river.position.set(50, 500, -40);

      river.rotation.x = Math.PI / 2;
      // Optional: scale or rotate if needed
      river.scale.set(55, 55, 55);
      // river.rotation.y = Math.PI / 2;

      // Add to map or scene
      map.add(river);
      console.log('✅ River loaded');
    },
    undefined,
    (error) => {
      console.error('❌ Error loading river.gltf:', error);
    }
  );
}

function getMapBounds() {
  const box = new THREE.Box3().setFromObject(map);
  return {
    min: box.min,
    max: box.max,
    size: box.getSize(new THREE.Vector3()),
  };
}
