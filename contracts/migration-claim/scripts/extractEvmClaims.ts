#!/usr/bin/env ts-node
/**
 * Extract EVM claims from Tangle snapshot for direct minting
 *
 * These are unclaimed airdrop allocations to EVM addresses that should be
 * minted directly to the addresses rather than going through the claim process.
 *
 * Usage:
 *   npx ts-node scripts/extractEvmClaims.ts --input snapshot.json --output evm-claims.json
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { formatUnits } from 'viem';

interface EvmClaim {
  address: { evm: string };
  amount: string;
  vesting: null | unknown;
}

interface TangleSnapshot {
  metadata?: {
    chainName?: string;
    blockNumber?: number;
  };
  claims?: {
    total: string;
    claims: EvmClaim[];
  };
}

interface EvmClaimsOutput {
  metadata: {
    source: string;
    blockNumber?: number;
    extractedAt: string;
  };
  totalAmount: string;
  totalAccounts: number;
  claims: Array<{
    address: string;
    amount: string;
  }>;
}

function main() {
  const args = process.argv.slice(2);

  const inputIndex = args.indexOf('--input');
  const outputIndex = args.indexOf('--output');

  if (inputIndex === -1) {
    console.error('Usage: npx ts-node extractEvmClaims.ts --input <snapshot.json> [--output <evm-claims.json>]');
    process.exit(1);
  }

  const inputPath = args[inputIndex + 1];
  const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : 'evm-claims.json';

  if (!existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  console.log(`Reading snapshot from: ${inputPath}`);
  const data: TangleSnapshot = JSON.parse(readFileSync(inputPath, 'utf-8'));

  if (!data.claims || !data.claims.claims) {
    console.error('No claims section found in snapshot');
    process.exit(1);
  }

  const evmClaims = data.claims.claims;
  console.log(`Found ${evmClaims.length} EVM claims`);

  // Filter out zero amounts and normalize
  const validClaims = evmClaims
    .filter(c => BigInt(c.amount) > BigInt(0))
    .map(c => ({
      address: c.address.evm.toLowerCase(),
      amount: c.amount,
    }));

  console.log(`Valid claims (non-zero): ${validClaims.length}`);

  // Calculate total
  const totalAmount = validClaims.reduce(
    (sum, c) => sum + BigInt(c.amount),
    BigInt(0)
  );

  console.log(`Total amount: ${formatUnits(totalAmount, 18)} TNT`);

  // Build output
  const output: EvmClaimsOutput = {
    metadata: {
      source: inputPath,
      blockNumber: data.metadata?.blockNumber,
      extractedAt: new Date().toISOString(),
    },
    totalAmount: totalAmount.toString(),
    totalAccounts: validClaims.length,
    claims: validClaims,
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nEVM claims written to: ${outputPath}`);

  // Output summary for deployment
  console.log('\n=== Summary ===');
  console.log(`Total EVM claims: ${validClaims.length}`);
  console.log(`Total amount: ${formatUnits(totalAmount, 18)} TNT`);
  console.log(`Total amount (wei): ${totalAmount.toString()}`);
}

main();
