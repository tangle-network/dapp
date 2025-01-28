import { BaseError as ViemError } from 'viem';
import { BaseError as WagmiError } from 'wagmi';

function ensureError(possibleError: unknown): Error {
  if (
    possibleError instanceof ViemError ||
    possibleError instanceof WagmiError
  ) {
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
