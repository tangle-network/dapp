/**
 * Hook to fetch liquid delegation vault redeem requests from the Envio indexer.
 * Used to power the "scheduled actions" / async redemption UI.
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { useChainId } from 'wagmi';
import {
  executeEnvioGraphQL,
  gql,
  EnvioNetwork,
} from '../../utils/executeEnvioGraphQL';
import { useEnvioHealthCheckByChainId } from '../../utils/checkEnvioHealth';

export interface LiquidRedeemRequest {
  id: string;
  vaultId: string;
  vaultAddress: Address;
  controller: Address;
  owner: Address;
  requestId: bigint;
  shares: bigint;
  estimatedAssets: bigint;
  requestedRound: bigint;
  claimed: boolean;
  createdAt: bigint;
  claimedAt: bigint | null;
  txHash: `0x${string}` | string;
}

const LIQUID_REDEEM_REQUESTS_QUERY = gql`
  query LiquidRedeemRequests($owner: String!) {
    LiquidRedeemRequest(
      where: { owner_id: { _eq: $owner }, claimed: { _eq: false } }
      order_by: { createdAt: desc }
    ) {
      id
      controller
      requestId
      shares
      estimatedAssets
      requestedRound
      claimed
      createdAt
      claimedAt
      txHash
      vault {
        id
        address
      }
      owner {
        id
      }
    }
  }
`;

const LIQUID_REDEEM_REQUESTS_BY_VAULT_QUERY = gql`
  query LiquidRedeemRequestsByVault($owner: String!, $vaultId: String!) {
    LiquidRedeemRequest(
      where: {
        owner_id: { _eq: $owner }
        claimed: { _eq: false }
        vault_id: { _eq: $vaultId }
      }
      order_by: { createdAt: desc }
    ) {
      id
      controller
      requestId
      shares
      estimatedAssets
      requestedRound
      claimed
      createdAt
      claimedAt
      txHash
      vault {
        id
        address
      }
      owner {
        id
      }
    }
  }
`;

interface LiquidRedeemRequestsQueryResult {
  LiquidRedeemRequest: Array<{
    id: string;
    controller: string;
    requestId: string;
    shares: string;
    estimatedAssets: string;
    requestedRound: string;
    claimed: boolean;
    createdAt: string;
    claimedAt: string | null;
    txHash: string;
    vault: { id: string; address: string };
    owner: { id: string };
  }>;
}

const parse = (
  raw: LiquidRedeemRequestsQueryResult['LiquidRedeemRequest'][number],
): LiquidRedeemRequest => ({
  id: raw.id,
  vaultId: raw.vault.id,
  vaultAddress: raw.vault.address as Address,
  controller: raw.controller as Address,
  owner: raw.owner.id as Address,
  requestId: BigInt(raw.requestId),
  shares: BigInt(raw.shares),
  estimatedAssets: BigInt(raw.estimatedAssets),
  requestedRound: BigInt(raw.requestedRound),
  claimed: raw.claimed,
  createdAt: BigInt(raw.createdAt),
  claimedAt: raw.claimedAt ? BigInt(raw.claimedAt) : null,
  txHash: raw.txHash,
});

export const useLiquidRedeemRequests = (
  owner: Address | undefined,
  vaultAddress?: Address,
  options?: { network?: EnvioNetwork; enabled?: boolean },
) => {
  const { network, enabled = true } = options ?? {};
  const chainId = useChainId();

  const { data: isIndexerHealthy, isLoading: isCheckingHealth } =
    useEnvioHealthCheckByChainId(chainId);

  const healthCheckComplete = !isCheckingHealth;
  const shouldQuery = healthCheckComplete && isIndexerHealthy === true;

  const vaultId = vaultAddress ? vaultAddress.toLowerCase() : null;

  const queryResult = useQuery({
    queryKey: ['envio', 'liquidRedeemRequests', owner, vaultId, network],
    queryFn: async () => {
      if (!owner) return [];
      const result = vaultId
        ? await executeEnvioGraphQL<
            LiquidRedeemRequestsQueryResult,
            { owner: string; vaultId: string }
          >(
            LIQUID_REDEEM_REQUESTS_BY_VAULT_QUERY,
            { owner: owner.toLowerCase(), vaultId },
            network,
          )
        : await executeEnvioGraphQL<
            LiquidRedeemRequestsQueryResult,
            { owner: string }
          >(
            LIQUID_REDEEM_REQUESTS_QUERY,
            { owner: owner.toLowerCase() },
            network,
          );

      return result.data.LiquidRedeemRequest.map(parse);
    },
    enabled: enabled && !!owner && shouldQuery,
    staleTime: 15_000,
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
    retry: 2,
  });

  if (healthCheckComplete && !isIndexerHealthy) {
    return {
      ...queryResult,
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    };
  }

  if (isCheckingHealth) {
    return {
      ...queryResult,
      data: undefined,
      isLoading: true,
    };
  }

  return queryResult;
};

export default useLiquidRedeemRequests;
