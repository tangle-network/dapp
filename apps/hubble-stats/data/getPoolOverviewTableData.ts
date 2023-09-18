import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { PoolOverviewDataType } from '../components/PoolOverviewTable/types';
import { ACTIVE_CHAINS, VANCHORS_MAP, ACTIVE_SUBGRAPH_MAP } from '../constants';
import { getAggregateValue, getValidDatesToQuery } from '../utils';

export type PoolOverviewTableDataType = {
  typedChainIds: number[];
  deposit24hData: PoolOverviewDataType[];
  withdrawal24hData: PoolOverviewDataType[];
  relayerEarningsData: PoolOverviewDataType[];
};

export default async function getPoolOverviewTableData(
  poolAddress: string
): Promise<PoolOverviewTableDataType> {
  const [dateNow, date24h] = getValidDatesToQuery();

  const { fungibleTokenSymbol } = VANCHORS_MAP[poolAddress];

  // DEPOSIT 24H
  const deposit24hChainsData = {} as Record<number, number | undefined>;
  for (const typedChainId of ACTIVE_CHAINS) {
    let deposit24hByVAnchorByChain: number | undefined;
    try {
      const deposit24hData =
        await vAnchorClient.Deposit.GetVAnchorDepositByChain15MinsInterval(
          ACTIVE_SUBGRAPH_MAP[typedChainId],
          poolAddress,
          date24h,
          dateNow
        );

      deposit24hByVAnchorByChain = deposit24hData.reduce((deposit, item) => {
        return deposit + +formatEther(BigInt(item.deposit ?? 0));
      }, 0);
    } catch (error) {
      deposit24hByVAnchorByChain = undefined;
    }
    deposit24hChainsData[typedChainId] = deposit24hByVAnchorByChain;
  }
  const deposit24hAggregate = getAggregateValue(deposit24hChainsData);

  // WITHDRAWAL 24H
  const withdrawal24hChainsData = {} as Record<number, number | undefined>;
  for (const typedChainId of ACTIVE_CHAINS) {
    let withdrawal24hByVAnchorByChain: number | undefined;
    try {
      const withdrawal24hData =
        await vAnchorClient.Withdrawal.GetVAnchorWithdrawalByChain15MinsInterval(
          ACTIVE_SUBGRAPH_MAP[typedChainId],
          poolAddress,
          date24h,
          dateNow
        );

      withdrawal24hByVAnchorByChain = withdrawal24hData.reduce(
        (withdrawal, item) => {
          return withdrawal + +formatEther(BigInt(item.withdrawal ?? 0));
        },
        0
      );
    } catch (error) {
      withdrawal24hByVAnchorByChain = undefined;
    }
    withdrawal24hChainsData[typedChainId] = withdrawal24hByVAnchorByChain;
  }
  const withdrawal24hAggregate = getAggregateValue(withdrawal24hChainsData);

  // RELAYER EARNINGS
  const relayerEarningsChainsData = {} as Record<number, number | undefined>;
  for (const typedChainId of ACTIVE_CHAINS) {
    let relayerEarningsByVAnchorByChain: number | undefined;
    try {
      const relayerEarningsData =
        await vAnchorClient.RelayerFee.GetVAnchorRelayerFeeByChain(
          ACTIVE_SUBGRAPH_MAP[typedChainId],
          poolAddress
        );
      relayerEarningsByVAnchorByChain = +formatEther(
        BigInt(relayerEarningsData.profit ?? 0)
      );
    } catch (error) {
      relayerEarningsByVAnchorByChain = undefined;
    }
    relayerEarningsChainsData[typedChainId] = relayerEarningsByVAnchorByChain;
  }
  const relayerEarningsAggregate = getAggregateValue(relayerEarningsChainsData);

  return {
    deposit24hData: [
      {
        symbol: fungibleTokenSymbol,
        aggregate: deposit24hAggregate,
        chainsData: deposit24hChainsData,
      },
    ],
    withdrawal24hData: [
      {
        symbol: fungibleTokenSymbol,
        aggregate: withdrawal24hAggregate,
        chainsData: withdrawal24hChainsData,
      },
    ],
    relayerEarningsData: [
      {
        symbol: fungibleTokenSymbol,
        aggregate: relayerEarningsAggregate,
        chainsData: relayerEarningsChainsData,
      },
    ],
    typedChainIds: ACTIVE_CHAINS,
  };
}
