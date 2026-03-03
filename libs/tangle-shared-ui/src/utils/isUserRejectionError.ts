/**
 * Detects if an error is a user rejection (wallet cancellation).
 *
 * Checks for:
 * - Viem's UserRejectedRequestError
 * - EIP-1193 user rejection code (4001)
 * - Common rejection message patterns
 */
const isUserRejectionError = (error: unknown): boolean => {
  // Traverse the error cause chain (viem wraps errors in nested cause properties)
  let current: unknown = error;
  const maxDepth = 10;

  for (let i = 0; i < maxDepth && current != null; i++) {
    if (typeof current !== 'object') {
      break;
    }

    const obj = current as Record<string, unknown>;

    // Check viem UserRejectedRequestError by name
    if (obj.name === 'UserRejectedRequestError') {
      return true;
    }

    // Check EIP-1193 user rejection code
    if (obj.code === 4001) {
      return true;
    }

    // Check for rejection messages in the error
    const message = obj.message ?? obj.shortMessage;
    if (
      typeof message === 'string' &&
      /user rejected|user denied|rejected the request/i.test(message)
    ) {
      return true;
    }

    // Traverse to nested cause
    current = obj.cause;
  }

  return false;
};

export default isUserRejectionError;
