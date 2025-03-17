import type { Option, StorageKey, u64 } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces';
import {
  TanglePrimitivesServicesServiceServiceBlueprint,
  TanglePrimitivesServicesTypesOperatorPreferences,
} from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';
import merge from 'lodash/merge';
import type { Blueprint } from '../../../types/blueprint';
import { OperatorMap } from '../../../types/restake';
import {
  getMultipleAccountInfo,
  IdentityType,
} from '../../../utils/polkadot/identity';
import { toPrimitiveBlueprint } from './toPrimitiveBlueprint';
import {
  MonitoringBlueprint,
  OperatorBlueprint,
  ServiceInstance,
} from './type';
import { randNumber } from '@ngneat/falso';
import { RestakeAssetId } from '../../../types';

export function extractBlueprintsData(
  blueprintEntries: [
    StorageKey<[u64]>,
    Option<
      ITuple<[AccountId32, TanglePrimitivesServicesServiceServiceBlueprint]>
    >,
  ][],
) {
  const blueprintsMap = new Map<
    number,
    ReturnType<typeof toPrimitiveBlueprint> & { owner: string }
  >();

  const ownerSet = new Set<string>();

  for (const [key, value] of blueprintEntries) {
    const id = key.args[0].toNumber();

    if (value.isNone) {
      continue;
    }

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
    Option<TanglePrimitivesServicesTypesOperatorPreferences>,
  ][],
  operatorMap: OperatorMap,
  operatorTVLByAsset: Record<string, Record<string, number>>,
  runningInstancesMap: Map<number, ServiceInstance[]>,
) {
  const blueprintOperatorMap = new Map<number, Set<SubstrateAddress>>();
  const blueprintRestakersMap = new Map<number, Set<string>>();
  const blueprintTVLMap = new Map<number, number>();

  for (const [key, value] of operatorEntries) {
    if (value.isNone) {
      continue;
    }

    const [blueprintIdU64, operatorAccountId32] = key.args;
    const blueprintId = blueprintIdU64.toNumber();

    const operatorAccount = assertSubstrateAddress(
      operatorAccountId32.toString(),
    );

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

    const operatorExposure = calculateBlueprintOperatorExposure(
      runningInstancesMap,
      blueprintId,
      operatorTVLByAsset,
    );
    blueprintTVLMap.set(blueprintId, operatorExposure);
  }

  return { blueprintOperatorMap, blueprintRestakersMap, blueprintTVLMap };
}

function calculateBlueprintOperatorExposure(
  runningInstancesMap: Map<number, ServiceInstance[]>,
  blueprintId: number,
  operatorTVLByAsset: Record<SubstrateAddress, Record<RestakeAssetId, number>>,
) {
  const PERCENT_DIVISOR = 100;

  let blueprintTVL = 0;

  const instances = runningInstancesMap.get(blueprintId);
  if (instances === undefined) {
    return 0;
  }

  for (const instance of instances) {
    const operatorExposure =
      instance.serviceInstance?.operatorSecurityCommitments?.reduce(
        (acc, commitment) => {
          const operatorTVL = operatorTVLByAsset[commitment.operator];
          if (operatorTVL === undefined) {
            return acc;
          }

          const exposureAmount = commitment.securityCommitments.reduce(
            (acc, securityCommitment) => {
              const exposurePercent =
                (operatorTVL[securityCommitment.asset] *
                  securityCommitment.exposurePercent) /
                PERCENT_DIVISOR;
              return acc + exposurePercent;
            },
            0,
          );

          return acc + exposureAmount;
        },
        0,
      );

    if (operatorExposure === undefined) {
      continue;
    }

    blueprintTVL += operatorExposure;
  }

  return blueprintTVL;
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
): Record<string, Blueprint> {
  return Array.from(blueprintsMap.entries()).reduce(
    (acc, [blueprintId, { metadata, owner, registrationParams }]) => {
      acc[blueprintId.toString()] = {
        id: blueprintId.toString(),
        name: metadata.name,
        author: metadata.author ?? owner,
        imgUrl: metadata.logo,
        description: metadata.description,
        registrationParams,
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
      };

      return acc;
    },
    {} as Record<string, Blueprint>,
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

// TODO: implement full features of this function
export function createMonitoringBlueprint(
  operatorBlueprints: OperatorBlueprint,
  serviceInstances: ServiceInstance[],
  operatorTVLByAsset: Record<string, Record<string, number>>,
  runningInstancesMap: Map<number, ServiceInstance[]>,
): MonitoringBlueprint {
  const totalOperator = operatorBlueprints.services.reduce((acc, service) => {
    return acc + service.operatorSecurityCommitments.length;
  }, 0);

  const instanceCount = serviceInstances.filter(
    (instance) =>
      instance.serviceInstance?.blueprint === operatorBlueprints.blueprintId,
  ).length;

  const blueprintTVL = calculateBlueprintOperatorExposure(
    runningInstancesMap,
    operatorBlueprints.blueprintId,
    operatorTVLByAsset,
  );

  const blueprintData = {
    ...operatorBlueprints.blueprint,
    instanceCount: instanceCount,
    operatorsCount: totalOperator,
    tvl: blueprintTVL,
    // TODO: get uptime from the graphql
    uptime: randNumber({ min: 0, max: 100 }),
  };

  const services = operatorBlueprints.services.map((service) => {
    const instanceId = serviceInstances.find(
      (instance) =>
        instance.serviceInstance?.blueprint ===
          operatorBlueprints.blueprintId &&
        instance.serviceInstance?.id === service.id,
    )?.instanceId;

    return {
      ...service,
      blueprintData: blueprintData,
      // TODO: get uptime from the graphql
      uptime: randNumber({ min: 0, max: 100 }),
      // TODO
      earned: randNumber({ min: 0, max: 1000000 }),
      // TODO
      earnedInUsd: randNumber({ min: 0, max: 1000000 }),
      // TODO: get last active from the graphql
      lastActive: new Date(),
      // TODO: may be update this
      externalInstanceId: instanceId ? `i-${instanceId}` : undefined,
      // TODO: get last active from the graphql
      createdAtBlock: randNumber({ min: 0, max: 10000 }),
    };
  });

  return {
    ...operatorBlueprints,
    blueprint: blueprintData,
    services: services,
  };
}
