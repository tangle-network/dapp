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
  // Regex explanation:
  // ^(\d+\.?\d*) - This part of the regex matches the beginning of the string and captures one or more digits (\d+), optionally followed by a decimal point (\.?) and zero or more digits (\d*). This is intended to match the numeric part of the string.
  // \s* - This matches and ignores any whitespace characters between the numeric and alphabet parts.
  // (\D+)$ - This matches and captures one or more non-digit characters (\D+) at the end of the string. This is intended to match the alphabetic part of the string (e.g., the token symbol).
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
