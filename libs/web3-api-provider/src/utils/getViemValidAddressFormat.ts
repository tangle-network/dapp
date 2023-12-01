/**
 * Get the address with correct format to use as parameter in Viem's functions
 * @param address - The address with string format
 * @returns The address with string format with `0x${string}` format
 */
export default function getViemValidAddressFormat(address: string) {
  return `0x${address.replace(/^0x/, '')}` as const;
}
