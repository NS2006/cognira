import * as THREE from "three";
import { Tile } from "./Tile";
import { MAP_SIZE_X, MAP_SIZE_Y, TILE_SIZE } from "../constants";

export const metadata = [];
export const map = new THREE.Group();

export function initializeMap() {
  // console.log("🗺️ initializeMap started");
  // console.log("🗺️ MAP_SIZE_X:", MAP_SIZE_X, "MAP_SIZE_Y:", MAP_SIZE_Y, "TILE_SIZE:", TILE_SIZE);
  
  // Clear existing map
  while(map.children.length > 0) {
    map.remove(map.children[0]);
  }
  metadata.length = 0;

  for (let positionY = 0; positionY < MAP_SIZE_Y; positionY++) {
    for (let positionX = 0; positionX < MAP_SIZE_X; positionX++) {
      // Create tile
      var tile;
      if(positionY < 4){
        tile = Tile(positionY, 1, 1);
      } else{
        tile = Tile(positionY);
      }

      tile.position.x = positionX * TILE_SIZE;
      tile.position.y = positionY * TILE_SIZE;
      
      // console.log(`🟦 Tile [${positionX},${positionY}] at position:`, tile.position);
      // console.log(`🟦 Tile children:`, tile.children.length);
      
      map.add(tile);
      
      metadata.push({
        positionY: positionY,
        positionX: positionX,
        coordinate: { x: tile.position.x, y: tile.position.y },
        hasPlatform: true
      });
    }
  }
  
  // console.log(`🗺️ Map initialization complete - ${map.children.length} tiles added`);
  // console.log("🗺️ Map bounds:", getMapBounds());
}

function getMapBounds() {
  const box = new THREE.Box3().setFromObject(map);
  return {
    min: box.min,
    max: box.max,
    size: box.getSize(new THREE.Vector3())
  };
}