import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain } from '@webb-tools/dapp-config';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { Web3Provider } from '@webb-tools/web3-api-provider';
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
  address: string,
  symbol: string
) => {
  const addedTokens = JSON.parse(localStorage.getItem('addedTokens') || '[]');

  const tokenExists = addedTokens.some(
    (token: any) => token.address === address && token.symbol === symbol
  );

  if (!tokenExists) {
    addedTokens.push({ address, symbol });
    localStorage.setItem('addedTokens', JSON.stringify(addedTokens));
  }
};

export const isTokenAddedToMetamask = (
  currency?: Currency,
  activeChain?: Chain
): boolean => {
  if (currency && activeChain) {
    const typedChainId = calculateTypedChainId(
      activeChain.chainType,
      activeChain.chainId
    );
    const address = currency.getAddressOfChain(typedChainId);
    const validSymbol = currency.view.symbol.slice(0, 11);

    const addedTokens = JSON.parse(localStorage.getItem('addedTokens') || '[]');

    return addedTokens.some(
      (token: any) => token.address === address && token.symbol === validSymbol
    );
  } else {
    return false;
  }
};

/**
 * Get a function that adds a token to the user's wallet (only works with Web3Provider)
 * @returns a function that adds a token to the user's wallet and returns a boolean indicating success
 */
export const useAddCurrency = () => {
  const { activeApi, activeChain } = useWebContext();

  return useCallback(
    async (currency: Currency): Promise<boolean> => {
      if (!activeApi || !activeChain) {
        return false;
      }

      const provider = activeApi.getProvider();

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

        addTokenAddedToMetamaskInLocalStorage(address, validSymbol);
        return Boolean(wasAdded);
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [activeApi, activeChain]
  );
};
