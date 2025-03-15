import { useCallback } from 'react';
import { toPrimitiveBlueprint } from './utils/toPrimitiveBlueprint';
import toPrimitiveService from './utils/toPrimitiveService';
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

export default function useMonitoringBlueprints(
  operatorAccountAddress?: string,
) {
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

        const instanceEntries$ =
          apiRx.query.services.instances.entries<
            Option<TanglePrimitivesServicesService>
          >();

        return combineLatest([
          apiRx.rpc.services.queryServicesWithBlueprintsByOperator(
            operatorAccountAddress,
          ),
          instanceEntries$,
        ]).pipe(
          map(([servicesWithBlueprintsVec, instanceEntries]) => {
            return [
              servicesWithBlueprintsVec.map(
                ({ blueprintId, blueprint, services }) => {
                  return {
                    blueprintId: blueprintId.toNumber(),
                    blueprint: toPrimitiveBlueprint(blueprint),
                    services: services.map(toPrimitiveService),
                  };
                },
              ),
              instanceEntries.map(([instanceId, serviceInstance]) => {
                return {
                  instanceId: instanceId.args[0].toNumber(),
                  serviceInstance: serviceInstance.isSome
                    ? toPrimitiveService(serviceInstance.unwrap())
                    : null,
                };
              }),
            ];
          }),
          map(([servicesWithBlueprintsVec, serviceInstances]) => {
            return servicesWithBlueprintsVec.map((servicesWithBlueprint) =>
              createMonitoringBlueprint(
                servicesWithBlueprint as OperatorBlueprint,
                serviceInstances as ServiceInstance[],
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
      [operatorAccountAddress],
    ),
  );

  return {
    blueprints: (result ?? []) as MonitoringBlueprint[],
    ...rest,
  };
}
