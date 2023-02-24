import { ERC20__factory, VAnchor__factory } from '@webb-tools/contracts';
import { ethers } from 'ethers';

import { getLatestAnchorAddress } from '../../anchors';
import { IEVMCurrency } from './types';

// Cache the fungible currencies (typed chain id -> IEVMCurrency | Error)
const fungibleCurrenciesCache = new Map<number, IEVMCurrency | Error>();

/**
 * Get the fungible currency config for a given typed chain id,
 * this function depends on the hardcoded anchor config
 * @param typedChainId the typed chain id to get the fungible currnecy
 */
export const fetchEVMFungibleCurrency = async (
  typedChainId: number,
  provider: ethers.providers.Provider
): Promise<IEVMCurrency | null> => {
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

    const [name, symbol, decimals] = await Promise.all([
      erc20Currency.name(),
      erc20Currency.symbol(),
      erc20Currency.decimals(),
    ]);

    const returnVal = {
      name,
      symbol,
      decimals,
      address: fungibleTokenAddress,
    };
    fungibleCurrenciesCache.set(typedChainId, returnVal);
    return returnVal;
  } catch (error) {
    fungibleCurrenciesCache.set(typedChainId, error);
  }

  return null;
};
