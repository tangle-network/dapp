import {
  ERC20__factory,
  FungibleTokenWrapper__factory,
} from '@webb-tools/contracts';
import { zeroAddress } from '@webb-tools/dapp-types';
import { ethers } from 'ethers';

import { IEVMCurrency } from './types';

type FetchEVMWrappableCurrenciesReturnType = {
  wrappableCurrencies: IEVMCurrency[];
  isNativeAllowed: boolean;
};

// Cache the wrappable currencies (typed chain id -> ERC20[])
const wrappableCurrenciesCache = new Map<
  number,
  FetchEVMWrappableCurrenciesReturnType | Error
>();

/**
 * Get the list of currencies that can be wrapped to the given fungible currency
 * @param fungbileCurrency the fungible currency to get the wrappable currencies
 * @param provider the provider to use
 * @returns the list of currencies that can be wrapped to the given fungible currency
 */
export const fetchEVMWrappableCurrencies = async (
  fungbileCurrency: IEVMCurrency,
  typedChainId: number,
  provider: ethers.providers.Provider
): Promise<FetchEVMWrappableCurrenciesReturnType> => {
  if (wrappableCurrenciesCache.has(typedChainId)) {
    const cached = wrappableCurrenciesCache.get(typedChainId);
    if (cached instanceof Error) {
      return {
        wrappableCurrencies: [],
        isNativeAllowed: false,
      };
    }

    return cached;
  }

  const fungibleTokenWrapper = FungibleTokenWrapper__factory.connect(
    fungbileCurrency.address,
    provider
  );

  try {
    // Filter the zero addresses because they are not ERC20 tokens
    // and we use the isNativeAllowed flag to determine if native currency is allowed
    const addresses = (await fungibleTokenWrapper.getTokens()).filter(
      (addr) => addr !== zeroAddress
    );
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

    const isNativeAllowed = await fungibleTokenWrapper.isNativeAllowed();

    const evmCurrencies = await Promise.all(
      erc20List.map(async (erc20) => {
        const [name, symbol, decimals] = await Promise.all([
          erc20.name(),
          erc20.symbol(),
          erc20.decimals(),
        ]);

        return {
          name,
          symbol,
          decimals,
          address: erc20.address,
        };
      })
    );

    const returnVal = {
      wrappableCurrencies: evmCurrencies,
      isNativeAllowed,
    };
    wrappableCurrenciesCache.set(typedChainId, returnVal);
    return returnVal;
  } catch (error) {
    console.error('Error fetching wrappable currencies', error);
    wrappableCurrenciesCache.set(typedChainId, error);
  }

  return {
    wrappableCurrencies: [],
    isNativeAllowed: false,
  };
};
