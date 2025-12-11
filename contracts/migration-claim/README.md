# Tangle Migration Contracts

Smart contracts for the TNT token migration from Substrate to EVM. Substrate address holders prove key ownership via ZK proofs to claim TNT tokens.

## Distribution Summary

| Category | Accounts | Amount |
|----------|----------|--------|
| Substrate (ZK proof required) | 7,004 | 108.14M TNT |
| EVM (direct airdrop) | 7,124 | 1.13M TNT |
| **Total** | **14,128** | **~109.26M TNT** |

**Merkle Root:** `0x844f4473505261b30182a26d035473da521d0f8a174fbbbcf92b17e090df8a4f`

## Contracts

| Contract | Description |
|----------|-------------|
| `TNT.sol` | ERC20 token with minting for migration |
| `TangleMigration.sol` | Main distribution contract with Merkle + ZK verification |
| `IZKVerifier.sol` | Interface for ZK proof verification |
| `SP1ZKVerifier.sol` | SP1 Groth16 verifier adapter |
| `MigrationClaim.sol` | Alternative claim contract (original design) |

## Quick Start

### 1. Deploy to Local Testnet (with Mock Verifier)

```bash
cd contracts/migration-claim

# Deploy everything
./scripts/deploy-tangle-migration.sh
```

This deploys:
- TNT token with 109.26M supply
- MockZKVerifier (always passes - for testing only)
- TangleMigration funded with 108.14M TNT

### 2. Deploy to Base Sepolia (with SP1 Verifier)

```bash
# Set your private key and program vkey
export PRIVATE_KEY=0x...
export PROGRAM_VKEY=0x...  # From SP1 compilation

./scripts/deploy-tangle-migration.sh --production
```

## Manual Deployment

```bash
# Install dependencies
forge install foundry-rs/forge-std --no-commit
forge install OpenZeppelin/openzeppelin-contracts@v5.0.0 --no-commit

# Build
forge build

# Deploy with mock verifier (local testing)
MERKLE_ROOT=0x844f4473505261b30182a26d035473da521d0f8a174fbbbcf92b17e090df8a4f \
USE_MOCK_VERIFIER=true \
forge script script/DeployTangleMigration.s.sol:DeployTangleMigration \
    --rpc-url http://localhost:8545 \
    --broadcast -vvv

# Deploy with SP1 verifier (production)
MERKLE_ROOT=0x844f4473505261b30182a26d035473da521d0f8a174fbbbcf92b17e090df8a4f \
SP1_VERIFIER=0x397A5f7f3dBd538f23DE225B51f532c34448dA9B \
PROGRAM_VKEY=0x... \
forge script script/DeployTangleMigration.s.sol:DeployTangleMigration \
    --rpc-url https://sepolia.base.org \
    --broadcast --verify -vvv
```

## Migration Data Files

Located at `/Users/drew/webb/tangle/types/migration_output/`:

| File | Size | Purpose |
|------|------|---------|
| `distribution.json` | 9.5MB | Full distribution data |
| `proofs.json` | 8.3MB | Merkle proofs for each Substrate account |
| `merkle-tree.json` | 2.3MB | Full Merkle tree |
| `evm-airdrop.json` | 517KB | EVM direct airdrop list |
| `distribution.csv` | 1.9MB | Summary spreadsheet |

### Leaf Format

```
[address, amount, addressType, participationBitmap]
```

- `address`: SS58 Substrate address string
- `amount`: Token amount in wei (18 decimals)
- `addressType`: 0 = Substrate (requires ZK proof)
- `participationBitmap`: Participation flags

### Participation Flags

| Bit | Flag |
|-----|------|
| 0 | Validator |
| 1 | Nominator |
| 2 | Operator |
| 3 | Delegator |
| 4 | Has Identity |
| 5 | Claimer (unclaimed genesis) |
| 6 | LST Member |

## Frontend Integration

After deployment, add to `apps/tangle-dapp/.env.local`:

```env
VITE_TNT_TOKEN_ADDRESS=0x...
VITE_TANGLE_MIGRATION_ADDRESS=0x...
VITE_ZK_VERIFIER_ADDRESS=0x...
VITE_MIGRATION_MERKLE_ROOT=0x844f4473505261b30182a26d035473da521d0f8a174fbbbcf92b17e090df8a4f
```

Copy proofs to frontend:

```bash
cp /Users/drew/webb/tangle/types/migration_output/proofs.json \
   apps/tangle-dapp/public/data/migration-proofs.json
```

## Claim Flow

### Substrate Claims (ZK Proof Required)

1. User enters their SS58 Substrate address
2. Frontend looks up their proof from `proofs.json`
3. User signs a challenge with their SR25519 key (via polkadot.js extension)
4. ZK proof is generated (SP1 prover network)
5. User submits claim transaction with:
   - Original SS58 address
   - Amount
   - Participation bitmap
   - Merkle proof
   - ZK proof
   - Recipient EVM address

### EVM Claims (Direct Airdrop)

EVM holders receive tokens directly via batch transfer using `evm-airdrop.json`.

## Contract Functions

### TangleMigration

```solidity
// Claim with ZK proof
function claimWithZKProof(
    string calldata originalAddress,  // SS58 address
    uint256 amount,                   // Amount in wei
    uint8 participationBitmap,        // Participation flags
    bytes32[] calldata merkleProof,   // From proofs.json
    bytes calldata zkProof,           // SP1 proof
    address recipient                 // EVM address to receive tokens
) external;

// Check if claimed
function getClaimedAmount(string calldata originalAddress) external view returns (uint256);

// Verify proof without claiming
function verifyMerkleProof(
    string calldata originalAddress,
    uint256 amount,
    uint8 addressType,
    uint8 participationBitmap,
    bytes32[] calldata merkleProof
) external view returns (bool);
```

## Testing

```bash
# Run all tests
forge test -vvv

# Run specific test
forge test --match-test testClaimWithZKProof -vvv

# Gas report
forge test --gas-report
```

## SP1 ZK Program

The ZK program verifies SR25519 signature ownership. See `sp1/` directory.

To compile and get the verification key:

```bash
cd sp1
cargo build --release
cargo run --bin vkey
```

## Security

- **Double-claim Prevention**: Tracks claimed addresses by keccak256(SS58 address)
- **ZK Verification**: SP1 Groth16 proofs (128-bit security)
- **Merkle Verification**: OpenZeppelin MerkleProof
- **Reentrancy Protection**: ReentrancyGuard
- **Claim Deadline**: 1 year, then emergency withdrawal enabled
- **Pausable**: Owner can pause claims

## Contract Addresses

### Local Testnet

After running the deploy script, the addresses will be output. Add them to your `.env.local`.

### Base Sepolia

| Contract | Address |
|----------|---------|
| TNT | TBD |
| TangleMigration | TBD |
| SP1 Verifier Gateway | `0x397A5f7f3dBd538f23DE225B51f532c34448dA9B` |

### Base Mainnet

| Contract | Address |
|----------|---------|
| TNT | TBD |
| TangleMigration | TBD |
| SP1 Verifier Gateway | `0x397A5f7f3dBd538f23DE225B51f532c34448dA9B` |

## Local Development Setup

1. **Deploy contracts to local testnet:**
   ```bash
   cd contracts/migration-claim
   ./scripts/deploy-tangle-migration.sh
   ```

2. **Copy proofs to frontend:**
   ```bash
   cp /Users/drew/webb/tangle/types/migration_output/proofs.json \
      apps/tangle-dapp/public/data/migration-proofs.json
   ```

3. **Configure environment variables** in `apps/tangle-dapp/.env.local`:
   ```env
   VITE_TNT_TOKEN_ADDRESS=0x...
   VITE_TANGLE_MIGRATION_ADDRESS=0x...
   VITE_ZK_VERIFIER_ADDRESS=0x...
   VITE_MIGRATION_PROOFS_URL=/data/migration-proofs.json
   ```

4. **Start the dApp:**
   ```bash
   yarn start:tangle-dapp
   ```

5. Navigate to `/claim/migration` to test the claim flow.
