import { FormatAddress } from '@webb-dapp/react-components';
import { useAccounts, useApi, useHistory } from '@webb-dapp/react-hooks';
import { CurrencyLike } from '@webb-dapp/react-hooks/types';
import { LoadingOutlined, notification, styled } from '@webb-dapp/ui-components';
import { LoggerService } from '@webb-tools/app-util';
import { uniqueId } from 'lodash';
import React, { useMemo, useState } from 'react';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap, take, timeout } from 'rxjs/operators';

import { ApiRx, SubmittableResult } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { AccountInfo, DispatchError } from '@polkadot/types/interfaces';
import { ISubmittableResult, ITuple } from '@polkadot/types/types';

export interface UseTXInput {
  api?: ApiRx;
  signAddress?: string;
  affectAssets?: CurrencyLike[]; // assets which be affected in this extrinsic
  section: string; // extrinsic section
  method: string; // extrinsic method

  beforeSend?: () => void; // the callback will be executed before send
  afterSend?: () => void; // the callback will be executed after send
  onExtrinsicSuccess?: () => void; // the callback will be executed when extrinsic in block
  onFinalize?: () => void; // the callback will be executed when extrinsic in finalize
  onInBlock?: () => void; // the callback will be executed when extrinsic success
  onFailed?: () => void; // the callback will be executed when extrinsic failed,
  params: any[] | null | undefined;
}

const txLogger = LoggerService.get('TX');

export const MAX_TX_WAITING_TIME = 60 * 1000;

const Loading = styled(LoadingOutlined)`
  svg {
    width: 36px;
    height: 36px;
  }

  path {
    fill: var(--notification-info-color);
  }
`;
export const useTX = (input: UseTXInput) => {
  const {
    afterSend,
    api,
    beforeSend,
    method,

    onExtrinsicSuccess,
    onFailed,
    onFinalize,
    onInBlock,

    params: p,
    section,
    signAddress,
  } = input;

  const { api: webbApi } = useApi();
  const { active } = useAccounts();
  const [isSending, setIsSending] = useState<boolean>(false);
  const { refresh } = useHistory();
  const _signAddress = useMemo(() => {
    if (signAddress) return signAddress;

    return active?.address;
  }, [signAddress, active]);

  const _api = useMemo(() => {
    if (api) return api;

    return webbApi;
  }, [api, webbApi]);

  const executeTX = (parameters?: any[]) => {
    const params = parameters || p;
    if (!params) {
      return;
    }

    // ensure that the section and method are exist
    if (!_api.tx[section] || !_api.tx[section][method]) {
      txLogger.error(`can not find api.tx.${section}.${method}`);

      return;
    }
    // ensure that account is exist
    if (!_signAddress) {
      txLogger.error('can not find available address');

      return;
    }

    const createTx = (): Observable<SubmittableExtrinsic<'rxjs'>> =>
      _api.query.system.account<AccountInfo>(_signAddress).pipe(
        take(1),
        map((account) => {
          return [account, params] as [AccountInfo, any[]];
        }),
        switchMap(([account, params]) => {
          const signedExtrinsic = _api.tx[section][method].apply(_api, params);

          return signedExtrinsic.paymentInfo(_signAddress).pipe(
            map((result) => {
              txLogger.info(result.toString());
            }),
            map(() => [account, params] as [AccountInfo, any[]]),
            catchError((error) => {
              txLogger.error(error);

              return of([account, params] as [AccountInfo, any[]]);
            })
          );
        }),
        switchMap(([account, params]) => {
          LoggerService.get('App').info(`TXButton switchMap parameters `, params);
          return _api.tx[section][method](...params).signAsync(_signAddress, { nonce: account.nonce.toNumber() });
        })
      );

    const notify = (signedTx: SubmittableExtrinsic<'rxjs'>): [SubmittableExtrinsic<'rxjs'>, string] => {
      const hash = signedTx.hash.toString();

      const notificationKey = uniqueId(`${section}-${method}`);

      notification.info({
        description: <FormatAddress address={hash} />,
        duration: null,
        icon: <Loading spin />,
        key: notificationKey,
        message: `${section}: ${method}`,
      });

      return [signedTx, notificationKey];
    };

    const send = (signedTx: SubmittableExtrinsic<'rxjs'>): Observable<ISubmittableResult> => {
      return signedTx.send().pipe(timeout(MAX_TX_WAITING_TIME));
    };

    const extractEvents = (result: SubmittableResult): { isDone: boolean; errorMessage?: string } => {
      const events = result.events.filter((event): boolean => !!event.event);

      for (const eventRecord of events) {
        const { data, method, section } = eventRecord.event;
        // extrinsic success
        if (section === 'system' && method === 'ExtrinsicSuccess') {
          return { isDone: true };
        }

        // extrinsic failed
        if (section === 'system' && method === 'ExtrinsicFailed') {
          const [dispatchError] = (data as unknown) as ITuple<[DispatchError]>;
          let message = dispatchError.type;

          if (dispatchError.isModule) {
            try {
              const mod = dispatchError.asModule;
              const error = _api.registry.findMetaError(new Uint8Array([mod.index.toNumber(), mod.error.toNumber()]));

              message = `${error.section}.${error.name}`;
            } catch (error) {
              message = Reflect.has(error, 'toString') ? error.toString() : error;
            }
          }

          return { errorMessage: message, isDone: true };
        }
      }

      return { isDone: false };
    };

    let notificationKey = '';

    // execute before send callback
    if (beforeSend) {
      beforeSend();
    }

    // lock btn click
    setIsSending(true);

    const subscriber = createTx()
      .pipe(
        map(notify),
        switchMap(([signedTx, key]) => {
          notificationKey = key;

          return send(signedTx).pipe(
            map((sendResult): boolean => {
              if (sendResult.status.isInBlock && onInBlock) {
                onInBlock();
              }

              if (sendResult.status.isFinalized && onFinalize) {
                onFinalize();
              }

              if (sendResult.status.isInBlock || sendResult.status.isFinalized) {
                const { errorMessage, isDone } = extractEvents(sendResult);

                // handle extrinsic error
                if (isDone && errorMessage) {
                  throw new Error(errorMessage);
                }

                return isDone;
              }

              if (sendResult.status.isUsurped || sendResult.status.isDropped || sendResult.status.isFinalityTimeout) {
                throw new Error(sendResult.status.toString());
              }

              return false;
            })
          );
        }),
        // exculte afterSend callback
        finalize(() => {
          if (afterSend) {
            afterSend();
          }

          setIsSending(false);
          setTimeout(refresh, 2000);
        })
      )
      .subscribe({
        error: (error: Error) => {
          if (error.name === 'TimeoutError') {
            notification.error({
              duration: 4,
              key: notificationKey,
              message: 'Extrinsic timed out, Please check manually',
            });
          }

          notification.error({
            duration: 4,
            key: notificationKey,
            message: error && error.message ? error.message : 'Error Occurred!',
          });

          if (onFailed) {
            onFailed();
          }

          subscriber.unsubscribe();
        },
        next: (isDone) => {
          if (isDone) {
            if (onExtrinsicSuccess) {
              onExtrinsicSuccess();
            }

            notification.success({
              duration: 4,
              key: notificationKey,
              message: 'Submit Transaction Success',
            });

            subscriber.unsubscribe();
          }
        },
      });
  };
  return {
    executeTX,
    loading: isSending,
  };
};
