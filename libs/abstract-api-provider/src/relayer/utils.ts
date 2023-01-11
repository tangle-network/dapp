/**
 * Pad hexString with zero to make it of length 64.
 * @param hexString The initial hexString.
 * @returns The padded hexString.
 *
 * @notice This function is copied from https://github.com/webb-tools/relayer/blob/c5e007dba713185b8851248942f3ce5a9dec228c/tests/lib/utils.ts#L11-L13
 */
export function padHexString(hexString: string): string {
  return '0x' + hexString.substring(2).padStart(64, '0');
}
