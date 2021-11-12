import { chainsConfig } from './chains/chain-config';
import { walletsConfig } from './wallets/wallets-config';
import { Chain, Wallet } from '@webb-dapp/react-environment';

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

export * from './wallets';
export * from './currencies';
export * from './chains';
export * from './evm/SupportedMixers';
