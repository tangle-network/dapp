import { WebbApiProvider } from '../webb-provider.interface';

export abstract class ECDSAClaims<
  T extends WebbApiProvider<any> = WebbApiProvider<any>
> {
  constructor(readonly inner: T) {}
  /**
   * Claim the amount of tokens to the given sig.
   * */
  abstract claim(destAccount: string, claim: Uint8Array): Promise<string>;
  /**
   * Query the claim amount if any
   * */
  abstract getClaim(address: string): Promise<string | null>;
}
