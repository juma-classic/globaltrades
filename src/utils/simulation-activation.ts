/**
 * Simulation Mode Activation Detector
 * Detects secret gestures/keyboard inputs to activate simulation mode
 */

import { simulationMode } from './simulation-mode';

type ActivationCallback = () => void;

class SimulationActivationDetector {
    private keySequence: string[] = [];
    private enterPressCount: number = 0;
    private enterTimeout: NodeJS.Timeout | null = null;
    private masterDetected: boolean = false;
    private masterTimeout: NodeJS.Timeout | null = null;
    
    // Mobile gesture tracking
    private swipeSequence: string[] = [];
    private logoTapCount: number = 0;
    private logoTapTimeout: NodeJS.Timeout | null = null;
    private touchStartX: number = 0;
    private touchStartY: number = 0;
    
    private activationCallback: ActivationCallback | null = null;

    constructor() {
        this.setupKeyboardListener();
        this.setupTouchListeners();
    }

    private setupKeyboardListener(): void {
        document.addEventListener('keydown', (e) => {
            // Track key sequence for "master"
            if (e.key.length === 1) {
                this.keySequence.push(e.key.toLowerCase());
                
                // Keep only last 6 characters
                if (this.keySequence.length > 6) {
                    this.keySequence.shift();
                }
                
                // Check if sequence matches "master"
                const sequence = this.keySequence.join('');
                if (sequence === 'master') {
                    console.log('🔑 Master keyword detected - Press Enter twice');
                    this.masterDetected = true;
                    
                    // Reset master detection after 5 seconds
                    if (this.masterTimeout) {
                        clearTimeout(this.masterTimeout);
                    }
                    this.masterTimeout = setTimeout(() => {
                        this.masterDetected = false;
                        this.keySequence = [];
                        console.log('⏱️ Master keyword expired');
                    }, 5000);
                }
            }
            
            // Track Enter presses
            if (e.key === 'Enter') {
                if (this.masterDetected) {
                    this.enterPressCount++;
                    console.log(`⌨️ Enter pressed (${this.enterPressCount}/2)`);
                    
                    // Reset timeout
                    if (this.enterTimeout) {
                        clearTimeout(this.enterTimeout);
                    }
                    
                    // Check if pressed twice within 2 seconds
                    if (this.enterPressCount === 2) {
                        this.activateSimulation();
                        this.enterPressCount = 0;
                        this.masterDetected = false;
                        this.keySequence = [];
                        if (this.masterTimeout) {
                            clearTimeout(this.masterTimeout);
                        }
                    } else {
                        // Reset after 2 seconds
                        this.enterTimeout = setTimeout(() => {
                            this.enterPressCount = 0;
                            console.log('⏱️ Enter timeout - try again');
                        }, 2000);
                    }
                }
            }
        });
    }

    private setupTouchListeners(): void {
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
            }
        });

        document.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                
                const deltaX = touchEndX - this.touchStartX;
                const deltaY = touchEndY - this.touchStartY;
                
                // Detect swipe direction (minimum 50px movement)
                if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                    const direction = deltaX > 0 ? 'right' : 'left';
                    this.handleSwipe(direction);
                }
            }
        });
    }

    private handleSwipe(direction: 'left' | 'right'): void {
        this.swipeSequence.push(direction);
        
        // Keep only last 4 swipes
        if (this.swipeSequence.length > 4) {
            this.swipeSequence.shift();
        }
        
        // Check if sequence matches: right, right, left, left
        const sequence = this.swipeSequence.join(',');
        if (sequence === 'right,right,left,left') {
            console.log('👆 Swipe sequence detected');
            this.swipeSequence = []; // Reset
            // Now waiting for logo taps
        }
    }

    setupLogoTapListener(logoElement: HTMLElement): void {
        logoElement.addEventListener('click', () => {
            // Check if swipe sequence was completed
            const recentSequence = this.swipeSequence.join(',');
            
            if (recentSequence === 'right,right,left,left' || this.logoTapCount > 0) {
                this.logoTapCount++;
                
                // Reset timeout
                if (this.logoTapTimeout) {
                    clearTimeout(this.logoTapTimeout);
                }
                
                // Check if tapped twice within 2 seconds
                if (this.logoTapCount === 2) {
                    this.activateSimulation();
                    this.logoTapCount = 0;
                    this.swipeSequence = [];
                } else {
                    // Reset after 2 seconds
                    this.logoTapTimeout = setTimeout(() => {
                        this.logoTapCount = 0;
                        this.swipeSequence = [];
                    }, 2000);
                }
            }
        });
    }

    private activateSimulation(): void {
        // Determine if real or demo account
        const isRealAccount = this.detectAccountType();
        
        // Toggle simulation mode
        if (simulationMode.isSimulationActive()) {
            simulationMode.deactivateSimulation();
            console.log('🎮 Simulation Mode: OFF');
            
            // Trigger callback for visual feedback
            if (this.activationCallback) {
                this.activationCallback();
            }
            
            // Refresh page after 2 seconds (after green blink)
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            simulationMode.activateSimulation(isRealAccount);
            console.log('🎮 Simulation Mode: ON');
            console.log(`💰 Simulated Balance: $${isRealAccount ? '200' : '10,000'}`);
            
            // Trigger callback for visual feedback
            if (this.activationCallback) {
                this.activationCallback();
            }
            
            // Refresh page after 2 seconds (after green blink)
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }

    private detectAccountType(): boolean {
        // Check if Fake Real Mode is active
        const isFakeRealMode = localStorage.getItem('demo_icon_us_flag') === 'true';
        if (isFakeRealMode) {
            console.log('🎭 Fake Real Mode detected - Using Real simulation balance');
            return true; // Treat as real account
        }
        
        // Check if current account is real or demo
        try {
            const accountInfo = localStorage.getItem('client.accounts');
            if (accountInfo) {
                const accounts = JSON.parse(accountInfo);
                const activeLoginid = localStorage.getItem('active_loginid');
                
                if (activeLoginid && accounts[activeLoginid]) {
                    // Real accounts typically start with CR, MF, MLT, etc.
                    // Demo accounts start with VRT, VRTC
                    const isReal = !activeLoginid.startsWith('VRT');
                    console.log(`💳 Account type: ${isReal ? 'Real' : 'Demo'}`);
                    return isReal;
                }
            }
        } catch (error) {
            console.error('Failed to detect account type:', error);
        }
        
        // Default to demo if can't determine
        console.log('⚠️ Could not detect account type - defaulting to Demo');
        return false;
    }

    onActivation(callback: ActivationCallback): void {
        this.activationCallback = callback;
    }
}

export const simulationActivation = new SimulationActivationDetector();
