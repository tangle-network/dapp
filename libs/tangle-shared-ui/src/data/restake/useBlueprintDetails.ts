'use client';

import type { Option } from '@polkadot/types';
import { TanglePrimitivesServicesTypesOperatorPreferences } from '@polkadot/types/lookup';
import { ZERO_BIG_INT } from '@tangle-network/dapp-config';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { useCallback } from 'react';
import { combineLatest, of, switchMap } from 'rxjs';
import useNetworkStore from '../../context/useNetworkStore';
import useRestakeDelegatorInfo from '../../data/restake/useRestakeDelegatorInfo';
import useRestakeTvl from './useRestakeTvl';
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
import useRestakeAssets from './useRestakeAssets';
import useRestakeOperatorMap from './useRestakeOperatorMap';
import { ServiceInstance } from '../blueprints/utils/type';
import { toPrimitiveService } from '../blueprints/utils/toPrimitiveService';

const useBlueprintDetails = (id?: bigint) => {
  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);
  const { assets } = useRestakeAssets();
  const { result: operatorMap } = useRestakeOperatorMap();
  const { result: delegatorInfo } = useRestakeDelegatorInfo();
  const activeSubstrateAddress = useSubstrateAddress(false);

  const {
    operatorTvl: operatorTVL,
    operatorConcentration,
    operatorTvlByAsset: operatorTVLByAsset,
  } = useRestakeTvl(operatorMap, delegatorInfo);

  return useApiRx(
    useCallback(
      (api) => {
        if (
          api.query.services?.blueprints === undefined ||
          api.query.services?.operators === undefined
        ) {
          return new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);
        } else if (id === undefined) {
          return of(null);
        }

        const blueprintDetails$ = api.query.services.blueprints(id);

        const runningInstanceEntries$ = api.query.services.instances.entries();

        const operatorEntries$ =
          api.query.services.operators.entries<
            Option<TanglePrimitivesServicesTypesOperatorPreferences>
          >();

        return combineLatest([
          blueprintDetails$,
          runningInstanceEntries$,
          operatorEntries$,
        ]).pipe(
          switchMap(
            async ([
              blueprintDetails,
              runningInstanceEntries,
              operatorEntries,
            ]) => {
              if (blueprintDetails.isNone) {
                return null;
              }

              const [ownerAccount, serviceBlueprint] =
                blueprintDetails.unwrap();
              const owner = ownerAccount.toString();

              const { metadata, registrationParams, requestParams } =
                toPrimitiveBlueprint(serviceBlueprint);

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

                if (instanceData.blueprint !== id) {
                  continue;
                }

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

              const info = await getAccountInfo(rpcEndpoint, owner);
              const operatorsSet = blueprintOperatorMap.get(id);

              const details: Blueprint = {
                id,
                name: metadata.name,
                description: metadata.description,
                author: metadata.author ?? owner,
                imgUrl: metadata.logo,
                category: metadata.category,
                restakersCount: blueprintRestakersMap.get(id)?.size ?? null,
                operatorsCount: operatorsSet?.size ?? null,
                tvl: (() => {
                  const blueprintTVL = blueprintTVLMap.get(id);

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
                requestParams,
                deployer: owner,
                // TODO: Determine `isBoosted` value.
                isBoosted: false,
              };

              const operators =
                operatorsSet !== undefined && assets !== null
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
            },
          ),
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
        operatorTVLByAsset,
      ],
    ),
  );
};

async function getBlueprintOperators(
  rpcEndpoint: string,
  assetMap: RestakeAssetMap,
  operatorAccountSet: Set<SubstrateAddress>,
  operatorMap: OperatorMap,
  operatorTVL: Map<SubstrateAddress, number>,
  operatorConcentration: Map<SubstrateAddress, number | null>,
  activeSubstrateAddress: SubstrateAddress | null,
) {
  const operatorAccountArr = Array.from(operatorAccountSet);

  const accountInfoArr = await getMultipleAccountInfo(
    rpcEndpoint,
    operatorAccountArr,
  );

  return operatorAccountArr.map((address, idx) => {
    const info = accountInfoArr[idx];
    const concentrationPercentage = operatorConcentration.get(address) ?? null;
    const tvlInUsd = operatorTVL.get(address) ?? null;
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

export default useBlueprintDetails;
