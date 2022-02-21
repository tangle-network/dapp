import { Chain, Wallet } from '@webb-dapp/react-environment';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';

import { chainsConfig } from './chains/chain-config';
import { walletsConfig } from './wallets/wallets-config';
import { InternalChainId } from './chains';
import { currenciesConfig } from './currencies';

export const chainsPopulated = Object.values(chainsConfig).reduce(
  (acc, chainsConfig) => ({
    ...acc,
    [chainsConfig.id]: {
      ...chainsConfig,
      wallets: Object.values(walletsConfig)
        .filter(({ supportedChainIds }) => supportedChainIds.includes(chainsConfig.id))
        .reduce(
          (acc, walletsConfig) => ({
            ...acc,
            [walletsConfig.id]: {
              ...walletsConfig,
            },
          }),
          {} as Record<number, Wallet>
        ),
    },
  }),
  {} as Record<number, Chain>
);

export const chainNameFromInternalId = (internalId: InternalChainId): string => {
  const chain = chainsConfig[internalId];
  return chain.name;
};

export const getEVMChainName = (evmId: number): string => {
  const chain = Object.values(chainsConfig).find((chainsConfig) => chainsConfig.chainId === evmId);
  if (chain) {
    return chain.name;
  } else {
    throw WebbError.from(WebbErrorCodes.UnsupportedChain);
  }
};

export const getEVMChainNameFromInternal = (chainID: number): string => {
  const chain = Object.values(chainsConfig).find((chainsConfig) => chainsConfig.id === chainID);
  if (chain) {
    return chain.name;
  } else {
    throw WebbError.from(WebbErrorCodes.UnsupportedChain);
  }
};

export const getNativeCurrencySymbol = (evmId: number): string => {
  const chain = Object.values(chainsConfig).find((chainsConfig) => chainsConfig.chainId === evmId);
  if (chain) {
    const nativeCurrency = chain.nativeCurrencyId;
    return currenciesConfig[nativeCurrency].symbol;
  }
  return 'Unknown';
};

export * from './currencies';
export * from './chains';
export * from './anchors';
export * from './bridges';
export * from './mixers';
export * from './wallets';
