/**
 * Hook for fetching service escrow details from the Tangle contract.
 */

import { useQuery } from '@tanstack/react-query';
import { Address, zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TangleABI from '../../abi/tangle';

export interface ServiceEscrow {
  token: Address;
  balance: bigint;
  totalDeposited: bigint;
  totalReleased: bigint;
  isNativeToken: boolean;
}

interface ServiceEscrowContractResponse {
  token: Address;
  balance: bigint;
  totalDeposited: bigint;
  totalReleased: bigint;
}

export interface UseServiceEscrowOptions {
  enabled?: boolean;
}

export const useServiceEscrow = (
  serviceId: bigint | undefined,
  options?: UseServiceEscrowOptions,
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
    queryKey: ['serviceEscrow', chainId, serviceId?.toString()],
    queryFn: async (): Promise<ServiceEscrow | null> => {
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
        functionName: 'getServiceEscrow',
        args: [serviceId],
      })) as ServiceEscrowContractResponse;

      return {
        token: result.token,
        balance: result.balance,
        totalDeposited: result.totalDeposited,
        totalReleased: result.totalReleased,
        isNativeToken: result.token === zeroAddress,
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

export default useServiceEscrow;
