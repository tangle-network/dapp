import { Option } from '@polkadot/types';
import { PalletMultiAssetDelegationDelegatorDelegatorMetadata } from '@polkadot/types/lookup';
import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config/constants';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useObservable, useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { EMPTY, map, Observable, switchMap } from 'rxjs';
import { formatUnits } from 'viem';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import type { DelegatorInfo } from '../../types/restake';
import useRestakingAssetMap from './useRestakingAssetMap';

export default function useRestakingDelegatorInfo() {
  const activeAddress = useSubstrateAddress();

  const { apiRx } = usePolkadotApi();

  const { assetMap } = useRestakingAssetMap();

  const delegatorQuery = useMemo(
    (): ((
      account: string,
    ) => Observable<
      Option<PalletMultiAssetDelegationDelegatorDelegatorMetadata>
    >) =>
      apiRx.query.multiAssetDelegation?.delegators !== undefined
        ? apiRx.query.multiAssetDelegation.delegators
        : () => EMPTY,
    [apiRx.query.multiAssetDelegation?.delegators],
  );

  const delegatorInfo$ = useObservable(
    (input$) =>
      input$.pipe(
        map((args) => {
          return args;
        }),
        switchMap(([activeAddress, assetMap, delegatorQuery]) =>
          delegatorQuery(activeAddress ?? '').pipe(
            map((delegatorInfo) => {
              if (delegatorInfo.isNone) {
                return null;
              }

              const formatAmount = (amount: bigint, assetId: string) => {
                const decimals =
                  assetMap[assetId]?.decimals ?? DEFAULT_DECIMALS;
                return formatUnits(amount, decimals);
              };

              const info = delegatorInfo.unwrap();

              const deposits = Array.from(info.deposits.entries()).reduce(
                (depositRecord, [assetId, amount]) => {
                  const assetIdStr = assetId.toString();
                  const amountBigInt = amount.toBigInt();

                  return Object.assign(depositRecord, {
                    [assetIdStr]: {
                      amount: amountBigInt,
                      amountFormatted: formatAmount(amountBigInt, assetIdStr),
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
                  amount: amountBigInt,
                  amountFormatted: formatAmount(amountBigInt, assetIdStr),
                  operator: delegation.operator.toString(),
                };
              });

              function getUnstakeRequest(
                request: typeof info.unstakeRequest,
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
                  amountFormatted: formatAmount(amountBigInt, assetIdStr),
                  requestedRound: unstakeRequest.requestedRound.toNumber(),
                };
              }

              function getBondLessRequest(
                request: typeof info.delegatorBondLessRequest,
              ): DelegatorInfo['delegatorBondLessRequest'] {
                if (request.isNone) {
                  return null;
                }

                const bondLessRequest = request.unwrap();
                const amountBigInt = bondLessRequest.amount.toBigInt();
                const assetIdStr = bondLessRequest.assetId.toString();

                return {
                  assetId: assetIdStr,
                  amount: amountBigInt,
                  amountFormatted: formatAmount(amountBigInt, assetIdStr),
                  requestedRound: bondLessRequest.requestedRound.toNumber(),
                };
              }

              function getStatus(
                status: typeof info.status,
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
          ),
        ),
      ),
    [activeAddress, assetMap, delegatorQuery],
  );

  const delegatorInfo = useObservableState(delegatorInfo$, null);

  return {
    delegatorInfo,
    delegatorInfo$,
  };
}
