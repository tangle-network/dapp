/**
 * Merkle Tree utilities for the TangleMigration claim system
 *
 * This module provides functions for:
 * - Loading and parsing pre-generated Merkle proofs data
 * - Looking up balances and proofs from the proofs.json file
 * - Converting SS58 addresses to raw 32-byte pubkeys for contract calls
 *
 * The proofs.json file format is:
 * {
 *   "ss58Address": {
 *     "proof": ["0x...", ...],
 *     "leaf": [pubkey, amount]  // pubkey is bytes32 hex string
 *   }
 * }
 */

import { decodeAddress } from '@polkadot/util-crypto';
import type { Hex } from 'viem';

/**
 * Leaf data format from the merkle tree
 * [pubkey (bytes32 hex), amount (wei string)]
 */
export type MerkleLeaf = [string, string];

/**
 * Entry in the proofs.json file
 */
export interface ProofEntry {
  /** The 32-byte public key as bytes32 hex (for contract calls) */
  pubkey: string;
  /** Balance in wei */
  balance: string;
  /** Merkle proof - array of bytes32 hashes */
  proof: string[];
  /** Leaf data: [pubkey (bytes32 hex), amountWei] */
  leaf: MerkleLeaf;
}

/**
 * Full proofs.json data structure - keyed by SS58 address
 */
export interface MigrationProofsData {
  [ss58Address: string]: ProofEntry;
}

/**
 * Claim data for a specific address (returned by lookupClaim)
 */
export interface ClaimData {
  /** The SS58 Substrate address (for display/lookup) */
  ss58Address: string;
  /** The 32-byte public key as bytes32 hex (for contract calls) */
  pubkey: Hex;
  /** The claimable amount in wei */
  amount: bigint;
  /** Merkle proof as Hex array */
  merkleProof: Hex[];
}

/**
 * Convert an SS58 address to a bytes32 hex pubkey
 * Uses @polkadot/util-crypto to decode the address
 */
export const ss58ToPubkey = (ss58Address: string): Hex => {
  const pubkeyBytes = decodeAddress(ss58Address);
  // Convert Uint8Array to hex string with 0x prefix
  const hex = Array.from(pubkeyBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `0x${hex}` as Hex;
};

/**
 * Parse proofs JSON data
 */
export const parseProofsJson = (jsonString: string): MigrationProofsData => {
  return JSON.parse(jsonString) as MigrationProofsData;
};

/**
 * Load and parse migration proofs data
 * This is the main entry point for loading proofs.json
 */
export const loadMerkleTreeData = (json: string): MigrationProofsData => {
  return parseProofsJson(json);
};

/**
 * Lookup claim data for an SS58 address from the proofs data.
 * Handles different SS58 prefixes by comparing pubkeys (not string addresses).
 *
 * This is important because the proofs.json uses Tangle SS58 format (prefix 5181,
 * starts with "tg") but users might enter addresses with different prefixes
 * (e.g., generic prefix 42 starts with "5").
 */
export const lookupClaim = (
  proofsData: MigrationProofsData,
  ss58Address: string,
): ClaimData | null => {
  // First, try direct lookup (fast path for matching prefix)
  let entry = proofsData[ss58Address];
  let foundAddress = ss58Address;

  // If direct lookup fails, try lookup by pubkey
  if (!entry) {
    try {
      // Decode the input address to get its pubkey
      const inputPubkey = ss58ToPubkey(ss58Address).toLowerCase();

      // Search through all entries to find a matching pubkey
      for (const [storedAddress, storedEntry] of Object.entries(proofsData)) {
        const storedPubkey = storedEntry.pubkey.startsWith('0x')
          ? storedEntry.pubkey.toLowerCase()
          : `0x${storedEntry.pubkey}`.toLowerCase();

        if (storedPubkey === inputPubkey) {
          entry = storedEntry;
          foundAddress = storedAddress;
          break;
        }
      }
    } catch {
      // Invalid address format - can't decode
      return null;
    }
  }

  if (!entry) {
    return null;
  }

  // Use pubkey from entry (with 0x prefix normalization)
  const pubkey = entry.pubkey.startsWith('0x')
    ? entry.pubkey
    : `0x${entry.pubkey}`;

  return {
    ss58Address: foundAddress,
    pubkey: pubkey as Hex,
    amount: BigInt(entry.balance),
    merkleProof: entry.proof.map((p) => p as Hex),
  };
};

/**
 * Check if an SS58 address is eligible for claiming
 */
export const isEligible = (
  proofsData: MigrationProofsData,
  ss58Address: string,
): boolean => {
  return lookupClaim(proofsData, ss58Address) !== null;
};

/**
 * Get the claimable balance for an SS58 address
 */
export const getClaimableBalance = (
  proofsData: MigrationProofsData,
  ss58Address: string,
): bigint | null => {
  const claim = lookupClaim(proofsData, ss58Address);
  return claim?.amount ?? null;
};

/**
 * Get statistics about the migration data
 */
export const getMigrationStats = (proofsData: MigrationProofsData) => {
  const addresses = Object.keys(proofsData);
  let totalAmount = BigInt(0);

  for (const address of addresses) {
    const entry = proofsData[address];
    totalAmount += BigInt(entry.balance);
  }

  return {
    totalAccounts: addresses.length,
    totalAmount,
  };
};
