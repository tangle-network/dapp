/**
 * Hook for fetching service request details from the Tangle contract.
 * Provides payment terms, commitment details, and security requirements.
 */

import { useQuery } from '@tanstack/react-query';
import { Address, zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TangleABI from '../../abi/tangle';

// Membership model enum matching contract
export enum MembershipModel {
  Fixed = 0,
  Dynamic = 1,
}

// Asset kind enum matching contract
export enum AssetKind {
  Erc20 = 0,
  Native = 1,
}

// Asset structure from contract
export interface Asset {
  kind: AssetKind;
  token: Address;
}

// Security requirement from contract
export interface AssetSecurityRequirement {
  asset: Asset;
  minExposureBps: number;
  maxExposureBps: number;
}

// Service request details from contract
export interface ServiceRequestContractDetails {
  blueprintId: bigint;
  requester: Address;
  createdAt: bigint;
  ttl: bigint;
  operatorCount: number;
  approvalCount: number;
  paymentToken: Address;
  paymentAmount: bigint;
  membership: MembershipModel;
  minOperators: number;
  maxOperators: number;
  rejected: boolean;
  securityRequirements: AssetSecurityRequirement[];
}

// Raw contract response type - matches the ABI struct return
interface ServiceRequestContractResponse {
  blueprintId: bigint;
  requester: Address;
  createdAt: bigint;
  ttl: bigint;
  operatorCount: number;
  approvalCount: number;
  paymentToken: Address;
  paymentAmount: bigint;
  membership: number;
  minOperators: number;
  maxOperators: number;
  rejected: boolean;
}

type SecurityRequirementContractResponse = readonly {
  asset: { kind: number; token: Address };
  minExposureBps: number;
  maxExposureBps: number;
}[];

export interface UseServiceRequestDetailsOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch service request details from the Tangle contract.
 * Includes payment terms, commitment details, and security requirements.
 *
 * @param requestId - The service request ID to fetch details for
 * @param options - Configuration options
 */
export const useServiceRequestDetails = (
  requestId: bigint | undefined,
  options?: UseServiceRequestDetailsOptions,
) => {
  const { enabled = true } = options ?? {};
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = chainId ? getContractsByChainId(chainId) : null;
  } catch {
    contracts = null;
  }

  return useQuery({
    queryKey: ['serviceRequestDetails', chainId, requestId?.toString()],
    queryFn: async (): Promise<ServiceRequestContractDetails | null> => {
      if (!publicClient || !contracts || requestId === undefined) {
        return null;
      }

      const tangleAddress = contracts.tangle;
      if (tangleAddress === zeroAddress) {
        return null;
      }

      // Fetch service request details
      const requestResult = (await publicClient.readContract({
        address: tangleAddress,
        abi: TangleABI,
        functionName: 'getServiceRequest',
        args: [requestId],
      })) as ServiceRequestContractResponse;

      // Fetch security requirements
      let securityRequirements: AssetSecurityRequirement[] = [];
      try {
        const securityResult = (await publicClient.readContract({
          address: tangleAddress,
          abi: TangleABI,
          functionName: 'getServiceRequestSecurityRequirements',
          args: [requestId],
        })) as SecurityRequirementContractResponse;

        securityRequirements = securityResult.map((req) => ({
          asset: {
            kind: req.asset.kind as AssetKind,
            token: req.asset.token,
          },
          minExposureBps: req.minExposureBps,
          maxExposureBps: req.maxExposureBps,
        }));
      } catch {
        // Security requirements may not exist for all requests
      }

      return {
        blueprintId: requestResult.blueprintId,
        requester: requestResult.requester,
        createdAt: requestResult.createdAt,
        ttl: requestResult.ttl,
        operatorCount: requestResult.operatorCount,
        approvalCount: requestResult.approvalCount,
        paymentToken: requestResult.paymentToken,
        paymentAmount: requestResult.paymentAmount,
        membership: requestResult.membership as MembershipModel,
        minOperators: requestResult.minOperators,
        maxOperators: requestResult.maxOperators,
        rejected: requestResult.rejected,
        securityRequirements,
      };
    },
    enabled:
      enabled &&
      !!publicClient &&
      !!contracts &&
      contracts.tangle !== zeroAddress &&
      requestId !== undefined,
    staleTime: 30_000,
    retry: 2,
  });
};

export default useServiceRequestDetails;
