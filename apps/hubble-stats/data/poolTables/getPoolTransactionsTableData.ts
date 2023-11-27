import { formatEther } from 'viem';
import vAnchorClient from '@webb-tools/vanchor-client';
import { getTimeDetailByEpoch } from '@webb-tools/webb-ui-components/utils';

import { VANCHORS_MAP, ACTIVE_SUBGRAPH_MAP } from '../../constants';
import { PoolTransactionType } from '../../components/PoolTransactionsTable/types';

const TRANSACTIONS_LIMIT = 100;

export default async function getPoolTransactionsTableData(
  poolAddress: string
): Promise<PoolTransactionType[]> {
  const { nativeTokenByChain, supportedSubgraphs } = VANCHORS_MAP[poolAddress];

  const subgraphByTypedChainIdMap = Object.keys(ACTIVE_SUBGRAPH_MAP).reduce(
    (map, typedChainId) => {
      map[ACTIVE_SUBGRAPH_MAP[+typedChainId]] = +typedChainId;
      return map;
    },
    {} as Record<string, number>
  );

  let transactions: PoolTransactionType[] = [];
  try {
    const fetchedTransactions =
      await vAnchorClient.Transaction.GetVAnchorTransactionsByChains(
        supportedSubgraphs,
        poolAddress,
        TRANSACTIONS_LIMIT
      );

    transactions = fetchedTransactions.map((tx) => {
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
        time: getTimeDetailByEpoch(tx.timestamp),
      };
    });
  } catch {
    transactions = [];
  }

  return transactions;
}
