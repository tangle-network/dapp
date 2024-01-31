import { isViemError } from '@webb-tools/web3-api-provider';

function ensureError(possibleError: unknown): Error {
  if (possibleError instanceof Error) {
    return possibleError;
  } else if (typeof possibleError === 'string') {
    return new Error(possibleError);
  } else if (isViemError(possibleError)) {
    return new Error(possibleError.message);
  }

  return new Error(
    `Unknown error because the thrown value was not an Error or string (type was ${typeof possibleError})`
  );
}

export default ensureError;
