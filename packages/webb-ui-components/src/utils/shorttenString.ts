/**
 * shorten a string in format `abc...xyz`
 * @param str the hex string to shorten
 * @param chars first and last number of characters to display
 * @returns the shortened string
 */
export const shortenString = (str: string, chars = 4): string => {
  if (str.length <= chars * 2) {
    return str;
  }

  const startStr = str.split('').slice(0, chars).join('');

  const endStr = str.split('').slice(-chars).join('');
  return `${startStr}...${endStr}`;
};
