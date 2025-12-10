import { BLOCK_TIME_MS } from '@tangle-network/dapp-config/constants/tangle';
import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import { useQuery } from '@tanstack/react-query';
import { INDEXING_PROGRESS_QUERY_KEY } from '../../../constants/query';

interface IndexingMetadata {
  lastProcessedHeight: number;
  targetHeight: number;
}

// Envio metadata query
const INDEXING_PROGRESS_QUERY = `
  query IndexingProgress {
    _metadata {
      lastProcessedHeight
      targetHeight
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

const fetcher = async (network: NetworkType): Promise<IndexingMetadata | null> => {
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
    data: { _metadata: IndexingMetadata | null };
  };
  return result.data._metadata;
};

export function useIndexingProgress(network: NetworkType) {
  return useQuery({
    queryKey: [INDEXING_PROGRESS_QUERY_KEY, network],
    queryFn: () => fetcher(network),
    refetchInterval: BLOCK_TIME_MS,
    placeholderData: (prev) => prev,
  });
}
