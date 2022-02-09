import { anchorsConfig } from '@webb-dapp/apps/configs/anchors';
import { bridgeConfigByAsset } from '@webb-dapp/apps/configs/bridges';
import { currenciesConfig } from '@webb-dapp/apps/configs/currencies';
import { mixersConfig } from '@webb-dapp/apps/configs/mixers';
import { AppConfig, Chain, Wallet } from '@webb-dapp/react-environment';

import { chainsConfig } from './chains/chain-config';
import { walletsConfig } from './wallets/wallets-config';

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

export * from './currencies';
export * from './chains';
export * from './anchors';
export * from './bridges';
export * from './mixers';
export * from './wallets';

export const staticAppConfig: AppConfig = {
  anchors: anchorsConfig,
  bridgeByAsset: bridgeConfigByAsset,
  chains: chainsConfig,
  currencies: currenciesConfig,
  mixers: mixersConfig,
  wallet: walletsConfig,
};
