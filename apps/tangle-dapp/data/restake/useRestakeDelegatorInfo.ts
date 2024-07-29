import type { Option } from '@polkadot/types';
import type {
  PalletMultiAssetDelegationDelegatorBondLessRequest,
  PalletMultiAssetDelegationDelegatorDelegatorStatus,
  PalletMultiAssetDelegationDelegatorUnstakeRequest,
} from '@polkadot/types/lookup';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import uniqueId from 'lodash/uniqueId';
import { useObservable, useObservableState } from 'observable-hooks';
import { map, of, switchMap } from 'rxjs';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import type { DelegatorInfo } from '../../types/restake';

/**
 * Hook to retrieve the delegator info for restaking.
 * @returns
 *  - `delegatorInfo`: The delegator info.
 *  - `delegatorInfo$`: The observable for the delegator info.
 */
export default function useRestakeDelegatorInfo() {
  const activeAddress = useSubstrateAddress();

  const { apiRx } = usePolkadotApi();

  const delegatorInfo$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([activeAddress, apiRx]) => {
          if (apiRx.query.multiAssetDelegation?.delegators === undefined) {
            return of(null);
          }

          return apiRx.query.multiAssetDelegation
            ?.delegators(activeAddress ?? '')
            .pipe(
              map((delegatorInfo) => {
                if (delegatorInfo.isNone) {
                  return null;
                }

                const info = delegatorInfo.unwrap();

                const deposits = Array.from(info.deposits.entries()).reduce(
                  (depositRecord, [assetId, amount]) => {
                    const assetIdStr = assetId.toString();
                    const amountBigInt = amount.toBigInt();

                    return Object.assign(depositRecord, {
                      [assetIdStr]: {
                        amount: amountBigInt,
                      },
                    } satisfies DelegatorInfo['deposits']);
                  },
                  {} as DelegatorInfo['deposits'],
                );

                const delegations = info.delegations.map<
                  DelegatorInfo['delegations'][number]
                >((delegation) => {
                  const amountBigInt = delegation.amount.toBigInt();
                  const assetIdStr = delegation.assetId.toString();

                  return {
                    uid: uniqueId('delegator-delegation-'),
                    assetId: assetIdStr,
                    amountBonded: amountBigInt,
                    operatorAccountId: delegation.operator.toString(),
                  };
                });

                return {
                  deposits,
                  delegations,
                  unstakeRequest: getUnstakeRequest(info.unstakeRequest),
                  delegatorBondLessRequest: getBondLessRequest(
                    info.delegatorBondLessRequest,
                  ),
                  status: getStatus(info.status),
                } satisfies DelegatorInfo;
              }),
            );
        }),
      ),
    [activeAddress, apiRx],
  );

  const delegatorInfo = useObservableState(delegatorInfo$, null);

  return {
    delegatorInfo,
    delegatorInfo$,
  };
}

/**
 * @internal
 */
function getUnstakeRequest(
  request: Option<PalletMultiAssetDelegationDelegatorUnstakeRequest>,
): DelegatorInfo['unstakeRequest'] {
  if (request.isNone) {
    return null;
  }

  const unstakeRequest = request.unwrap();
  const amountBigInt = unstakeRequest.amount.toBigInt();
  const assetIdStr = unstakeRequest.assetId.toString();

  return {
    assetId: assetIdStr,
    amount: amountBigInt,
    requestedRound: unstakeRequest.requestedRound.toNumber(),
  };
}

/**
 * @internal
 */
function getBondLessRequest(
  request: Option<PalletMultiAssetDelegationDelegatorBondLessRequest>,
): DelegatorInfo['delegatorBondLessRequest'] {
  if (request.isNone) {
    return null;
  }

  const bondLessRequest = request.unwrap();
  const amountBigInt = bondLessRequest.amount.toBigInt();
  const assetIdStr = bondLessRequest.assetId.toString();

  return {
    assetId: assetIdStr,
    bondLessAmount: amountBigInt,
    requestedRound: bondLessRequest.requestedRound.toNumber(),
  };
}

/**
 * @internal
 */
function getStatus(
  status: PalletMultiAssetDelegationDelegatorDelegatorStatus,
): DelegatorInfo['status'] {
  if (status.isActive) {
    return 'Active';
  }

  if (status.isLeavingScheduled) {
    return {
      LeavingScheduled: status.asLeavingScheduled.toNumber(),
    };
  }

  throw WebbError.from(WebbErrorCodes.InvalidEnumValue);
}
