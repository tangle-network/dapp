import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { Web3Provider } from '@webb-tools/web3-api-provider';
import { Chain } from '@webb-tools/dapp-config';
import { useCallback } from 'react';

const IMAGE_URL_TEMPLATE =
  'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/{symbol}.png';

const getCurrencyImageUrl = async (symbol: string): Promise<string> => {
  try {
    const url = IMAGE_URL_TEMPLATE.replace('{symbol}', symbol.toLowerCase());

    // Try to fetch the image and check if it exists
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error('Image not found');
    }

    return url;
  } catch (error) {
    return '';
  }
};

export const addTokenAddedToMetamaskInLocalStorage = (
  accountAddress: string,
  resourceId: string,
  tokenAddress: string
) => {
  // Retrieve existing token storage
  const storedTokens = JSON.parse(localStorage.getItem('addedTokens') || '{}');

  // Check if account address exists in storage
  if (!storedTokens[accountAddress]) {
    storedTokens[accountAddress] = {};
  }

  // Check if resourceId exists for the account
  if (!storedTokens[accountAddress][resourceId]) {
    storedTokens[accountAddress][resourceId] = {};
  }

  // Check if the token is already marked as added for the account and resourceId
  if (!storedTokens[accountAddress][resourceId][tokenAddress]) {
    storedTokens[accountAddress][resourceId][tokenAddress] = true;
    localStorage.setItem('addedTokens', JSON.stringify(storedTokens));
  }
};

export const isTokenAddedToMetamask = (
  currency: Currency,
  activeChain?: Chain,
  activeApi?: any,
  accountAddress?: string
): boolean => {
  // Validate required parameters.
  if (!currency || !activeChain || !activeApi || !accountAddress) {
    return false;
  }

  const typedChainId = calculateTypedChainId(
    activeChain.chainType,
    activeChain.chainId
  );

  const tokenAddress = currency.getAddressOfChain(typedChainId);

  // Get resourceId from config if it exists, otherwise return false.
  const resourceId =
    activeApi?.config?.currencies[currency.view.id]?.addresses?.get(
      typedChainId
    );
  if (!resourceId || !tokenAddress) {
    return false;
  }

  const storedTokens = JSON.parse(localStorage.getItem('addedTokens') || '{}');

  // Check if the token is marked as added for the account and resourceId
  return Boolean(storedTokens[accountAddress]?.[resourceId]?.[tokenAddress]);
};

/**
 * Get a function that adds a token to the user's wallet (only works with Web3Provider)
 * @returns a function that adds a token to the user's wallet and returns a boolean indicating success
 */
export const useAddCurrency = () => {
  const { activeApi, activeChain, activeAccount } = useWebContext();

  return useCallback(
    async (currency: Currency): Promise<boolean> => {
      if (!activeApi || !activeChain) {
        return false;
      }

      const provider = activeApi.getProvider();

      const accountAddress = activeAccount?.address;

      // Provider is not a Web3Provider instance so we can't add tokens
      if (!(provider instanceof Web3Provider)) {
        return false;
      }

      const typedChainId = calculateTypedChainId(
        activeChain.chainType,
        activeChain.chainId
      );

      const address = currency.getAddressOfChain(typedChainId);

      const resourceId =
        activeApi?.config?.currencies[currency.view.id].addresses.get(
          typedChainId
        );

      if (!address) {
        console.warn('Not found address on the current chain ', currency);
        return false;
      }

      // A valid symbol is max 11 characters long
      const validSymbol = currency.view.symbol.slice(0, 11);

      try {
        const wasAdded = await provider.addToken({
          address,
          symbol: validSymbol,
          decimals: currency.view.decimals,
          image: await getCurrencyImageUrl(currency.view.symbol),
        });

        if (wasAdded && accountAddress && resourceId && address) {
          addTokenAddedToMetamaskInLocalStorage(
            accountAddress,
            resourceId,
            address
          );
        }

        return Boolean(wasAdded);
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [activeApi, activeChain, activeAccount]
  );
};
