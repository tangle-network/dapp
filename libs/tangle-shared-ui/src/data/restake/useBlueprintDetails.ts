'use client';

import type { Option } from '@polkadot/types';
import type { TanglePrimitivesServicesOperatorPreferences } from '@polkadot/types/lookup';
import { ZERO_BIG_INT } from '@tangle-network/dapp-config';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { useCallback } from 'react';
import { combineLatest, of, switchMap } from 'rxjs';
import useNetworkStore from '../../context/useNetworkStore';
import useRestakeDelegatorInfo from '../../data/restake/useRestakeDelegatorInfo';
import useRestakeTVL from '../../data/restake/useRestakeTVL';
import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { RestakeOperator } from '../../types';
import type { Blueprint } from '../../types/blueprint';
import { TangleError, TangleErrorCode } from '../../types/error';
import type { OperatorMap, RestakeAssetMap } from '../../types/restake';
import {
  getAccountInfo,
  getMultipleAccountInfo,
} from '../../utils/polkadot/identity';
import delegationsToVaultTokens from '../../utils/restake/delegationsToVaultTokens';
import { extractOperatorData } from '../blueprints/utils/blueprintHelpers';
import { toPrimitiveBlueprint } from '../blueprints/utils/toPrimitiveBlueprint';
import useRestakeOperatorMap from './useRestakeOperatorMap';
import useRestakeAssets from './useRestakeAssets';

export default function useBlueprintDetails(id?: string) {
  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);
  const assets = useRestakeAssets();
  const { operatorMap } = useRestakeOperatorMap();
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const activeSubstrateAddress = useSubstrateAddress(false);

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
        ) {
          // TODO: Should return the error here instead of throw it
          throw new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);
        }

        if (id === undefined) {
          return of(null);
        }

        const blueprintDetails$ = apiRx.query.services.blueprints(id);

        const operatorEntries$ =
          apiRx.query.services.operators.entries<
            Option<TanglePrimitivesServicesOperatorPreferences>
          >();

        return combineLatest([blueprintDetails$, operatorEntries$]).pipe(
          switchMap(async ([blueprintDetails, operatorEntries]) => {
            if (blueprintDetails.isNone) {
              return null;
            }

            const idNumber = Number(id);
            const [ownerAccount, serviceBlueprint] = blueprintDetails.unwrap();
            const owner = ownerAccount.toString();

            const { metadata, registrationParams } =
              toPrimitiveBlueprint(serviceBlueprint);

            const {
              blueprintOperatorMap,
              blueprintRestakersMap,
              blueprintTVLMap,
            } = extractOperatorData(operatorEntries, operatorMap, operatorTVL);

            const info = await getAccountInfo(rpcEndpoint, owner);
            const operatorsSet = blueprintOperatorMap.get(idNumber);

            const details: Blueprint = {
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

                if (blueprintTVL === undefined) {
                  return null;
                }

                return `$${blueprintTVL.toLocaleString()}`;
              })(),
              githubUrl: metadata.codeRepository,
              websiteUrl: metadata.website,
              twitterUrl: info?.twitter ?? null,
              email: info?.email ?? null,
              registrationParams,
              // TODO: Determine `isBoosted` value.
              isBoosted: false,
            };

            const operators =
              operatorsSet !== undefined
                ? await getBlueprintOperators(
                    rpcEndpoint,
                    assets,
                    operatorsSet,
                    operatorMap,
                    operatorTVL,
                    operatorConcentration,
                    activeSubstrateAddress,
                  )
                : [];

            return {
              details,
              operators,
            };
          }),
        );
      },
      [
        id,
        operatorMap,
        operatorTVL,
        rpcEndpoint,
        assets,
        operatorConcentration,
        activeSubstrateAddress,
      ],
    ),
  );
}

async function getBlueprintOperators(
  rpcEndpoint: string,
  assetMap: RestakeAssetMap,
  operatorAccountSet: Set<SubstrateAddress>,
  operatorMap: OperatorMap,
  operatorTVL: Record<string, number>,
  operatorConcentration: Record<string, number | null>,
  activeSubstrateAddress: SubstrateAddress | null,
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
    const selfBondedAmount = operatorMap[address]?.stake ?? ZERO_BIG_INT;

    const isDelegated =
      activeSubstrateAddress !== null &&
      delegations.some(
        // TODO: We should implement a better way to compare addresses.
        (delegate) => delegate.delegatorAccountId === activeSubstrateAddress,
      );

    return {
      address,
      identityName: info?.name ?? undefined,
      concentrationPercentage,
      restakersCount: operatorMap[address]?.restakersCount,
      selfBondedAmount,
      tvlInUsd,
      vaultTokens: delegationsToVaultTokens(delegations, assetMap),
      isDelegated,
    } satisfies RestakeOperator;
  });
}
