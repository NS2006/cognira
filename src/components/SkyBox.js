import * as THREE from 'three';

export class SkyBox {
    constructor(scene, skyboxImagePath = "/assets/images/skybox") {
        this.scene = scene;
        this.skyboxImagePath = skyboxImagePath;
        this.createSkyBox();
    }

    createSkyBox() {
        // p -> positive
        // n -> negative
        // x y z

        const textureLoader = new THREE.CubeTextureLoader();
        const texture = textureLoader.load([
            this.skyboxImagePath + "-px.png",
            this.skyboxImagePath + "-nx.png",
            this.skyboxImagePath + "-py.png",
            this.skyboxImagePath + "-ny.png",
            this.skyboxImagePath + "-pz.png",
            this.skyboxImagePath + "-nz.png"
        ]);

        this.scene.background = texture;
        console.log("🌌 SkyBox created and applied to scene");
    }

    // Method to change skybox texture
    updateSkyBox(newImagePath) {
        this.skyboxImagePath = newImagePath;
        this.createSkyBox();
    }

    // Method to remove skybox
    removeSkyBox() {
        this.scene.background = null;
        console.log("🌌 SkyBox removed from scene");
    }
}