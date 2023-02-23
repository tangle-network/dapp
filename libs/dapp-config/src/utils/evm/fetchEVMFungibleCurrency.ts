import { ERC20, ERC20__factory, VAnchor__factory } from '@webb-tools/contracts';
import { ethers } from 'ethers';

import { getLatestAnchorAddress } from '../../anchors';

// Cache the fungible currencies (typed chain id -> ERC20 | Error)
const fungibleCurrenciesCache = new Map<number, ERC20 | Error>();

/**
 * Get the fungible currency config for a given typed chain id,
 * this function depends on the hardcoded anchor config
 * @param typedChainId the typed chain id to get the fungible currnecy
 */
export const fetchEVMFungibleCurrency = async (
  typedChainId: number,
  provider: ethers.providers.Provider
): Promise<ERC20 | null> => {
  if (fungibleCurrenciesCache.has(typedChainId)) {
    const cached = fungibleCurrenciesCache.get(typedChainId);
    if (cached instanceof Error) {
      return null;
    }

    return cached;
  }

  try {
    const anchorAddress = getLatestAnchorAddress(typedChainId);
    if (!anchorAddress) {
      throw new Error(`No anchor address for chain id ${typedChainId}`); // Development error
    }

    const vAcnhorContract = VAnchor__factory.connect(anchorAddress, provider);
    const fungibleTokenAddress = await vAcnhorContract.token();
    const erc20Currency = ERC20__factory.connect(
      fungibleTokenAddress,
      provider
    );
    fungibleCurrenciesCache.set(typedChainId, erc20Currency);
    return erc20Currency;
  } catch (error) {
    fungibleCurrenciesCache.set(typedChainId, error);
  }

  return null;
};
