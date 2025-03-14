import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import ensureError from '@tangle-network/tangle-shared-ui/utils/ensureError';
import { useMemo } from 'react';
import useSWR from 'swr';
import { SWRKey } from '../../constants/swr';
import { graphql } from '@tangle-network/tangle-shared-ui/graphql';
import { executeGraphQL } from '@tangle-network/tangle-shared-ui/utils/executeGraphQL';

const GetAccountPointsQueryDocument = graphql(/* GraphQL */ `
  query GetAccountPoints($account: String!) {
    account(id: $account) {
      id
      totalPoints
    }
  }
`);

const fetcher = async ([, activeAccount]: [string, string | null]) => {
  if (activeAccount === null) {
    return;
  }

  const result = await executeGraphQL(GetAccountPointsQueryDocument, {
    account: activeAccount,
  });

  return result.data;
};

export default function useActivePoints() {
  const activeAccount = useSubstrateAddress(false);

  const {
    data = null,
    isLoading,
    error: anyError,
  } = useSWR([SWRKey.GetAccountPoints, activeAccount], fetcher, {
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
