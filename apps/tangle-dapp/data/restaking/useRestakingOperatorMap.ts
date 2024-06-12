import { useWebContext } from '@webb-tools/api-provider-environment';
import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config/constants';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useObservable, useObservableState } from 'observable-hooks';
import { EMPTY, map, withLatestFrom } from 'rxjs';
import { formatUnits } from 'viem';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import type { OperatorMap, OperatorMetadata } from '../../types/restake';

const EMPTY_OPERATOR_MAP: OperatorMap = {};

export default function useRestakingOperatorMap() {
  const { apiRx } = usePolkadotApi();
  const { activeChain } = useWebContext();

  const entries$ = useObservable(
    () =>
      apiRx.query.multiAssetDelegation?.operators !== undefined
        ? apiRx.query.multiAssetDelegation.operators.entries()
        : EMPTY,
    [apiRx.query.multiAssetDelegation?.operators],
  );

  const operatorMap$ = useObservable(
    (input$) =>
      entries$.pipe(
        withLatestFrom(input$),
        map(([entries, [decimals = DEFAULT_DECIMALS]]) => {
          return entries.reduce(
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
                    decimals,
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

              const operatorMetadataPrimitive = {
                bond: operator.bond.toBigInt(),
                bondFormatted: formatUnits(operator.bond.toBigInt(), decimals),
                delegationCount: operator.delegationCount.toNumber(),
                request: toPrimitiveRequest(operator.request),
                delegations: operator.delegations.map(
                  (delegation) =>
                    ({
                      amount: delegation.amount.toBigInt(),
                      amountFormatted: formatUnits(
                        delegation.amount.toBigInt(),
                        decimals,
                      ),
                      delegator: delegation.delegator.toString(),
                      assetId: delegation.assetId.toBigInt(),
                    }) satisfies OperatorMetadata['delegations'][0],
                ),
                status: toPrimitiveStatus(operator.status),
              } satisfies OperatorMetadata;

              return Object.assign(operatorsMap, {
                [accountId.toString()]: operatorMetadataPrimitive,
              } satisfies OperatorMap);
            },
            {} as typeof EMPTY_OPERATOR_MAP,
          );
        }),
      ),
    [activeChain?.nativeCurrency?.decimals],
  );

  const operatorMap = useObservableState(operatorMap$, EMPTY_OPERATOR_MAP);

  return {
    operatorMap,
    operatorMap$,
  };
}
