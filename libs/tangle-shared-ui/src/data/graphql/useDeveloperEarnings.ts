/**
 * Hooks for fetching developer earnings from blueprint usage.
 */

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Address, formatUnits } from 'viem';
import {
  executeEnvioGraphQL,
  EnvioNetwork,
} from '../../utils/executeEnvioGraphQL';

// Earnings entry from a blueprint
export interface BlueprintEarnings {
  blueprintId: bigint;
  blueprintName: string;
  totalEarned: bigint;
  pendingEarnings: bigint;
  claimedEarnings: bigint;
  serviceCount: number;
  jobCount: number;
  lastEarningAt: bigint | null;
}

// Individual earning event
export interface EarningEvent {
  id: string;
  blueprintId: bigint;
  serviceId: bigint;
  amount: bigint;
  token: Address;
  timestamp: bigint;
  type: 'subscription' | 'job' | 'registration';
}

// Raw response from GraphQL for blueprint earnings
interface _BlueprintEarningsResponse {
  Blueprint: Array<{
    blueprintId: string;
    metadataUri: string | null;
    owner: string;
  }>;
  DeveloperEarning: Array<{
    blueprintId: string;
    totalEarned: string;
    pendingEarnings: string;
    claimedEarnings: string;
    serviceCount: string;
    jobCount: string;
    lastEarningAt: string | null;
  }>;
}

// Raw response for earning events
interface _EarningEventsResponse {
  EarningEvent: Array<{
    id: string;
    blueprintId: string;
    serviceId: string;
    amount: string;
    token: string;
    timestamp: string;
    eventType: string;
  }>;
}

// Summary of developer earnings
export interface DeveloperEarningsSummary {
  totalEarned: bigint;
  pendingEarnings: bigint;
  claimedEarnings: bigint;
  blueprintCount: number;
  totalServiceCount: number;
  totalJobCount: number;
}

// Fetch developer earnings summary
const fetchDeveloperEarnings = async (
  owner: Address,
  network?: EnvioNetwork,
): Promise<{
  summary: DeveloperEarningsSummary;
  blueprints: BlueprintEarnings[];
}> => {
  // First get blueprints owned by the developer
  const blueprintsQuery = `
    query GetDeveloperBlueprints($owner: String!) {
      Blueprint(where: { owner: { _eq: $owner } }) {
        blueprintId
        metadataUri
        owner
      }
    }
  `;

  try {
    const blueprintsResult = await executeEnvioGraphQL<
      { Blueprint: Array<{ blueprintId: string; metadataUri: string | null }> },
      { owner: string }
    >(blueprintsQuery, { owner: owner.toLowerCase() }, network);

    const ownedBlueprints = blueprintsResult.data.Blueprint ?? [];
    const blueprintIds = ownedBlueprints.map((bp) => bp.blueprintId);

    if (blueprintIds.length === 0) {
      return {
        summary: {
          totalEarned: BigInt(0),
          pendingEarnings: BigInt(0),
          claimedEarnings: BigInt(0),
          blueprintCount: 0,
          totalServiceCount: 0,
          totalJobCount: 0,
        },
        blueprints: [],
      };
    }

    // Fetch earnings for each blueprint from Services
    const earningsQuery = `
      query GetBlueprintServices($blueprintIds: [String!]!) {
        Service(where: { blueprintId: { _in: $blueprintIds } }) {
          blueprintId
          serviceId
          totalPaid
          status
        }
        JobCall(where: { blueprintId: { _in: $blueprintIds } }) {
          blueprintId
          callId
          completed
        }
      }
    `;

    const earningsResult = await executeEnvioGraphQL<
      {
        Service: Array<{
          blueprintId: string;
          serviceId: string;
          totalPaid: string;
          status: string;
        }>;
        JobCall: Array<{
          blueprintId: string;
          callId: string;
          completed: boolean;
        }>;
      },
      { blueprintIds: string[] }
    >(earningsQuery, { blueprintIds }, network);

    const services = earningsResult.data.Service ?? [];
    const jobs = earningsResult.data.JobCall ?? [];

    // Group by blueprint
    const blueprintEarningsMap = new Map<
      string,
      {
        totalPaid: bigint;
        serviceCount: number;
        jobCount: number;
      }
    >();

    // Initialize all owned blueprints
    for (const bp of ownedBlueprints) {
      blueprintEarningsMap.set(bp.blueprintId, {
        totalPaid: BigInt(0),
        serviceCount: 0,
        jobCount: 0,
      });
    }

    // Aggregate service payments
    for (const service of services) {
      const existing = blueprintEarningsMap.get(service.blueprintId);
      if (existing) {
        existing.totalPaid += BigInt(service.totalPaid || '0');
        existing.serviceCount += 1;
      }
    }

    // Count jobs
    for (const job of jobs) {
      const existing = blueprintEarningsMap.get(job.blueprintId);
      if (existing) {
        existing.jobCount += 1;
      }
    }

    // Fetch metadata for blueprints
    const blueprintsWithEarnings: BlueprintEarnings[] = await Promise.all(
      ownedBlueprints.map(async (bp) => {
        let name = `Blueprint #${bp.blueprintId}`;

        if (bp.metadataUri) {
          try {
            let fetchUrl = bp.metadataUri;
            if (bp.metadataUri.startsWith('ipfs://')) {
              const cid = bp.metadataUri.replace('ipfs://', '');
              fetchUrl = `https://ipfs.io/ipfs/${cid}`;
            }
            const response = await fetch(fetchUrl, {
              signal: AbortSignal.timeout(5000),
            });
            if (response.ok) {
              const metadata = await response.json();
              name = metadata.name ?? name;
            }
          } catch {
            // Ignore metadata fetch errors
          }
        }

        const earnings = blueprintEarningsMap.get(bp.blueprintId) ?? {
          totalPaid: BigInt(0),
          serviceCount: 0,
          jobCount: 0,
        };

        // Developer typically gets a percentage of payments (e.g., 10%)
        // This would be configured in the blueprint, but we'll estimate here
        const developerShare = earnings.totalPaid / BigInt(10); // 10% estimate

        return {
          blueprintId: BigInt(bp.blueprintId),
          blueprintName: name,
          totalEarned: developerShare,
          pendingEarnings: BigInt(0), // Would need contract call
          claimedEarnings: developerShare, // Simplified
          serviceCount: earnings.serviceCount,
          jobCount: earnings.jobCount,
          lastEarningAt: null,
        };
      }),
    );

    // Calculate summary
    const summary: DeveloperEarningsSummary = {
      totalEarned: blueprintsWithEarnings.reduce(
        (sum, bp) => sum + bp.totalEarned,
        BigInt(0),
      ),
      pendingEarnings: blueprintsWithEarnings.reduce(
        (sum, bp) => sum + bp.pendingEarnings,
        BigInt(0),
      ),
      claimedEarnings: blueprintsWithEarnings.reduce(
        (sum, bp) => sum + bp.claimedEarnings,
        BigInt(0),
      ),
      blueprintCount: blueprintsWithEarnings.length,
      totalServiceCount: blueprintsWithEarnings.reduce(
        (sum, bp) => sum + bp.serviceCount,
        0,
      ),
      totalJobCount: blueprintsWithEarnings.reduce(
        (sum, bp) => sum + bp.jobCount,
        0,
      ),
    };

    return { summary, blueprints: blueprintsWithEarnings };
  } catch (error) {
    console.error('Failed to fetch developer earnings:', error);
    return {
      summary: {
        totalEarned: BigInt(0),
        pendingEarnings: BigInt(0),
        claimedEarnings: BigInt(0),
        blueprintCount: 0,
        totalServiceCount: 0,
        totalJobCount: 0,
      },
      blueprints: [],
    };
  }
};

/**
 * Hook to fetch developer earnings from blueprints.
 */
export const useDeveloperEarnings = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
}) => {
  const { network, enabled = true } = options ?? {};
  const { address } = useAccount();

  return useQuery({
    queryKey: ['developer', 'earnings', address, network],
    queryFn: async () => {
      if (!address) {
        return {
          summary: {
            totalEarned: BigInt(0),
            pendingEarnings: BigInt(0),
            claimedEarnings: BigInt(0),
            blueprintCount: 0,
            totalServiceCount: 0,
            totalJobCount: 0,
          },
          blueprints: [],
        };
      }
      return fetchDeveloperEarnings(address, network);
    },
    enabled: enabled && !!address,
    staleTime: 60_000, // 1 minute
  });
};

/**
 * Format earnings amount for display.
 */
export const formatEarningsAmount = (amount: bigint, decimals = 18): string => {
  const formatted = formatUnits(amount, decimals);
  const num = parseFloat(formatted);
  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
};

export default useDeveloperEarnings;
