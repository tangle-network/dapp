import vAnchorClient from '@webb-tools/vanchor-client';

import { ACTIVE_SUBGRAPH_URLS } from '../../constants';
import type { ChartDataRecord } from '../../types';
import { getFormattedDataForBasicChart, serializeEpochData } from '../../utils';
import { getTvlByVAnchor } from '../utils';

async function getVAnchorTvlDataByDateRange(
  vAnchorAddress: string,
  startingEpoch: number,
  numDatesFromStart: number
): Promise<ChartDataRecord> {
  try {
    const fetchedTvlData =
      await vAnchorClient.TotalValueLocked.GetVAnchorTVLByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        vAnchorAddress,
        startingEpoch,
        numDatesFromStart
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
  numDatesFromStart: number
): Promise<{
  currentPoolTvl?: number;
  poolTvlData: ReturnType<typeof getFormattedDataForBasicChart>;
}> {
  const [currentPoolTvl, poolTvlData] = await Promise.all([
    getTvlByVAnchor(poolAddress),
    getVAnchorTvlDataByDateRange(poolAddress, startingEpoch, numDatesFromStart),
  ] as const);

  return {
    currentPoolTvl,
    poolTvlData: getFormattedDataForBasicChart(poolTvlData),
  };
}
