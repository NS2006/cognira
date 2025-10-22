import { createLoadingScreen, toggleLoadingScreen, updateLoadingProgress } from "../components/LoadingScreen"
import { textManager } from "../components/TextManager"
import { Camera } from "./Camera";
import { Renderer } from "./Renderer";
import * as THREE from "three";

// Create a flexible loading manager
export class LoadingManager {
    static instance = null;

    static getInstance() {
        if (!LoadingManager.instance) {
            LoadingManager.instance = new LoadingManager()._initialize();
        }
        return LoadingManager.instance;
    }

    constructor() {
        this.isLoading = false;
        this.loadingAnimationId = null;
        this.loadingRenderer = null;
        this.loadingScene = null;
        this.loadingCamera = null;
        this.animateLoadingScreen = null;
        this.loadingText = null;
        this.currentProgress = 0;
    }

    // Initialize loading resources (call this once)
    _initialize() {
        const { scene, animate } = createLoadingScreen();
        this.loadingScene = scene;
        this.animateLoadingScreen = animate;
        this.loadingCamera = Camera();
        
        // Optimized camera setup for the new loading screen
        this.loadingCamera.position.set(0, 0, 200);
        this.loadingCamera.lookAt(0, 0, 0);
        
        return this;
    }

    // Start loading with custom time
    async startLoading(loadingTime = 3000, onComplete = null) {
        if (this.isLoading) {
            console.warn('Loading already in progress');
            return;
        }

        this.isLoading = true;
        this.currentProgress = 0;
        toggleLoadingScreen(true, 0);
        this._startLoadingAnimation();

        try {
            // Load font as part of loading process
            await textManager.loadDefaultFont();

            // Add loading text to the enhanced scene
            this.loadingText = textManager.createText("LOADING", {
                size: 8,
                height: 1,
                color: 0xffffff,
                bevelEnabled: true,
                bevelThickness: 0.2,
                bevelSize: 0.1,
                position: { x: 0, y: -60, z: 0 },
                align: 'center',
                materialType: 'standard',
                castShadow: true
            });

            if (this.loadingText) {
                this.loadingScene.add(this.loadingText);
                console.log('✅ Loading text added to enhanced scene');
            }

            // Simulate progress updates if it's a timed loading
            if (typeof loadingTime === 'number') {
                await this._simulateProgress(loadingTime);
            } else if (typeof loadingTime === 'function') {
                // For promise-based loading, use the provided function
                await loadingTime((progress) => this._updateProgress(progress));
            }

            this._completeLoading();
            if (onComplete) onComplete();

        } catch (error) {
            console.error('Loading failed:', error);
            this._completeLoading();
        }
    }

    // Simulate progress for timed loading
    async _simulateProgress(totalTime) {
        const steps = 20;
        const interval = totalTime / steps;
        
        for (let i = 0; i <= steps; i++) {
            const progress = (i / steps) * 100;
            this._updateProgress(progress);
            await this._waitForTime(interval);
        }
    }

    // Update progress with smooth animation
    _updateProgress(progress) {
        this.currentProgress = Math.min(100, Math.max(0, progress));
        updateLoadingProgress(this.currentProgress);
        console.log(`📊 Loading progress: ${this.currentProgress}%`);
    }

    // Start loading with progress tracking
    async startLoadingWithProgress(loadingPromise, onComplete = null) {
        if (this.isLoading) {
            console.warn('Loading already in progress');
            return;
        }

        this.isLoading = true;
        this.currentProgress = 0;
        toggleLoadingScreen(true, 0);
        this._startLoadingAnimation();

        try {
            await textManager.loadDefaultFont();

            // Add loading text
            this.loadingText = textManager.createText("LOADING", {
                size: 8,
                height: 1,
                color: 0xffffff,
                position: { x: 0, y: -60, z: 0 },
                align: 'center',
                materialType: 'standard'
            });

            if (this.loadingText) {
                this.loadingScene.add(this.loadingText);
            }

            // Execute the loading promise with progress updates
            await loadingPromise((progress) => this._updateProgress(progress));

            this._completeLoading();
            if (onComplete) onComplete();

        } catch (error) {
            console.error('Loading failed:', error);
            this._completeLoading();
        }
    }

    // Quick loading without progress (for simple delays)
    async startQuickLoading(delay = 1000, onComplete = null) {
        if (this.isLoading) return;

        this.isLoading = true;
        toggleLoadingScreen(true);
        this._startLoadingAnimation();

        try {
            // Minimal setup for quick loading
            await this._waitForTime(delay);
            
            this._completeLoading();
            if (onComplete) onComplete();

        } catch (error) {
            console.error('Quick loading failed:', error);
            this._completeLoading();
        }
    }

    // Wait for specified time
    _waitForTime(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Start the loading animation - FIXED VERSION
    _startLoadingAnimation() {
        const canvas = document.querySelector('canvas.game');
        if (!canvas) {
            console.error('Canvas not found');
            return;
        }

        this.loadingRenderer = Renderer();
        console.log('🎬 Starting enhanced loading animation');

        const animateLoading = () => {
            if (this.isLoading) {
                try {
                    // Run the enhanced loading screen animation
                    // Wrap in try-catch to handle any animation errors gracefully
                    if (this.animateLoadingScreen && typeof this.animateLoadingScreen === 'function') {
                        this.animateLoadingScreen();
                    }
                    
                    // Render the scene
                    this.loadingRenderer.render(this.loadingScene, this.loadingCamera);
                    this.loadingAnimationId = requestAnimationFrame(animateLoading);
                } catch (error) {
                    console.error('Error in loading animation:', error);
                    // Continue animation despite errors
                    this.loadingRenderer.render(this.loadingScene, this.loadingCamera);
                    this.loadingAnimationId = requestAnimationFrame(animateLoading);
                }
            }
        }

        animateLoading();
    }

    // Alternative: Safe animation method that doesn't rely on element.geometry
    _startSafeAnimation() {
        const canvas = document.querySelector('canvas.game');
        if (!canvas) {
            console.error('Canvas not found');
            return;
        }

        this.loadingRenderer = Renderer();
        console.log('🎬 Starting safe loading animation');

        // Create our own simple animation if the provided one fails
        let rotation = 0;
        
        const animateLoading = () => {
            if (this.isLoading) {
                try {
                    // Try to use the provided animation first
                    if (this.animateLoadingScreen && typeof this.animateLoadingScreen === 'function') {
                        this.animateLoadingScreen();
                    } else {
                        // Fallback: simple rotation animation
                        rotation += 0.01;
                        this.loadingScene.rotation.y = rotation;
                    }
                    
                    // Render the scene
                    this.loadingRenderer.render(this.loadingScene, this.loadingCamera);
                    this.loadingAnimationId = requestAnimationFrame(animateLoading);
                } catch (error) {
                    console.warn('Animation error, using fallback:', error);
                    // Fallback animation
                    rotation += 0.01;
                    this.loadingScene.rotation.y = rotation;
                    this.loadingRenderer.render(this.loadingScene, this.loadingCamera);
                    this.loadingAnimationId = requestAnimationFrame(animateLoading);
                }
            }
        }

        animateLoading();
    }

    // Complete the loading process
    _completeLoading() {
        this.isLoading = false;
        this.currentProgress = 100;

        // Clean up text
        if (this.loadingText) {
            this.loadingScene.remove(this.loadingText);
            textManager.disposeText(this.loadingText);
            this.loadingText = null;
        }

        // Stop animation
        if (this.loadingAnimationId) {
            cancelAnimationFrame(this.loadingAnimationId);
            this.loadingAnimationId = null;
        }

        // Clean up loading renderer
        if (this.loadingRenderer) {
            this.loadingRenderer.setAnimationLoop(null);
            this.loadingRenderer.dispose();
            this.loadingRenderer = null;
        }

        // Hide loading screen
        toggleLoadingScreen(false);
        console.log('✅ Enhanced loading completed');
    }

    // Force stop loading (emergency stop)
    forceStop() {
        this._completeLoading();
    }

    // Get current loading state
    getLoadingState() {
        return {
            isLoading: this.isLoading,
            progress: this.currentProgress,
            hasRenderer: !!this.loadingRenderer,
            hasAnimation: !!this.loadingAnimationId
        };
    }

    // Update loading text dynamically
    updateLoadingText(newText, options = {}) {
        if (!this.isLoading || !this.loadingText) return;

        // Remove old text
        this.loadingScene.remove(this.loadingText);
        textManager.disposeText(this.loadingText);

        // Create new text
        const textOptions = {
            size: 8,
            height: 1,
            color: 0xffffff,
            position: { x: 0, y: -60, z: 0 },
            align: 'center',
            materialType: 'standard',
            ...options
        };

        this.loadingText = textManager.createText(newText, textOptions);
        if (this.loadingText) {
            this.loadingScene.add(this.loadingText);
            console.log(`✅ Loading text updated to: ${newText}`);
        }
    }
}

// Export the singleton instance
export const loadingManager = LoadingManager.getInstance();