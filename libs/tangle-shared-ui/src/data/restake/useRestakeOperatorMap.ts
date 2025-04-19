import type { Option, Vec } from '@polkadot/types';
import type {
  PalletMultiAssetDelegationOperatorDelegatorBond,
  PalletMultiAssetDelegationOperatorOperatorBondLessRequest,
  PalletMultiAssetDelegationOperatorOperatorStatus,
} from '@polkadot/types/lookup';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { useCallback } from 'react';
import { map } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import { TangleError, TangleErrorCode } from '../../types/error';
import { OperatorMetadata } from '../../types/restake';
import createRestakeAssetId from '../../utils/createRestakeAssetId';
import { assertSubstrateAddress } from '@tangle-network/ui-components';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

const useRestakeOperatorMap = () => {
  const { result, ...rest } = useApiRx(
    useCallback((apiRx) => {
      if (!isDefined(apiRx?.query?.multiAssetDelegation?.operators?.entries)) {
        return new TangleError(TangleErrorCode.FEATURE_NOT_SUPPORTED);
      }

      return apiRx.query.multiAssetDelegation.operators.entries().pipe(
        map((entries) => {
          return entries.reduce(
            (operatorsMap, [accountStorage, operatorMetadata]) => {
              if (operatorMetadata.isNone) {
                return operatorsMap;
              }

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

              operatorsMap.set(
                assertSubstrateAddress(accountId.toString()),
                operatorMetadataPrimitive,
              );

              return operatorsMap;
            },
            new Map<SubstrateAddress, OperatorMetadata>(),
          );
        }),
      );
    }, []),
  );

  return {
    // Return an empty Map for API compatibility.
    result: result ?? new Map<SubstrateAddress, OperatorMetadata>(),
    ...rest,
  };
};

/**
 * @internal
 */
const toPrimitiveRequest = (
  request: Option<PalletMultiAssetDelegationOperatorOperatorBondLessRequest>,
): OperatorMetadata['bondLessRequest'] => {
  if (request.isNone) return null;

  const requestValue = request.unwrap();

  return {
    amount: requestValue.amount.toBigInt(),
    requestTime: requestValue.requestTime.toNumber(),
  };
};

/**
 * @internal
 */
const toPrimitiveStatus = (
  status: PalletMultiAssetDelegationOperatorOperatorStatus,
): OperatorMetadata['status'] => {
  if (status.type === 'Leaving') {
    return {
      Leaving: status.asLeaving.toNumber(),
    };
  }

  return status.type;
};

/**
 * @internal
 */
const toPrimitiveDelegations = (
  delegations: Vec<PalletMultiAssetDelegationOperatorDelegatorBond>,
): {
  delegations: OperatorMetadata['delegations'];
  restakersCount: number;
} => {
  const restakerSet = new Set<string>();

  const primitiveDelegations = delegations.map(
    ({ amount, asset, delegator }) => {
      const delegatorAccountId = delegator.toString();

      restakerSet.add(delegatorAccountId);

      return {
        amount: amount.toBigInt(),
        delegatorAccountId,
        assetId: createRestakeAssetId(asset),
      } satisfies OperatorMetadata['delegations'][number];
    },
  );

  return {
    delegations: primitiveDelegations,
    restakersCount: restakerSet.size,
  };
};

export default useRestakeOperatorMap;
