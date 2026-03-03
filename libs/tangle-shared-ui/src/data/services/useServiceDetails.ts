/**
 * Hook for fetching service details from the Tangle contract.
 */

import { useQuery } from '@tanstack/react-query';
import { Address, zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TangleABI from '../../abi/tangle';
import { MembershipModel } from './useServiceRequestDetails';

export enum ServiceStatus {
  Pending = 0,
  Active = 1,
  Terminated = 2,
}

export enum ServicePricingModel {
  PayOnce = 0,
  Subscription = 1,
  EventDriven = 2,
}

export interface ServiceContractDetails {
  blueprintId: bigint;
  owner: Address;
  createdAt: bigint;
  ttl: bigint;
  terminatedAt: bigint;
  lastPaymentAt: bigint;
  operatorCount: number;
  minOperators: number;
  maxOperators: number;
  membership: MembershipModel;
  pricing: ServicePricingModel;
  status: ServiceStatus;
}

interface ServiceContractResponse {
  blueprintId: bigint;
  owner: Address;
  createdAt: bigint;
  ttl: bigint;
  terminatedAt: bigint;
  lastPaymentAt: bigint;
  operatorCount: number;
  minOperators: number;
  maxOperators: number;
  membership: number;
  pricing: number;
  status: number;
}

export interface UseServiceDetailsOptions {
  enabled?: boolean;
}

export const useServiceDetails = (
  serviceId: bigint | undefined,
  options?: UseServiceDetailsOptions,
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
    queryKey: ['serviceDetails', chainId, serviceId?.toString()],
    queryFn: async (): Promise<ServiceContractDetails | null> => {
      if (!publicClient || !contracts || serviceId === undefined) {
        return null;
      }

      const tangleAddress = contracts.tangle;
      if (tangleAddress === zeroAddress) {
        return null;
      }

      const result = (await publicClient.readContract({
        address: tangleAddress,
        abi: TangleABI,
        functionName: 'getService',
        args: [serviceId],
      })) as ServiceContractResponse;

      return {
        blueprintId: result.blueprintId,
        owner: result.owner,
        createdAt: result.createdAt,
        ttl: result.ttl,
        terminatedAt: result.terminatedAt,
        lastPaymentAt: result.lastPaymentAt,
        operatorCount: result.operatorCount,
        minOperators: result.minOperators,
        maxOperators: result.maxOperators,
        membership: result.membership as MembershipModel,
        pricing: result.pricing as ServicePricingModel,
        status: result.status as ServiceStatus,
      };
    },
    enabled:
      enabled &&
      !!publicClient &&
      !!contracts &&
      contracts.tangle !== zeroAddress &&
      serviceId !== undefined,
    staleTime: 30_000,
    retry: 2,
  });
};

export const getServiceStatusLabel = (status: ServiceStatus): string => {
  switch (status) {
    case ServiceStatus.Pending:
      return 'Pending';
    case ServiceStatus.Active:
      return 'Active';
    case ServiceStatus.Terminated:
      return 'Terminated';
    default:
      return 'Unknown';
  }
};

export const getServicePricingModelLabel = (
  pricing: ServicePricingModel,
): string => {
  switch (pricing) {
    case ServicePricingModel.PayOnce:
      return 'Pay Once';
    case ServicePricingModel.Subscription:
      return 'Subscription';
    case ServicePricingModel.EventDriven:
      return 'Per Job';
    default:
      return 'Unknown';
  }
};

export default useServiceDetails;
