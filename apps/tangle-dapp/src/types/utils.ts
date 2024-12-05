export type Brand<Type, Name extends string> = Type & { __brand: Name };

export type RemoveBrand = { __brand: never };

export type SubstrateAddress = Brand<string, 'SubstrateAddress'>;
