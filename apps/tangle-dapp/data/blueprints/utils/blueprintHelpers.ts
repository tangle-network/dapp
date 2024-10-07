import type { Option, StorageKey, u64 } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces';
import type {
  TanglePrimitivesServicesOperatorPreferences,
  TanglePrimitivesServicesServiceBlueprint,
} from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';
import merge from 'lodash/merge';

import type { Blueprint } from '../../../types/blueprint';
import type { OperatorMap } from '../../../types/restake';
import {
  getMultipleAccountInfo,
  type IdentityType,
} from '../../../utils/polkadot';
import { toPrimitiveBlueprint } from './toPrimitiveBlueprint';

export function extractBlueprintsData(
  blueprintEntries: [
    StorageKey<[u64]>,
    Option<ITuple<[AccountId32, TanglePrimitivesServicesServiceBlueprint]>>,
  ][],
) {
  const blueprintsMap = new Map<
    number,
    ReturnType<typeof toPrimitiveBlueprint> & { owner: string }
  >();
  const ownerSet = new Set<string>();

  for (const [key, value] of blueprintEntries) {
    const id = key.args[0].toNumber();

    if (value.isNone) continue;

    const [ownerAccountId32, serviceBlueprint] = value.unwrap();
    const owner = ownerAccountId32.toString();

    const primitiveBlueprint = toPrimitiveBlueprint(serviceBlueprint);
    blueprintsMap.set(id, merge(primitiveBlueprint, { owner }));
    ownerSet.add(owner);
  }

  return { blueprintsMap, ownerSet };
}

export function extractOperatorData(
  operatorEntries: [
    StorageKey<[u64, AccountId32]>,
    Option<TanglePrimitivesServicesOperatorPreferences>,
  ][],
  operatorMap: OperatorMap,
  operatorTVL: Record<string, number>,
) {
  const blueprintOperatorMap = new Map<number, Set<string>>();
  const blueprintRestakersMap = new Map<number, Set<string>>();
  const blueprintTVLMap = new Map<number, number>();

  for (const [key, value] of operatorEntries) {
    if (value.isNone) continue;

    const [blueprintIdU64, operatorAccountId32] = key.args;
    const blueprintId = blueprintIdU64.toNumber();
    const operatorAccount = operatorAccountId32.toString();

    const operatorSet = blueprintOperatorMap.get(blueprintId);

    if (operatorSet === undefined) {
      blueprintOperatorMap.set(blueprintId, new Set([operatorAccount]));
    } else {
      operatorSet.add(operatorAccount);
    }

    const operator = operatorMap[operatorAccount];
    if (operator !== undefined) {
      const restakerSet = blueprintRestakersMap.get(blueprintId);
      if (restakerSet === undefined) {
        blueprintRestakersMap.set(
          blueprintId,
          new Set(operator.delegations.map((d) => d.delegatorAccountId)),
        );
      } else {
        operator.delegations.forEach(({ delegatorAccountId }) => {
          restakerSet.add(delegatorAccountId);
        });
      }
    }

    if (operatorTVL[operatorAccount] !== undefined) {
      const currentTVL = blueprintTVLMap.get(blueprintId) ?? 0;
      blueprintTVLMap.set(
        blueprintId,
        currentTVL + operatorTVL[operatorAccount],
      );
    }
  }

  return { blueprintOperatorMap, blueprintRestakersMap, blueprintTVLMap };
}

export function createBlueprintObjects(
  blueprintsMap: ReturnType<typeof extractBlueprintsData>['blueprintsMap'],
  blueprintOperatorMap: ReturnType<
    typeof extractOperatorData
  >['blueprintOperatorMap'],
  blueprintRestakersMap: ReturnType<
    typeof extractOperatorData
  >['blueprintRestakersMap'],
  blueprintTVLMap: ReturnType<typeof extractOperatorData>['blueprintTVLMap'],
  ownerIdentitiesMap: Awaited<ReturnType<typeof fetchOwnerIdentities>>,
): Blueprint[] {
  return Array.from(blueprintsMap.entries()).map(
    ([blueprintId, { metadata, owner }]) =>
      ({
        id: blueprintId.toString(),
        name: metadata.name,
        author: metadata.author ?? owner,
        description: metadata.description,
        imgUrl: metadata.logo,
        category: metadata.category,
        restakersCount: blueprintRestakersMap.get(blueprintId)?.size ?? null,
        operatorsCount: blueprintOperatorMap.get(blueprintId)?.size ?? null,
        tvl: blueprintTVLMap.get(blueprintId)?.toLocaleString() ?? null,
        githubUrl: metadata.codeRepository,
        websiteUrl: metadata.website,
        twitterUrl: ownerIdentitiesMap.get(owner)?.twitter,
        email: ownerIdentitiesMap.get(owner)?.email,
        // TODO: Determine `isBoosted` value.
        isBoosted: false,
      }) satisfies Blueprint,
  );
}

export async function fetchOwnerIdentities(
  rpcEndpoint: string,
  ownerSet: Set<string>,
) {
  const ownerArray = Array.from(ownerSet);
  const accountInfo = await getMultipleAccountInfo(rpcEndpoint, ownerArray);

  const ownerIdentitiesMap = new Map<string, IdentityType | null>();
  accountInfo.forEach((info, index) => {
    ownerIdentitiesMap.set(ownerArray[index], info);
  });

  return ownerIdentitiesMap;
}
