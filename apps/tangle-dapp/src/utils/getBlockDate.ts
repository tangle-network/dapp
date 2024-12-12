import { BN } from '@polkadot/util';

/**
 * Calculates the estimated date of a block based on the expected block time,
 * the current block number, and the target block number.
 *
 * Note: RPC can only store a fixed number of recent blocks at a time,
 * so the API cannot query blocks that are far in the past. Therefore,
 * we need to get the current block number and then do the calculation here
 *
 * @param babeExpectedBlockTime The expected block time (in milliseconds)
 * @param currentBlockNumber The current block number.
 * @param blockNumber The target block number.
 * @returns The estimated date of the target block, or null if any of the input values are null.
 */
export default function getBlockDate(
  babeExpectedBlockTime: BN | null,
  currentBlockNumber: BN | null,
  blockNumber: BN | null,
): Date | null {
  if (
    babeExpectedBlockTime === null ||
    currentBlockNumber === null ||
    blockNumber === null
  ) {
    return null;
  }

  const isPast = currentBlockNumber.gt(blockNumber);

  const difference = isPast
    ? currentBlockNumber.sub(blockNumber)
    : blockNumber.sub(currentBlockNumber);

  const timeRemainingInMs = babeExpectedBlockTime.mul(difference).toNumber();

  return new Date(
    Date.now() + (isPast ? -timeRemainingInMs : timeRemainingInMs),
  );
}
