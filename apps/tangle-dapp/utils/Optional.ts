/**
 * A wrapper for a value that may or may not be present.
 *
 * In certain cases, it is useful to have a type that can
 * represent a value that may or may not be present. Usually
 * that can be done with `null` or `undefined`, but this
 * class provides a more explicit way to represent that.
 *
 * The reason why `null` or `undefined` might not be enough
 * in all cases, is because there are hooks that return `null`
 * to represent a loading state. If those values can also be optional,
 * then it is not possible to distinguish between a loading state
 * and a value that is not present.
 *
 * One method to overcome this limitation would be to use `T | null | undefined`,
 * but that would make the code more verbose and harder to read and
 * understand. This class provides a more explicit way to represent
 * a value that may or may not be present.
 *
 * @example
 * ```
 * const value = new Optional(42);
 *
 * if (value.value !== null) {
 *   console.log(value.value);
 * } else {
 *   console.log('Value is not present!');
 * }
 * ```
 */
class Optional<T> {
  readonly value: T | null;

  constructor(value?: T) {
    this.value = value ?? null;
  }
}

export default Optional;
