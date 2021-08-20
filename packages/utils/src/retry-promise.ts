export async function retryPromise<T extends () => Promise<any>>(
  executor: T,
  maxReties = 20,
  sleep = 0
): Promise<ReturnType<T>> {
  let resolved = false;
  let tries = maxReties;
  while (!resolved && tries > 0) {
    try {
      return await executor();
    } catch (e) {
      tries--;
      console.error(e);
    }
  }
}
