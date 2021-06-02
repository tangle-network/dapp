import { ApiPromise } from '@polkadot/api';
import { EventBus, LoggerService } from '@webb-tools/app-util';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { uniqueId } from 'lodash';

type PolkadotTXEvents = {
  beforeSend: void;
  afterSend: void;
  onFailed: void;
  onFinalize: void;
  onInBlock: void;
  onExtrinsicSuccess: void;
};
const txLogger = LoggerService.get('PolkadotTx');

export class PolkadotTx<P extends Array<any>> extends EventBus<PolkadotTXEvents> {
  constructor(
    private apiPromise: ApiPromise,
    private path: {
      method: string;
      section: string;
    },
    private parms: P
  ) {
    super();
  }

  async call(signAddress: string) {
    const api = this.apiPromise;
    if (!api.tx[this.path.section] || !api.tx[this.path.section][this.path.method]) {
      txLogger.error(`can not find api.tx.${this.path.section}.${this.path.method}`);
      return;
    }
    const accountInfo = await api.query.system.account(signAddress);
    const injector = await web3FromAddress(signAddress);
    await api.setSigner(injector.signer);
    const txResults = await api.tx[this.path.section][this.path.method](...this.parms).signAsync(signAddress, {
      nonce: accountInfo.nonce.toNumber(),
    });
    this.emit('beforeSend', undefined);
    const recipet = await txResults.send();
    this.emit('afterSend', undefined);
    this.emit('onExtrinsicSuccess', undefined);
    const hash = recipet.hash.toString();
    const transactionkey = uniqueId(`${this.path.section}-${this.path.method}`);
    console.log(recipet);
  }
}

export class PolkadotTXBuiler {
  constructor(private apiPromise: ApiPromise) {}

  build<P extends Array<any>>({ section, method }: { section: string; method: string }, params: P): PolkadotTx<P> {
    return new PolkadotTx<P>(this.apiPromise.clone(), { method, section }, params);
  }
}
