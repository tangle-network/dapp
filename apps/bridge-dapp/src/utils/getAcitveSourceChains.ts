import { anchorDeploymentBlock, ChainConfig } from '@webb-tools/dapp-config';
import { calculateTypedChainId } from '@webb-tools/sdk-core';

// Get the all the active source chains from the anchor config and chain config
export const getAcitveSourceChains = (
  chains: Record<number, ChainConfig>
): Array<ChainConfig> => {
  return Object.values(chains).filter((chain) => {
    const typedChainId = calculateTypedChainId(chain.chainType, chain.chainId);
    const anchorConfig = anchorDeploymentBlock[typedChainId];
    return anchorConfig && Object.keys(anchorConfig).length > 0;
  });
};
