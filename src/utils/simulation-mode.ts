/**
 * Simulation Mode Manager
 * Handles stealth simulation mode with modified exit points
 */

interface SimulationState {
    isActive: boolean;
    balance: number;
    initialBalance: number;
    transactions: SimulatedTransaction[];
    totalProfit: number;
    totalLoss: number;
    winCount: number;
    lossCount: number;
}

interface SimulatedTransaction {
    id: string;
    contractId: number;
    entryPrice: number;
    exitPrice: number;
    originalExitPrice: number;
    barrier: number;
    stake: number;
    profit: number;
    isWin: boolean;
    timestamp: number;
    wasModified: boolean;
}

const STORAGE_KEY = 'simulation_mode_state';

class SimulationModeManager {
    private state: SimulationState;
    private listeners: Set<(state: SimulationState) => void> = new Set();

    constructor() {
        this.state = this.loadState();
    }

    private loadState(): SimulationState {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load simulation state:', error);
        }

        return this.getDefaultState();
    }

    private getDefaultState(): SimulationState {
        return {
            isActive: false,
            balance: 0,
            initialBalance: 0,
            transactions: [],
            totalProfit: 0,
            totalLoss: 0,
            winCount: 0,
            lossCount: 0
        };
    }

    private saveState(): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
            this.notifyListeners();
        } catch (error) {
            console.error('Failed to save simulation state:', error);
        }
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.state));
    }

    subscribe(listener: (state: SimulationState) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    isSimulationActive(): boolean {
        return this.state.isActive;
    }

    activateSimulation(isRealAccount: boolean): void {
        console.log('🎮 Simulation Mode Activated');
        
        const initialBalance = isRealAccount ? 200 : 10000;
        
        this.state = {
            ...this.getDefaultState(),
            isActive: true,
            balance: initialBalance,
            initialBalance: initialBalance
        };
        
        this.saveState();
    }

    deactivateSimulation(): void {
        console.log('🎮 Simulation Mode Deactivated');
        this.state.isActive = false;
        this.saveState();
    }

    getBalance(): number {
        return this.state.balance;
    }

    getState(): SimulationState {
        return { ...this.state };
    }

    /**
     * Modify exit point if below barrier (guaranteed win algorithm)
     */
    modifyExitPoint(originalExitDigit: number, barrier: number): number {
        if (originalExitDigit <= barrier) {
            // Generate random digit above barrier but <= 9
            const minDigit = barrier + 1;
            const maxDigit = 9;
            const modifiedDigit = Math.floor(Math.random() * (maxDigit - minDigit + 1)) + minDigit;
            
            console.log(`🎯 Exit point modified: ${originalExitDigit} → ${modifiedDigit} (barrier: ${barrier})`);
            return modifiedDigit;
        }
        
        return originalExitDigit;
    }

    /**
     * Record a simulated transaction
     */
    recordTransaction(transaction: Omit<SimulatedTransaction, 'id' | 'timestamp'>): void {
        const newTransaction: SimulatedTransaction = {
            ...transaction,
            id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        };

        // Update balance
        this.state.balance += transaction.profit;

        // Update statistics
        if (transaction.isWin) {
            this.state.winCount++;
            this.state.totalProfit += transaction.profit;
        } else {
            this.state.lossCount++;
            this.state.totalLoss += Math.abs(transaction.profit);
        }

        // Add transaction to history (keep last 1000)
        this.state.transactions.unshift(newTransaction);
        if (this.state.transactions.length > 1000) {
            this.state.transactions = this.state.transactions.slice(0, 1000);
        }

        this.saveState();

        console.log('📊 Simulation transaction recorded:', {
            balance: this.state.balance,
            profit: transaction.profit,
            winRate: `${((this.state.winCount / (this.state.winCount + this.state.lossCount)) * 100).toFixed(1)}%`
        });
    }

    /**
     * Get transaction history
     */
    getTransactions(): SimulatedTransaction[] {
        return [...this.state.transactions];
    }

    /**
     * Reset simulation data
     */
    reset(): void {
        const isRealAccount = this.state.initialBalance === 200;
        this.state = {
            ...this.getDefaultState(),
            isActive: this.state.isActive,
            balance: this.state.initialBalance,
            initialBalance: this.state.initialBalance
        };
        this.saveState();
        console.log('🔄 Simulation data reset');
    }

    /**
     * Get statistics
     */
    getStatistics() {
        const totalTrades = this.state.winCount + this.state.lossCount;
        const winRate = totalTrades > 0 ? (this.state.winCount / totalTrades) * 100 : 0;
        const netProfit = this.state.totalProfit - this.state.totalLoss;
        const roi = this.state.initialBalance > 0 
            ? ((this.state.balance - this.state.initialBalance) / this.state.initialBalance) * 100 
            : 0;

        return {
            balance: this.state.balance,
            initialBalance: this.state.initialBalance,
            totalTrades,
            winCount: this.state.winCount,
            lossCount: this.state.lossCount,
            winRate,
            totalProfit: this.state.totalProfit,
            totalLoss: this.state.totalLoss,
            netProfit,
            roi
        };
    }
}

// Singleton instance
export const simulationMode = new SimulationModeManager();

// Helper to get last digit from price
export const getLastDigit = (price: number, pipSize: number = 2): number => {
    return parseInt(price.toFixed(pipSize).slice(-1), 10);
};
