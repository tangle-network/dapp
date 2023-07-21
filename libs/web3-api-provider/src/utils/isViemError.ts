import { BaseError } from 'viem';

/**
 * Check if an unknown error is a Viem error
 * with type assertion
 * @param error the error to check
 * @param checkFn a function to check the error type more specifically
 * @returns true if the error is a Viem error
 */
const isViemError = <ErrorClass extends BaseError = BaseError>(
  error: unknown,
  checkFn?: (error: unknown) => boolean
): error is ErrorClass => {
  return error instanceof BaseError && (!checkFn || checkFn(error));
};

export default isViemError;
