import type { Option, Vec } from '@polkadot/types';
import type {
  PalletMultiAssetDelegationOperatorDelegatorBond,
  PalletMultiAssetDelegationOperatorOperatorBondLessRequest,
  PalletMultiAssetDelegationOperatorOperatorStatus,
} from '@polkadot/types/lookup';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { map, type Observable, of } from 'rxjs';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import type { OperatorMap, OperatorMetadata } from '../../types/restake';

type UseRestakeOperatorMapReturnType = {
  operatorMap: OperatorMap;
  operatorMap$: Observable<OperatorMap>;
};

/**
 * Hook to retrieve the operator map for restaking.
 * @returns
 *  - `operatorMap`: The operator map.
 *  - `operatorMap$`: The observable for the operator map.
 */
export default function useRestakeOperatorMap(): UseRestakeOperatorMapReturnType {
  const { apiRx } = usePolkadotApi();

  const operatorMap$ = useMemo(() => {
    if (!isDefined(apiRx.query?.multiAssetDelegation?.operators?.entries))
      return of<OperatorMap>({});

    return apiRx.query.multiAssetDelegation.operators.entries().pipe(
      map((entries) => {
        return entries.reduce(
          (operatorsMap, [accountStorage, operatorMetadata]) => {
            if (operatorMetadata.isNone) return operatorsMap;

            const accountId = accountStorage.args[0];
            const operator = operatorMetadata.unwrap();
            const { delegations, restakersCount } = toPrimitiveDelegations(
              operator.delegations,
            );

            const operatorMetadataPrimitive = {
              stake: operator.stake.toBigInt(),
              delegationCount: operator.delegationCount.toNumber(),
              bondLessRequest: toPrimitiveRequest(operator.request),
              delegations,
              restakersCount,
              status: toPrimitiveStatus(operator.status),
            } satisfies OperatorMetadata;

            return Object.assign(operatorsMap, {
              [accountId.toString()]: operatorMetadataPrimitive,
            } satisfies OperatorMap);
          },
          {} as OperatorMap,
        );
      }),
    );
  }, [apiRx.query.multiAssetDelegation?.operators]);

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
) {
  const restakerSet = new Set<string>();

  const primitiveDelegations = delegations.map(
    ({ amount, assetId, delegator }) => {
      const delegatorAccountId = delegator.toString();

      restakerSet.add(delegatorAccountId);

      return {
        amount: amount.toBigInt(),
        delegatorAccountId,
        assetId: assetId.toString(),
      } satisfies OperatorMetadata['delegations'][number];
    },
  );

  return {
    delegations: primitiveDelegations,
    restakersCount: restakerSet.size,
  };
}
