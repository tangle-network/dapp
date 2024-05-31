import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { VANCHORS_MAP, ACTIVE_SUBGRAPH_MAP } from '../../constants';
import { getAggregateValue } from '../../utils';

export default async function getPoolTwlTableData(
  poolAddress: string,
  availableTypedChainIds: number[],
) {
  const {
    fungibleTokenSymbol,
    composition,
    nativeTokenByChain,
    wrappableTokensByChain,
  } = VANCHORS_MAP[poolAddress];

  const twlChainsData = {} as Record<number, number | undefined>;
  for (const typedChainId of availableTypedChainIds) {
    let twlByVAnchorByChain: number | undefined;
    try {
      const twlData = await vAnchorClient.TWL.GetVAnchorTWLByChain(
        ACTIVE_SUBGRAPH_MAP[typedChainId],
        poolAddress,
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
      for (const typedChainId of availableTypedChainIds) {
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
              ACTIVE_SUBGRAPH_MAP[typedChainId],
              poolAddress,
              // query for native token needs to convert to ETH
              token === nativeTokenByChain[typedChainId] ? 'ETH' : token,
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
    }),
  );

  return [
    {
      symbol: fungibleTokenSymbol,
      aggregate: twlAggregate,
      chainsData: twlChainsData,
      tokens: twlTokensData,
    },
  ];
}
