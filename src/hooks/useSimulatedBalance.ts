/**
 * Hook to override balance display with simulated balance
 */

import { useState, useEffect } from 'react';
import { contractInterceptor } from '@/utils/contract-interceptor';

export const useSimulatedBalance = (originalBalance: number): number => {
    const [displayBalance, setDisplayBalance] = useState(originalBalance);

    useEffect(() => {
        // Check if simulation mode is active
        const balance = contractInterceptor.getDisplayBalance(originalBalance);
        setDisplayBalance(balance);

        // Subscribe to simulation state changes
        const { simulationMode } = require('@/utils/simulation-mode');
        const unsubscribe = simulationMode.subscribe(() => {
            const newBalance = contractInterceptor.getDisplayBalance(originalBalance);
            setDisplayBalance(newBalance);
        });

        return unsubscribe;
    }, [originalBalance]);

    return displayBalance;
};
