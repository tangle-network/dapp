import { isErrorInstance } from '@webb-tools/web3-api-provider';
import isViemError from '@webb-tools/web3-api-provider/utils/isViemError';
import { BaseError } from 'wagmi';

function ensureError(possibleError: unknown): Error {
  if (isViemError(possibleError) || isErrorInstance(possibleError, BaseError)) {
    return new Error(possibleError.shortMessage);
  } else if (typeof possibleError === 'string') {
    return new Error(possibleError);
  } else if (possibleError instanceof Error) {
    return possibleError;
  }

  return new Error(
    `Unknown error because the thrown value was not an Error or string (type was ${typeof possibleError})`,
  );
}

export default ensureError;
