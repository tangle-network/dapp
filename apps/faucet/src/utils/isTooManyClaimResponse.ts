import { TooManyClaimResponse } from '../types';

const isTooManyClaimResponse = (
  response: unknown,
): response is TooManyClaimResponse => {
  if (typeof response !== 'object' || response === null) {
    return false;
  }

  return (
    'error' in response &&
    typeof response['error'] === 'string' &&
    'reason' in response &&
    typeof response['reason'] === 'string' &&
    'last_claimed_date' in response &&
    (typeof response['last_claimed_date'] === 'string' ||
      response['last_claimed_date'] === null) &&
    'time_to_wait_between_claims_ms' in response &&
    (typeof response['time_to_wait_between_claims_ms'] === 'number' ||
      response['time_to_wait_between_claims_ms'] === null)
  );
};

export default isTooManyClaimResponse;
