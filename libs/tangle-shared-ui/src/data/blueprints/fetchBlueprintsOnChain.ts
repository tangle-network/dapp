import type { Address, PublicClient } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TANGLE_ABI from '../../abi/tangle';
import type { Blueprint } from '../graphql/useBlueprints';

/**
 * Direct-chain fallback for listing blueprints when the Envio GraphQL
 * indexer is unavailable (no endpoint configured for the network, or
 * the indexer is lagging / down).
 *
 * Reads `Tangle.blueprintCount()` and then `getBlueprint(id)` /
 * `getBlueprintDefinition(id)` for each id in the registry.
 *
 * O(N) RPC roundtrips — fine for the testnet scale (currently 13
 * blueprints on Base Sepolia). At production scale this should be
 * replaced with a hosted indexer, not paginated chain reads.
 *
 * The returned shape matches `Blueprint` (the same type the GraphQL
 * path returns) so consumers don't need to branch on the data source.
 * Fields the indexer tracks but the chain doesn't expose directly
 * (`updatedAt`, `id` string) get sensible defaults: `updatedAt =
 * createdAt`, and `id` is the stringified blueprintId.
 */
export const fetchBlueprintsOnChain = async (
  publicClient: PublicClient,
  chainId: number,
  options?: { limit?: number; activeOnly?: boolean },
): Promise<Blueprint[]> => {
  const contracts = getContractsByChainId(chainId);
  if (
    !contracts ||
    contracts.tangle === '0x0000000000000000000000000000000000000000'
  ) {
    return [];
  }

  const tangleAddress = contracts.tangle as Address;
  const { limit = 100, activeOnly = true } = options ?? {};

  const total = (await publicClient.readContract({
    address: tangleAddress,
    abi: TANGLE_ABI,
    functionName: 'blueprintCount',
  })) as bigint;

  if (total === BigInt(0)) {
    return [];
  }

  const upper = Math.min(Number(total), limit);
  const ids = Array.from({ length: upper }, (_, i) => BigInt(i));

  // Batch both reads per id via Promise.all — viem's PublicClient handles
  // request batching automatically when the transport supports it.
  const rows = await Promise.all(
    ids.map(async (id) => {
      try {
        const [blueprint, definition] = await Promise.all([
          publicClient.readContract({
            address: tangleAddress,
            abi: TANGLE_ABI,
            functionName: 'getBlueprint',
            args: [id],
          }) as Promise<{
            owner: Address;
            manager: Address;
            createdAt: bigint;
            operatorCount: number;
            active: boolean;
          }>,
          publicClient.readContract({
            address: tangleAddress,
            abi: TANGLE_ABI,
            functionName: 'getBlueprintDefinition',
            args: [id],
          }) as Promise<{
            metadataUri: string;
            metadataHash: `0x${string}`;
          }>,
        ]);

        const result: Blueprint = {
          id: id.toString(),
          blueprintId: id,
          owner: blueprint.owner,
          manager: blueprint.manager,
          metadataUri: definition.metadataUri || null,
          metadataHash:
            definition.metadataHash &&
            definition.metadataHash !==
              '0x0000000000000000000000000000000000000000000000000000000000000000'
              ? definition.metadataHash
              : null,
          active: blueprint.active,
          createdAt: BigInt(blueprint.createdAt),
          // `updatedAt` is tracked off-chain by the indexer (event log of
          // updateBlueprint calls). Without that, the best we can do is
          // surface the original createdAt so downstream sorts behave
          // predictably; the value is honest about "not seen any
          // updates since creation".
          updatedAt: BigInt(blueprint.createdAt),
          operatorCount: BigInt(blueprint.operatorCount),
        };
        return result;
      } catch {
        // A single failed blueprint shouldn't take down the whole list —
        // e.g. a deactivated entry the contract chose to drop from
        // getBlueprint. Surface a placeholder so the catalog still
        // renders the others.
        return null;
      }
    }),
  );

  const blueprints: Blueprint[] = [];
  for (const row of rows) {
    if (row === null) continue;
    if (activeOnly && !row.active) continue;
    blueprints.push(row);
  }
  return blueprints;
};

export const fetchBlueprintByIdOnChain = async (
  publicClient: PublicClient,
  chainId: number,
  blueprintId: bigint,
): Promise<Blueprint | null> => {
  const contracts = getContractsByChainId(chainId);
  if (
    !contracts ||
    contracts.tangle === '0x0000000000000000000000000000000000000000'
  ) {
    return null;
  }

  const tangleAddress = contracts.tangle as Address;

  try {
    const [blueprint, definition] = await Promise.all([
      publicClient.readContract({
        address: tangleAddress,
        abi: TANGLE_ABI,
        functionName: 'getBlueprint',
        args: [blueprintId],
      }) as Promise<{
        owner: Address;
        manager: Address;
        createdAt: bigint;
        operatorCount: number;
        active: boolean;
      }>,
      publicClient.readContract({
        address: tangleAddress,
        abi: TANGLE_ABI,
        functionName: 'getBlueprintDefinition',
        args: [blueprintId],
      }) as Promise<{
        metadataUri: string;
        metadataHash: `0x${string}`;
      }>,
    ]);

    return {
      id: blueprintId.toString(),
      blueprintId,
      owner: blueprint.owner,
      manager: blueprint.manager,
      metadataUri: definition.metadataUri || null,
      metadataHash:
        definition.metadataHash &&
        definition.metadataHash !==
          '0x0000000000000000000000000000000000000000000000000000000000000000'
          ? definition.metadataHash
          : null,
      active: blueprint.active,
      createdAt: BigInt(blueprint.createdAt),
      updatedAt: BigInt(blueprint.createdAt),
      operatorCount: BigInt(blueprint.operatorCount),
    };
  } catch {
    return null;
  }
};
