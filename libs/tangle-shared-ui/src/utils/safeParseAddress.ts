/**
 * Safe address parsing utilities for converting strings to typed Address values.
 *
 * These utilities help reduce unsafe `as Address` type assertions by providing
 * proper validation before type conversion.
 */

import { Address, getAddress, isAddress } from 'viem';

/**
 * Safely parses a string to a viem Address type.
 * Returns the checksummed address if valid, or null if invalid.
 *
 * @param value - The string value to parse as an address
 * @returns The checksummed Address or null if invalid
 *
 * @example
 * ```ts
 * const address = safeParseAddress(rawData.address);
 * if (address) {
 *   // address is typed as Address
 *   console.log('Valid address:', address);
 * }
 * ```
 */
export const safeParseAddress = (value: string | undefined): Address | null => {
  if (!value || !isAddress(value)) {
    return null;
  }

  try {
    return getAddress(value);
  } catch {
    return null;
  }
};

/**
 * Parses a string to an Address type, throwing an error if invalid.
 * Use this when you expect the value to always be a valid address.
 *
 * @param value - The string value to parse as an address
 * @param fieldName - Optional field name for better error messages
 * @returns The checksummed Address
 * @throws Error if the value is not a valid address
 *
 * @example
 * ```ts
 * // In a parser where address is required
 * const address = parseAddressOrThrow(rawData.address, 'delegator address');
 * ```
 */
export const parseAddressOrThrow = (
  value: string | undefined,
  fieldName = 'address',
): Address => {
  if (!value) {
    throw new Error(`${fieldName} is required but was undefined`);
  }

  if (!isAddress(value)) {
    throw new Error(`${fieldName} is not a valid EVM address: ${value}`);
  }

  try {
    return getAddress(value);
  } catch (error) {
    throw new Error(
      `Failed to parse ${fieldName}: ${error instanceof Error ? error.message : 'unknown error'}`,
    );
  }
};

/**
 * Parses a string to a lowercase Address type.
 * Useful for matching addresses that may have inconsistent casing (e.g., from indexers).
 *
 * @param value - The string value to parse as an address
 * @returns The lowercase Address or null if invalid
 *
 * @example
 * ```ts
 * // For indexer data that may have inconsistent casing
 * const address = parseAddressLowercase(indexerData.token);
 * ```
 */
export const parseAddressLowercase = (
  value: string | undefined,
): Address | null => {
  if (!value || !isAddress(value)) {
    return null;
  }

  return value.toLowerCase() as Address;
};

/**
 * Validates and normalizes an address, returning a consistent format.
 * Useful for comparing addresses from different sources.
 *
 * @param value - The string value to normalize
 * @returns The checksummed Address or null if invalid
 */
export const normalizeAddress = (value: string | undefined): Address | null => {
  return safeParseAddress(value);
};

/**
 * Checks if two addresses are equal (case-insensitive comparison).
 *
 * @param a - First address to compare
 * @param b - Second address to compare
 * @returns true if addresses are equal, false otherwise
 *
 * @example
 * ```ts
 * if (addressesEqual(userAddress, tokenAddress)) {
 *   // addresses match
 * }
 * ```
 */
export const addressesEqual = (
  a: string | undefined,
  b: string | undefined,
): boolean => {
  if (!a || !b) {
    return false;
  }

  return a.toLowerCase() === b.toLowerCase();
};

export default safeParseAddress;
