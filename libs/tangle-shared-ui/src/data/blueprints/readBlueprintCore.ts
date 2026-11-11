import type { Address, PublicClient } from 'viem';
import {
  getTntCoreRevisionByChainId,
  type TntCoreRevision,
} from '@tangle-network/dapp-config/contracts';
import TANGLE_ABI from '../../abi/tangle';

/**
 * Pre-0.18 `Types.Blueprint` — the 7-field struct that still carries
 * `operatorCount`. Kept as a local fragment because the synced `TANGLE_ABI` is
 * now the 0.19 shape (operatorCount moved to the `blueprintOperatorCount` view
 * in 0.18), so decoding legacy returndata against the synced ABI throws.
 */
const GET_BLUEPRINT_LEGACY_ABI = [
  {
    type: 'function',
    name: 'getBlueprint',
    stateMutability: 'view',
    inputs: [{ name: 'blueprintId', type: 'uint64' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'owner', type: 'address' },
          { name: 'manager', type: 'address' },
          { name: 'createdAt', type: 'uint64' },
          // Legacy `Types.Blueprint.operatorCount` is `uint32`, not `uint64`
          // (confirmed against the pre-#194 Solidity struct). A wrong width
          // here mis-aligns the packed tail (membership/pricing/active), so it
          // must match the on-chain type exactly.
          { name: 'operatorCount', type: 'uint32' },
          { name: 'membership', type: 'uint8' },
          { name: 'pricing', type: 'uint8' },
          { name: 'active', type: 'bool' },
        ],
      },
    ],
  },
] as const;

/**
 * tnt-core 0.18+ `Types.Blueprint` — `operatorCount` was removed from the
 * struct (derived from the operator set via `blueprintOperatorCount`), so this
 * 6-field variant throws on legacy returndata and the legacy 7-field variant
 * throws on 0.18/0.19 returndata. Selection is keyed by the per-chain
 * `TntCoreRevision`; do not merge the two entries into one ABI. The 0.19 struct
 * is identical to 0.18 for these fields, so v018 and v019 share this ABI.
 */
const GET_BLUEPRINT_V018_ABI = [
  {
    type: 'function',
    name: 'getBlueprint',
    stateMutability: 'view',
    inputs: [{ name: 'blueprintId', type: 'uint64' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'owner', type: 'address' },
          { name: 'manager', type: 'address' },
          { name: 'createdAt', type: 'uint64' },
          { name: 'membership', type: 'uint8' },
          { name: 'pricing', type: 'uint8' },
          { name: 'active', type: 'bool' },
        ],
      },
    ],
  },
] as const;

export type BlueprintCore = {
  owner: Address;
  manager: Address;
  createdAt: bigint;
  active: boolean;
  operatorCount: bigint;
};

/**
 * Revision-aware read of a blueprint's core fields.
 *
 * `legacy`: one `getBlueprint` call; `operatorCount` comes from the struct.
 * `v018`: `getBlueprint` (6-field tuple) + the `blueprintOperatorCount` view.
 */
export const readBlueprintCore = async (
  publicClient: PublicClient,
  tangleAddress: Address,
  blueprintId: bigint,
  chainId: number,
): Promise<BlueprintCore> => {
  const revision: TntCoreRevision = getTntCoreRevisionByChainId(chainId);

  if (revision === 'legacy') {
    const blueprint = await publicClient.readContract({
      address: tangleAddress,
      abi: GET_BLUEPRINT_LEGACY_ABI,
      functionName: 'getBlueprint',
      args: [blueprintId],
    });
    return {
      owner: blueprint.owner,
      manager: blueprint.manager,
      createdAt: BigInt(blueprint.createdAt),
      active: blueprint.active,
      operatorCount: BigInt(blueprint.operatorCount),
    };
  }

  const [blueprint, operatorCount] = await Promise.all([
    publicClient.readContract({
      address: tangleAddress,
      abi: GET_BLUEPRINT_V018_ABI,
      functionName: 'getBlueprint',
      args: [blueprintId],
    }),
    publicClient.readContract({
      address: tangleAddress,
      abi: TANGLE_ABI,
      functionName: 'blueprintOperatorCount',
      args: [blueprintId],
    }) as Promise<bigint>,
  ]);
  return {
    owner: blueprint.owner,
    manager: blueprint.manager,
    createdAt: BigInt(blueprint.createdAt),
    active: blueprint.active,
    operatorCount,
  };
};
