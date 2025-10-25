import * as THREE from "three";
import { Tile } from "./Tile";
import { MAP_SIZE_X, MAP_SIZE_Y, TILE_SIZE } from "../constants";

export const metadata = [];
export const map = new THREE.Group();

export function initializeMap() {
  while (map.children.length > 0) {
    map.remove(map.children[0]);
  }
  metadata.length = 0;

  for (let positionY = 0; positionY < MAP_SIZE_Y; positionY++) {
    for (let positionX = 0; positionX < MAP_SIZE_X; positionX++) {
      let tile;
      if (positionY < 4) {
        // Normal walkable platform rows
        tile = Tile(positionY, 1, 'walktile.gltf');
      } else {
        // Floating grass tiles: pick random model
        const grassVariants = ['grass.gltf', 'grass2.gltf', 'grassFlower1.gltf', 'grassFlower2.gltf'];
        const randomModel = grassVariants[Math.floor(Math.random() * grassVariants.length)];
        tile = Tile(positionY, 0.7, randomModel);
      }
      
      tile.position.x = positionX * TILE_SIZE;
      tile.position.y = positionY * TILE_SIZE;

      // Animated floating tiles
      // Animated floating tiles
      if (positionY >= 4) {
        tile.userData.isAnimated = true;
        tile.userData.originalZ = tile.position.z || 0;
        tile.userData.phase = Math.random() * 2 * Math.PI;
        tile.userData.speed = 0.5 + Math.random() * 0.5;
        tile.userData.amplitude = 0.8 + Math.random() * 0.7;
      
        // 👇 Start BELOW the surface      
        // 👇 Add appear animation info
        tile.userData.appearing = {
          startZ: -100,              // start below the platform
          endZ: tile.position.z,     // final position
          duration: 3000 + Math.random() * 500 // 2–3.5s
        };
        
        tile.userData.floating = {
          amplitude: 0.8 + Math.random() * 0.7,
          speed: 0.5 + Math.random() * 0.5,
          phase: Math.random() * 2 * Math.PI
        };

        // 👇 Random tilt & rotation for natural variation
        tile.rotation.z = (Math.random() - 0.5) * (Math.PI / 16); // ±11°
        tile.rotation.y = (Math.random() - 0.5) * (Math.PI / 24); // ±7.5°

        // 👇 Start below surface (appear animation)
        tile.position.z = tile.userData.appearing.startZ;
      }
      
      map.add(tile);

      metadata.push({
        positionY,
        positionX,
        coordinate: { x: tile.position.x, y: tile.position.y },
        hasPlatform: true,
      });
    }
  }
}

function getMapBounds() {
  const box = new THREE.Box3().setFromObject(map);
  return {
    min: box.min,
    max: box.max,
    size: box.getSize(new THREE.Vector3())
  };
}