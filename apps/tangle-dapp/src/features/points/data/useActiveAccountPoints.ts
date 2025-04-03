import { graphql } from '@tangle-network/tangle-shared-ui/graphql';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import { executeGraphQL } from '@tangle-network/tangle-shared-ui/utils/executeGraphQL';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ReactQueryKey } from '../../../constants/reactQuery';

const GetAccountPointsQueryDocument = graphql(/* GraphQL */ `
  query GetAccountPoints($account: String!) {
    account(id: $account) {
      id
      totalPoints
    }
  }
`);

const fetcher = async (activeAccount: string | null) => {
  if (activeAccount === null) {
    return;
  }

  const result = await executeGraphQL(GetAccountPointsQueryDocument, {
    account: activeAccount.toLowerCase(),
  });

  return result.data;
};

export default function useActiveAccountPoints() {
  const activeAccount = useSubstrateAddress(false);

  const { data: accountPointsResponse, ...rest } = useQuery({
    queryKey: [ReactQueryKey.GetAccountPoints, activeAccount],
    queryFn: () => fetcher(activeAccount),
    retry: 10,
    refetchInterval: 6000,
  });

  const data = useMemo(() => {
    const points = accountPointsResponse?.account?.totalPoints;

    if (!points) {
      return;
    }

    return points;
  }, [accountPointsResponse]);

  return { data, ...rest };
}
