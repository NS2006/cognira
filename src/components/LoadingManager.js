// LoadingManager.js - Now uses HTML/CSS instead of Three.js
export class LoadingManager {
    static instance = null;

    static getInstance() {
        if (!LoadingManager.instance) {
            LoadingManager.instance = new LoadingManager();
        }
        return LoadingManager.instance;
    }

    constructor() {
        this.isLoading = false;
        this.currentProgress = 0;
        this.progressInterval = null;
        this.loadingTimeout = null;
        
        // Initialize the loading overlay
        this._createLoadingOverlay();
    }

    // Create loading overlay HTML
    _createLoadingOverlay() {
        // Check if overlay already exists
        if (document.getElementById('loading-overlay')) {
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a2980, #26d0ce);
            display: none;
            flex-direction: column;
            justify-content: center;
            text-align: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: Arial, sans-serif;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        
        overlay.innerHTML = `
            <div class="loading-content" style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 2.5em; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    LOADING
                </h1>
                <div class="spinner" style="
                    width: 60px;
                    height: 60px;
                    border: 4px solid rgba(255,255,255,0.3);
                    border-top: 4px solid #ff6b6b;
                    border-radius: 50%;
                    margin: 20px auto;
                    animation: spin 1s linear infinite;
                "></div>
                <div id="loading-text" style="font-size: 1.2em; margin-bottom: 20px;">
                    Loading... 0%
                </div>
            </div>
            <div style="width: 300px; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden;">
                <div id="loading-progress" style="
                    height: 100%; 
                    background: linear-gradient(90deg, #ff6b6b, #4ecdc4); 
                    width: 0%; 
                    transition: width 0.3s ease;
                    border-radius: 2px;
                "></div>
            </div>
            <div style="margin-top: 30px; font-size: 0.9em; opacity: 0.8;">
                2 is the only even prime number
            </div>
            
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
                
                .loading-content h1 {
                    animation: pulse 2s infinite;
                }
            </style>
        `;
        
        document.body.appendChild(overlay);
    }

    // Start loading with specified time
    async startLoading(loadingTime = 3000, onComplete = null) {
        if (this.isLoading) {
            console.warn('Loading already in progress');
            return;
        }

        this.isLoading = true;
        this.currentProgress = 0;
        
        // Show loading screen
        this._showLoadingScreen();
        
        try {
            // Simulate progress over the specified time
            await this._simulateProgress(loadingTime);
            
            this._completeLoading();
            if (onComplete) onComplete();

        } catch (error) {
            console.error('Loading failed:', error);
            this._completeLoading();
        }
    }

    // Simulate progress with smooth animation
    async _simulateProgress(totalTime) {
        // Clear any existing interval
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }

        return new Promise((resolve) => {
            const startTime = Date.now();
            const endTime = startTime + totalTime;
            
            // Initial progress update
            this._updateProgress(0);
            
            // Use requestAnimationFrame for smooth progress updates
            const updateProgress = () => {
                if (!this.isLoading) {
                    resolve();
                    return;
                }
                
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                const progress = Math.min(100, (elapsed / totalTime) * 100);
                
                this._updateProgress(progress);
                
                if (currentTime < endTime) {
                    requestAnimationFrame(updateProgress);
                } else {
                    this._updateProgress(100);
                    // Small delay to ensure 100% is visible
                    setTimeout(resolve, 200);
                }
            };
            
            updateProgress();
        });
    }

    // Update progress display
    _updateProgress(progress) {
        this.currentProgress = Math.min(100, Math.max(0, progress));
        
        const progressBar = document.getElementById('loading-progress');
        const progressText = document.getElementById('loading-text');
        
        if (progressBar) {
            progressBar.style.width = `${this.currentProgress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Loading... ${Math.round(this.currentProgress)}%`;
        }
        
        console.log(`📊 Loading progress: ${this.currentProgress}%`);
    }

    // Show loading screen with fade-in effect
    _showLoadingScreen() {
        const overlay = document.getElementById('loading-overlay');
        const gameCanvas = document.querySelector('canvas.game');
        
        if (overlay) {
            overlay.style.display = 'flex';
            
            // Trigger fade-in animation
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 10);
        }
        
        if (gameCanvas) {
            gameCanvas.style.opacity = '0.3';
            gameCanvas.style.pointerEvents = 'none';
        }
    }

    // Hide loading screen with fade-out effect
    _hideLoadingScreen() {
        const overlay = document.getElementById('loading-overlay');
        const gameCanvas = document.querySelector('canvas.game');
        
        if (overlay) {
            overlay.style.opacity = '0';
            
            // Wait for fade-out animation to complete before hiding
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 500);
        }
        
        if (gameCanvas) {
            gameCanvas.style.opacity = '1';
            gameCanvas.style.pointerEvents = 'auto';
        }
    }

    // Complete the loading process
    _completeLoading() {
        this.isLoading = false;
        this.currentProgress = 100;

        // Clear any intervals
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }

        // Clear any timeouts
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }

        // Update to 100% and hide
        this._updateProgress(100);
        
        // Wait a moment to show 100%, then hide
        setTimeout(() => {
            this._hideLoadingScreen();
            console.log('✅ Loading completed');
        }, 300);
    }

    // Start loading with progress tracking (for async operations)
    async startLoadingWithProgress(loadingPromise, onComplete = null) {
        if (this.isLoading) {
            console.warn('Loading already in progress');
            return;
        }

        this.isLoading = true;
        this.currentProgress = 0;
        this._showLoadingScreen();

        try {
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
        this._showLoadingScreen();

        try {
            await new Promise(resolve => {
                this.loadingTimeout = setTimeout(resolve, delay);
            });
            
            this._completeLoading();
            if (onComplete) onComplete();

        } catch (error) {
            console.error('Quick loading failed:', error);
            this._completeLoading();
        }
    }

    // Force stop loading (emergency stop)
    forceStop() {
        this._completeLoading();
    }

    // Get current loading state
    getLoadingState() {
        return {
            isLoading: this.isLoading,
            progress: this.currentProgress
        };
    }

    // Update loading text dynamically
    updateLoadingText(newText) {
        if (!this.isLoading) return;

        const progressText = document.getElementById('loading-text');
        if (progressText) {
            progressText.textContent = `${newText}... ${Math.round(this.currentProgress)}%`;
        }
    }

    // Set custom loading message
    setLoadingMessage(message) {
        this.updateLoadingText(message);
    }
}

// Export the singleton instance
export const loadingManager = LoadingManager.getInstance();