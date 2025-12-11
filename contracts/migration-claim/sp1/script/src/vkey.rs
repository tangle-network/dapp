//! Output the verification key for the SR25519 program
//!
//! This is used to get the vkey for deploying the MigrationClaim contract.

use anyhow::Result;
use sp1_sdk::ProverClient;

const ELF: &[u8] = include_bytes!("../../program/elf/riscv32im-succinct-zkvm-elf");

fn main() -> Result<()> {
    println!("SR25519 Claim Program - Verification Key");
    println!("=========================================");

    let client = ProverClient::from_env();
    let (_pk, vk) = client.setup(ELF);

    let vkey_bytes = vk.bytes32();

    println!("\nVerification Key (bytes32):");
    println!("0x{}", hex::encode(&vkey_bytes));

    println!("\nUse this value as the `sr25519Vkey` constructor parameter");
    println!("when deploying the MigrationClaim contract.");

    Ok(())
}
