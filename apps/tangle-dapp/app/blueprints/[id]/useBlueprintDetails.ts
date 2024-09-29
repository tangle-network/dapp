import type { Option } from '@polkadot/types';
import type { TanglePrimitivesServicesOperatorPreferences } from '@polkadot/types/lookup';
import { useCallback } from 'react';
import { combineLatest, of, switchMap } from 'rxjs';

import useNetworkStore from '../../../context/useNetworkStore';
import { extractOperatorData } from '../../../data/blueprints/utils/blueprintHelpers';
import { toPrimitiveBlueprint } from '../../../data/blueprints/utils/toPrimitiveBlueprint';
import { useOperatorTVL } from '../../../data/restake/useOperatorTVL';
import useRestakeAssetMap from '../../../data/restake/useRestakeAssetMap';
import useRestakeOperatorMap from '../../../data/restake/useRestakeOperatorMap';
import useApiRx from '../../../hooks/useApiRx';
import type { Blueprint } from '../../../types/blueprint';
import { getAccountInfo } from '../../../utils/polkadot';

export default function useBlueprintDetails(id: string) {
  const { rpcEndpoint } = useNetworkStore();
  const { operatorMap } = useRestakeOperatorMap();
  const { assetMap } = useRestakeAssetMap();
  const { operatorTVL } = useOperatorTVL(operatorMap, assetMap);

  return useApiRx(
    useCallback(
      (apiRx) => {
        if (
          apiRx.query.services?.blueprints === undefined ||
          apiRx.query.services?.operators === undefined
        )
          return of(null);

        const blueprintDetails$ = apiRx.query.services.blueprints(id);
        const operatorEntries$ =
          apiRx.query.services.operators.entries<
            Option<TanglePrimitivesServicesOperatorPreferences>
          >();

        return combineLatest([blueprintDetails$, operatorEntries$]).pipe(
          switchMap(async ([blueprintDetails, operatorEntries]) => {
            if (blueprintDetails.isNone) return null;

            const idNumber = Number(id);
            const [ownerAccount, serviceBlueprint] = blueprintDetails.unwrap();
            const owner = ownerAccount.toString();
            const { metadata } = toPrimitiveBlueprint(serviceBlueprint);

            const {
              blueprintOperatorMap,
              blueprintRestakersMap,
              blueprintTVLMap,
            } = extractOperatorData(operatorEntries, operatorMap, operatorTVL);

            const info = await getAccountInfo(rpcEndpoint, owner);

            return {
              id,
              name: metadata.name,
              description: metadata.description,
              author: metadata.author ?? owner,
              imgUrl: metadata.logo,
              category: metadata.category,
              restakersCount: blueprintRestakersMap.get(idNumber)?.size ?? null,
              operatorsCount: blueprintOperatorMap.get(idNumber)?.size ?? null,
              tvl: (() => {
                const blueprintTVL = blueprintTVLMap.get(idNumber);

                if (blueprintTVL === undefined) return null;

                return `$${blueprintTVL.toLocaleString()}`;
              })(),
              githubUrl: metadata.codeRepository,
              websiteUrl: metadata.website,
              twitterUrl: info?.twitter ?? null,
              email: info?.email ?? null,
              // TODO: Determine `isBoosted` value.
              isBoosted: false,
            } satisfies Blueprint;
          }),
        );
      },
      [id, operatorMap, operatorTVL, rpcEndpoint],
    ),
  );
}
