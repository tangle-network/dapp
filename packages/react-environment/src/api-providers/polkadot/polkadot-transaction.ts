import { EventBus, LoggerService } from '@webb-tools/app-util';
import { uniqueId } from 'lodash';
import React from 'react';

import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/submittable/types';
import { web3FromAddress } from '@polkadot/extension-dapp';

export type QueueTxStatus =
  | 'future'
  | 'ready'
  | 'finalized'
  | 'finalitytimeout'
  | 'usurped'
  | 'dropped'
  | 'inblock'
  | 'invalid'
  | 'broadcast'
  | 'cancelled'
  | 'completed'
  | 'error'
  | 'incomplete'
  | 'queued'
  | 'qr'
  | 'retracted'
  | 'sending'
  | 'signing'
  | 'sent'
  | 'blocked';

type MethodPath = {
  section: string;
  method: string;
};

type PolkadotTXEventsPayload<T = undefined> = {
  data: T;
  key: string;
  address: string;
  path: MethodPath;
};
type PolkadotTXEvents = {
  beforeSend: PolkadotTXEventsPayload;
  afterSend: PolkadotTXEventsPayload;
  failed: PolkadotTXEventsPayload<string>;
  finalize: PolkadotTXEventsPayload;
  inBlock: PolkadotTXEventsPayload;
  extrinsicSuccess: PolkadotTXEventsPayload;
  loading: PolkadotTXEventsPayload<JSX.Element>;
};

export type NotificationConfig = {
  loading?: (data: PolkadotTXEventsPayload<JSX.Element>) => void;
  finalize?: (data: PolkadotTXEventsPayload) => void;
  failed?: (data: PolkadotTXEventsPayload<string>) => void;
};
const txLogger = LoggerService.get('PolkadotTx');

export class PolkadotTx<P extends Array<any>> extends EventBus<PolkadotTXEvents> {
  private notificationKey: string = '';
  private transactionAddress: string | null = null;

  constructor(private apiPromise: ApiPromise, private path: MethodPath, private parms: P) {
    super();
  }

  async call(signAddress: string) {
    txLogger.info(`Sending ${this.path.section} ${this.path.method} transaction by`, signAddress, this.parms);
    this.transactionAddress = signAddress;
    const api = this.apiPromise;
    await api.isReady;
    if (!api.tx[this.path.section] || !api.tx[this.path.section][this.path.method]) {
      txLogger.error(`can not find api.tx.${this.path.section}.${this.path.method}`);
      return;
    }
    const accountInfo = await api.query.system.account(signAddress);
    const injector = await web3FromAddress(signAddress);
    this.notificationKey = uniqueId(`${this.path.section}-${this.path.method}`);
    await api.setSigner(injector.signer);
    const txResults = await api.tx[this.path.section][this.path.method](...this.parms).signAsync(signAddress, {
      nonce: -1,
    });
    this.emitWithPayload('beforeSend', undefined);
    this.emitWithPayload('loading', React.createElement('div'));
    const hash = txResults.hash.toString();
    await this.send(txResults);

    this.emitWithPayload('afterSend', undefined);
    this.transactionAddress = null;
    txLogger.info(`Tx ${this.path.section} ${this.path.method} is Done: TX hash=`, hash);
    return hash;
  }

  protected emitWithPayload<E extends keyof PolkadotTXEvents>(
    event: E,
    data: PolkadotTXEvents[E]['data']
  ): void | Promise<void> {
    this.emit(event, {
      key: this.notificationKey,
      path: this.path,
      address: this.transactionAddress ?? '',
      data: data,
    } as any);
  }

  private errorHandler(r: SubmittableResult) {
    //@ts-ignore
    let message = r.dispatchError?.type || r.type || r.message;
    if (r.dispatchError?.isModule) {
      try {
        const mod = r.dispatchError.asModule;
        const error = this.apiPromise.registry.findMetaError(
          new Uint8Array([mod.index.toNumber(), mod.error.toNumber()])
        );

        message = `${error.section}.${error.name}`;
      } catch (error) {
        message = Reflect.has(error as any, 'toString') ? (error as any)?.toString() : error;
      }
    }
    this.emitWithPayload('failed', message);
    return message;
  }

  private send(tx: SubmittableExtrinsic<any>) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        await tx.send((result) => {
          const status = result.status;
          const events = result.events.filter(({ event: { section } }) => section === 'system');
          const txStatus = result.status.type.toLowerCase() as QueueTxStatus;
          if (status.isInBlock || status.isFinalized) {
            for (const event of events) {
              const {
                event: { data, method },
              } = event;
              const [dispatchError] = data as any;

              if (method === 'ExtrinsicFailed') {
                let message = dispatchError.type;

                if (dispatchError.isModule) {
                  try {
                    const mod = dispatchError.asModule;
                    const error = dispatchError.registry.findMetaError(mod);

                    message = `${error.section}.${error.name}`;
                  } catch (error) {
                    const message = this.errorHandler(error as any);
                    reject(message);
                  }
                } else if (dispatchError.isToken) {
                  message = `${dispatchError.type}.${dispatchError.asToken.type}`;
                }

                this.emitWithPayload('failed', message);
                reject(message);
              } else if (method === 'ExtrinsicSuccess') {
                // todo return the TX hash
                resolve('okay');
                return this.emitWithPayload('finalize', undefined);
              }
            }
          }
        });
      } catch (e) {
        console.log(e);
        const errorMessage = this.errorHandler(e as any);
        this.emitWithPayload('failed', errorMessage);
        reject(errorMessage);
      }
    });
  }
}

export class PolkaTXBuilder {
  constructor(private apiPromise: ApiPromise, private notificationConfig: NotificationConfig) {}

  buildWithoutNotification<P extends Array<any>>({ method, section }: MethodPath, params: P): PolkadotTx<P> {
    return new PolkadotTx<P>(this.apiPromise.clone(), { method, section }, params);
  }

  build<P extends Array<any>>(path: MethodPath, params: P, notificationConfig?: NotificationConfig): PolkadotTx<P> {
    const tx = this.buildWithoutNotification(path, params);
    const nc = notificationConfig || this.notificationConfig;

    tx.on('loading', (data) => {
      nc.loading?.(data);
    });

    tx.on('finalize', (data) => {
      nc.finalize?.(data);
    });

    tx.on('failed', (data) => {
      nc.failed?.(data);
    });

    return tx;
  }
}
