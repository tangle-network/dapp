import { graphql } from '@tangle-network/tangle-shared-ui/graphql';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import { executeGraphQL } from '@tangle-network/tangle-shared-ui/utils/executeGraphQL';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ReactQueryKey } from '../../../constants/reactQuery';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { NetworkId } from '@tangle-network/ui-components/constants/networks';
import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';

const GetAccountPointsQueryDocument = graphql(/* GraphQL */ `
  query GetAccountPoints($account: String!) {
    account(id: $account) {
      id
      totalPoints
    }
  }
`);

const fetcher = async (network: NetworkType, activeAccount: string | null) => {
  if (activeAccount === null) {
    return null;
  }

  const result = await executeGraphQL(network, GetAccountPointsQueryDocument, {
    account: activeAccount,
  });

  return result.data;
};

export default function useActiveAccountPoints() {
  const network = useNetworkStore((state) => state.network);
  const activeAccount = useSubstrateAddress(false);

  const { data: accountPointsResponse, ...rest } = useQuery({
    queryKey: [ReactQueryKey.GetAccountPoints, activeAccount],
    queryFn: () =>
      fetcher(
        network.id === NetworkId.TANGLE_MAINNET
          ? NetworkType.Mainnet
          : NetworkType.Testnet,
        activeAccount,
      ),
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
