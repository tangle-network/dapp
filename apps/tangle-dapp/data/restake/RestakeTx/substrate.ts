import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult, Signer } from '@polkadot/types/types';
import noop from 'lodash/noop';
import type { Hash } from 'viem';

import {
  type DelegateContext,
  type DepositContext,
  RestakeTxBase,
  type TxEventHandlers,
} from './base';

export default class SubstrateRestakeTx extends RestakeTxBase {
  constructor(
    readonly activeAccount: string,
    readonly signer: Signer,
    readonly provider: ApiPromise,
  ) {
    super();

    this.provider.setSigner(this.signer);
  }

  private signAndSendExtrinsic<Context extends Record<string, unknown>>(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    context: Context,
    eventHandlers?: TxEventHandlers<Context>,
  ) {
    return new Promise<Hash | null>((resolve) => {
      let unsub = noop;

      extrinsic
        .signAndSend(
          this.activeAccount,
          { nonce: -1 },
          ({ dispatchError, events, status, txHash }) => {
            if (status.isInBlock) {
              const blockHash = status.asInBlock;
              eventHandlers?.onTxInBlock?.(
                txHash.toHex(),
                blockHash.toHex(),
                context,
              );
            }

            if (status.isFinalized) {
              const blockHash = status.asFinalized;
              eventHandlers?.onTxFinalized?.(
                txHash.toHex(),
                blockHash.toHex(),
                context,
              );
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
                    eventHandlers?.onTxFailed?.(message, context);
                    resolve(null);
                    unsub();
                  }
                } else if (dispatchError.isToken) {
                  message = `${dispatchError.type}.${dispatchError.asToken.type}`;
                }

                eventHandlers?.onTxFailed?.(message, context);
                resolve(null);
                unsub();
              } else if (method === 'ExtrinsicSuccess' && status.isFinalized) {
                const txHashHex = txHash.toHex();
                eventHandlers?.onTxSuccess?.(
                  txHashHex,
                  status.asFinalized.toHex(),
                  context,
                );
                // Resolve with the block hash
                resolve(txHashHex);
                unsub();
              }
            }
          },
        )
        .then((unsubFn) => (unsub = unsubFn))
        .catch((error) => {
          resolve(null);
          eventHandlers?.onTxFailed?.(error.message, context);
          unsub();
        });
    });
  }

  deposit = async (
    assetId: string,
    amount: bigint,
    eventHandlers?: TxEventHandlers<DepositContext>,
  ) => {
    const context = {
      amount,
      assetId,
    } satisfies DepositContext;

    // Deposit the asset into the Substrate chain.
    const extrinsic = this.provider.tx.multiAssetDelegation.deposit(
      assetId,
      amount,
    );

    eventHandlers?.onTxSending?.(context);

    return this.signAndSendExtrinsic(extrinsic, context, eventHandlers);
  };

  delegate = async (
    operatorAccount: string,
    assetId: string,
    amount: bigint,
    eventHandlers?: TxEventHandlers<DelegateContext>,
  ) => {
    const context = {
      amount,
      assetId,
      operatorAccount,
    } satisfies DelegateContext;

    // Deposit the asset into the Substrate chain.
    const extrinsic = this.provider.tx.multiAssetDelegation.delegate(
      operatorAccount,
      assetId,
      amount,
    );

    eventHandlers?.onTxSending?.(context);

    return this.signAndSendExtrinsic(extrinsic, context, eventHandlers);
  };
}
