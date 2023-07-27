import { anchorDeploymentBlock, ChainConfig } from '@webb-tools/dapp-config';
import { AppEnvironment } from '@webb-tools/dapp-config/types';
import { calculateTypedChainId } from '@webb-tools/sdk-core';

// Get the all the active source chains from the anchor config and chain config
export const getActiveSourceChains = (
  chains: Record<number, ChainConfig>
): Array<ChainConfig> => {
  const currentEnv = process.env.NODE_ENV || 'development';

  return Object.values(chains).filter((chain) => {
    const typedChainId = calculateTypedChainId(chain.chainType, chain.id);
    const anchorConfig = anchorDeploymentBlock[typedChainId];

    const env = chain.env;

    const isSupported = env ? env.includes(currentEnv as AppEnvironment) : true;

    return anchorConfig && Object.keys(anchorConfig).length > 0 && isSupported;
  });
};
