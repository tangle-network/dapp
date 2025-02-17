import { EvmAddress, SubstrateAddress } from '../types/address';
/**
 * Check if the address is valid EVM or Substrate address.
 */
export declare const isValidAddress: (address: string) => address is EvmAddress | SubstrateAddress;
export default isValidAddress;
