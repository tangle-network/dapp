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
 * Raw entry format in proofs.json file
 * Format: { proof: string[], leaf: [ss58Address, amountWei] }
 */
export interface RawProofEntry {
  /** Merkle proof - array of bytes32 hashes */
  proof: string[];
  /** Leaf data: [ss58Address, amountWei] */
  leaf: MerkleLeaf;
}

/**
 * Processed entry with derived fields for easier access
 */
export interface ProofEntry {
  /** The SS58 address from leaf[0] */
  ss58Address: string;
  /** Balance in wei from leaf[1] */
  balance: string;
  /** Merkle proof - array of bytes32 hashes */
  proof: string[];
  /** Leaf data: [ss58Address, amountWei] */
  leaf: MerkleLeaf;
}

/**
 * Full proofs.json data structure - keyed by SS58 address
 * Uses the raw format as stored in proofs.json
 */
export interface MigrationProofsData {
  [ss58Address: string]: RawProofEntry;
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
 *
 * The leaf[0] in proofs.json contains an SS58 address which we decode to get
 * the raw 32-byte pubkey for comparison.
 */
export const lookupClaim = (
  proofsData: MigrationProofsData,
  ss58Address: string,
): ClaimData | null => {
  // First, try direct lookup by SS58 key (fast path for matching prefix)
  let entry = proofsData[ss58Address];
  let foundAddress = ss58Address;

  // If direct lookup fails, try lookup by comparing decoded pubkeys
  if (!entry) {
    try {
      // Decode the input address to get its raw 32-byte pubkey
      const inputPubkey = ss58ToPubkey(ss58Address).toLowerCase();

      // Search through all entries to find a matching pubkey
      for (const [storedAddress, storedEntry] of Object.entries(proofsData)) {
        // The leaf[0] contains an SS58 address - decode it to get pubkey
        const leafAddress = storedEntry.leaf[0];
        try {
          const storedPubkey = ss58ToPubkey(leafAddress).toLowerCase();
          if (storedPubkey === inputPubkey) {
            entry = storedEntry;
            foundAddress = storedAddress;
            break;
          }
        } catch {
          // Skip entries with invalid addresses
          continue;
        }
      }
    } catch {
      // Invalid input address format - can't decode
      return null;
    }
  }

  if (!entry) {
    return null;
  }

  // Decode the leaf SS58 address to get the raw 32-byte pubkey for contract calls
  const pubkey = ss58ToPubkey(entry.leaf[0]);
  // Amount is in leaf[1]
  const amount = BigInt(entry.leaf[1]);

  return {
    ss58Address: foundAddress,
    pubkey: pubkey as Hex,
    amount,
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
    // Amount is in leaf[1]
    totalAmount += BigInt(entry.leaf[1]);
  }

  return {
    totalAccounts: addresses.length,
    totalAmount,
  };
};
