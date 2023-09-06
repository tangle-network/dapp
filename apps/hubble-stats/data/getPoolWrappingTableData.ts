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
  const {
    fungibleTokenSymbol,
    composition,
    nativeTokenByChain,
    wrappableTokensByChain,
  } = VANCHORS_MAP[poolAddress];

  // TWL
  const twlChainsData = {} as Record<number, number | undefined>;
  for (const typedChainId of ACTIVE_CHAINS) {
    let twlByVAnchorByChain: number | undefined;
    try {
      const twlData = await vAnchorClient.TWL.GetVAnchorTWLByChain(
        LIVE_SUBGRAPH_MAP[typedChainId],
        poolAddress
      );

      twlByVAnchorByChain = +formatEther(BigInt(twlData.total ?? 0));
    } catch (error) {
      twlByVAnchorByChain = undefined;
    }
    twlChainsData[typedChainId] = twlByVAnchorByChain;
  }
  const twlAggregate = getAggregateValue(twlChainsData);

  // TWL by tokens
  const twlTokensData = await Promise.all(
    composition.map(async (token) => {
      const twlTokenChainsData = {} as Record<number, number | undefined>;
      for (const typedChainId of ACTIVE_CHAINS) {
        let twlByVAnchorByChain: number | undefined;

        // if token is not supported in the chain, return undefined
        if (
          !wrappableTokensByChain[typedChainId].includes(token) &&
          token !== nativeTokenByChain[typedChainId]
        ) {
          twlByVAnchorByChain = undefined;
          continue;
        }

        try {
          const twlData =
            await vAnchorClient.TWL.GetVAnchorTWLByChainAndByToken(
              LIVE_SUBGRAPH_MAP[typedChainId],
              poolAddress,
              // query for native token needs to convert to ETH
              token === nativeTokenByChain[typedChainId] ? 'ETH' : token
            );
          twlByVAnchorByChain = +formatEther(BigInt(twlData.total ?? 0));
        } catch (error) {
          twlByVAnchorByChain = undefined;
        }
        twlTokenChainsData[typedChainId] = twlByVAnchorByChain;
      }
      const twlTokenAggregate = getAggregateValue(twlTokenChainsData);
      const compositionPercentage =
        twlAggregate && twlTokenAggregate
          ? parseFloat(((twlTokenAggregate / twlAggregate) * 100).toFixed(1))
          : undefined;
      return {
        symbol: token,
        compositionPercentage,
        aggregate: twlTokenAggregate,
        chainsData: twlTokenChainsData,
      };
    })
  );

  // WRAPPING FEES
  const wrappingFeesChainsData = {} as Record<number, number | undefined>;
  for (const typedChainId of ACTIVE_CHAINS) {
    let wrappingFeesByVAnchorByChain: number | undefined;
    try {
      const wrappingFeesData =
        await vAnchorClient.WrappingFee.GetVAnchorWrappingFeeByChain(
          LIVE_SUBGRAPH_MAP[typedChainId],
          poolAddress
        );

      wrappingFeesByVAnchorByChain = +formatEther(
        BigInt(wrappingFeesData.wrappingFee ?? 0)
      );
    } catch (error) {
      wrappingFeesByVAnchorByChain = undefined;
    }
    wrappingFeesChainsData[typedChainId] = wrappingFeesByVAnchorByChain;
  }
  const wrappingFeesAggregate = getAggregateValue(wrappingFeesChainsData);

  // WRAPPING FEES by tokens
  const wrappingFeesTokesData = await Promise.all(
    composition.map(async (token) => {
      const wrappingFeesTokenChainsData = {} as Record<
        number,
        number | undefined
      >;
      for (const typedChainId of ACTIVE_CHAINS) {
        let wrappingFeesByVAnchorByChain: number | undefined;

        // if token is not supported in the chain, return undefined
        if (
          !wrappableTokensByChain[typedChainId].includes(token) &&
          token !== nativeTokenByChain[typedChainId]
        ) {
          wrappingFeesByVAnchorByChain = undefined;
          continue;
        }

        try {
          const wrappingFeesData =
            await vAnchorClient.WrappingFee.GetVAnchorWrappingFeeByChainAndByToken(
              LIVE_SUBGRAPH_MAP[typedChainId],
              poolAddress,
              // query for native token needs to convert to ETH
              token === nativeTokenByChain[typedChainId] ? 'ETH' : token
            );

          wrappingFeesByVAnchorByChain = +formatEther(
            BigInt(wrappingFeesData.wrappingFee ?? 0)
          );
        } catch (error) {
          wrappingFeesByVAnchorByChain = undefined;
        }
        wrappingFeesTokenChainsData[typedChainId] =
          wrappingFeesByVAnchorByChain;
      }
      const wrappingFeesTokenAggregate = getAggregateValue(
        wrappingFeesTokenChainsData
      );
      const compositionPercentage =
        wrappingFeesAggregate && wrappingFeesTokenAggregate
          ? parseFloat(
              (
                (wrappingFeesTokenAggregate / wrappingFeesAggregate) *
                100
              ).toFixed(1)
            )
          : undefined;
      return {
        symbol: token,
        compositionPercentage,
        aggregate: wrappingFeesTokenAggregate,
        chainsData: wrappingFeesTokenChainsData,
      };
    })
  );

  return {
    twlData: [
      {
        symbol: fungibleTokenSymbol,
        aggregate: twlAggregate,
        chainsData: twlChainsData,
        tokens: twlTokensData,
      },
    ],
    wrappingFeesData: [
      {
        symbol: fungibleTokenSymbol,
        aggregate: wrappingFeesAggregate,
        chainsData: wrappingFeesChainsData,
        tokens: wrappingFeesTokesData,
      },
    ],
    typedChainIds: ACTIVE_CHAINS,
  };
}
