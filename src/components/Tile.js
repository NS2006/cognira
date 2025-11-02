import * as THREE from "three";
import { TILE_SIZE } from "../constants";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as CANNON from "cannon-es";
import { physicsWorld } from "../main.js";

export function Tile(positionY, platformWidthScale = 0.7, modelName = 'grass.gltf', physicsWorld = null) {
  const tile = new THREE.Group();
  tile.position.y = positionY * TILE_SIZE;

  const targetWidth = TILE_SIZE * platformWidthScale;
  const targetHeight = TILE_SIZE * platformWidthScale;
  const tileHeight = 3;

  if (physicsWorld) {
    const halfExtents = new CANNON.Vec3(targetWidth / 2, targetHeight / 2, tileHeight / 2);
    const shape = new CANNON.Box(halfExtents);
    const body = new CANNON.Body({
      mass: 0,
      shape,
      position: new CANNON.Vec3(0, tile.position.y, -tileHeight / 2)
    });
    physicsWorld.addBody(body);
    tile.cannonBody = body;
  }

  const loader = new GLTFLoader();
  loader.setPath('/assets/model/');

  loader.load(modelName,
    (gltf) => {
      const model = gltf.scene;
      model.rotation.x = Math.PI / 2;

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const scaleX = targetWidth / size.x;
      const scaleY = targetHeight / size.y;
      const uniformScale = Math.min(scaleX, scaleY);
      model.scale.setScalar(uniformScale);

      const scaledCenter = center.clone().multiplyScalar(uniformScale);
      model.position.set(
        -scaledCenter.x,
        -scaledCenter.y,
        -box.max.z * uniformScale
      );

      model.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true;
          child.castShadow = false;
        }
      });

      tile.add(model);
    },
    undefined,
    (error) => {
      console.error('Failed to load model:', error);
      const height = 3;
      const geometry = new THREE.BoxGeometry(targetWidth, targetHeight, height);
      const material = new THREE.MeshPhongMaterial({ color: 0xdc743d, shininess: 30 });
      const fallback = new THREE.Mesh(geometry, material);
      fallback.position.z = -height / 2;
      fallback.receiveShadow = true;
      fallback.castShadow = true;
      tile.add(fallback);
    }
  );

  return tile;
}
