import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { Chain, Wallet } from './api-config';

import { chainsConfig } from './chains/chain-config';
import { walletsConfig } from './wallets/wallets-config';

export const chainsPopulated = Object.values(chainsConfig).reduce(
  (acc, chainsConfig) => {
    const typedChainId = calculateTypedChainId(
      chainsConfig.chainType,
      chainsConfig.id
    );

    return {
      ...acc,
      [typedChainId]: {
        ...chainsConfig,
        wallets: Object.values(walletsConfig)
          .filter(({ supportedChainIds }) =>
            supportedChainIds.includes(typedChainId)
          )
          .reduce((acc, walletsConfig) => {
            return Array.from(new Set([...acc, walletsConfig.id])); // dedupe
          }, [] as Array<Wallet['id']>),
      },
    };
  },
  {} as Record<number, Chain>
);

export * from './anchors';
export * from './api-config';
export * from './bridges';
export * from './chains';
export * from './constants';
export * from './currencies';
export * from './utils';
export * from './wallets';
