import { getAddress, isAddress, type Hex } from 'viem';

export type CreditsTreeEntry = {
  amount: string;
  proof: string[];
};

export type CreditsTreeData = {
  epochId: string;
  root: string;
  totalValue: string;
  entryCount: number;
  entries: Record<string, CreditsTreeEntry>;
};

export type CreditsClaimData = {
  account: `0x${string}`;
  epochId: bigint;
  amount: bigint;
  merkleProof: Hex[];
  root: Hex;
};

export const loadCreditsTreeData = (json: string): CreditsTreeData => {
  const parsed = JSON.parse(json) as CreditsTreeData;
  if (!parsed || typeof parsed !== 'object' || typeof parsed.epochId !== 'string') {
    throw new Error('Invalid credits tree data');
  }
  if (!parsed.entries || typeof parsed.entries !== 'object') {
    throw new Error('Invalid credits tree entries');
  }
  return parsed;
};

export const lookupCreditsClaim = (
  data: CreditsTreeData,
  account: string,
): CreditsClaimData | null => {
  if (!account || !isAddress(account)) {
    return null;
  }

  const normalized = getAddress(account);
  const entry = data.entries[normalized.toLowerCase()];
  if (!entry) {
    return null;
  }

  return {
    account: normalized,
    epochId: BigInt(data.epochId),
    amount: BigInt(entry.amount),
    merkleProof: entry.proof.map((proof) => proof as Hex),
    root: data.root as Hex,
  };
};
