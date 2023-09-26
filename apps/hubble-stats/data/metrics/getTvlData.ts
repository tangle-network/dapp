import vAnchorClient from '@webb-tools/vanchor-client';
import { formatEther } from 'viem';
import { ACTIVE_SUBGRAPH_URLS, VANCHOR_ADDRESSES } from '../../constants';
import { MetricType } from '../../types';
import { getChangeRate } from '../../utils';
import { getTvl } from '../reusable';

async function getTvl24h(epochStart: number, epoch24h: number) {
  try {
    const latestTvlByVAnchorsByChains =
      await vAnchorClient.TotalValueLocked.GetVAnchorsByChainsLatestTVLInTimeRange(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        epochStart,
        epoch24h
      );

    return Object.values(latestTvlByVAnchorsByChains).reduce(
      (total, tvlByVAnchorsByChain) => {
        const latestTvlByChain = tvlByVAnchorsByChain.reduce(
          (totalByChain, tvlByVAnchor) =>
            totalByChain +
            +formatEther(BigInt(tvlByVAnchor.totalValueLocked ?? 0)),
          0
        );
        return total + latestTvlByChain;
      },
      0
    );
  } catch (error) {
    console.error('Error while fetching TVL 24h data', error);
  }
}

export default async function getTvlData(
  epochStart: number,
  epoch24h: number
): Promise<MetricType> {
  const [tvl, tvl24h] = await Promise.all([
    getTvl(),
    getTvl24h(epochStart, epoch24h),
  ] as const);

  const tvlChangeRate = getChangeRate(tvl, tvl24h);

  return {
    value: tvl,
    changeRate: tvlChangeRate,
  };
}
