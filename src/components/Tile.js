import * as THREE from "three";
import { TILE_SIZE } from "../constants";

export function Tile(positionY, platformWidthScale = 0.7, platformHeightScale = 0.7) {
  const tile = new THREE.Group();
  tile.position.y = positionY * TILE_SIZE;

  // Platform configuration - single platform with gaps on sides
  const platformWidth = TILE_SIZE * platformWidthScale;
  const platformHeight = TILE_SIZE * platformHeightScale;

  // Create modern platform with enhanced materials and details
  const platformGeometry = new THREE.BoxGeometry(platformWidth, platformHeight, 3);
  
  // Modern material with subtle texture and better lighting response
  const platformMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x4CAF50, // More modern green shade
    shininess: 30,
    specular: 0x222222,
    transparent: true,
    opacity: 0.95
  });

  const platform = new THREE.Mesh(platformGeometry, platformMaterial);

  // Add subtle edge highlights for modern look
  const edges = new THREE.EdgesGeometry(platformGeometry);
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x2E7D32, // Darker green for contrast
    linewidth: 2 
  });
  const wireframe = new THREE.LineSegments(edges, lineMaterial);
  platform.add(wireframe);

  platform.position.z = 1.5;

  // Enhanced shadow properties for better visual depth
  platform.receiveShadow = true;
  platform.castShadow = true;

  // Add subtle ambient occlusion effect
  platform.layers.enable(1); // Enable for potential post-processing

  // Add platform to tile group
  tile.add(platform);

  // Add optional decorative elements for modern aesthetic
  const decorationGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 8);
  const decorationMaterial = new THREE.MeshPhongMaterial({
    color: 0x81C784, // Lighter accent color
    shininess: 50
  });

  // Add corner decorations
  const cornerPositions = [
    [platformWidth / 2 - 3, platformHeight / 2 - 3],
    [platformWidth / 2 - 3, -platformHeight / 2 + 3],
    [-platformWidth / 2 + 3, platformHeight / 2 - 3],
    [-platformWidth / 2 + 3, -platformHeight / 2 + 3]
  ];

  cornerPositions.forEach(([x, y]) => {
    const decoration = new THREE.Mesh(decorationGeometry, decorationMaterial);
    decoration.position.set(x, y, 3.25); // Position above platform
    decoration.rotation.x = Math.PI / 2;
    platform.add(decoration);
  });

  // Add subtle emissive glow for modern effect
  const glowGeometry = new THREE.PlaneGeometry(platformWidth - 10, platformHeight - 10);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x66BB6A,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide
  });
  
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.z = 3.1;
  glow.rotation.x = -Math.PI / 2;
  platform.add(glow);

  // console.log(`🟦 Tile created at Y:${tile.position.y}, platform at Z:${platform.position.z}`);

  return tile;
}