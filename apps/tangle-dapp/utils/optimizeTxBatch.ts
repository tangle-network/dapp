import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { assert } from '@polkadot/util';

const optimizeTxBatch = (
  api: ApiPromise,
  txs: SubmittableExtrinsic<'promise', ISubmittableResult>[]
) => {
  assert(txs.length > 0, 'At least one transaction should be provided');

  // Don't batch if there's only one transaction. This will prevent
  // any base fee from being charged for using the batching utility
  // without any benefit.
  if (txs.length === 1) {
    return txs[0];
  }

  // TODO: Batching logic needs to consider the maximum allowed batch limit: api.consts.utility.batchedCallsLimit. If >limit, split into multiple batches/transactions. Not as high priority since the limit is (as of writing this) ~10,000.
  return api.tx.utility.batch(txs);
};

export default optimizeTxBatch;
