/**
 * shorten the a hex string and concatenate `0x` at the beginning of the string if not yet
 * @param hexStr the hex string to shorten
 * @param chars first and last number of characters to display
 * @returns the shortened hex string
 */
export const shortenHex = (hexStr: string, chars = 4): string => {
  const hexLower = hexStr.toLowerCase();
  const hasOx = hexLower.startsWith('0x');
  let startStr = '',
    endStr = '';

  if (hasOx) {
    startStr = hexLower
      .split('')
      .slice(0, chars + 2)
      .join('');
    endStr = hexLower.split('').slice(-chars).join('');
  } else {
    startStr = hexLower.split('').slice(0, chars).join('');
    endStr = hexLower.split('').slice(-chars).join('');
  }
  return hasOx ? `${startStr}...${endStr}` : `0x${startStr}...${endStr}`;
};
