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

export type IframeRequestRequestConnect = {
  kind: 'tangle.app.requestConnect';
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

// EIP-712 typed-data signing — for publishers signing custom message shapes
// (operator envelopes, off-chain attestations, claim proofs). The parent
// renders the typed-data fields in the approval modal. `types` must NOT
// include the EIP712Domain entry — the parent derives it from `domain`.
export type IframeRequestSignTypedData = {
  kind: 'tangle.app.signTypedData';
  correlationId: string;
  chainId: number;
  domain: {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: Address;
    salt?: Hex;
  };
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  message: Record<string, unknown>;
};

// Job invocation — iframe asks the parent to run a blueprint job (quote +
// sign + submit happen parent-side). Results stream back via
// `ParentEventJobResult`. See the dapp's job-submission integration for
// how this maps onto the deploy/quote pipeline.
export type IframeRequestCallJob = {
  kind: 'tangle.app.callJob';
  correlationId: string;
  jobIndex: number;
  inputs: Record<string, unknown>;
  stream?: boolean;
};

export type IframeRequest =
  | IframeRequestHandshake
  | IframeRequestReadAccount
  | IframeRequestRequestConnect
  | IframeRequestSwitchChain
  | IframeRequestSignMessage
  | IframeRequestSignTransaction
  | IframeRequestSignTypedData
  | IframeRequestCallJob;

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

export type ParentResponseConnectResult = {
  kind: 'tangle.app.connectResult';
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

export type ParentResponseSignTypedDataResult = {
  kind: 'tangle.app.signTypedDataResult';
} & ParentResponseResultBase<{ signature: Hex }>;

// Unsolicited broadcasts from parent to iframe (e.g. user changes account)
export type ParentEventAccountChanged = {
  kind: 'tangle.app.accountChanged';
  account: Address | null;
};

export type ParentEventChainChanged = {
  kind: 'tangle.app.chainChanged';
  chainId: number;
};

// Chain config the iframe can use to build a read-only viem client. Mirrors
// the SDK's ChainContext. `rpcUrl` is a public RPC, never a wallet RPC —
// signing always routes back through the bridge.
export type IframeChainContext = {
  id: number;
  name: string;
  rpcUrl: string;
  blockExplorerUrl?: string;
  nativeCurrency?: { name: string; symbol: string; decimals: number };
};

// Service context broadcast — tells the iframe which blueprint/service it's
// rendering for, which operators are available, and the active chain.
export type ParentEventServiceContext = {
  kind: 'tangle.app.serviceContext';
  blueprintId: string;
  serviceId: string | null;
  operators: Array<{
    address: Address;
    rpcAddress: string | undefined;
    status: 'active' | 'inactive' | 'unknown';
  }>;
  jobs: Array<{ index: number; name: string }>;
  mode: string | null;
  chain?: IframeChainContext;
};

// Job result event — streams back from a callJob request.
export type ParentEventJobResult = {
  kind: 'tangle.app.jobResult';
  correlationId: string;
  status: 'pending' | 'streaming' | 'success' | 'error';
  data?: unknown;
  chunk?: unknown;
  error?: string;
  progress?: { percent?: number; eta_ms?: number };
};

export type ParentMessage =
  | ParentResponseHandshakeAck
  | ParentResponseReadAccountResult
  | ParentResponseConnectResult
  | ParentResponseSwitchChainResult
  | ParentResponseSignMessageResult
  | ParentResponseSignTransactionResult
  | ParentResponseSignTypedDataResult
  | ParentEventAccountChanged
  | ParentEventChainChanged
  | ParentEventServiceContext
  | ParentEventJobResult;

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
    case 'tangle.app.requestConnect': {
      if (!isValidCorrelationId(record.correlationId)) return null;
      return {
        kind: 'tangle.app.requestConnect',
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
    case 'tangle.app.signTypedData': {
      if (!isValidCorrelationId(record.correlationId)) return null;
      if (!isFiniteNumber(record.chainId) || record.chainId <= 0) return null;
      if (!isString(record.primaryType) || record.primaryType.length > 128) {
        return null;
      }
      if (typeof record.domain !== 'object' || record.domain === null) {
        return null;
      }
      if (typeof record.types !== 'object' || record.types === null) {
        return null;
      }
      if (typeof record.message !== 'object' || record.message === null) {
        return null;
      }
      // Bound total payload size to keep the approval modal sane + prevent
      // OOM via a giant typed-data blob.
      try {
        if (JSON.stringify(record.message).length > MAX_CALLDATA_BYTES) {
          return null;
        }
      } catch {
        return null;
      }
      return {
        kind: 'tangle.app.signTypedData',
        correlationId: record.correlationId,
        chainId: record.chainId,
        domain: record.domain as IframeRequestSignTypedData['domain'],
        types: record.types as IframeRequestSignTypedData['types'],
        primaryType: record.primaryType,
        message: record.message as Record<string, unknown>,
      };
    }
    case 'tangle.app.callJob': {
      if (!isValidCorrelationId(record.correlationId)) return null;
      if (!isFiniteNumber(record.jobIndex) || record.jobIndex < 0) return null;
      if (typeof record.inputs !== 'object' || record.inputs === null) {
        return null;
      }
      try {
        if (JSON.stringify(record.inputs).length > MAX_CALLDATA_BYTES) {
          return null;
        }
      } catch {
        return null;
      }
      return {
        kind: 'tangle.app.callJob',
        correlationId: record.correlationId,
        jobIndex: record.jobIndex,
        inputs: record.inputs as Record<string, unknown>,
        ...(typeof record.stream === 'boolean'
          ? { stream: record.stream }
          : {}),
      };
    }
    default:
      return null;
  }
}
