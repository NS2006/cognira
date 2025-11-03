// LoadingManager.js - Updated with Green Theme
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

        this.subtitleList = [
            "2 is the only even prime number",
            "If you shuffle a deck of cards, the order has probably never existed before in history",
            "111,111,111 × 111,111,111 = 12,345,678,987,654,321",
            "The number 5 is pronounced 'ha' in Thai, so 555 means 'hahaha'",
            "The number 0.999... (repeating) is exactly equal to 1",
            "Zero is the only number that can't be represented in Roman numerals",
            "There are more possible iterations of a game of chess than there are atoms in the observable universe",
            "There are 43,252,003,274,489,856,000 possible configurations of a Rubik's Cube",
            "There are 80,658,175,170,943,878,571,660,636,856,403,766,975,289,505,440,883,277,824,000,000,000,000 possible sudoku puzzles",
            "The number 1 is not considered a prime number"
        ];
        this.subtitle = this.subtitleList[Math.floor(Math.random() * this.subtitleList.length)]
        
        // Initialize the loading overlay
        this._createLoadingOverlay();
    }

    // Create loading overlay HTML with green theme
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
            background: linear-gradient(135deg, #0a1f1c 0%, #1a3d34 50%, #2d6a4f 100%);
            display: none;
            flex-direction: column;
            justify-content: center;
            text-align: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: "Balatro", Arial, sans-serif;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        
        overlay.innerHTML = `
            <!-- Background decorative elements -->
            <div class="loading-background-decoration">
                <div class="loading-decoration-circle circle-1"></div>
                <div class="loading-decoration-circle circle-2"></div>
                <div class="loading-decoration-circle circle-3"></div>
                <div class="loading-decoration-circle circle-4"></div>
            </div>

            <div class="loading-content" style="text-align: center; margin-bottom: 30px; position: relative; z-index: 2;">
                <!-- Logo -->
                <div class="loading-logo-container">
                    <img src="assets/images/logo.jpg" alt="Cognira Logo" class="loading-logo">
                </div>
                
                <!-- Title -->
                <h1 class="loading-title" style="
                    font-size: 3em;
                    font-weight: bold;
                    background: linear-gradient(45deg, #4caf50, #81c784, #a5d6a7);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-shadow: 0 0 30px rgba(76, 175, 80, 0.5);
                    margin: 20px 0;
                    letter-spacing: 3px;
                    animation: pulse 2s infinite;
                ">COGNIRA</h1>
                
                <!-- Spinner -->
                <div class="spinner" style="
                    width: 60px;
                    height: 60px;
                    border: 4px solid rgba(76, 175, 80, 0.3);
                    border-top: 4px solid #4caf50;
                    border-radius: 50%;
                    margin: 20px auto;
                    animation: spin 1s linear infinite;
                "></div>
                
                <!-- Loading Text -->
                <div id="loading-text" style="
                    font-size: 1.2em; 
                    margin-bottom: 20px;
                    color: #e8f5e9;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">Loading... 0%</div>
            </div>
            
            <!-- Progress Bar -->
            <div style="
                width: 300px; 
                height: 6px; 
                background: rgba(76, 175, 80, 0.3); 
                border-radius: 3px; 
                overflow: hidden;
                margin: 10px 0;
                position: relative;
                z-index: 2;
            ">
                <div id="loading-progress" style="
                    height: 100%; 
                    background: linear-gradient(90deg, #4caf50, #81c784, #a5d6a7); 
                    width: 0%; 
                    transition: width 0.3s ease;
                    border-radius: 3px;
                    box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
                "></div>
            </div>
            
            <!-- Subtitle -->
            <div style="
                margin-top: 20px; 
                font-size: 0.9em; 
                opacity: 0.8;
                color: #c8e6c9;
                position: relative;
                z-index: 2;
            ">${this.subtitle}</div>
            
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
                
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) scale(1);
                        opacity: 0.3;
                    }
                    50% {
                        transform: translateY(-20px) scale(1.05);
                        opacity: 0.5;
                    }
                }
                
                /* Loading Background Decoration */
                .loading-background-decoration {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                }
                
                .loading-decoration-circle {
                    position: absolute;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0) 70%);
                    animation: float 6s ease-in-out infinite;
                }
                
                .circle-1 {
                    width: 200px;
                    height: 200px;
                    top: 10%;
                    left: 10%;
                    animation-delay: 0s;
                }
                
                .circle-2 {
                    width: 150px;
                    height: 150px;
                    top: 60%;
                    right: 15%;
                    animation-delay: 2s;
                }
                
                .circle-3 {
                    width: 100px;
                    height: 100px;
                    bottom: 20%;
                    left: 20%;
                    animation-delay: 4s;
                }
                
                .circle-4 {
                    width: 120px;
                    height: 120px;
                    top: 30%;
                    right: 25%;
                    animation-delay: 1s;
                }
                
                /* Loading Logo */
                .loading-logo-container {
                    margin-bottom: 20px;
                    animation: fadeInDown 1s ease-out;
                }
                
                .loading-logo {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid #4caf50;
                    box-shadow: 
                        0 0 30px rgba(76, 175, 80, 0.5),
                        0 0 60px rgba(76, 175, 80, 0.3),
                        inset 0 0 20px rgba(76, 175, 80, 0.2);
                    transition: all 0.3s ease;
                }
                
                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .loading-title {
                        font-size: 2em !important;
                    }
                    
                    .loading-logo {
                        width: 80px;
                        height: 80px;
                    }
                    
                    #loading-text {
                        font-size: 1em !important;
                    }
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