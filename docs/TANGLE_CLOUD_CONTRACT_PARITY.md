# Tangle Cloud - Contract Parity Analysis

> Last Updated: 2025-01-27
> Contract Source: `tnt-core/src/v2/`

This document tracks the parity between tangle-cloud UI features and the smart contract system, with a lifecycle-based action plan for achieving full parity.

---

## Executive Summary

| Category | Count | Status |
|----------|-------|--------|
| Implemented (Needs QA) | 7 features | QA verification required |
| Broken (Stub hooks) | 5 features | **Blocking - users cannot complete flows** |
| Remove/Redesign | 1 feature | Cleanup required |
| UI Type Mismatches | 2 areas | Contract params don't match UI |
| Missing Features (Must-Have) | 5 features | Core implementation needed |
| Missing Features (Nice-to-Have) | 10+ features | Enhancement implementation |

### Critical Insight

The system has a dependency chain - fixing stubs in isolation doesn't help:

```
Developer creates blueprint ⚠️ IMPLEMENTED (needs QA)
        ↓
Operator registers ❌ BROKEN (stub) ← BLOCKS EVERYTHING BELOW
        ↓
Deployer requests service ⚠️ NEEDS VERIFICATION
        ↓
Operator approves ❌ BROKEN (stub + wrong types)
        ↓
Service becomes active
        ↓
Jobs, Rewards, etc.
```

**We use a lifecycle-based approach** to deliver working end-to-end flows incrementally.

### Scope Definition

- **Must-Have:** Features required for a flow to work at a basic level
- **Nice-to-Have:** Enhancements, optimizations, batch operations, advanced features

---

## Action Plan (Lifecycle-Based)

### Flow 0: Prerequisites
> **Goal:** Ensure technical foundations are in place before starting

| # | Task | Description | Status |
|---|------|-------------|--------|
| 0.1 | Verify ABI completeness | Ensure `libs/tangle-shared-ui/src/abi/tangle.ts` has all required functions | ✅ Complete (~90+ functions) |
| 0.2 | Check indexer schema | Verify GraphQL queries match current indexer | ⚠️ Local only (TODO added) |
| 0.3 | Verify contract addresses | Ensure `dapp-config` has correct contract addresses for testnet | ⚠️ Base Sepolia partial |

**Deliverable:** Technical checklist confirming foundations are ready

**Files checked:**
```
libs/tangle-shared-ui/src/abi/tangle.ts              # ✅ Auto-generated, complete
libs/dapp-config/src/contracts.ts                    # ⚠️ Base Sepolia missing MBSM, credits
libs/tangle-shared-ui/src/utils/executeEnvioGraphQL.ts  # ⚠️ TODO added for testnet/mainnet
```

---

### Flow 1: Blueprint Creation & Management (Developer)
> **Goal:** Developers can create and manage blueprints
> **Status:** ⚠️ IMPLEMENTED - NEEDS QA VERIFICATION

#### Must-Have Tasks
| # | Task | Type | Contract Function | Current State |
|---|------|------|-------------------|---------------|
| 1.1 | QA: Create blueprint | QA | `createBlueprint()` | Implemented - verify on testnet |
| 1.2 | QA: Transfer blueprint | QA | `transferBlueprint()` | Implemented - verify on testnet |
| 1.3 | QA: Deactivate blueprint | QA | `deactivateBlueprint()` | Implemented - verify on testnet |
| 1.4 | Test blueprint flow | QA | N/A | End-to-end test |

**Files to verify:**
```
libs/tangle-shared-ui/src/data/graphql/useBlueprintManagement.ts
apps/tangle-cloud/src/pages/blueprints/create/
apps/tangle-cloud/src/pages/blueprints/manage/
```

**Test Criteria:**
- [ ] Can create a blueprint with all config options
- [ ] Created blueprint appears in indexer/UI
- [ ] Can transfer ownership to another address
- [ ] Can deactivate a blueprint
- [ ] Deactivated blueprint shows correct status

> **Nice-to-Have:**
> - 1.5: Add "Update Blueprint" UI button (hook `updateBlueprint()` exists, just needs UI trigger)

---

### Flow 2: Operator Registration & Onboarding
> **Goal:** Operators can register with blueprints
> **Status:** ⚠️ PARTIALLY IMPLEMENTED - Single registration works, batch is stub

#### Must-Have Tasks
| # | Task | Type | Contract Function | Current State |
|---|------|------|-------------------|---------------|
| 2.1 | QA: Single registration | QA | `Operators.registerOperator()` | ✅ Implemented in shared-ui |
| 2.2 | Verify registration params | Types | Check ABI matches UI params | Need to verify |
| 2.3 | Test registration flow | QA | N/A | End-to-end test |

**Contract Function Signature:**
```solidity
function registerOperator(
    uint64 blueprintId,
    bytes calldata ecdsaPublicKey,
    string calldata rpcAddress,
    bytes calldata registrationArgs
) external;
```

**Implementation Status:**
- ✅ Single registration: `useRegisterOperatorTx` in `libs/tangle-shared-ui/src/data/graphql/useOperatorManagement.ts`
- ❌ Batch registration: `useOperatorBatchRegisterTx` in `apps/tangle-cloud/src/data/services/useOperatorRegisterTx.ts` (stub)

**Files to verify/modify:**
```
libs/tangle-shared-ui/src/data/graphql/useOperatorManagement.ts  # Single reg (implemented)
apps/tangle-cloud/src/data/services/useOperatorRegisterTx.ts     # Batch reg (stub)
apps/tangle-cloud/src/pages/blueprints/[id]/page.tsx             # Registration UI
```

**Test Criteria:**
- [ ] Operator can register with single blueprint
- [ ] Registration appears in `/operators/manage`
- [ ] Operator appears in blueprint's operator list

**⚠️ CRITICAL:** Do not proceed to Flow 3 until Flow 2 is verified working.

> **Nice-to-Have:**
> - 2.4: Fix batch registration (`useOperatorBatchRegisterTx`) - calls `registerOperator()` multiple times
> - 2.5: Add pre-register support (`Operators.preRegister()`) - allows operators to pre-commit before full registration

---

### Flow 3: Service Deployment (Deployer)
> **Goal:** Deployers can request/deploy services
> **Status:** ⚠️ NEEDS VERIFICATION

#### Must-Have Tasks
| # | Task | Type | Contract Function | Current State |
|---|------|------|-------------------|---------------|
| 3.1 | Verify service request hook | QA | `Services.requestService()` | May be working - verify |
| 3.2 | Test deployment flow | QA | N/A | End-to-end test |

**Files to check:**
```
libs/tangle-shared-ui/src/data/graphql/useServiceRequest.ts
apps/tangle-cloud/src/pages/blueprints/[id]/deploy/
```

**Test Criteria:**
- [ ] Service request transaction succeeds
- [ ] Service appears in "Pending Instances" for operators

**Depends on:** Flow 2 (need registered operators to select)

> **Nice-to-Have:**
> - 3.3: Add `exposureBps` per operator in UI (allows deployer to configure operator exposure percentages)
> - 3.4: Add `AssetSecurityRequirement[]` to deploy wizard (security constraints)
> - 3.5: Implement `requestServiceWithSecurity()` (advanced deployment with security requirements)
>
> **Contract Types for Nice-to-Have:**
> ```solidity
> struct AssetSecurityRequirement {
>     Asset asset;              // { kind: Native|ERC20, token: address }
>     uint16 minExposureBps;    // Minimum exposure required (0-10000)
>     uint16 maxExposureBps;    // Maximum exposure allowed (0-10000)
> }
> ```

---

### Flow 4: Service Approval & Activation (Operator)
> **Goal:** Operators can approve/reject service requests, services become active
> **Status:** ❌ BROKEN

#### Must-Have Tasks
| # | Task | Type | Contract Function | Current State |
|---|------|------|-------------------|---------------|
| 4.1 | Fix approve service | Stub → Real | `Services.approveService()` | Returns null, logs warning |
| 4.2 | Fix reject service | Stub → Real | `Services.rejectService()` | Returns null, logs warning |
| 4.3 | Test approval flow | QA | N/A | End-to-end test |

**Contract Function (Simple Approval):**
```solidity
function approveService(uint64 requestId) external;
function rejectService(uint64 requestId) external;
```

**Files to modify:**
```
apps/tangle-cloud/src/data/services/
├── useServiceApproveTx.ts          # 4.1
└── useServiceRejectTx.ts           # 4.2
```

**Test Criteria:**
- [ ] Operator sees pending service in `/instances`
- [ ] Operator can approve service
- [ ] Operator can reject service
- [ ] After enough approvals, service becomes "Active"
- [ ] Active service appears in "Running Instances"

**Depends on:** Flow 3 (need service requests to approve)

**🎉 MILESTONE:** After Flow 4, the core system works end-to-end!

> **Nice-to-Have:**
> - 4.4: Fix approval types to use `AssetSecurityCommitment[]` instead of `restakingPercent`
> - 4.5: Implement `approveServiceWithCommitments()` (approval with security commitments)
> - 4.6: Update approval modal UI with commitment inputs
>
> **Contract Types for Nice-to-Have:**
> ```solidity
> struct AssetSecurityCommitment {
>     Asset asset;           // { kind: Native|ERC20, token: address }
>     uint16 exposureBps;    // Committed exposure percentage (0-10000)
> }
>
> function approveServiceWithCommitments(
>     uint64 requestId,
>     AssetSecurityCommitment[] calldata commitments
> ) external;
> ```

---

### Flow 5: Service Operations
> **Goal:** Active services can be used and managed
> **Status:** ⚠️ PARTIALLY BROKEN

#### Must-Have Tasks
| # | Task | Type | Contract Function | Current State |
|---|------|------|-------------------|---------------|
| 5.1 | Verify job submission | QA | `Jobs.submitJob()` | Need to verify |
| 5.2 | Test service operations | QA | N/A | End-to-end test |

**Files to check:**
```
libs/tangle-shared-ui/src/data/graphql/useJobSubmission.ts (if exists)
apps/tangle-cloud/src/pages/services/[id]/page.tsx
```

**Test Criteria:**
- [ ] Can submit jobs to active service
- [ ] Service status displays correctly

**Depends on:** Flow 4 (need active services)

> **Nice-to-Have:**
> - 5.3: Fix service termination (`useServiceTerminateTx`) - currently returns null
> - 5.4: Add fund service hook (`useFundServiceTx` → `Payments.fundService()`)
> - 5.5: Add fund service UI (button + modal on service detail page)
> - Required for subscription services but not for one-time payment services

---

### Flow 6: Rewards & Earnings
> **Goal:** Operators can claim rewards, developers can track earnings
> **Status:** ⚠️ PARTIALLY WORKING / NEEDS REVIEW

#### Must-Have Tasks
| # | Task | Type | Contract Function | Current State |
|---|------|------|-------------------|---------------|
| 6.1 | Verify claim rewards | QA | `Payments.claimRewards()` | Appears working |
| 6.2 | **Review earnings page** | Review | N/A | **May not match contract** |
| 6.3 | Test rewards flow | QA | N/A | End-to-end test |

**⚠️ IMPORTANT - Earnings Page Issue (6.2):**

The `/earnings` page assumes developers have accumulated earnings. However, the contract sends developer payments **directly** via `PaymentSplit.developerBps` - there's no pending balance.

**Decision Required:**
- **Option A:** Remove earnings page entirely (recommended if not useful)
- **Option B:** Redesign to show historical payment events from indexer
- **Option C:** Query `DeveloperPayment` events instead of rewards

**Files to check:**
```
apps/tangle-cloud/src/pages/rewards/page.tsx
libs/tangle-shared-ui/src/data/graphql/useRewards.ts
apps/tangle-cloud/src/pages/earnings/page.tsx          # Review/redesign or remove
```

**Test Criteria:**
- [ ] Operator can see pending rewards
- [ ] Operator can claim single token rewards
- [ ] Earnings page decision made and implemented

**Depends on:** Flow 5 (need completed jobs to generate rewards)

> **Nice-to-Have:**
> - 6.4: Add multi-token rewards view (`Payments.rewardTokens()` - show rewards by token)
> - 6.5: Add claim batch (`Payments.claimRewardsBatch()` - claim multiple tokens at once)
> - 6.6: Add claim all (`Payments.claimRewardsAll()` - single button to claim everything)

---

### Flow 7: Operator Management & Slashing
> **Goal:** Operators can manage registrations and handle slashing
> **Status:** ✅ MOSTLY WORKING

#### Must-Have Tasks (QA Only)
| # | Task | Type | Contract Function | Current State |
|---|------|------|-------------------|---------------|
| 7.1 | Verify unregister | QA | `Operators.unregisterOperator()` | Appears working |
| 7.2 | Verify update preferences | QA | `Operators.updateOperatorPreferences()` | Appears working |
| 7.3 | Verify dispute slash | QA | `Slashing.disputeSlash()` | Appears working |
| 7.4 | Test management flow | QA | N/A | End-to-end test |

**Files (already implemented):**
```
libs/tangle-shared-ui/src/data/graphql/useOperatorManagement.ts
libs/tangle-shared-ui/src/data/graphql/useSlashing.ts
apps/tangle-cloud/src/pages/operators/manage/page.tsx
```

**Test Criteria:**
- [ ] Operator can unregister from blueprint
- [ ] Operator can update RPC address
- [ ] Operator can dispute a slash proposal

> **Nice-to-Have:** None - this flow is complete

---

## Nice-to-Have Flows (Enhancements)

> These flows are entirely nice-to-have enhancements. They add value but are not required for the core system to function.

### Flow 8: Subscription Management
> **Goal:** Full subscription service lifecycle
> **Status:** ❌ NOT IMPLEMENTED (Nice-to-Have)

| # | Task | Type | Contract Function | Notes |
|---|------|------|-------------------|-------|
| 8.1 | Add bill subscription | New | `Payments.billSubscription()` | Trigger billing |
| 8.2 | Add batch billing | New | `Payments.billSubscriptionBatch()` | Bill multiple |
| 8.3 | Add billable query | New | `Payments.getBillableServices()` | Show billable |
| 8.4 | Add subscription dashboard | UI | N/A | Manage subscriptions |

**Depends on:** Flow 5 nice-to-have (fund service)

---

### Flow 9: Quote/RFQ System
> **Goal:** Instant service activation from signed quotes
> **Status:** ❌ NOT IMPLEMENTED (Nice-to-Have)

| # | Task | Type | Contract Function | Notes |
|---|------|------|-------------------|-------|
| 9.1 | Add quote creation | New | `Quotes.createServiceFromQuotes()` | New wizard |
| 9.2 | Add quote signing | New | EIP-712 signing | Operator side |
| 9.3 | Add instant activation | UI | N/A | Deployer side |

**New route:** `/blueprints/:id/quote` or `/services/instant`

---

### Flow 10: Dynamic Services
> **Goal:** Support Dynamic membership model
> **Status:** ❌ NOT IMPLEMENTED (Nice-to-Have)

| # | Task | Type | Contract Function | Notes |
|---|------|------|-------------------|-------|
| 10.1 | Add operator join | New | Service lifecycle | Join active service |
| 10.2 | Add operator leave | New | Service lifecycle | Leave service |
| 10.3 | Add exit queue | New | `scheduleExit()` | Graceful departure |
| 10.4 | Add force exit | New | Exit config | Emergency removal |

---

## Implementation Timeline (Must-Have Only)

```
Phase 1: Flow 0 (Prerequisites) + Flow 1 (Blueprint QA) + Flow 2 (Operator Registration)
         ↓
         ✅ Blueprints verified, Operators can register

Phase 2: Flow 3 (Service Deployment) + Flow 4 (Service Approval)
         ↓
         ✅ Core system works end-to-end (MILESTONE)

Phase 3: Flow 5 (Service Operations) + Flow 6 (Rewards) + Flow 7 (Operator Management QA)
         ↓
         ✅ Complete user journeys work

Phase 4: Nice-to-have features (Flow 8-10 + extras from earlier flows)
         ↓
         ✅ Enhanced functionality
```

**Must-Have Task Count:** ~19 tasks
**Nice-to-Have Task Count:** ~20+ tasks

---

## Dependency Graph

```
MUST-HAVE FLOWS:
================
Flow 0 (Prerequisites)
    ↓
Flow 1 (Blueprints) ⚠️ Needs QA verification
    ↓
Flow 2 (Operator Registration) ← CRITICAL BLOCKER
    ↓
Flow 3 (Service Deployment)
    ↓
Flow 4 (Service Approval) ← MILESTONE: Core system works
    ↓
┌───┴───┐
↓       ↓
Flow 5  Flow 7
(Ops)   (Management) ⚠️ Needs QA verification
↓
Flow 6 (Rewards)


NICE-TO-HAVE FLOWS (after must-have complete):
==============================================
↓
┌───┴───┬───────┐
↓       ↓       ↓
Flow 8  Flow 9  Flow 10
(Subs)  (RFQ)   (Dynamic)
```

---

## Reference: Contract Files

| Contract | Path | Purpose |
|----------|------|---------|
| Types.sol | `src/v2/libraries/Types.sol` | All type definitions |
| Blueprints.sol | `src/v2/core/Blueprints.sol` | Blueprint CRUD |
| Operators.sol | `src/v2/core/Operators.sol` | Operator registration |
| Services.sol | `src/v2/core/Services.sol` | Service requests |
| ServicesApprovals.sol | `src/v2/core/ServicesApprovals.sol` | Approvals with commitments |
| Payments.sol | `src/v2/core/Payments.sol` | Escrow, billing, rewards |
| Quotes.sol | `src/v2/core/Quotes.sol` | RFQ instant activation |
| Slashing.sol | `src/v2/core/Slashing.sol` | Slash proposals/disputes |
| Jobs.sol | `src/v2/core/Jobs.sol` | Job submission |

---

## Reference: Current Hook Status

### Implemented Hooks - Need QA (in `libs/tangle-shared-ui/src/data/graphql/`)

| Hook | Contract Function | File | QA Status |
|------|-------------------|------|-----------|
| `useCreateBlueprintTx` | `createBlueprint()` | `useBlueprintManagement.ts` | ⬜ Verify |
| `useTransferBlueprintTx` | `transferBlueprint()` | `useBlueprintManagement.ts` | ⬜ Verify |
| `useDeactivateBlueprintTx` | `deactivateBlueprint()` | `useBlueprintManagement.ts` | ⬜ Verify |
| `useClaimRewardsTx` | `claimRewards()` | `useRewards.ts` | ⬜ Verify |
| `useDisputeSlashTx` | `disputeSlash()` | `useSlashing.ts` | ⬜ Verify |
| `useUnregisterOperatorTx` | `unregisterOperator()` | `useOperatorManagement.ts` | ⬜ Verify |
| `useUpdateOperatorPreferencesTx` | `updateOperatorPreferences()` | `useOperatorManagement.ts` | ⬜ Verify |

### Broken Hooks (in `apps/tangle-cloud/src/data/services/`)

| Hook | Expected Contract | Issue |
|------|-------------------|-------|
| `useOperatorBatchRegisterTx` | `registerOperator()` x N | Stub - returns null |
| `useServiceApproveTx` | `approveService()` | Stub - returns null |
| `useServiceRejectTx` | `rejectService()` | Stub - returns null |
| `useServiceTerminateTx` | Lifecycle functions | Stub - returns null |

> **Note:** Single operator registration is implemented in shared-ui as `useRegisterOperatorTx`.

---

## Checklist

### Must-Have Tasks

#### Flow 0: Prerequisites
- [x] 0.1 Verify ABI has all required functions (auto-generated from tnt-core, ~90+ functions)
- [ ] 0.2 Verify indexer GraphQL schema (local only - TODO added for testnet/mainnet endpoints)
- [ ] 0.3 Verify contract addresses in dapp-config (Base Sepolia partial, others not deployed)

#### Flow 1: Blueprint Management (QA)
- [ ] 1.1 QA: Create blueprint works on testnet
- [ ] 1.2 QA: Transfer blueprint works on testnet
- [ ] 1.3 QA: Deactivate blueprint works on testnet
- [ ] 1.4 Test: End-to-end blueprint flow

#### Flow 2: Operator Registration (CRITICAL)
- [ ] 2.1 QA: Single registration works (using shared-ui `useRegisterOperatorTx`)
- [ ] 2.2 Verify registration params match contract
- [ ] 2.3 Test: Operator can register with blueprint

#### Flow 3: Service Deployment
- [ ] 3.1 Verify service request hook works
- [ ] 3.2 Test: Deployer can request service

#### Flow 4: Service Approval (MILESTONE)
- [ ] 4.1 Implement `useServiceApproveTx`
- [ ] 4.2 Implement `useServiceRejectTx`
- [ ] 4.3 Test: Service becomes active after approvals

#### Flow 5: Service Operations
- [ ] 5.1 Verify job submission works
- [ ] 5.2 Test: Can operate active service

#### Flow 6: Rewards & Earnings
- [ ] 6.1 Verify claim rewards works
- [ ] 6.2 **Decision:** Remove or redesign earnings page
- [ ] 6.3 Test: Rewards flow works

#### Flow 7: Operator Management (QA Only)
- [ ] 7.1 Verify unregister works
- [ ] 7.2 Verify update preferences works
- [ ] 7.3 Verify dispute slash works
- [ ] 7.4 Test: Management flow works

---

### Nice-to-Have Tasks

#### Flow 1 Enhancements
- [ ] 1.5 Add "Update Blueprint" UI button

#### Flow 2 Enhancements
- [ ] 2.4 Implement `useOperatorBatchRegisterTx`
- [ ] 2.5 Add `preRegister()` support

#### Flow 3 Enhancements
- [ ] 3.3 Add `exposureBps` to operator selection UI
- [ ] 3.4 Add `AssetSecurityRequirement[]` to deploy wizard
- [ ] 3.5 Implement `requestServiceWithSecurity`

#### Flow 4 Enhancements
- [ ] 4.4 Fix approval types to use `AssetSecurityCommitment[]`
- [ ] 4.5 Implement `approveServiceWithCommitments`
- [ ] 4.6 Update approval modal with commitment inputs

#### Flow 5 Enhancements
- [ ] 5.3 Implement `useServiceTerminateTx`
- [ ] 5.4 Implement `useFundServiceTx`
- [ ] 5.5 Add fund service UI

#### Flow 6 Enhancements
- [ ] 6.4 Add multi-token rewards view
- [ ] 6.5 Add `claimRewardsBatch`
- [ ] 6.6 Add `claimRewardsAll`

#### Flow 8-10: Full Enhancement Flows
- [ ] 8.x Subscription management (billSubscription, batch billing, dashboard)
- [ ] 9.x Quote/RFQ system (quote creation, signing, instant activation)
- [ ] 10.x Dynamic services (join, leave, exit queue)
