# Flow 3: Service Deployment - Analysis and QA Plan

> **Last Updated:** 2026-03-02
> **Status:** ✅ Implementation Complete - Ready for QA
> **Depends On:** Flow 1 (Blueprint Creation) ✅, Flow 2 (Operator Registration) ✅

This document contains a comprehensive analysis of the Service Deployment flow in tangle-cloud, identifying misalignments with the tnt-core contracts and providing a detailed implementation and QA plan.

---

## Executive Summary

| Category | Count | Status |
|----------|-------|--------|
| Critical Issues | 5 | ✅ All Fixed |
| Moderate Issues | 3 | ⚠️ UX/data correctness issues (deferred) |
| Files Modified | 6 | Implementation complete |

**Current State:** All critical fixes have been implemented. Service deployment should now work correctly with the tnt-core contracts.

---

## Implementation Status

### ✅ Completed Fixes

| # | Issue | Fix Applied | Files Modified |
|---|-------|-------------|----------------|
| 1 | Operator filtering missing | Pass `blueprintOperators` from `useBlueprintDetails()` to `OperatorSelectionStep` | `type.ts`, `page.tsx`, `OperatorSelectionStep.tsx` |
| 2 | TTL units mismatch | Changed label to "Seconds", updated validation (0 or 3600-31536000), added helper text | `BasicInformationStep.tsx`, `deployBlueprint.ts` |
| 3 | Payment amount not formatted | Added `parseUnits()` with token decimals | `page.tsx` |
| 4 | Config encoding wrong | Uses schema-aware TLV encoding when request schema exists; keeps JSON-bytes fallback only for schema-less payloads | `useServiceRequest.ts`, `encodeServiceConfig.ts` |
| 5 | Security requirements not sent | Added `AssetSecurityRequirement` type, calls `requestServiceWithSecurity()` when requirements provided | `useServiceRequest.ts`, `page.tsx`, `index.ts` |
| 6 | GraphQL type mismatch (discovered during QA) | Fixed `blueprintId` type from `String!` to `numeric!` in `fetchBlueprintOperators` query | `useBlueprints.ts` |

### ⚠️ Deferred (UX Cleanup - Phase 2)

| # | Issue | Status |
|---|-------|--------|
| 6 | ApprovalModel UI collects unused data | Deferred - not blocking |
| 7 | minApproval/maxApproval not contract params | Deferred - not blocking |
| 8 | useBlueprintRegisteredOperator uses Substrate API | Deferred - not used in deploy flow |

---

## Files Modified

```
libs/tangle-shared-ui/src/data/graphql/useServiceRequest.ts
  ✅ Re-export request config encoding from standalone utility
  ✅ Parses requestId from both ServiceRequested and ServiceRequestedWithSecurity events
  ✅ Added AssetSecurityRequirement interface
  ✅ Added securityRequirements to ServiceRequestParams
  ✅ Calls requestServiceWithSecurity() when requirements provided

libs/tangle-shared-ui/src/data/graphql/encodeServiceConfig.ts
  ✅ Added schema-aware TLV payload encoding for request args using primitive request param types
  ✅ Preserved legacy JSON-bytes fallback only for schema-less payloads

libs/tangle-shared-ui/src/data/graphql/useBlueprints.ts
  ✅ Fixed blueprintId type in fetchBlueprintOperators (String! → numeric!)

libs/tangle-shared-ui/src/data/graphql/index.ts
  ✅ Exported AssetSecurityRequirement type

apps/tangle-cloud/src/pages/blueprints/[id]/deploy/page.tsx
  ✅ Added parseUnits() for payment amount with decimals
  ✅ Build and pass securityRequirements from assets/commitments
  ✅ Pass blueprintOperators to Deployment component

apps/tangle-cloud/src/pages/blueprints/[id]/deploy/DeploySteps/type.ts
  ✅ Added blueprintOperators prop to BaseDeployStepProps

apps/tangle-cloud/src/pages/blueprints/[id]/deploy/DeploySteps/OperatorSelectionStep.tsx
  ✅ Use blueprintOperators prop instead of useOperatorMap()
  ✅ Removed unused useOperatorMap import

apps/tangle-cloud/src/pages/blueprints/[id]/deploy/DeploySteps/BasicInformationStep.tsx
  ✅ Changed TTL label from "Block(s)" to "Seconds"
  ✅ Added helper text explaining valid range

apps/tangle-cloud/src/utils/validations/deployBlueprint.ts
  ✅ Updated instanceDuration validation (0 or 3600-31536000)
```

---

## QA Testing Steps

### Prerequisites

1. **Start local environment** (Terminal 1):
   ```bash
   cd /path/to/tnt-core
   ./scripts/local-env/start-local-dev.sh
   ```
   Wait for "Local Development Environment Ready!"

2. **Start tangle-cloud** (Terminal 2):
   ```bash
   cd /path/to/dapp
   echo 'VITE_GRAPHQL_ENDPOINT=http://localhost:8080/v1/graphql' > apps/tangle-cloud/.env.local
   yarn start:tangle-cloud
   ```

3. **Import test wallet** in browser (MetaMask):
   - Network: Add custom network
     - Name: Anvil Local
     - RPC URL: http://127.0.0.1:8545
     - Chain ID: 31337
     - Currency: ETH
   - Import account with private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Account address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

---

### Test Scenario 1: Operator Filtering

**Purpose:** Verify only registered operators are shown.

1. Open `http://localhost:4300`
2. Connect wallet (MetaMask with test account)
3. Navigate to Blueprints → Blueprint 0 → Deploy
4. On operator selection step:
   - **Expected:** Only operators registered for blueprint ID 0 should appear
   - **Expected:** Should show 2 operators (based on local dev setup)

5. Verify operators match GraphQL query:
   ```bash
   curl -s http://localhost:8080/v1/graphql \
     -H "Content-Type: application/json" \
     -d '{"query":"{ OperatorBlueprint(where: { blueprint: { blueprintId: { _eq: 0 } } }) { operator { id } } }"}' | jq
   ```

**Expected Result:** UI shows same operators as GraphQL query returns

---

### Test Scenario 2: TTL Validation

**Purpose:** Verify TTL validation and labeling.

1. Navigate to deploy wizard
2. On Basic Information step, check Instance Duration field:
   - **Expected:** Label should say "Seconds" (not "Block(s)")
   - **Expected:** Helper text: "Use 0 for perpetual service, or minimum 3600 (1 hour). Max: 31536000 (365 days)"

3. Test validation:
   - Enter `100` → **Expected:** Validation error (below minimum 3600)
   - Enter `0` → **Expected:** Valid (perpetual service)
   - Enter `3600` → **Expected:** Valid (minimum 1 hour)
   - Enter `31536001` → **Expected:** Validation error (above maximum 365 days)

---

### Test Scenario 3: Full Deployment (Basic - No Security Requirements)

**Purpose:** Verify complete deployment flow works without security requirements.

**Test Data:**

| Field | Value | Reason |
|-------|-------|--------|
| Instance Name | `Test Service` | Descriptive label |
| Instance Duration | `3600` | Minimum valid TTL (1 hour) |
| Permitted Callers | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | Your wallet address |
| Operators | Select both | Test multi-operator |
| Approval Model | `Fixed` | Simpler for testing |
| Asset Requirements | Skip/empty | Test basic requestService() |
| Payment Asset | Native token | Already have balance |
| Payment Amount | `0` | No payment for test |

**Steps:**

1. Navigate to deploy wizard for blueprint 0
2. Fill in all fields as specified above
3. Click "Deploy"
4. Confirm transaction in MetaMask

**Expected Result:**
- Transaction should succeed (no revert)
- Redirect to blueprint details page

**Verify:**
```bash
curl -s http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ ServiceRequest(order_by: {createdAt: desc}, limit: 1) { id requestId requester status blueprint { blueprintId } } }"}' | jq
```

Should show a ServiceRequest with status `PENDING`.

---

### Test Scenario 4: Deployment with Security Requirements

**Purpose:** Verify security requirements are sent to contract via `requestServiceWithSecurity()`.

**Test Data:**

| Field | Value |
|-------|-------|
| Instance Name | `Secure Test Service` |
| Instance Duration | `3600` |
| Permitted Callers | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` |
| Operators | Select both |
| Approval Model | `Fixed` |
| Asset Requirements | Select an available asset |
| Min Exposure | `1%` |
| Max Exposure | `100%` |
| Payment Asset | Native token |
| Payment Amount | `0` |

**Steps:**

1. Navigate to deploy wizard for blueprint 0
2. Fill in all fields including asset requirements
3. Click "Deploy"
4. Confirm transaction in MetaMask

**Expected Result:**
- Transaction should succeed
- Contract receives `requestServiceWithSecurity()` call (not `requestService()`)
- Security requirements stored in contract

---

## Checklist

### Critical Fixes
- [x] 1.1 Fix operator filtering in `OperatorSelectionStep.tsx`
- [x] 1.2 Fix TTL units in `BasicInformationStep.tsx` and `deployBlueprint.ts`
- [x] 1.3 Fix payment amount handling in `page.tsx`
- [x] 1.4 Fix config encoding in `useServiceRequest.ts` (use `0x` for empty)
- [x] 1.5 Add security requirements support in `useServiceRequest.ts`
- [x] 1.6 Fix GraphQL blueprintId type (String → numeric)

### UX Cleanup (Deferred)
- [ ] 2.1 Clarify or remove approval model selector
- [ ] 2.2 Remove min/max approval inputs

### QA Verification
- [ ] Scenario 1: Operator filtering works
- [ ] Scenario 2: TTL validation works
- [ ] Scenario 3: Basic deployment succeeds (no security requirements)
- [ ] Scenario 4: Deployment with security requirements succeeds

---

## Known Limitations

1. **TLV Encoding Not Implemented:** Blueprints with request parameters will throw an error. Only blueprints with no request params (like Blueprint 0) are currently supported. Full TLV encoding can be added later if needed.

2. **Approval Model UI:** The approval model selector collects data that isn't actually sent to the contract (membership model comes from the blueprint). This is a UX issue, not a blocking bug.

---

## References

- [TANGLE_CLOUD_CONTRACT_PARITY.md](../TANGLE_CLOUD_CONTRACT_PARITY.md) - Overall contract parity tracking
- [tnt-core/src/v2/core/ServicesRequests.sol](https://github.com/tangle-network/tnt-core) - Contract source
- [blueprint/cli/src/command/deploy/definition.rs](https://github.com/tangle-network/blueprint) - TLV encoding reference
