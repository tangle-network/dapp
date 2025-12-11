/**
 * Merkle Tree utilities for the TangleMigration claim system
 *
 * This module provides functions for:
 * - Loading and parsing pre-generated Merkle proofs data
 * - Looking up balances and proofs from the proofs.json file
 *
 * The proofs.json file format is:
 * {
 *   "ss58Address": {
 *     "proof": ["0x...", ...],
 *     "leaf": [address, amount]
 *   }
 * }
 */

import type { Hex } from 'viem';

/**
 * Leaf data format from the merkle tree
 * [address, amount]
 */
export type MerkleLeaf = [string, string];

/**
 * Entry in the proofs.json file
 */
export interface ProofEntry {
  /** Merkle proof - array of bytes32 hashes */
  proof: string[];
  /** Leaf data: [ss58Address, amountWei] */
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
  /** The SS58 Substrate address */
  ss58Address: string;
  /** The claimable amount in wei */
  amount: bigint;
  /** Merkle proof as Hex array */
  merkleProof: Hex[];
}

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
 * Lookup claim data for an SS58 address from the proofs data
 */
export const lookupClaim = (
  proofsData: MigrationProofsData,
  ss58Address: string,
): ClaimData | null => {
  const entry = proofsData[ss58Address];

  if (!entry) {
    return null;
  }

  const [address, amountStr] = entry.leaf;

  return {
    ss58Address: address,
    amount: BigInt(amountStr),
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
    const [, amountStr] = entry.leaf;
    totalAmount += BigInt(amountStr);
  }

  return {
    totalAccounts: addresses.length,
    totalAmount,
  };
};
