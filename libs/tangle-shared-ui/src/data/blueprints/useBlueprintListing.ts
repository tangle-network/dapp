import type { Option } from '@polkadot/types';
import type { TanglePrimitivesServicesTypesOperatorPreferences } from '@polkadot/types/lookup';
import { useCallback } from 'react';
import { catchError, combineLatest, of, switchMap } from 'rxjs';

import useNetworkStore from '../../context/useNetworkStore';
import useApiRx from '../../hooks/useApiRx';
import { TangleError, TangleErrorCode } from '../../types/error';
import { useOperatorTVL } from '../restake/useOperatorTVL';
import useRestakeAssets from '../restake/useRestakeAssets';
import useRestakeOperatorMap from '../restake/useRestakeOperatorMap';
import {
  createBlueprintObjects,
  extractBlueprintsData,
  extractOperatorData,
  fetchOwnerIdentities,
} from './utils/blueprintHelpers';
import { ServiceInstance } from './utils/type';
import { toPrimitiveService } from './utils/toPrimitiveService';

export default function useBlueprintListing() {
  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);
  const { result: operatorMap } = useRestakeOperatorMap();
  const { assets } = useRestakeAssets();
  const { operatorTVLByAsset } = useOperatorTVL(operatorMap, assets);

  const { result, ...rest } = useApiRx(
    useCallback(
      (apiRx) => {
        if (
          apiRx.query.services?.blueprints === undefined ||
          apiRx.query.services?.operators === undefined
        ) {
          // TODO: Should return the error here instead of throw it
          throw new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);
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

              const ownerIdentitiesMap = await fetchOwnerIdentities(
                rpcEndpoint,
                ownerSet,
              );

              // mapping from blueprint id to service instance
              const runningInstancesMap = new Map<number, ServiceInstance[]>();

              for (const [
                instanceId,
                mayBeServiceInstance,
              ] of runningInstanceEntries) {
                const serviceInstanceId = instanceId.args[0].toNumber();

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

              const {
                blueprintOperatorMap,
                blueprintRestakersMap,
                blueprintTVLMap,
              } = extractOperatorData(
                operatorEntries,
                operatorMap,
                operatorTVLByAsset,
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
      [operatorMap, operatorTVLByAsset, rpcEndpoint],
    ),
  );

  return {
    ...rest,
    blueprints: result ?? {},
  };
}
