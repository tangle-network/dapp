import type { Address, PublicClient } from 'viem';
import {
  getTntCoreRevisionByChainId,
  type TntCoreRevision,
} from '@tangle-network/dapp-config/contracts';
import TANGLE_ABI from '../../abi/tangle';

/**
 * tnt-core 0.18 `Types.Blueprint` — `operatorCount` was removed from the
 * struct (derived from the operator set via `blueprintOperatorCount`), so the
 * legacy 7-field tuple in the synced ABI throws on 0.18 returndata and this
 * 6-field variant throws on legacy returndata. Selection is keyed by the
 * per-chain `TntCoreRevision`; do not merge the two entries into one ABI.
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
    const blueprint = (await publicClient.readContract({
      address: tangleAddress,
      abi: TANGLE_ABI,
      functionName: 'getBlueprint',
      args: [blueprintId],
    })) as {
      owner: Address;
      manager: Address;
      createdAt: bigint;
      operatorCount: number;
      active: boolean;
    };
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
