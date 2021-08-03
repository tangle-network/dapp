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
