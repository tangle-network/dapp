import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { ResourceId, calculateTypedChainId } from '@webb-tools/sdk-core';
import { Web3Provider } from '@webb-tools/web3-api-provider';
import { Chain } from '@webb-tools/dapp-config';
import { useCallback } from 'react';
import { useCurrentResourceId } from '@webb-tools/react-hooks';

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

export const recordAddedToken = (
  accountAddress: string,
  resourceId: ResourceId,
  tokenAddress: string
) => {
  // Retrieve existing token storage
  const storedTokens = JSON.parse(localStorage.getItem('addedTokens') || '{}');

  // Check if account address exists in storage
  if (!storedTokens[accountAddress]) {
    storedTokens[accountAddress] = {};
  }

  // Check if resourceId exists for the account
  if (!storedTokens[accountAddress][resourceId.toString()]) {
    storedTokens[accountAddress][resourceId.toString()] = {};
  }

  // Check if the token is already marked as added for the account and resourceId
  if (!storedTokens[accountAddress][resourceId.toString()][tokenAddress]) {
    storedTokens[accountAddress][resourceId.toString()][tokenAddress] = true;
    localStorage.setItem('addedTokens', JSON.stringify(storedTokens));
  }
};

export const isTokenAddedToMetamask = (
  currency: Currency,
  activeChain?: Chain,
  accountAddress?: string,
  resourceId?: ResourceId | null
): boolean => {
  // Validate required parameters.
  if (!currency || !activeChain || !accountAddress || !resourceId) {
    return false;
  }

  const typedChainId = calculateTypedChainId(
    activeChain.chainType,
    activeChain.chainId
  );

  const tokenAddress = currency.getAddressOfChain(typedChainId);

  if (!resourceId || !tokenAddress) {
    return false;
  }

  const storedTokens = JSON.parse(localStorage.getItem('addedTokens') || '{}');

  // Check if the token is marked as added for the account and resourceId
  return Boolean(
    storedTokens[accountAddress]?.[resourceId.toString()]?.[tokenAddress]
  );
};

/**
 * Get a function that adds a token to the user's wallet (only works with Web3Provider)
 * @returns a function that adds a token to the user's wallet and returns a boolean indicating success
 */
export const useAddCurrency = () => {
  const { activeApi, activeChain, activeAccount } = useWebContext();

  const currentResourceId = useCurrentResourceId();

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

        if (wasAdded && accountAddress && currentResourceId && address) {
          recordAddedToken(accountAddress, currentResourceId, address);
        }

        return Boolean(wasAdded);
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [activeApi, activeChain, activeAccount, currentResourceId]
  );
};
