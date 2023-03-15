import { ChainConfig, getLatestAnchorAddress } from '@webb-tools/dapp-config';
import { calculateTypedChainId } from '@webb-tools/sdk-core';

// Get the all the active source chains from the anchor config and chain config
export const getAcitveSourceChains = (
  chains: Record<number, ChainConfig>
): Array<ChainConfig> => {
  return Object.values(chains).filter((chain) =>
    getLatestAnchorAddress(
      calculateTypedChainId(chain.chainType, chain.chainId)
    )
  );
};
