# Implementation Plan: Copy Trading Trade Replication (Phase 3)

## Overview

This implementation plan completes the Copy Trading system by implementing the trade replication engine. The work focuses on completing the `replicateTradeToFollowers()` method and related functionality to place trades on follower accounts based on master account trades.

The implementation builds on the existing Phase 1 (API Connection) and Phase 2 (Trade Monitoring) infrastructure. All code will be added to the existing `public/ai/copy-trading.html` file.

## Tasks

- [ ] 1. Complete buildProposalRequest() method implementation
  - Implement the method to construct Deriv API proposal requests from trade parameters
  - Handle tick-based duration (duration_unit: 't')
  - Handle epoch-based duration (calculate seconds from now, duration_unit: 's')
  - Include barrier parameter for barrier-required contract types
  - Include barrier2 parameter when present
  - Set basis to 'stake' for all requests
  - _Requirements: 1.2, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ]* 1.1 Write property test for buildProposalRequest()
  - **Property 2: Proposal Request Construction Completeness**
  - **Validates: Requirements 1.2, 3.1, 3.2, 3.3, 3.8**

- [ ]* 1.2 Write property test for tick-based duration handling
  - **Property 3: Tick-Based Duration Handling**
  - **Validates: Requirements 3.4**

- [ ]* 1.3 Write property test for epoch-based duration calculation
  - **Property 4: Epoch-Based Duration Calculation**
  - **Validates: Requirements 3.5**

- [ ]* 1.4 Write property test for barrier inclusion
  - **Property 5: Barrier Inclusion for Barrier-Required Contracts**
  - **Validates: Requirements 3.6, 8.5**

- [ ]* 1.5 Write property test for second barrier inclusion
  - **Property 6: Second Barrier Inclusion for Range Trades**
  - **Validates: Requirements 3.7**

- [ ] 2. Complete replicateTradeToFollowers() core replication logic
  - [ ] 2.1 Implement follower iteration with error isolation
    - Iterate through all follower connections using for...of loop
    - Wrap each follower's replication in try-catch block
    - Initialize result tracking arrays (replicationResults, successCount, failCount)
    - Log the number of followers being processed
    - _Requirements: 1.1, 2.1, 2.2, 2.4_

  - [ ]* 2.2 Write property test for error isolation
    - **Property 10: Error Isolation Between Followers**
    - **Validates: Requirements 2.2, 2.3, 2.4**

  - [ ] 2.3 Implement proposal request and validation
    - Call buildProposalRequest() with trade parameters
    - Send proposal request using connection.send()
    - Validate proposal response for errors
    - Validate proposal response contains proposal object
    - Throw descriptive errors for validation failures
    - Log proposal success/failure
    - _Requirements: 1.2, 1.3, 4.1, 4.2_

  - [ ]* 2.4 Write property test for proposal validation
    - **Property 7: Proposal Validation Before Buy**
    - **Validates: Requirements 1.3, 1.4**

  - [ ] 2.5 Implement buy request execution
    - Construct buy request with proposal ID and stake
    - Send buy request using connection.send()
    - Validate buy response for errors
    - Validate buy response contains buy object
    - Log trade execution details (contract ID, prices)
    - _Requirements: 1.4, 4.3_

  - [ ] 2.6 Implement success result recording
    - Create success result object with follower loginid
    - Include contract ID from buy response
    - Include buy price and payout from buy response
    - Increment successCount
    - Add result to replicationResults array
    - _Requirements: 1.5_

  - [ ]* 2.7 Write property test for successful replication recording
    - **Property 8: Successful Replication Recording**
    - **Validates: Requirements 1.5**

  - [ ] 2.8 Implement failure result recording in catch block
    - Create failure result object with follower loginid
    - Include error message from caught exception
    - Increment failCount
    - Add result to replicationResults array
    - Log error details
    - _Requirements: 1.6, 4.4, 4.5_

  - [ ]* 2.9 Write property test for failed replication recording
    - **Property 9: Failed Replication Recording**
    - **Validates: Requirements 1.6, 4.1, 4.3, 4.4, 4.5**

- [ ] 3. Checkpoint - Test basic replication with demo accounts
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement statistics tracking
  - [ ] 4.1 Update replication statistics after processing all followers
    - Increment this.replicationStats.totalTrades by 1
    - Add successCount to this.replicationStats.successfulReplications
    - Add failCount to this.replicationStats.failedReplications
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 4.2 Write property test for statistics consistency
    - **Property 12: Statistics Consistency**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

  - [ ] 4.3 Implement statistics reset on stop
    - Add reset logic to stop copy trading method
    - Set all counters to zero
    - _Requirements: 5.5_

  - [ ]* 4.4 Write unit test for statistics reset
    - Test that stopping copy trading resets all statistics to zero
    - _Requirements: 5.5_

- [ ] 5. Implement trade history updates
  - [ ] 5.1 Store replication results in trade history
    - Find trade history entry by masterContractId
    - Set the replications property to replicationResults array
    - _Requirements: 7.1, 7.2_

  - [ ]* 5.2 Write property test for trade history association
    - **Property 13: Trade History Association**
    - **Validates: Requirements 7.1, 7.2**

  - [ ] 5.3 Verify trade history size limit
    - Confirm existing code maintains 50-trade limit
    - Ensure oldest trades are removed when limit exceeded
    - _Requirements: 7.3_

  - [ ]* 5.4 Write property test for trade history size limit
    - **Property 14: Trade History Size Limit**
    - **Validates: Requirements 7.3**

- [ ] 6. Implement UI updates for replication results
  - [ ] 6.1 Complete updateReplicationResultsUI() method
    - Find UI element with ID 'connection-details'
    - Create summary HTML with success and fail counts
    - For each result, create HTML with appropriate indicator (✅/❌)
    - For success: show follower ID, contract ID, buy price, payout
    - For failure: show follower ID and error message
    - Append to existing UI content
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 6.2 Write property test for UI results display completeness
    - **Property 15: UI Results Display Completeness**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

  - [ ] 6.3 Add cumulative statistics display to UI
    - Display totalTrades, successfulReplications, failedReplications
    - Update statistics section after each replication
    - _Requirements: 10.4_

  - [ ]* 6.4 Write unit test for statistics display
    - Verify statistics appear in UI with correct values
    - _Requirements: 10.4_

  - [ ] 6.5 Add visual indicators for success/failure
    - Use ✅ emoji for successful replications
    - Use ❌ emoji for failed replications
    - _Requirements: 10.2_

  - [ ]* 6.6 Write unit test for visual indicators
    - Verify UI contains ✅ and ❌ indicators
    - _Requirements: 10.2_

- [ ] 7. Checkpoint - Test complete replication flow
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Add comprehensive error handling
  - [ ] 8.1 Add validation for missing proposal object
    - Check if proposal response contains proposal property
    - Throw error with message "No proposal received"
    - _Requirements: 4.2_

  - [ ] 8.2 Add validation for missing buy object
    - Check if buy response contains buy property
    - Throw error with message "No buy confirmation received"
    - _Requirements: 4.3_

  - [ ] 8.3 Enhance error messages with context
    - Include follower loginid in all error messages
    - Include specific error codes when available
    - Make error messages actionable
    - _Requirements: 4.5_

  - [ ]* 8.4 Write unit tests for error scenarios
    - Test proposal error handling
    - Test buy error handling
    - Test missing proposal object
    - Test missing buy object
    - Test connection unavailable
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Add support for all contract types
  - [ ]* 9.1 Write unit tests for each contract type
    - Test CALL and PUT (Rise/Fall)
    - Test DIGITOVER and DIGITUNDER with barriers
    - Test DIGITEVEN and DIGITODD
    - Test DIGITMATCH and DIGITDIFF with barriers
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 9.2 Write property test for barrier preservation
    - **Property 5: Barrier Inclusion for Barrier-Required Contracts**
    - Verify exact barrier values are preserved
    - _Requirements: 8.5_

- [ ] 10. Add comprehensive logging
  - [ ] 10.1 Add replication start logging
    - Log "📤 Starting replication to N follower(s)"
    - _Requirements: 9.1_

  - [ ] 10.2 Add per-follower logging
    - Log "🔄 Replicating to follower: {loginid}"
    - _Requirements: 9.2_

  - [ ] 10.3 Add proposal result logging
    - Log proposal success or error
    - _Requirements: 9.3_

  - [ ] 10.4 Add trade execution logging
    - Log "✅ Replicated to {loginid}: Contract {contractId}"
    - _Requirements: 9.4_

  - [ ] 10.5 Add replication summary logging
    - Log "📊 Replication complete: ✅ N success | ❌ M failed"
    - _Requirements: 9.5_

  - [ ] 10.6 Add error logging
    - Log "❌ Failed to replicate to {loginid}: {error}"
    - _Requirements: 9.6_

- [ ] 11. Final integration and testing
  - [ ] 11.1 Test complete flow with demo accounts
    - Connect master account
    - Add 2-3 follower accounts
    - Place various trade types on master
    - Verify replication to all followers
    - Verify UI updates correctly
    - Verify statistics are accurate
    - _Requirements: All_

  - [ ] 11.2 Test error scenarios
    - Test with insufficient balance on one follower
    - Test with invalid symbol
    - Test with disconnected follower
    - Verify other followers still succeed
    - _Requirements: 2.2, 2.4, 4.1, 4.3, 4.4_

  - [ ] 11.3 Test statistics across multiple trades
    - Place 5-10 trades on master
    - Verify statistics accumulate correctly
    - Verify trade history stores all results
    - _Requirements: 5.4, 7.1, 7.2, 7.3_

  - [ ]* 11.4 Write integration tests
    - Test end-to-end replication flow
    - Test multiple trades with multiple followers
    - Test mixed success/failure scenarios
    - _Requirements: All_

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All code changes are in `public/ai/copy-trading.html`
- Use demo accounts for all testing
- The existing `replicateTradeToFollowers()` method stub needs to be completed
- The existing `buildProposalRequest()` method is partially implemented and needs completion
- Property tests should use `fast-check` library with minimum 100 iterations
- Each property test must reference its design document property number
- Focus on error isolation - one follower's failure should not affect others
- Comprehensive logging helps with debugging and monitoring
- UI updates should be clear and informative for users
