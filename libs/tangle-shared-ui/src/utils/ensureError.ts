import { BaseError as ViemError } from 'viem';
import { BaseError as WagmiError } from 'wagmi';

const getNestedErrorProp = (
  error: unknown,
  key: string,
  maxDepth = 5,
): unknown => {
  let current: any = error;
  for (let i = 0; i < maxDepth && current; i++) {
    if (typeof current === 'object' && key in current) {
      return (current as any)[key];
    }
    current = typeof current === 'object' ? (current as any).cause : undefined;
  }
  return undefined;
};

function ensureError(possibleError: unknown): Error {
  if (
    possibleError instanceof ViemError ||
    possibleError instanceof WagmiError
  ) {
    const short = possibleError.shortMessage || possibleError.message;

    const reason = getNestedErrorProp(possibleError, 'reason');
    const details = getNestedErrorProp(possibleError, 'details');
    const nestedMessage = getNestedErrorProp(possibleError, 'message');

    const extra =
      (typeof reason === 'string' && reason.trim() !== '' ? reason : null) ??
      (typeof details === 'string' && details.trim() !== '' ? details : null) ??
      (typeof nestedMessage === 'string' && nestedMessage.trim() !== ''
        ? nestedMessage
        : null);

    if (
      extra &&
      extra !== short &&
      !short.includes(extra) &&
      // Avoid extremely noisy "raw call arguments" type messages.
      extra.length < 240
    ) {
      return new Error(`${short} (${extra})`);
    }

    return new Error(short);
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
