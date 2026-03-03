/**
 * Merkle Tree utilities for the TangleMigration claim system
 *
 * This module provides functions for:
 * - Loading and parsing pre-generated Merkle proofs data
 * - Looking up balances and proofs from the merkle-tree.json file (tnt-core)
 * - Converting SS58 addresses to raw 32-byte pubkeys for contract calls
 *
 * The tnt-core merkle-tree.json format is:
 * {
 *   "root": "0x...",
 *   "entries": {
 *     "ss58Address": {
 *       "pubkey": "0x...",
 *       "balance": "123",
 *       "proof": ["0x...", ...],
 *       "leaf": ["0xPubkey", "123"]
 *     }
 *   },
 *   "entriesByPubkey": {
 *     "0xpubkey": { ... , "ss58Address": "tg..." }
 *   }
 * }
 *
 * Legacy proofs.json format is still supported for backwards compatibility.
 */

import { decodeAddress } from '@polkadot/util-crypto';
import type { Hex } from 'viem';

/**
 * Leaf data format from the merkle tree
 * [pubkey (bytes32 hex), amount (wei string)]
 */
export type MerkleLeaf = [string, string];

/**
 * Raw entry format in the legacy proofs.json file
 * Format: { proof: string[], leaf: [ss58Address, amountWei] }
 */
export interface RawProofEntry {
  /** Merkle proof - array of bytes32 hashes */
  proof: string[];
  /** Leaf data: [ss58Address, amountWei] */
  leaf: [string, string];
}

/**
 * Entry format from tnt-core merkle-tree.json
 */
export interface MerkleTreeEntry {
  /** The 32-byte public key as bytes32 hex (for contract calls) */
  pubkey: string;
  /** Balance in wei */
  balance: string;
  /** Merkle proof - array of bytes32 hashes */
  proof: string[];
  /** Leaf data: [pubkey, amountWei] */
  leaf: MerkleLeaf;
  /** Optional SS58 address (present in entriesByPubkey) */
  ss58Address?: string;
}

/**
 * tnt-core merkle-tree.json format
 */
export interface MerkleTreeData {
  root: string;
  totalValue: string;
  entryCount: number;
  entries: Record<string, MerkleTreeEntry>;
  entriesByPubkey?: Record<string, MerkleTreeEntry & { ss58Address: string }>;
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
  leaf: [string, string];
}

/**
 * Full proofs data structure (legacy proofs.json or tnt-core merkle-tree.json)
 */
export type MigrationProofsData =
  | Record<string, RawProofEntry>
  | MerkleTreeData;

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
 * This is the main entry point for loading merkle-tree.json (tnt-core)
 */
const normalizeProofsData = (
  data: MigrationProofsData,
): MigrationProofsData => {
  if (isMerkleTreeData(data)) {
    return data;
  }

  // Handle tnt-core "entries only" export (jq '.entries')
  if (data && typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length > 0) {
      const first = (data as Record<string, unknown>)[keys[0]];
      if (
        typeof first === 'object' &&
        first !== null &&
        'pubkey' in first &&
        'balance' in first &&
        'proof' in first
      ) {
        const entries = data as Record<string, MerkleTreeEntry>;
        const entriesByPubkey: Record<
          string,
          MerkleTreeEntry & { ss58Address: string }
        > = {};
        for (const [ss58, entry] of Object.entries(entries)) {
          if (entry?.pubkey) {
            entriesByPubkey[entry.pubkey.toLowerCase()] = {
              ...entry,
              ss58Address: ss58,
            };
          }
        }
        return {
          root: '',
          totalValue: '',
          entryCount: Object.keys(entries).length,
          entries,
          entriesByPubkey,
        };
      }
    }
  }

  return data;
};

export const loadMerkleTreeData = (json: string): MigrationProofsData => {
  const parsed = parseProofsJson(json);
  return normalizeProofsData(parsed);
};

const isMerkleTreeData = (
  data: MigrationProofsData,
): data is MerkleTreeData => {
  return typeof data === 'object' && data !== null && 'entries' in data;
};

/**
 * Lookup claim data for an SS58 address from the proofs data.
 * Handles different SS58 prefixes by comparing pubkeys (not string addresses).
 *
 * This is important because the merkle-tree.json entries use Tangle SS58 format (prefix 5181,
 * starts with "tg") but users might enter addresses with different prefixes
 * (e.g., generic prefix 42 starts with "5").
 *
 * The legacy proofs.json leaf[0] contains an SS58 address which we decode to get
 * the raw 32-byte pubkey for comparison.
 */
export const lookupClaim = (
  proofsData: MigrationProofsData,
  ss58Address: string,
): ClaimData | null => {
  if (isMerkleTreeData(proofsData)) {
    const pubkeyLower = ss58ToPubkey(ss58Address).toLowerCase();
    const byPubkey = proofsData.entriesByPubkey?.[pubkeyLower];
    if (byPubkey) {
      return {
        ss58Address: byPubkey.ss58Address ?? ss58Address,
        pubkey: byPubkey.pubkey as Hex,
        amount: BigInt(byPubkey.balance),
        merkleProof: byPubkey.proof.map((p) => p as Hex),
      };
    }

    const bySs58 = proofsData.entries?.[ss58Address];
    if (bySs58) {
      return {
        ss58Address,
        pubkey: bySs58.pubkey as Hex,
        amount: BigInt(bySs58.balance),
        merkleProof: bySs58.proof.map((p) => p as Hex),
      };
    }

    return null;
  }

  // Legacy proofs.json format
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
  if (isMerkleTreeData(proofsData)) {
    const totalAmount = proofsData.totalValue
      ? BigInt(proofsData.totalValue)
      : Object.values(proofsData.entries).reduce(
          (sum, entry) => sum + BigInt(entry.balance),
          BigInt(0),
        );
    return {
      totalAccounts:
        proofsData.entryCount || Object.keys(proofsData.entries).length,
      totalAmount,
    };
  }

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
