import vAnchorClient from '@webb-tools/vanchor-client';

import { VANCHORS_MAP } from '../../constants';
import type { ChartDataRecord, SubgraphUrlType } from '../../types';
import {
  getFormattedDataForVolumeChart,
  serializeEpochData,
  EPOCH_DAY_INTERVAL,
} from '../../utils';
import { getDepositInTimeRangeByVAnchor } from '../utils';

async function getVAnchorDepositDataByDateRange(
  vAnchorAddress: string,
  startingEpoch: number,
  numDatesFromStart: number,
  subgraphUrls: SubgraphUrlType[],
): Promise<ChartDataRecord> {
  try {
    const fetchedDepositData =
      await vAnchorClient.Deposit.GetVAnchorDepositByChainsByDateRange(
        subgraphUrls,
        vAnchorAddress,
        startingEpoch,
        numDatesFromStart,
      );

    return serializeEpochData(fetchedDepositData);
  } catch (e) {
    console.error('Error fetching deposit data', e);
  }
  return {};
}

async function getVAnchorWithdrawalDataByDateRange(
  vAnchorAddress: string,
  startingEpoch: number,
  numDatesFromStart: number,
  subgraphUrls: SubgraphUrlType[],
): Promise<ChartDataRecord> {
  try {
    const fetchedWithdrawalData =
      await vAnchorClient.Withdrawal.GetVAnchorWithdrawalByChainsByDateRange(
        subgraphUrls,
        vAnchorAddress,
        startingEpoch,
        numDatesFromStart,
      );

    return serializeEpochData(fetchedWithdrawalData);
  } catch (e) {
    console.error('Error fetching withdrawal data', e);
  }

  return {};
}

export default async function getPoolVolumeChartData(
  poolAddress: string,
  startingEpoch: number,
  epochNow: number,
  numDatesFromStart: number,
): Promise<{
  poolDeposit24h?: number;
  poolVolumeData: ReturnType<typeof getFormattedDataForVolumeChart>;
}> {
  const subgraphUrls = VANCHORS_MAP[poolAddress].supportedSubgraphs;

  const [poolDeposit24h, poolDepositData, poolWithdrawalData] =
    await Promise.all([
      getDepositInTimeRangeByVAnchor(
        poolAddress,
        epochNow - EPOCH_DAY_INTERVAL,
        epochNow,
        subgraphUrls,
      ),
      getVAnchorDepositDataByDateRange(
        poolAddress,
        startingEpoch,
        numDatesFromStart,
        subgraphUrls,
      ),
      getVAnchorWithdrawalDataByDateRange(
        poolAddress,
        startingEpoch,
        numDatesFromStart,
        subgraphUrls,
      ),
    ] as const);

  return {
    poolDeposit24h,
    poolVolumeData: getFormattedDataForVolumeChart(
      poolDepositData,
      poolWithdrawalData,
    ),
  };
}
