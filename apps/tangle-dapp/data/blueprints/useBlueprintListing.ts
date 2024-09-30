import type { Option } from '@polkadot/types';
import type { TanglePrimitivesServicesOperatorPreferences } from '@polkadot/types/lookup';
import { useCallback } from 'react';
import { combineLatest, switchMap } from 'rxjs';

import useNetworkStore from '../../context/useNetworkStore';
import useApiRx from '../../hooks/useApiRx';
import { useOperatorTVL } from '../restake/useOperatorTVL';
import useRestakeAssetMap from '../restake/useRestakeAssetMap';
import useRestakeOperatorMap from '../restake/useRestakeOperatorMap';
import {
  createBlueprintObjects,
  extractBlueprintsData,
  extractOperatorData,
  fetchOwnerIdentities,
} from './utils/blueprintHelpers';

export default function useBlueprintListing() {
  const { rpcEndpoint } = useNetworkStore();
  const { operatorMap } = useRestakeOperatorMap();
  const { assetMap } = useRestakeAssetMap();
  const { operatorTVL } = useOperatorTVL(operatorMap, assetMap);

  const { result, ...rest } = useApiRx(
    useCallback(
      (apiRx) => {
        if (
          apiRx.query.services?.blueprints === undefined ||
          apiRx.query.services?.operators === undefined
        ) {
          return null;
        }

        const blueprintEntries$ = apiRx.query.services.blueprints.entries();
        const operatorEntries$ =
          apiRx.query.services.operators.entries<
            Option<TanglePrimitivesServicesOperatorPreferences>
          >();

        return combineLatest([blueprintEntries$, operatorEntries$]).pipe(
          switchMap(async ([blueprintEntries, operatorEntries]) => {
            const { blueprintsMap, ownerSet } =
              extractBlueprintsData(blueprintEntries);

            const ownerIdentitiesMap = await fetchOwnerIdentities(
              rpcEndpoint,
              ownerSet,
            );

            const {
              blueprintOperatorMap,
              blueprintRestakersMap,
              blueprintTVLMap,
            } = extractOperatorData(operatorEntries, operatorMap, operatorTVL);

            return createBlueprintObjects(
              blueprintsMap,
              blueprintOperatorMap,
              blueprintRestakersMap,
              blueprintTVLMap,
              ownerIdentitiesMap,
            );
          }),
        );
      },
      [operatorMap, operatorTVL, rpcEndpoint],
    ),
  );

  return {
    ...rest,
    blueprints: result ?? [],
  };
}
