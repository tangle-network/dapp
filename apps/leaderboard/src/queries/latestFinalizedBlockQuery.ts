import { Option } from '@polkadot/types';
import { Moment } from '@polkadot/types/interfaces';
import {
  TANGLE_MAINNET_WS_RPC_ENDPOINT,
  TANGLE_TESTNET_WS_RPC_ENDPOINT,
} from '@tangle-network/dapp-config';
import { getApiPromise } from '@tangle-network/tangle-shared-ui/utils/polkadot/api';
import { useQuery } from '@tanstack/react-query';
import { LATEST_FINALIZED_BLOCK_QUERY_KEY } from '../constants/query';

type Network = 'all' | 'mainnet' | 'testnet';

type BlockWithTimestamp = {
  blockNumber: number;
  timestamp: Date;
};

type UseLatestFinalizedBlockResult<TNetwork extends Network> =
  TNetwork extends 'all'
    ? {
        mainnetBlock: BlockWithTimestamp;
        testnetBlock: BlockWithTimestamp;
      }
    : TNetwork extends 'testnet'
      ? {
          mainnetBlock: never;
          testnetBlock: BlockWithTimestamp;
        }
      : TNetwork extends 'mainnet'
        ? {
            mainnetBlock: BlockWithTimestamp;
            testnetBlock: never;
          }
        : never;

const fetcher = async <TNetwork extends Network>(
  network: TNetwork,
): Promise<UseLatestFinalizedBlockResult<TNetwork>> => {
  const testnetRpc =
    network === 'testnet' ? TANGLE_TESTNET_WS_RPC_ENDPOINT : undefined;
  const mainnetRpc =
    network === 'mainnet' ? TANGLE_MAINNET_WS_RPC_ENDPOINT : undefined;

  const getBlock = async (rpc: string) => {
    const api = await getApiPromise(rpc);
    // no blockHash is specified, so we retrieve the latest
    const { block } = await api.rpc.chain.getBlock();

    // the information for each of the contained extrinsics
    const timestamp = block.extrinsics
      .map(({ method: { args, method, section } }) => {
        if (section === 'timestamp' && method === 'set') {
          const [moment] = args as [Option<Moment>];

          if (moment.isNone) {
            return null;
          }

          return new Date(moment.unwrap().toNumber());
        }

        return null;
      })
      .find((timestamp) => timestamp !== null);

    if (!timestamp) {
      return null;
    }

    return {
      timestamp,
      blockNumber: block.header.number.toNumber(),
    };
  };

  const [testnetBlock, mainnetBlock] = await Promise.all([
    testnetRpc ? getBlock(testnetRpc) : null,
    mainnetRpc ? getBlock(mainnetRpc) : null,
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
