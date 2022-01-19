import { ChainId } from '@webb-dapp/apps/configs';

export type RelayedChainConfig = {
  account: string;
  beneficiary?: string;
  contracts: Contract[];
};
export type Capabilities = {
  hasIpService: boolean;
  supportedChains: {
    substrate: Map<ChainId, RelayedChainConfig>;
    evm: Map<ChainId, RelayedChainConfig>;
  };
};

export interface Contract {
  contract: string;
  address: string;
  deployedAt: number;
  eventsWatcher: EventsWatcher;
  size: number;
  withdrawFeePercentage: number;
  linkedAnchors: LinkedAnchor[];
}

export interface LinkedAnchor {
  chain: string;
  address: string;
}

export interface EventsWatcher {
  enabled: boolean;
  pollingInterval: number;
}

export type RelayerConfig = {
  endpoint: string;
};

export interface Withdraw {
  finalized?: Finalized;
  errored?: Errored;
  connected?: string;
  connecting?: string;
}

export interface Finalized {
  txHash: string;
}

export interface Errored {
  reason: string;
}

export type RelayerMessage = {
  withdraw?: Withdraw;
  error?: string;
  network?: string;
};
export type RelayerCMDBase = 'evm' | 'substrate';
export type MixerRelayTx = {
  chain: string;
  // Tree ID (Mixer tree id)
  id: number;
  proof: string;
  root: string;
  nullifierHash: string;
  // Ss558 Format
  recipient: string;
  // Ss558 Format
  relayer: string;
  fee: number;
  refund: number;
};

type TornadoRelayTransaction = {
  chain: string;
  // The target contract.
  contract: string;
  // Proof bytes
  proof: string;
  // Fixed length Hex string
  fee: string;
  nullifierHash: string;
  recipient: string;
  // Fixed length Hex string
  refund: string;
  relayer: string;
  root: string;
};
type AnchorRelayTransaction = TornadoRelayTransaction & {
  refreshCommitment: string;
};
export type RelayerSubstrateCommands = {
  mixerRelayTx: MixerRelayTx;
};
export type RelayerEVMCommands = {
  tornadoRelayTransaction: TornadoRelayTransaction;
  anchorRelayTransaction: AnchorRelayTransaction;
};
export type EVMCMDKeys = keyof RelayerEVMCommands;
export type SubstrateCMDKeys = keyof RelayerSubstrateCommands;
export type RelayerCMDKey = EVMCMDKeys | SubstrateCMDKeys;
