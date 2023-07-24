import { CurrencyConfig, chainsConfig } from '@webb-tools/dapp-config';

export const getTokenURI = (currency: CurrencyConfig, typedChainId: string) => {
  const explorerUrl =
    chainsConfig[Number(typedChainId)]?.blockExplorers?.default.url ?? '';

  if (!explorerUrl) return '#';

  const addr = currency.addresses.get(+typedChainId);

  return new URL(`/address/${addr ?? ''}`, explorerUrl).toString();
};
