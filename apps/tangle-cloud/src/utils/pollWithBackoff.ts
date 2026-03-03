type PollOptions = {
  /**
   * Initial delay in milliseconds before first poll
   * @default 1000
   */
  initialDelay?: number;
  /**
   * Maximum delay between polls in milliseconds
   * @default 8000
   */
  maxDelay?: number;
  /**
   * Maximum total time to poll in milliseconds
   * @default 30000
   */
  maxTotalTime?: number;
  /**
   * Multiplier for exponential backoff
   * @default 2
   */
  backoffMultiplier?: number;
};

/**
 * Polls a condition function with exponential backoff until it returns true
 * or the maximum total time is reached.
 *
 * @param checkCondition - Function that returns true when polling should stop
 * @param options - Polling configuration options
 * @returns Promise that resolves to true if condition was met, false if timed out
 *
 * @example
 * // Poll until data is updated, checking every 1s, 2s, 4s, 8s...
 * const success = await pollWithBackoff(async () => {
 *   const data = await refetch();
 *   return data.operatorCount > previousCount;
 * });
 */
const pollWithBackoff = async (
  checkCondition: () => Promise<boolean> | boolean,
  options: PollOptions = {},
): Promise<boolean> => {
  const {
    initialDelay = 1000,
    maxDelay = 8000,
    maxTotalTime = 30000,
    backoffMultiplier = 2,
  } = options;

  const startTime = Date.now();
  let currentDelay = initialDelay;

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  while (Date.now() - startTime < maxTotalTime) {
    await sleep(currentDelay);

    const conditionMet = await checkCondition();
    if (conditionMet) {
      return true;
    }

    // Increase delay for next iteration, capped at maxDelay
    currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelay);
  }

  return false;
};

export default pollWithBackoff;
