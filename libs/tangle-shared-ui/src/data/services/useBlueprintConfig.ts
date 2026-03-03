/**
 * Hook for fetching blueprint configuration from the Tangle contract.
 * This includes membership model, min/max operators, and pricing settings.
 */

import { useQuery } from '@tanstack/react-query';
import { zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TangleABI from '../../abi/tangle';
import { MembershipModel } from './useServiceRequestDetails';

// Pricing model enum matching contract
export enum PricingModel {
  PayOnce = 0,
  Subscription = 1,
  EventDriven = 2,
}

// Blueprint configuration from contract
export interface BlueprintConfig {
  membership: MembershipModel;
  pricing: PricingModel;
  minOperators: number;
  maxOperators: number;
  subscriptionRate: bigint;
  subscriptionInterval: bigint;
  eventRate: bigint;
}

// Raw contract response type
interface BlueprintConfigContractResponse {
  membership: number;
  pricing: number;
  minOperators: number;
  maxOperators: number;
  subscriptionRate: bigint;
  subscriptionInterval: bigint;
  eventRate: bigint;
}

export interface UseBlueprintConfigOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch blueprint configuration from the Tangle contract.
 * Returns membership model, operator limits, and pricing configuration.
 *
 * @param blueprintId - The blueprint ID to fetch configuration for
 * @param options - Configuration options
 */
export const useBlueprintConfig = (
  blueprintId: bigint | undefined,
  options?: UseBlueprintConfigOptions,
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
    queryKey: ['blueprintConfig', chainId, blueprintId?.toString()],
    queryFn: async (): Promise<BlueprintConfig | null> => {
      if (!publicClient || !contracts || blueprintId === undefined) {
        return null;
      }

      const tangleAddress = contracts.tangle;
      if (tangleAddress === zeroAddress) {
        return null;
      }

      // Fetch blueprint configuration
      const configResult = (await publicClient.readContract({
        address: tangleAddress,
        abi: TangleABI,
        functionName: 'getBlueprintConfig',
        args: [blueprintId],
      })) as BlueprintConfigContractResponse;

      return {
        membership: configResult.membership as MembershipModel,
        pricing: configResult.pricing as PricingModel,
        minOperators: configResult.minOperators,
        maxOperators: configResult.maxOperators,
        subscriptionRate: configResult.subscriptionRate,
        subscriptionInterval: configResult.subscriptionInterval,
        eventRate: configResult.eventRate,
      };
    },
    enabled:
      enabled &&
      !!publicClient &&
      !!contracts &&
      contracts.tangle !== zeroAddress &&
      blueprintId !== undefined,
    staleTime: 60_000, // 1 minute
    retry: 2,
  });
};

/**
 * Get a human-readable label for a membership model.
 */
export const getMembershipModelLabel = (
  membership: MembershipModel,
): string => {
  switch (membership) {
    case MembershipModel.Fixed:
      return 'All operators must approve';
    case MembershipModel.Dynamic:
      return 'Minimum required approvals';
    default:
      return 'Unknown';
  }
};

/**
 * Get a human-readable label for a pricing model.
 */
export const getPricingModelLabel = (pricing: PricingModel): string => {
  switch (pricing) {
    case PricingModel.PayOnce:
      return 'Pay Once';
    case PricingModel.Subscription:
      return 'Subscription';
    case PricingModel.EventDriven:
      return 'Per Job';
    default:
      return 'Unknown';
  }
};

export default useBlueprintConfig;
