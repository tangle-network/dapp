# Tangle Cloud Implementation Plan

## Gap Analysis: tangle-cloud vs tnt-core

Based on comprehensive analysis of tnt-core smart contracts and current tangle-cloud implementation.

---

## MISSING USER STORIES BY ROLE

### A. Blueprint Developers (NEW ROLE - Not yet supported)

| Priority | User Story | tnt-core Function | Status |
|----------|------------|-------------------|--------|
| P0 | Create new blueprint | `createBlueprint(BlueprintDefinition)` | ❌ Missing |
| P0 | Define job specifications | `BlueprintDefinition.jobs[]` | ❌ Missing |
| P0 | Set pricing model (PayOnce/Subscription/EventDriven) | `BlueprintConfig.pricing` | ❌ Missing |
| P0 | Set membership model (Fixed/Dynamic) | `BlueprintConfig.membership` | ❌ Missing |
| P1 | Update blueprint metadata | `updateBlueprint(blueprintId, metadataUri)` | ❌ Missing |
| P1 | Transfer blueprint ownership | `transferBlueprint(blueprintId, newOwner)` | ❌ Missing |
| P1 | Deactivate blueprint | `deactivateBlueprint(blueprintId)` | ❌ Missing |
| P2 | Deploy custom service manager | `IBlueprintServiceManager` | ❌ Missing |
| P2 | View developer earnings | Payment distribution tracking | ❌ Missing |

**Required Pages:**
- `/blueprints/create` - Blueprint creation wizard
- `/blueprints/:id/manage` - Blueprint management (owner only)
- `/developer/dashboard` - Developer earnings and stats

---

### B. Operators (Partially Implemented)

| Priority | User Story | tnt-core Function | Status |
|----------|------------|-------------------|--------|
| ✅ | Register for blueprint | `registerOperator(blueprintId, ...)` | ✅ Done |
| ✅ | Approve service request | `approveService(requestId, commitments)` | ✅ Done |
| ✅ | Reject service request | `rejectService(requestId)` | ✅ Done |
| P0 | Submit job results | `submitResult(serviceId, callId, result)` | ❌ Missing |
| P0 | View pending jobs | Job queue from indexer | ❌ Missing |
| P0 | Claim rewards | `claimRewards()` | ❌ Missing |
| P0 | View earned rewards | `pendingRewards(account)` | ❌ Missing |
| P1 | Update operator preferences | `updateOperatorPreferences(blueprintId, ...)` | ❌ Missing |
| P1 | Set online/offline status | `setOperatorOnline(blueprintId, online)` | ❌ Missing |
| P1 | Unregister from blueprint | `unregisterOperator(blueprintId)` | ❌ Missing |
| P1 | Dispute slashing | `disputeSlash(slashId, reason)` | ❌ Missing |
| P1 | View slashing proposals | Slashing events from indexer | ❌ Missing |
| P2 | Submit aggregated BLS result | `submitAggregatedResult(...)` | ❌ Missing |
| P2 | Join dynamic service | `joinService(serviceId, exposureBps)` | ❌ Missing |
| P2 | Leave dynamic service | `scheduleExit/executeExit` | ❌ Missing |

**Required Pages:**
- `/operator/jobs` - Pending job queue and result submission
- `/operator/rewards` - Rewards dashboard and claiming
- `/operator/settings` - Preferences, online status, unregister
- `/operator/slashing` - View and dispute slashing proposals

---

### C. Customers/Deployers (Partially Implemented)

| Priority | User Story | tnt-core Function | Status |
|----------|------------|-------------------|--------|
| ✅ | Deploy service (basic) | `requestService(...)` | ✅ Done |
| ✅ | View running services | Service query | ✅ Done |
| ✅ | Terminate service | `terminateService(serviceId)` | ✅ Done |
| P0 | Submit job to service | `submitJob(serviceId, jobIndex, inputs)` | ❌ Missing |
| P0 | View job results | Job completion events | ❌ Missing |
| P0 | View job history | Historical jobs from indexer | ❌ Missing |
| P1 | Deploy with custom exposure | `requestServiceWithExposure(...)` | ❌ Missing |
| P1 | Deploy with multi-asset security | `requestServiceWithSecurity(...)` | ❌ Missing |
| P1 | Fund subscription service | `fundService(serviceId, amount)` | ❌ Missing |
| P1 | Add/remove permitted callers | `addPermittedCaller/removePermittedCaller` | ❌ Missing |
| P2 | Use RFQ instant deployment | `createServiceFromQuotes(...)` | ❌ Missing |
| P2 | Batch submit jobs | `submitJobs(...)` | ❌ Missing |

**Required Pages:**
- `/services/:id` - Service detail with job submission
- `/services/:id/jobs` - Job history and results
- `/services/:id/settings` - Permitted callers, funding

---

### D. Delegators/Stakers (NEW ROLE - Not yet supported)

| Priority | User Story | tnt-core Function | Status |
|----------|------------|-------------------|--------|
| P0 | Deposit native tokens | `deposit()` | ❌ Missing |
| P0 | Deposit ERC20 tokens | `depositERC20(token, amount)` | ❌ Missing |
| P0 | Delegate to operator | `delegate(operator, amount)` | ❌ Missing |
| P0 | View delegations | Delegation queries | ❌ Missing |
| P0 | Undelegate from operator | `scheduleDelegatorUnstake(...)` | ❌ Missing |
| P0 | Withdraw deposits | `scheduleWithdraw/executeWithdraw` | ❌ Missing |
| P0 | Claim rewards | `claimRewards()` | ❌ Missing |
| P1 | Deposit with lock multiplier | `depositWithLock(LockMultiplier)` | ❌ Missing |
| P1 | Choose blueprint exposure | `BlueprintSelectionMode` | ❌ Missing |
| P1 | View slashing impact | Slashing events | ❌ Missing |

**Required Pages:**
- `/staking` - Deposit/withdraw interface
- `/staking/delegate` - Delegation management
- `/staking/rewards` - Rewards dashboard

---

## IMPLEMENTATION PHASES

### Phase 1: Core Job & Result Flow (P0) - 2 weeks
**Goal:** Enable end-to-end service usage

1. **Service Detail Page** (`/services/:id`)
   - Job submission form (based on blueprint job schemas)
   - Job result display
   - Service status and operator list

2. **Operator Job Queue** (`/operator/jobs`)
   - List pending jobs for operator's services
   - Result submission form
   - Job completion status

3. **Rewards Dashboard** (`/operator/rewards`, `/staking/rewards`)
   - Pending rewards display
   - Claim rewards button
   - Historical earnings

**New Hooks Required:**
- `useSubmitJobTx` - Submit job to service
- `useSubmitResultTx` - Operator submits result
- `useClaimRewardsTx` - Claim pending rewards
- `usePendingRewards` - Query pending rewards
- `useJobsByService` - Query jobs for a service
- `useJobsByOperator` - Query jobs operator needs to process

**New ABIs Required:**
- Jobs ABI (submitJob, submitResult)
- Payments ABI (claimRewards, pendingRewards)

---

### Phase 2: Blueprint Developer Tools (P0-P1) - 2 weeks
**Goal:** Enable blueprint creation and management

1. **Blueprint Creation Wizard** (`/blueprints/create`)
   - Step 1: Basic info (name, description, category)
   - Step 2: Job definitions (name, inputs schema, outputs schema)
   - Step 3: Pricing configuration
   - Step 4: Membership & operator bounds
   - Step 5: Registration/request schemas
   - Step 6: Source specification (Container/WASM/Native)
   - Step 7: Review & deploy

2. **Blueprint Management** (`/blueprints/:id/manage`)
   - Update metadata
   - Transfer ownership
   - Deactivate blueprint
   - View registered operators
   - View active services

3. **Developer Dashboard** (`/developer/dashboard`)
   - Owned blueprints list
   - Earnings by blueprint
   - Service statistics

**New Hooks Required:**
- `useCreateBlueprintTx` - Create new blueprint
- `useUpdateBlueprintTx` - Update metadata
- `useTransferBlueprintTx` - Transfer ownership
- `useDeactivateBlueprintTx` - Deactivate blueprint
- `useBlueprintsByOwner` - Query owned blueprints

**New ABIs Required:**
- Blueprints ABI (createBlueprint, updateBlueprint, transferBlueprint, deactivateBlueprint)

---

### Phase 3: Delegator/Staker Interface (P0) - 2 weeks
**Goal:** Enable staking and delegation

1. **Staking Dashboard** (`/staking`)
   - Deposit native/ERC20
   - View deposits and balances
   - Withdraw flow (schedule + execute)

2. **Delegation Management** (`/staking/delegate`)
   - Browse operators with stats
   - Delegate to operator
   - View active delegations
   - Undelegate flow

3. **Blueprint Exposure Selection**
   - All blueprints mode
   - Fixed blueprint selection

**New Hooks Required:**
- `useDepositTx` - Deposit to staking
- `useWithdrawTx` - Schedule/execute withdraw
- `useDelegateTx` - Delegate to operator
- `useUndelegateTx` - Undelegate from operator
- `useDelegatorInfo` - Query delegator state

**Note:** Much of this may already exist in tangle-dapp. Consider sharing components.

---

### Phase 4: Advanced Operator Features (P1) - 1 week
**Goal:** Complete operator management

1. **Operator Settings** (`/operator/settings`)
   - Update ECDSA public key
   - Update RPC address
   - Set online/offline status
   - Unregister from blueprints

2. **Slashing Dashboard** (`/operator/slashing`)
   - View pending slashing proposals
   - Dispute button with reason
   - Slashing history

**New Hooks Required:**
- `useUpdateOperatorPreferencesTx`
- `useSetOperatorOnlineTx`
- `useUnregisterOperatorTx`
- `useDisputeSlashTx`
- `useSlashingProposals` - Query slashing proposals

---

### Phase 5: Advanced Service Features (P1-P2) - 1 week
**Goal:** Enable advanced deployment options

1. **Custom Exposure Deployment**
   - Per-operator exposure sliders in deployment wizard
   - Exposure validation (can exceed 100% total)

2. **Multi-Asset Security**
   - Asset selection with min/max exposure per asset
   - Security requirements builder

3. **Service Settings** (`/services/:id/settings`)
   - Add/remove permitted callers
   - Fund subscription escrow
   - View billing history

**New Hooks Required:**
- `useRequestServiceWithExposureTx`
- `useRequestServiceWithSecurityTx`
- `useFundServiceTx`
- `useAddPermittedCallerTx`
- `useRemovePermittedCallerTx`

---

### Phase 6: Dynamic Membership & RFQ (P2) - 1 week
**Goal:** Advanced service features

1. **Dynamic Service Management**
   - Join service as operator
   - Leave service (with exit queue)
   - View exit schedule

2. **RFQ Deployment**
   - Request quotes from operators (off-chain)
   - Submit signed quotes for instant deployment

**New Hooks Required:**
- `useJoinServiceTx`
- `useLeaveServiceTx`
- `useScheduleExitTx`
- `useExecuteExitTx`
- `useCreateServiceFromQuotesTx`

---

## PRIORITY SUMMARY

### Must Have (P0) - 6 weeks
- Job submission and results (customers)
- Result submission (operators)
- Rewards claiming (operators, delegators)
- Blueprint creation (developers)
- Deposit/withdraw/delegate (stakers)

### Should Have (P1) - 3 weeks
- Blueprint management (update, transfer, deactivate)
- Operator settings (preferences, online status, unregister)
- Slashing disputes
- Custom exposure deployment
- Permitted caller management
- Subscription funding

### Nice to Have (P2) - 2 weeks
- BLS aggregated results
- Dynamic membership (join/leave services)
- RFQ instant deployment
- Batch job submission

---

## SHARED COMPONENTS TO CREATE

1. **JobSubmissionForm** - Dynamic form based on job schema
2. **JobResultDisplay** - Render job outputs
3. **RewardsCard** - Pending/claimed rewards
4. **SlashingProposalCard** - Slashing details with dispute
5. **BlueprintWizard** - Multi-step blueprint creation
6. **ExposureSlider** - Operator exposure selection
7. **AssetSecurityBuilder** - Multi-asset security requirements
8. **DelegationCard** - Delegation details and actions

---

## NEW GRAPHQL QUERIES NEEDED

```graphql
# Jobs
query JobsByService($serviceId: ID!) { ... }
query JobsByOperator($operator: Address!) { ... }
query JobResult($callId: ID!) { ... }

# Rewards
query PendingRewards($account: Address!) { ... }
query RewardsHistory($account: Address!) { ... }

# Slashing
query SlashingProposals($operator: Address!) { ... }
query SlashingHistory($operator: Address!) { ... }

# Delegations
query DelegatorInfo($address: Address!) { ... }
query DelegationsByDelegator($delegator: Address!) { ... }
query DelegationsByOperator($operator: Address!) { ... }
```

---

## ESTIMATED TIMELINE

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1 | 2 weeks | Job flow, rewards |
| Phase 2 | 2 weeks | Blueprint creation |
| Phase 3 | 2 weeks | Staking/delegation |
| Phase 4 | 1 week | Operator settings |
| Phase 5 | 1 week | Advanced deployment |
| Phase 6 | 1 week | Dynamic membership, RFQ |
| **Total** | **9 weeks** | Full feature parity |

---

## NEXT STEPS

1. Review this plan and prioritize
2. Create GitHub issues for each phase
3. Start with Phase 1 (Job flow) as it enables end-to-end usage
4. Coordinate with indexer team for new GraphQL queries
5. Coordinate with contract team for ABI updates
