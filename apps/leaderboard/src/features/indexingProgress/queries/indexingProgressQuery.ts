import { BLOCK_TIME_MS } from '@tangle-network/dapp-config/constants/tangle';
import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import {
  executeEnvioGraphQL,
  type EnvioNetwork,
} from '@tangle-network/tangle-shared-ui/utils/executeEnvioGraphQL';
import { useQuery as _useQuery } from '@tanstack/react-query';
import { INDEXING_PROGRESS_QUERY_KEY } from '../../../constants/query';

export interface IndexingMetadata {
  firstEventBlockNumber: number;
  latestProcessedBlock: number;
  numEventsProcessed: number;
  chainId: number;
}

const INDEXING_PROGRESS_QUERY = `
  query IndexingProgress {
    chain_metadata {
      first_event_block_number
      latest_processed_block
      num_events_processed
      chain_id
    }
  }
`;

interface ChainMetadataRow {
  first_event_block_number: number;
  latest_processed_block: number;
  num_events_processed: number;
  chain_id: number;
}

const toEnvioNetwork = (network: NetworkType): EnvioNetwork => {
  return network === 'MAINNET' ? 'mainnet' : 'testnet';
};

const fetcher = async (
  network: NetworkType,
): Promise<IndexingMetadata | null> => {
  const result = await executeEnvioGraphQL<
    { chain_metadata: ChainMetadataRow[] },
    Record<string, never>
  >(INDEXING_PROGRESS_QUERY, {}, toEnvioNetwork(network));

  if (result.errors?.length) {
    console.warn('GraphQL errors:', result.errors);
    return null;
  }

  const metadata = result.data.chain_metadata?.[0];
  if (!metadata) {
    return null;
  }

  return {
    firstEventBlockNumber: metadata.first_event_block_number,
    latestProcessedBlock: metadata.latest_processed_block,
    numEventsProcessed: metadata.num_events_processed,
    chainId: metadata.chain_id,
  };
};

export function useIndexingProgress(network: NetworkType) {
  return _useQuery({
    queryKey: [INDEXING_PROGRESS_QUERY_KEY, network],
    queryFn: () => fetcher(network),
    refetchInterval: BLOCK_TIME_MS,
    placeholderData: (prev) => prev,
  });
}
