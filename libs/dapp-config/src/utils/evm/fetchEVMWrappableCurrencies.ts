import {
  ERC20,
  ERC20__factory,
  FungibleTokenWrapper__factory,
} from '@webb-tools/contracts';
import { ethers } from 'ethers';

// Cache the wrappable currencies (typed chain id -> ERC20[])
const wrappableCurrenciesCache = new Map<number, ERC20[] | Error>();

/**
 * Get the list of currencies that can be wrapped to the given fungible currency
 * @param fungbileCurrency the fungible currency to get the wrappable currencies
 * @param provider the provider to use
 * @returns the list of currencies that can be wrapped to the given fungible currency
 */
export const fetchEVMWrappableCurrencies = async (
  fungbileCurrency: ERC20,
  typedChainId: number,
  provider: ethers.providers.Provider
): Promise<ERC20[]> => {
  if (wrappableCurrenciesCache.has(typedChainId)) {
    const cached = wrappableCurrenciesCache.get(typedChainId);
    if (cached instanceof Error) {
      return [];
    }

    return cached;
  }

  const fungibleTokenWrapper = FungibleTokenWrapper__factory.connect(
    fungbileCurrency.address,
    provider
  );

  try {
    const addresses = await fungibleTokenWrapper.getTokens();
    const erc20ListResponse = await Promise.allSettled(
      addresses.map(async (address) =>
        ERC20__factory.connect(address, provider)
      )
    );

    const erc20List = erc20ListResponse
      .map((erc20Response) => {
        if (erc20Response.status === 'fulfilled') {
          return erc20Response.value;
        }

        return null;
      })
      .filter(Boolean);

    wrappableCurrenciesCache.set(typedChainId, erc20List);
    return erc20List;
  } catch (error) {
    wrappableCurrenciesCache.set(typedChainId, error);
  }

  return [];
};
