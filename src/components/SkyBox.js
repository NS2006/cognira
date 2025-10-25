import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class SkyBox {
    constructor(scene, modelPath = "/assets/model/Cloud5.glb") {
        this.scene = scene;
        this.modelPath = modelPath;
        this.skyboxGroup = new THREE.Group();
        this.createSkyBox();
    }

    createSkyBox() {
        const loader = new GLTFLoader();
        
        console.log("Loading sky sphere from:", this.modelPath);
        
        loader.load(this.modelPath, 
            (gltf) => {
                console.log("🌌 Sky sphere loaded successfully:", gltf);
                
                const model = gltf.scene;
                
                // Make model visible
                model.visible = true;
                
                // Calculate bounding box to understand model size
                const bbox = new THREE.Box3().setFromObject(model);
                const size = bbox.getSize(new THREE.Vector3());
                const center = bbox.getCenter(new THREE.Vector3());
                
                console.log("Sky sphere size:", size);
                console.log("Sky sphere center:", center);
                
                // Position at (0,0,0)
                model.position.set(0, 0, 0);
                
                // Scale to appropriate size for skybox
                const targetSize = 1000;
                const currentSize = Math.max(size.x, size.y, size.z);
                let scale = 1;
                
                if (currentSize > 0) {
                    scale = targetSize / currentSize;
                } else {
                    scale = 500;
                }
                
                console.log("Scaling sky sphere by:", scale);
                model.scale.setScalar(scale);
                
                // Force material settings for sky sphere
                let meshCount = 0;
                model.traverse((child) => {
                    if (child.isMesh) {
                        meshCount++;
                        console.log(`Mesh ${meshCount}:`, child.name);
                        
                        child.visible = true;
                        
                        // Force backside rendering for sky sphere
                        if (child.material) {
                            console.log("Original material:", child.material);
                            child.material.side = THREE.BackSide;
                            child.material.depthWrite = false;
                            child.material.needsUpdate = true;
                        }
                        
                        child.receiveShadow = false;
                        child.castShadow = false;
                    }
                });

                console.log("Total meshes found:", meshCount);
                
                this.skyboxGroup.add(model);
                this.scene.add(this.skyboxGroup);
                
                console.log("🌌 Sky sphere created successfully");
                
            },
            (progress) => {
                if (progress.lengthComputable) {
                    console.log("Loading progress:", (progress.loaded / progress.total * 100) + '%');
                }
            },
            (error) => {
                console.error('❌ Failed to load sky sphere:', error);
            }
        );
    }

    update(deltaTime) {
        if (this.skyboxGroup) {
            this.skyboxGroup.rotation.y += 0.005 * deltaTime;
        }
    }

    updateSkyBox(newModelPath) {
        this.modelPath = newModelPath;
        this.removeSkyBox();
        this.createSkyBox();
    }

    removeSkyBox() {
        if (this.skyboxGroup) {
            this.scene.remove(this.skyboxGroup);
            while(this.skyboxGroup.children.length > 0) {
                this.skyboxGroup.remove(this.skyboxGroup.children[0]);
            }
        }
        console.log("🌌 Sky sphere removed from scene");
    }

    setScale(scale) {
        if (this.skyboxGroup && this.skyboxGroup.children[0]) {
            this.skyboxGroup.children[0].scale.setScalar(scale);
            console.log("Sky sphere scale set to:", scale);
        }
    }

    setRotation(x, y, z) {
        if (this.skyboxGroup) {
            this.skyboxGroup.rotation.set(x, y, z);
        }
    }
}