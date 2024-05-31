/**
 * Check if an unknown error is an instance of the provided error class
 * with type assertion
 * @param error the error to check
 * @param ErrorClass the error class to check against and perform type assertion
 * @returns whether the error is an instance of the provided error class with type assertion
 */
function isErrorInstance<T>(
  error: unknown,
  ErrorClass: new (...args: any[]) => T,
): error is T {
  return error instanceof ErrorClass;
}

export default isErrorInstance;
