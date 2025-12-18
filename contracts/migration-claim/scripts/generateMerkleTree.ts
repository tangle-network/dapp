#!/usr/bin/env ts-node
/**
 * Generate Merkle Tree for Migration Claims
 *
 * This script takes a snapshot JSON file and generates:
 * 1. A Merkle tree with all claims
 * 2. A JSON file with the tree data (root, proofs for each entry)
 * 3. The Merkle root for contract deployment
 *
 * Usage:
 *   npx ts-node scripts/generateMerkleTree.ts --input snapshot.json --output merkle-tree.json
 *
 * Or with test data:
 *   npx ts-node scripts/generateMerkleTree.ts --test
 */

import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { formatUnits, parseUnits } from 'viem';
import { decodeAddress } from '@polkadot/util-crypto';

/**
 * Snapshot entry format - flexible to accept various input formats
 * The script will normalize these to the required format
 */
interface SnapshotEntry {
  /** SS58 address (can be named 'address' or 'substrateAddress') */
  substrateAddress?: string;
  address?: string;
  /** Public key in hex (optional - will be derived from SS58 if not provided) */
  publicKey?: string;
  pubkey?: string;
  /** Balance - can be raw wei string or formatted with decimals */
  balance?: string;
  amount?: string;
  /** Free balance (from Tangle snapshot format) */
  free?: string;
}

/**
 * Tangle snapshot format with metadata
 */
interface TangleSnapshot {
  metadata?: {
    chainName?: string;
    blockNumber?: number;
    blockHash?: string;
    timestamp?: string;
  };
  accounts: SnapshotEntry[];
}

/**
 * Convert SS58 address to hex pubkey
 */
function ss58ToHex(ss58Address: string): string {
  const pubkeyBytes = decodeAddress(ss58Address);
  const hex = Array.from(pubkeyBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `0x${hex}`;
}

/**
 * Normalize snapshot entry to consistent format
 */
function normalizeEntry(entry: SnapshotEntry): {
  ss58Address: string;
  publicKey: string;
  balance: string;
} {
  // Get SS58 address
  const ss58Address = entry.substrateAddress || entry.address;
  if (!ss58Address) {
    throw new Error('Entry missing address (substrateAddress or address field)');
  }

  // Get or derive public key
  let publicKey = entry.publicKey || entry.pubkey;
  if (!publicKey) {
    // Derive from SS58 address
    publicKey = ss58ToHex(ss58Address);
  }

  // Normalize public key format
  if (!publicKey.startsWith('0x')) {
    publicKey = `0x${publicKey}`;
  }

  // Get balance (support multiple field names)
  const balance = entry.balance || entry.amount || entry.free;
  if (!balance) {
    throw new Error(`Entry missing balance for ${ss58Address}`);
  }

  return { ss58Address, publicKey, balance };
}

interface MerkleTreeEntry {
  /** Merkle proof */
  proof: string[];
  /** Leaf data: [ss58Address, balance] - SS58 for frontend lookup */
  leaf: [string, string];
}

interface MerkleTreeOutput {
  root: string;
  totalValue: string;
  entryCount: number;
  /** Entries keyed by SS58 address for easy lookup */
  entries: Record<string, MerkleTreeEntry>;
}

// Test accounts for local development
// These are dummy SR25519 public keys
const TEST_CLAIMS: SnapshotEntry[] = [
  {
    substrateAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    publicKey:
      '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
    balance: parseUnits('1000000', 18).toString(), // 1M TNT
  },
  {
    substrateAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    publicKey:
      '0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48',
    balance: parseUnits('500000', 18).toString(), // 500K TNT
  },
  {
    substrateAddress: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
    publicKey:
      '0x90b5ab205c6974c9ea841be688864633dc9ca8a357843eeacf2314649965fe22',
    balance: parseUnits('250000', 18).toString(), // 250K TNT
  },
  {
    substrateAddress: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
    publicKey:
      '0x306721211d5404bd9da88e0204360a1a9ab8b87c66c1bc2fcdd37f3c2222cc20',
    balance: parseUnits('100000', 18).toString(), // 100K TNT
  },
  {
    substrateAddress: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw',
    publicKey:
      '0xe659a7a1628cdd93febc04a4e0646ea20e9f5f0ce097d9a05290d4a9e054df4e',
    balance: parseUnits('50000', 18).toString(), // 50K TNT
  },
];

function generateMerkleTree(entries: SnapshotEntry[]): MerkleTreeOutput {
  console.log(`Generating Merkle tree for ${entries.length} entries...`);

  // Normalize all entries
  const normalized = entries.map(normalizeEntry);

  // Prepare values for the tree
  // Format: [publicKey (bytes32), balance (uint256)]
  const values = normalized.map((entry) => {
    return [entry.publicKey, entry.balance] as [string, string];
  });

  // Create the tree with bytes32 pubkey format (matches contract)
  const tree = StandardMerkleTree.of(values, ['bytes32', 'uint256']);

  console.log('Merkle Root:', tree.root);

  // Calculate total value
  const totalValue = normalized.reduce(
    (sum, e) => sum + BigInt(e.balance),
    BigInt(0),
  );
  console.log('Total Value:', formatUnits(totalValue, 18), 'TNT');

  // Build the output with proofs for each entry, indexed by SS58 address
  const outputEntries: MerkleTreeOutput['entries'] = {};

  // Create a map from pubkey to SS58 address for reverse lookup
  const pubkeyToSs58 = new Map<string, string>();
  for (const entry of normalized) {
    pubkeyToSs58.set(entry.publicKey.toLowerCase(), entry.ss58Address);
  }

  for (const [index, [publicKey, balance]] of tree.entries()) {
    const proof = tree.getProof(index);
    const normalizedPubkey = publicKey.toLowerCase();
    const ss58Address = pubkeyToSs58.get(normalizedPubkey);

    if (!ss58Address) {
      throw new Error(`No SS58 address found for pubkey: ${normalizedPubkey}`);
    }

    // Store SS58 address in leaf[0] for frontend compatibility
    // The frontend will convert SS58 -> pubkey when calling the contract
    outputEntries[ss58Address] = {
      proof: proof as string[],
      leaf: [ss58Address, balance],
    };
  }

  return {
    root: tree.root,
    totalValue: totalValue.toString(),
    entryCount: entries.length,
    entries: outputEntries,
  };
}

function main() {
  const args = process.argv.slice(2);

  let entries: SnapshotEntry[];
  let outputPath = 'merkle-tree.json';

  // Check for test mode
  if (args.includes('--test')) {
    console.log('Using test claims data...');
    entries = TEST_CLAIMS;
    outputPath = 'merkle-tree-test.json';
  } else {
    // Parse command line arguments
    const inputIndex = args.indexOf('--input');
    const outputIndex = args.indexOf('--output');

    if (inputIndex === -1) {
      console.error(
        'Usage: npx ts-node generateMerkleTree.ts --input <snapshot.json> [--output <output.json>]',
      );
      console.error('       npx ts-node generateMerkleTree.ts --test');
      process.exit(1);
    }

    const inputPath = args[inputIndex + 1];
    if (outputIndex !== -1) {
      outputPath = args[outputIndex + 1];
    }

    if (!existsSync(inputPath)) {
      console.error(`Input file not found: ${inputPath}`);
      process.exit(1);
    }

    console.log(`Reading snapshot from: ${inputPath}`);
    const inputData = readFileSync(inputPath, 'utf-8');
    const parsed = JSON.parse(inputData);

    // Handle Tangle snapshot format with nested accounts array
    if (parsed.accounts && Array.isArray(parsed.accounts)) {
      console.log('Detected Tangle snapshot format');
      if (parsed.metadata) {
        console.log(`  Chain: ${parsed.metadata.chainName || 'Unknown'}`);
        console.log(`  Block: ${parsed.metadata.blockNumber || 'Unknown'}`);
      }
      entries = parsed.accounts;
    } else if (Array.isArray(parsed)) {
      // Direct array of entries
      entries = parsed;
    } else {
      console.error('Invalid snapshot format: expected array or { accounts: [...] }');
      process.exit(1);
    }

    // Filter out zero-balance accounts
    const originalCount = entries.length;
    entries = entries.filter((e) => {
      const balance = e.balance || e.amount || e.free;
      return balance && BigInt(balance) > BigInt(0);
    });
    console.log(`Filtered ${originalCount - entries.length} zero-balance accounts`);
    console.log(`Processing ${entries.length} accounts with balance`);
  }

  // Generate the tree
  const result = generateMerkleTree(entries);

  // Write output
  writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\nMerkle tree written to: ${outputPath}`);

  // Output deployment info
  console.log('\n=== Deployment Values ===');
  console.log(`MERKLE_ROOT=${result.root}`);
  console.log(`TOTAL_ALLOCATED=${result.totalValue}`);
  console.log(`ENTRY_COUNT=${result.entryCount}`);
}

main();
