# Migration Claim System - Implementation Plan

> **Status (2026-03-03): Archived for dapp launch backlog tracking.**
> The migration claim contracts, scripts, and merkle artifacts now live in `tnt-core/packages/migration-claim`.
> This file is retained for historical context only and is not a current action tracker for this repository.
> Backlog triage source of truth: `LAUNCH_BACKLOG_CLOSEOUT.md`.

## Overview

A ZK-based claim system allowing users to migrate their Substrate chain balances to EVM by proving SR25519 key ownership. Users submit a ZK proof to claim ERC20 TNT tokens at their EVM address.

## ZK Framework Recommendation: **SP1 (Succinct)**

### Comparison Summary

| Feature | SP1 | RiscZero |
|---------|-----|----------|
| Base Sepolia Verifier | ✅ `0x397A5f7f3dBd538f23DE225B51f532c34448dA9B` (Groth16) | ✅ `0x0b144e07a0826182b6b59788c34b32bfa86fb711` |
| Language Support | Rust | Rust |
| Native SR25519 | ❌ (custom circuit needed) | ❌ (custom circuit needed) |
| Proving Speed | Faster (optimized for blockchain) | Good |
| Developer Tools | Excellent (prover network) | Good |
| Open Source | MIT/Apache 2.0 | Apache 2.0 |

### Recommendation: SP1

Both frameworks require custom SR25519 verification code. SP1 is recommended because:
1. **Prover Network**: Succinct provides a hosted prover network, reducing infrastructure burden
2. **Performance**: Optimized specifically for blockchain verification tasks
3. **Active Development**: More frequent updates and better documentation
4. **Same Verifier Address**: Groth16 verifier uses the same address across chains (easier deployment)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  - Connect EVM wallet                                           │
│  - Input Substrate address/public key                           │
│  - Sign challenge message with SR25519 key                      │
│  - Generate ZK proof (via prover network or locally)            │
│  - Submit claim transaction                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MigrationClaim.sol                           │
│  - Stores Merkle root of eligible balances                      │
│  - Verifies ZK proof of SR25519 key ownership                   │
│  - Verifies Merkle proof of balance eligibility                 │
│  - Mints/transfers TNT tokens to claimant                       │
│  - Tracks claimed addresses (prevent double-claim)              │
│  - 1-year expiry → Treasury recovery                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SP1 Verifier Gateway                          │
│  Address: 0x397A5f7f3dBd538f23DE225B51f532c34448dA9B            │
│  - Verifies Groth16 proofs from SP1 guest programs              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Smart Contracts

### 1. TNT ERC20 Token (`TNT.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TNT is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("Tangle Network Token", "TNT")
        Ownable(initialOwner)
    {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
```

### 2. Migration Claim Contract (`MigrationClaim.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ISP1Verifier} from "@sp1-contracts/ISP1Verifier.sol";

contract MigrationClaim {
    // SP1 Verifier Gateway on Base Sepolia
    ISP1Verifier public constant VERIFIER = ISP1Verifier(0x397A5f7f3dBd538f23DE225B51f532c34448dA9B);

    // Verification key for SR25519 proof program (set after deployment)
    bytes32 public immutable SR25519_VKEY;

    // Merkle root of eligible (substratePublicKey => balance) pairs
    bytes32 public immutable merkleRoot;

    // TNT token contract
    IERC20 public immutable tntToken;

    // Treasury address for unclaimed funds
    address public immutable treasury;

    // Claim deadline (1 year from deployment)
    uint256 public immutable claimDeadline;

    // Substrate public key (32 bytes) => claimed status
    mapping(bytes32 => bool) public claimed;

    // Total allocated for claims
    uint256 public totalAllocated;
    uint256 public totalClaimed;

    event Claimed(
        bytes32 indexed substratePublicKey,
        address indexed evmAddress,
        uint256 amount
    );

    event UnclaimedRecovered(uint256 amount);

    constructor(
        bytes32 _sr25519Vkey,
        bytes32 _merkleRoot,
        address _tntToken,
        address _treasury,
        uint256 _totalAllocated
    ) {
        SR25519_VKEY = _sr25519Vkey;
        merkleRoot = _merkleRoot;
        tntToken = IERC20(_tntToken);
        treasury = _treasury;
        claimDeadline = block.timestamp + 365 days;
        totalAllocated = _totalAllocated;
    }

    /**
     * @notice Claim TNT tokens by proving SR25519 key ownership
     * @param substratePublicKey The 32-byte SR25519 public key
     * @param amount The claimable amount from the snapshot
     * @param merkleProof Proof that (publicKey, amount) is in the Merkle tree
     * @param sp1Proof The SP1 proof of SR25519 signature verification
     * @param publicValues The public values from the SP1 proof
     */
    function claim(
        bytes32 substratePublicKey,
        uint256 amount,
        bytes32[] calldata merkleProof,
        bytes calldata sp1Proof,
        bytes calldata publicValues
    ) external {
        require(block.timestamp < claimDeadline, "Claim period ended");
        require(!claimed[substratePublicKey], "Already claimed");

        // Verify Merkle proof for balance eligibility
        bytes32 leaf = keccak256(abi.encodePacked(substratePublicKey, amount));
        require(_verifyMerkleProof(merkleProof, merkleRoot, leaf), "Invalid Merkle proof");

        // Decode and validate public values from ZK proof
        (
            bytes32 provenPublicKey,
            address provenEvmAddress,
            bytes32 provenChallenge
        ) = abi.decode(publicValues, (bytes32, address, bytes32));

        // Ensure proof is for the correct public key and recipient
        require(provenPublicKey == substratePublicKey, "Public key mismatch");
        require(provenEvmAddress == msg.sender, "EVM address mismatch");

        // Verify challenge includes commitment to this contract and chain
        bytes32 expectedChallenge = keccak256(abi.encodePacked(
            address(this),
            block.chainid,
            msg.sender
        ));
        require(provenChallenge == expectedChallenge, "Invalid challenge");

        // Verify ZK proof of SR25519 signature
        VERIFIER.verifyProof(SR25519_VKEY, publicValues, sp1Proof);

        // Mark as claimed and transfer tokens
        claimed[substratePublicKey] = true;
        totalClaimed += amount;

        require(tntToken.transfer(msg.sender, amount), "Transfer failed");

        emit Claimed(substratePublicKey, msg.sender, amount);
    }

    /**
     * @notice Recover unclaimed tokens to treasury after 1 year
     */
    function recoverUnclaimed() external {
        require(block.timestamp >= claimDeadline, "Claim period not ended");

        uint256 unclaimed = totalAllocated - totalClaimed;
        require(unclaimed > 0, "Nothing to recover");

        totalAllocated = totalClaimed; // Prevent re-recovery

        require(tntToken.transfer(treasury, unclaimed), "Transfer failed");

        emit UnclaimedRecovered(unclaimed);
    }

    function _verifyMerkleProof(
        bytes32[] calldata proof,
        bytes32 root,
        bytes32 leaf
    ) internal pure returns (bool) {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        return computedHash == root;
    }
}
```

---

## SP1 Guest Program (ZK Circuit)

The SP1 guest program verifies SR25519 signatures using the schnorrkel library.

### Project Structure

```
tnt-core/packages/migration-claim/sp1/
├── Cargo.toml
├── program/
│   ├── Cargo.toml
│   └── src/
│       └── main.rs          # SP1 guest program
├── script/
│   ├── Cargo.toml
│   └── src/
│       └── main.rs          # Host program for proof generation
└── lib/
    └── src/
        └── lib.rs           # Shared types
```

### Guest Program (`program/src/main.rs`)

```rust
#![no_main]
sp1_zkvm::entrypoint!(main);

use schnorrkel::{PublicKey, Signature, signing_context};

/// Public values that will be exposed on-chain
#[derive(Debug)]
pub struct PublicValues {
    /// The SR25519 public key being proven
    pub substrate_public_key: [u8; 32],
    /// The EVM address claiming the tokens
    pub evm_address: [u8; 20],
    /// The challenge that was signed
    pub challenge: [u8; 32],
}

pub fn main() {
    // Read inputs from the host
    let public_key_bytes: [u8; 32] = sp1_zkvm::io::read();
    let signature_bytes: [u8; 64] = sp1_zkvm::io::read();
    let evm_address: [u8; 20] = sp1_zkvm::io::read();
    let challenge: [u8; 32] = sp1_zkvm::io::read();

    // Parse the SR25519 public key
    let public_key = PublicKey::from_bytes(&public_key_bytes)
        .expect("Invalid public key");

    // Parse the signature
    let signature = Signature::from_bytes(&signature_bytes)
        .expect("Invalid signature");

    // Create signing context (Substrate uses "substrate" context)
    let ctx = signing_context(b"substrate");

    // Verify the signature over the challenge
    public_key
        .verify(ctx.bytes(&challenge), &signature)
        .expect("Signature verification failed");

    // Commit public values (these are exposed on-chain)
    let public_values = PublicValues {
        substrate_public_key: public_key_bytes,
        evm_address,
        challenge,
    };

    sp1_zkvm::io::commit(&public_values.substrate_public_key);
    sp1_zkvm::io::commit(&public_values.evm_address);
    sp1_zkvm::io::commit(&public_values.challenge);
}
```

### Host Program (`script/src/main.rs`)

```rust
use sp1_sdk::{ProverClient, SP1Stdin};

const ELF: &[u8] = include_bytes!("../../program/elf/riscv32im-succinct-zkvm-elf");

fn main() {
    // Initialize the prover client
    let client = ProverClient::new();

    // Prepare inputs
    let mut stdin = SP1Stdin::new();

    // These would come from the frontend
    let public_key: [u8; 32] = /* substrate public key */;
    let signature: [u8; 64] = /* SR25519 signature */;
    let evm_address: [u8; 20] = /* claimer's EVM address */;
    let challenge: [u8; 32] = /* challenge hash */;

    stdin.write(&public_key);
    stdin.write(&signature);
    stdin.write(&evm_address);
    stdin.write(&challenge);

    // Generate the proof
    let (pk, vk) = client.setup(ELF);
    let proof = client.prove(&pk, stdin).groth16().run().unwrap();

    // The proof and public values can be submitted on-chain
    println!("Proof generated successfully!");
    println!("Verification Key: {:?}", vk.bytes32());
    println!("Public Values: {:?}", proof.public_values);
    println!("Proof: {:?}", proof.bytes());
}
```

---

## Merkle Tree Structure

### Snapshot Format

```typescript
interface SnapshotEntry {
  substrateAddress: string;  // SS58 address
  publicKey: string;         // 32 bytes hex
  balance: bigint;           // Balance in smallest unit
}

// Leaf format: keccak256(abi.encodePacked(publicKey, balance))
```

### Tree Generation Script

```typescript
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { keccak256, encodePacked } from "viem";

interface ClaimEntry {
  publicKey: `0x${string}`;
  balance: bigint;
}

function generateMerkleTree(entries: ClaimEntry[]) {
  // Format: [publicKey, balance]
  const values = entries.map(e => [e.publicKey, e.balance.toString()]);

  const tree = StandardMerkleTree.of(values, ["bytes32", "uint256"]);

  return {
    root: tree.root,
    tree,
    getProof: (publicKey: `0x${string}`, balance: bigint) => {
      for (const [i, v] of tree.entries()) {
        if (v[0] === publicKey && v[1] === balance.toString()) {
          return tree.getProof(i);
        }
      }
      throw new Error("Entry not found");
    }
  };
}
```

---

## Frontend Implementation

### New Page: `/claim/migration`

```
apps/tangle-dapp/src/pages/claim/migration/
├── index.tsx              # Main claim page
├── components/
│   ├── SubstrateKeyInput.tsx
│   ├── ClaimStatus.tsx
│   ├── ProofGenerator.tsx
│   └── ClaimButton.tsx
└── hooks/
    ├── useClaimEligibility.ts
    ├── useGenerateProof.ts
    └── useSubmitClaim.ts
```

### Claim Flow

1. **Connect EVM Wallet** - User connects via RainbowKit
2. **Enter Substrate Address** - User inputs their Substrate address or public key
3. **Check Eligibility** - Frontend queries Merkle tree data for balance
4. **Sign Challenge** - User signs a challenge message with their SR25519 key using polkadot.js extension
5. **Generate Proof** - Call SP1 prover (network or local) with signature
6. **Submit Claim** - Send transaction to MigrationClaim contract

### Challenge Message Format

```typescript
const challenge = keccak256(encodePacked(
  ["address", "uint256", "address"],
  [migrationClaimAddress, chainId, userEvmAddress]
));

// User signs this challenge with their SR25519 key
const signature = await polkadotExtension.sign(challenge);
```

---

## Implementation Steps

### Phase 1: Smart Contracts (Week 1-2)

1. [ ] Create TNT ERC20 token contract
2. [ ] Create MigrationClaim contract with Merkle verification
3. [ ] Integrate SP1 verifier interface
4. [ ] Write deployment scripts
5. [ ] Deploy to Base Sepolia testnet

### Phase 2: ZK Circuit (Week 2-3)

1. [ ] Set up SP1 project structure
2. [ ] Implement SR25519 verification in guest program
3. [ ] Test with sample signatures
4. [ ] Generate verification key
5. [ ] Deploy verifier configuration

### Phase 3: Backend/Scripts (Week 3)

1. [ ] Create snapshot parsing script
2. [ ] Generate Merkle tree from snapshot
3. [ ] Create proof generation service/API
4. [ ] Set up prover infrastructure (or use Succinct Network)

### Phase 4: Frontend (Week 3-4)

1. [ ] Create migration claim page
2. [ ] Integrate polkadot.js extension for SR25519 signing
3. [ ] Implement eligibility checking
4. [ ] Implement proof generation flow
5. [ ] Implement claim submission
6. [ ] Add claim status tracking

### Phase 5: Testing & Deployment (Week 4)

1. [ ] End-to-end testing on testnet
2. [ ] Security audit considerations
3. [ ] Deploy to Base mainnet
4. [ ] Monitor and support

---

## File Changes Required

### New Files

```
apps/tangle-dapp/src/pages/claim/migration/
├── index.tsx
├── components/SubstrateKeyInput.tsx
├── components/ClaimStatus.tsx
├── components/ProofGenerator.tsx
├── components/ClaimButton.tsx
├── hooks/useClaimEligibility.ts
├── hooks/useGenerateProof.ts
└── hooks/useSubmitClaim.ts

libs/tangle-shared-ui/src/data/migration/
├── useMigrationClaim.ts
└── merkleTree.ts

tnt-core/packages/migration-claim/
├── src/
│   ├── TNT.sol
│   └── MigrationClaim.sol
├── script/
│   └── Deploy.s.sol
└── test/
    └── MigrationClaim.t.sol

tnt-core/packages/migration-claim/sp1/
├── program/src/main.rs
├── script/src/main.rs
└── lib/src/lib.rs
```

### Modified Files

```
apps/tangle-dapp/src/types/index.ts       # Add PagePath.CLAIM_MIGRATION
apps/tangle-dapp/src/app/app.tsx          # Add route
libs/dapp-config/src/contracts.ts         # Add migration contract addresses
```

---

## Security Considerations

1. **Double-claim Prevention**: Track claimed Substrate public keys, not EVM addresses
2. **Replay Protection**: Challenge includes contract address and chain ID
3. **Front-running Protection**: Only msg.sender can claim their own proof
4. **Merkle Tree Integrity**: Root is immutable after deployment
5. **Time-lock**: 1-year claim period with treasury recovery
6. **ZK Security**: SP1's Groth16 proofs provide 128-bit security

---

## Dependencies

### Smart Contracts
- OpenZeppelin Contracts v5
- SP1 Contracts (`@sp1-contracts`)

### ZK Circuit
- sp1-zkvm
- schnorrkel (Rust)

### Frontend
- @polkadot/extension-dapp (for SR25519 signing)
- @openzeppelin/merkle-tree
- viem/wagmi

---

## Estimated Gas Costs

| Operation | Estimated Gas |
|-----------|---------------|
| Deploy TNT | ~800,000 |
| Deploy MigrationClaim | ~1,200,000 |
| Claim (with proof verification) | ~350,000 - 500,000 |
| Recover Unclaimed | ~50,000 |

---

## Open Questions

1. **Prover Infrastructure**: Use Succinct Network (hosted) or self-hosted prover?
2. **Snapshot Source**: How will the Substrate chain snapshot be generated and verified?
3. **Token Supply**: Pre-mint all claimable tokens or mint on claim?
4. **Vesting**: Should claimed tokens have any vesting schedule?
