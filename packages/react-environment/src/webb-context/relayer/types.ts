import { ChainId } from '@webb-dapp/apps/configs';

export type RelayedChainConfig = {
  withdrewFee: number;
  withdrewGaslimit: number;
  account: string;
};
export type Capabilities = {
  hasIpService: boolean;
  supportedChains: {
    substrate: Map<ChainId, RelayedChainConfig>;
    evm: Map<ChainId, RelayedChainConfig>;
  };
};

export type RelayerConfig = {
  address: string;
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
