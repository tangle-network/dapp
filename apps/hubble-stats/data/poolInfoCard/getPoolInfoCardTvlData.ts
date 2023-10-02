import vAnchorClient from '@webb-tools/vanchor-client';
import { formatEther } from 'viem';

import { VANCHORS_MAP } from '../../constants';
import { MetricType, SubgraphUrlType } from '../../types';
import { getChangeRate, EPOCH_DAY_INTERVAL } from '../../utils';
import { getTvlByVAnchor } from '../utils';

async function getTvl24hByVAnchor(
  poolAddress: string,
  epochStart: number,
  epochNow: number,
  subgraphUrls: SubgraphUrlType[]
) {
  try {
    const latestTvlByChains = await Promise.all(
      subgraphUrls.map(async (subgraphUrl) => {
        const latestTvlByVAnchorByChain =
          await vAnchorClient.TotalValueLocked.GetVAnchorByChainLatestTVLInTimeRange(
            subgraphUrl,
            poolAddress,
            epochStart,
            epochNow - EPOCH_DAY_INTERVAL
          );
        return latestTvlByVAnchorByChain.totalValueLocked;
      })
    );

    return latestTvlByChains.reduce(
      (total, latestTvlByChain) =>
        total + +formatEther(BigInt(latestTvlByChain ?? 0)),
      0
    );
  } catch (error) {
    console.error('Error while fetching TVL 24h data', error);
  }

  return undefined;
}

export default async function getPoolInfoCardTvlData(
  poolAddress: string,
  epochStart: number,
  epochNow: number
): Promise<MetricType> {
  const subgraphUrls = VANCHORS_MAP[poolAddress].supportedSubgraphs;

  const [tvl, tvl24h] = await Promise.all([
    getTvlByVAnchor(poolAddress, subgraphUrls),
    getTvl24hByVAnchor(poolAddress, epochStart, epochNow, subgraphUrls),
  ] as const);

  const tvlChangeRate = getChangeRate(tvl, tvl24h);

  return {
    value: tvl,
    changeRate: tvlChangeRate,
  };
}
