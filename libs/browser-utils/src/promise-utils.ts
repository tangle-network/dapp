/**
 * A utility function to execute a promise or reject it after a timeout
 * @param promise The promise to execute
 * @param timeout The timeout in milliseconds (@default 5000)
 * @returns A promise that resolves to the result of the original promise
 * or rejects after the timeout
 */
export const executorWithTimeout = <T>(
  promise: Promise<T>,
  timeout = 5000
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Action timed out, please try again!'));
    }, timeout);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((reason) => {
        clearTimeout(timer);
        reject(reason);
      });
  });
};
