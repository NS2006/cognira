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

      // Rotate first to lay flat
      model.rotation.x = Math.PI / 2;

      // Get bounding box
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Scale model to match target tile size
      const scaleX = targetWidth / size.x;
      const scaleY = targetHeight / size.y;
      const uniformScale = Math.min(scaleX, scaleY);
      model.scale.setScalar(uniformScale);

      // Compute scaled dimensions
      const scaledSize = size.clone().multiplyScalar(uniformScale);
      const scaledCenter = center.clone().multiplyScalar(uniformScale);

      // ✅ Position so TOP of tile sits exactly at z = 0
      model.position.set(
        -scaledCenter.x, 
        -scaledCenter.y, 
        -box.max.z * uniformScale // move so top aligns with z=0
      );

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
      console.error('Failed to load model:', error);

      // Fallback cube with correct top alignment
      const height = 3;
      const geometry = new THREE.BoxGeometry(targetWidth, targetHeight, height);
      const material = new THREE.MeshPhongMaterial({ color: 0xdc743d, shininess: 30 });
      const fallback = new THREE.Mesh(geometry, material);

      // ✅ Align top of fallback tile to z = 0
      fallback.position.z = -height / 2;
      fallback.receiveShadow = true;
      fallback.castShadow = true;

      tile.add(fallback);
    }
  );

  return tile;
}
