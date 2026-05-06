import assert from 'assert';

const enumValueToNumber = <T>(enumValue: T): number => {
  assert(
    typeof enumValue === 'number',
    `Expected enum value to be a number, but instead it was ${typeof enumValue}`,
  );

  return enumValue;
};

export default enumValueToNumber;
