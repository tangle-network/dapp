import { useEffect, useMemo, useState } from 'react';
import { useStatsContext } from '../../provider/stats-provider';
import { Loadable } from '../../provider/hooks/types';

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

  const [bestBlock, setBestBlock] = useState<any>();
  const [finalizedBlock, setFinalizedBlock] = useState<any>();

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
      isLoading: true,
      isFailed: true,
      error: undefined,
    };
  }, [bestBlock, finalizedBlock]);

  useEffect(() => {
    subscribeToNewHeads();
    subscribeToFinalizedHeads();
  });

  const subscribeToNewHeads = async () => {
    if (api) {
      await api.rpc.chain.subscribeNewHeads((lastHeader) => {
        setBestBlock(lastHeader.number);
      });
    }
  };

  const subscribeToFinalizedHeads = async () => {
    if (api) {
      await api.rpc.chain.subscribeFinalizedHeads((lastHeader) => {
        setFinalizedBlock(lastHeader.number);
      });
    }
  };

  return value;
}
