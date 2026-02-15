# Design Document: Copy Trading Trade Replication (Phase 3)

## Overview

Phase 3 completes the Copy Trading system by implementing the trade replication engine. This phase takes the trade parameters extracted in Phase 2 and replicates them to all connected follower accounts through the Deriv API.

The design focuses on reliability, error isolation, and clear feedback. Each follower account is processed independently to ensure that failures don't cascade. The system constructs proper API requests, validates responses, and tracks detailed statistics on replication success rates.

### Key Design Principles

1. **Isolation**: Each follower processes independently; one failure doesn't affect others
2. **Validation**: All API responses are validated before proceeding
3. **Transparency**: Comprehensive logging and UI feedback for all operations
4. **Robustness**: Graceful error handling with detailed error messages
5. **Traceability**: Complete history of replications linked to master trades

## Architecture

### System Context

```
┌─────────────────┐
│  Master Account │ (Phase 2: Monitoring)
│   WebSocket     │
└────────┬────────┘
         │ Trade Detected
         │ Parameters Extracted
         ▼
┌─────────────────────────────┐
│  Trade Replication Engine   │ (Phase 3: This Design)
│  - Build Proposals          │
│  - Execute Trades           │
│  - Track Results            │
└────────┬────────────────────┘
         │ Replicate to Each
         ▼
┌─────────────────────────────┐
│  Follower Accounts (N)      │
│  - Independent Connections  │
│  - Individual Error Handling│
└─────────────────────────────┘
```

### Component Interaction Flow

```
replicateTradeToFollowers()
    │
    ├─► For Each Follower:
    │       │
    │       ├─► buildProposalRequest(tradeParams)
    │       │       └─► Construct API request with all parameters
    │       │
    │       ├─► connection.send(proposalRequest)
    │       │       └─► Get pricing and validation from Deriv
    │       │
    │       ├─► Validate proposal response
    │       │       └─► Check for errors, missing data
    │       │
    │       ├─► connection.send(buyRequest)
    │       │       └─► Execute the trade
    │       │
    │       └─► Record result (success or failure)
    │
    ├─► Update statistics
    ├─► Store results in trade history
    └─► Update UI with results
```

## Components and Interfaces

### 1. CopyTradingManager.replicateTradeToFollowers()

**Purpose**: Main orchestration method that replicates a trade to all follower accounts.

**Signature**:
```javascript
async replicateTradeToFollowers(tradeParams, masterContractId)
```

**Parameters**:
- `tradeParams`: Object containing extracted trade parameters from master trade
  - `contractType`: String (e.g., "DIGITOVER", "CALL")
  - `symbol`: String (e.g., "R_100", "EURUSD")
  - `stake`: Number (amount to wager)
  - `currency`: String (e.g., "USD", "EUR")
  - `duration`: Number (ticks or epoch timestamp)
  - `durationType`: String ("tick" or "epoch")
  - `barrier`: String (optional, for digit trades)
  - `barrier2`: String (optional, for range trades)
- `masterContractId`: String (contract ID from master trade for tracking)

**Returns**: Promise<Array<ReplicationResult>>

**Behavior**:
1. Initialize result tracking arrays and counters
2. Iterate through all follower connections
3. For each follower:
   - Build proposal request
   - Send proposal and validate response
   - Send buy request if proposal valid
   - Catch and record any errors
4. Update replication statistics
5. Store results in trade history
6. Update UI with results
7. Return array of replication results

### 2. CopyTradingManager.buildProposalRequest()

**Purpose**: Constructs a properly formatted Deriv API proposal request from trade parameters.

**Signature**:
```javascript
buildProposalRequest(tradeParams)
```

**Parameters**:
- `tradeParams`: Object (same as above)

**Returns**: Object (Deriv API proposal request)

**Behavior**:
1. Create base request object with:
   - `proposal: 1`
   - `amount`: stake from tradeParams
   - `basis: "stake"`
   - `contract_type`: from tradeParams
   - `currency`: from tradeParams
   - `symbol`: from tradeParams
2. Handle duration based on durationType:
   - If "tick": Set `duration` and `duration_unit: "t"`
   - If "epoch": Calculate seconds from now, set `duration_unit: "s"`
3. Add barrier if present in tradeParams
4. Add barrier2 if present in tradeParams
5. Return complete request object

**Duration Calculation Logic**:
```javascript
if (tradeParams.durationType === 'tick') {
    request.duration = tradeParams.duration;
    request.duration_unit = 't';
} else {
    // Epoch-based: calculate seconds from now
    const now = Math.floor(Date.now() / 1000);
    const expiryTime = parseInt(tradeParams.duration);
    request.duration = expiryTime - now;
    request.duration_unit = 's';
}
```

### 3. CopyTradingManager.updateReplicationResultsUI()

**Purpose**: Updates the user interface with replication results and statistics.

**Signature**:
```javascript
updateReplicationResultsUI(successCount, failCount, results)
```

**Parameters**:
- `successCount`: Number (successful replications)
- `failCount`: Number (failed replications)
- `results`: Array<ReplicationResult>

**Returns**: void

**Behavior**:
1. Find the UI element with ID "connection-details"
2. Create HTML summary with success/fail counts
3. For each result in results array:
   - If success: Display ✅ with follower ID, contract ID, prices
   - If failure: Display ❌ with follower ID and error message
4. Append to existing UI content
5. Ensure proper formatting and readability

### 4. DerivConnection.send()

**Purpose**: Sends an API request and returns a promise that resolves with the response.

**Signature**:
```javascript
async send(request)
```

**Parameters**:
- `request`: Object (Deriv API request)

**Returns**: Promise<Object> (Deriv API response)

**Behavior**:
1. Check if WebSocket is connected
2. Assign unique request ID
3. Register response handler in messageHandlers map
4. Send request via WebSocket
5. Wait for response
6. Resolve promise with response or reject with error

## Data Models

### TradeParameters

```javascript
{
    contractType: String,      // "DIGITOVER", "CALL", "PUT", etc.
    symbol: String,            // "R_100", "EURUSD", etc.
    stake: Number,             // Amount to wager
    currency: String,          // "USD", "EUR", etc.
    duration: Number,          // Ticks or epoch timestamp
    durationType: String,      // "tick" or "epoch"
    barrier: String,           // Optional, for digit trades
    barrier2: String,          // Optional, for range trades
    limitOrder: Object,        // Optional, take profit/stop loss
    contractId: String,        // Master contract ID
    shortcode: String,         // Deriv shortcode
    displayName: String,       // Human-readable name
    entrySpot: Number,         // Entry price
    entrySpotDisplay: String   // Formatted entry price
}
```

### ProposalRequest

```javascript
{
    proposal: 1,
    amount: Number,            // Stake amount
    basis: "stake",
    contract_type: String,     // Contract type
    currency: String,          // Currency
    symbol: String,            // Trading symbol
    duration: Number,          // Duration value
    duration_unit: String,     // "t" for ticks, "s" for seconds
    barrier: String,           // Optional
    barrier2: String           // Optional
}
```

### ProposalResponse

```javascript
{
    proposal: {
        id: String,            // Proposal ID for buying
        ask_price: Number,     // Cost of the contract
        payout: Number,        // Potential payout
        spot: Number,          // Current spot price
        display_value: String  // Formatted display
    },
    error: {                   // Present if error occurred
        message: String,
        code: String
    }
}
```

### BuyRequest

```javascript
{
    buy: String,               // Proposal ID
    price: Number              // Maximum price willing to pay
}
```

### BuyResponse

```javascript
{
    buy: {
        contract_id: String,   // New contract ID
        buy_price: Number,     // Actual purchase price
        payout: Number,        // Potential payout
        balance_after: Number, // Account balance after purchase
        longcode: String,      // Full contract description
        shortcode: String      // Short contract code
    },
    error: {                   // Present if error occurred
        message: String,
        code: String
    }
}
```

### ReplicationResult

```javascript
{
    success: Boolean,          // true if replicated successfully
    follower: String,          // Follower account loginid
    contractId: String,        // New contract ID (if success)
    buyPrice: Number,          // Purchase price (if success)
    payout: Number,            // Potential payout (if success)
    error: String              // Error message (if failure)
}
```

### ReplicationStatistics

```javascript
{
    totalTrades: Number,           // Total trades replicated
    successfulReplications: Number, // Total successful replications
    failedReplications: Number      // Total failed replications
}
```

### TradeHistoryEntry

```javascript
{
    timestamp: Date,           // When trade was detected
    contractId: String,        // Master contract ID
    params: TradeParameters,   // Extracted parameters
    replications: Array<ReplicationResult> // Results for each follower
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas where properties can be consolidated:

- **Proposal Request Field Properties (3.1, 3.2, 3.3)**: These three properties all check that specific fields are included in proposal requests. They can be combined into a single comprehensive property that validates all required fields are present.

- **Statistics Counter Properties (5.1, 5.2, 5.3)**: These properties all verify counter increments. They can be combined into a single property that validates the relationship between total trades and the sum of successes and failures.

- **UI Display Properties (6.1, 6.2, 6.3, 6.4)**: These properties all verify UI content. They can be combined into a single property that validates the complete UI structure for replication results.

- **Contract Type Support (8.1, 8.2, 8.3, 8.4)**: These are all examples of specific contract types. Rather than separate properties, these should be tested as examples with a single property validating that all supported types work correctly.

### Property 1: Replication Initiation for All Followers

*For any* detected trade and any set of connected follower accounts, when replication is initiated, the system should attempt to replicate the trade to every follower in the set.

**Validates: Requirements 1.1**

### Property 2: Proposal Request Construction Completeness

*For any* trade parameters, when building a proposal request, the resulting request should contain all required fields: proposal=1, amount (from stake), basis="stake", contract_type, currency, symbol, duration, and duration_unit.

**Validates: Requirements 1.2, 3.1, 3.2, 3.3, 3.8**

### Property 3: Tick-Based Duration Handling

*For any* trade parameters with durationType="tick", when building a proposal request, the request should have duration_unit="t" and duration equal to the tick count from the parameters.

**Validates: Requirements 3.4**

### Property 4: Epoch-Based Duration Calculation

*For any* trade parameters with durationType="epoch" and a future expiry time, when building a proposal request, the request should have duration_unit="s" and duration equal to (expiry_time - current_time) in seconds, where the result is positive.

**Validates: Requirements 3.5**

### Property 5: Barrier Inclusion for Barrier-Required Contracts

*For any* trade parameters where contractType is one of [DIGITOVER, DIGITUNDER, DIGITMATCH, DIGITDIFF] and a barrier value is present, when building a proposal request, the request should include the barrier parameter with the exact value from the trade parameters.

**Validates: Requirements 3.6, 8.5**

### Property 6: Second Barrier Inclusion for Range Trades

*For any* trade parameters where barrier2 is present, when building a proposal request, the request should include the barrier2 parameter with the exact value from the trade parameters.

**Validates: Requirements 3.7**

### Property 7: Proposal Validation Before Buy

*For any* proposal response, when processing the response, the system should only proceed to send a buy request if the response contains a valid proposal object without errors.

**Validates: Requirements 1.3, 1.4**

### Property 8: Successful Replication Recording

*For any* successful buy response containing a buy object with contract_id, buy_price, and payout, when recording the replication result, the result should have success=true and include the follower identifier, contract ID, buy price, and payout.

**Validates: Requirements 1.5**

### Property 9: Failed Replication Recording

*For any* failed replication (proposal error, buy error, or exception), when recording the replication result, the result should have success=false and include the follower identifier and error message.

**Validates: Requirements 1.6, 4.1, 4.3, 4.4, 4.5**

### Property 10: Error Isolation Between Followers

*For any* set of follower accounts where at least one replication fails, when processing all followers, the system should still attempt replication for all remaining followers and return results for every follower in the set.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 11: Complete Results Return

*For any* set of N follower accounts, when replication completes, the returned results array should contain exactly N replication results, one for each follower.

**Validates: Requirements 2.3**

### Property 12: Statistics Consistency

*For any* replication operation, after completion, the relationship (totalTrades * number_of_followers) = (successfulReplications + failedReplications) should hold true, accounting for all replications across all trades.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 13: Trade History Association

*For any* replicated trade with master contract ID, when storing replication results, the results should be associated with the trade history entry that has the matching master contract ID.

**Validates: Requirements 7.1, 7.2**

### Property 14: Trade History Size Limit

*For any* sequence of more than 50 trades, when all trades are added to history, the history should contain exactly the last 50 trades in chronological order with the oldest trades removed.

**Validates: Requirements 7.3**

### Property 15: UI Results Display Completeness

*For any* replication results array, when displaying results in the UI, the UI should contain: (1) a summary with success and failure counts, (2) for each successful result: ✅ indicator, follower ID, contract ID, buy price, and payout, (3) for each failed result: ❌ indicator, follower ID, and error message.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

## Error Handling

### Error Categories

1. **Proposal Errors**
   - Invalid parameters (wrong symbol, invalid duration, etc.)
   - Market closed
   - Insufficient balance
   - Contract type not available

2. **Buy Errors**
   - Price changed (proposal expired)
   - Insufficient balance
   - Market suspended
   - Contract no longer available

3. **Connection Errors**
   - WebSocket disconnected
   - Network timeout
   - API unavailable

4. **System Errors**
   - Unexpected exceptions
   - Malformed responses
   - Missing required data

### Error Handling Strategy

**Per-Follower Isolation**:
```javascript
for (const [token, connection] of this.followerConnections) {
    try {
        // Attempt replication
        const result = await replicateToFollower(connection, tradeParams);
        results.push(result);
    } catch (error) {
        // Catch and record error, continue with next follower
        results.push({
            success: false,
            follower: connection.accountInfo?.loginid || 'Unknown',
            error: error.message
        });
    }
}
```

**Validation at Each Step**:
```javascript
// Validate proposal response
if (proposal.error) {
    throw new Error(proposal.error.message);
}
if (!proposal.proposal) {
    throw new Error('No proposal received');
}

// Validate buy response
if (buyResponse.error) {
    throw new Error(buyResponse.error.message);
}
if (!buyResponse.buy) {
    throw new Error('No buy confirmation received');
}
```

**Graceful Degradation**:
- If some followers fail, successful replications still complete
- Statistics track both successes and failures
- UI shows detailed status for each follower
- User can identify and address specific follower issues

### Error Messages

All error messages should be:
- **Descriptive**: Clearly state what went wrong
- **Actionable**: Suggest what the user can do
- **Specific**: Include relevant details (follower ID, error code)

Examples:
- "Proposal failed for follower CR123456: Invalid symbol 'XYZ'"
- "Buy failed for follower CR789012: Insufficient balance"
- "Connection unavailable for follower CR345678: WebSocket disconnected"

## Testing Strategy

### Dual Testing Approach

The system requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Test specific contract types (CALL, PUT, DIGITOVER, etc.)
- Test edge cases (empty follower list, all failures, all successes)
- Test UI element updates
- Test statistics reset on stop

**Property-Based Tests**: Verify universal properties across all inputs
- Generate random trade parameters and verify proposal construction
- Generate random follower sets and verify isolation
- Generate random success/failure combinations and verify statistics
- Generate random results and verify UI contains required elements

### Property-Based Testing Configuration

**Framework**: Use `fast-check` for JavaScript property-based testing

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `// Feature: copy-trading-phase3, Property N: [property text]`

**Example Property Test Structure**:
```javascript
// Feature: copy-trading-phase3, Property 2: Proposal Request Construction Completeness
test('proposal request contains all required fields', () => {
    fc.assert(
        fc.property(
            tradeParametersArbitrary(),
            (tradeParams) => {
                const request = buildProposalRequest(tradeParams);
                
                expect(request.proposal).toBe(1);
                expect(request.amount).toBe(tradeParams.stake);
                expect(request.basis).toBe('stake');
                expect(request.contract_type).toBe(tradeParams.contractType);
                expect(request.currency).toBe(tradeParams.currency);
                expect(request.symbol).toBe(tradeParams.symbol);
                expect(request.duration).toBeDefined();
                expect(request.duration_unit).toBeDefined();
            }
        ),
        { numRuns: 100 }
    );
});
```

### Test Data Generators

**Trade Parameters Generator**:
```javascript
const tradeParametersArbitrary = () => fc.record({
    contractType: fc.constantFrom('CALL', 'PUT', 'DIGITOVER', 'DIGITUNDER', 
                                   'DIGITEVEN', 'DIGITODD', 'DIGITMATCH', 'DIGITDIFF'),
    symbol: fc.constantFrom('R_100', 'R_50', 'EURUSD', 'GBPUSD'),
    stake: fc.integer({ min: 1, max: 1000 }),
    currency: fc.constantFrom('USD', 'EUR', 'GBP'),
    duration: fc.integer({ min: 1, max: 100 }),
    durationType: fc.constantFrom('tick', 'epoch'),
    barrier: fc.option(fc.integer({ min: 0, max: 9 }).map(String)),
    barrier2: fc.option(fc.integer({ min: 0, max: 9 }).map(String))
});
```

**Follower Set Generator**:
```javascript
const followerSetArbitrary = () => fc.array(
    fc.record({
        loginid: fc.string({ minLength: 8, maxLength: 10 }),
        connected: fc.boolean(),
        willSucceed: fc.boolean()
    }),
    { minLength: 1, maxLength: 10 }
);
```

### Unit Test Coverage

**Core Functionality**:
- `buildProposalRequest()` with each contract type
- `replicateTradeToFollowers()` with 0, 1, and multiple followers
- Error handling for each error category
- Statistics updates for various scenarios

**Edge Cases**:
- Empty follower list
- All replications succeed
- All replications fail
- Mixed success/failure
- Connection unavailable
- Malformed API responses
- Missing proposal object
- Missing buy object

**Integration Points**:
- UI updates after replication
- Trade history updates
- Statistics persistence across multiple trades
- Statistics reset on stop

### Test Execution

**Running Tests**:
```bash
# Run all tests
npm test

# Run property tests only
npm test -- --grep "Property"

# Run unit tests only
npm test -- --grep -v "Property"

# Run with coverage
npm test -- --coverage
```

**Expected Coverage**:
- Line coverage: >90%
- Branch coverage: >85%
- Function coverage: >95%

### Manual Testing Checklist

- [ ] Place trade on master account, verify replication to all followers
- [ ] Test with 1, 3, and 5 follower accounts
- [ ] Test each contract type (CALL, PUT, DIGITOVER, etc.)
- [ ] Test with insufficient balance on one follower
- [ ] Test with disconnected follower
- [ ] Verify UI shows correct success/failure counts
- [ ] Verify UI shows details for each follower
- [ ] Verify statistics accumulate correctly across multiple trades
- [ ] Verify trade history stores replication results
- [ ] Verify history limited to 50 trades
- [ ] Test with demo accounts only
