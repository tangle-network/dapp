import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { VANCHORS_MAP, ACTIVE_SUBGRAPH_MAP } from '../../constants';
import { getAggregateValue } from '../../utils';

export default async function getPoolWrappingFeesTableData(
  poolAddress: string,
  availableTypedChainIds: number[],
) {
  const {
    fungibleTokenSymbol,
    composition,
    nativeTokenByChain,
    wrappableTokensByChain,
  } = VANCHORS_MAP[poolAddress];

  const wrappingFeesChainsData = {} as Record<number, number | undefined>;
  for (const typedChainId of availableTypedChainIds) {
    let wrappingFeesByVAnchorByChain: number | undefined;
    try {
      const wrappingFeesData =
        await vAnchorClient.WrappingFee.GetVAnchorWrappingFeeByChain(
          ACTIVE_SUBGRAPH_MAP[typedChainId],
          poolAddress,
        );

      wrappingFeesByVAnchorByChain = +formatEther(
        BigInt(wrappingFeesData.wrappingFee ?? 0),
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
      for (const typedChainId of availableTypedChainIds) {
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
              ACTIVE_SUBGRAPH_MAP[typedChainId],
              poolAddress,
              // query for native token needs to convert to ETH
              token === nativeTokenByChain[typedChainId] ? 'ETH' : token,
            );

          wrappingFeesByVAnchorByChain = +formatEther(
            BigInt(wrappingFeesData.wrappingFee ?? 0),
          );
        } catch (error) {
          wrappingFeesByVAnchorByChain = undefined;
        }
        wrappingFeesTokenChainsData[typedChainId] =
          wrappingFeesByVAnchorByChain;
      }
      const wrappingFeesTokenAggregate = getAggregateValue(
        wrappingFeesTokenChainsData,
      );
      const compositionPercentage =
        wrappingFeesAggregate && wrappingFeesTokenAggregate
          ? parseFloat(
              (
                (wrappingFeesTokenAggregate / wrappingFeesAggregate) *
                100
              ).toFixed(1),
            )
          : undefined;
      return {
        symbol: token,
        compositionPercentage,
        aggregate: wrappingFeesTokenAggregate,
        chainsData: wrappingFeesTokenChainsData,
      };
    }),
  );

  return [
    {
      symbol: fungibleTokenSymbol,
      aggregate: wrappingFeesAggregate,
      chainsData: wrappingFeesChainsData,
      tokens: wrappingFeesTokesData,
    },
  ];
}
