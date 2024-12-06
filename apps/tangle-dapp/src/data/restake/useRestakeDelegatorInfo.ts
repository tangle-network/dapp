import type { Vec } from '@polkadot/types';
import type {
  PalletMultiAssetDelegationDelegatorBondLessRequest,
  PalletMultiAssetDelegationDelegatorDelegatorStatus,
  PalletMultiAssetDelegationDelegatorWithdrawRequest,
} from '@polkadot/types/lookup';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import usePolkadotApi from '@webb-tools/tangle-shared-ui/hooks/usePolkadotApi';
import assertSubstrateAddress from '@webb-tools/webb-ui-components/utils/assertSubstrateAddress';
import { useObservable, useObservableState } from 'observable-hooks';
import { map, of, switchMap } from 'rxjs';

import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import type { DelegatorInfo } from '../../types/restake';

export default function useRestakeDelegatorInfo() {
  const activeAddress = useSubstrateAddress();

  const { apiRx } = usePolkadotApi();

  const delegatorInfo$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([activeAddress, apiRx]) => {
          if (
            apiRx.query.multiAssetDelegation?.delegators === undefined ||
            activeAddress === null
          )
            return of(null);

          return apiRx.query.multiAssetDelegation
            ?.delegators(activeAddress)
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
                    assetId: assetIdStr,
                    amountBonded: amountBigInt,
                    operatorAccountId: assertSubstrateAddress(
                      delegation.operator.toString(),
                    ),
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

function getWithdrawRequests(
  requests: Vec<PalletMultiAssetDelegationDelegatorWithdrawRequest>,
): DelegatorInfo['withdrawRequests'] {
  return requests.map(
    (req) =>
      ({
        amount: req.amount.toBigInt(),
        assetId: req.assetId.toString(),
        requestedRound: req.requestedRound.toNumber(),
      }) satisfies DelegatorInfo['withdrawRequests'][number],
  );
}

/**
 * @internal
 */
function getUnstakeRequests(
  requests: Vec<PalletMultiAssetDelegationDelegatorBondLessRequest>,
): DelegatorInfo['unstakeRequests'] {
  return requests.map(
    (req) =>
      ({
        amount: req.amount.toBigInt(),
        assetId: req.assetId.toString(),
        requestedRound: req.requestedRound.toNumber(),
        operatorAccountId: assertSubstrateAddress(req.operator.toString()),
      }) satisfies DelegatorInfo['unstakeRequests'][number],
  );
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
