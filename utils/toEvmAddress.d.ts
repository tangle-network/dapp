import { EvmAddress, SubstrateAddress } from '../types/address';
/**
 * Converts a Substrate address to a standard EVM address of 20 bytes.
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
 * @returns The converted EVM address. If the address is already an EVM address,
 * it will be returned as is.
 * @see https://docs.tangle.tools/developers/technicals/evm-substrate-transfers#convert-substrate-address-to-evm
 */
export declare const toEvmAddress: (address: SubstrateAddress | EvmAddress) => EvmAddress;
