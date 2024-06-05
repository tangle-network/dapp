import { BaseError } from 'viem';

/**
 * Check if an unknown error is a Viem error
 * with type assertion
 * @param error the error to check
 * @param checkFn a function to check the error type more specifically
 * @returns true if the error is a Viem error
 */
const isViemError = (error: unknown): error is BaseError => {
  return error instanceof BaseError;
};

export default isViemError;
