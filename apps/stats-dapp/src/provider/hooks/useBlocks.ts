import { useEffect, useMemo, useState } from 'react';
import { useStatsContext } from '../../provider/stats-provider';
import { Loadable } from '../../provider/hooks/types';
import type { BlockNumber, Header } from '@polkadot/types/interfaces/runtime';

/**
 *
 * Best and finalized block numbers
 * @param best - Latest best block number
 * @param finalized - Latest finalized block number
 *
 * */
type BlocksValue = {
  best: number;
  finalized: number;
};

type LatestBlocksValue = Loadable<BlocksValue>;

/**
 *  Get Best and finalized block numbers
 * */
export function useBlocks(): LatestBlocksValue {
  const { api } = useStatsContext();

  const [bestBlock, setBestBlock] = useState<number>();
  const [finalizedBlock, setFinalizedBlock] = useState<number>();

  const value = useMemo(() => {
    if (!bestBlock || !finalizedBlock) {
      return {
        val: null,
        isLoading: true,
        isFailed: true,
        error: undefined,
      };
    }

    return {
      val: {
        best: bestBlock,
        finalized: finalizedBlock,
      },
      isLoading: false,
      isFailed: false,
      error: undefined,
    };
  }, [bestBlock, finalizedBlock]);

  useEffect(() => {
    if (api) {
      // Array of subscriptions
      const subscriptions: Array<() => void> = [];

      // Handler for listenting to new/best headers
      const handler = async (): Promise<Array<() => void>> => {
        const unsubscribeNewHeads = await api.rpc.chain.subscribeNewHeads(
          (lastHeader) => setBestBlock(Number(lastHeader.number))
        );

        const unsubscribeFinalizedHeads =
          await api.rpc.chain.subscribeFinalizedHeads((finalizedHeader) =>
            setFinalizedBlock(Number(finalizedHeader.number))
          );

        return [unsubscribeNewHeads, unsubscribeFinalizedHeads];
      };

      handler().then((cleanup) => {
        subscriptions.push(...cleanup);
      });

      return () => {
        subscriptions.forEach((unsubscribe) => unsubscribe());
      };
    }
  }, [api, setBestBlock, setFinalizedBlock]);

  return value;
}
