# TNT-Core Contract Updates Tracking

This document tracks required changes in tangle-dapp to match recent tnt-core contract updates.

**Related Commits (tnt-core v2 branch):**
- `c061bf3` - refactor: rename restaking to staking across codebase
- `cb5ae5d` - feat(staking): add operator delegation config for securities compliance
- `471196c` - feat(staking): add canDelegate view function to interface

**Date:** 2026-01-26

---

## Summary of Contract Changes

### 1. Restaking → Staking Rename (c061bf3)

| Change | Old | New |
|--------|-----|-----|
| PaymentSplit field | `restakerBps` | `stakerBps` |
| Module path | `restaking/` | `staking/` |
| Interface | `IRestaking` | `IStaking` |

### 2. Operator Delegation Config (cb5ae5d) - BREAKING CHANGE

New `DelegationMode` enum:
- `Disabled (0)` - Only operator can self-stake **(DEFAULT)**
- `Whitelist (1)` - Only approved addresses can delegate
- `Open (2)` - Anyone can delegate

New functions on `IMultiAssetDelegation`:
- `setDelegationMode(mode)` - Operator sets delegation policy
- `setDelegationWhitelist(delegators[], approved)` - Batch whitelist management
- `getDelegationMode(operator)` - View operator's delegation mode
- `isWhitelisted(operator, delegator)` - Check whitelist status

New errors:
- `DelegationDisabled(address operator)`
- `DelegatorNotWhitelisted(address operator, address delegator)`

### 3. canDelegate View Function (471196c)

- `canDelegate(operator, delegator)` - Returns true if delegation is allowed

---

## Implementation Plan

All changes are related to **delegation to operators** functionality. The `restakerBps` → `stakerBps` rename is only in the ABI file and not used directly in app code.

### Implementation Order

**Group 1: Core Delegation Flow**
| Step | Change | Status |
|------|--------|--------|
| 1 | Sync ABI files | [x] |
| 2 | Create `useCanDelegate` hook | [x] |
| 3 | Update delegation flow to check permissions | [x] |
| 4 | Add error handling for new delegation errors | [x] |

**Group 1 Testing Checklist (Interface):**
- [ ] Delegate page loads without errors
- [ ] Operator selector shows delegation status indicators (Open/Whitelist/Self Only badges)
- [ ] Selecting an Open operator enables the Delegate button
- [ ] Selecting a Disabled operator shows "not accepting delegations" message and disables button
- [ ] Selecting a Whitelist operator (user whitelisted) enables the Delegate button
- [ ] Selecting a Whitelist operator (user not whitelisted) shows "not on whitelist" message and disables button
- [ ] Failed delegation shows user-friendly error message (not generic "Transaction failed")
- [ ] Loading states display correctly while checking delegation eligibility

---

**Group 2: Delegation Status Display**
| Step | Change | Status |
|------|--------|--------|
| 5 | Display delegation mode in operator tables | [ ] |
| 6 | Update Operator interface | [ ] Blocked by indexer |

**Group 2 Testing Checklist (Interface):**
- [ ] Operator table displays "Accepts Delegation" column
- [ ] Open operators show green "Open" badge
- [ ] Whitelist operators show yellow "Whitelist" badge
- [ ] Disabled operators show gray "Self Only" badge
- [ ] Hovering badges shows explanatory tooltip
- [ ] Filter dropdown allows filtering by delegation status
- [ ] Table sorting works with new column
- [ ] Table pagination/loading states work correctly

---

### Deferred

| Change | Reason |
|--------|--------|
| Operator delegation management UI (#7) | Low priority; operators can use CLI |

---

## Local Testing Setup

For local development and testing, use the scripts in tnt-core:

```bash
# One-shot setup: Start full local environment with all 3 operators configured
cd /path/to/tnt-core
./scripts/local-env/start-local-dev.sh
```

This automatically:
- Starts Anvil (local EVM chain)
- Deploys all contracts
- Registers 3 operators with different delegation modes
- Updates indexer config with correct contract addresses
- Starts PostgreSQL, Hasura, and Envio indexer

**Optional: Manual delegation mode adjustments**
```bash
./scripts/local-env/setup-delegation-modes.sh --verify  # Check current setup
```

**Test Accounts (Anvil defaults):**
| Account | Address | Role | Delegation Mode |
|---------|---------|------|-----------------|
| 1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | Operator 1 | **Disabled** (self-stake only) |
| 2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | Operator 2 | **Open** (anyone can delegate) |
| 4 | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | Operator 3 | **Whitelist** (only whitelisted) |
| 5 | `0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc` | Whitelisted Delegator | ✓ Whitelisted for Operator 3 |
| 6 | `0x976EA74026E726554dB657fA54763abd0C3a0aa9` | Non-whitelisted Delegator | ✗ Not whitelisted |

**Testing Delegation Modes:**
- Connect as Account 5 → Can delegate to Operator 2 (Open) and Operator 3 (Whitelist)
- Connect as Account 6 → Can only delegate to Operator 2 (Open)
- Attempting to delegate to Operator 1 → Should fail with "DelegationDisabled"
- Attempting to delegate to Operator 3 as Account 6 → Should fail with "DelegatorNotWhitelisted"

---

## Required Changes (Detailed)

### HIGH PRIORITY

---

#### 1. Sync ABI files from tnt-core

```bash
node scripts/sync-tnt-core-assets.mjs
```

**Status:** [ ] Not Done

**Why this is needed:**

The ABI (Application Binary Interface) files define the contract interface that the dapp uses to interact with smart contracts. When the contracts change, the ABIs must be updated to match. Currently:

1. **`tangle.ts` has outdated `PaymentSplit` struct:**
   - Line 2729: `name: 'restakerBps'` → should be `stakerBps`
   - Line 3275: `name: 'restakerBps'` → should be `stakerBps`
   - If code tries to read/write `PaymentSplit` from contract, field names won't match

2. **`multiAssetDelegation.ts` is missing new functions:**
   - Missing: `canDelegate`, `getDelegationMode`, `setDelegationMode`, `isWhitelisted`, `setDelegationWhitelist`
   - Missing: `DelegationMode` enum type
   - Without these, the dapp cannot call the new delegation permission functions

**What the sync script does:**

The script at `scripts/sync-tnt-core-assets.mjs`:
1. Reads JSON ABI files from `tnt-core/bindings/abi/`
2. Converts them to TypeScript exports
3. Writes to `libs/tangle-shared-ui/src/abi/`

**Files updated:**
| Source (tnt-core) | Target (dapp) |
|-------------------|---------------|
| `bindings/abi/ITangleFull.json` | `libs/tangle-shared-ui/src/abi/tangle.ts` |
| `bindings/abi/IMultiAssetDelegation.json` | `libs/tangle-shared-ui/src/abi/multiAssetDelegation.ts` |
| `bindings/abi/IOperatorStatusRegistry.json` | `libs/tangle-shared-ui/src/abi/operatorStatusRegistry.ts` |
| `bindings/abi/IBlueprintServiceManager.json` | `libs/tangle-shared-ui/src/abi/blueprintServiceManager.ts` |

---

#### 2. Update delegation flow to check permissions

**Status:** [ ] Not Done

**File:** `apps/tangle-dapp/src/pages/restake/delegate/index.tsx`

**Why this is needed:**

The contract now enforces delegation permissions. By default, operators have `DelegationMode.Disabled`, meaning **only the operator themselves can stake**. If a user tries to delegate to an operator who hasn't enabled delegations:

```
Before: Transaction succeeds (anyone could delegate to any operator)
After:  Transaction REVERTS with DelegationDisabled or DelegatorNotWhitelisted error
```

This is a **breaking change** - the current delegation UI will fail for most operators.

**What needs to be updated:**

1. **Add pre-flight check before delegation:**

   Current flow (lines 437-472):
   ```typescript
   const onSubmit = async ({ amount, assetId, operatorAddress }) => {
     // ... validation ...
     await executeDelegateTx({ operator, token, amount, ... });
   };
   ```

   New flow should be:
   ```typescript
   const onSubmit = async ({ amount, assetId, operatorAddress }) => {
     // Check if delegation is allowed BEFORE attempting tx
     const canDelegateResult = await publicClient.readContract({
       address: contracts.multiAssetDelegation,
       abi: MULTI_ASSET_DELEGATION_ABI,
       functionName: 'canDelegate',
       args: [operatorAddress, userAddress],
     });

     if (!canDelegateResult) {
       // Show error to user instead of failing transaction
       return;
     }

     await executeDelegateTx({ operator, token, amount, ... });
   };
   ```

2. **Update operator selection modal (lines 639-657):**

   Currently shows all active operators. Should either:
   - Filter to only operators accepting delegations, OR
   - Show a visual indicator (badge/icon) for delegation status, OR
   - Disable selection of operators not accepting delegations

3. **Add UI feedback for delegation status:**

   When user selects an operator, show their delegation mode:
   - "Open" - Anyone can delegate
   - "Whitelist Only" - Check if user is whitelisted
   - "Not Accepting Delegations" - Disable delegate button

**Specific code locations to modify:**

| Location | Current Behavior | New Behavior |
|----------|------------------|--------------|
| Line 343-354 (`operators` memo) | Filters by `restakingStatus === 'ACTIVE'` | Add delegation mode check |
| Line 437-472 (`onSubmit`) | Directly calls `executeDelegateTx` | Pre-check with `canDelegate` |
| Line 598-606 (submit button) | Disabled only for form errors | Also disable if operator doesn't accept delegations |

---

#### 3. Add error handling for new delegation errors

**Status:** [ ] Not Done

**File:** `libs/tangle-shared-ui/src/data/tx/useDelegateTx.ts`

**Why this is needed:**

When delegation fails due to the new permission checks, the contract reverts with specific error signatures:

```solidity
error DelegationDisabled(address operator);
error DelegatorNotWhitelisted(address operator, address delegator);
```

Without proper error handling, users see generic "Transaction failed" messages instead of actionable feedback.

**What needs to be updated:**

1. **Parse error signatures from failed transactions:**

   The error data from a reverted transaction contains the error selector (first 4 bytes of keccak256 hash):
   ```
   DelegationDisabled(address)        -> 0x... (calculate selector)
   DelegatorNotWhitelisted(address,address) -> 0x... (calculate selector)
   ```

2. **Add error decoding in the hook:**

   Current code (lines 53-88) uses `useContractWrite` which has generic error handling. Need to add specific error parsing:

   ```typescript
   // Error selectors (first 4 bytes of keccak256 hash of error signature)
   const DELEGATION_DISABLED_SELECTOR = '0x...'; // keccak256("DelegationDisabled(address)")[:4]
   const NOT_WHITELISTED_SELECTOR = '0x...';     // keccak256("DelegatorNotWhitelisted(address,address)")[:4]

   // In error handling:
   if (error.data?.startsWith(DELEGATION_DISABLED_SELECTOR)) {
     return 'This operator is not accepting delegations';
   }
   if (error.data?.startsWith(NOT_WHITELISTED_SELECTOR)) {
     return 'You are not on this operator\'s whitelist';
   }
   ```

3. **Update `getSuccessMessage` and add `getErrorMessage`:**

   Current (line 84-85):
   ```typescript
   getSuccessMessage: (params) =>
     `Successfully delegated ${params.amount.toString()} to operator`,
   ```

   Add error message handler:
   ```typescript
   getErrorMessage: (error, params) => {
     if (isDelegationDisabledError(error)) {
       return `Operator ${shortenHex(params.operator)} is not accepting delegations`;
     }
     if (isNotWhitelistedError(error)) {
       return `You are not whitelisted to delegate to ${shortenHex(params.operator)}`;
     }
     return 'Delegation failed';
   },
   ```

**User-facing error messages:**

| Error | Message |
|-------|---------|
| `DelegationDisabled` | "This operator is not accepting delegations. They may only allow self-staking." |
| `DelegatorNotWhitelisted` | "You are not on this operator's whitelist. Contact the operator to request access." |

---

### MEDIUM PRIORITY

---

#### 4. Display delegation mode in operator lists

**Status:** [ ] Not Done

**Files:**
- `libs/tangle-shared-ui/src/components/tables/OperatorsTable.tsx`
- `apps/tangle-dapp/src/components/tables/OperatorsTable.tsx`

**Why this is needed:**

Users need to know which operators accept delegations before selecting one. Without this information, users waste time selecting operators only to find out delegation isn't allowed.

**What needs to be updated:**

1. **Add delegation mode column to operator tables:**

   ```typescript
   // New column definition
   {
     header: 'Accepts Delegation',
     accessorKey: 'delegationMode',
     cell: ({ getValue }) => {
       const mode = getValue<DelegationMode>();
       switch (mode) {
         case DelegationMode.Open:
           return <Badge color="green">Open</Badge>;
         case DelegationMode.Whitelist:
           return <Badge color="yellow">Whitelist</Badge>;
         case DelegationMode.Disabled:
         default:
           return <Badge color="gray">Self Only</Badge>;
       }
     },
   }
   ```

2. **Add filter for delegation mode:**

   Allow users to filter operators by:
   - "Accepting delegations" (Open or Whitelist)
   - "Open to all"
   - "All operators"

3. **Fetch delegation mode for each operator:**

   Since the indexer doesn't track this yet, need to fetch on-chain:
   ```typescript
   const delegationModes = await Promise.all(
     operators.map(op =>
       publicClient.readContract({
         address: contracts.multiAssetDelegation,
         abi: MULTI_ASSET_DELEGATION_ABI,
         functionName: 'getDelegationMode',
         args: [op.id],
       })
     )
   );
   ```

**Visual design suggestions:**

| Mode | Badge Color | Icon | Tooltip |
|------|-------------|------|---------|
| Open | Green | Checkmark | "Anyone can delegate to this operator" |
| Whitelist | Yellow | Lock | "Only whitelisted addresses can delegate" |
| Disabled | Gray | X | "Operator only accepts self-stake" |

---

#### 5. Update Operator interface

**Status:** [ ] Not Done (Blocked by indexer)

**File:** `libs/tangle-shared-ui/src/data/graphql/useOperators.ts`

**Why this is needed:**

The `Operator` interface (lines 21-33) defines the data structure for operators fetched from the indexer. To display delegation mode in the UI, this interface needs the new field.

**What needs to be updated:**

1. **Add delegationMode to Operator interface:**

   ```typescript
   export interface Operator {
     id: string;
     ecdsaPublicKey: string | null;
     rpcAddress: string | null;
     createdAt: bigint | null;
     updatedAt: bigint | null;
     restakingStatus: RestakingOperatorStatus | null;
     restakingStake: bigint | null;
     restakingDelegationCount: bigint | null;
     restakingLeavingRound: bigint | null;
     restakingScheduledUnstakeAmount: bigint | null;
     restakingScheduledUnstakeRound: bigint | null;
     // NEW FIELD
     delegationMode: DelegationMode | null;
   }

   // NEW ENUM
   export enum DelegationMode {
     Disabled = 0,
     Whitelist = 1,
     Open = 2,
   }
   ```

2. **Update GraphQL queries to include delegationMode:**

   ```graphql
   query Operators($limit: Int, $offset: Int) {
     Operator(limit: $limit, offset: $offset) {
       # ... existing fields ...
       delegationMode  # NEW FIELD
     }
   }
   ```

**Blocker:** The Envio indexer must be updated first to:
1. Listen for `OperatorDelegationModeSet` events
2. Store `delegationMode` in the Operator entity
3. Expose it in the GraphQL schema

**Workaround until indexer is updated:**

Create a separate hook that fetches delegation mode on-chain (see next item).

---

#### 6. Create hook to check delegation eligibility

**Status:** [ ] Not Done

**File:** `libs/tangle-shared-ui/src/data/restake/useCanDelegate.ts` (NEW FILE)

**Why this is needed:**

Multiple components need to check if delegation is allowed:
- Delegation form (pre-submit check)
- Operator selection modal (filter/disable operators)
- Operator tables (display status)

A reusable hook prevents code duplication and ensures consistent behavior.

**What needs to be created:**

```typescript
/**
 * Hook to check if a delegator can delegate to an operator.
 * Calls canDelegate(operator, delegator) on the MultiAssetDelegation contract.
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { usePublicClient, useChainId } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';

export interface UseCanDelegateOptions {
  operator: Address | undefined;
  delegator: Address | undefined;
  enabled?: boolean;
}

export interface UseCanDelegateResult {
  canDelegate: boolean | undefined;
  delegationMode: DelegationMode | undefined;
  isWhitelisted: boolean | undefined;
  isLoading: boolean;
  error: Error | null;
}

export enum DelegationMode {
  Disabled = 0,
  Whitelist = 1,
  Open = 2,
}

export const useCanDelegate = ({
  operator,
  delegator,
  enabled = true,
}: UseCanDelegateOptions): UseCanDelegateResult => {
  const chainId = useChainId();
  const publicClient = usePublicClient();

  const query = useQuery({
    queryKey: ['canDelegate', chainId, operator, delegator],
    queryFn: async () => {
      if (!publicClient || !operator || !delegator) {
        return null;
      }

      const contracts = getContractsByChainId(chainId);

      // Fetch all delegation info in parallel
      const [canDelegate, delegationMode, isWhitelisted] = await Promise.all([
        publicClient.readContract({
          address: contracts.multiAssetDelegation,
          abi: MULTI_ASSET_DELEGATION_ABI,
          functionName: 'canDelegate',
          args: [operator, delegator],
        }) as Promise<boolean>,
        publicClient.readContract({
          address: contracts.multiAssetDelegation,
          abi: MULTI_ASSET_DELEGATION_ABI,
          functionName: 'getDelegationMode',
          args: [operator],
        }) as Promise<number>,
        publicClient.readContract({
          address: contracts.multiAssetDelegation,
          abi: MULTI_ASSET_DELEGATION_ABI,
          functionName: 'isWhitelisted',
          args: [operator, delegator],
        }) as Promise<boolean>,
      ]);

      return {
        canDelegate,
        delegationMode: delegationMode as DelegationMode,
        isWhitelisted,
      };
    },
    enabled: enabled && !!publicClient && !!operator && !!delegator,
    staleTime: 30_000, // 30 seconds
  });

  return {
    canDelegate: query.data?.canDelegate,
    delegationMode: query.data?.delegationMode,
    isWhitelisted: query.data?.isWhitelisted,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export default useCanDelegate;
```

**Usage in delegation form:**

```typescript
const { canDelegate, delegationMode, isLoading } = useCanDelegate({
  operator: selectedOperatorAddress,
  delegator: userAddress,
});

// In JSX:
<Button
  isDisabled={!canDelegate || isLoading}
  type="submit"
>
  {!canDelegate
    ? (delegationMode === DelegationMode.Disabled
        ? 'Operator Not Accepting Delegations'
        : 'Not Whitelisted')
    : 'Delegate'}
</Button>
```

---

### LOW PRIORITY

---

#### 7. Add operator delegation management UI

**Status:** [ ] Not Done

**File:** `libs/tangle-shared-ui/src/data/graphql/useOperatorManagement.ts`

**Why this is needed:**

Operators need a way to configure their delegation settings:
- Enable/disable delegations
- Switch between Open and Whitelist modes
- Add/remove addresses from their whitelist

Without UI, operators must interact with contracts directly via Etherscan or CLI.

**What needs to be created:**

1. **New hooks for delegation config:**

   ```typescript
   /**
    * Hook to set operator's delegation mode.
    */
   export const useSetDelegationModeTx = () => {
     // ... similar pattern to other tx hooks ...

     const setDelegationMode = async (mode: DelegationMode) => {
       const data = encodeFunctionData({
         abi: MULTI_ASSET_DELEGATION_ABI,
         functionName: 'setDelegationMode',
         args: [mode],
       });

       return walletClient.sendTransaction({
         to: contracts.multiAssetDelegation,
         data,
       });
     };

     return { setDelegationMode, status, error };
   };

   /**
    * Hook to manage operator's delegation whitelist.
    */
   export const useSetDelegationWhitelistTx = () => {
     const setDelegationWhitelist = async (
       delegators: Address[],
       approved: boolean
     ) => {
       const data = encodeFunctionData({
         abi: MULTI_ASSET_DELEGATION_ABI,
         functionName: 'setDelegationWhitelist',
         args: [delegators, approved],
       });

       return walletClient.sendTransaction({
         to: contracts.multiAssetDelegation,
         data,
       });
     };

     return { setDelegationWhitelist, status, error };
   };
   ```

2. **UI components (if building operator dashboard):**

   - Delegation mode selector (radio buttons: Disabled/Whitelist/Open)
   - Whitelist manager (add/remove addresses)
   - Current whitelist display

**Note:** This is low priority because:
- Most operators may use CLI tools or scripts
- The core user-facing functionality (delegation) works without this
- Can be added in a future iteration

---

## External Dependencies

### Envio Indexer (tnt-core/indexer/)

**Status:** NOT UPDATED YET

The indexer does not currently track:
- `OperatorDelegationModeSet` events
- `OperatorWhitelistUpdated` events
- `delegationMode` field on operators

**Impact:** Until indexer is updated, dapp must call `getDelegationMode()` or `canDelegate()` directly on-chain.

**Workaround:** Use on-chain calls for delegation checks until indexer support is added.

---

## Affected Files Summary

| File | Change Type | Status |
|------|-------------|--------|
| `libs/tangle-shared-ui/src/abi/tangle.ts` | Sync | [ ] |
| `libs/tangle-shared-ui/src/abi/multiAssetDelegation.ts` | Sync | [ ] |
| `apps/tangle-dapp/src/pages/restake/delegate/index.tsx` | Update | [ ] |
| `libs/tangle-shared-ui/src/data/tx/useDelegateTx.ts` | Update | [ ] |
| `libs/tangle-shared-ui/src/data/graphql/useOperators.ts` | Update | [ ] |
| `libs/tangle-shared-ui/src/components/tables/OperatorsTable.tsx` | Update | [ ] |
| `apps/tangle-dapp/src/components/tables/OperatorsTable.tsx` | Update | [ ] |
| `libs/tangle-shared-ui/src/data/restake/useCanDelegate.ts` | New | [ ] |

---

## Notes

- The `restakerBps` → `stakerBps` change is only in the ABI file, not used directly in app code
- The `setRestaking` function name in tangle.ts ABI remains unchanged (refers to setting the restaking/staking contract address)
- Existing delegations remain valid even if operator changes to mode=Disabled (only affects new delegations)
