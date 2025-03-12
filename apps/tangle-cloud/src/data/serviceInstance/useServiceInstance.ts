import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import ensureError from '@tangle-network/tangle-shared-ui/utils/ensureError';
import { useMemo } from 'react';
import useSWR from 'swr';
import { SWRKey } from '../../constants/swr';
import { graphql } from '@tangle-network/tangle-shared-ui/graphql'
import { executeGraphQL } from '@tangle-network/tangle-shared-ui/utils/executeGraphQL'
import { GraphQLPagination } from '@tangle-network/tangle-shared-ui/types';

interface useServiceInstanceProps extends GraphQLPagination {
  key: SWRKey;
  operator: SubstrateAddress | null
}

const GetRunningServicesByOperator = graphql(/* GraphQL */ `
  query GetRunningServicesByOperator($operatorId: String!, $first: Int, $offset: Int) {
    services(
      filter: { 
        serviceRequest: { 
          serviceRequestOperators: { 
            some: { operator: { id: { equalTo: $operatorId } } } 
          } 
        },
        terminatedAt: { isNull: true } 
      },
      first: $first,
      offset: $offset
    ) {
      nodes {
        id
        serviceRequestId
        ownerId
        blueprintId
        assetSecurityCommitments
        createdAt
        terminatedAt
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
      }
      totalCount
    }
  }
`);

const fetcher = async ([, operatorId, first, offset]: [useServiceInstanceProps['key'], useServiceInstanceProps['operator'], useServiceInstanceProps['first'], useServiceInstanceProps['offset']]) => {
  if (operatorId === null) {
    return;
  }

  const result = await executeGraphQL(GetRunningServicesByOperator, {
    operatorId: operatorId,
    first: first,
    offset: offset,
  });

  return result.data;
};

export default function useServiceInstance({
  key,
  operator,
  first,
  offset
}: useServiceInstanceProps) {
  const {
    data = null,
    isLoading,
    error: anyError,
  } = useSWR([key, operator, first, offset], fetcher, {
    shouldRetryOnError: false,
    refreshInterval: 5000,
  });

  const error = useMemo(() => {
    if (anyError) {
      return ensureError(anyError);
    }

    return null;
  }, [anyError]);

  return { data, isLoading, error };
}
