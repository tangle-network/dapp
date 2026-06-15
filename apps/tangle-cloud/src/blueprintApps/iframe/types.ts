import type { Address, Hex } from 'viem';

export type IframeContractGrant = {
  chainId: number;
  address: Address;
  // Optional 4-byte selector allowlist. When present, the parent rejects sign
  // requests targeting this contract whose calldata starts with a different
  // selector. When omitted (legacy / fully-trusted apps) any selector on the
  // contract is allowed.
  selectors?: Hex[];
};

export type IframeMessageGrant = {
  chainId: number;
  // Optional EIP-191 prefix substring allowlist. The iframe is asking the
  // user to sign an arbitrary string; we let manifests narrow what kinds of
  // strings are acceptable (e.g. only login challenges with a specific
  // prefix). Omit to allow any message.
  prefixes?: string[];
};

// Fully-resolved iframe safety policy attached to a blueprint app entry.
// Built only when the manifest-level iframe gate passes.
export type BlueprintIframeConfig = {
  url: string;
  origin: string;
  appId: string;
  allowedChainIds: number[];
  contracts: IframeContractGrant[];
  messages: IframeMessageGrant[];
  // Capability flags. All default to false; manifests must opt in.
  allowReadAccount: boolean;
  allowChainSwitch: boolean;
  allowPopups: boolean;
  // CURATED-ONLY: grant the iframe its own (cross-origin) origin via the
  // allow-same-origin sandbox token. Required by embedded apps that run their
  // own wallet (WalletConnect/ConnectKit need persistent storage, which an
  // opaque-origin iframe lacks). Honored ONLY for cross-origin apps — see
  // buildSandbox — so it never lets the frame reach the parent. Never set from
  // untrusted on-chain metadata.
  allowSameOrigin?: boolean;
};
