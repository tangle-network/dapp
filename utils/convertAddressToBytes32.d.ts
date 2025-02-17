import { Bytes32, AnyAddress } from '../types/address';
/**
 * Certain precompile functions require `bytes32` addresses instead
 * of the usual 20-byte `address` type.
 */
declare const convertAddressToBytes32: (address: AnyAddress) => Bytes32;
export default convertAddressToBytes32;
