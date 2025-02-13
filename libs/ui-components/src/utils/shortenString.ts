/**
 * shorten a string in format `abc...xyz`
 * @param str the hex string to shorten
 * @param length first and last number of characters to display
 * @returns the shortened string
 */
export const shortenString = (str: string, length = 4): string => {
  if (str.length <= length * 2) {
    return str;
  }

  const startStr = str.split('').slice(0, length).join('');
  const endStr = str.split('').slice(-length).join('');

  return `${startStr}...${endStr}`;
};
