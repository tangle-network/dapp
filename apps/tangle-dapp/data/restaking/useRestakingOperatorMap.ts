import { useWebContext } from '@webb-tools/api-provider-environment';
import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config/constants';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useObservable, useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { map, type Observable, of, switchMap } from 'rxjs';
import { formatUnits } from 'viem';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import type { OperatorMap, OperatorMetadata } from '../../types/restake';
import useRestakingAssetMap from './useRestakingAssetMap';

const EMPTY_OPERATOR_MAP: OperatorMap = {};

type UseRestakingOperatorMapReturnType = {
  operatorMap: OperatorMap;
  operatorMap$: Observable<OperatorMap>;
};

export default function useRestakingOperatorMap(): UseRestakingOperatorMapReturnType {
  const { apiRx } = usePolkadotApi();
  const { activeChain } = useWebContext();

  const { assetMap } = useRestakingAssetMap();

  const entries$ = useMemo(
    () =>
      apiRx.query.multiAssetDelegation?.operators !== undefined
        ? apiRx.query.multiAssetDelegation.operators.entries()
        : of([]),
    [apiRx.query.multiAssetDelegation?.operators],
  );

  const operatorMap$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([entries$, assetMap, nativeDecimals = DEFAULT_DECIMALS]) => {
          return entries$.pipe(
            map((entries) =>
              entries.reduce(
                (operatorsMap, [accountId, operatorMetadata]) => {
                  if (operatorMetadata.isNone) return operatorsMap;

                  const operator = operatorMetadata.unwrap();

                  function toPrimitiveRequest(
                    request: typeof operator.request,
                  ): OperatorMetadata['request'] {
                    if (request.isNone) return null;

                    const requestValue = request.unwrap();

                    return {
                      amount: requestValue.amount.toBigInt(),
                      amountFormatted: formatUnits(
                        requestValue.amount.toBigInt(),
                        nativeDecimals,
                      ),
                      requestTime: requestValue.requestTime.toNumber(),
                    };
                  }

                  function toPrimitiveStatus(
                    status: typeof operator.status,
                  ): OperatorMetadata['status'] {
                    if (status.isActive) {
                      return 'Active';
                    }

                    if (status.isInactive) {
                      return 'Inactive';
                    }

                    if (status.isLeaving) {
                      return {
                        Leaving: status.asLeaving.toNumber(),
                      };
                    }

                    throw WebbError.from(WebbErrorCodes.InvalidEnumValue);
                  }

                  function toPrimitiveDelegations(
                    delegations: typeof operator.delegations,
                  ): OperatorMetadata['delegations'] {
                    return delegations.map(({ amount, assetId, delegator }) => {
                      const assetIdStr = assetId.toString();
                      const amountBigInt = amount.toBigInt();
                      const decimals =
                        assetMap[assetIdStr]?.decimals ?? DEFAULT_DECIMALS;

                      return {
                        amount: amountBigInt,
                        amountFormatted: formatUnits(amountBigInt, decimals),
                        delegator: delegator.toString(),
                        assetId: assetIdStr,
                      };
                    });
                  }

                  const operatorMetadataPrimitive = {
                    bond: operator.bond.toBigInt(),
                    bondFormatted: formatUnits(
                      operator.bond.toBigInt(),
                      nativeDecimals,
                    ),
                    delegationCount: operator.delegationCount.toNumber(),
                    request: toPrimitiveRequest(operator.request),
                    delegations: toPrimitiveDelegations(operator.delegations),
                    status: toPrimitiveStatus(operator.status),
                  } satisfies OperatorMetadata;

                  return Object.assign(operatorsMap, {
                    [accountId.toString()]: operatorMetadataPrimitive,
                  } satisfies OperatorMap);
                },
                {} as typeof EMPTY_OPERATOR_MAP,
              ),
            ),
          );
        }),
      ),
    [entries$, assetMap, activeChain?.nativeCurrency?.decimals],
  );

  const operatorMap = useObservableState(operatorMap$, EMPTY_OPERATOR_MAP);

  return {
    operatorMap,
    operatorMap$,
  };
}
