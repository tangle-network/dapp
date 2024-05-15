import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import { Chain, Wallet } from '../api-config';
import { walletsConfig } from '../wallets/wallets-config';
import { chainsConfig } from './chain-config';

const chainsPopulated = Object.values(chainsConfig).reduce(
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

export default chainsPopulated;
