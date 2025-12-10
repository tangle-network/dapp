import { BLOCK_TIME_MS } from '@tangle-network/dapp-config/constants/tangle';
import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import { useQuery as _useQuery } from '@tanstack/react-query';
import { INDEXING_PROGRESS_QUERY_KEY } from '../../../constants/query';

interface IndexingMetadata {
  lastProcessedHeight: number;
  targetHeight: number;
}

// Envio chain_metadata query - uses the Envio-specific table
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

const getEndpoint = (network: NetworkType): string => {
  if (network === 'MAINNET') {
    return (
      import.meta.env.VITE_ENVIO_MAINNET_ENDPOINT ||
      'http://localhost:8080/v1/graphql'
    );
  }
  return (
    import.meta.env.VITE_ENVIO_TESTNET_ENDPOINT ||
    'http://localhost:8080/v1/graphql'
  );
};

interface ChainMetadataRow {
  first_event_block_number: number;
  latest_processed_block: number;
  num_events_processed: number;
  chain_id: number;
}

const fetcher = async (
  network: NetworkType,
): Promise<IndexingMetadata | null> => {
  const endpoint = getEndpoint(network);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: INDEXING_PROGRESS_QUERY,
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const result = (await response.json()) as {
    data: { chain_metadata: ChainMetadataRow[] };
    errors?: Array<{ message: string }>;
  };

  if (result.errors?.length) {
    console.warn('GraphQL errors:', result.errors);
    return null;
  }

  const metadata = result.data.chain_metadata?.[0];
  if (!metadata) {
    return null;
  }

  // Envio tracks latest_processed_block, we estimate target as a bit ahead
  return {
    lastProcessedHeight: metadata.latest_processed_block,
    targetHeight: metadata.latest_processed_block + 1, // Estimate target
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
