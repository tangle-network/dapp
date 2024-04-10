import { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { getInjector } from './api';

export const getTxPromise = async (
  address: string,
  tx: SubmittableExtrinsic<'promise', ISubmittableResult>
): Promise<HexString> => {
  const injector = await getInjector(address);

  if (!injector) {
    throw new Error('Failed to get Polkadot injector');
  }

  return new Promise((resolve, reject) => {
    try {
      tx.signAndSend(
        address,
        {
          signer: injector.signer,
          // Uncomment and understand the nonce when you need to deal with nonce manually
          nonce: -1,
        },
        ({ status, dispatchError, events }) => {
          if (status.isInBlock || status.isFinalized) {
            for (const event of events) {
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
                  } catch (error) {
                    console.error(error);
                    reject(message);
                  }
                } else if (dispatchError.isToken) {
                  message = `${dispatchError.type}.${dispatchError.asToken.type}`;
                }

                reject(message);
              } else if (method === 'ExtrinsicSuccess' && status.isFinalized) {
                resolve(status.asFinalized.toHex());
              }
            }
          }
        }
      ).catch((error) => {
        reject(
          `An error occurred during transaction submission: ${error.message}`
        );
      });
    } catch (error) {
      reject(
        typeof error === 'string'
          ? `Error: ${error}`
          : error instanceof Error
          ? error.message
          : 'An unknown error occurred.'
      );
    }
  });
};
