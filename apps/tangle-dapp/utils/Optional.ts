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
 * const valueOpt = Optional.new(42);
 *
 * if (valueOpt.value !== null) {
 *   console.log(value.value);
 * } else {
 *   console.log('Value is not present!');
 * }
 * ```
 */
class Optional<T extends NonNullable<unknown>> {
  static empty<T extends NonNullable<unknown>>(): Optional<T> {
    return new Optional();
  }

  static new<T extends NonNullable<unknown>>(value: T): Optional<T> {
    return new Optional(value);
  }

  readonly value: T | null;

  constructor(value?: T) {
    this.value = value ?? null;
  }

  map<U extends NonNullable<unknown>>(f: (value: T) => U): Optional<U> {
    if (this.value === null) {
      return Optional.empty();
    }

    return Optional.new(f(this.value));
  }

  unwrapOrThrow(): T {
    if (this.value === null) {
      throw new Error('Value is not present!');
    }

    return this.value;
  }

  get isPresent(): boolean {
    return this.value !== null;
  }

  get isEmpty(): boolean {
    return this.value === null;
  }
}

export default Optional;
