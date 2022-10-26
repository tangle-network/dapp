/**
 * shorten the a hex string and concatenate `0x` at the beginning of the string if not yet
 * @param hexStr the hex string to shorten
 * @param chars first and last number of characters to display
 * @returns the shortened hex string
 */
export const shortenHex = (hexStr: string, chars = 4): string => {
  const hexLower = hexStr.toLowerCase();
  const isStartWith0x = hexLower.startsWith('0x');
  let startStr = '',
    endStr = '';

  if (isStartWith0x && hexLower.length <= chars * 2 + 2) {
    return hexLower;
  }

  if (!isStartWith0x && hexLower.length <= chars * 2) {
    return `0x${hexLower}`;
  }

  if (isStartWith0x) {
    startStr = hexLower
      .split('')
      .slice(0, chars + 2)
      .join('');
    endStr = hexLower.split('').slice(-chars).join('');
  } else {
    startStr = hexLower.split('').slice(0, chars).join('');
    endStr = hexLower.split('').slice(-chars).join('');
  }
  return isStartWith0x ? `${startStr}...${endStr}` : `0x${startStr}...${endStr}`;
};
