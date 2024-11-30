export type Brand<Type, Name extends string> = Type & { __brand: Name };

export type RemoveBrand = { __brand: never };

export type SubstrateAddress = Brand<string, 'SubstrateAddress'>;

export type EvmAddress20 = Brand<`0x${string}`, 'EvmAddress20'>;

export type EvmAddress32 = Brand<`0x${string}`, 'EvmAddress32'>;

export type EvmAddress = EvmAddress20 | EvmAddress32;

export type AnyAddress = SubstrateAddress | EvmAddress;
