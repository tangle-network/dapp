import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { getTvl, getVolume24h } from './reusable';
import {
  VANCHOR_ADDRESSES,
  ACTIVE_SUBGRAPH_URLS,
  STARTING_EPOCH,
  NUM_DATES_FROM_START,
  DATE_START,
} from '../constants';
import { getDateFromEpoch, getEpochArray } from '../utils';

type VolumeDataType = {
  [epoch: string]: { deposit: number; withdrawal: number };
};

export type OverviewChartsDataType = {
  currentTvl: number | undefined;
  currentVolume: number | undefined;
  tvlData: {
    date: Date;
    value: number;
  }[];
  volumeData: {
    date: Date;
    deposit: number;
    withdrawal: number;
    volume: number;
  }[];
};

export default async function getOverviewChartsData(): Promise<OverviewChartsDataType> {
  const currentTvl = await getTvl();
  const volume24h = await getVolume24h();

  let tvlData: { [epoch: string]: bigint } = {};
  try {
    const fetchedTvlData =
      await vAnchorClient.TotalValueLocked.GetVAnchorsTVLByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        STARTING_EPOCH,
        NUM_DATES_FROM_START
      );

    tvlData = fetchedTvlData.reduce((tvlMap, tvlDataByChain) => {
      Object.keys(tvlDataByChain).forEach((epoch) => {
        if (!tvlMap[epoch]) tvlMap[epoch] = BigInt(0);
        tvlMap[epoch] += BigInt(tvlDataByChain[epoch]);
      });
      return tvlMap;
    }, {});
  } catch (e) {
    tvlData = {};
  }

  let depositData: { [epoch: string]: bigint } = {};
  try {
    const fetchedDepositData =
      await vAnchorClient.Deposit.GetVAnchorsDepositByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        STARTING_EPOCH,
        NUM_DATES_FROM_START
      );

    depositData = fetchedDepositData.reduce(
      (depositMap, depositDataByChain) => {
        Object.keys(depositDataByChain).forEach((epoch: string) => {
          if (!depositMap[epoch]) depositMap[epoch] = BigInt(0);
          depositMap[epoch] += BigInt(depositDataByChain[epoch]);
        });
        return depositMap;
      },
      {}
    );
  } catch (e) {
    depositData = {};
  }

  let withdrawalData: { [epoch: string]: bigint } = {};
  try {
    const fetchedWithdrawalData =
      await vAnchorClient.Withdrawal.GetVAnchorsWithdrawalByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        VANCHOR_ADDRESSES,
        STARTING_EPOCH,
        NUM_DATES_FROM_START
      );

    withdrawalData = fetchedWithdrawalData.reduce(
      (withdrawalMap, withdrawalDataByChain) => {
        Object.keys(withdrawalDataByChain).forEach((epoch: string) => {
          if (!withdrawalMap[epoch]) withdrawalMap[epoch] = BigInt(0);
          withdrawalMap[epoch] += BigInt(withdrawalDataByChain[epoch]);
        });
        return withdrawalMap;
      },
      {}
    );
  } catch (e) {
    withdrawalData = {};
  }

  const volumeData: VolumeDataType = getEpochArray(
    STARTING_EPOCH,
    NUM_DATES_FROM_START
  ).reduce((volumeMap, epoch) => {
    volumeMap[epoch] = {
      deposit: depositData[epoch] ? +formatEther(depositData[epoch]) : 0,
      withdrawal: withdrawalData[epoch]
        ? +formatEther(withdrawalData[epoch])
        : 0,
    };
    return volumeMap;
  }, {} as VolumeDataType);

  return {
    currentTvl,
    currentVolume: volume24h,
    tvlData: Object.keys(tvlData).map((epoch) => {
      return {
        date: JSON.parse(JSON.stringify(getDateFromEpoch(+epoch))),
        value: +formatEther(tvlData[+epoch]),
      };
    }),
    volumeData: Object.keys(volumeData).map((epoch) => {
      return {
        date: JSON.parse(JSON.stringify(getDateFromEpoch(+epoch))),
        deposit: volumeData[+epoch].deposit,
        withdrawal: volumeData[+epoch].withdrawal,
        volume: volumeData[+epoch].deposit + volumeData[+epoch].withdrawal,
      };
    }),
  };
}
