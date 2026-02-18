# Simulation Mode - Implementation Guide

## Overview
Simulation Mode is a stealth feature that allows testing trading strategies with guaranteed wins by modifying contract exit points below the barrier.

## Activation Methods

### Desktop
1. Type `master` (anywhere on the page)
2. Press `Enter` twice (within 2 seconds)
3. Green blink on logo confirms activation

### Mobile
1. Swipe right twice
2. Swipe left twice
3. Tap logo twice (within 2 seconds)
4. Green blink on logo confirms activation

## Features

### Exit Point Algorithm
```
If exitDigit <= barrier:
    newExitDigit = random(barrier + 1, 9)  // Guaranteed win
Else:
    newExitDigit = exitDigit  // Keep original
```

### Starting Balances
- **Real Account Simulation**: $200
- **Demo Account Simulation**: $10,000

### Data Persistence
- All simulation data stored in localStorage
- Survives page refresh
- Separate from real trading data

### What Gets Modified
1. Exit points (if below barrier)
2. Balance (simulated)
3. Profit/Loss calculations
4. Transaction history
5. Journal entries
6. Summary statistics

### What Stays Real
1. Market data (real ticks)
2. Bot logic and decisions
3. Entry points
4. Barriers set by strategy

## Architecture

### Core Components

1. **simulation-mode.ts**
   - State management
   - Balance tracking
   - Transaction recording
   - Statistics calculation

2. **simulation-activation.ts**
   - Gesture detection (swipes, taps)
   - Keyboard detection ("master" + Enter)
   - Activation/deactivation logic

3. **contract-interceptor.ts**
   - Intercepts contract purchase
   - Modifies exit points
   - Calculates simulated profit
   - Overrides balance display

4. **contract-outcome-monitor.ts**
   - Monitors proposals
   - Tracks contract lifecycle
   - Extracts barriers from longcode

5. **useSimulatedBalance.ts**
   - React hook for balance override
   - Subscribes to simulation state changes

### Integration Points

1. **deriv-api.service.ts**
   - `buyContract()` - Intercepts and modifies response

2. **app-logo component**
   - Green blink animation
   - Logo tap listener setup

3. **Balance displays**
   - Use `useSimulatedBalance()` hook

4. **Transaction/Journal stores**
   - Check `contractInterceptor.isActive()`
   - Use simulated data when active

## Usage Example

```typescript
import { contractInterceptor } from '@/utils/contract-interceptor';
import { simulationMode } from '@/utils/simulation-mode';

// Check if simulation is active
if (contractInterceptor.isActive()) {
    // Use simulated balance
    const balance = simulationMode.getBalance();
    
    // Get statistics
    const stats = contractInterceptor.getStatistics();
    console.log('Win Rate:', stats.winRate);
    console.log('Net Profit:', stats.netProfit);
}

// In contract purchase handler
contractInterceptor.onContractPurchase(
    contractId,
    barrier,
    stake,
    entryPrice
);

// In contract settlement handler
const outcome = contractInterceptor.onContractSettlement(
    contractId,
    exitPrice,
    profit,
    payout,
    pipSize
);
```

## Security Notes

- No visible UI indicators (except 2-second green blink)
- Completely stealth operation
- Secret activation gestures
- Data isolated in localStorage
- Does not affect real trading

## Testing

1. Activate simulation mode
2. Run your trading bots normally
3. Observe green blink confirmation
4. Check console for simulation logs:
   - `🎮 Simulation Mode Activated`
   - `🎯 Exit point modified: X → Y`
   - `📊 Simulation transaction recorded`

## Deactivation

Repeat the activation gesture to toggle off:
- Desktop: Type `master` + Enter twice
- Mobile: Swipe sequence + tap logo twice

## Future Enhancements

- Export simulation data (CSV/JSON)
- Comparison charts (real vs simulated)
- Multiple simulation profiles
- Advanced statistics dashboard
- Pattern analysis tools
