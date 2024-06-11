import vAnchorClient from '@webb-tools/vanchor-client';

import { VANCHORS_MAP } from '../../constants';
import type { ChartDataRecord, SubgraphUrlType } from '../../types';
import { getFormattedDataForBasicChart, serializeEpochData } from '../../utils';
import { getTvlByVAnchor } from '../utils';

async function getVAnchorTvlDataByDateRange(
  vAnchorAddress: string,
  startingEpoch: number,
  numDatesFromStart: number,
  subgraphUrls: SubgraphUrlType[],
): Promise<ChartDataRecord> {
  try {
    const fetchedTvlData =
      await vAnchorClient.TotalValueLocked.GetVAnchorTVLByChainsByDateRange(
        subgraphUrls,
        vAnchorAddress,
        startingEpoch,
        numDatesFromStart,
      );

    return serializeEpochData(fetchedTvlData);
  } catch (e) {
    console.error('Error fetching TVL data', e);
  }

  return {};
}

export default async function getPoolTvlChartData(
  poolAddress: string,
  startingEpoch: number,
  numDatesFromStart: number,
): Promise<{
  currentPoolTvl?: number;
  poolTvlData: ReturnType<typeof getFormattedDataForBasicChart>;
}> {
  const subgraphUrls = VANCHORS_MAP[poolAddress].supportedSubgraphs;

  const [currentPoolTvl, poolTvlData] = await Promise.all([
    getTvlByVAnchor(poolAddress, subgraphUrls),
    getVAnchorTvlDataByDateRange(
      poolAddress,
      startingEpoch,
      numDatesFromStart,
      subgraphUrls,
    ),
  ] as const);

  return {
    currentPoolTvl,
    poolTvlData: getFormattedDataForBasicChart(poolTvlData),
  };
}
