# Requirements Document: Copy Trading Trade Replication (Phase 3)

## Introduction

This document specifies the requirements for completing Phase 3 of the Copy Trading system: Trade Replication. Phase 3 builds upon the completed Phase 1 (API Connection & Authentication) and Phase 2 (Trade Monitoring) to enable automatic replication of trades from a master account to multiple follower accounts.

The system must reliably replicate trades detected from the master account to all connected follower accounts, handling errors gracefully and providing real-time feedback on replication status. Each follower operates independently, ensuring that a failure in one follower's replication does not affect others.

## Glossary

- **Master_Account**: The trading account being monitored whose trades will be replicated
- **Follower_Account**: A trading account that automatically replicates trades from the Master_Account
- **Trade_Replication**: The process of placing an identical or proportional trade on a Follower_Account based on a trade from the Master_Account
- **Trade_Parameters**: The extracted details of a trade including contract type, symbol, stake, duration, barriers, and currency
- **Proposal_Request**: An API request to Deriv to get pricing and validation for a potential trade
- **Buy_Request**: An API request to Deriv to execute a trade based on an approved proposal
- **Replication_Result**: The outcome (success or failure) of attempting to replicate a trade to a specific Follower_Account
- **Replication_Statistics**: Aggregate metrics tracking total trades, successful replications, and failed replications
- **Contract_Type**: The type of trading contract (CALL, PUT, DIGITOVER, DIGITUNDER, DIGITEVEN, DIGITODD, DIGITMATCH, DIGITDIFF)
- **Deriv_API**: The WebSocket API provided by Deriv for trading operations
- **DerivConnection**: A class managing WebSocket connection and API communication for a single account

## Requirements

### Requirement 1: Trade Replication Execution

**User Story:** As a copy trading user, I want trades from my master account to be automatically replicated to all my follower accounts, so that I can scale my trading strategy across multiple accounts.

#### Acceptance Criteria

1. WHEN a trade is detected from the Master_Account, THE System SHALL initiate replication to all connected Follower_Accounts
2. WHEN replicating a trade, THE System SHALL build a Proposal_Request using the Trade_Parameters extracted from the Master_Account trade
3. WHEN a Proposal_Request is sent to a Follower_Account, THE System SHALL validate the proposal response before proceeding
4. WHEN a valid proposal is received, THE System SHALL send a Buy_Request to execute the trade on the Follower_Account
5. WHEN a Buy_Request succeeds, THE System SHALL record the Replication_Result as successful with the new contract ID and trade details
6. WHEN a Buy_Request fails, THE System SHALL record the Replication_Result as failed with the error message

### Requirement 2: Independent Follower Processing

**User Story:** As a copy trading user, I want each follower account to replicate trades independently, so that a problem with one account doesn't prevent others from trading.

#### Acceptance Criteria

1. WHEN replicating to multiple Follower_Accounts, THE System SHALL process each follower sequentially in isolation
2. WHEN a replication fails for one Follower_Account, THE System SHALL continue processing remaining Follower_Accounts
3. WHEN all Follower_Accounts have been processed, THE System SHALL return the complete list of Replication_Results
4. WHEN a Follower_Account connection is unavailable, THE System SHALL record a failure for that follower and continue with others

### Requirement 3: Proposal Request Construction

**User Story:** As a system developer, I want the system to correctly construct proposal requests from trade parameters, so that follower trades match the master trade specifications.

#### Acceptance Criteria

1. WHEN building a Proposal_Request, THE System SHALL include the contract_type from Trade_Parameters
2. WHEN building a Proposal_Request, THE System SHALL include the symbol from Trade_Parameters
3. WHEN building a Proposal_Request, THE System SHALL include the stake amount and currency from Trade_Parameters
4. WHEN the Trade_Parameters indicate tick-based duration, THE System SHALL set duration_unit to 't' and duration to the tick count
5. WHEN the Trade_Parameters indicate epoch-based duration, THE System SHALL calculate seconds from current time to expiry and set duration_unit to 's'
6. WHEN the Contract_Type requires a barrier (DIGITOVER, DIGITUNDER, DIGITMATCH, DIGITDIFF), THE System SHALL include the barrier parameter
7. WHEN the Contract_Type requires a second barrier (range trades), THE System SHALL include the barrier2 parameter
8. THE System SHALL set basis to 'stake' for all Proposal_Requests

### Requirement 4: Error Handling and Validation

**User Story:** As a copy trading user, I want the system to handle errors gracefully and provide clear feedback, so that I understand what went wrong when replication fails.

#### Acceptance Criteria

1. WHEN a Proposal_Request returns an error, THE System SHALL capture the error message and mark the replication as failed
2. WHEN a proposal response is missing the proposal object, THE System SHALL treat it as an error and mark the replication as failed
3. WHEN a Buy_Request returns an error, THE System SHALL capture the error message and mark the replication as failed
4. WHEN any exception occurs during replication to a Follower_Account, THE System SHALL catch the exception and record it as a failed replication
5. WHEN recording a failed replication, THE System SHALL include the Follower_Account identifier and error message in the Replication_Result

### Requirement 5: Replication Statistics Tracking

**User Story:** As a copy trading user, I want to see statistics on how many trades have been replicated successfully, so that I can monitor the system's reliability.

#### Acceptance Criteria

1. WHEN a trade replication completes, THE System SHALL increment the totalTrades counter in Replication_Statistics
2. WHEN a replication succeeds for a Follower_Account, THE System SHALL increment the successfulReplications counter
3. WHEN a replication fails for a Follower_Account, THE System SHALL increment the failedReplications counter
4. THE System SHALL maintain Replication_Statistics across multiple trades during a copy trading session
5. WHEN copy trading is stopped, THE System SHALL reset Replication_Statistics to zero

### Requirement 6: Replication Results Display

**User Story:** As a copy trading user, I want to see real-time feedback on trade replication results, so that I know immediately if trades were successfully copied to my follower accounts.

#### Acceptance Criteria

1. WHEN a trade replication completes, THE System SHALL display a summary showing the count of successful and failed replications
2. WHEN displaying replication results, THE System SHALL show details for each Follower_Account including success/failure status
3. WHEN a replication succeeds, THE System SHALL display the Follower_Account identifier, contract ID, buy price, and payout
4. WHEN a replication fails, THE System SHALL display the Follower_Account identifier and error message
5. WHEN displaying results, THE System SHALL update the UI element with ID 'connection-details'

### Requirement 7: Replication History Tracking

**User Story:** As a copy trading user, I want to see a history of replicated trades with their outcomes, so that I can review past replication performance.

#### Acceptance Criteria

1. WHEN a trade is replicated, THE System SHALL store the Replication_Results in the trade history entry
2. WHEN storing Replication_Results, THE System SHALL associate them with the corresponding Master_Account trade by contract ID
3. THE System SHALL maintain replication history for the last 50 trades
4. WHEN the trade history exceeds 50 entries, THE System SHALL remove the oldest entry
5. WHEN displaying trade history, THE System SHALL show replication status for each follower

### Requirement 8: Contract Type Support

**User Story:** As a copy trading user, I want the system to support all contract types that I can trade on my master account, so that I'm not limited in my trading strategies.

#### Acceptance Criteria

1. THE System SHALL support replication of CALL and PUT contract types (Rise/Fall)
2. THE System SHALL support replication of DIGITOVER and DIGITUNDER contract types with barriers
3. THE System SHALL support replication of DIGITEVEN and DIGITODD contract types
4. THE System SHALL support replication of DIGITMATCH and DIGITDIFF contract types with barriers
5. WHEN replicating contracts with barriers, THE System SHALL preserve the exact barrier values from the Master_Account trade

### Requirement 9: Logging and Debugging

**User Story:** As a system developer, I want comprehensive logging of the replication process, so that I can debug issues and monitor system behavior.

#### Acceptance Criteria

1. WHEN starting trade replication, THE System SHALL log the number of Follower_Accounts being processed
2. WHEN replicating to each Follower_Account, THE System SHALL log the follower identifier
3. WHEN a proposal is received, THE System SHALL log whether it was successful or contained an error
4. WHEN a trade is executed, THE System SHALL log the contract ID and trade details
5. WHEN replication completes, THE System SHALL log a summary with success and failure counts
6. WHEN any error occurs, THE System SHALL log the error message to the console

### Requirement 10: UI Integration

**User Story:** As a copy trading user, I want the replication status and results to be clearly displayed in the interface, so that I can monitor the system without checking the console.

#### Acceptance Criteria

1. WHEN copy trading is active, THE System SHALL display replication results in the main UI
2. WHEN displaying replication results, THE System SHALL use visual indicators (✅ for success, ❌ for failure)
3. WHEN a trade is replicated, THE System SHALL update the UI within 1 second of completion
4. THE System SHALL display cumulative Replication_Statistics in the UI
5. WHEN the UI is updated, THE System SHALL maintain readability and not overflow the display area
