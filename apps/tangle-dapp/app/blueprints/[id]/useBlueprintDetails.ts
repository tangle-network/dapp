import type { Option } from '@polkadot/types';
import type { TanglePrimitivesServicesOperatorPreferences } from '@polkadot/types/lookup';
import { useCallback } from 'react';
import { combineLatest, switchMap } from 'rxjs';

import useNetworkStore from '../../../context/useNetworkStore';
import { extractOperatorData } from '../../../data/blueprints/utils/blueprintHelpers';
import { toPrimitiveBlueprint } from '../../../data/blueprints/utils/toPrimitiveBlueprint';
import useRestakeAssetMap from '../../../data/restake/useRestakeAssetMap';
import useRestakeDelegatorInfo from '../../../data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '../../../data/restake/useRestakeOperatorMap';
import useRestakeTVL from '../../../data/restake/useRestakeTVL';
import useApiRx from '../../../hooks/useApiRx';
import type { Blueprint, Operator } from '../../../types/blueprint';
import { TangleError, TangleErrorCode } from '../../../types/error';
import type { AssetMap, OperatorMap } from '../../../types/restake';
import {
  getAccountInfo,
  getMultipleAccountInfo,
} from '../../../utils/polkadot';
import { delegationsToVaultTokens } from '../../restake/utils';

export default function useBlueprintDetails(id: string) {
  const { rpcEndpoint } = useNetworkStore();
  const { assetMap } = useRestakeAssetMap();

  const { operatorMap } = useRestakeOperatorMap();
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorTVL, operatorConcentration } = useRestakeTVL(
    operatorMap,
    delegatorInfo,
  );

  return useApiRx(
    useCallback(
      (apiRx) => {
        if (
          apiRx.query.services?.blueprints === undefined ||
          apiRx.query.services?.operators === undefined
        )
          // TODO: Should return the error here instead of throw it
          throw new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);

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

            const operatorsSet = blueprintOperatorMap.get(idNumber);

            const details = {
              id,
              name: metadata.name,
              description: metadata.description,
              author: metadata.author ?? owner,
              imgUrl: metadata.logo,
              category: metadata.category,
              restakersCount: blueprintRestakersMap.get(idNumber)?.size ?? null,
              operatorsCount: operatorsSet?.size ?? null,
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

            const operators =
              operatorsSet !== undefined
                ? await getBlueprintOperators(
                    rpcEndpoint,
                    assetMap,
                    operatorsSet,
                    operatorMap,
                    operatorTVL,
                    operatorConcentration,
                  )
                : [];

            return {
              details,
              operators,
            };
          }),
        );
      },
      // prettier-ignore
      [assetMap, id, operatorConcentration, operatorMap, operatorTVL, rpcEndpoint],
    ),
  );
}

async function getBlueprintOperators(
  rpcEndpoint: string,
  assetMap: AssetMap,
  operatorAccountSet: Set<string>,
  operatorMap: OperatorMap,
  operatorTVL: Record<string, number>,
  operatorConcentration: Record<string, number | null>,
) {
  const operatorAccountArr = Array.from(operatorAccountSet);

  const accountInfoArr = await getMultipleAccountInfo(
    rpcEndpoint,
    operatorAccountArr,
  );

  return operatorAccountArr.map((address, idx) => {
    const info = accountInfoArr[idx];
    const concentrationPercentage = operatorConcentration[address] ?? null;
    const tvlInUsd = operatorTVL[address] ?? null;
    const delegations = operatorMap[address].delegations ?? [];

    return {
      address,
      identityName: info?.name ?? 'Unknown',
      concentrationPercentage,
      restakersCount: operatorMap[address]?.restakersCount,
      tvlInUsd,
      vaultTokens: delegationsToVaultTokens(delegations, assetMap),
    } satisfies Operator;
  });
}
