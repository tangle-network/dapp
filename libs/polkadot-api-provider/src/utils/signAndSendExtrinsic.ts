import type { AddressOrPair, SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import { HexString } from '@polkadot/util/types';
import { TxEventHandlers } from '@webb-tools/abstract-api-provider';
import noop from 'lodash/noop';

export default function signAndSendExtrinsic<
  Context extends Record<string, unknown>,
>(
  activeAccount: AddressOrPair,
  extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
  context: Context,
  eventHandlers?: Partial<TxEventHandlers<Context>>,
) {
  return new Promise<HexString | null>((resolve) => {
    let unsub = noop;

    extrinsic
      .signAndSend(
        activeAccount,
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
