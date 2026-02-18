# Simulation Mode Balance Display Test Guide

## Overview
This guide tests the balance display override functionality in simulation mode. When simulation mode is active, users should ONLY see simulated balances, not real account balances.

## What Was Implemented

### 1. Balance Override System
- **Location**: `src/components/layout/header/account-switcher.tsx`
- **Integration**: Added `simulationMode` import and state management
- **Behavior**: When simulation mode is active, the account switcher displays simulated balance instead of real balance

### 2. Key Changes

#### Import Added
```typescript
import { simulationMode } from '@/utils/simulation-mode';
```

#### State Management
```typescript
// Track simulation mode state
const [isSimulationActive, setIsSimulationActive] = React.useState(simulationMode.isSimulationActive());
const [simulatedBalance, setSimulatedBalance] = React.useState(simulationMode.getBalance());

// Subscribe to simulation mode changes
useEffect(() => {
    const unsubscribe = simulationMode.subscribe((state) => {
        setIsSimulationActive(state.isActive);
        setSimulatedBalance(state.balance);
    });
    return unsubscribe;
}, []);
```

#### Balance Calculation Logic
```typescript
if (isSimMode) {
    // SIMULATION MODE: Show simulated balance for active account only
    if (account?.loginid === activeAccount?.loginid) {
        const simBalance = simulationMode.getBalance();
        balance = addComma(simBalance.toFixed(getDecimalPlaces(account.currency)));
        console.log('🎮 Showing simulated balance:', {
            loginid: account.loginid,
            balance,
            isActive: true
        });
    } else {
        // For non-active accounts in simulation mode, show 0 or hide them
        balance = '0.00';
    }
}
```

## Test Scenarios

### Scenario 1: Activate Simulation Mode on Real Account

**Steps:**
1. Log in with a real account (e.g., CR account)
2. Note the current real balance (e.g., $1,234.56)
3. Activate simulation mode:
   - **Desktop**: Type "master" then press Enter twice
   - **Mobile**: Swipe right×2, left×2, tap logo×2
4. Wait for green blink animation (2 seconds)
5. Page should refresh automatically
6. Open account switcher

**Expected Results:**
- ✅ Active account shows simulated balance: $200.00 (not real balance)
- ✅ Other accounts show $0.00
- ✅ Console shows: `🎮 Showing simulated balance: { loginid: 'CR...', balance: '200.00', isActive: true }`
- ✅ Console shows: `🎮 Simulation Mode Active - Balance Override`

### Scenario 2: Activate Simulation Mode on Demo Account

**Steps:**
1. Log in with a demo account (e.g., VRTC account)
2. Note the current demo balance (e.g., $10,000.00)
3. Activate simulation mode (same gestures as above)
4. Wait for green blink and page refresh
5. Open account switcher

**Expected Results:**
- ✅ Active account shows simulated balance: $10,000.00 (not real demo balance)
- ✅ Other accounts show $0.00
- ✅ Console shows: `🎮 Showing simulated balance: { loginid: 'VRTC...', balance: '10,000.00', isActive: true }`

### Scenario 3: Activate Simulation Mode in Fake Real Mode

**Steps:**
1. Activate Fake Real Mode first
2. Note the fake balance (e.g., $10,000.00 shown as US Dollar)
3. Activate simulation mode
4. Wait for green blink and page refresh
5. Open account switcher

**Expected Results:**
- ✅ Active account shows simulated balance: $200.00 (treated as real account)
- ✅ Fake Real Mode is overridden by Simulation Mode
- ✅ Console shows simulation mode is active

### Scenario 4: Balance Updates During Trading

**Steps:**
1. Activate simulation mode
2. Open account switcher - note balance (e.g., $200.00)
3. Place a trade with a bot (e.g., PATEL bot)
4. Wait for contract to settle
5. Open account switcher again

**Expected Results:**
- ✅ Balance updates based on simulated profit/loss
- ✅ If win: Balance increases (e.g., $200.00 → $219.50)
- ✅ If loss: Balance decreases (e.g., $200.00 → $190.00)
- ✅ Console shows: `📊 Simulation transaction recorded: { balance: ..., profit: ..., winRate: ... }`

### Scenario 5: Deactivate Simulation Mode

**Steps:**
1. While in simulation mode with modified balance
2. Deactivate simulation mode (same gestures as activation)
3. Wait for page refresh
4. Open account switcher

**Expected Results:**
- ✅ Balance returns to real account balance
- ✅ Simulated balance is no longer shown
- ✅ Console no longer shows simulation mode messages

## Console Debugging

### When Simulation Mode is Active
Look for these console messages:

```
🎮 Simulation Mode Activated
🎮 Simulation Mode Active - Balance Override
💰 Simulated Balance: 200
📊 Active Account: CR...
📈 Is Virtual: false
🎮 Showing simulated balance: { loginid: 'CR...', balance: '200.00', isActive: true }
```

### When Balance Updates
```
🎮 Contract intercepted: { contractId: ..., barrier: 3, stake: 10, entryPrice: ... }
🎯 Exit point modified: 2 → 5 (barrier: 3)
🎮 Contract settled (simulated): { contractId: ..., originalExit: 2, modifiedExit: 5, wasModified: true, profit: 9.5, balance: 209.5 }
📊 Simulation transaction recorded: { balance: 209.5, profit: 9.5, winRate: '100.0%' }
```

## Known Behaviors

### Balance Display Priority
1. **Simulation Mode** (highest priority) - Shows simulated balance
2. **Fake Real Mode** - Shows fake static balances
3. **Normal Mode** - Shows real API balances

### Account Switching
- In simulation mode, switching accounts is allowed
- The new active account will show its simulated balance
- Non-active accounts show $0.00

### Persistence
- Simulated balance persists across page refreshes
- Stored in localStorage under key: `simulation_mode_state`
- Includes transaction history and statistics

## Troubleshooting

### Balance Not Updating
**Check:**
1. Is simulation mode actually active? Check localStorage: `simulation_mode_state`
2. Are you looking at the active account?
3. Check console for simulation mode messages

### Wrong Balance Shown
**Check:**
1. Is Fake Real Mode also active? (Simulation should override it)
2. Check console for which mode is active
3. Verify `isSimulationActive` state in React DevTools

### Balance Doesn't Persist
**Check:**
1. localStorage is not cleared
2. Simulation mode wasn't deactivated
3. Check `simulation_mode_state` in localStorage

## Files Modified
- `src/components/layout/header/account-switcher.tsx` - Balance display override
- `src/utils/simulation-mode.ts` - Core simulation state management
- `src/utils/contract-interceptor.ts` - Contract interception and balance updates
- `src/hooks/useSimulatedBalance.ts` - React hook for balance override

## Next Steps
After confirming balance display works:
1. Test transaction list override
2. Test journal entries override
3. Test summary statistics override
4. Test with actual bot execution (PATEL, Raziel, etc.)
5. Verify exit point modification works correctly
