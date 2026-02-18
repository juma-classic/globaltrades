/**
 * Simulation Mode Test Script
 * Paste this into browser console to test simulation mode
 */

async function testSimulationMode() {
    console.log('🧪 Starting Simulation Mode Test...\n');

    try {
        // Dynamic import (adjust path if needed)
        const simulationMode = window.simulationMode || 
            (await import('/src/utils/simulation-mode.ts')).simulationMode;
        
        const contractInterceptor = window.contractInterceptor ||
            (await import('/src/utils/contract-interceptor.ts')).contractInterceptor;

        // Check if simulation is active
        const isActive = simulationMode.isSimulationActive();
        console.log('✅ Simulation Active:', isActive);
        
        if (!isActive) {
            console.log('⚠️ Simulation mode is NOT active!');
            console.log('📝 Activate it by typing "master" then pressing Enter twice');
            return;
        }

        // Show current state
        const balance = simulationMode.getBalance();
        const stats = simulationMode.getStatistics();
        
        console.log('\n💰 Current Balance:', balance);
        console.log('📊 Statistics:', {
            totalTrades: stats.totalTrades,
            wins: stats.winCount,
            losses: stats.lossCount,
            winRate: stats.winRate.toFixed(1) + '%',
            netProfit: stats.netProfit.toFixed(2),
            roi: stats.roi.toFixed(1) + '%'
        });

        // Test the algorithm
        console.log('\n🧮 Testing Exit Point Algorithm:');
        const testCases = [
            { digit: 0, barrier: 3 },
            { digit: 2, barrier: 3 },
            { digit: 3, barrier: 3 },
            { digit: 5, barrier: 3 },
            { digit: 9, barrier: 3 },
        ];

        testCases.forEach(test => {
            const result = simulationMode.modifyExitPoint(test.digit, test.barrier);
            const wasModified = result !== test.digit;
            console.log(
                `  Digit ${test.digit} vs Barrier ${test.barrier} → ${result}`,
                wasModified ? '✅ MODIFIED' : '⏭️ UNCHANGED'
            );
        });

        // Simulate a test contract
        console.log('\n🎮 Simulating Test Contract:');
        const testContract = {
            contractId: 999999999,
            barrier: 3,
            stake: 5.00,
            entryPrice: 737326.85,
            exitPrice: 737326.82, // Last digit = 2 (below barrier)
            payout: 10.00,
            pipSize: 3
        };

        console.log('  Contract Details:', {
            barrier: testContract.barrier,
            stake: testContract.stake,
            exitDigit: 2,
            shouldModify: true
        });

        // Intercept purchase
        contractInterceptor.onContractPurchase(
            testContract.contractId,
            testContract.barrier,
            testContract.stake,
            testContract.entryPrice
        );

        // Intercept settlement
        const outcome = contractInterceptor.onContractSettlement(
            testContract.contractId,
            testContract.exitPrice,
            -testContract.stake, // Original loss
            testContract.payout,
            testContract.pipSize
        );

        console.log('  Outcome:', {
            originalExit: 2,
            modifiedExit: outcome?.exitDigit || 'N/A',
            profit: outcome?.profit || 'N/A',
            isWin: outcome?.isWin || false
        });

        // Show updated balance
        const newBalance = simulationMode.getBalance();
        console.log('  New Balance:', newBalance, '(+' + (newBalance - balance).toFixed(2) + ')');

        // Show recent transactions
        const transactions = simulationMode.getTransactions();
        console.log('\n📜 Recent Transactions (last 5):');
        transactions.slice(0, 5).forEach((tx, i) => {
            console.log(`  ${i + 1}. ${tx.isWin ? '✅ WIN' : '❌ LOSS'} | Profit: ${tx.profit.toFixed(2)} | ${tx.wasModified ? '🎯 Modified' : '⏭️ Original'}`);
        });

        console.log('\n✅ Test Complete!');
        console.log('💡 Now run your bot and watch the console for real contract interceptions');

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.log('💡 Make sure simulation mode files are loaded');
    }
}

// Run the test
testSimulationMode();
