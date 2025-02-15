export const isTemplateBigInt = (value: unknown): value is `${bigint}` => {
  if (typeof value !== 'string') {
    return false;
  }

  if (!/^[+-]?\d+$/.test(value)) {
    return false;
  }

  // Attempt to cast the value to BigInt; if it fails, it is not a valid bigint
  try {
    BigInt(value);
    return true;
  } catch {
    return false;
  }
};
