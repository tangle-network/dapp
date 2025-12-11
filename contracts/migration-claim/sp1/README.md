# SR25519 Claim ZK Circuit

This SP1 zero-knowledge circuit verifies SR25519 signatures from Substrate accounts, enabling secure migration claims on EVM chains.

## Overview

The circuit proves that:
1. A valid SR25519 signature exists for a challenge message
2. The signer owns a specific Substrate public key (derived from SS58 address)
3. The signature authorizes a claim to a specific EVM address and amount

This allows Substrate account holders to claim TNT tokens on Base/Ethereum without exposing their private keys.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Substrate      │     │   SP1 ZK         │     │  Base/Ethereum  │
│  Wallet         │────▶│   Prover         │────▶│  Contract       │
│  (signs claim)  │     │  (generates      │     │  (verifies      │
│                 │     │   Groth16 proof) │     │   proof)        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Workspace Structure

- **`program/`** - The zkVM guest program (runs inside SP1)
- **`script/`** - Host scripts for proof generation and verification key output
- **`lib/`** - Shared types and utilities (SS58 encoding, public values)

## Prerequisites

1. **SP1 Toolchain** (Succinct's fork of Rust)
   ```bash
   curl -L https://sp1up.succinct.xyz | bash
   sp1up
   ```

2. **Rust** (for host scripts)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

## Building

### Build the ZK Program

```bash
cd /Users/drew/webb/dapp/contracts/migration-claim/sp1
cargo prove build
```

This compiles the guest program to RISC-V ELF at `program/elf/riscv32im-succinct-zkvm-elf`.

### Build the Host Scripts

```bash
cargo +succinct build --release -p sr25519-claim-script
```

## Usage

### Get Program Verification Key

The verification key is needed when deploying the SP1ZKVerifier contract:

```bash
cargo +succinct run --release -p sr25519-claim-script --bin vkey
```

Output:
```
SR25519 Claim Program - Verification Key
=========================================

Verification Key (bytes32):
0x307830303064373434343466313664373566373235323736383761333663316264346334396536373939383136646163343938396265336263313735653836666437

Use this value as the `sr25519Vkey` constructor parameter
when deploying the MigrationClaim contract.
```

### Generate a Proof

#### Mock Mode (for testing)

```bash
SP1_PROVER=mock cargo +succinct run --release -p sr25519-claim-script -- \
  --substrate-address "tgYourSubstrateAddress..." \
  --signature "0x<128-hex-chars>" \
  --evm-address "0x<40-hex-chars>" \
  --amount "1000000000000000000" \
  --challenge "0x<64-hex-chars>" \
  --mock
```

#### Real Groth16 Proof (for production)

See [Generating Real Proofs](#generating-real-proofs) section below.

### CLI Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `--substrate-address` | SS58-encoded Substrate address | `tgDSk9kkFw...` |
| `--signature` | SR25519 signature (128 hex chars) | `0x1234...` |
| `--evm-address` | EVM recipient address (40 hex chars) | `0xAbCd...` |
| `--amount` | Claim amount in wei (decimal string) | `1000000000000000000` |
| `--challenge` | Challenge hash to sign (64 hex chars) | `0x5678...` |
| `--output` | Output file path (default: `proof.json`) | `my-proof.json` |
| `--mock` | Use mock prover (no real proof) | - |

### Output Format

The generated `proof.json` contains:

```json
{
  "proof": "0x...",
  "public_values": "0x...",
  "vkey": "0x...",
  "generation_time_secs": 123.45
}
```

## Testing

### Run Unit Tests (lib only)

```bash
cargo test -p sr25519-claim-lib
```

### Run Integration Tests (requires built ELF)

```bash
# First build the program
cargo prove build

# Then run integration tests with mock prover
SP1_PROVER=mock cargo +succinct test -p sr25519-claim-script -- --ignored
```

Integration tests verify:
- Full ZK flow with valid signatures
- Invalid signature rejection
- Wrong challenge rejection

## Deploying to Testnet/Mainnet

### Step 1: Get the Verification Key

```bash
cargo +succinct run --release -p sr25519-claim-script --bin vkey
```

Save the output `PROGRAM_VKEY`.

### Step 2: Deploy Contracts

```bash
cd /Users/drew/webb/dapp/contracts/migration-claim

MERKLE_ROOT=<your-merkle-root> \
PROGRAM_VKEY=<vkey-from-step-1> \
PRIVATE_KEY=<deployer-private-key> \
forge script script/DeployTangleMigration.s.sol:DeployTangleMigration \
  --rpc-url https://sepolia.base.org \
  --broadcast
```

This deploys with the real SP1ZKVerifier pointing to the SP1 Verifier Gateway at `0x397A5f7f3dBd538f23DE225B51f532c34448dA9B`.

### Step 3: Generate Real Proofs

See next section.

## Generating Real Proofs

Real Groth16 proofs require the **Succinct Prover Network**.

### Setup Prover Network Access

1. **Create a keypair** (Secp256k1, like Ethereum):
   ```bash
   cast wallet new
   ```

2. **Get PROVE tokens** on Ethereum mainnet (see [Succinct docs](https://docs.succinct.xyz/docs/sp1/prover-network/quickstart))

3. **Deposit PROVE** via [Succinct Explorer](https://explorer.succinct.xyz)

### Generate Proof

```bash
cd /Users/drew/webb/dapp/contracts/migration-claim/sp1

# Set your prover network private key
export NETWORK_PRIVATE_KEY=<your-secp256k1-private-key>

# Generate real Groth16 proof
cargo +succinct run --release -p sr25519-claim-script -- \
  --substrate-address "tgYourAddress..." \
  --signature "0x<128-hex-chars>" \
  --evm-address "0x<recipient-address>" \
  --amount "1000000000000000000" \
  --challenge "0x<challenge-hash>"
```

This submits the proof request to the Succinct prover network and returns when complete.

### Submit Claim

Use the generated proof to call the contract:

```solidity
TangleMigration.claim(
    pubkey,       // bytes32 - Substrate public key from proof
    amount,       // uint256 - Claim amount
    merkleProof,  // bytes32[] - Merkle proof for eligibility
    zkProof       // bytes - Groth16 proof from proof.json
)
```

## Security

### Frontrunning Protection

The system is frontrun-resistant because:

1. **EVM recipient is bound in the signature**: The Substrate wallet signs `keccak256(contractAddress, chainId, evmAddress)`, binding the recipient.

2. **ZK proof commits to recipient**: The public values include `(pubkey, evmAddress, amount)`, all verified on-chain.

3. **Contract verifies match**: The TangleMigration contract verifies that the proof's `evmAddress` matches `msg.sender`.

An attacker cannot use someone else's proof because:
- They can't change the EVM address without invalidating the signature
- The contract rejects proofs where `evmAddress != msg.sender`

### Mock vs Real Verification

| Mode | Use Case | Security |
|------|----------|----------|
| `MockZKVerifier` | Local testing | None - accepts any proof |
| `SP1ZKVerifier` | Testnet/Mainnet | Full cryptographic verification |

**Never use MockZKVerifier in production!**

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SP1_PROVER` | Prover mode: `mock`, `local`, or `network` | No (default: `network`) |
| `NETWORK_PRIVATE_KEY` | Secp256k1 key for prover network | For network mode |

## Troubleshooting

### "failed to find branch" during build

Ensure you're using the correct patch branches in `Cargo.toml`:
```toml
[patch.crates-io]
curve25519-dalek = { git = "https://github.com/sp1-patches/curve25519-dalek", branch = "patch-curve25519-v4.1.3" }
```

### "could not find '__private' in 'serde'"

Pin serde to avoid compatibility issues:
```toml
serde = { version = ">=1.0,<1.0.218", features = ["derive"] }
```

Then run:
```bash
cargo update -p serde
```

### "no method named 'bytes32' found"

Add the HashableKey trait import:
```rust
use sp1_sdk::HashableKey;
```

## References

- [SP1 Documentation](https://docs.succinct.xyz/)
- [SP1 Prover Network Quickstart](https://docs.succinct.xyz/docs/sp1/prover-network/quickstart)
- [SP1 GitHub](https://github.com/succinctlabs/sp1)
- [Succinct Explorer](https://explorer.succinct.xyz)
