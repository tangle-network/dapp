import { AnyAddress, SubstrateAddress } from '../types/address';
/**
 * Converts an EVM address to a Substrate address.
 *
 * @remarks
 * If the address is neither an Ethereum nor a Substrate address,
 * an error will be thrown.
 *
 * **Important note**: EVM and Substrate address conversion is one-way,
 * and not inverses. This means that if you convert a Substrate address
 * to an EVM address, you cannot convert it back to the **same** Substrate address.
 *
 * @param address - The address to be converted, which can be either a Substrate
 * or an EVM address.
 * @returns The converted Substrate address. If the address is already a
 * Substrate address, it will be returned as is.
 */
export declare const toSubstrateAddress: (address: AnyAddress, ss58Format?: number) => SubstrateAddress;
export default toSubstrateAddress;
