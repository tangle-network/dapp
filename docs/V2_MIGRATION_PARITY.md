# V2 EVM Migration - Feature Parity Analysis

## Overview

This document tracks the feature parity between the v1 Substrate-based dApp and the v2 EVM-based protocol.
Canonical identifiers that include `Restake/Restaking` are kept verbatim only when they must match existing hook names, component paths, or GraphQL schema fields for compatibility and code search.

---

## Feature Parity Matrix

### ✅ MIGRATE - Features with V2 Equivalent

| Feature | V1 Implementation | V2 Equivalent | Migration Notes |
|---------|------------------|---------------|-----------------|
| **Deposit Assets** | `useRestakeDepositTx` → `multiAssetDelegation.deposit()` | `MultiAssetDelegation.deposit(token, amount, lock)` | Add lock duration parameter |
| **Delegate to Operator** | `useRestakeDelegateTx` → Substrate + EVM precompile | `MultiAssetDelegation.delegate(operator, token, amount, selectionMode, blueprintIds)` | Add blueprint selection |
| **Undelegate** | `useRestakeUndelegateTx` → Schedule + Execute | `scheduleDelegatorUnstake()` → `executeDelegatorUnstake()` | Same pattern, round-based |
| **Withdraw** | `useRestakeWithdrawTx` → Schedule + Execute | `scheduleWithdraw()` → `executeWithdraw()` | Same pattern, round-based |
| **Join as Operator** | `useJoinOperatorsTx` | `MultiAssetDelegation.registerOperator()` | Per-blueprint registration |
| **Operator Directory** | `useRestakeOperatorMap` | GraphQL: `operators` query | Address format change |
| **Asset Balances** | `useRestakeAssetBalances` | GraphQL: `delegatorAssetPositions` | Token-based instead of assetId |
| **Staking Assets** | `useRestakeAssets` | GraphQL: `restakingAssets` | Same concept |
| **Current Round** | `useRestakeCurrentRound` | GraphQL: `restakingRounds` | Same concept |
| **TVL Display** | `useRestakeAssetsTvl` | GraphQL: Aggregate from `restakingAssets.currentDeposits` | Same concept |
| **Vault Overview** | Dashboard page | Dashboard page | Keep UI, update data source |
| **Token Transfer** | `useTransferTx` (agnostic) | EVM transfer | Already has EVM factory |
| **Balance Queries** | `useTokenWalletFreeBalance` | Viem `getBalance()` | Standard EVM |
| **Blueprint Listing** | `/blueprints` page | GraphQL: `blueprints` query | Same concept |
| **Blueprint Details** | `/blueprints/:id` page | GraphQL: `blueprint(id)` query | Same concept |
| **Service Management** | Via Substrate | `Tangle.requestService()`, `terminateService()` | New contract calls |
| **Job Submission** | Via Substrate | `Tangle.submitJob()` | New contract calls |

### ✅ MIGRATE - New V2 Features to Add

| Feature | V2 Implementation | UI Needed |
|---------|------------------|-----------|
| **Lock Duration Multipliers** | `deposit(token, amount, lock)` with 1-6 month locks | Lock selector in deposit form |
| **Blueprint Selection Mode** | `delegateWithOptions(... selectionMode, blueprintIds)` | All vs Fixed mode picker |
| **Liquid Delegation Vaults** | `LiquidDelegationVault` ERC7540 | New vault deposit/redeem UI |
| **Service Requests** | `Tangle.requestService()` | Service request form |
| **Operator Service Joining** | `Tangle.joinService()` | Operator dashboard |
| **Slash Disputes** | `Tangle.disputeSlash()` | Slash notification UI |

### ❌ REMOVE - Substrate-Only Features

| Feature | V1 Implementation | Reason for Removal |
|---------|------------------|-------------------|
| **Traditional Staking** | `/nomination` page, 20+ hooks | Substrate staking pallet - replaced by EVM staking/delegation flows |
| **Validator Selection** | `useValidators`, validator tables | Substrate validator set - replaced by operator model |
| **Nominator Stats** | `useNominations`, stats cards | Substrate nominators - replaced by delegators |
| **Era Payouts** | `usePayoutStakersTx`, payouts table | Substrate era rewards - replaced by real-time rewards |
| **Liquid Staking Pools** | `/liquid-staking` page, 30+ hooks | Substrate LST pallet - not in v2 |
| **Airdrop Claims** | `/claim` page | One-time launch event - completed |
| **Democracy Voting** | `useDemocracy` hooks | Substrate democracy - no EVM equivalent |

### ❓ UNCERTAIN - Needs Verification

| Feature | V1 Implementation | Status |
|---------|------------------|--------|
| **Vesting Schedules** | `useVestingInfo`, `useVestTx` | Check if v2 has vesting contract |
| **Credits System** | `useCredits`, `useClaimCreditsTx` | GraphQL has `CreditBalance` - verify contract |
| **Bridge (Hyperlane)** | `/bridge` page | Infrastructure exists - verify chain configs |

---

## Data Hook Migration Map

### From Substrate RxJS to GraphQL

| V1 Hook | V2 Replacement | Query |
|---------|---------------|-------|
| `useRestakeOperatorMap` | `useOperatorMap` | `operators` with legacy `restaking*` schema fields (canonical names) |
| `useRestakeDelegatorInfo` | `useDelegator` | `delegator` with positions |
| `useRestakeDelegations` | `useDelegatorDelegations` | `delegationPositions` |
| `useRestakeDeposits` | `useDelegatorDeposits` | `delegatorAssetPositions` |
| `useRestakeAssets` | `useRestakingAssets` | `restakingAssets` |
| `useRestakeCurrentRound` | `useRestakingRound` | `restakingRounds` |
| `useRestakeVaults` | TBD | `rewardVaults` |
| `useRestakeAssetsTvl` | Derive from assets | Aggregate `currentDeposits` |

### Transaction Hook Migration

| V1 Hook | V2 Replacement | Contract Call |
|---------|---------------|---------------|
| `useRestakeDepositTx` | `useDepositTx` | `MultiAssetDelegation.deposit()` |
| `useRestakeDelegateTx` | `useDelegateTx` | `MultiAssetDelegation.delegate()` |
| `useRestakeUndelegateTx` | `useScheduleUnstakeTx` | `MultiAssetDelegation.scheduleDelegatorUnstake()` |
| `useRestakeWithdrawTx` | `useScheduleWithdrawTx` | `MultiAssetDelegation.scheduleWithdraw()` |
| `useRestakeWithdrawExecuteTx` | `useExecuteWithdrawTx` | `MultiAssetDelegation.executeWithdraw()` |
| `useNativeRestakeUnstakeExecuteTx` | `useExecuteUnstakeTx` | `MultiAssetDelegation.executeDelegatorUnstake()` |

---

## UI Component Categorization

### KEEP - Reusable Components (45+)
- Input components: `TextInput`, `AmountInput`, `AddressInput`, `PercentageInput`
- Display components: `StatItem`, `HeaderChip`, `PillCard`, `ErrorMessage`
- Table infrastructure: `tableCells/*`, base table components
- List components: `AssetList`, `ChainList`, `ListItem` variants
- Layout components: `DetailsContainer`, `Sidebar`
- Account components: `Balance`, `AccountAddress`
- Generic modals and cards

### MIGRATE - Staking Components (15+)
- `BlueprintSelection.tsx` - Add selection mode
- Detail card components (`RestakeDetailCard/*`, canonical path name) - Update data bindings
- `UnstakeRequestTable.tsx` - Same concept
- `WithdrawRequestTable.tsx` - Same concept
- Operator selection components

### REMOVE - Substrate-Specific Components (30+)
- All `/containers/LiquidStaking/*`
- All `/containers/Nomination/*`
- All `/containers/Payout*`
- All `/components/LiquidStaking/*`
- `ValidatorTable.tsx` (nomination-specific)
- `NominationsTable.tsx`
- `PayoutsTable.tsx`

---

## Migration Phases

### Phase 4.1: tangle-dapp Migration
1. Update staking hooks to use new GraphQL hooks (keep canonical `useRestake*` identifiers where required)
2. Update transaction hooks to use new contract calls
3. Update UI components with new data bindings
4. Remove nomination/LST pages and components
5. Test all staking flows

### Phase 4.2: tangle-cloud Migration
1. Update blueprint data to GraphQL
2. Update service management to contract calls
3. Update operator registration flow
4. Test blueprint deployment flow

### Phase 4.3: leaderboard Migration
1. Switch GraphQL endpoint to Envio
2. Update queries for new schema
3. Update points display

---

## Critical Checks Before Removing Code

Before deleting any file, verify:
1. ✅ No imports from other files that will remain
2. ✅ Feature is truly Substrate-only (not used in EVM mode)
3. ✅ UI component not reused elsewhere
4. ✅ No equivalent needed in v2

---

## Files to DELETE (Confirmed Obsolete)

### Substrate-Only Libraries
- `libs/polkadot-api-provider/` - Entire directory
- `libs/solana-api-provider/` - Entire directory (if exists)

### Substrate-Only Hooks in tangle-shared-ui
- `src/hooks/useApiRx.ts`
- `src/hooks/useApi.ts`
- `src/hooks/useSubstrateTx.ts`
- `src/hooks/useSubstrateAddress.ts`
- `src/hooks/useSubstrateInjectedExtension.ts`
- `src/utils/polkadot/*`

### tangle-dapp Nomination/LST (after UI migration)
- `src/pages/nomination/*`
- `src/pages/liquid-staking/*`
- `src/pages/claim/*`
- `src/data/staking/*`
- `src/data/nomination/*`
- `src/data/liquidStaking/*`
- `src/data/payouts/*`
- `src/containers/LiquidStaking/*`
- `src/containers/*Nomination*`
- `src/containers/*Payout*`
- `src/components/LiquidStaking/*`

---

## Files to KEEP (Reusable/Generic)

### Core Infrastructure
- `libs/web3-api-provider/` - EVM provider
- `libs/dapp-config/` - Chain configs (update for v2)
- `libs/dapp-types/` - Type definitions (remove Substrate types)
- `libs/ui-components/` - Generic UI library
- `libs/browser-utils/` - Browser utilities
- `libs/icons/` - Icon components

### Generic Hooks
- `src/hooks/useEvmAddress.ts`
- `src/hooks/useContractRead.ts`
- `src/hooks/useContractWrite.ts` (new)
- `src/hooks/useViemPublicClient.ts`

### Generic Components
- All input components
- All table cell components
- All layout components
- Account display components
