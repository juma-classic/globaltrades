/**
 * Contract Interceptor Middleware
 * Intercepts contract execution and modifies outcomes in simulation mode
 */

import { simulationMode, getLastDigit } from './simulation-mode';
import type { TBuyContractResponse } from '@/types/deriv-api.types';

interface ContractOutcome {
    contractId: number;
    entryPrice: number;
    exitPrice: number;
    barrier: number;
    stake: number;
    payout: number;
    profit: number;
    isWin: boolean;
}

class ContractInterceptor {
    private pendingContracts: Map<number, { barrier: number; stake: number; entryPrice: number }> = new Map();

    /**
     * Intercept contract purchase
     * Store contract details for later modification
     */
    onContractPurchase(
        contractId: number,
        barrier: number,
        stake: number,
        entryPrice: number
    ): void {
        if (!simulationMode.isSimulationActive()) {
            return;
        }

        this.pendingContracts.set(contractId, {
            barrier,
            stake,
            entryPrice
        });

        console.log('🎮 Contract intercepted:', {
            contractId,
            barrier,
            stake,
            entryPrice
        });
    }

    /**
     * Intercept contract settlement
     * Modify exit point if needed and calculate simulated profit
     */
    onContractSettlement(
        contractId: number,
        originalExitPrice: number,
        originalProfit: number,
        payout: number,
        pipSize: number = 2
    ): ContractOutcome | null {
        if (!simulationMode.isSimulationActive()) {
            return null;
        }

        const contractData = this.pendingContracts.get(contractId);
        if (!contractData) {
            console.warn('⚠️ Contract not found in pending list:', contractId);
            return null;
        }

        const { barrier, stake, entryPrice } = contractData;
        
        // Get original exit digit
        const originalExitDigit = getLastDigit(originalExitPrice, pipSize);
        
        // Apply simulation algorithm
        const modifiedExitDigit = simulationMode.modifyExitPoint(originalExitDigit, barrier);
        
        // Calculate modified exit price (replace last digit)
        const priceStr = originalExitPrice.toFixed(pipSize);
        const modifiedPriceStr = priceStr.slice(0, -1) + modifiedExitDigit.toString();
        const modifiedExitPrice = parseFloat(modifiedPriceStr);
        
        // Determine if modified outcome is a win
        const isWin = modifiedExitDigit > barrier;
        
        // Calculate simulated profit
        const simulatedProfit = isWin ? (payout - stake) : -stake;
        
        // Record transaction in simulation mode
        const wasModified = originalExitDigit !== modifiedExitDigit;
        
        simulationMode.recordTransaction({
            contractId,
            entryPrice,
            exitPrice: modifiedExitPrice,
            originalExitPrice,
            barrier,
            stake,
            profit: simulatedProfit,
            isWin,
            wasModified
        });

        // Clean up
        this.pendingContracts.delete(contractId);

        const outcome: ContractOutcome = {
            contractId,
            entryPrice,
            exitPrice: modifiedExitPrice,
            barrier,
            stake,
            payout,
            profit: simulatedProfit,
            isWin
        };

        console.log('🎮 Contract settled (simulated):', {
            contractId,
            originalExit: originalExitDigit,
            modifiedExit: modifiedExitDigit,
            wasModified,
            profit: simulatedProfit,
            balance: simulationMode.getBalance()
        });

        return outcome;
    }

    /**
     * Modify buy contract response to use simulated balance
     */
    modifyBuyResponse(response: TBuyContractResponse): TBuyContractResponse {
        if (!simulationMode.isSimulationActive() || !response.buy) {
            return response;
        }

        // Replace balance with simulated balance
        const simulatedBalance = simulationMode.getBalance();
        
        return {
            ...response,
            buy: {
                ...response.buy,
                balance_after: simulatedBalance
            }
        };
    }

    /**
     * Get simulated balance for display
     */
    getDisplayBalance(originalBalance: number): number {
        if (!simulationMode.isSimulationActive()) {
            return originalBalance;
        }
        
        return simulationMode.getBalance();
    }

    /**
     * Check if simulation mode is active
     */
    isActive(): boolean {
        return simulationMode.isSimulationActive();
    }

    /**
     * Get simulation statistics
     */
    getStatistics() {
        return simulationMode.getStatistics();
    }

    /**
     * Extract barrier from contract parameters
     * Handles different contract types (digits, over/under, etc.)
     */
    extractBarrier(contractType: string, barrier?: string | number, barrier2?: string | number): number | null {
        if (barrier !== undefined && barrier !== null) {
            const barrierNum = typeof barrier === 'string' ? parseFloat(barrier) : barrier;
            
            // For digit contracts, barrier is the digit itself
            if (contractType.includes('DIGIT') || contractType.includes('digit')) {
                // Extract last digit from barrier
                const barrierStr = barrierNum.toString();
                const lastDigit = parseInt(barrierStr.slice(-1), 10);
                return lastDigit;
            }
            
            return barrierNum;
        }
        
        return null;
    }
}

export const contractInterceptor = new ContractInterceptor();
