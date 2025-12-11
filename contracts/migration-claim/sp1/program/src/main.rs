//! SP1 Guest Program: SR25519 Signature Verification
//!
//! This program verifies that a user possesses the private key corresponding
//! to a Substrate SR25519 public key by verifying a signature over a challenge.
//!
//! Security: The public key is DERIVED from the SS58 address (not user-provided),
//! ensuring the signature verification is bound to the claimed address.
//!
//! The challenge includes:
//! - The MigrationClaim contract address
//! - The chain ID
//! - The claimer's EVM address
//!
//! Public outputs (committed on-chain):
//! - The Substrate SS58 address
//! - The EVM address
//! - The claim amount

#![no_main]
sp1_zkvm::entrypoint!(main);

use schnorrkel::{signing_context, PublicKey, Signature};
use sr25519_claim_lib::{ss58_decode, ProgramInput, PublicValues};

/// The signing context used by Substrate for SR25519 signatures
/// This must match what the polkadot.js extension uses
const SUBSTRATE_CONTEXT: &[u8] = b"substrate";

pub fn main() {
    // Read the program inputs from the host
    let input: ProgramInput = sp1_zkvm::io::read();

    // SECURITY: Derive the public key from the SS58 address
    // This ensures we verify the signature against the address being claimed,
    // not a user-provided key that could be spoofed
    let pubkey_bytes = ss58_decode(&input.substrate_address)
        .expect("Failed to decode SS58 address");

    // Parse the SR25519 public key from the decoded bytes
    let public_key = PublicKey::from_bytes(&pubkey_bytes)
        .expect("Failed to parse SR25519 public key from SS58");

    // Parse the signature
    let signature = Signature::from_bytes(&input.signature)
        .expect("Failed to parse SR25519 signature");

    // Create the signing context (must match what was used to sign)
    let ctx = signing_context(SUBSTRATE_CONTEXT);

    // Verify the signature over the challenge
    // This is the core ZK computation - proving knowledge of the private key
    // that corresponds to the SS58 address
    public_key
        .verify(ctx.bytes(&input.challenge), &signature)
        .expect("SR25519 signature verification failed");

    // Create the public values to commit on-chain
    // These values will be verified by the TangleMigration contract
    let public_values = PublicValues {
        pubkey: pubkey_bytes,  // The derived public key (32 bytes)
        evm_address: input.evm_address,
        amount: input.amount,
    };

    // Commit the public values as ABI-encoded bytes
    // Format: abi.encode(bytes32 pubkey, address evmAddress, uint256 amount)
    // These will be visible on-chain and used by the TangleMigration contract
    sp1_zkvm::io::commit_slice(&public_values.abi_encode());
}
