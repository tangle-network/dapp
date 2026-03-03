import { useQuery } from '@tanstack/react-query';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TANGLE_ABI from '@tangle-network/tangle-shared-ui/abi/tangle';
import {
  parseSchema,
  type SchemaField,
} from '@tangle-network/tangle-shared-ui/codec';
import { useChainId, usePublicClient } from 'wagmi';
import { zeroAddress } from 'viem';

interface BlueprintDefinitionContractResponse {
  requestSchema: `0x${string}`;
}

export interface BlueprintRequestSchemaResult {
  requestSchema: `0x${string}` | null;
  parsedRequestSchema: SchemaField[];
  requestSchemaParseError: string | null;
}

const EMPTY_SCHEMA_RESULT: BlueprintRequestSchemaResult = {
  requestSchema: null,
  parsedRequestSchema: [],
  requestSchemaParseError: null,
};

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
        return EMPTY_SCHEMA_RESULT;
      }

      const tangleAddress = contracts.tangle;
      if (tangleAddress === zeroAddress) {
        return EMPTY_SCHEMA_RESULT;
      }

      const definition = (await publicClient.readContract({
        address: tangleAddress,
        abi: TANGLE_ABI,
        functionName: 'getBlueprintDefinition',
        args: [blueprintId],
      })) as BlueprintDefinitionContractResponse;

      const requestSchema = definition.requestSchema ?? null;
      if (!requestSchema || requestSchema === ('0x' as `0x${string}`)) {
        return {
          requestSchema,
          parsedRequestSchema: [],
          requestSchemaParseError: null,
        };
      }

      try {
        return {
          requestSchema,
          parsedRequestSchema: parseSchema(requestSchema),
          requestSchemaParseError: null,
        };
      } catch (error) {
        return {
          requestSchema,
          parsedRequestSchema: [],
          requestSchemaParseError:
            error instanceof Error
              ? error.message
              : 'Unknown schema parse error',
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
