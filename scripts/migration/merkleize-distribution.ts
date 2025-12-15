#!/usr/bin/env tsx
/**
 * Tangle Network Migration - Merkle Tree Distribution Generator
 *
 * This script processes a snapshot and creates:
 * 1. A Merkle tree for Substrate addresses (require ZK proof to claim)
 * 2. A direct airdrop list for EVM addresses (automatic migration)
 *
 * Participation categories (for future bonus multipliers):
 * - Validators: Actively validating
 * - Nominators: Staking via nomination
 * - Operators: Multi-asset delegation operators
 * - Delegators: Multi-asset delegation delegators/restakers
 * - Identity holders: On-chain identity set
 * - Claimers: Unclaimed genesis allocations
 */

import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { decodeAddress } from "@polkadot/util-crypto";
import { readFileSync, writeFileSync, mkdirSync } from "fs";

// Configuration
const SNAPSHOT_FILE = process.argv[2] || "tangle_migration_snapshot_8116528.json";
const OUTPUT_DIR = "./migration_output";

// Bonus multipliers (stubbed at 1x for now, can be updated based on points leaderboard)
const MULTIPLIERS = {
  base: 1.0,           // Everyone gets base multiplier
  validator: 1.0,      // Additional for validators
  nominator: 1.0,      // Additional for nominators
  operator: 1.0,       // Additional for operators
  delegator: 1.0,      // Additional for delegators/restakers
  identity: 1.0,       // Additional for identity holders
  claimer: 1.0,        // Additional for unclaimed balances
  lstMember: 1.0,      // Additional for LST pool members
};

interface ParticipationFlags {
  isValidator: boolean;
  isNominator: boolean;
  isOperator: boolean;
  isDelegator: boolean;
  hasIdentity: boolean;
  hasClaim: boolean;
  isLstMember: boolean;
}

interface AccountMigration {
  originalAddress: string;
  addressType: "substrate" | "evm";
  freeBalance: bigint;
  reservedBalance: bigint;
  stakedBalance: bigint;
  delegatedBalance: bigint;
  unclaimedBalance: bigint;
  vestingLocked: bigint;
  totalEffectiveBalance: bigint;
  participation: ParticipationFlags;
  multiplier: number;
  finalAmount: bigint;
}

interface MigrationOutput {
  metadata: {
    snapshotBlock: number;
    snapshotHash: string;
    generatedAt: string;
    totalAccounts: number;
    totalSubstrateAccounts: number;
    totalEvmAccounts: number;
    totalDistribution: string;
    merkleRoot: string;
  };
  // Substrate accounts - need ZK proof to claim, included in Merkle tree
  substrateAccounts: AccountMigration[];
  // EVM accounts - direct airdrop, NOT in Merkle tree
  evmAirdrop: AccountMigration[];
  merkleTree: {
    root: string;
    format: string;
    leafEncoding: string[];
    totalLeaves: number;
    description: string;
  };
}

interface ClaimAddress {
  evm?: string;
  [key: string]: string | undefined;
}

function parseClaimAddress(address: string | ClaimAddress): { address: string; type: "substrate" | "evm" } {
  // Handle object format from claims pallet
  if (typeof address === "object" && address !== null) {
    if (address.evm) {
      return { address: address.evm, type: "evm" };
    }
    // Check for other keys - treat non-EVM as substrate
    for (const [key, value] of Object.entries(address)) {
      if (value && typeof value === "string") {
        // If it's an EVM-looking address, treat as EVM
        if (value.startsWith("0x") && value.length === 42) {
          return { address: value, type: "evm" };
        }
        // Otherwise treat as substrate
        return { address: value, type: "substrate" };
      }
    }
    return { address: JSON.stringify(address), type: "substrate" };
  }

  // Handle string format
  return { address: address as string, type: detectAddressType(address as string) };
}

function detectAddressType(address: string): "substrate" | "evm" {
  if (!address || typeof address !== "string") return "substrate";

  // EVM addresses start with 0x and are 42 chars (including 0x)
  if (address.startsWith("0x") && address.length === 42) {
    return "evm";
  }

  // Everything else is treated as substrate
  return "substrate";
}

function calculateMultiplier(participation: ParticipationFlags): number {
  let multiplier = MULTIPLIERS.base;

  if (participation.isValidator) multiplier *= MULTIPLIERS.validator;
  if (participation.isNominator) multiplier *= MULTIPLIERS.nominator;
  if (participation.isOperator) multiplier *= MULTIPLIERS.operator;
  if (participation.isDelegator) multiplier *= MULTIPLIERS.delegator;
  if (participation.hasIdentity) multiplier *= MULTIPLIERS.identity;
  if (participation.hasClaim) multiplier *= MULTIPLIERS.claimer;
  if (participation.isLstMember) multiplier *= MULTIPLIERS.lstMember;

  return multiplier;
}

function parseBigInt(value: string | number | undefined | null): bigint {
  if (!value) return 0n;
  if (typeof value === "number") return BigInt(Math.floor(value));
  if (value.startsWith("0x")) {
    return BigInt(value);
  }
  return BigInt(value.replace(/[^0-9-]/g, "") || "0");
}

async function main() {
  console.log("═".repeat(60));
  console.log("  TANGLE MIGRATION - MERKLE DISTRIBUTION GENERATOR");
  console.log("═".repeat(60) + "\n");

  // Load snapshot
  console.log(`Loading snapshot from ${SNAPSHOT_FILE}...`);
  const snapshot = JSON.parse(readFileSync(SNAPSHOT_FILE, "utf-8"));
  console.log(`  Block: #${snapshot.metadata.blockNumber}`);
  console.log(`  Hash: ${snapshot.metadata.blockHash}\n`);

  // Build lookup sets for participation tracking
  console.log("Building participation lookups...");

  const validatorSet = new Set<string>(snapshot.staking?.validators || []);
  console.log(`  Validators: ${validatorSet.size}`);

  const nominatorSet = new Set<string>(
    (snapshot.staking?.nominators || []).map((n: { address: string }) => n.address)
  );
  console.log(`  Nominators: ${nominatorSet.size}`);

  const operatorSet = new Set<string>(
    (snapshot.multiAssetDelegation?.operators || []).map((o: { address: string }) => o.address)
  );
  console.log(`  Operators: ${operatorSet.size}`);

  const delegatorSet = new Set<string>(
    (snapshot.multiAssetDelegation?.delegators || []).map((d: { address: string }) => d.address)
  );
  console.log(`  Delegators: ${delegatorSet.size}`);

  const identitySet = new Set<string>(
    (snapshot.identities || []).map((i: { address: string }) => i.address)
  );
  console.log(`  Identities: ${identitySet.size}`);

  const lstMemberSet = new Set<string>(
    (snapshot.lstPools?.poolMembers || []).map((m: { address: string }) => m.address)
  );
  console.log(`  LST Members: ${lstMemberSet.size}`);

  // Build staking ledger lookup
  const stakingLedger = new Map<string, bigint>();
  for (const ledger of snapshot.staking?.ledgers || []) {
    const staked = parseBigInt(ledger.active);
    if (staked > 0n) {
      stakingLedger.set(ledger.stash, staked);
    }
  }
  console.log(`  Staking ledgers: ${stakingLedger.size}`);

  // Build delegator deposits lookup
  const delegatorDeposits = new Map<string, bigint>();
  for (const delegator of snapshot.multiAssetDelegation?.delegators || []) {
    const metadata = delegator.metadata;
    let totalDeposited = 0n;
    if (metadata?.deposits) {
      for (const [, deposit] of Object.entries(metadata.deposits)) {
        const dep = deposit as { amount?: string };
        totalDeposited += parseBigInt(dep.amount);
      }
    }
    if (totalDeposited > 0n) {
      delegatorDeposits.set(delegator.address, totalDeposited);
    }
  }
  console.log(`  Delegator deposits: ${delegatorDeposits.size}`);

  // Build vesting lookup
  const vestingLocked = new Map<string, bigint>();
  for (const v of snapshot.vesting || []) {
    let totalLocked = 0n;
    for (const schedule of v.schedules || []) {
      totalLocked += parseBigInt(schedule.locked);
    }
    if (totalLocked > 0n) {
      vestingLocked.set(v.address, totalLocked);
    }
  }
  console.log(`  Vesting accounts: ${vestingLocked.size}`);

  // Process all accounts
  console.log("\nProcessing accounts...");

  const substrateAccounts: AccountMigration[] = [];
  const evmAccounts: AccountMigration[] = [];

  // 1. Process on-chain accounts
  for (const account of snapshot.accounts || []) {
    const address = account.address;
    const addressType = detectAddressType(address);

    const participation: ParticipationFlags = {
      isValidator: validatorSet.has(address),
      isNominator: nominatorSet.has(address),
      isOperator: operatorSet.has(address),
      isDelegator: delegatorSet.has(address),
      hasIdentity: identitySet.has(address),
      hasClaim: false,
      isLstMember: lstMemberSet.has(address),
    };

    const freeBalance = parseBigInt(account.free);
    const reservedBalance = parseBigInt(account.reserved);
    const stakedBalance = stakingLedger.get(address) || 0n;
    const delegatedBalance = delegatorDeposits.get(address) || 0n;
    const vesting = vestingLocked.get(address) || 0n;
    const totalEffectiveBalance = freeBalance + reservedBalance;

    if (totalEffectiveBalance === 0n) continue;

    const multiplier = calculateMultiplier(participation);
    const finalAmount = BigInt(Math.floor(Number(totalEffectiveBalance) * multiplier));

    const migration: AccountMigration = {
      originalAddress: address,
      addressType,
      freeBalance,
      reservedBalance,
      stakedBalance,
      delegatedBalance,
      unclaimedBalance: 0n,
      vestingLocked: vesting,
      totalEffectiveBalance,
      participation,
      multiplier,
      finalAmount,
    };

    if (addressType === "evm") {
      evmAccounts.push(migration);
    } else {
      substrateAccounts.push(migration);
    }
  }
  console.log(`  On-chain accounts: ${substrateAccounts.length} substrate, ${evmAccounts.length} EVM`);

  // 2. Process unclaimed balances (claims pallet)
  let claimsSubstrate = 0;
  let claimsEvm = 0;

  for (const claim of snapshot.claims?.claims || []) {
    const { address, type: addressType } = parseClaimAddress(claim.address);
    const unclaimedBalance = parseBigInt(claim.amount);

    if (unclaimedBalance === 0n) continue;

    const participation: ParticipationFlags = {
      isValidator: false,
      isNominator: false,
      isOperator: false,
      isDelegator: false,
      hasIdentity: false,
      hasClaim: true,
      isLstMember: false,
    };

    const multiplier = calculateMultiplier(participation);
    const finalAmount = BigInt(Math.floor(Number(unclaimedBalance) * multiplier));

    const migration: AccountMigration = {
      originalAddress: address,
      addressType,
      freeBalance: 0n,
      reservedBalance: 0n,
      stakedBalance: 0n,
      delegatedBalance: 0n,
      unclaimedBalance,
      vestingLocked: 0n,
      totalEffectiveBalance: unclaimedBalance,
      participation,
      multiplier,
      finalAmount,
    };

    if (addressType === "evm") {
      evmAccounts.push(migration);
      claimsEvm++;
    } else {
      substrateAccounts.push(migration);
      claimsSubstrate++;
    }
  }
  console.log(`  Claims: ${claimsSubstrate} substrate, ${claimsEvm} EVM`);

  // Calculate totals
  const totalSubstrate = substrateAccounts.reduce((sum, a) => sum + a.finalAmount, 0n);
  const totalEvm = evmAccounts.reduce((sum, a) => sum + a.finalAmount, 0n);
  const totalDistribution = totalSubstrate + totalEvm;

  console.log(`\n  Total Substrate: ${formatBalance(totalSubstrate)} TNT (${substrateAccounts.length} accounts)`);
  console.log(`  Total EVM:       ${formatBalance(totalEvm)} TNT (${evmAccounts.length} accounts)`);
  console.log(`  Total:           ${formatBalance(totalDistribution)} TNT`);

  // Build Merkle tree - ONLY for Substrate accounts
  // EVM accounts get direct airdrop, no merkle proof needed
  // Leaf format: [substratePubkey(bytes32), amount]
  // (The on-chain claim contract verifies against the decoded 32-byte pubkey.)
  console.log("\nBuilding Merkle tree (Substrate accounts only)...");

  const leafMeta = substrateAccounts
    .filter((a) => a.finalAmount > 0n)
    .map((account) => {
      const pubkeyBytes = decodeAddress(account.originalAddress);
      const pubkeyHex = `0x${Buffer.from(pubkeyBytes).toString("hex")}`;
      return {
        ss58Address: account.originalAddress,
        pubkey: pubkeyHex,
        amount: account.finalAmount.toString(),
      };
    });

  console.log(`  Leaves in tree: ${leafMeta.length}`);

  const tree = StandardMerkleTree.of(
    leafMeta.map((l) => [l.pubkey, l.amount]),
    ["bytes32", "uint256"],
  );
  console.log(`  Merkle root: ${tree.root}`);

  // Generate proofs for substrate accounts only
  console.log("\nGenerating proofs for Substrate accounts...");
  const proofs: Record<string, { proof: string[]; leaf: [string, string] }> = {};

  for (const [i] of tree.entries()) {
    const meta = leafMeta[i];
    proofs[meta.ss58Address] = {
      proof: tree.getProof(i),
      // Keep the legacy UI format for the frontend:
      // leaf[0] is an SS58 address which we decode into pubkey for contract calls.
      leaf: [meta.ss58Address, meta.amount],
    };
  }

  // Prepare output
  const output: MigrationOutput = {
    metadata: {
      snapshotBlock: snapshot.metadata.blockNumber,
      snapshotHash: snapshot.metadata.blockHash,
      generatedAt: new Date().toISOString(),
      totalAccounts: substrateAccounts.length + evmAccounts.length,
      totalSubstrateAccounts: substrateAccounts.length,
      totalEvmAccounts: evmAccounts.length,
      totalDistribution: totalDistribution.toString(),
      merkleRoot: tree.root,
    },
    substrateAccounts: serializeAccounts(substrateAccounts),
    evmAirdrop: serializeAccounts(evmAccounts),
    merkleTree: {
      root: tree.root,
      format: "StandardMerkleTree",
      leafEncoding: ["bytes32", "uint256"],
      totalLeaves: leafMeta.length,
      description:
        "Leaf format: [substratePubkey(bytes32), amount]. EVM addresses are in evmAirdrop for direct migration.",
    },
  };

  // Write outputs
  console.log("\nWriting output files...");
  try {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  } catch {
    // Directory exists
  }

  // Main distribution file
  writeFileSync(
    `${OUTPUT_DIR}/distribution.json`,
    JSON.stringify(output, bigintReplacer, 2)
  );
  console.log(`  ${OUTPUT_DIR}/distribution.json`);

  // Proofs file (Substrate only)
  writeFileSync(
    `${OUTPUT_DIR}/proofs.json`,
    JSON.stringify(proofs, null, 2)
  );
  console.log(`  ${OUTPUT_DIR}/proofs.json`);

  // Merkle tree dump
  writeFileSync(
    `${OUTPUT_DIR}/merkle-tree.json`,
    JSON.stringify(tree.dump(), null, 2)
  );
  console.log(`  ${OUTPUT_DIR}/merkle-tree.json`);

  // EVM airdrop list (simple address -> amount mapping for direct migration)
  const evmAirdropSimple = evmAccounts.reduce((acc, a) => {
    acc[a.originalAddress] = a.finalAmount.toString();
    return acc;
  }, {} as Record<string, string>);

  writeFileSync(
    `${OUTPUT_DIR}/evm-airdrop.json`,
    JSON.stringify(evmAirdropSimple, null, 2)
  );
  console.log(`  ${OUTPUT_DIR}/evm-airdrop.json`);

  // Summary CSV
  const allAccounts = [...substrateAccounts, ...evmAccounts];
  const csvLines = [
    "address,type,free,reserved,staked,delegated,unclaimed,total,multiplier,final,participation",
    ...allAccounts.map(a => [
      a.originalAddress,
      a.addressType,
      a.freeBalance.toString(),
      a.reservedBalance.toString(),
      a.stakedBalance.toString(),
      a.delegatedBalance.toString(),
      a.unclaimedBalance.toString(),
      a.totalEffectiveBalance.toString(),
      a.multiplier.toFixed(2),
      a.finalAmount.toString(),
      participationToString(a.participation),
    ].join(","))
  ];
  writeFileSync(`${OUTPUT_DIR}/distribution.csv`, csvLines.join("\n"));
  console.log(`  ${OUTPUT_DIR}/distribution.csv`);

  // Participation summary
  const participationSummary = {
    validators: substrateAccounts.filter(a => a.participation.isValidator).length,
    nominators: substrateAccounts.filter(a => a.participation.isNominator).length,
    operators: substrateAccounts.filter(a => a.participation.isOperator).length,
    delegators: substrateAccounts.filter(a => a.participation.isDelegator).length,
    identityHolders: substrateAccounts.filter(a => a.participation.hasIdentity).length,
    lstMembers: substrateAccounts.filter(a => a.participation.isLstMember).length,
    claimers: substrateAccounts.filter(a => a.participation.hasClaim).length + claimsEvm,
  };

  console.log("\n" + "═".repeat(60));
  console.log("  MIGRATION SUMMARY");
  console.log("═".repeat(60));
  console.log(`
  Merkle Root: ${tree.root}

  ACCOUNTS:
    Substrate (ZK proof claim):  ${substrateAccounts.length.toLocaleString()} -> Merkle tree
    EVM (direct airdrop):        ${evmAccounts.length.toLocaleString()} -> evm-airdrop.json
    Total:                       ${allAccounts.length.toLocaleString()}

  PARTICIPATION (Substrate accounts):
    Validators:    ${participationSummary.validators}
    Nominators:    ${participationSummary.nominators}
    Operators:     ${participationSummary.operators}
    Delegators:    ${participationSummary.delegators}
    Identity:      ${participationSummary.identityHolders}
    LST Members:   ${participationSummary.lstMembers}
    Claimers:      ${participationSummary.claimers}

  DISTRIBUTION:
    Substrate:     ${formatBalance(totalSubstrate)} TNT
    EVM:           ${formatBalance(totalEvm)} TNT
    TOTAL:         ${formatBalance(totalDistribution)} TNT

  OUTPUT FILES:
    ${OUTPUT_DIR}/distribution.json  - Full distribution data
    ${OUTPUT_DIR}/proofs.json        - Merkle proofs (Substrate only)
    ${OUTPUT_DIR}/merkle-tree.json   - Full tree for verification
    ${OUTPUT_DIR}/evm-airdrop.json   - EVM direct airdrop list
    ${OUTPUT_DIR}/distribution.csv   - Summary spreadsheet
`);
}

function formatBalance(wei: bigint): string {
  const tnt = Number(wei) / 1e18;
  return tnt.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function participationToString(p: ParticipationFlags): string {
  const flags: string[] = [];
  if (p.isValidator) flags.push("V");
  if (p.isNominator) flags.push("N");
  if (p.isOperator) flags.push("O");
  if (p.isDelegator) flags.push("D");
  if (p.hasIdentity) flags.push("I");
  if (p.hasClaim) flags.push("C");
  if (p.isLstMember) flags.push("L");
  return flags.join("+") || "-";
}

function serializeAccounts(accounts: AccountMigration[]): AccountMigration[] {
  return accounts.map(a => ({
    ...a,
    freeBalance: a.freeBalance.toString() as unknown as bigint,
    reservedBalance: a.reservedBalance.toString() as unknown as bigint,
    stakedBalance: a.stakedBalance.toString() as unknown as bigint,
    delegatedBalance: a.delegatedBalance.toString() as unknown as bigint,
    unclaimedBalance: a.unclaimedBalance.toString() as unknown as bigint,
    vestingLocked: a.vestingLocked.toString() as unknown as bigint,
    totalEffectiveBalance: a.totalEffectiveBalance.toString() as unknown as bigint,
    finalAmount: a.finalAmount.toString() as unknown as bigint,
  }));
}

function bigintReplacer(_key: string, value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
