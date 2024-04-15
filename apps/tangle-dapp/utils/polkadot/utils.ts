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

  try {
    const hash = await tx.signAndSend(address, {
      signer: injector.signer,
      // prevent txs having the same nonce
      // https://polkadot.js.org/docs/api/cookbook/tx#how-do-i-take-the-pending-tx-pool-into-account-in-my-nonce
      nonce: -1,
    });

    return hash.toHex();
  } catch (error) {
    throw new Error(
      typeof error === 'string'
        ? `Error: ${error}`
        : error instanceof Error
        ? error.message
        : 'Failed to get statement'
    );
  }
};
