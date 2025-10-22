import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import helvetiker from "three/examples/fonts/helvetiker_regular.typeface.json";
import * as THREE from "three";

export class TextManager {
    constructor() {
        this.fontLoader = new FontLoader();
        this.loadedFont = null;
    }

    // Load Default Font
    loadDefaultFont() {
        try {
            this.loadedFont = this.fontLoader.parse(helvetiker);
            console.log('✅ Default font loaded successfully');
            return Promise.resolve(this.loadedFont);
        } catch (error) {
            console.error('❌ Error loading default font:', error);
            return Promise.reject(error);
        }
    }

    // Load the font
    loadFont(fontPath) {
        return new Promise((resolve, reject) => {
            this.fontLoader.load(
                fontPath,
                (font) => {
                    console.log('✅ Font loaded successfully:', font);
                    this.loadedFont = font;
                    resolve(font);
                },
                (progress) => {
                    console.log('📥 Loading font...', progress);
                },
                (error) => {
                    console.error('❌ Error loading font:', error);
                    reject(error);
                }
            );
        });
    }

    // Create 3D text with flexible positioning
    createText(text, options = {}) {
        if (!this.loadedFont) {
            console.error('Font not loaded. Call loadFont() first.');
            return null;
        }

        const {
            // Text geometry options
            size = 1,
            height = 0.1,
            curveSegments = 12,
            bevelEnabled = false,
            bevelThickness = 0.03,
            bevelSize = 0.02,
            bevelOffset = 0,
            bevelSegments = 5,
            
            // Material options
            color = 0xffffff,
            materialType = 'basic',
            transparent = false,
            opacity = 1.0,
            wireframe = false,
            
            // Positioning options
            position = { x: 0, y: 0, z: 0 },
            scale = { x: 1, y: 1, z: 1 },
            
            // Alignment options
            align = 'center',
            verticalAlign = 'middle',
            
            // Advanced options
            autoCenter = true,
            castShadow = false,
            receiveShadow = false,
            userData = {}
            
        } = options;

        try {
            // Create text geometry
            const textGeometry = new TextGeometry(text, {
                font: this.loadedFont,
                size: size,
                height: height,
                curveSegments: curveSegments,
                bevelEnabled: bevelEnabled,
                bevelThickness: bevelThickness,
                bevelSize: bevelSize,
                bevelOffset: bevelOffset,
                bevelSegments: bevelSegments,
            });

            // Create material based on type
            let material;
            switch (materialType) {
                case 'standard':
                    material = new THREE.MeshStandardMaterial({ 
                        color: color,
                        roughness: 0.3,
                        metalness: 0.8,
                        transparent: transparent,
                        opacity: opacity,
                        wireframe: wireframe
                    });
                    break;
                case 'physical':
                    material = new THREE.MeshPhysicalMaterial({ 
                        color: color,
                        roughness: 0.3,
                        metalness: 0.8,
                        transparent: transparent,
                        opacity: opacity,
                        wireframe: wireframe
                    });
                    break;
                case 'phong':
                    material = new THREE.MeshPhongMaterial({ 
                        color: color,
                        transparent: transparent,
                        opacity: opacity,
                        wireframe: wireframe
                    });
                    break;
                default: // 'basic'
                    material = new THREE.MeshBasicMaterial({ 
                        color: color,
                        transparent: transparent,
                        opacity: opacity,
                        wireframe: wireframe
                    });
            }

            // Create mesh
            const textMesh = new THREE.Mesh(textGeometry, material);
            
            // Apply positioning and scale only
            textMesh.position.set(position.x, position.y, position.z);
            textMesh.scale.set(scale.x, scale.y, scale.z);
            
            // Apply alignment if requested
            if (autoCenter) {
                this._alignText(textMesh, textGeometry, align, verticalAlign);
            }
            
            // Apply shadows
            textMesh.castShadow = castShadow;
            textMesh.receiveShadow = receiveShadow;
            
            // Add user data
            textMesh.userData = { ...userData, isText: true, originalText: text };
            
            return textMesh;
            
        } catch (error) {
            console.error('❌ Error creating 3D text:', error);
            return this.createTextSprite(text, options); // Fallback to 2D
        }
    }

    // Helper method for text alignment
    _alignText(textMesh, geometry, align, verticalAlign) {
        geometry.computeBoundingBox();
        const boundingBox = geometry.boundingBox;
        const width = boundingBox.max.x - boundingBox.min.x;
        const height = boundingBox.max.y - boundingBox.min.y;
        
        // Horizontal alignment
        switch (align) {
            case 'left':
                textMesh.position.x = -boundingBox.min.x;
                break;
            case 'right':
                textMesh.position.x = -boundingBox.max.x;
                break;
            case 'center':
            default:
                textMesh.position.x = -width / 2 - boundingBox.min.x;
                break;
        }
        
        // Vertical alignment
        switch (verticalAlign) {
            case 'top':
                textMesh.position.y = -boundingBox.min.y;
                break;
            case 'bottom':
                textMesh.position.y = -boundingBox.max.y;
                break;
            case 'middle':
            default:
                textMesh.position.y = -height / 2 - boundingBox.min.y;
                break;
        }
    }

    // Create 2D text (sprite-based for better performance)
    createTextSprite(text, options = {}) {
        const {
            // Text styling
            fontSize = 32,
            fontFamily = 'Arial, sans-serif',
            color = '#ffffff',
            backgroundColor = 'transparent',
            strokeColor = '#000000',
            strokeWidth = 0,
            
            // Positioning
            position = { x: 0, y: 0, z: 0 },
            scale = { x: 1, y: 1, z: 1 },
            
            // Canvas options
            padding = 20,
            resolution = 2,
            
            // Sprite options
            transparent = true,
            depthTest = false
            
        } = options;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Set font to measure text
        context.font = `${fontSize}px ${fontFamily}`;
        const metrics = context.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize;
        
        // Set canvas size with padding and resolution
        canvas.width = (textWidth + padding * 2) * resolution;
        canvas.height = (textHeight + padding * 2) * resolution;
        
        // Scale context for high resolution
        context.scale(resolution, resolution);
        context.font = `${fontSize}px ${fontFamily}`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Draw background
        if (backgroundColor !== 'transparent') {
            context.fillStyle = backgroundColor;
            context.fillRect(0, 0, canvas.width / resolution, canvas.height / resolution);
        }
        
        // Draw text stroke
        if (strokeWidth > 0) {
            context.strokeStyle = strokeColor;
            context.lineWidth = strokeWidth;
            context.strokeText(text, canvas.width / (2 * resolution), canvas.height / (2 * resolution));
        }
        
        // Draw text
        context.fillStyle = color;
        context.fillText(text, canvas.width / (2 * resolution), canvas.height / (2 * resolution));
        
        // Create texture and sprite
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: transparent,
            depthTest: depthTest
        });
        
        const sprite = new THREE.Sprite(material);
        
        // Apply positioning and scale only
        sprite.position.set(position.x, position.y, position.z);
        
        // Scale appropriately (considering resolution)
        const scaleX = (canvas.width / resolution) / 100;
        const scaleY = (canvas.height / resolution) / 100;
        sprite.scale.set(scaleX * scale.x, scaleY * scale.y, scale.z);
        
        sprite.userData = { isTextSprite: true, originalText: text };
        
        return sprite;
    }

    // Check if font is loaded
    isFontLoaded() {
        return this.loadedFont !== null;
    }

    // Dispose of text resources
    disposeText(textMesh) {
        if (textMesh.geometry) {
            textMesh.geometry.dispose();
        }
        if (textMesh.material) {
            if (Array.isArray(textMesh.material)) {
                textMesh.material.forEach(material => material.dispose());
            } else {
                textMesh.material.dispose();
            }
        }
        if (textMesh.material?.map) {
            textMesh.material.map.dispose();
        }
    }
}

// Export a singleton instance
export const textManager = new TextManager();