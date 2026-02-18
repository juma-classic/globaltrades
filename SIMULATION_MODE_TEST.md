# Simulation Mode Testing Guide

## Step 1: Activate Simulation Mode

### Desktop:
1. Type `master` (anywhere on page)
2. Press `Enter` twice (within 2 seconds)
3. Watch for green blink on logo
4. Page will refresh after 2 seconds

### Mobile:
1. Swipe right twice
2. Swipe left twice
3. Tap logo twice (within 2 seconds)
4. Watch for green blink
5. Page will refresh after 2 seconds

## Step 2: Verify Activation

Open browser console (F12) and check for:
```
🔑 Master keyword detected - Press Enter twice
⌨️ Enter pressed (1/2)
⌨️ Enter pressed (2/2)
🎮 Simulation Mode: ON
💰 Simulated Balance: $200 (or $10,000)
💳 Account type: Real (or Demo)
```

## Step 3: Check Simulation State

Run this in console:
```javascript
// Check if simulation is active
const { simulationMode } = await import('./src/utils/simulation-mode.ts');
console.log('Simulation Active:', simulationMode.isSimulationActive());
console.log('Balance:', simulationMode.getBalance());
console.log('Statistics:', simulationMode.getStatistics());
```

## Step 4: Test with Manual Contract

### Example Test (Console):
```javascript
// Import the interceptor
const { contractInterceptor } = await import('./src/utils/contract-interceptor.ts');
const { getLastDigit } = await import('./src/utils/simulation-mode.ts');

// Simulate a contract purchase
const contractId = 123456789;
const barrier = 3; // Trading OVER 3
const stake = 3.27;
const entryPrice = 737326.85;

contractInterceptor.onContractPurchase(contractId, barrier, stake, entryPrice);
console.log('✅ Contract purchase intercepted');

// Simulate contract settlement with LOSING exit point
const exitPrice = 737326.85; // Last digit = 5
const originalProfit = -3.27; // Loss
const payout = 6.54;
const pipSize = 3;

const outcome = contractInterceptor.onContractSettlement(
    contractId,
    exitPrice,
    originalProfit,
    payout,
    pipSize
);

console.log('📊 Contract Outcome:', outcome);
console.log('💰 New Balance:', simulationMode.getBalance());
```

## Step 5: Test with Real Bot Trades

1. **Start your bot** (PATEL, Raziel, etc.)
2. **Watch console** for simulation logs:
   ```
   🎮 Contract intercepted: {contractId, barrier, stake, entryPrice}
   🎯 Exit point modified: 2 → 7 (barrier: 3)
   📊 Simulation transaction recorded: {balance, profit, winRate}
   ```

## Step 6: Verify Exit Point Modification

### Example Scenarios:

**Scenario 1: Exit below barrier (SHOULD MODIFY)**
```
Barrier: 3
Original Exit: 737326.82 (last digit = 2)
Expected: Modified to digit 4-9
Result: WIN (guaranteed)
```

**Scenario 2: Exit above barrier (NO MODIFICATION)**
```
Barrier: 3
Original Exit: 737326.85 (last digit = 5)
Expected: Keep as 5
Result: WIN (already winning)
```

**Scenario 3: Exit on barrier (SHOULD MODIFY)**
```
Barrier: 3
Original Exit: 737326.83 (last digit = 3)
Expected: Modified to digit 4-9
Result: WIN (guaranteed)
```

## Step 7: Check Transaction History

```javascript
// Get simulated transactions
const transactions = simulationMode.getTransactions();
console.table(transactions.slice(0, 10)); // Show last 10

// Check statistics
const stats = simulationMode.getStatistics();
console.log('Win Rate:', stats.winRate.toFixed(1) + '%');
console.log('Total Profit:', stats.totalProfit);
console.log('Net Profit:', stats.netProfit);
console.log('ROI:', stats.roi.toFixed(1) + '%');
```

## Step 8: Monitor Balance Changes

```javascript
// Subscribe to balance changes
const { simulationMode } = await import('./src/utils/simulation-mode.ts');

const unsubscribe = simulationMode.subscribe((state) => {
    console.log('💰 Balance Updated:', state.balance);
    console.log('📊 Win/Loss:', state.winCount, '/', state.lossCount);
});

// Later: unsubscribe()
```

## Step 9: Test Exit Point Algorithm

```javascript
// Test the algorithm directly
const { simulationMode } = await import('./src/utils/simulation-mode.ts');

// Test cases
const testCases = [
    { original: 0, barrier: 3, expected: '4-9' },
    { original: 1, barrier: 3, expected: '4-9' },
    { original: 2, barrier: 3, expected: '4-9' },
    { original: 3, barrier: 3, expected: '4-9' },
    { original: 4, barrier: 3, expected: '4 (unchanged)' },
    { original: 5, barrier: 3, expected: '5 (unchanged)' },
    { original: 9, barrier: 3, expected: '9 (unchanged)' },
];

testCases.forEach(test => {
    const result = simulationMode.modifyExitPoint(test.original, test.barrier);
    console.log(`Original: ${test.original}, Barrier: ${test.barrier} → Result: ${result} (Expected: ${test.expected})`);
});
```

## Step 10: Deactivate Simulation Mode

Repeat activation gesture to toggle off:
1. Type `master` + Enter twice (desktop)
2. Or swipe sequence + tap logo twice (mobile)
3. Console: `🎮 Simulation Mode: OFF`
4. Page refreshes

## Expected Console Output During Trading:

```
🎮 Contract intercepted: {
    contractId: 123456789,
    barrier: 3,
    stake: 3.27,
    entryPrice: 737326.85
}

🎯 Exit point modified: 2 → 7 (barrier: 3)

📊 Simulation transaction recorded: {
    balance: 203.27,
    profit: 3.27,
    winRate: '100.0%'
}
```

## Troubleshooting:

### If simulation doesn't activate:
1. Check console for errors
2. Verify localStorage: `localStorage.getItem('simulation_mode_state')`
3. Try clearing: `localStorage.removeItem('simulation_mode_state')`
4. Refresh and try again

### If contracts aren't intercepted:
1. Check if bot is running
2. Verify simulation is active: `simulationMode.isSimulationActive()`
3. Check console for contract logs
4. Ensure bot is using deriv-api.service.ts

### If balance doesn't update:
1. Check localStorage: `localStorage.getItem('simulation_mode_state')`
2. Verify transactions: `simulationMode.getTransactions()`
3. Check statistics: `simulationMode.getStatistics()`

## Notes:

- Simulation data persists in localStorage
- Survives page refresh
- Independent from real trading
- No risk to real account
- Can be reset anytime
