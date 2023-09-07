import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { ACTIVE_SUBGRAPH_URLS, VANCHORS_MAP } from '../constants';
import {
  getDateFromEpoch,
  getEpochDailyFromStart,
  getEpochStart,
  getNumDatesFromStart,
  getValidDatesToQuery,
} from '../utils';

type VolumeDataType = {
  [epoch: string]: { deposit: number; withdrawal: number };
};

export type PoolOverviewChartsDataType = {
  currency?: string;
  tvl: number | undefined;
  deposit24h: number | undefined;
  relayerEarnings24h: number | undefined;
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
  const [dateNow, date24h] = getValidDatesToQuery();

  const vanchor = VANCHORS_MAP[poolAddress];
  const { fungibleTokenSymbol } = vanchor;

  // TVL
  let tvl: number | undefined;
  try {
    const tvlVAnchorByChainsData =
      await vAnchorClient.TotalValueLocked.GetVAnchorTotalValueLockedByChains(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress
      );

    tvl = tvlVAnchorByChainsData.reduce(
      (tvl, vAnchorByChain) =>
        tvl + +formatEther(BigInt(vAnchorByChain?.totalValueLocked ?? 0)),
      0
    );
  } catch {
    tvl = undefined;
  }

  // DEPOSIT 24H
  let deposit24h: number | undefined;
  try {
    const depositVAnchorByChainsData =
      await vAnchorClient.Deposit.GetVAnchorDepositByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress,
        date24h,
        dateNow
      );

    deposit24h = depositVAnchorByChainsData.reduce(
      (deposit, vAnchorsByChain) => {
        const depositVAnchorsByChain = vAnchorsByChain.reduce(
          (depositByChain, vAnchorDeposit) =>
            depositByChain + +formatEther(BigInt(vAnchorDeposit.deposit ?? 0)),
          0
        );
        return deposit + depositVAnchorsByChain;
      },
      0
    );
  } catch {
    deposit24h = undefined;
  }

  // RELAYER EARNINGS 24H
  let relayerEarnings24h: number | undefined;
  try {
    const relayerEarningsVAnchorByChainsData =
      await vAnchorClient.RelayerFee.GetVAnchorRelayerFeeByChains15MinsInterval(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress,
        date24h,
        dateNow
      );

    relayerEarnings24h = relayerEarningsVAnchorByChainsData.reduce(
      (relayerEarnings, vAnchorsByChain) => {
        const relayerEarningsVAnchorsByChain = vAnchorsByChain.reduce(
          (relayerEarningsByChain, vAnchorDeposit) =>
            relayerEarningsByChain +
            +formatEther(BigInt(vAnchorDeposit.profit ?? 0)),
          0
        );
        return relayerEarnings + relayerEarningsVAnchorsByChain;
      },
      0
    );
  } catch {
    relayerEarnings24h = undefined;
  }

  // TVL DATA
  let tvlData: { [epoch: string]: bigint } = {};
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
      await vAnchorClient.Deposit.GetVAnchorDepositByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress,
        startingEpoch,
        numDatesFromStart
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
      await vAnchorClient.Withdrawal.GetVAnchorWithdrawalByChainsByDateRange(
        ACTIVE_SUBGRAPH_URLS,
        poolAddress,
        startingEpoch,
        numDatesFromStart
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

  const volumeData: VolumeDataType = getEpochDailyFromStart().reduce(
    (volumeMap, epoch) => {
      volumeMap[epoch] = {
        deposit: depositData[epoch] ? +formatEther(depositData[epoch]) : 0,
        withdrawal: withdrawalData[epoch]
          ? +formatEther(withdrawalData[epoch])
          : 0,
      };
      return volumeMap;
    },
    {} as VolumeDataType
  );

  let relayerEarningsData: { [epoch: string]: bigint } = {};
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
          if (!relayerEarningsMap[epoch]) relayerEarningsMap[epoch] = BigInt(0);
          relayerEarningsMap[epoch] += BigInt(
            relayerEarningsByChain[epoch].profit
          );
        });
        return relayerEarningsMap;
      },
      {} as { [epoch: string]: bigint }
    );
  } catch (e) {
    relayerEarningsData = {};
  }

  return {
    currency: fungibleTokenSymbol,
    tvl,
    deposit24h,
    relayerEarnings24h,
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
      };
    }),
    relayerEarningsData: Object.keys(relayerEarningsData).map((epoch) => {
      return {
        date: JSON.parse(JSON.stringify(getDateFromEpoch(+epoch))),
        value: +formatEther(relayerEarningsData[+epoch]),
      };
    }),
  };
}
