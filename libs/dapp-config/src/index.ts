import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { Chain, Wallet } from './api-config';

import { chainsConfig } from './chains/chain-config';
import { walletsConfig } from './wallets/wallets-config';

export const chainsPopulated = Object.values(chainsConfig).reduce((acc, chainsConfig) => {
  const typedChainId = calculateTypedChainId(chainsConfig.chainType, chainsConfig.chainId);

  return {
    ...acc,
    [typedChainId]: {
      ...chainsConfig,
      wallets: Object.values(walletsConfig)
        .filter(({ supportedChainIds }) => supportedChainIds.includes(typedChainId))
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
  };
}, {} as Record<number, Chain>);

export * from './api-config';
export * from './currencies';
export * from './chains';
export * from './anchors';
export * from './bridges';
export * from './wallets';
