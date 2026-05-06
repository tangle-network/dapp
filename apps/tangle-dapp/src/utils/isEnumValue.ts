/**
 * Check whether a value is a valid enum value.
 *
 * Note that this won't work for enums with overlapping values
 * (e.g. `enum Foo { A = 1, B = 1 }`).
 */
const isEnumValue = <T>(value: unknown, enumObj: T): value is T[keyof T] => {
  // Just to be safe.
  if (
    value === undefined ||
    value === null ||
    typeof enumObj !== 'object' ||
    enumObj === null
  ) {
    return false;
  }

  return Object.values(enumObj).includes(value);
};

export default isEnumValue;
