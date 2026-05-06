import type { Address, Hex } from 'viem';
import { isAddress, isHex } from 'viem';
import type {
  BlueprintIframeConfig,
  IframeContractGrant,
  IframeMessageGrant,
} from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const readBool = (value: unknown): boolean =>
  typeof value === 'boolean' ? value : false;

const readChainId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
};

const readSelector = (value: unknown): Hex | null => {
  const s = readString(value)?.toLowerCase();
  if (!s) return null;
  if (!isHex(s)) return null;
  // 0x + 8 hex chars = 4-byte selector
  return s.length === 10 ? (s as Hex) : null;
};

const parseContracts = (value: unknown): IframeContractGrant[] => {
  if (!Array.isArray(value)) return [];

  const grants: IframeContractGrant[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const chainId = readChainId(entry.chainId);
    const addressRaw = readString(entry.address);
    if (!chainId || !addressRaw || !isAddress(addressRaw)) continue;

    const grant: IframeContractGrant = {
      chainId,
      address: addressRaw as Address,
    };

    if (Array.isArray(entry.selectors)) {
      const selectors = entry.selectors
        .map(readSelector)
        .filter((s): s is Hex => s !== null);
      if (selectors.length > 0) grant.selectors = selectors;
    }

    grants.push(grant);
  }
  return grants;
};

const parseMessages = (value: unknown): IframeMessageGrant[] => {
  if (!Array.isArray(value)) return [];

  const grants: IframeMessageGrant[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const chainId = readChainId(entry.chainId);
    if (!chainId) continue;

    const grant: IframeMessageGrant = { chainId };
    if (Array.isArray(entry.prefixes)) {
      const prefixes = entry.prefixes
        .map(readString)
        .filter((p): p is string => p !== null && p.length <= 256);
      if (prefixes.length > 0) grant.prefixes = prefixes;
    }
    grants.push(grant);
  }
  return grants;
};

// Parses the iframe-specific safety policy out of a blueprint manifest's
// externalApp record. Caller has already verified policy gating (eligible
// publisher, allowed host, etc.) — this only extracts what the manifest
// declares the iframe is allowed to ask the wallet to do.
export function parseIframePolicy(
  externalAppRecord: Record<string, unknown>,
): BlueprintIframeConfig | undefined {
  const url = readString(externalAppRecord.url);
  if (!url) return undefined;

  let origin: string;
  try {
    origin = new URL(url).origin;
  } catch {
    return undefined;
  }

  const iframeRecord = isRecord(externalAppRecord.iframe)
    ? (externalAppRecord.iframe as Record<string, unknown>)
    : {};

  const appId =
    readString(iframeRecord.appId) ??
    readString(externalAppRecord.label) ??
    origin;

  const allowedChainIds = Array.isArray(iframeRecord.allowedChainIds)
    ? (iframeRecord.allowedChainIds
        .map(readChainId)
        .filter((c): c is number => c !== null) as number[])
    : [];

  const contracts = parseContracts(iframeRecord.contracts);
  const messages = parseMessages(iframeRecord.messages);

  // Apps that don't declare any signing surface can still render — they just
  // can't ask for txs. We require either an allowedChainIds list OR contract
  // grants to consider the iframe "operationally meaningful," but rendering
  // works even with neither.
  return {
    url,
    origin,
    appId,
    allowedChainIds,
    contracts,
    messages,
    allowReadAccount: readBool(iframeRecord.allowReadAccount),
    allowChainSwitch: readBool(iframeRecord.allowChainSwitch),
    allowPopups: readBool(iframeRecord.allowPopups),
  };
}
