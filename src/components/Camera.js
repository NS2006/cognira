import * as THREE from "three";

export function Camera() {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Set camera to look in a fixed direction (e.g., from top-right)
  camera.position.set(50, -50, 50); // Position behind and above
  camera.up.set(0, 0, 3);
  camera.lookAt(0, 0, 0); // Look at the origin

  console.log("📷 Fixed-direction camera created");
  return camera;
}