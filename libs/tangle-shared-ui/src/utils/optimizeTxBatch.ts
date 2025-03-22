import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { assert } from '@polkadot/util';

// TODO: Could also be improved to handle block weight limits here automatically; keep creating batches until the block weight limit is reached, then send the batch and continue with the remaining transactions.
const optimizeTxBatch = (
  api: ApiPromise,
  txs: SubmittableExtrinsic<'promise', ISubmittableResult>[],
) => {
  assert(txs.length > 0, 'At least one transaction should be provided');

  // Don't batch if there's only one transaction. This will prevent
  // any base fee from being charged for using the batching utility
  // without any benefit.
  if (txs.length === 1) {
    return txs[0];
  }

  return api.tx.utility.batch(txs);
};

export default optimizeTxBatch;
