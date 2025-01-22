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
 * Represents data that is 32 bytes long, with a `0x` prefix.
 *
 * This is mainly used for precompile functions that require `bytes32` for
 * either data or more frequently, Substrate addresses.
 */
export type Bytes32 = Brand<`0x${string}`, 'Bytes32'>;

export type AnyAddress = SubstrateAddress | Bytes32 | EvmAddress | string;

export type SolanaAddress = Brand<string, 'SolanaAddress'>;
