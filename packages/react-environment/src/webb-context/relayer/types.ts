import { ChainId, WebbEVMChain } from '@webb-dapp/apps/configs';

export type RealyedChainConfig = {
  withdrewFee: number;
  withdrewGaslimit: number;
  account: string;
};
export type Capabilities = {
  hasIpService: boolean;
  supportedChains: {
    substrate: Map<ChainId, RealyedChainConfig>;
    evm: Map<ChainId, RealyedChainConfig>;
  };
};

export type Relayerconfig = {
  address: string;
};
