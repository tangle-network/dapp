import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import { VANCHORS_MAP, ACTIVE_SUBGRAPH_MAP } from '../../constants';
import {
  getAggregateValue,
  EPOCH_DAY_INTERVAL,
  getDateFromEpoch,
} from '../../utils';

export default async function getPoolDepositTableData(
  poolAddress: string,
  epochNow: number,
  availableTypedChainIds: number[]
) {
  const { fungibleTokenSymbol } = VANCHORS_MAP[poolAddress];

  const deposit24hChainsData = {} as Record<number, number | undefined>;
  for (const typedChainId of availableTypedChainIds) {
    let deposit24hByVAnchorByChain: number | undefined;
    try {
      const deposit24hData =
        await vAnchorClient.Deposit.GetVAnchorDepositByChain15MinsInterval(
          ACTIVE_SUBGRAPH_MAP[typedChainId],
          poolAddress,
          getDateFromEpoch(epochNow - EPOCH_DAY_INTERVAL),
          getDateFromEpoch(epochNow)
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

  return [
    {
      symbol: fungibleTokenSymbol,
      aggregate: deposit24hAggregate,
      chainsData: deposit24hChainsData,
    },
  ];
}
