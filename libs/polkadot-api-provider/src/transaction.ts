// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/ban-ts-comment */

import { NotificationHandler } from '@nepoche/abstract-api-provider/webb-provider.interface';
import { EventBus, LoggerService } from '@webb-tools/app-util';
import lodash from 'lodash';

import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/submittable/types';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import { IKeyringPair } from '@polkadot/types/types';

const { uniqueId } = lodash;

type AddressOrPair = string | IKeyringPair;

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
  path: MethodPath | MethodPath[];
};
type PolkadotTXEvents = {
  beforeSend: PolkadotTXEventsPayload;
  afterSend: PolkadotTXEventsPayload;
  failed: PolkadotTXEventsPayload<string>;
  finalize: PolkadotTXEventsPayload<string | void | undefined>;
  inBlock: PolkadotTXEventsPayload;
  extrinsicSuccess: PolkadotTXEventsPayload;
  loading: PolkadotTXEventsPayload<any>;
};

export type NotificationConfig = {
  loading: (data: PolkadotTXEventsPayload<any>) => string | number;
  finalize: (data: PolkadotTXEventsPayload<string | void | undefined>) => string | number;
  failed: (data: PolkadotTXEventsPayload<string>) => string | number;
};
const txLogger = LoggerService.get('PolkadotTx');

export class PolkadotTx<P extends Array<any>> extends EventBus<PolkadotTXEvents> {
  public notificationKey = '';
  private transactionAddress: AddressOrPair | null = null;
  private isWrapped = false;

  constructor(
    private apiPromise: ApiPromise,
    private paths: MethodPath[],
    private parms: P[],
    private injectedExtension: InjectedExtension
  ) {
    super();
  }

  async call(signAddress: AddressOrPair | null) {
    const api = this.apiPromise;

    for (let i = 0; i < this.paths.length; i++) {
      const path = this.paths[i];
      txLogger.info(`Sending ${path.section} ${path.method} transaction by`, signAddress, this.parms);
      this.transactionAddress = signAddress;

      await api.isReady;
      if (!api.tx[path.section] || !api.tx[path.section][path.method]) {
        console.log(`can not find api.tx.${path.section}.${path.method}`);
        txLogger.error(`can not find api.tx.${path.section}.${path.method}`);

        throw new Error(`can not find api.tx.${path.section}.${path.method}`);
      }

      this.notificationKey = uniqueId(`${path.section}-${path.method}`);
    }

    if (signAddress && (signAddress as IKeyringPair)?.address === undefined) {
      const injector = this.injectedExtension;

      api.setSigner(injector.signer);
    }

    let txResults: any;
    if (this.paths.length === 1) {
      const path = this.paths[0];
      const parms = this.parms[0];

      txResults = signAddress
        ? await api.tx[path.section][path.method](...parms).signAsync(signAddress, {
            nonce: -1,
          })
        : api.tx[path.section][path.method](...parms);
    } else {
      const parms = this.parms;
      const txs = this.paths.map((path, index) => {
        return api.tx[path.section][path.method](...parms[index]);
      });
      txResults = signAddress
        ? await api.tx.utility.batch(txs).signAsync(signAddress, {
            nonce: -1,
          })
        : api.tx.utility.batch(txs);
    }

    await this.emitWithPayload('beforeSend', undefined);
    await this.emitWithPayload('loading', '');
    const hash = txResults.hash.toString();

    await this.send(txResults);

    await this.emitWithPayload('afterSend', undefined);
    this.transactionAddress = null;
    this.paths.forEach((path) => {
      txLogger.info(`Tx ${path.section} ${path.method} is Done: TX hash=`, hash);
    });

    return hash;
  }

  protected async emitWithPayload<E extends keyof PolkadotTXEvents>(
    event: E,
    data: PolkadotTXEvents[E]['data']
  ): Promise<void> {
    if (this.isWrapped) {
      return;
    }

    this.emit(event, {
      address: this.transactionAddress ?? '',
      data: data,
      key: this.notificationKey,
      path: this.paths,
    } as any);
  }

  private errorHandler(r: SubmittableResult) {
    // @ts-ignore
    let message = r.dispatchError?.type || r.type || r.message;

    if (r.dispatchError?.isModule) {
      try {
        const mod = r.dispatchError.asModule;
        const error = this.apiPromise.registry.findMetaError(mod.error);

        message = `${error.section}.${error.name}`;
      } catch (error) {
        message = Reflect.has(error as any, 'toString') ? (error as any)?.toString() : error;
      }
    }

    // eslint-disable-next-line  @typescript-eslint/no-floating-promises
    this.emitWithPayload('failed', message);

    return message;
  }

  private async send(tx: SubmittableExtrinsic<any>) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        await tx.send(async (result) => {
          const status = result.status;
          const events = result.events.filter(({ event: { section } }) => section === 'system');

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

                this.isWrapped = true;
                await this.emitWithPayload('failed', message);
                reject(message);
              } else if (method === 'ExtrinsicSuccess') {
                // todo return the TX hash
                resolve('okay');
                await this.emitWithPayload('finalize', undefined);
                this.isWrapped = true;
              }
            }
          }
        });
      } catch (e) {
        console.log(e);
        const errorMessage = this.errorHandler(e as any);

        await this.emitWithPayload('failed', errorMessage);
        reject(errorMessage);
      }
    });
  }
}

export class PolkaTXBuilder {
  constructor(
    private apiPromise: ApiPromise,
    private notificationHandler: NotificationHandler,
    private readonly injectedExtension: InjectedExtension
  ) {}

  buildWithoutNotification<P extends Array<any>>(paths: MethodPath[], params: P[]): PolkadotTx<P> {
    return new PolkadotTx<P>(this.apiPromise.clone(), paths, params, this.injectedExtension);
  }

  build<P extends Array<any>>(
    methodPath: MethodPath | MethodPath[],
    methodParams: P | P[],
    notificationHandler?: NotificationHandler
  ): PolkadotTx<P> {
    const isBatchCall = Array.isArray(methodPath);
    const path = isBatchCall ? methodPath : [methodPath];
    const params = isBatchCall ? methodParams : [methodParams];
    const tx = this.buildWithoutNotification(path, params);
    const handler = notificationHandler || this.notificationHandler;
    const notificationMessage = isBatchCall
      ? path.reduce(
          (acc, item, index, { length }) => acc + `${item.section}:${item.method}${index + 1 === length ? '' : '&'}`,
          ''
        )
      : `${path[0].section}:${path[0].method}`;
    tx.on('loading', (data) => {
      handler({
        description: data.address
          ? `${data.address.substring(0, 10)}...${data.address.substring(36)}`
          : 'Unsigned transaction',
        key: data.key,
        level: 'loading',
        message: notificationMessage,
        name: 'Transaction',
        persist: true,
      });
    });

    tx.on('finalize', (data) => {
      handler({
        description: data.address
          ? `${data.address.substring(0, 10)}...${data.address.substring(36)}`
          : 'Unsigned transaction',
        key: data.key,
        level: 'success',
        message: notificationMessage,
        name: 'Transaction',
        persist: true,
      });
    });

    tx.on('failed', (data) => {
      console.log(data);
      handler({
        description: data.data,
        key: data.key,
        level: 'error',
        message: notificationMessage,
        name: 'Transaction',
        persist: true,
      });
    });

    return tx;
  }
}
