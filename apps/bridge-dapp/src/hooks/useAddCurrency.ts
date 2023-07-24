import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain } from '@webb-tools/dapp-config';
import { useCurrentResourceId } from '@webb-tools/react-hooks';
import { ResourceId, calculateTypedChainId } from '@webb-tools/sdk-core';
import { WebbWeb3Provider } from '@webb-tools/web3-api-provider';
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
    activeChain.id
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
      if (!activeApi || !activeChain || !activeAccount) {
        return false;
      }

      const accountAddress = activeAccount.address;

      if (!(activeApi instanceof WebbWeb3Provider)) {
        return false;
      }

      const typedChainId = calculateTypedChainId(
        activeChain.chainType,
        activeChain.id
      );

      const address = currency.getAddressOfChain(typedChainId);

      if (!address) {
        console.warn('Not found address on the current chain ', currency);
        return false;
      }

      try {
        await activeApi.watchAsset(
          currency,
          await getCurrencyImageUrl(currency.view.symbol)
        );

        if (accountAddress && currentResourceId && address) {
          recordAddedToken(accountAddress, currentResourceId, address);
        }

        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [activeApi, activeChain, activeAccount, currentResourceId]
  );
};
