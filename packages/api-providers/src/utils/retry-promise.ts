// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retryPromise<T extends () => Promise<any>>(
  executor: T,
  maxRetries = 20,
  sleepTime = 0,
  abortSignal?: AbortSignal
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
      console.error(e);
    }
  }
  throw new Error('Mix retries reached');
}
