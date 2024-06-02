import vAnchorClient from '@webb-tools/vanchor-client';
import { formatEther } from 'viem';

import { ACTIVE_SUBGRAPH_URLS, VANCHOR_ADDRESSES } from '../../constants';
import { MetricType } from '../../types';
import { getChangeRate, EPOCH_DAY_INTERVAL } from '../../utils';
import { getTvl } from '../utils';

async function getTvl24h(epochStart: number, epochNow: number) {
  try {
    const latestTvlByVAnchorsByChains =
      await vAnchorClient.TotalValueLocked.GetVAnchorsByChainsLatestTVLInTimeRange(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        epochStart,
        epochNow - EPOCH_DAY_INTERVAL,
      );

    return Object.values(latestTvlByVAnchorsByChains).reduce(
      (total, tvlByVAnchorsByChain) => {
        const latestTvlByChain = tvlByVAnchorsByChain.reduce(
          (totalByChain, tvlByVAnchor) =>
            totalByChain +
            +formatEther(BigInt(tvlByVAnchor.totalValueLocked ?? 0)),
          0,
        );
        return total + latestTvlByChain;
      },
      0,
    );
  } catch (error) {
    console.error('Error while fetching TVL 24h data', error);
  }
}

export default async function getKeyMetricTvlData(
  epochStart: number,
  epochNow: number,
): Promise<MetricType> {
  const [tvl, tvl24h] = await Promise.all([
    getTvl(),
    getTvl24h(epochStart, epochNow),
  ] as const);

  const tvlChangeRate = getChangeRate(tvl, tvl24h);

  return {
    value: tvl,
    changeRate: tvlChangeRate,
  };
}
