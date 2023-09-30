import vAnchorClient from '@webb-tools/vanchor-client';
import { formatEther } from 'viem';

import { ACTIVE_SUBGRAPH_URLS } from '../../constants';
import { MetricType } from '../../types';
import { getChangeRate, EPOCH_DAY_INTERVAL } from '../../utils';
import { getTvlByVAnchor } from '../utils';

async function getTvl24hByVAnchor(
  poolAddress: string,
  epochStart: number,
  epochNow: number
) {
  try {
    const latestTvlByChains = await Promise.all(
      ACTIVE_SUBGRAPH_URLS.map(async (subgraphUrl) => {
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
  const [tvl, tvl24h] = await Promise.all([
    getTvlByVAnchor(poolAddress),
    getTvl24hByVAnchor(poolAddress, epochStart, epochNow),
  ] as const);

  const tvlChangeRate = getChangeRate(tvl, tvl24h);

  return {
    value: tvl,
    changeRate: tvlChangeRate,
  };
}
