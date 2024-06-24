import type { ApiPromise } from '@polkadot/api';
import { Signer } from '@polkadot/types/types';
import noop from 'lodash/noop';
import type { Hash } from 'viem';

import { RestakeTxBase, type TxEventHandlers } from './base';

export default class SubstrateRestakeTx extends RestakeTxBase {
  constructor(
    readonly activeAccount: string,
    readonly signer: Signer,
    readonly provider: ApiPromise,
  ) {
    super();

    this.provider.setSigner(this.signer);
    this.deposit = this.deposit.bind(this);
  }

  public async deposit(
    assetId: string,
    amount: bigint,
    eventHandlers?: TxEventHandlers,
  ) {
    // Deposit the asset into the Substrate chain.
    const extrinsic = this.provider.tx.multiAssetDelegation.deposit(
      assetId,
      amount,
    );

    eventHandlers?.onTxSending?.();

    return new Promise<Hash | null>((resolve) => {
      let unsub = noop;

      extrinsic
        .signAndSend(
          this.activeAccount,
          { nonce: -1 },
          ({ dispatchError, events, status, txHash }) => {
            if (status.isInBlock) {
              const hash = status.asInBlock;
              eventHandlers?.onTxInBlock?.(hash.toHex());
            }

            if (status.isFinalized) {
              const hash = status.asFinalized;
              eventHandlers?.onTxFinalized?.(hash.toHex());
            }

            if (!status.isFinalized) {
              return;
            }

            const systemEvents = events.filter(
              ({ event: { section } }) => section === 'system',
            );

            for (const event of systemEvents) {
              const {
                event: { method },
              } = event;

              if (dispatchError && method === 'ExtrinsicFailed') {
                let message: string = dispatchError.type;

                if (dispatchError.isModule) {
                  try {
                    const mod = dispatchError.asModule;
                    const error = dispatchError.registry.findMetaError(mod);

                    message = `${error.section}.${error.name}`;
                  } catch {
                    eventHandlers?.onTxFailed?.(message);
                    resolve(null);
                    unsub();
                  }
                } else if (dispatchError.isToken) {
                  message = `${dispatchError.type}.${dispatchError.asToken.type}`;
                }

                eventHandlers?.onTxFailed?.(message);
                resolve(null);
                unsub();
              } else if (method === 'ExtrinsicSuccess' && status.isFinalized) {
                const hash = txHash.toHex();
                eventHandlers?.onTxSuccess?.(hash);
                // Resolve with the block hash
                resolve(hash);
                unsub();
              }
            }
          },
        )
        .then((unsubFn) => (unsub = unsubFn))
        .catch((error) => {
          eventHandlers?.onTxFailed?.(error.message);
        });
    });
  }
}
