import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';

import {
  VANCHORS_MAP,
  ACTIVE_SUBGRAPH_MAP,
  ACTIVE_SUBGRAPH_URLS,
} from '../constants';
import { getTimePassedByEpoch } from '../utils';
import { PoolTransactionType } from '../components/PoolTransactionsTable/types';

const TRANSACTIONS_LIMIT = 100;

export type PoolTransactionDataType = {
  transactions: PoolTransactionType[];
};

export default async function getPoolTransactionsData(
  poolAddress: string
): Promise<PoolTransactionDataType> {
  const { nativeTokenByChain } = VANCHORS_MAP[poolAddress];

  const subgraphByTypedChainIdMap = Object.keys(ACTIVE_SUBGRAPH_MAP).reduce(
    (map, typedChainId) => {
      map[ACTIVE_SUBGRAPH_MAP[+typedChainId]] = +typedChainId;
      return map;
    },
    {} as Record<string, number>
  );

  const fetchedTransactions =
    await vAnchorClient.Transaction.GetVAnchorTransactionsByChains(
      ACTIVE_SUBGRAPH_URLS,
      poolAddress,
      TRANSACTIONS_LIMIT
    );

  const transactions: PoolTransactionType[] = fetchedTransactions.map((tx) => {
    const amount = +formatEther(BigInt(tx.amount));
    const activity =
      amount > 0 ? 'deposit' : amount < 0 ? 'withdraw' : 'transfer';

    const sourceTypedChainId = subgraphByTypedChainIdMap[tx.subgraphUrl];
    // check for native token
    const tokenSymbol =
      BigInt(tx.tokenAddress) === BigInt(0)
        ? nativeTokenByChain[sourceTypedChainId]
        : tx.tokenSymbol;

    return {
      txHash: tx.txHash,
      activity,
      tokenAmount: Math.abs(amount),
      tokenSymbol,
      sourceTypedChainId,
      destinationTypedChainId: undefined,
      time: getTimePassedByEpoch(tx.timestamp),
    };
  });

  return {
    transactions,
  };
}
