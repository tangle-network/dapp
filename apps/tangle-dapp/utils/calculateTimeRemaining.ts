import { BN, BN_ZERO } from '@polkadot/util';
import { formatDistance } from 'date-fns';
import capitalize from 'lodash/capitalize';

function calculateTimeRemaining(
  babeExpectedBlockTime: BN | null,
  currentBlockNumber: BN | null,
  endingBlockNumber: BN | null
): string | null {
  if (
    babeExpectedBlockTime === null ||
    currentBlockNumber === null ||
    endingBlockNumber === null
  ) {
    return null;
  }

  // Never exceed the ending block number. This ensures that the time
  // remaining is always 0 when the current block number is greater than
  // the ending block number.
  const difference = currentBlockNumber.gt(endingBlockNumber)
    ? BN_ZERO
    : endingBlockNumber.sub(currentBlockNumber);

  const timeRemainingInMs = babeExpectedBlockTime.mul(difference).toNumber();

  return capitalize(formatDistance(Date.now() + timeRemainingInMs, Date.now()));
}

export default calculateTimeRemaining;
