// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function retryPromise<T extends () => Promise<any>>(
  executor: T,
  maxRetries = 20,
  sleepTime = 0,
  abortSignal?: AbortSignal,
): Promise<ReturnType<T>> {
  let resolved = false;
  let tries = maxRetries;
  while (!resolved && tries > 0) {
    abortSignal?.throwIfAborted();
    try {
      const val = await executor();
      resolved = true;

      return val;
    } catch (e) {
      await sleep(sleepTime);
      tries--;

      // Log the error if we are out of retries
      if (tries === 0) {
        console.error(e);
      }
    }
  }
  throw new Error('Max retries reached');
}

export default retryPromise;
