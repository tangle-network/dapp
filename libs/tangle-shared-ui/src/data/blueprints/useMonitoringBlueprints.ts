import { useCallback } from 'react';
import { toPrimitiveBlueprint } from './utils/toPrimitiveBlueprint';
import { toPrimitiveService } from './utils/toPrimitiveService';
import { catchError, combineLatest, map, of } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import { TangleError, TangleErrorCode } from '../../types/error';
import {
  MonitoringBlueprint,
  OperatorBlueprint,
  ServiceInstance,
} from './utils/type';
import { createMonitoringBlueprint } from './utils/blueprintHelpers';
import { Option } from '@polkadot/types';
import { TanglePrimitivesServicesService } from '@polkadot/types/lookup';
import useOperatorTvl from '../restake/useOperatorTvl';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

const useMonitoringBlueprints = (
  operatorAccountAddress?: SubstrateAddress | null,
) => {
  const { operatorTvlByAsset } = useOperatorTvl();

  const { result, ...rest } = useApiRx(
    useCallback(
      (apiRx) => {
        if (
          apiRx.rpc?.services?.queryServicesWithBlueprintsByOperator ===
            undefined ||
          apiRx.query.services?.instances === undefined
        )
          return new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);

        if (!operatorAccountAddress) {
          return of<MonitoringBlueprint[]>([]);
        }

        const operatorInstanceEntries$ =
          apiRx.query.services.instances.entries<
            Option<TanglePrimitivesServicesService>
          >();

        const operatorServiceInstances$ = operatorInstanceEntries$.pipe(
          map((entries) =>
            entries.map(
              (entry): ServiceInstance => ({
                instanceId: entry[0].args[0].toBigInt(),
                serviceInstance: entry[1].isSome
                  ? toPrimitiveService(entry[1].unwrap())
                  : undefined,
              }),
            ),
          ),
        );

        const servicesWithBlueprints$ = apiRx.rpc.services
          .queryServicesWithBlueprintsByOperator(operatorAccountAddress)
          .pipe(
            map((vec) =>
              vec.map(
                (item): OperatorBlueprint => ({
                  blueprintId: item.blueprintId.toBigInt(),
                  blueprint: toPrimitiveBlueprint(item.blueprint),
                  services: item.services.map(toPrimitiveService),
                }),
              ),
            ),
          );

        const runningInstanceEntries$ =
          apiRx.query.services.instances.entries();

        return combineLatest([
          servicesWithBlueprints$,
          operatorServiceInstances$,
          runningInstanceEntries$,
        ]).pipe(
          map(([blueprints, operatorInstances, runningInstanceEntries]) => {
            // Mapping from blueprint ID to service instance.
            const runningInstancesMap = new Map<bigint, ServiceInstance[]>();

            for (const [
              instanceId,
              mayBeServiceInstance,
            ] of runningInstanceEntries) {
              const serviceInstanceId = instanceId.args[0].toBigInt();

              if (mayBeServiceInstance.isNone) {
                continue;
              }

              const instanceData = toPrimitiveService(
                mayBeServiceInstance.unwrap(),
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
                blueprint.services,
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
      [operatorAccountAddress, operatorTvlByAsset],
    ),
  );

  return {
    result,
    ...rest,
  };
};

export default useMonitoringBlueprints;
