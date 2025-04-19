import type { Option } from '@polkadot/types';
import type { TanglePrimitivesServicesTypesOperatorPreferences } from '@polkadot/types/lookup';
import { useCallback, useMemo } from 'react';
import { catchError, combineLatest, of, switchMap } from 'rxjs';
import useNetworkStore from '../../context/useNetworkStore';
import useApiRx from '../../hooks/useApiRx';
import { TangleError, TangleErrorCode } from '../../types/error';
import useOperatorTvl from '../restake/useOperatorTvl';
import useRestakeOperatorMap from '../restake/useRestakeOperatorMap';
import {
  createBlueprintObjects,
  extractBlueprintsData,
  extractOperatorData,
  fetchOwnerIdentities,
} from './utils/blueprintHelpers';
import type { ServiceInstance } from './utils/type';
import { toPrimitiveService } from './utils/toPrimitiveService';

const useAllBlueprints = () => {
  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);
  const { result: operatorMap } = useRestakeOperatorMap();
  const { operatorTvlByAsset } = useOperatorTvl();

  const { result, ...rest } = useApiRx(
    useCallback(
      (apiRx) => {
        if (
          apiRx.query.services?.blueprints === undefined ||
          apiRx.query.services?.operators === undefined
        ) {
          return new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);
        }

        const blueprintEntries$ = apiRx.query.services.blueprints.entries();

        const runningInstanceEntries$ =
          apiRx.query.services.instances.entries();

        const operatorEntries$ =
          apiRx.query.services.operators.entries<
            Option<TanglePrimitivesServicesTypesOperatorPreferences>
          >();

        return combineLatest([
          blueprintEntries$,
          runningInstanceEntries$,
          operatorEntries$,
        ]).pipe(
          switchMap(
            async ([
              blueprintEntries,
              runningInstanceEntries,
              operatorEntries,
            ]) => {
              const { blueprintsMap, ownerSet } =
                extractBlueprintsData(blueprintEntries);

              // TODO: This can likely be optimized to reduce request count.
              const ownerIdentitiesMap = await fetchOwnerIdentities(
                rpcEndpoint,
                ownerSet,
              );

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

                // TODO: Use lodash to merge arrays.
                runningInstancesMap.set(instanceData.blueprint, [
                  ...(runningInstancesMap.get(instanceData.blueprint) ?? []),
                  {
                    instanceId: serviceInstanceId,
                    serviceInstance: instanceData,
                  },
                ]);
              }

              const {
                blueprintOperatorMap,
                blueprintRestakersMap,
                blueprintTVLMap,
              } = extractOperatorData(
                operatorEntries,
                operatorMap,
                operatorTvlByAsset,
                runningInstancesMap,
              );

              return createBlueprintObjects(
                blueprintsMap,
                blueprintOperatorMap,
                blueprintRestakersMap,
                blueprintTVLMap,
                ownerIdentitiesMap,
              );
            },
          ),
          catchError((error) => {
            console.error('Error querying listing blueprints:', error);
            return of(null);
          }),
        );
      },
      [operatorMap, operatorTvlByAsset, rpcEndpoint],
    ),
  );

  const blueprints = useMemo(() => {
    return result ?? new Map();
  }, [result]);

  return {
    ...rest,
    blueprints,
  };
};

export default useAllBlueprints;
