import { BLOCK_TIME_MS } from '@tangle-network/dapp-config/constants/tangle';
import { graphql } from '@tangle-network/tangle-shared-ui/graphql';
import { executeGraphQL } from '@tangle-network/tangle-shared-ui/utils/executeGraphQL';
import { useQuery } from '@tanstack/react-query';
import { INDEXING_PROGRESS_QUERY_KEY } from '../../../constants/query';

const IndexingProgressQueryDocument = graphql(/* GraphQL */ `
  query IndexingProgress {
    _metadata {
      lastProcessedHeight
      lastProcessedTimestamp
      targetHeight
      indexerHealthy
    }
  }
`);

const fetcher = async () => {
  const result = await executeGraphQL(IndexingProgressQueryDocument);
  return result.data._metadata;
};

export function useIndexingProgress() {
  return useQuery({
    queryKey: [INDEXING_PROGRESS_QUERY_KEY],
    queryFn: fetcher,
    refetchInterval: BLOCK_TIME_MS,
    placeholderData: (prev) => prev,
  });
}
