import * as THREE from "three";

import { MAP_SIZE_X, MAP_SIZE_Y, TILE_SIZE } from "../../constants";

export class LeafParticles {
    constructor(scene, count = 1500) {
        this.scene = scene;
        this.count = count;           // number of leaves

        // World bounds (cover the whole map)
        this.minX = 0;
        this.maxX = (MAP_SIZE_X - 1) * TILE_SIZE;
        this.minZ = 0;
        this.maxZ = (MAP_SIZE_Y - 1) * TILE_SIZE;

        this.velocity = new Float32Array(count);

        this._loadTextures().then(textures => {
            this._createParticles(textures);
        });
    }

    async _loadTextures() {
        const loader = new THREE.TextureLoader();

        const files = [
            "/assets/model/Leaf/leaves_1.png",
            "/assets/model/Leaf/leaves_2.png"
        ];

        return await Promise.all(files.map(f => loader.loadAsync(f)));
    }

    _createParticles(textures) {
        const positions = new Float32Array(this.count * 3);

        for (let i = 0; i < this.count; i++) {
            // X: random across world
            positions[i*3 + 0] = this.minX + Math.random() * (this.maxX - this.minX);
            // Y: random height above ground
            positions[i*3 + 1] = Math.random() * 10 + 5;
            // Z: random across world
            positions[i*3 + 2] = this.minZ + Math.random() * (this.maxZ - this.minZ);

            this.velocity[i] = 0.02 + Math.random() * 0.2; // downward speed
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
        );

        this.material = new THREE.PointsMaterial({
            size: 2.5,
            map: textures[Math.floor(Math.random() * textures.length)],
            transparent: true,
            // alphaTest: 0.3,
            depthWrite: false,
            rotation: Math.random() * Math.PI,
            color: new THREE.Color(0.6, 0.6, 0.6), 
        });

        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    update() {
        if (!this.geometry) return;

        const positions = this.geometry.attributes.position.array;

        for (let i = 0; i < this.count; i++) {
            // Y movement (falling)
            positions[i*3 + 1] -= this.velocity[i];

            // X drift
            positions[i*3 + 0] += Math.sin(Date.now()*0.001 + i) * 0.002;

            // Respawn leaf at top
            if (positions[i*3 + 1] < -1) {
                // Respawn at random X/Z across the world
                positions[i*3 + 1] = Math.random() * 30 + 10;
                positions[i*3 + 0] = this.minX + Math.random() * (this.maxX - this.minX);
                positions[i*3 + 2] = this.minZ + Math.random() * (this.maxZ - this.minZ);
            }
        }

        this.geometry.attributes.position.needsUpdate = true;
    }
}
