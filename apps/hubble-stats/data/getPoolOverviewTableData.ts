import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { PoolOverviewDataType } from '../components/PoolOverviewTable/types';
import { ACTIVE_CHAINS, VANCHORS_MAP, LIVE_SUBGRAPH_MAP } from '../constants';
import { getAggregateValue } from '../utils';

export type PoolOverviewTableDataType = {
  typedChainIds: number[];
  deposit24hData: PoolOverviewDataType[];
  withdrawal24hData: PoolOverviewDataType[];
  relayerEarningsData: PoolOverviewDataType[];
};

export default async function getPoolOverviewTableData(
  poolAddress: string
): Promise<PoolOverviewTableDataType> {
  const { fungibleTokenSymbol } = VANCHORS_MAP[poolAddress];

  // DEPOSIT 24H
  const deposit24hChainsData = {} as Record<number, number | undefined>;
  for (const typedChainId of ACTIVE_CHAINS) {
    let tvlByVAnchorByChain: number | undefined;
    try {
      const tvlData =
        await vAnchorClient.TotalValueLocked.GetVAnchorTotalValueLockedByChain(
          LIVE_SUBGRAPH_MAP[typedChainId],
          poolAddress
        );

      tvlByVAnchorByChain = +formatEther(BigInt(tvlData.totalValueLocked ?? 0));
    } catch (error) {
      tvlByVAnchorByChain = undefined;
    }
    deposit24hChainsData[typedChainId] = tvlByVAnchorByChain;
  }
  const deposit24hAggregate = getAggregateValue(deposit24hChainsData);

  // WITHDRAWAL 24H
  const withdrawal24hChainsData = {} as Record<number, number | undefined>;
  for (const typedChainId of ACTIVE_CHAINS) {
    let tvlByVAnchorByChain: number | undefined;
    try {
      const tvlData =
        await vAnchorClient.TotalValueLocked.GetVAnchorTotalValueLockedByChain(
          LIVE_SUBGRAPH_MAP[typedChainId],
          poolAddress
        );

      tvlByVAnchorByChain = +formatEther(BigInt(tvlData.totalValueLocked ?? 0));
    } catch (error) {
      tvlByVAnchorByChain = undefined;
    }
    withdrawal24hChainsData[typedChainId] = tvlByVAnchorByChain;
  }
  const withdrawal24hAggregate = getAggregateValue(withdrawal24hChainsData);

  // RELAYER EARNINGS
  const relayerEarningsChainsData = {} as Record<number, number | undefined>;
  for (const typedChainId of ACTIVE_CHAINS) {
    let relayerEarningsByVAnchorByChain: number | undefined;
    try {
      const relayerEarningsData =
        await vAnchorClient.RelayerFee.GetVAnchorTotalRelayerFeeByChain(
          LIVE_SUBGRAPH_MAP[typedChainId],
          poolAddress
        );
      relayerEarningsByVAnchorByChain = +formatEther(
        BigInt(relayerEarningsData.totalRelayerFee ?? 0)
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
