import {
  concatHex,
  encodeAbiParameters,
  getAddress,
  isAddress,
  keccak256,
  type Hex,
} from 'viem';

export type CreditsTreeEntry = {
  amount: string;
  proof: string[];
};

export type CreditsTreeData = {
  epochId: string;
  root: string;
  totalValue: string;
  entryCount: number;
  startTs?: string;
  endTs?: string;
  epochSeconds?: string;
  tntToken?: string;
  creditsPerTnt?: string;
  entries: Record<string, CreditsTreeEntry>;
};

export type CreditsClaimData = {
  account: `0x${string}`;
  epochId: bigint;
  amount: bigint;
  merkleProof: Hex[];
  root: Hex;
};

export type CreditsWindow = {
  startTs: bigint;
  endTs: bigint;
  epochSeconds: bigint;
  tntToken?: `0x${string}`;
  creditsPerTnt?: bigint;
};

const assertOptionalString = (value: unknown, label: string) => {
  if (value === undefined || value === null) {
    return;
  }
  if (typeof value !== 'string') {
    throw new Error(`Invalid credits tree ${label}`);
  }
};

export const loadCreditsTreeData = (json: string): CreditsTreeData => {
  const parsed = JSON.parse(json) as CreditsTreeData;
  if (!parsed || typeof parsed !== 'object' || typeof parsed.epochId !== 'string') {
    throw new Error('Invalid credits tree data');
  }
  if (!parsed.entries || typeof parsed.entries !== 'object') {
    throw new Error('Invalid credits tree entries');
  }
  assertOptionalString(parsed.startTs, 'startTs');
  assertOptionalString(parsed.endTs, 'endTs');
  assertOptionalString(parsed.epochSeconds, 'epochSeconds');
  assertOptionalString(parsed.tntToken, 'tntToken');
  assertOptionalString(parsed.creditsPerTnt, 'creditsPerTnt');
  return parsed;
};

export const getCreditsWindow = (data: CreditsTreeData): CreditsWindow | null => {
  if (!data.startTs || !data.endTs || !data.epochSeconds) {
    return null;
  }

  const startTs = BigInt(data.startTs);
  const endTs = BigInt(data.endTs);
  const epochSeconds = BigInt(data.epochSeconds);
  const tntToken = data.tntToken ? (data.tntToken as `0x${string}`) : undefined;
  const creditsPerTnt = data.creditsPerTnt
    ? BigInt(data.creditsPerTnt)
    : undefined;

  return {
    startTs,
    endTs,
    epochSeconds,
    tntToken,
    creditsPerTnt,
  };
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

export const buildCreditsLeaf = (
  epochId: bigint,
  account: `0x${string}`,
  amount: bigint,
): Hex => {
  const encoded = encodeAbiParameters(
    [
      { type: 'uint256' },
      { type: 'address' },
      { type: 'uint256' },
    ],
    [epochId, account, amount],
  );
  return keccak256(concatHex([keccak256(encoded)]));
};

export const verifyCreditsProof = (
  root: Hex,
  leaf: Hex,
  proof: Hex[],
): boolean => {
  let computed = leaf;
  for (const proofElement of proof) {
    const left = BigInt(computed);
    const right = BigInt(proofElement);
    computed =
      left < right
        ? keccak256(concatHex([computed, proofElement]))
        : keccak256(concatHex([proofElement, computed]));
  }
  return computed.toLowerCase() === root.toLowerCase();
};

export const verifyCreditsClaim = (
  root: Hex,
  claim: CreditsClaimData,
): boolean => {
  const leaf = buildCreditsLeaf(claim.epochId, claim.account, claim.amount);
  return verifyCreditsProof(root, leaf, claim.merkleProof);
};
