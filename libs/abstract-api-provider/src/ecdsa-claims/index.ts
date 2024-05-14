import { WebbApiProvider } from '../webb-provider.interface.js';

export abstract class ECDSAClaims<
  T extends WebbApiProvider<any> = WebbApiProvider<any>
> {
  constructor(readonly inner: T) {}
  /**
   * Claim the amount of tokens to the given sig.
   * */
  abstract claim(destAccount: string, signature: string): Promise<string>;
  /**
   * Query the claim amount if any
   * */
  abstract getClaim(address: string): Promise<string | null>;
}
