// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retryPromise<T extends () => Promise<any>>(
  executor: T,
  maxReties = 20,
  sleepTime = 0
): Promise<ReturnType<T>> {
  let resolved = false;
  let tries = maxReties;

  while (!resolved && tries > 0) {
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
}
