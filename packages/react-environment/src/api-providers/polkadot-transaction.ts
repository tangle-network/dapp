import { ApiPromise } from '@polkadot/api';
import { EventBus, LoggerService } from '@webb-tools/app-util';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { uniqueId } from 'lodash';
import { SubmittableExtrinsic } from '@polkadot/api/submittable/types';

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
  loading: PolkadotTXEventsPayload;
};

export type NotificationConfig = {
  loading?: (data: PolkadotTXEventsPayload) => void;
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
    this.transactionAddress = signAddress;
    const api = this.apiPromise;
    if (!api.tx[this.path.section] || !api.tx[this.path.section][this.path.method]) {
      txLogger.error(`can not find api.tx.${this.path.section}.${this.path.method}`);
      return;
    }
    const accountInfo = await api.query.system.account(signAddress);
    const injector = await web3FromAddress(signAddress);
    this.notificationKey = uniqueId(`${this.path.section}-${this.path.method}`);
    await api.setSigner(injector.signer);
    const txResults = await api.tx[this.path.section][this.path.method](...this.parms).signAsync(signAddress, {
      nonce: accountInfo.nonce.toNumber(),
    });
    this.emitWithPayload('beforeSend', undefined);
    this.emitWithPayload('loading', undefined);
    await this.send(txResults);
    this.emitWithPayload('afterSend', undefined);
    this.transactionAddress = null;
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

  private send(tx: SubmittableExtrinsic<any>) {
    return new Promise((resolve, reject) => {
      tx.send((status) => {
        if (status.isError) {
          this.emitWithPayload('failed', 'Failed to send message');
          reject(status.dispatchError);
        } else if (status.isFinalized) {
          this.emitWithPayload('finalize', undefined);
          resolve(status.dispatchInfo);
        } else if (status.isCompleted) {
          this.emitWithPayload('extrinsicSuccess', undefined);
        } else if (status.isWarning) {
          reject(status.dispatchInfo);
        }
      });
    });
  }
}

export class PolkaTXBuilder {
  constructor(private apiPromise: ApiPromise, private notificationConfig: NotificationConfig) {}

  buildWithoutNotification<P extends Array<any>>({ section, method }: MethodPath, params: P): PolkadotTx<P> {
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
