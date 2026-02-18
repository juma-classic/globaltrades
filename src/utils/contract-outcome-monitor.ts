/**
 * Contract Outcome Monitor
 * Monitors contract proposals and outcomes to intercept in simulation mode
 */

import { contractInterceptor } from './contract-interceptor';
import { api_base } from '@/external/bot-skeleton/services/api/api-base';

class ContractOutcomeMonitor {
    private proposalCache: Map<string, { barrier: number; stake: number }> = new Map();

    /**
     * Monitor proposal to extract barrier and stake
     */
    onProposal(proposalId: string, barrier: number | string | undefined, stake: number): void {
        if (barrier !== undefined) {
            const barrierNum = typeof barrier === 'string' ? parseFloat(barrier) : barrier;
            this.proposalCache.set(proposalId, {
                barrier: barrierNum,
                stake
            });
        }
    }

    /**
     * Monitor contract purchase
     */
    async onContractPurchase(buyResponse: any): Promise<void> {
        if (!buyResponse?.buy) return;

        const { contract_id, buy_price, longcode } = buyResponse.buy;
        
        // Try to extract barrier from longcode or proposal cache
        const barrier = this.extractBarrierFromLongcode(longcode);
        
        if (barrier !== null) {
            // Get entry price from current tick
            const entryPrice = await this.getCurrentPrice();
            
            contractInterceptor.onContractPurchase(
                contract_id,
                barrier,
                buy_price,
                entryPrice
            );
        }
    }

    /**
     * Monitor contract settlement
     */
    onContractSettlement(contractData: any): void {
        if (!contractData) return;

        const {
            contract_id,
            exit_tick,
            sell_price,
            buy_price,
            payout,
            profit
        } = contractData;

        if (exit_tick && contract_id) {
            contractInterceptor.onContractSettlement(
                contract_id,
                exit_tick,
                profit || 0,
                payout || 0,
                2 // pip size
            );
        }
    }

    /**
     * Extract barrier from contract longcode
     * Example: "Win payout if Volatility 10 Index is strictly higher than entry spot plus 3 at close on 2024-01-15 12:00:00 GMT."
     */
    private extractBarrierFromLongcode(longcode: string): number | null {
        if (!longcode) return null;

        // Pattern for digit contracts: "last digit is X" or "digit is X"
        const digitMatch = longcode.match(/digit\s+is\s+(\d)/i) || 
                          longcode.match(/last\s+digit\s+is\s+(\d)/i);
        
        if (digitMatch) {
            return parseInt(digitMatch[1], 10);
        }

        // Pattern for over/under: "higher than X" or "lower than X"
        const overUnderMatch = longcode.match(/(?:higher|lower)\s+than\s+(?:entry\s+spot\s+(?:plus|minus)\s+)?(\d+)/i);
        
        if (overUnderMatch) {
            return parseInt(overUnderMatch[1], 10);
        }

        return null;
    }

    /**
     * Get current market price
     */
    private async getCurrentPrice(): Promise<number> {
        try {
            // Get from active tick stream if available
            const activeSymbols = api_base.active_symbols;
            if (activeSymbols && activeSymbols.length > 0) {
                // Return first available price
                return activeSymbols[0]?.spot || 0;
            }
        } catch (error) {
            console.error('Failed to get current price:', error);
        }
        
        return 0;
    }
}

export const contractOutcomeMonitor = new ContractOutcomeMonitor();
