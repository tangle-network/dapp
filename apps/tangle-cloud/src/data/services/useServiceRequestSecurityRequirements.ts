/**
 * Hook to query security requirements for a service request from the contract
 * and resolve token metadata for display.
 */

import { useQuery } from '@tanstack/react-query';
import { useChainId, usePublicClient } from 'wagmi';
import { Address, zeroAddress } from 'viem';
import TANGLE_ABI from '@tangle-network/tangle-shared-ui/abi/tangle';
import { useEvmAssetMetadatas } from '@tangle-network/tangle-shared-ui/hooks/useEvmAssetMetadatas';
import { useMemo } from 'react';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';
import getContractsForChain from './getContractsForChain';

// Default TNT requirement constants (must match contract)
const DEFAULT_TNT_MIN_EXPOSURE_BPS = 1000; // 10%
const DEFAULT_TNT_MAX_EXPOSURE_BPS = 10000; // 100%
const ASSET_KIND_ERC20 = 1;

// Contract return types matching the Solidity struct
interface ContractAsset {
  kind: number; // 0 = Native, 1 = ERC20
  token: Address;
}

interface ContractSecurityRequirement {
  asset: ContractAsset;
  minExposureBps: number; // 0-10000 basis points
  maxExposureBps: number; // 0-10000 basis points
}

// Enriched requirement with resolved token metadata
export interface SecurityRequirementWithMetadata {
  asset: ContractAsset;
  minExposureBps: number;
  maxExposureBps: number;
  metadata: {
    name: string;
    symbol: string;
    decimals: number;
  } | null;
}

interface UseServiceRequestSecurityRequirementsResult {
  data: SecurityRequirementWithMetadata[] | undefined;
  isLoading: boolean;
  error: Error | null;
  /** True if custom requirements exist beyond default TNT */
  hasCustomRequirements: boolean;
  /** True if this is the simple case (only default TNT requirement) */
  isSimpleCase: boolean;
  /** The default TNT requirement info (for simple case UI) */
  defaultTntRequirement: SecurityRequirementWithMetadata | null;
}

/**
 * Queries security requirements for a service request and resolves token metadata.
 *
 * @param requestId - The service request ID to query requirements for
 * @returns Security requirements with resolved token metadata
 *
 * @example
 * ```tsx
 * const { data: requirements, isLoading, hasRequirements } =
 *   useServiceRequestSecurityRequirements(requestId);
 *
 * if (hasRequirements) {
 *   // Show per-asset commitment inputs
 * } else {
 *   // Show simple staking percentage input
 * }
 * ```
 */
export const useServiceRequestSecurityRequirements = (
  requestId: bigint | undefined,
): UseServiceRequestSecurityRequirementsResult => {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const contracts = getContractsForChain(chainId);

  // Query TNT token address from contract
  const { data: tntTokenAddress, isLoading: isLoadingTntToken } = useQuery({
    queryKey: ['tntTokenAddress', chainId],
    queryFn: async () => {
      if (!publicClient || !contracts || contracts.tangle === zeroAddress) {
        return null;
      }

      try {
        const result = await publicClient.readContract({
          address: contracts.tangle,
          abi: TANGLE_ABI,
          functionName: 'tntToken',
          args: [],
        });

        return result as Address;
      } catch (error) {
        console.warn(
          '[useServiceRequestSecurityRequirements] Failed to fetch TNT token address',
          { error },
        );
        return null;
      }
    },
    enabled:
      publicClient !== undefined &&
      contracts !== null &&
      contracts.tangle !== zeroAddress,
    staleTime: Infinity, // TNT token address doesn't change
  });

  // Query raw requirements from contract
  const {
    data: rawRequirements,
    isLoading: isLoadingRequirements,
    error: requirementsError,
  } = useQuery({
    queryKey: [
      'serviceRequestSecurityRequirements',
      requestId?.toString(),
      chainId,
    ],
    queryFn: async () => {
      if (
        !publicClient ||
        !contracts ||
        contracts.tangle === zeroAddress ||
        requestId === undefined
      ) {
        return [];
      }

      const result = await publicClient.readContract({
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'getServiceRequestSecurityRequirements',
        args: [requestId],
      });

      return result as ContractSecurityRequirement[];
    },
    enabled:
      requestId !== undefined &&
      publicClient !== undefined &&
      contracts !== null &&
      contracts.tangle !== zeroAddress,
    staleTime: 30_000, // 30 seconds
  });

  // Extract unique token addresses for metadata resolution
  const tokenAddresses = useMemo(() => {
    if (!rawRequirements || rawRequirements.length === 0) {
      return null;
    }

    return rawRequirements.map((req) => {
      // For native token (kind=0), use zero address for metadata lookup
      // For ERC20 (kind=1), use the token address
      const addr = req.asset.kind === 0 ? zeroAddress : req.asset.token;
      return addr as EvmAddress;
    });
  }, [rawRequirements]);

  // Fetch token metadata
  const { data: tokenMetadatas, isLoading: isLoadingMetadata } =
    useEvmAssetMetadatas(tokenAddresses);

  // Combine requirements with metadata
  const requirementsWithMetadata = useMemo<
    SecurityRequirementWithMetadata[] | undefined
  >(() => {
    if (!rawRequirements) {
      return undefined;
    }

    if (rawRequirements.length === 0) {
      return [];
    }

    return rawRequirements.map((req, index) => {
      const metadata = tokenMetadatas?.[index] ?? null;

      return {
        asset: req.asset,
        minExposureBps: Number(req.minExposureBps),
        maxExposureBps: Number(req.maxExposureBps),
        metadata: metadata
          ? {
              name: metadata.name,
              symbol: metadata.symbol,
              decimals: metadata.decimals,
            }
          : null,
      };
    });
  }, [rawRequirements, tokenMetadatas]);

  // Check if this is the simple case: only the default TNT requirement
  // Mirrors contract's _isOnlyDefaultTntRequirement logic
  const { isSimpleCase, defaultTntRequirement } = useMemo(() => {
    if (
      !requirementsWithMetadata ||
      requirementsWithMetadata.length !== 1 ||
      !tntTokenAddress ||
      tntTokenAddress === zeroAddress
    ) {
      return { isSimpleCase: false, defaultTntRequirement: null };
    }

    const req = requirementsWithMetadata[0];
    const isDefaultTnt =
      req.asset.kind === ASSET_KIND_ERC20 &&
      req.asset.token.toLowerCase() === tntTokenAddress.toLowerCase() &&
      req.minExposureBps === DEFAULT_TNT_MIN_EXPOSURE_BPS &&
      req.maxExposureBps === DEFAULT_TNT_MAX_EXPOSURE_BPS;

    return {
      isSimpleCase: isDefaultTnt,
      defaultTntRequirement: isDefaultTnt ? req : null,
    };
  }, [requirementsWithMetadata, tntTokenAddress]);

  return {
    data: requirementsWithMetadata,
    isLoading: isLoadingRequirements || isLoadingMetadata || isLoadingTntToken,
    error: requirementsError as Error | null,
    hasCustomRequirements:
      requirementsWithMetadata !== undefined &&
      requirementsWithMetadata.length > 0 &&
      !isSimpleCase,
    isSimpleCase,
    defaultTntRequirement,
  };
};

export default useServiceRequestSecurityRequirements;
