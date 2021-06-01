import { ApiPromise } from '@polkadot/api';
import { EventBus, LoggerService } from '@webb-tools/app-util';
import { web3FromAddress } from '@polkadot/extension-dapp';

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
    if (!this.apiPromise.tx[this.path.section] || !this.apiPromise.tx[this.path.section][this.path.method]) {
      txLogger.error(`can not find api.tx.${this.path.section}.${this.path.method}`);
      return;
    }
    const accountInfo = await this.apiPromise.query.system.account(signAddress);
    const injector = await web3FromAddress(signAddress);
    await this.apiPromise.setSigner(injector.signer);
    const txResults = await this.apiPromise.tx[this.path.section]
      [this.path.method](...this.parms)
      .signAsync(signAddress, {
        nonce: accountInfo.nonce.toNumber(),
      });

    const recipet = await txResults.send();
    const hash = recipet.hash;
    console.log(recipet);
  }
}

export class PolkadotTXBuiler {
  constructor(private apiPromise: ApiPromise) {}

  build<P extends Array<any>>({ section, method }: { section: string; method: string }, params: P): PolkadotTx<P> {
    return new PolkadotTx<P>(this.apiPromise, { method, section }, params);
  }
}
