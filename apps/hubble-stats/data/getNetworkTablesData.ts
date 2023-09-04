import { randNumber } from '@ngneat/falso';
import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { NetworkPoolType } from '../components/NetworkPoolTable/types';
import { NetworkTokenType } from '../components/NetworkTokenTable/types';
import { getTvlByVAnchor } from './reusable';
import { ACTIVE_CHAINS, VANCHORS_MAP, LIVE_SUBGRAPH_MAP } from '../constants';

export type NetworkTablesDataType = {
  typedChainIds: number[];
  tvlData: NetworkPoolType[];
  relayerEarningsData: NetworkPoolType[];
  networkTokenData?: NetworkTokenType[];
};

const typedChainIds = ACTIVE_CHAINS;

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
  const { fungibleTokenSymbol } = VANCHORS_MAP[poolAddress];
  const tvlAggregate = await getTvlByVAnchor(poolAddress);
  const tvlChainsData = {} as Record<number, number | undefined>;

  for (const typedChainId of ACTIVE_CHAINS) {
    let tvlByVAnchorByChain: number | undefined;
    try {
      const tvlData =
        await vAnchorClient.TotalValueLocked.GetVAnchorTotalValueLockedByChain(
          LIVE_SUBGRAPH_MAP[typedChainId],
          poolAddress
        );

      tvlByVAnchorByChain = +formatEther(BigInt(tvlData.totalValueLocked ?? 0));
    } catch (error) {
      tvlByVAnchorByChain = undefined;
    }
    tvlChainsData[typedChainId] = tvlByVAnchorByChain;
  }

  return {
    tvlData: [
      {
        symbol: fungibleTokenSymbol,
        aggregate: tvlAggregate,
        chainsData: tvlChainsData,
      },
    ],
    relayerEarningsData: [
      {
        symbol: fungibleTokenSymbol,
        aggregate: tvlAggregate,
        chainsData: tvlChainsData,
      },
    ],
    networkTokenData: [getNewToken()],
    typedChainIds,
  };
}
