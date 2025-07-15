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
  MonitoringServiceRequest,
  OperatorBlueprint,
  ServiceInstance,
} from './type';
import { randNumber } from '@ngneat/falso';
import { RestakeAssetId } from '../../../types';

export const extractBlueprintsData = (
  blueprintEntries: [
    StorageKey<[u64]>,
    Option<
      ITuple<[AccountId32, TanglePrimitivesServicesServiceServiceBlueprint]>
    >,
  ][],
) => {
  const blueprintsMap = new Map<
    bigint,
    ReturnType<typeof toPrimitiveBlueprint> & { owner: string }
  >();

  const ownerSet = new Set<string>();

  for (const [key, value] of blueprintEntries) {
    const id = key.args[0].toBigInt();

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
};

export function extractOperatorData(
  operatorEntries: [
    StorageKey<[u64, AccountId32]>,
    Option<TanglePrimitivesServicesTypesOperatorPreferences>,
  ][],
  operatorMap: OperatorMap,
  operatorTVLByAsset: Map<SubstrateAddress, Map<RestakeAssetId, number>>,
  runningInstancesMap: Map<bigint, ServiceInstance[]>,
) {
  const blueprintOperatorMap = new Map<bigint, Set<SubstrateAddress>>();
  const blueprintRestakersMap = new Map<bigint, Set<string>>();
  const blueprintTVLMap = new Map<bigint, number>();

  for (const [key, value] of operatorEntries) {
    if (value.isNone) {
      continue;
    }

    const [blueprintIdU64, operatorAccountId32] = key.args;
    const blueprintId = blueprintIdU64.toBigInt();

    const operatorAccount = assertSubstrateAddress(
      operatorAccountId32.toString(),
    );

    const operatorSet = blueprintOperatorMap.get(blueprintId);

    if (operatorSet === undefined) {
      blueprintOperatorMap.set(blueprintId, new Set([operatorAccount]));
    } else {
      operatorSet.add(operatorAccount);
    }

    const operator = operatorMap.get(operatorAccount);

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
  runningInstancesMap: Map<bigint, ServiceInstance[]>,
  blueprintId: bigint,
  operatorTVLByAsset: Map<SubstrateAddress, Map<RestakeAssetId, number>>,
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
          const operatorTVL = operatorTVLByAsset.get(commitment.operator);
          if (operatorTVL === undefined) {
            return acc;
          }

          const exposureAmount = commitment.securityCommitments.reduce(
            (acc, securityCommitment) => {
              const assetTVL = operatorTVL.get(securityCommitment.asset);
              if (assetTVL === undefined) {
                return acc;
              }

              const exposurePercent =
                (assetTVL * securityCommitment.exposurePercent) /
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

export const createBlueprintObjects = (
  blueprintsMap: ReturnType<typeof extractBlueprintsData>['blueprintsMap'],
  blueprintOperatorMap: ReturnType<
    typeof extractOperatorData
  >['blueprintOperatorMap'],
  blueprintRestakersMap: ReturnType<
    typeof extractOperatorData
  >['blueprintRestakersMap'],
  blueprintTVLMap: ReturnType<typeof extractOperatorData>['blueprintTVLMap'],
  ownerIdentitiesMap: Awaited<ReturnType<typeof fetchOwnerIdentities>>,
  runningInstancesMap: Map<bigint, ServiceInstance[]>,
): Map<string, Blueprint> => {
  const blueprintMap = new Map<string, Blueprint>();

  for (const [
    blueprintId,
    { metadata, owner, registrationParams },
  ] of blueprintsMap.entries()) {
    const instancesCount = runningInstancesMap.get(blueprintId)?.length ?? null;

    blueprintMap.set(blueprintId.toString(), {
      id: blueprintId,
      name: metadata.name,
      author: metadata.author ?? owner,
      deployer: owner,
      imgUrl: metadata.logo,
      description: metadata.description,
      registrationParams,
      category: metadata.category,
      instancesCount,
      operatorsCount: blueprintOperatorMap.get(blueprintId)?.size ?? null,
      restakersCount: blueprintRestakersMap.get(blueprintId)?.size ?? null,
      tvl: blueprintTVLMap.get(blueprintId)?.toLocaleString() ?? null,
      githubUrl: metadata.codeRepository,
      websiteUrl: metadata.website,
      twitterUrl: ownerIdentitiesMap.get(owner)?.twitter,
      email: ownerIdentitiesMap.get(owner)?.email,
      // TODO: Determine `isBoosted` value.
      isBoosted: false,
      requestParams: registrationParams,
    });
  }

  return blueprintMap;
};

export const fetchOwnerIdentities = async (
  rpcEndpoints: string[],
  ownerSet: Set<string>,
) => {
  const ownerArray = Array.from(ownerSet);
  const accountInfo = await getMultipleAccountInfo(rpcEndpoints, ownerArray);

  const ownerIdentitiesMap = new Map<string, IdentityType | null>();
  accountInfo.forEach((info, index) => {
    ownerIdentitiesMap.set(ownerArray[index], info);
  });

  return ownerIdentitiesMap;
};

// TODO: implement full features of this function
export function createMonitoringBlueprint(
  blueprintId: OperatorBlueprint['blueprintId'],
  operatorBlueprint: OperatorBlueprint['blueprint'],
  operatorServices: OperatorBlueprint['services'],
  serviceInstances: ServiceInstance[],
  operatorTVLByAsset: Map<SubstrateAddress, Map<RestakeAssetId, number>>,
  runningInstancesMap: Map<bigint, ServiceInstance[]>,
  owner?: string,
): MonitoringBlueprint {
  const filteredServiceInstances = serviceInstances.filter((instance) => {
    return instance.serviceInstance?.blueprint === blueprintId;
  });

  const totalOperator = filteredServiceInstances.reduce((acc, service) => {
    if (service.serviceInstance?.operatorSecurityCommitments) {
      return acc + service.serviceInstance.operatorSecurityCommitments.length;
    }

    return acc;
  }, 0);

  const instanceCount = serviceInstances.filter(
    (instance) => instance.serviceInstance?.blueprint === blueprintId,
  ).length;

  const blueprintTVL = calculateBlueprintOperatorExposure(
    runningInstancesMap,
    blueprintId,
    operatorTVLByAsset,
  );

  const blueprintData = {
    ...operatorBlueprint,
    instanceCount: instanceCount,
    operatorsCount: totalOperator,
    tvl: blueprintTVL,
    // TODO: get uptime from the graphql
    uptime: randNumber({ min: 0, max: 100 }),
    ...(owner && {
      metadata: {
        ...operatorBlueprint.metadata,
        owner,
      },
    }),
  };

  const services = operatorServices.map((service) => {
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
      // TODO: get last active from the graphql
      createdAtBlock: randNumber({ min: 0, max: 10000 }),
    };
  });

  return {
    blueprintId,
    blueprint: blueprintData,
    services,
  };
}

export const createPendingServiceRequests = (
  pendingServiceRequests: MonitoringServiceRequest[],
  blueprints: Array<{
    owner: string;
    blueprint: OperatorBlueprint['blueprint'];
  }>,
): MonitoringServiceRequest[] => {
  return pendingServiceRequests.map((pendingServiceRequest, idx) => {
    const blueprintWithOwner = blueprints[idx];

    if (!blueprintWithOwner) {
      console.warn(
        `Blueprint data missing for service request at index ${idx}. Blueprint ID: ${pendingServiceRequest.blueprint}`,
      );
    }

    return {
      ...pendingServiceRequest,
      // TODO: sum asset price
      pricing: Math.round(Math.random() * 10000),
      blueprintData: blueprintWithOwner
        ? {
            ...blueprintWithOwner.blueprint,
            metadata: {
              ...blueprintWithOwner.blueprint.metadata,
              owner: blueprintWithOwner.owner,
            },
          }
        : undefined,
    };
  });
};
