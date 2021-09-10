import { ChainId } from '@webb-dapp/apps/configs';

export type RelayedChainConfig = {
  withdrawFeePercentage: number;
  account: string;
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
  leavesWatcher: LeavesWatcher;
  size: number;
}

export interface LeavesWatcher {
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
