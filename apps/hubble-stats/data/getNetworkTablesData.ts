import { randNumber } from '@ngneat/falso';

import { NetworkPoolType } from '../components/NetworkPoolTable/types';
import { NetworkTokenType } from '../components/NetworkTokenTable/types';

type NetworkTablesDataType = {
  typedChainIds?: number[];
  networkPoolData?: NetworkPoolType[];
  networkTokenData?: NetworkTokenType[];
};

const typedChainIds = [
  1099511627781, 1099511628196, 1099511629063, 1099511670889, 1099511707777,
  1099512049389, 1099512162129, 1099522782887,
];

const getNewPool = (): NetworkPoolType => {
  return {
    symbol: 'webbPRC',
    aggregate: randNumber({ min: 1_000_000, max: 20_000_000 }),
    chainsData: typedChainIds.reduce(
      (data, typedChainId) => ({
        ...data,
        [typedChainId]: randNumber({ min: 1_000_000, max: 20_000_000 }),
      }),
      {}
    ),
  };
};

const getNewToken = (): NetworkTokenType => {
  return {
    symbol: 'webbPRC',
    aggregate: randNumber({ min: 1_000_000, max: 20_000_000 }),
    chainsData: typedChainIds.reduce(
      (data, typedChainId) => ({
        ...data,
        [typedChainId]: randNumber({ min: 1_000_000, max: 20_000_000 }),
      }),
      {}
    ),
    tokens: [
      {
        symbol: 'eth',
        compositionPercentage: randNumber({ min: 0, max: 100 }),
        aggregate: randNumber({ min: 1_000_000, max: 20_000_000 }),
        chainsData: typedChainIds.reduce(
          (data, typedChainId) => ({
            ...data,
            [typedChainId]: randNumber({ min: 1_000, max: 2_000_000 }),
          }),
          {}
        ),
      },
      {
        symbol: 'usdt',
        compositionPercentage: randNumber({ min: 0, max: 100 }),
        aggregate: randNumber({ min: 1_000_000, max: 20_000_000 }),
        chainsData: typedChainIds.reduce(
          (data, typedChainId) => ({
            ...data,
            [typedChainId]: randNumber({ min: 1_000, max: 2_000_000 }),
          }),
          {}
        ),
      },
    ],
  };
};

export default async function getNetworkTablesData(
  poolAddress: string
): Promise<NetworkTablesDataType> {
  return {
    typedChainIds,
    networkPoolData: [getNewPool()],
    networkTokenData: [getNewToken()],
  };
}
