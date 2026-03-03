# Tangle Migration Scripts

Scripts for generating migration snapshots and Merkle trees for the TNT token migration from Substrate to EVM.

## Overview

The migration process has two phases:
1. **Snapshot**: Capture all account balances and participation data from Tangle mainnet
2. **Merkleize**: Generate a Merkle tree for Substrate account claims and an airdrop list for EVM accounts

## Scripts

| Script | Purpose |
|--------|---------|
| `snapshot.ts` | Captures full network state from Tangle RPC |
| `merkleize-distribution.ts` | Generates Merkle tree and proofs from snapshot |

## Quick Start

```bash
cd scripts/migration

# Install dependencies
npm install

# Option 1: Use existing snapshot
npm run merkleize:latest

# Option 2: Generate fresh snapshot then merkleize
npm run snapshot
npm run merkleize tangle_migration_snapshot_BLOCKNUMBER.json
```

## Output Files

After running `merkleize-distribution.ts`, the following files are generated in `./migration_output/`:

| File | Size | Purpose |
|------|------|---------|
| `distribution.json` | ~10MB | Full distribution data with all account details |
| `proofs.json` | ~8MB | Merkle proofs for each Substrate account |
| `merkle-tree.json` | ~2MB | Full Merkle tree for on-chain verification |
| `evm-airdrop.json` | ~500KB | EVM accounts for direct token transfer |
| `distribution.csv` | ~2MB | Summary spreadsheet |

## Merkle Tree Format

### Leaf Encoding
```
["string", "uint256"]
```

### Leaf Values
```javascript
[
  originalAddress,      // SS58 address string
  finalAmount           // Balance in wei (as string)
]
```

### Example Leaf
```javascript
["tgFBKtHcatTVFcZU4urL8vUFvC2HGGJY9mUwpSbs37tgFVSAu", "1000000000000000000000"]
```

## Solidity Verification

The contract verifies proofs using OpenZeppelin's double-hash format:

```solidity
bytes32 leaf = keccak256(
    bytes.concat(
        keccak256(abi.encode(originalAddress, amount))
    )
);
```

## Current Snapshot Stats

From block #8116528:

| Category | Accounts | Amount |
|----------|----------|--------|
| Substrate (ZK proof required) | 7,004 | 108.14M TNT |
| EVM (direct airdrop) | 7,124 | 1.13M TNT |
| **Total** | **14,128** | **~109.26M TNT** |

**Merkle Root:** `0x824b635b245e60180ce6a26b40d8b55177fd77744bd3a444d11237925ca96788`

## Customizing Multipliers

Edit the `MULTIPLIERS` object in `merkleize-distribution.ts` to adjust bonus multipliers:

```typescript
const MULTIPLIERS = {
  base: 1.0,           // Everyone gets base multiplier
  validator: 1.0,      // Additional for validators
  nominator: 1.0,      // Additional for nominators
  operator: 1.0,       // Additional for operators
  delegator: 1.0,      // Additional for delegators (legacy term: restakers)
  identity: 1.0,       // Additional for identity holders
  claimer: 1.0,        // Additional for unclaimed balances
  lstMember: 1.0,      // Additional for LST pool members
};
```

## Integration with Frontend

After generating the Merkle tree, copy the proofs to the frontend:

```bash
# Copy to frontend public folder
cp migration_output/proofs.json ../../apps/tangle-dapp/public/data/migration-proofs.json
```

Then deploy contracts and update `.env.local`:
```bash
# Deploy contracts
../../scripts/local-env/deploy-migration.sh
```

## Regenerating from Fresh Snapshot

To capture a new snapshot from mainnet:

```bash
# This connects to Tangle mainnet RPC and captures all state
npm run snapshot

# Then generate Merkle tree from the new snapshot
npm run merkleize tangle_migration_snapshot_BLOCKNUMBER.json
```

## Files Included

- `snapshot.ts` - Full network state capture script
- `merkleize-distribution.ts` - Merkle tree and proof generator
- `tangle_migration_snapshot_8116528.json` - Pre-captured snapshot (block #8116528)
- `package.json` - Dependencies
