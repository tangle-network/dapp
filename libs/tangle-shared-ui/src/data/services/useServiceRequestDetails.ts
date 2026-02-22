/**
 * Hook for fetching service request details from the Tangle contract.
 * Provides payment terms, commitment details, and security requirements.
 */

import { useQuery } from '@tanstack/react-query';
import {
  Address,
  decodeFunctionData,
  parseAbi,
  parseAbiItem,
  zeroAddress,
} from 'viem';
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
  Native = 0,
  Erc20 = 1,
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

export type ServiceRequestVariant =
  | 'basic'
  | 'exposure'
  | 'security'
  | 'unknown';

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
  customSecurityRequirements: AssetSecurityRequirement[];
  defaultTntRequirement: AssetSecurityRequirement | null;
  requestVariant: ServiceRequestVariant;
  requestedExposureBps: number[] | null;
  requestedOperators: Address[] | null;
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

const SERVICE_REQUEST_FUNCTION_ABI = parseAbi([
  'function requestService(uint64 blueprintId, address[] operators, bytes config, address[] permittedCallers, uint64 ttl, address paymentToken, uint256 paymentAmount)',
  'function requestServiceWithExposure(uint64 blueprintId, address[] operators, uint16[] exposureBps, bytes config, address[] permittedCallers, uint64 ttl, address paymentToken, uint256 paymentAmount)',
  'function requestServiceWithSecurity(uint64 blueprintId, address[] operators, ((uint8,address),uint16,uint16)[] securityRequirements, bytes config, address[] permittedCallers, uint64 ttl, address paymentToken, uint256 paymentAmount)',
]);

const REQUEST_SERVICE_SELECTOR = '0xa37b9286';
const REQUEST_SERVICE_WITH_EXPOSURE_SELECTOR = '0x108a7d63';
const REQUEST_SERVICE_WITH_SECURITY_SELECTOR = '0xec9f0fdd';

const SERVICE_REQUESTED_EVENT = parseAbiItem(
  'event ServiceRequested(uint64 indexed requestId, uint64 indexed blueprintId, address indexed requester)',
);
const SERVICE_REQUESTED_WITH_SECURITY_EVENT = parseAbiItem(
  'event ServiceRequestedWithSecurity(uint64 indexed requestId, uint64 indexed blueprintId, address indexed requester)',
);

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
      const customSecurityRequirements: AssetSecurityRequirement[] = [];
      let defaultTntRequirement: AssetSecurityRequirement | null = null;
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

        // Separate default TNT requirement from custom security requirements.
        // Default TNT requirement is present in basic/exposure flows and should not
        // be displayed as "security mode" data in UI.
        const [tntToken, defaultTntMinExposureBps] = await Promise.all([
          publicClient
            .readContract({
              address: tangleAddress,
              abi: TangleABI,
              functionName: 'tntToken',
              args: [],
            })
            .catch(() => zeroAddress),
          publicClient
            .readContract({
              address: tangleAddress,
              abi: TangleABI,
              functionName: 'defaultTntMinExposureBps',
              args: [],
            })
            .catch(() => 0),
        ]);

        const normalizedTntToken = (tntToken as Address).toLowerCase();
        const defaultMinBps = Number(defaultTntMinExposureBps);

        securityRequirements.forEach((requirement) => {
          const isDefaultTntRequirement =
            requirement.asset.kind === AssetKind.Erc20 &&
            requirement.asset.token.toLowerCase() === normalizedTntToken &&
            requirement.minExposureBps === defaultMinBps &&
            requirement.maxExposureBps === 10_000;

          if (isDefaultTntRequirement && defaultTntRequirement === null) {
            defaultTntRequirement = requirement;
            return;
          }

          customSecurityRequirements.push(requirement);
        });
      } catch {
        // Security requirements may not exist for all requests
      }

      let requestVariant: ServiceRequestVariant = 'unknown';
      let requestedExposureBps: number[] | null = null;
      let requestedOperators: Address[] | null = null;

      try {
        const serviceRequestedLogs = await publicClient.getLogs({
          address: tangleAddress,
          event: SERVICE_REQUESTED_EVENT,
          args: { requestId },
          fromBlock: BigInt(0),
          toBlock: 'latest',
        });

        let requestTxHash: `0x${string}` | undefined =
          serviceRequestedLogs.at(-1)?.transactionHash;

        // Fallback: security-specific event, if needed.
        if (!requestTxHash) {
          const securityRequestedLogs = await publicClient.getLogs({
            address: tangleAddress,
            event: SERVICE_REQUESTED_WITH_SECURITY_EVENT,
            args: { requestId },
            fromBlock: BigInt(0),
            toBlock: 'latest',
          });
          requestTxHash = securityRequestedLogs.at(-1)?.transactionHash;
        }

        if (requestTxHash) {
          const tx = await publicClient.getTransaction({ hash: requestTxHash });
          const selector = tx.input.slice(0, 10).toLowerCase();

          switch (selector) {
            case REQUEST_SERVICE_WITH_SECURITY_SELECTOR:
              requestVariant = 'security';
              break;
            case REQUEST_SERVICE_WITH_EXPOSURE_SELECTOR: {
              requestVariant = 'exposure';
              break;
            }
            case REQUEST_SERVICE_SELECTOR:
              requestVariant = 'basic';
              break;
            default:
              break;
          }

          try {
            const decoded = decodeFunctionData({
              abi: SERVICE_REQUEST_FUNCTION_ABI,
              data: tx.input,
            });

            const rawOperators = (decoded.args?.[1] as readonly unknown[]) ?? [];
            requestedOperators = rawOperators as Address[];

            if (decoded.functionName === 'requestServiceWithExposure') {
              const rawExposures = (decoded.args?.[2] as readonly unknown[]) ?? [];
              requestedExposureBps = rawExposures.map((value) => Number(value));
            }
          } catch {
            // Keep detected variant even if calldata argument decoding fails.
          }
        }
      } catch {
        // Keep variant as unknown when tx lookup/decoding is unavailable.
      }

      if (requestVariant === 'unknown' && customSecurityRequirements.length > 0) {
        requestVariant = 'security';
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
        customSecurityRequirements,
        defaultTntRequirement,
        requestVariant,
        requestedExposureBps,
        requestedOperators,
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
