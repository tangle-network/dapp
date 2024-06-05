import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { VANCHORS_MAP, ACTIVE_SUBGRAPH_MAP } from '../../constants';
import { getAggregateValue } from '../../utils';

export default async function getPoolRelayerEarningsTableData(
  poolAddress: string,
  availableTypedChainIds: number[],
) {
  const { fungibleTokenSymbol } = VANCHORS_MAP[poolAddress];

  const relayerEarningsChainsData = {} as Record<number, number | undefined>;
  for (const typedChainId of availableTypedChainIds) {
    let relayerEarningsByVAnchorByChain: number | undefined;
    try {
      const relayerEarningsData =
        await vAnchorClient.RelayerFee.GetVAnchorRelayerFeeByChain(
          ACTIVE_SUBGRAPH_MAP[typedChainId],
          poolAddress,
        );
      relayerEarningsByVAnchorByChain = +formatEther(
        BigInt(relayerEarningsData.profit ?? 0),
      );
    } catch (error) {
      relayerEarningsByVAnchorByChain = undefined;
    }
    relayerEarningsChainsData[typedChainId] = relayerEarningsByVAnchorByChain;
  }
  const relayerEarningsAggregate = getAggregateValue(relayerEarningsChainsData);

  return [
    {
      symbol: fungibleTokenSymbol,
      aggregate: relayerEarningsAggregate,
      chainsData: relayerEarningsChainsData,
    },
  ];
}
