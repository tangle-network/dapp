import FaucetError from '../errors/FaucetError';
import FaucetErrorCode from '../errors/FaucetErrorCode';
import ErrorPayload from '../errors/FaucetErrorPayload';
import { MintTokenResult } from '../types';

const formatTimeLeft = (timeLeft: number): string => {
  const hours = Math.floor(timeLeft / 3600000);
  const minutes = Math.floor((timeLeft % 3600000) / 60000);
  const hoursStr = hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : '';
  const minutesStr =
    minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : '';
  return `${hoursStr} ${minutesStr}`.trim();
};

/**
 * Parses the error message from a mintTokens call result
 * @param result the result of the mintTokens call
 * @returns a string containing the error message to display to the user
 */
const parseErrorFromResult = (result: MintTokenResult | null): string => {
  const defaultMessage = 'Oops, the transfer could not be completed.';

  if (!result || !FaucetError.isFaucetError(result)) return defaultMessage;

  if (result.getErrorCode() !== FaucetErrorCode.TOO_MANY_CLAIM_REQUESTS)
    return defaultMessage;

  const payload =
    result.getPayload() as ErrorPayload[FaucetErrorCode.TOO_MANY_CLAIM_REQUESTS];

  if (payload?.lastClaimedDate && payload?.claimPeriod) {
    const timeLeft =
      Date.now() - payload.lastClaimedDate.getTime() + payload.claimPeriod;
    const timeStr = formatTimeLeft(timeLeft);

    return `You have already claimed within the specified time period. Please wait ${timeStr} before making another claim.`;
  }

  return defaultMessage;
};

export default parseErrorFromResult;
