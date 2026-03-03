'use client';

import type { Option } from '@polkadot/types';
import { TanglePrimitivesServicesTypesOperatorPreferences } from '@polkadot/types/lookup';
import { ZERO_BIG_INT } from '@tangle-network/dapp-config';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { useCallback } from 'react';
import { combineLatest, of, switchMap } from 'rxjs';
import useNetworkStore from '../../context/useNetworkStore';
import useStakingDelegatorInfo from './useStakingDelegatorInfo';
import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { StakingOperator } from '../../types';
import type { Blueprint } from '../../types/blueprint';
import { TangleError, TangleErrorCode } from '../../types/error';
import type { OperatorMap, StakingAssetMap } from '../../types/staking';
import {
  getAccountInfo,
  getMultipleAccountInfo,
} from '../../utils/polkadot/identity';
import mapDelegationsToVaultTokens from '../staking/mapDelegationsToVaultTokens';
import { extractOperatorData } from '../blueprints/utils/blueprintHelpers';
import { toPrimitiveBlueprint } from '../blueprints/utils/toPrimitiveBlueprint';
import useSubstrateStakingAssets from './useStakingAssets';
import useStakingOperatorMap from './useStakingOperatorMap';
import { ServiceInstance } from '../blueprints/utils/type';
import { toPrimitiveService } from '../blueprints/utils/toPrimitiveService';
import useStakingTvl from './useStakingTvl';

const useBlueprintDetails = (id?: bigint) => {
  const rpcEndpoints = useNetworkStore((store) => store.network.wsRpcEndpoints);
  const { assets } = useSubstrateStakingAssets();
  const { result: operatorMap } = useStakingOperatorMap();
  const { result: delegatorInfo } = useStakingDelegatorInfo();
  const activeSubstrateAddress = useSubstrateAddress(false);

  const {
    operatorTvl: operatorTVL,
    operatorConcentration,
    operatorTvlByAsset: operatorTVLByAsset,
  } = useStakingTvl(delegatorInfo as any);

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
              const optionalBlueprint = blueprintDetails as Option<any>;
              if (optionalBlueprint.isNone) {
                return null;
              }

              const [ownerAccount, serviceBlueprint] =
                optionalBlueprint.unwrap();
              const owner = ownerAccount.toString();

              const { metadata, registrationParams, requestParams } =
                toPrimitiveBlueprint(id, serviceBlueprint);

              const runningInstancesMap = new Map<bigint, ServiceInstance[]>();

              for (const [
                instanceId,
                mayBeServiceInstance,
              ] of runningInstanceEntries) {
                const serviceInstanceId = (
                  instanceId.args[0] as any
                ).toBigInt();

                const optionalInstance = mayBeServiceInstance as Option<any>;
                if (optionalInstance.isNone) {
                  continue;
                }

                const instanceData = toPrimitiveService(
                  optionalInstance.unwrap(),
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
                operatorEntries as any,
                operatorMap,
                operatorTVLByAsset,
                runningInstancesMap,
              );

              const info = await getAccountInfo(rpcEndpoints, owner);
              const operatorsSet = blueprintOperatorMap.get(id);

              const details: Blueprint = {
                id,
                name: metadata.name,
                description: metadata.description,
                author: metadata.author ?? owner,
                imgUrl: metadata.logo,
                category: metadata.category,
                instancesCount: runningInstancesMap.get(id)?.length ?? null,
                operatorsCount: operatorsSet?.size ?? null,
                stakersCount: blueprintRestakersMap.get(id)?.size ?? null,
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
                      rpcEndpoints,
                      assets,
                      operatorsSet,
                      operatorMap,
                      operatorTVL,
                      operatorConcentration,
                      activeSubstrateAddress,
                      runningInstancesMap,
                      id,
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
        rpcEndpoints,
        assets,
        operatorConcentration,
        activeSubstrateAddress,
        operatorTVLByAsset,
      ],
    ),
  );
};

async function getBlueprintOperators(
  rpcEndpoints: string[],
  assetMap: StakingAssetMap,
  operatorAccountSet: Set<SubstrateAddress>,
  operatorMap: OperatorMap,
  operatorTVL: Map<SubstrateAddress, number>,
  operatorConcentration: Map<SubstrateAddress, number | null>,
  activeSubstrateAddress: SubstrateAddress | null,
  runningInstancesMap: Map<bigint, ServiceInstance[]>,
  blueprintId: bigint,
) {
  const operatorAccountArr = Array.from(operatorAccountSet);

  const accountInfoArr = await getMultipleAccountInfo(
    rpcEndpoints,
    operatorAccountArr,
  );

  return operatorAccountArr.map((address, idx) => {
    const info = accountInfoArr[idx];
    const concentrationPercentage = operatorConcentration.get(address) ?? null;
    const tvlInUsd = operatorTVL.get(address) ?? null;
    const delegations = operatorMap.get(address)?.delegations ?? [];
    const selfBondedAmount = operatorMap.get(address)?.stake ?? ZERO_BIG_INT;

    const isDelegated =
      activeSubstrateAddress !== null &&
      delegations.some(
        // TODO: We should implement a better way to compare addresses.
        (delegate) => delegate.delegatorAccountId === activeSubstrateAddress,
      );

    const operatorsCount =
      runningInstancesMap
        .get(blueprintId)
        ?.filter((instance) =>
          instance.serviceInstance?.operatorSecurityCommitments?.some(
            (commitment) => commitment.operator === address,
          ),
        ).length ?? 0;

    return {
      address,
      identityName: info?.name ?? undefined,
      concentrationPercentage,
      stakersCount: operatorMap.get(address)?.stakersCount ?? 0,
      selfBondedAmount,
      tvlInUsd,
      vaultTokens: mapDelegationsToVaultTokens(delegations, assetMap),
      isDelegated,
      instanceCount: operatorsCount,
    } satisfies StakingOperator;
  });
}

export default useBlueprintDetails;
