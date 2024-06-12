import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import { Chain } from '../api-config';
import getWalletIdsForTypedChainId from '../utils/getWalletIdsForTypedChainId';
import { chainsConfig } from './chain-config';

const chainsPopulated = Object.values(chainsConfig).reduce(
  (acc, chainsConfig) => {
    const typedChainId = calculateTypedChainId(
      chainsConfig.chainType,
      chainsConfig.id,
    );

    return {
      ...acc,
      [typedChainId]: {
        ...chainsConfig,
        wallets: getWalletIdsForTypedChainId(typedChainId),
      },
    };
  },
  {} as Record<number, Chain>,
);

export default chainsPopulated;
