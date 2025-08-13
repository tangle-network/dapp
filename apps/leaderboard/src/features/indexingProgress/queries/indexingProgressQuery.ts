import { BLOCK_TIME_MS } from '@tangle-network/dapp-config/constants/tangle';
import { graphql } from '@tangle-network/tangle-shared-ui/graphql';
import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import { executeGraphQL } from '@tangle-network/tangle-shared-ui/utils/executeGraphQL';
import { useQuery } from '@tanstack/react-query';
import { INDEXING_PROGRESS_QUERY_KEY } from '../../../constants/query';
import { getGraphQLEndpointFromNetwork } from '../../leaderboard/utils/getGraphQLEndpointFromNetwork';

const IndexingProgressQueryDocument = graphql(/* GraphQL */ `
  query IndexingProgress {
    _metadata {
      lastProcessedHeight
      targetHeight
    }
  }
`);

const fetcher = async (network: NetworkType) => {
  const endpoint = getGraphQLEndpointFromNetwork(network);
  const result = await executeGraphQL(endpoint, IndexingProgressQueryDocument);
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
