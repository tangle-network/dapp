import {
  anchorDeploymentBlock,
  ChainConfig,
  ChainEnvironment,
} from '@webb-tools/dapp-config';
import { calculateTypedChainId } from '@webb-tools/sdk-core';

// Get the all the active source chains from the anchor config and chain config
export const getAcitveSourceChains = (
  chains: Record<number, ChainConfig>
): Array<ChainConfig> => {
  const currentEnv = process.env.NODE_ENV || 'development';

  return Object.values(chains).filter((chain) => {
    const typedChainId = calculateTypedChainId(chain.chainType, chain.chainId);
    const anchorConfig = anchorDeploymentBlock[typedChainId];

    const env = chain.env;

    const isSupported = env
      ? env.includes(currentEnv as ChainEnvironment)
      : true;

    return anchorConfig && Object.keys(anchorConfig).length > 0 && isSupported;
  });
};
