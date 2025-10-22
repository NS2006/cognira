import * as THREE from "three";

// components/DirectionalLight.js
export function DirectionalLight() {
  const light = new THREE.DirectionalLight(0xffffff, 0.8); // Increased intensity
  light.position.set(-100, -100, 200);
  light.castShadow = true;
  
  // Better shadow quality
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 500;
  light.shadow.camera.left = -100;
  light.shadow.camera.right = 100;
  light.shadow.camera.top = 100;
  light.shadow.camera.bottom = -100;
  
  return light;
}