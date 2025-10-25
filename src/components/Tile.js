import * as THREE from "three";
import { TILE_SIZE } from "../constants";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function Tile(positionY, platformWidthScale = 0.7, modelName = 'grass.gltf') {
  const tile = new THREE.Group();
  tile.position.y = positionY * TILE_SIZE;

  const targetWidth = TILE_SIZE * platformWidthScale;
  const targetHeight = TILE_SIZE * platformWidthScale;

  const loader = new GLTFLoader();
  loader.setPath('/assets/model/');
  
  loader.load(modelName,
    (gltf) => {
      const model = gltf.scene;
      
      // Rotate first
      model.rotation.x = Math.PI / 2;
      
      // Calculate scale to match original tile size exactly
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      
      const scaleX = targetWidth / size.x;
      const scaleY = targetHeight / size.y;
      const uniformScale = Math.min(scaleX, scaleY);
      
      model.scale.setScalar(uniformScale);
      
      // Calculate the correct Z position so character stands on top
      const center = box.getCenter(new THREE.Vector3());
      const scaledSize = size.multiplyScalar(uniformScale);
      
      // Position so the TOP of the block is at Z=0 (or your desired ground level)
      // This places the block so character stands on its top surface
      model.position.set(
        -center.x * uniformScale, 
        -center.y * uniformScale, 
        -2*(scaledSize.z / 2) // This positions the top at Z=0
      );
      
      // Alternative: if you want the top at a specific height (like original Z=1.5)
      // model.position.set(-center.x * uniformScale, -center.y * uniformScale, 1.5 - scaledSize.z/2);
      
      model.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true;
          child.castShadow = true;
        }
      });
      
      tile.add(model);
    },
    undefined,
    (error) => {
      console.error('Failed to load grass.gltf:', error);
      // Fallback - make sure positioning matches
      const platformGeometry = new THREE.BoxGeometry(targetWidth, targetHeight, 3);
      const platformMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xdc743d,
        shininess: 30
      });
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      // Position so top is at Z=1.5 (original height)
      platform.position.z = 1.5 - 1.5; // Adjust based on your character's expected ground level
      tile.add(platform);
    }
  );

  return tile;
}
