import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { getTvl, getDeposit24h } from './reusable';
import { VANCHOR_ADDRESSES, ACTIVE_SUBGRAPH_URLS } from '../constants';
import {
  getEpochStart,
  getNumDatesFromStart,
  getFormattedDataForBasicChart,
  getFormattedDataForVolumeChart,
} from '../utils';

export type OverviewChartsDataType = {
  currentTvl: number | undefined;
  deposit24h: number | undefined;
  tvlData: {
    date: Date;
    value: number;
  }[];
  volumeData: {
    date: Date;
    deposit: number;
    withdrawal: number;
  }[];
};

export default async function getOverviewChartsData(): Promise<OverviewChartsDataType> {
  const startingEpoch = getEpochStart();
  const numDatesFromStart = getNumDatesFromStart();

  const currentTvl = await getTvl();
  const deposit24h = await getDeposit24h();

  let tvlData: { [epoch: string]: number } = {};
  try {
    const fetchedTvlData =
      await vAnchorClient.TotalValueLocked.GetVAnchorsTVLByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        startingEpoch,
        numDatesFromStart
      );

    tvlData = fetchedTvlData.reduce((tvlMap, tvlDataByChain) => {
      Object.keys(tvlDataByChain).forEach((epoch) => {
        if (!tvlMap[epoch]) tvlMap[epoch] = 0;
        tvlMap[epoch] += +formatEther(BigInt(tvlDataByChain[epoch]));
      });
      return tvlMap;
    }, {} as { [epoch: string]: number });
  } catch (e) {
    tvlData = {};
  }

  let depositData: { [epoch: string]: number } = {};
  try {
    const fetchedDepositData =
      await vAnchorClient.Deposit.GetVAnchorsDepositByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        startingEpoch,
        numDatesFromStart
      );

    depositData = fetchedDepositData.reduce(
      (depositMap, depositDataByChain) => {
        Object.keys(depositDataByChain).forEach((epoch: string) => {
          if (!depositMap[epoch]) depositMap[epoch] = 0;
          depositMap[epoch] += +formatEther(BigInt(depositDataByChain[epoch]));
        });
        return depositMap;
      },
      {} as { [epoch: string]: number }
    );
  } catch (e) {
    depositData = {};
  }

  let withdrawalData: { [epoch: string]: number } = {};
  try {
    const fetchedWithdrawalData =
      await vAnchorClient.Withdrawal.GetVAnchorsWithdrawalByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        startingEpoch,
        numDatesFromStart
      );

    withdrawalData = fetchedWithdrawalData.reduce(
      (withdrawalMap, withdrawalDataByChain) => {
        Object.keys(withdrawalDataByChain).forEach((epoch: string) => {
          if (!withdrawalMap[epoch]) withdrawalMap[epoch] = 0;
          withdrawalMap[epoch] += +formatEther(
            BigInt(withdrawalDataByChain[epoch])
          );
        });
        return withdrawalMap;
      },
      {} as { [epoch: string]: number }
    );
  } catch (e) {
    withdrawalData = {};
  }

  return {
    currentTvl,
    deposit24h,
    tvlData: getFormattedDataForBasicChart(tvlData),
    volumeData: getFormattedDataForVolumeChart(depositData, withdrawalData),
  };
}
