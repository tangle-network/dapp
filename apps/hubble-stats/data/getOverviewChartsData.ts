import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import {
  vAnchorAddresses,
  availableSubgraphUrls,
  startingEpoch,
  numOfDatesFromStart,
} from '../constants';
import { getDateFromEpoch, getEpochFromDate, getEpochArray } from '../utils';

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
  let currentTvl: number | undefined;
  try {
    const tvlVAnchorsByChainsData =
      await vAnchorClient.TotalValueLocked.GetVAnchorsTotalValueLockedByChains(
        availableSubgraphUrls,
        vAnchorAddresses
      );

    currentTvl = tvlVAnchorsByChainsData?.reduce(
      (tvlTotal, vAnchorsByChain) => {
        const tvlVAnchorsByChain = vAnchorsByChain.reduce(
          (tvlTotalByChain, vAnchor) =>
            tvlTotalByChain +
            +formatEther(BigInt(vAnchor.totalValueLocked ?? 0)),
          0
        );
        return tvlTotal + tvlVAnchorsByChain;
      },
      0
    );
  } catch {
    currentTvl = undefined;
  }

  let volume24h: number | undefined;
  try {
    const volumeVAnchorsByChainsData =
      await vAnchorClient.Volume.GetVAnchorsVolumeByChains15MinsInterval(
        availableSubgraphUrls,
        vAnchorAddresses,
        getDateFromEpoch(getEpochFromDate(new Date()) - 24 * 60 * 60),
        getDateFromEpoch(getEpochFromDate(new Date()))
      );

    volume24h = volumeVAnchorsByChainsData?.reduce(
      (volumeTotal, vAnchorsByChain) => {
        const depositVAnchorsByChain = vAnchorsByChain.reduce(
          (volumeTotalByChain, vAnchor) =>
            volumeTotalByChain + +formatEther(BigInt(vAnchor.volume ?? 0)),
          0
        );
        return volumeTotal + depositVAnchorsByChain;
      },
      0
    );
  } catch {
    volume24h = undefined;
  }

  let tvlData: { [epoch: string]: number } = {};
  try {
    const fetchedTvlData =
      await vAnchorClient.TotalValueLocked.GetVAnchorsTVLByChainsByDateRange(
        availableSubgraphUrls,
        vAnchorAddresses,
        getDateFromEpoch(startingEpoch),
        numOfDatesFromStart
      );

    tvlData = fetchedTvlData.reduce((tvlMap, tvlDataByChain) => {
      Object.keys(tvlDataByChain).forEach((epoch: string) => {
        if (!tvlMap[epoch]) tvlMap[epoch] = 0;
        tvlMap[epoch] += +formatEther(BigInt(tvlDataByChain[epoch]));
      });
      return tvlMap;
    }, {});
  } catch (e) {
    tvlData = {};
  }

  let depositData: { [epoch: string]: number } = {};
  try {
    const fetchedDepositData =
      await vAnchorClient.Deposit.GetVAnchorsDepositByChainsByDateRange(
        availableSubgraphUrls,
        vAnchorAddresses,
        getDateFromEpoch(startingEpoch),
        numOfDatesFromStart
      );

    depositData = fetchedDepositData.reduce(
      (depositMap, depositDataByChain) => {
        Object.keys(depositDataByChain).forEach((epoch: string) => {
          if (!depositMap[epoch]) depositMap[epoch] = 0;
          depositMap[epoch] += +formatEther(BigInt(depositDataByChain[epoch]));
        });
        return depositMap;
      },
      {}
    );
  } catch (e) {
    depositData = {};
  }

  let withdrawalData: { [epoch: string]: number } = {};
  try {
    const fetchedWithdrawalData =
      await vAnchorClient.Withdrawal.GetVAnchorsWithdrawalByChainsByDateRange(
        availableSubgraphUrls,
        vAnchorAddresses,
        getDateFromEpoch(startingEpoch),
        numOfDatesFromStart
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
      {}
    );
  } catch (e) {
    withdrawalData = {};
  }

  const volumeData: VolumeDataType = getEpochArray(
    startingEpoch,
    numOfDatesFromStart
  ).reduce((volumeMap, epoch) => {
    volumeMap[epoch] = {
      deposit: depositData[epoch] ?? 0,
      withdrawal: 0.01,
    };
    return volumeMap;
  }, {} as VolumeDataType);

  return {
    currentTvl,
    currentVolume: volume24h,
    tvlData: Object.keys(tvlData).map((epoch) => {
      return {
        date: JSON.parse(JSON.stringify(getDateFromEpoch(+epoch))),
        value: tvlData[+epoch],
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
