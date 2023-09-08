import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { getTvlByVAnchor, getDeposit24hByVAnchor } from './reusable';
import { ACTIVE_SUBGRAPH_URLS, VANCHORS_MAP } from '../constants';
import {
  getEpochStart,
  getNumDatesFromStart,
  getFormattedDataForBasicChart,
  getFormattedDataForVolumeChart,
} from '../utils';

export type PoolOverviewChartsDataType = {
  currency?: string;
  tvl: number | undefined;
  deposit24h: number | undefined;
  relayerEarnings: number | undefined;
  tvlData: {
    date: Date;
    value: number;
  }[];
  volumeData: {
    date: Date;
    deposit: number;
    withdrawal: number;
  }[];
  relayerEarningsData: {
    date: Date;
    value: number;
  }[];
};

export default async function getPoolOverviewChartsData(
  poolAddress: string
): Promise<PoolOverviewChartsDataType> {
  const startingEpoch = getEpochStart();
  const numDatesFromStart = getNumDatesFromStart();

  const vanchor = VANCHORS_MAP[poolAddress];
  const { fungibleTokenSymbol } = vanchor;

  const tvl = await getTvlByVAnchor(poolAddress);
  const deposit24h = await getDeposit24hByVAnchor(poolAddress);

  // RELAYER EARNINGS 24H
  let relayerEarnings: number | undefined;
  try {
    const fetchedRelayerEarningsData =
      await vAnchorClient.RelayerFee.GetVAnchorRelayerFeeByChains(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress
      );

    relayerEarnings = fetchedRelayerEarningsData.reduce(
      (total, relayerFeeByChain) => {
        return total + +formatEther(BigInt(relayerFeeByChain.profit ?? 0));
      },
      0
    );
  } catch {
    relayerEarnings = undefined;
  }

  // TVL DATA
  let tvlData: { [epoch: string]: number } = {};
  try {
    const fetchedTvlData =
      await vAnchorClient.TotalValueLocked.GetVAnchorTVLByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress,
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

  // DEPOSIT DATA
  let depositData: { [epoch: string]: number } = {};
  try {
    const fetchedDepositData =
      await vAnchorClient.Deposit.GetVAnchorDepositByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress,
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

  // WITHDRAWAL DATA
  let withdrawalData: { [epoch: string]: number } = {};
  try {
    const fetchedWithdrawalData =
      await vAnchorClient.Withdrawal.GetVAnchorWithdrawalByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress,
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

  let relayerEarningsData: { [epoch: string]: number } = {};
  try {
    const fetchedRelayerFeesData =
      await vAnchorClient.RelayerFee.GetVAnchorRelayerFeeByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress,
        startingEpoch,
        numDatesFromStart
      );

    relayerEarningsData = fetchedRelayerFeesData.reduce(
      (relayerEarningsMap, relayerEarningsByChain) => {
        Object.keys(relayerEarningsByChain).forEach((epoch) => {
          if (!relayerEarningsMap[epoch]) relayerEarningsMap[epoch] = 0;
          relayerEarningsMap[epoch] += +formatEther(
            BigInt(relayerEarningsByChain[epoch].profit)
          );
        });
        return relayerEarningsMap;
      },
      {} as { [epoch: string]: number }
    );
  } catch (e) {
    relayerEarningsData = {};
  }

  return {
    currency: fungibleTokenSymbol,
    tvl,
    deposit24h,
    relayerEarnings,
    tvlData: getFormattedDataForBasicChart(tvlData),
    volumeData: getFormattedDataForVolumeChart(depositData, withdrawalData),
    relayerEarningsData: getFormattedDataForBasicChart(relayerEarningsData),
  };
}
