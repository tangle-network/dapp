import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import { getApiPromise } from '@tangle-network/tangle-shared-ui/utils/polkadot/api';
import { useQuery } from '@tanstack/react-query';
import { LATEST_FINALIZED_BLOCK_QUERY_KEY } from '../constants/query';
import { Network } from '../types';
import { getRpcEndpoint } from '../utils/getRpcEndpoint';

type UseLatestFinalizedBlockResult<TNetwork extends Network> =
  TNetwork extends 'all'
    ? {
        mainnetBlock: number;
        testnetBlock: number;
      }
    : TNetwork extends NetworkType.Testnet
      ? {
          mainnetBlock: never;
          testnetBlock: number;
        }
      : TNetwork extends NetworkType.Mainnet
        ? {
            mainnetBlock: number;
            testnetBlock: never;
          }
        : never;

const fetcher = async <TNetwork extends Network>(
  network: TNetwork,
): Promise<UseLatestFinalizedBlockResult<TNetwork>> => {
  const { testnetRpc, mainnetRpc } = getRpcEndpoint(network);

  const getBlockNumber = async (rpc: string) => {
    const api = await getApiPromise(rpc);
    // no blockHash is specified, so we retrieve the latest
    const { block } = await api.rpc.chain.getBlock();

    return block.header.number.toNumber();
  };

  const [testnetBlock, mainnetBlock] = await Promise.all([
    testnetRpc ? getBlockNumber(testnetRpc) : null,
    mainnetRpc ? getBlockNumber(mainnetRpc) : null,
  ]);

  return {
    testnetBlock,
    mainnetBlock,
  } as UseLatestFinalizedBlockResult<TNetwork>;
};

export function useLatestFinalizedBlock<TNetwork extends Network>(
  network: TNetwork,
) {
  return useQuery({
    queryKey: [LATEST_FINALIZED_BLOCK_QUERY_KEY, network],
    queryFn: () => fetcher(network),
    staleTime: Infinity,
  });
}
