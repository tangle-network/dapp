import { CurrencyConfig, chainsConfig } from '@webb-tools/dapp-config';

export const getTokenURI = (currency: CurrencyConfig, chainID: string) => {
  const explorerUrl =
    chainsConfig[Number(chainID)]?.blockExplorers?.default.url ?? '';

  return new URL(
    `/address/${currency.addresses.get(Number(chainID)) ?? ''}`,
    explorerUrl
  ).toString();
};
