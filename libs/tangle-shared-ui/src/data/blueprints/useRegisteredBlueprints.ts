import { useCallback, useMemo } from 'react';
import { toPrimitiveBlueprint } from './utils/toPrimitiveBlueprint';
import { toPrimitiveService } from './utils/toPrimitiveService';
import { catchError, combineLatest, map, of } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import { TangleError, TangleErrorCode } from '../../types/error';
import { MonitoringBlueprint, ServiceInstance } from './utils/type';
import { createMonitoringBlueprint } from './utils/blueprintHelpers';
import { Option } from '@polkadot/types';
import { TanglePrimitivesServicesService } from '@polkadot/types/lookup';
import useOperatorTVL from '../restake/useOperatorTvl';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

export default function useRegisteredBlueprints(
  operatorAccountAddress?: SubstrateAddress | null,
) {
  const { operatorTvlByAsset } = useOperatorTVL();

  const {
    result: registeredBlueprintIds,
    isLoading: isLoadingRegisteredBlueprintIds,
    error: errorRegisteredBlueprintIds,
  } = useApiRx(
    useCallback(
      (apiRx) => {
        if (apiRx.query.services?.operatorsProfile === undefined)
          return new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);

        if (!operatorAccountAddress) {
          return of<string[]>([]);
        }

        return apiRx.query.services
          ?.operatorsProfile(operatorAccountAddress)
          .pipe(
            map((operatorProfile) => {
              if (operatorProfile.isNone) {
                return [];
              }

              return <string[]>operatorProfile.unwrap().blueprints.toHuman();
            }),
            catchError((error) => {
              console.error(
                'Error querying services with blueprints by operator:',
                error,
              );
              return of<string[]>([]);
            }),
          );
      },
      [operatorAccountAddress],
    ),
  );

  const blueprintIds = useMemo(() => {
    return Array.isArray(registeredBlueprintIds)
      ? registeredBlueprintIds.map((id) => BigInt(id))
      : [];
  }, [registeredBlueprintIds]);

  const {
    result: blueprints,
    isLoading: isLoadingBlueprints,
    error: errorBlueprints,
  } = useApiRx(
    useCallback(
      (apiRx) => {
        if (apiRx.query.services?.blueprints === undefined)
          return new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);

        if (blueprintIds.length === 0) {
          return of<MonitoringBlueprint[]>([]);
        }

        const blueprints$ = apiRx.query.services.blueprints
          .multi(blueprintIds)
          .pipe(
            map((results) => {
              const blueprints = results
              .map((blueprintOpt, index) => {
                if (blueprintOpt.isNone) return null;
                const [owner, blueprint] = blueprintOpt.unwrap();
                return {
                  blueprintId: blueprintIds[index],
                  owner: owner.toHuman(),
                  blueprint: toPrimitiveBlueprint(blueprint),
                };
              });

              return blueprints.filter((b) => b !== null);
            }),
          );

        const operatorInstances$ = apiRx.query.services.instances
          .entries<Option<TanglePrimitivesServicesService>>()
          .pipe(
            map((entries): ServiceInstance[] =>
              entries.map(([key, optInstance]) => ({
                instanceId: key.args[0].toBigInt(),
                serviceInstance: optInstance.isSome
                  ? toPrimitiveService(optInstance.unwrap())
                  : undefined,
              })),
            ),
          );

        const runningInstanceEntries$ =
          apiRx.query.services.instances.entries();

        return combineLatest([
          blueprints$,
          operatorInstances$,
          runningInstanceEntries$,
        ]).pipe(
          map(([blueprints, operatorInstances, runningInstanceEntries]) => {
            // mapping from blueprint id to service instance
            const runningInstancesMap = new Map<bigint, ServiceInstance[]>();

            for (const [key, optServiceInstance] of runningInstanceEntries) {
              const serviceInstanceId = key.args[0].toBigInt();

              if (optServiceInstance.isNone) {
                continue;
              }

              const instanceData = toPrimitiveService(
                optServiceInstance.unwrap(),
              );
              runningInstancesMap.set(instanceData.blueprint, [
                ...(runningInstancesMap.get(instanceData.blueprint) ?? []),
                {
                  instanceId: serviceInstanceId,
                  serviceInstance: instanceData,
                },
              ]);
            }

            return blueprints.map((blueprint) =>
              createMonitoringBlueprint(
                blueprint.blueprintId,
                blueprint.blueprint,
                // registered blueprints do not have to care about services
                [],
                operatorInstances,
                operatorTvlByAsset,
                runningInstancesMap,
              ),
            );
          }),
          catchError((error) => {
            console.error(
              'Error querying services with blueprints by operator:',
              error,
            );
            return of<MonitoringBlueprint[]>([]);
          }),
        );
      },
      [blueprintIds, operatorTvlByAsset],
    ),
  );

  const error = useMemo(() => {
    if (errorRegisteredBlueprintIds) return errorRegisteredBlueprintIds;
    if (errorBlueprints) return errorBlueprints;
    return null;
  }, [errorRegisteredBlueprintIds, errorBlueprints]);

  return {
    result: blueprints,
    isLoading: isLoadingRegisteredBlueprintIds || isLoadingBlueprints,
    error,
  };
}
