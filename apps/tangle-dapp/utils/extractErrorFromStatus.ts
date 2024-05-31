import { ISubmittableResult } from '@polkadot/types/types';

import ensureError from './ensureError';

function extractErrorFromTxStatus(status: ISubmittableResult): Error | null {
  if (
    !status.isError &&
    !status.isWarning &&
    status.dispatchError === undefined
  ) {
    return null;
  } else if (status.dispatchError === undefined) {
    return ensureError(status.internalError);
  }

  const metaError = status.dispatchError.registry.findMetaError(
    status.dispatchError.asModule,
  );

  return new Error(`Dispatch error: ${metaError.section}.${metaError.name}`);
}

export default extractErrorFromTxStatus;
