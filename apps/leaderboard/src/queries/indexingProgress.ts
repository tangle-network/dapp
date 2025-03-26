import { BLOCK_TIME_MS } from '@tangle-network/dapp-config/constants/tangle';
import { graphql } from '@tangle-network/tangle-shared-ui/graphql';
import { executeGraphQL } from '@tangle-network/tangle-shared-ui/utils/executeGraphQL';
import { useQuery } from '@tanstack/react-query';

export enum ReactQueryKey {
  IndexingProgress = 'IndexingProgress',
}

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
  return result.data;
};

export function useIndexingProgress() {
  const { data, ...rest } = useQuery({
    queryKey: [ReactQueryKey.IndexingProgress],
    queryFn: fetcher,
    refetchInterval: BLOCK_TIME_MS,
  });

  return {
    data: data?._metadata,
    ...rest,
  };
}
