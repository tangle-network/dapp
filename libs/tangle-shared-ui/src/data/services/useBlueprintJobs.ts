/**
 * Hook for fetching job definitions for a blueprint from the Tangle contract.
 * Calls getBlueprintDefinition and extracts the jobs array,
 * which defines the valid job indices and their metadata.
 */

import { useQuery } from '@tanstack/react-query';
import { zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TangleABI from '../../abi/tangle';

export interface BlueprintJobDefinition {
  name: string;
  description: string;
  metadataUri: string;
  paramsSchema: `0x${string}`;
  resultSchema: `0x${string}`;
}

interface BlueprintDefinitionContractResponse {
  metadataUri: string;
  manager: string;
  masterManagerRevision: number;
  hasConfig: boolean;
  config: unknown;
  metadata: unknown;
  jobs: ReadonlyArray<{
    name: string;
    description: string;
    metadataUri: string;
    paramsSchema: `0x${string}`;
    resultSchema: `0x${string}`;
  }>;
  registrationSchema: `0x${string}`;
  requestSchema: `0x${string}`;
  sources: unknown;
}

/**
 * Hook to fetch job definitions for a blueprint from the Tangle contract.
 * Returns the list of valid jobs with their names and descriptions.
 * The array index corresponds to the valid job index for submitJob.
 *
 * @param blueprintId - The blueprint ID to fetch jobs for
 */
export const useBlueprintJobs = (blueprintId: bigint | undefined) => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = chainId ? getContractsByChainId(chainId) : null;
  } catch {
    contracts = null;
  }

  return useQuery({
    queryKey: ['blueprintJobs', chainId, blueprintId?.toString()],
    queryFn: async (): Promise<BlueprintJobDefinition[]> => {
      if (!publicClient || !contracts || blueprintId === undefined) {
        return [];
      }

      const tangleAddress = contracts.tangle;
      if (tangleAddress === zeroAddress) {
        return [];
      }

      const result = (await publicClient.readContract({
        address: tangleAddress,
        abi: TangleABI,
        functionName: 'getBlueprintDefinition',
        args: [blueprintId],
      })) as BlueprintDefinitionContractResponse;

      return result.jobs.map((job) => ({
        name: job.name,
        description: job.description,
        metadataUri: job.metadataUri,
        paramsSchema: job.paramsSchema,
        resultSchema: job.resultSchema,
      }));
    },
    enabled:
      !!publicClient &&
      !!contracts &&
      contracts.tangle !== zeroAddress &&
      blueprintId !== undefined,
    staleTime: 300_000, // 5 minutes - job definitions rarely change
    retry: 2,
  });
};

export default useBlueprintJobs;
