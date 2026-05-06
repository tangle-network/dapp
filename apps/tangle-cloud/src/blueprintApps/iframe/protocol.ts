import { isAddress, isHex } from 'viem';
import type { Address, Hex } from 'viem';

// Versioned protocol — bump on any breaking change so old iframes can detect
// drift via the handshake response.
export const IFRAME_PROTOCOL_VERSION = '1' as const;

// Discriminator prefix on every message in either direction. A message
// without `kind` starting with this string is rejected before any parsing,
// so generic wallet-extension postMessage chatter never reaches our handlers.
export const IFRAME_PROTOCOL_PREFIX = 'tangle.app.' as const;

// ─── Iframe → Parent ────────────────────────────────────────────────────

export type IframeRequestHandshake = {
  kind: 'tangle.app.handshake';
  appId: string;
  version: typeof IFRAME_PROTOCOL_VERSION;
};

export type IframeRequestReadAccount = {
  kind: 'tangle.app.readAccount';
  correlationId: string;
};

export type IframeRequestSwitchChain = {
  kind: 'tangle.app.switchChain';
  correlationId: string;
  chainId: number;
};

export type IframeRequestSignMessage = {
  kind: 'tangle.app.signMessage';
  correlationId: string;
  chainId: number;
  message: string;
};

export type IframeRequestSignTransaction = {
  kind: 'tangle.app.signTransaction';
  correlationId: string;
  chainId: number;
  to: Address;
  data: Hex;
  value?: string;
};

export type IframeRequest =
  | IframeRequestHandshake
  | IframeRequestReadAccount
  | IframeRequestSwitchChain
  | IframeRequestSignMessage
  | IframeRequestSignTransaction;

// ─── Parent → Iframe ───────────────────────────────────────────────────

export type ParentResponseHandshakeAck = {
  kind: 'tangle.app.handshakeAck';
  appId: string;
  protocolVersion: typeof IFRAME_PROTOCOL_VERSION;
};

export type ParentResponseResultBase<T> = {
  correlationId: string;
} & ({ ok: true; data: T } | { ok: false; error: string });

export type ParentResponseReadAccountResult = {
  kind: 'tangle.app.readAccountResult';
} & ParentResponseResultBase<{ account: Address; chainId: number }>;

export type ParentResponseSwitchChainResult = {
  kind: 'tangle.app.switchChainResult';
} & ParentResponseResultBase<{ chainId: number }>;

export type ParentResponseSignMessageResult = {
  kind: 'tangle.app.signMessageResult';
} & ParentResponseResultBase<{ signature: Hex }>;

export type ParentResponseSignTransactionResult = {
  kind: 'tangle.app.signTransactionResult';
} & ParentResponseResultBase<{ txHash: Hex }>;

// Unsolicited broadcasts from parent to iframe (e.g. user changes account)
export type ParentEventAccountChanged = {
  kind: 'tangle.app.accountChanged';
  account: Address | null;
};

export type ParentEventChainChanged = {
  kind: 'tangle.app.chainChanged';
  chainId: number;
};

export type ParentMessage =
  | ParentResponseHandshakeAck
  | ParentResponseReadAccountResult
  | ParentResponseSwitchChainResult
  | ParentResponseSignMessageResult
  | ParentResponseSignTransactionResult
  | ParentEventAccountChanged
  | ParentEventChainChanged;

// ─── Validation ──────────────────────────────────────────────────────────

const isString = (value: unknown): value is string => typeof value === 'string';
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

// Correlation IDs must be strings of bounded length and ASCII-printable so a
// malicious iframe can't ship a 100MB payload as a "correlation id" to OOM
// the parent's bookkeeping.
const isValidCorrelationId = (value: unknown): value is string =>
  isString(value) &&
  value.length > 0 &&
  value.length <= 128 &&
  /^[\w.\-:]+$/.test(value);

// Bound on signMessage to keep signing modal sane and prevent DoS.
const MAX_MESSAGE_LENGTH = 4_096;

// Bound on calldata. 128KB covers realistic txs without inviting huge blobs.
const MAX_CALLDATA_BYTES = 128 * 1024;

const isHexString = (value: unknown): value is Hex =>
  isString(value) && isHex(value);

// Conservative integer-string validator for value (wei). We use string
// transport rather than bigint to survive structuredClone across some
// older browsers and to avoid surprises when the iframe's JS env doesn't
// share the parent's bigint quirks. Validate before BigInt() so we catch
// negative or non-integer inputs explicitly.
const isValidWeiString = (value: unknown): value is string => {
  if (!isString(value)) return false;
  if (value.length === 0 || value.length > 78) return false;
  if (!/^[0-9]+$/.test(value)) return false;
  return true;
};

export function validateIframeRequest(value: unknown): IframeRequest | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const kind = record.kind;
  if (!isString(kind) || !kind.startsWith(IFRAME_PROTOCOL_PREFIX)) return null;

  switch (kind) {
    case 'tangle.app.handshake': {
      if (!isString(record.appId) || record.appId.length > 128) return null;
      if (record.version !== IFRAME_PROTOCOL_VERSION) return null;
      return {
        kind: 'tangle.app.handshake',
        appId: record.appId,
        version: IFRAME_PROTOCOL_VERSION,
      };
    }
    case 'tangle.app.readAccount': {
      if (!isValidCorrelationId(record.correlationId)) return null;
      return {
        kind: 'tangle.app.readAccount',
        correlationId: record.correlationId,
      };
    }
    case 'tangle.app.switchChain': {
      if (!isValidCorrelationId(record.correlationId)) return null;
      if (!isFiniteNumber(record.chainId) || record.chainId <= 0) return null;
      return {
        kind: 'tangle.app.switchChain',
        correlationId: record.correlationId,
        chainId: record.chainId,
      };
    }
    case 'tangle.app.signMessage': {
      if (!isValidCorrelationId(record.correlationId)) return null;
      if (!isFiniteNumber(record.chainId) || record.chainId <= 0) return null;
      if (!isString(record.message)) return null;
      if (
        record.message.length === 0 ||
        record.message.length > MAX_MESSAGE_LENGTH
      ) {
        return null;
      }
      return {
        kind: 'tangle.app.signMessage',
        correlationId: record.correlationId,
        chainId: record.chainId,
        message: record.message,
      };
    }
    case 'tangle.app.signTransaction': {
      if (!isValidCorrelationId(record.correlationId)) return null;
      if (!isFiniteNumber(record.chainId) || record.chainId <= 0) return null;
      if (!isString(record.to) || !isAddress(record.to)) return null;
      if (!isHexString(record.data)) return null;
      // Hex string is "0x" + 2 chars per byte
      if ((record.data.length - 2) / 2 > MAX_CALLDATA_BYTES) return null;
      let value: string | undefined;
      if (record.value !== undefined) {
        if (!isValidWeiString(record.value)) return null;
        value = record.value;
      }
      return {
        kind: 'tangle.app.signTransaction',
        correlationId: record.correlationId,
        chainId: record.chainId,
        to: record.to as Address,
        data: record.data,
        ...(value !== undefined ? { value } : {}),
      };
    }
    default:
      return null;
  }
}
