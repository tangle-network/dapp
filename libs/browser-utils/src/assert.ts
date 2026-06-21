/**
 * Browser-safe assertion. Throws a plain `Error` (not Node's `AssertionError`)
 * so callers introduce no Node-built-in dependency and stay bundle-clean for
 * browser targets. Carries a TypeScript `asserts condition` signature so call
 * sites retain type-narrowing, matching the ergonomics of Node's `assert`.
 *
 * @param condition - The condition to check.
 * @param message - Optional error message used when `condition` is falsy.
 * @throws {Error} when `condition` is falsy.
 */
export function assert(
  condition: unknown,
  message?: string,
): asserts condition {
  if (!condition) {
    throw new Error(message ?? 'Assertion failed');
  }
}
