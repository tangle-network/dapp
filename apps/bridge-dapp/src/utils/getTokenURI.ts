import { CurrencyConfig, chainsConfig } from '@webb-tools/dapp-config';

export const getTokenURI = (currency: CurrencyConfig, chainID: string) => {
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
