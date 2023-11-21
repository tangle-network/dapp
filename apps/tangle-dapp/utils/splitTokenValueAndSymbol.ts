type SplitNumericAndAlphabetsReturnType = {
  value: number;
  symbol?: string;
};

/**
 *
 * This function splits a string into a numeric (Token value) and alphabets (Token symbol) part.
 * @param string - The string to split
 * @returns - An object containing the numeric and alphabets part of the string
 */
export const splitTokenValueAndSymbol = (
  string: string
): SplitNumericAndAlphabetsReturnType => {
  const regex = /^(\d+\.?\d*)\s*(\D+)$/;
  const matches = string.match(regex);

  if (matches) {
    return {
      value: Number(matches[1]),
      symbol: matches[2],
    };
  } else {
    return {
      value: Number(string),
    };
  }
};
