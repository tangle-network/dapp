/**
 * Parses transaction errors into user-friendly messages.
 *
 * This utility handles common blockchain transaction errors and provides
 * clear, actionable messages for users.
 */

/** Common transaction error patterns and their user-friendly messages */
const ERROR_PATTERNS: Array<{ pattern: string; message: string }> = [
  {
    pattern: 'intrinsic gas too low',
    message: 'Transaction failed: Gas limit too low. Please try again.',
  },
  {
    pattern: 'insufficient funds',
    message: 'Insufficient funds to cover gas fees.',
  },
  {
    pattern: 'user rejected',
    message: 'Transaction was rejected by user.',
  },
  {
    pattern: 'User rejected',
    message: 'Transaction was rejected by user.',
  },
  {
    pattern: 'Failed to fetch',
    message:
      'Network request failed. Please check your connection and try again.',
  },
  {
    pattern: 'nonce too low',
    message: 'Transaction nonce conflict. Please try again.',
  },
  {
    pattern: 'already claimed',
    message: 'This address has already claimed its allocation.',
  },
  {
    pattern: 'InvalidMerkleProof',
    message:
      'Invalid Merkle proof for this account and amount. Double-check you selected the correct account.',
  },
  {
    pattern: 'invalid proof',
    message: 'Invalid proof. Please regenerate and try again.',
  },
  {
    pattern: 'not in merkle tree',
    message: 'Address not found in the merkle tree.',
  },
  {
    pattern: 'claim period ended',
    message: 'The claim period has ended.',
  },
  {
    pattern: 'paused',
    message: 'This operation is currently paused.',
  },
  {
    pattern: 'execution reverted',
    message: 'Transaction execution reverted. Please try again.',
  },
  {
    pattern: 'timeout',
    message: 'Transaction timed out. Please try again.',
  },
  {
    pattern: 'replacement fee too low',
    message: 'Gas price too low to replace pending transaction.',
  },
  {
    pattern: 'already known',
    message: 'Transaction already submitted. Please wait for confirmation.',
  },
];

/** Maximum length for error messages before truncation */
const MAX_ERROR_LENGTH = 100;

/**
 * Parses a transaction error into a user-friendly message.
 *
 * @param error - The error object or string to parse
 * @returns A user-friendly error message
 *
 * @example
 * ```ts
 * try {
 *   await submitTransaction();
 * } catch (err) {
 *   const message = parseTransactionError(err as Error);
 *   toast.error(message);
 * }
 * ```
 */
const parseTransactionError = (error: Error | string): string => {
  const message = typeof error === 'string' ? error : error.message || '';
  const lowerMessage = message.toLowerCase();

  // Check for known error patterns
  for (const { pattern, message: errorMessage } of ERROR_PATTERNS) {
    if (lowerMessage.includes(pattern.toLowerCase())) {
      return errorMessage;
    }
  }

  // Extract "Details:" section if present (common in some RPC errors)
  const detailsMatch = message.match(/Details:\s*([^V]+?)(?:Version:|$)/);

  if (detailsMatch) {
    return detailsMatch[1].trim();
  }

  // Fallback: truncate long messages
  if (message.length > MAX_ERROR_LENGTH) {
    return 'Transaction failed. Please try again.';
  }

  // Return the original message if it's reasonably short
  return message || 'An unknown error occurred.';
};

export default parseTransactionError;
