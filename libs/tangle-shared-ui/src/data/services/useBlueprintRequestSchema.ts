import { useQuery } from '@tanstack/react-query';
import { zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TangleABI from '../../abi/tangle';
import { parseSchema } from '../../codec';
import type { SchemaField } from '../../codec';

interface BlueprintDefinitionContractResponse {
  requestSchema: `0x${string}`;
}

export interface BlueprintRequestSchemaResult {
  requestSchemaHex: `0x${string}` | null;
  parsedRequestSchema: SchemaField[];
  hasRequestSchema: boolean;
  requestSchemaParseError: string | null;
}

export const useBlueprintRequestSchema = (blueprintId: bigint | undefined) => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = chainId ? getContractsByChainId(chainId) : null;
  } catch {
    contracts = null;
  }

  return useQuery({
    queryKey: ['blueprintRequestSchema', chainId, blueprintId?.toString()],
    queryFn: async (): Promise<BlueprintRequestSchemaResult> => {
      if (!publicClient || !contracts || blueprintId === undefined) {
        return {
          requestSchemaHex: null,
          parsedRequestSchema: [],
          hasRequestSchema: false,
          requestSchemaParseError: null,
        };
      }

      const tangleAddress = contracts.tangle;
      if (tangleAddress === zeroAddress) {
        return {
          requestSchemaHex: null,
          parsedRequestSchema: [],
          hasRequestSchema: false,
          requestSchemaParseError: null,
        };
      }

      const definition = (await publicClient.readContract({
        address: tangleAddress,
        abi: TangleABI,
        functionName: 'getBlueprintDefinition',
        args: [blueprintId],
      })) as BlueprintDefinitionContractResponse;

      const requestSchemaHex =
        definition.requestSchema ?? ('0x' as `0x${string}`);
      const hasRequestSchema = requestSchemaHex !== ('0x' as `0x${string}`);

      if (!hasRequestSchema) {
        return {
          requestSchemaHex,
          parsedRequestSchema: [],
          hasRequestSchema: false,
          requestSchemaParseError: null,
        };
      }

      try {
        const parsedRequestSchema = parseSchema(requestSchemaHex);
        return {
          requestSchemaHex,
          parsedRequestSchema,
          hasRequestSchema: true,
          requestSchemaParseError: null,
        };
      } catch (error) {
        return {
          requestSchemaHex,
          parsedRequestSchema: [],
          hasRequestSchema: true,
          requestSchemaParseError:
            error instanceof Error
              ? error.message
              : 'Failed to parse request schema',
        };
      }
    },
    enabled:
      !!publicClient &&
      !!contracts &&
      contracts.tangle !== zeroAddress &&
      blueprintId !== undefined,
    staleTime: 300_000,
    retry: 2,
  });
};

export default useBlueprintRequestSchema;
