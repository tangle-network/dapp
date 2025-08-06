import type { Vec } from '@polkadot/types';
import type {
  PalletMultiAssetDelegationDelegatorBondLessRequest,
  PalletMultiAssetDelegationDelegatorDelegatorStatus,
  PalletMultiAssetDelegationDelegatorWithdrawRequest,
} from '@polkadot/types/lookup';
import {
  WebbError,
  WebbErrorCodes,
} from '@tangle-network/dapp-types/WebbError';
import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';
import { useCallback } from 'react';
import { map } from 'rxjs';
import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { TangleError, TangleErrorCode } from '../../types/error';
import { DelegatorInfo } from '../../types/restake';
import createRestakeAssetId from '../../utils/createRestakeAssetId';

export default function useRestakeDelegatorInfo() {
  const activeAddress = useSubstrateAddress();

  return useApiRx(
    useCallback(
      (apiRx) => {
        if (activeAddress === null) {
          return new TangleError(TangleErrorCode.INVALID_PARAMS);
        }

        return apiRx.query.multiAssetDelegation.delegators(activeAddress).pipe(
          map((delegatorInfo) => {
            if (delegatorInfo.isNone) {
              return null;
            }

            const info = delegatorInfo.unwrap();

            const deposits = Array.from(info.deposits.entries()).reduce(
              (depositRecord, [assetId, deposit]) => {
                const amountBigInt = deposit.amount.toBigInt();

                const delegatedAmountBigInt =
                  deposit.delegatedAmount.toBigInt();

                return Object.assign(depositRecord, {
                  [createRestakeAssetId(assetId)]: {
                    amount: amountBigInt,
                    delegatedAmount: delegatedAmountBigInt,
                  },
                } satisfies DelegatorInfo['deposits']);
              },
              {} as DelegatorInfo['deposits'],
            );

            const delegations = info.delegations.map<
              DelegatorInfo['delegations'][number]
            >((delegation) => {
              const amountBigInt = delegation.amount.toBigInt();

              return {
                assetId: createRestakeAssetId(delegation.asset),
                amountBonded: amountBigInt,
                operatorAccountId: assertSubstrateAddress(
                  delegation.operator.toString(),
                ),
                isNomination: delegation.isNomination.toHuman() as boolean,
              };
            });

            return {
              deposits,
              withdrawRequests: getWithdrawRequests(info.withdrawRequests),
              delegations,
              unstakeRequests: getUnstakeRequests(
                info.delegatorUnstakeRequests,
              ),
              status: getStatus(info.status),
            } satisfies DelegatorInfo;
          }),
        );
      },
      [activeAddress],
    ),
  );
}

function getWithdrawRequests(
  requests: Vec<PalletMultiAssetDelegationDelegatorWithdrawRequest>,
): DelegatorInfo['withdrawRequests'] {
  return requests.map((req) => {
    return {
      amount: req.amount.toBigInt(),
      assetId: createRestakeAssetId(req.asset),
      requestedRound: req.requestedRound.toNumber(),
    } satisfies DelegatorInfo['withdrawRequests'][number];
  });
}

/**
 * @internal
 */
function getUnstakeRequests(
  requests: Vec<PalletMultiAssetDelegationDelegatorBondLessRequest>,
): DelegatorInfo['unstakeRequests'] {
  return requests.map((req) => {
    return {
      amount: req.amount.toBigInt(),
      assetId: createRestakeAssetId(req.asset),
      requestedRound: req.requestedRound.toNumber(),
      operatorAccountId: assertSubstrateAddress(req.operator.toString()),
    } satisfies DelegatorInfo['unstakeRequests'][number];
  });
}

/**
 * @internal
 */
function getStatus(
  status: PalletMultiAssetDelegationDelegatorDelegatorStatus,
): DelegatorInfo['status'] {
  if (status.isActive) {
    return 'Active';
  } else if (status.isLeavingScheduled) {
    return {
      LeavingScheduled: status.asLeavingScheduled.toNumber(),
    };
  }

  throw WebbError.from(WebbErrorCodes.InvalidEnumValue);
}
