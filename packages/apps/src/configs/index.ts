import {
  Chain,
  ChainTypeId,
  chainTypeIdToInternalId,
  InternalChainId,
  Wallet,
  WebbError,
  WebbErrorCodes,
} from '@webb-tools/api-providers';

import { chainsConfig } from './chains/chain-config';
import { walletsConfig } from './wallets/wallets-config';
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

export const getEVMChainName = (evmId: number): string => {
  const chain = Object.values(chainsConfig).find((chainsConfig) => chainsConfig.chainId === evmId);
  if (chain) {
    return chain.name;
  } else {
    throw WebbError.from(WebbErrorCodes.UnsupportedChain);
  }
};

export const chainNameFromInternalId = (internalId: InternalChainId): string => {
  const chain = chainsConfig[internalId];
  return chain.name;
};

export const getChainNameFromChainId = (chainIdType: ChainTypeId): string => {
  const internalId = chainTypeIdToInternalId(chainIdType);
  return chainNameFromInternalId(internalId);
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
export * from './wallets';
