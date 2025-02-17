import { AnyAddress, SolanaAddress } from '../types/address';
export declare const assertAddressBy: <T extends AnyAddress | SolanaAddress>(address: string, guard: (address: string) => address is T) => T;
