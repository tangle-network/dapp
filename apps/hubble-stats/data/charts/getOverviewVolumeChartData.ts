import vAnchorClient from '@webb-tools/vanchor-client';
import { ACTIVE_SUBGRAPH_URLS, VANCHOR_ADDRESSES } from '../../constants';
import type { ChartDataRecord } from '../../types';
import {
  getFormattedDataForVolumeChart,
  serializeEpochData,
  EPOCH_DAY_INTERVAL,
} from '../../utils';
import { getDepositInTimeRange } from '../utils';

async function getDepositDataByDateRange(
  startingEpoch: number,
  numDatesFromStart: number,
): Promise<ChartDataRecord> {
  try {
    const fetchedDepositData =
      await vAnchorClient.Deposit.GetVAnchorsDepositByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        startingEpoch,
        numDatesFromStart,
      );

    return serializeEpochData(fetchedDepositData);
  } catch (e) {
    console.error('Error fetching deposit data', e);
  }

  return {};
}

async function getWithdrawDataByDateRange(
  startingEpoch: number,
  numDatesFromStart: number,
): Promise<ChartDataRecord> {
  try {
    const fetchedWithdrawalData =
      await vAnchorClient.Withdrawal.GetVAnchorsWithdrawalByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        startingEpoch,
        numDatesFromStart,
      );

    return serializeEpochData(fetchedWithdrawalData);
  } catch (e) {
    console.error('Error fetching withdrawal data', e);
  }

  return {};
}

export default async function getOverviewVolumeChartData(
  startingEpoch: number,
  epochNow: number,
  numDatesFromStart: number,
): Promise<{
  deposit24h?: number;
  volumeData: ReturnType<typeof getFormattedDataForVolumeChart>;
}> {
  const [deposit24h, depositData, withdrawalData] = await Promise.all([
    getDepositInTimeRange(epochNow - EPOCH_DAY_INTERVAL, epochNow),
    getDepositDataByDateRange(startingEpoch, numDatesFromStart),
    getWithdrawDataByDateRange(startingEpoch, numDatesFromStart),
  ] as const);

  return {
    deposit24h,
    volumeData: getFormattedDataForVolumeChart(depositData, withdrawalData),
  };
}
