import { currenciesConfig } from '@webb-tools/dapp-config';
import { webbCurrencyIdFromString } from '@webb-tools/dapp-types';
import { chainsConfig } from '@webb-tools/dapp-config';

export const getTokenURI = (token: string, chainID: string) => {
  const tokenID = webbCurrencyIdFromString(token);
  const currency = currenciesConfig[tokenID];

  const blockExplorerStub =
    chainsConfig[Number(chainID)]?.blockExplorerStub ?? '';

  let explorerURI;

  explorerURI = blockExplorerStub.endsWith('/')
    ? blockExplorerStub
    : blockExplorerStub + '/';

  explorerURI =
    explorerURI + `address/${currency.addresses.get(Number(chainID)) ?? ''}`;

  return explorerURI;
};
