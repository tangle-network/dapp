//! SP1 Host Script: Generate SR25519 Verification Proofs
//!
//! This script generates ZK proofs for SR25519 signature verification.
//! It can be used as a CLI tool or integrated into a prover service.

use anyhow::{Context, Result};
use clap::Parser;
use sp1_sdk::{HashableKey, ProverClient, SP1Stdin};
use sr25519_claim_lib::ProgramInput;
use std::time::Instant;

/// The compiled ELF binary of the guest program
const ELF: &[u8] = include_bytes!("../../program/elf/riscv32im-succinct-zkvm-elf");

#[derive(Parser, Debug)]
#[command(author, version, about = "Generate SR25519 verification proofs")]
struct Args {
    /// The SS58 Substrate address (public key is derived from this)
    #[arg(long)]
    substrate_address: String,

    /// The SR25519 signature (128 hex chars)
    #[arg(long)]
    signature: String,

    /// The EVM address claiming tokens (40 hex chars, with or without 0x)
    #[arg(long)]
    evm_address: String,

    /// The claim amount in wei (decimal string)
    #[arg(long)]
    amount: String,

    /// The challenge hash (64 hex chars)
    #[arg(long)]
    challenge: String,

    /// Output file for the proof (JSON format)
    #[arg(long, default_value = "proof.json")]
    output: String,

    /// Use mock prover for testing (no actual proof generation)
    #[arg(long, default_value = "false")]
    mock: bool,
}

#[derive(serde::Serialize)]
struct ProofOutput {
    /// The proof bytes (hex encoded)
    proof: String,
    /// The public values (hex encoded)
    public_values: String,
    /// The verification key (hex encoded)
    vkey: String,
    /// Proof generation time in seconds
    generation_time_secs: f64,
}

fn parse_hex_bytes<const N: usize>(s: &str) -> Result<[u8; N]> {
    let s = s.strip_prefix("0x").unwrap_or(s);
    let bytes = hex::decode(s).context("Invalid hex string")?;
    if bytes.len() != N {
        anyhow::bail!("Expected {} bytes, got {}", N, bytes.len());
    }
    let mut arr = [0u8; N];
    arr.copy_from_slice(&bytes);
    Ok(arr)
}

fn parse_u256_string(s: &str) -> Result<[u8; 32]> {
    // Parse decimal string to U256 and convert to big-endian bytes
    let value: primitive_types::U256 = s.parse().context("Invalid U256 string")?;
    let mut bytes = [0u8; 32];
    value.to_big_endian(&mut bytes);
    Ok(bytes)
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenv::dotenv().ok();

    let args = Args::parse();

    println!("SR25519 Claim Proof Generator");
    println!("=============================");

    // Parse inputs
    let signature: [u8; 64] = parse_hex_bytes(&args.signature)
        .context("Invalid signature")?;
    let evm_address: [u8; 20] = parse_hex_bytes(&args.evm_address)
        .context("Invalid EVM address")?;
    let amount: [u8; 32] = parse_u256_string(&args.amount)
        .context("Invalid amount")?;
    let challenge: [u8; 32] = parse_hex_bytes(&args.challenge)
        .context("Invalid challenge")?;

    println!("Substrate Address: {}", args.substrate_address);
    println!("EVM Address: 0x{}", hex::encode(&evm_address));
    println!("Amount: {} wei", args.amount);
    println!("Challenge: 0x{}", hex::encode(&challenge));

    // Create program input (public key is derived from SS58 inside the ZK circuit)
    let input = ProgramInput {
        substrate_address: args.substrate_address.clone(),
        signature,
        evm_address,
        amount,
        challenge,
    };

    // Initialize the SP1 prover client
    let client = ProverClient::from_env();

    // Prepare the stdin with our inputs
    let mut stdin = SP1Stdin::new();
    stdin.write(&input);

    // Setup the program (get proving and verification keys)
    println!("\nSetting up program...");
    let (pk, vk) = client.setup(ELF);
    let vkey_bytes = vk.bytes32();
    println!("Verification Key: 0x{}", hex::encode(&vkey_bytes));

    // Generate the proof
    println!("\nGenerating proof...");
    let start = Instant::now();

    let proof = if args.mock {
        println!("Using mock prover (no real proof)");
        client.prove(&pk, &stdin).run()?
    } else {
        // Use Groth16 for on-chain verification
        println!("Using Groth16 prover (this may take a while)...");
        client.prove(&pk, &stdin).groth16().run()?
    };

    let generation_time = start.elapsed();
    println!("Proof generated in {:.2?}", generation_time);

    // Extract public values
    let public_values_bytes = proof.public_values.to_vec();
    println!("Public Values: 0x{}", hex::encode(&public_values_bytes));

    // Verify the proof
    println!("\nVerifying proof...");
    client.verify(&proof, &vk)?;
    println!("Proof verified successfully!");

    // Create output
    let output = ProofOutput {
        proof: format!("0x{}", hex::encode(proof.bytes())),
        public_values: format!("0x{}", hex::encode(&public_values_bytes)),
        vkey: format!("0x{}", hex::encode(&vkey_bytes)),
        generation_time_secs: generation_time.as_secs_f64(),
    };

    // Write to file
    let json = serde_json::to_string_pretty(&output)?;
    std::fs::write(&args.output, &json)?;
    println!("\nProof written to: {}", args.output);

    Ok(())
}

/// Test module for the SP1 script
///
/// Note: These tests require the SP1 toolchain due to serde/alloy compatibility.
/// Run tests with: cargo +succinct test -p sr25519-claim-script
/// Or run only the lib tests: cargo test -p sr25519-claim-lib
///
/// Integration tests (marked with #[ignore]) additionally require:
/// 1. Building the program ELF: cargo prove build
/// 2. SP1_PROVER=mock environment variable for fast testing
#[cfg(test)]
mod tests {
    use super::*;
    use schnorrkel::{signing_context, Keypair};
    use rand::rngs::OsRng;
    use sr25519_claim_lib::{ss58_encode, PublicValues};

    /// Helper to create a test keypair and valid signature
    fn create_test_inputs() -> (ProgramInput, [u8; 32]) {
        // Generate a test keypair
        let keypair = Keypair::generate_with(OsRng);
        let public_key = keypair.public.to_bytes();

        // Encode as SS58 with Tangle prefix (5845)
        let substrate_address = ss58_encode(&public_key, 5845);

        // Create a test challenge (simulating keccak256(contractAddress, chainId, evmAddress))
        let challenge = [42u8; 32];
        let evm_address = [0x12u8; 20];
        let amount = {
            let mut arr = [0u8; 32];
            arr[31] = 100; // 100 wei
            arr
        };

        // Sign the challenge using the Substrate signing context
        let ctx = signing_context(b"substrate");
        let signature = keypair.sign(ctx.bytes(&challenge));
        let signature_bytes = signature.to_bytes();

        let input = ProgramInput {
            substrate_address,
            signature: signature_bytes,
            evm_address,
            amount,
            challenge,
        };

        (input, public_key)
    }

    #[test]
    fn test_input_creation() {
        let (input, public_key) = create_test_inputs();

        println!("Test input created:");
        println!("  Substrate Address: {}", input.substrate_address);
        println!("  Public Key (from SS58): 0x{}", hex::encode(&public_key));

        // Verify we can decode the SS58 back to the public key
        let decoded = sr25519_claim_lib::ss58_decode(&input.substrate_address).unwrap();
        assert_eq!(decoded, public_key, "SS58 roundtrip should preserve public key");
    }

    #[test]
    fn test_parse_hex_bytes() {
        // Test with 0x prefix
        let result: [u8; 32] = parse_hex_bytes("0x0000000000000000000000000000000000000000000000000000000000000001").unwrap();
        assert_eq!(result[31], 1);

        // Test without 0x prefix
        let result: [u8; 20] = parse_hex_bytes("1234567890123456789012345678901234567890").unwrap();
        assert_eq!(result[0], 0x12);

        // Test error on wrong length
        let err = parse_hex_bytes::<32>("0x1234");
        assert!(err.is_err());
    }

    #[test]
    fn test_parse_u256_string() {
        // Test small value
        let result = parse_u256_string("100").unwrap();
        assert_eq!(result[31], 100);

        // Test 1 ether = 10^18 wei
        let result = parse_u256_string("1000000000000000000").unwrap();
        // This should be non-zero in the middle bytes
        assert!(result.iter().any(|&b| b != 0));

        // Test very large value
        let result = parse_u256_string("115792089237316195423570985008687907853269984665640564039457584007913129639935").unwrap();
        // Max U256 = all 0xFF
        assert!(result.iter().all(|&b| b == 0xFF));
    }

    /// Integration test: Run the full ZK program with mock prover
    /// This verifies the entire flow from input creation to proof verification
    #[test]
    #[ignore = "Requires SP1 program ELF to be built first (cargo prove build)"]
    fn test_full_zk_flow_mock() {
        let (input, public_key) = create_test_inputs();

        println!("\n=== SP1 Integration Test ===");
        println!("Substrate Address: {}", input.substrate_address);
        println!("EVM Address: 0x{}", hex::encode(&input.evm_address));

        // Initialize SP1 prover in mock mode
        std::env::set_var("SP1_PROVER", "mock");
        let client = ProverClient::from_env();

        // Prepare stdin
        let mut stdin = SP1Stdin::new();
        stdin.write(&input);

        // Setup program
        let (pk, vk) = client.setup(ELF);
        println!("Verification key: 0x{}", hex::encode(vk.bytes32()));

        // Generate mock proof
        let proof = client.prove(&pk, &stdin).run().expect("Mock proof generation failed");

        // Verify the proof
        client.verify(&proof, &vk).expect("Proof verification failed");
        println!("Proof verified successfully!");

        // Decode and verify public values
        let public_values_bytes = proof.public_values.to_vec();
        let decoded = PublicValues::abi_decode(&public_values_bytes)
            .expect("Failed to decode public values");

        // Verify the public values match our inputs
        assert_eq!(decoded.pubkey, public_key, "Public key should match");
        assert_eq!(decoded.evm_address, input.evm_address);
        assert_eq!(decoded.amount, input.amount);

        println!("Public values verified:");
        println!("  Public Key: 0x{}", hex::encode(&decoded.pubkey));
        println!("  EVM Address: 0x{}", hex::encode(&decoded.evm_address));
        println!("  Amount: {} (big-endian bytes)", hex::encode(&decoded.amount));
    }

    /// Test that invalid signatures are rejected by the ZK program
    #[test]
    #[ignore = "Requires SP1 program ELF to be built first (cargo prove build)"]
    fn test_invalid_signature_rejected() {
        let (mut input, _) = create_test_inputs();

        // Corrupt the signature
        input.signature[0] ^= 0xFF;
        input.signature[1] ^= 0xFF;

        // Initialize SP1 prover in mock mode
        std::env::set_var("SP1_PROVER", "mock");
        let client = ProverClient::from_env();

        let mut stdin = SP1Stdin::new();
        stdin.write(&input);

        let (pk, _vk) = client.setup(ELF);

        // This should fail because the signature is invalid
        let result = client.prove(&pk, &stdin).run();
        assert!(result.is_err(), "Invalid signature should cause proof generation to fail");

        println!("Invalid signature correctly rejected");
    }

    /// Test that wrong challenge is rejected
    #[test]
    #[ignore = "Requires SP1 program ELF to be built first (cargo prove build)"]
    fn test_wrong_challenge_rejected() {
        let (mut input, _) = create_test_inputs();

        // Change the challenge (signature was made over different data)
        input.challenge = [0xDE; 32];

        // Initialize SP1 prover in mock mode
        std::env::set_var("SP1_PROVER", "mock");
        let client = ProverClient::from_env();

        let mut stdin = SP1Stdin::new();
        stdin.write(&input);

        let (pk, _vk) = client.setup(ELF);

        // This should fail because the challenge doesn't match what was signed
        let result = client.prove(&pk, &stdin).run();
        assert!(result.is_err(), "Wrong challenge should cause proof generation to fail");

        println!("Wrong challenge correctly rejected");
    }
}
