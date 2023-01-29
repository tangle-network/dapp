import { currenciesConfig } from '@webb-tools/dapp-config';
import { webbCurrencyIdFromString } from '@webb-tools/dapp-types';
import { chainsConfig } from '@webb-tools/dapp-config';

export const getTokenURI = (token: string, chainID: string) => {
  const tokenID = webbCurrencyIdFromString(token);
  const currency = currenciesConfig[tokenID];

  const explorerUri = chainsConfig[Number(chainID)]?.blockExplorerStub ?? '';

  const getExplorerURI = (
    addOrTxHash: string,
    variant: 'tx' | 'address'
  ): string => {
    return `${
      explorerUri.endsWith('/') ? explorerUri : explorerUri + '/'
    }${variant}/${addOrTxHash}`;
  };

  return getExplorerURI(
    currency.addresses.get(Number(chainID)) ?? '',
    'address'
  );
};
