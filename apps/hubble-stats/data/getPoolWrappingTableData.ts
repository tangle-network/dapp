import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { PoolWrappingDataType } from '../components/PoolWrappingTable/types';
import { ACTIVE_CHAINS, VANCHORS_MAP, LIVE_SUBGRAPH_MAP } from '../constants';
import { getAggregateValue } from '../utils';

export type PoolWrappingTableDataType = {
  typedChainIds: number[];
  twlData: PoolWrappingDataType[];
  wrappingFeesData: PoolWrappingDataType[];
};

export default async function getPoolWrappingTableData(
  poolAddress: string
): Promise<PoolWrappingTableDataType> {
  const { fungibleTokenSymbol, composition } = VANCHORS_MAP[poolAddress];

  // TWL
  const twlChainsData = {} as Record<number, number | undefined>;
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
    twlChainsData[typedChainId] = tvlByVAnchorByChain;
  }
  const twlAggregate = getAggregateValue(twlChainsData);
  const twlTokenData = composition.map((token) => {
    return {
      symbol: token,
      compositionPercentage: 50,
      aggregate: twlAggregate,
      chainsData: twlChainsData,
    };
  });

  // WRAPPING FEES
  const wrappingFeesChainsData = {} as Record<number, number | undefined>;
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
    wrappingFeesChainsData[typedChainId] = tvlByVAnchorByChain;
  }
  const wrappingFeesAggregate = getAggregateValue(wrappingFeesChainsData);
  const wrappingFeesTokenData = composition.map((token) => {
    return {
      symbol: token,
      compositionPercentage: 50,
      aggregate: wrappingFeesAggregate,
      chainsData: wrappingFeesChainsData,
    };
  });

  return {
    twlData: [
      {
        symbol: fungibleTokenSymbol,
        aggregate: twlAggregate,
        chainsData: twlChainsData,
        tokens: twlTokenData,
      },
    ],
    wrappingFeesData: [
      {
        symbol: fungibleTokenSymbol,
        aggregate: wrappingFeesAggregate,
        chainsData: wrappingFeesChainsData,
        tokens: wrappingFeesTokenData,
      },
    ],
    typedChainIds: ACTIVE_CHAINS,
  };
}
