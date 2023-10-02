import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { VANCHORS_MAP, ACTIVE_SUBGRAPH_MAP } from '../../constants';
import {
  getAggregateValue,
  EPOCH_DAY_INTERVAL,
  getDateFromEpoch,
} from '../../utils';

export default async function getPoolWithdrawalTableData(
  poolAddress: string,
  epochNow: number,
  availableTypedChainIds: number[]
) {
  const { fungibleTokenSymbol } = VANCHORS_MAP[poolAddress];

  const withdrawal24hChainsData = {} as Record<number, number | undefined>;
  for (const typedChainId of availableTypedChainIds) {
    let withdrawal24hByVAnchorByChain: number | undefined;
    try {
      const withdrawal24hData =
        await vAnchorClient.Withdrawal.GetVAnchorWithdrawalByChain15MinsInterval(
          ACTIVE_SUBGRAPH_MAP[typedChainId],
          poolAddress,
          getDateFromEpoch(epochNow - EPOCH_DAY_INTERVAL),
          getDateFromEpoch(epochNow)
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

  return [
    {
      symbol: fungibleTokenSymbol,
      aggregate: withdrawal24hAggregate,
      chainsData: withdrawal24hChainsData,
    },
  ];
}
