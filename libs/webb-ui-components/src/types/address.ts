export type Brand<Type, Name extends string> = Type & { __brand: Name };

export type RemoveBrand = { __brand: never };

export type SubstrateAddress = Brand<string, 'SubstrateAddress'>;

/**
 * The standard EVM address that is 20 bytes long.
 *
 * Also known as `address` in Solidity and `H160` in Substrate.
 *
 * @example
 * const evm20: EvmAddress20 = "0xa5fAA47a324754354CB0A305941C8cCc6b5de296";
 */
export type EvmAddress = Brand<`0x${string}`, 'EvmAddress20'>;

/**
 * The same as a Substrate address, but as 32 bytes and without
 * encoding.
 *
 * This is mainly used for precompile functions that require `bytes32`.
 */
export type SubstrateBytes32Address = Brand<
  `0x${string}`,
  'SubstrateAddressBytes32'
>;

export type AnyAddress =
  | SubstrateAddress
  | SubstrateBytes32Address
  | EvmAddress
  | string;
