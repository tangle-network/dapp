import vAnchorClient from '@webb-tools/vanchor-client';
import { ACTIVE_SUBGRAPH_URLS, VANCHOR_ADDRESSES } from '../../constants';
import type { ChartDataRecord } from '../../types';
import { getFormattedDataForBasicChart, serializeEpochData } from '../../utils';
import { getTvl } from '../utils';

async function getTvlDataByDateRange(
  startingEpoch: number,
  numDatesFromStart: number,
): Promise<ChartDataRecord> {
  try {
    const fetchedTvlData =
      await vAnchorClient.TotalValueLocked.GetVAnchorsTVLByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        startingEpoch,
        numDatesFromStart,
      );

    return serializeEpochData(fetchedTvlData);
  } catch (e) {
    console.error('Error fetching TVL data', e);
  }

  return {};
}

export default async function getOverviewTvlChartData(
  startingEpoch: number,
  numDatesFromStart: number,
): Promise<{
  currentTvl?: number;
  tvlData: ReturnType<typeof getFormattedDataForBasicChart>;
}> {
  // Fetch current TVL and TVL data in parallel
  const [currentTvl, tvlData] = await Promise.all([
    getTvl(),
    getTvlDataByDateRange(startingEpoch, numDatesFromStart),
  ] as const);

  return {
    currentTvl,
    tvlData: getFormattedDataForBasicChart(tvlData),
  };
}
