import type { Option, Struct, u32, u128, Vec } from '@polkadot/types';
import type {
  PalletMultiAssetDelegationOperatorDelegatorBond,
  PalletMultiAssetDelegationOperatorOperatorBondLessRequest,
  PalletMultiAssetDelegationOperatorOperatorStatus,
} from '@polkadot/types/lookup';
import { useObservable, useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { map, type Observable, of, switchMap } from 'rxjs';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import type { OperatorMap, OperatorMetadata } from '../../types/restake';

type UseRestakeOperatorMapReturnType = {
  operatorMap: OperatorMap;
  operatorMap$: Observable<OperatorMap>;
};

// TODO: Remove this on `tangle-substrate-types` v0.5.11
interface PalletMultiAssetDelegationOperatorOperatorMetadata extends Struct {
  readonly stake: u128;
  readonly delegationCount: u32;
  readonly request: Option<PalletMultiAssetDelegationOperatorOperatorBondLessRequest>;
  readonly delegations: Vec<PalletMultiAssetDelegationOperatorDelegatorBond>;
  readonly status: PalletMultiAssetDelegationOperatorOperatorStatus;
}

/**
 * Hook to retrieve the operator map for restaking.
 * @returns
 *  - `operatorMap`: The operator map.
 *  - `operatorMap$`: The observable for the operator map.
 */
export default function useRestakeOperatorMap(): UseRestakeOperatorMapReturnType {
  const { apiRx } = usePolkadotApi();

  const entries$ = useMemo(
    () =>
      apiRx.query.multiAssetDelegation?.operators !== undefined
        ? apiRx.query.multiAssetDelegation.operators.entries<
            Option<PalletMultiAssetDelegationOperatorOperatorMetadata>
          >()
        : of([]),
    [apiRx.query.multiAssetDelegation?.operators],
  );

  const operatorMap$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([entries$]) => {
          return entries$.pipe(
            map((entries) =>
              entries.reduce(
                (operatorsMap, [accountStorage, operatorMetadata]) => {
                  if (operatorMetadata.isNone) return operatorsMap;

                  const accountId = accountStorage.args[0];
                  const operator = operatorMetadata.unwrap();

                  const operatorMetadataPrimitive = {
                    stake: operator.stake.toBigInt(),
                    delegationCount: operator.delegationCount.toNumber(),
                    bondLessRequest: toPrimitiveRequest(operator.request),
                    delegations: toPrimitiveDelegations(operator.delegations),
                    status: toPrimitiveStatus(operator.status),
                  } satisfies OperatorMetadata;

                  return Object.assign(operatorsMap, {
                    [accountId.toString()]: operatorMetadataPrimitive,
                  } satisfies OperatorMap);
                },
                {} as OperatorMap,
              ),
            ),
          );
        }),
      ),
    [entries$],
  );

  const operatorMap = useObservableState(operatorMap$, {});

  return {
    operatorMap,
    operatorMap$,
  };
}

/**
 * @internal
 */
function toPrimitiveRequest(
  request: Option<PalletMultiAssetDelegationOperatorOperatorBondLessRequest>,
): OperatorMetadata['bondLessRequest'] {
  if (request.isNone) return null;

  const requestValue = request.unwrap();

  return {
    amount: requestValue.amount.toBigInt(),
    requestTime: requestValue.requestTime.toNumber(),
  };
}

/**
 * @internal
 */
function toPrimitiveStatus(
  status: PalletMultiAssetDelegationOperatorOperatorStatus,
): OperatorMetadata['status'] {
  if (status.type === 'Leaving') {
    return {
      Leaving: status.asLeaving.toNumber(),
    };
  }

  return status.type;
}

/**
 * @internal
 */
function toPrimitiveDelegations(
  delegations: Vec<PalletMultiAssetDelegationOperatorDelegatorBond>,
): OperatorMetadata['delegations'] {
  return delegations.map(({ amount, assetId, delegator }) => ({
    amount: amount.toBigInt(),
    delegatorAccountId: delegator.toString(),
    assetId: assetId.toString(),
  }));
}
