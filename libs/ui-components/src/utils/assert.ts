/**
 * Browser-safe assertion. Throws a plain `Error` (not Node's `AssertionError`)
 * so this library introduces no Node-built-in dependency and stays bundle-clean
 * for browser targets. Carries a TypeScript `asserts condition` signature so
 * callers retain type-narrowing at the call site, matching the ergonomics of
 * Node's `assert`.
 *
 * @param condition - The condition to check.
 * @param message - Error message used when `condition` is falsy.
 * @throws {Error} when `condition` is falsy.
 */
export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
