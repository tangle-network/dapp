//! Shared types for the SR25519 claim ZK program
//!
//! This library contains the public inputs/outputs shared between
//! the SP1 guest program and the host/verifier.
//!
//! The public values must match what TangleMigration.sol expects:
//! abi.encode(string substrateAddress, address evmAddress, uint256 amount)

use alloy_primitives::{Address, U256};
use alloy_sol_types::SolValue;
use blake2::{Blake2b512, Digest};
use serde::{Deserialize, Serialize};
use serde_big_array::BigArray;

/// SS58 checksum prefix
const SS58_PREFIX: &[u8] = b"SS58PRE";

/// The inputs to the SR25519 verification program
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgramInput {
    /// The SS58 Substrate address (string) - public key is derived from this
    pub substrate_address: String,
    /// The SR25519 signature (64 bytes)
    #[serde(with = "BigArray")]
    pub signature: [u8; 64],
    /// The EVM address claiming the tokens (20 bytes)
    pub evm_address: [u8; 20],
    /// The claim amount in wei
    pub amount: [u8; 32], // U256 as bytes
    /// The challenge that was signed (32 bytes)
    /// This should be: keccak256(contractAddress, chainId, evmAddress)
    pub challenge: [u8; 32],
}

/// The public values output by the program (committed on-chain)
/// These must match what SP1ZKVerifier.sol decodes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicValues {
    /// The SR25519 public key (32 bytes, decoded from SS58)
    pub pubkey: [u8; 32],
    /// The EVM address to receive tokens
    pub evm_address: [u8; 20],
    /// The claim amount in wei (U256 as big-endian bytes)
    pub amount: [u8; 32],
}

impl PublicValues {
    /// Encode the public values for on-chain verification
    /// Format: abi.encode(bytes32, address, uint256)
    /// This matches what SP1ZKVerifier.sol expects
    pub fn abi_encode(&self) -> Vec<u8> {
        use alloy_primitives::FixedBytes;

        let pubkey = FixedBytes::<32>::from_slice(&self.pubkey);
        let address = Address::from_slice(&self.evm_address);
        let amount = U256::from_be_bytes(self.amount);

        // Encode as Solidity tuple: (bytes32, address, uint256)
        (pubkey, address, amount).abi_encode()
    }

    /// Decode public values from ABI-encoded bytes
    pub fn abi_decode(data: &[u8]) -> Result<Self, &'static str> {
        use alloy_primitives::FixedBytes;

        let decoded = <(FixedBytes<32>, Address, U256)>::abi_decode(data, true)
            .map_err(|_| "Failed to ABI decode public values")?;

        let (pubkey, evm_address, amount) = decoded;

        Ok(Self {
            pubkey: pubkey.0,
            evm_address: evm_address.0 .0,
            amount: amount.to_be_bytes(),
        })
    }
}

/// Decode an SS58 address to extract the 32-byte public key
///
/// SS58 format:
/// - 1 or 2 byte network prefix
/// - 32 byte public key
/// - 2 byte checksum (blake2b of SS58PRE || prefix || pubkey)
///
/// Returns the 32-byte public key if valid, error otherwise
pub fn ss58_decode(address: &str) -> Result<[u8; 32], &'static str> {
    // Base58 decode
    let decoded = bs58::decode(address)
        .into_vec()
        .map_err(|_| "Invalid base58 encoding")?;

    if decoded.len() < 35 {
        return Err("SS58 address too short");
    }

    // Determine prefix length (1 or 2 bytes)
    let (prefix_len, _network_id) = if decoded[0] < 64 {
        // Single byte prefix (0-63)
        (1, decoded[0] as u16)
    } else if decoded[0] < 128 {
        // Two byte prefix (64-16383)
        if decoded.len() < 36 {
            return Err("SS58 address too short for two-byte prefix");
        }
        let lower = ((decoded[0] & 0x3f) as u16) << 2;
        let upper = (decoded[1] as u16) >> 6;
        (2, lower | upper | ((decoded[1] as u16 & 0x3f) << 8))
    } else {
        return Err("Invalid SS58 prefix");
    };

    // Extract public key (32 bytes after prefix)
    let pubkey_start = prefix_len;
    let pubkey_end = pubkey_start + 32;

    if decoded.len() < pubkey_end + 2 {
        return Err("SS58 address missing checksum");
    }

    let pubkey_slice = &decoded[pubkey_start..pubkey_end];
    let checksum = &decoded[pubkey_end..pubkey_end + 2];

    // Verify checksum
    let mut hasher = Blake2b512::new();
    hasher.update(SS58_PREFIX);
    hasher.update(&decoded[..pubkey_end]);
    let hash = hasher.finalize();

    if checksum != &hash[..2] {
        return Err("Invalid SS58 checksum");
    }

    // Copy to fixed array
    let mut pubkey = [0u8; 32];
    pubkey.copy_from_slice(pubkey_slice);

    Ok(pubkey)
}

/// Encode a 32-byte public key to SS58 format with the given network prefix
pub fn ss58_encode(pubkey: &[u8; 32], network_id: u16) -> String {
    let mut data = Vec::with_capacity(37);

    // Encode network prefix
    if network_id < 64 {
        data.push(network_id as u8);
    } else if network_id < 16384 {
        let first = ((network_id & 0xfc) >> 2) as u8 | 0x40;
        let second = ((network_id >> 8) as u8) | ((network_id & 0x03) as u8) << 6;
        data.push(first);
        data.push(second);
    } else {
        panic!("Network ID too large");
    }

    // Add public key
    data.extend_from_slice(pubkey);

    // Calculate checksum
    let mut hasher = Blake2b512::new();
    hasher.update(SS58_PREFIX);
    hasher.update(&data);
    let hash = hasher.finalize();

    // Append 2-byte checksum
    data.extend_from_slice(&hash[..2]);

    // Base58 encode
    bs58::encode(data).into_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_public_values_roundtrip() {
        let values = PublicValues {
            pubkey: [0x42; 32],  // 32-byte pubkey
            evm_address: [0x12; 20],
            amount: {
                let mut arr = [0u8; 32];
                arr[31] = 100; // 100 wei
                arr
            },
        };

        let encoded = values.abi_encode();
        let decoded = PublicValues::abi_decode(&encoded).unwrap();

        assert_eq!(decoded.pubkey, values.pubkey);
        assert_eq!(decoded.evm_address, values.evm_address);
        assert_eq!(decoded.amount, values.amount);
    }

    #[test]
    fn test_ss58_decode_encode_roundtrip() {
        // Test with a known Tangle address (prefix 5845 = "tg")
        let address = "tgFbShs5bUXZ8bcFfHkRm5vDbUQbUR3QQNhQktuK2mCW19qCR";

        // Decode
        let pubkey = ss58_decode(address).expect("Failed to decode SS58");

        // Tangle network prefix is 5845
        let re_encoded = ss58_encode(&pubkey, 5845);

        assert_eq!(address, re_encoded);
    }

    #[test]
    fn test_ss58_decode_polkadot() {
        // Polkadot address (prefix 0)
        let address = "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5";
        let pubkey = ss58_decode(address).expect("Failed to decode");
        assert_eq!(pubkey.len(), 32);
    }

    #[test]
    fn test_ss58_decode_substrate_generic() {
        // Generic Substrate address (prefix 42)
        let address = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
        let pubkey = ss58_decode(address).expect("Failed to decode");
        assert_eq!(pubkey.len(), 32);

        // Re-encode with prefix 42
        let re_encoded = ss58_encode(&pubkey, 42);
        assert_eq!(address, re_encoded);
    }

    #[test]
    fn test_ss58_decode_invalid_checksum() {
        // Take a valid address and modify a character
        let address = "tgFbShs5bUXZ8bcFfHkRm5vDbUQbUR3QQNhQktuK2mCW19qCX"; // Changed last char
        let result = ss58_decode(address);
        assert!(result.is_err());
    }

    #[test]
    fn test_ss58_decode_invalid_base58() {
        // Invalid base58 characters (0, O, I, l)
        let address = "0invalid";
        let result = ss58_decode(address);
        assert!(result.is_err());
    }

    #[test]
    fn test_ss58_decode_too_short() {
        let address = "5GrwvaEF";
        let result = ss58_decode(address);
        assert!(result.is_err());
    }

    #[test]
    fn test_program_input_serialization() {
        let input = ProgramInput {
            substrate_address: "tgFbShs5bUXZ8bcFfHkRm5vDbUQbUR3QQNhQktuK2mCW19qCR".to_string(),
            signature: [0xAB; 64],
            evm_address: [0x12; 20],
            amount: {
                let mut arr = [0u8; 32];
                arr[31] = 100;
                arr
            },
            challenge: [0x42; 32],
        };

        // Test serialization roundtrip with bincode (same as SP1 uses)
        let serialized = bincode::serialize(&input).expect("Failed to serialize");
        let deserialized: ProgramInput = bincode::deserialize(&serialized).expect("Failed to deserialize");

        assert_eq!(input.substrate_address, deserialized.substrate_address);
        assert_eq!(input.signature, deserialized.signature);
        assert_eq!(input.evm_address, deserialized.evm_address);
        assert_eq!(input.amount, deserialized.amount);
        assert_eq!(input.challenge, deserialized.challenge);
    }

    #[test]
    fn test_public_values_abi_encoding_format() {
        // Test that ABI encoding produces expected format for Solidity
        let values = PublicValues {
            pubkey: [0xAB; 32],  // 32-byte pubkey
            evm_address: [0x01; 20],
            amount: {
                let mut arr = [0u8; 32];
                arr[31] = 1; // 1 wei
                arr
            },
        };

        let encoded = values.abi_encode();

        // ABI encoding should be exactly 96 bytes (3 words): bytes32 + address (padded) + uint256
        assert_eq!(encoded.len(), 96, "ABI encoding should be exactly 96 bytes");

        // Decode and verify
        let decoded = PublicValues::abi_decode(&encoded).unwrap();
        assert_eq!(decoded.pubkey, [0xAB; 32]);
        assert_eq!(decoded.evm_address, [0x01; 20]);
        assert_eq!(decoded.amount[31], 1);
    }

    #[test]
    fn test_various_network_prefixes() {
        // Test encoding/decoding with various network prefixes
        let test_pubkey = [0x42u8; 32];

        // Polkadot (0)
        let polkadot_addr = ss58_encode(&test_pubkey, 0);
        let decoded = ss58_decode(&polkadot_addr).unwrap();
        assert_eq!(decoded, test_pubkey);

        // Kusama (2)
        let kusama_addr = ss58_encode(&test_pubkey, 2);
        let decoded = ss58_decode(&kusama_addr).unwrap();
        assert_eq!(decoded, test_pubkey);

        // Generic Substrate (42)
        let substrate_addr = ss58_encode(&test_pubkey, 42);
        let decoded = ss58_decode(&substrate_addr).unwrap();
        assert_eq!(decoded, test_pubkey);

        // Tangle (5845) - uses 2-byte prefix
        let tangle_addr = ss58_encode(&test_pubkey, 5845);
        let decoded = ss58_decode(&tangle_addr).unwrap();
        assert_eq!(decoded, test_pubkey);
    }
}
