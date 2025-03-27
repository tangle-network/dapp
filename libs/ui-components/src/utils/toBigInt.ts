export function toBigInt(value: string | number):
  | {
      result: bigint;
      error: null;
    }
  | {
      result: null;
      error: Error;
    } {
  try {
    const result = BigInt(value);

    return {
      result,
      error: null,
    };
  } catch (error) {
    return {
      result: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
