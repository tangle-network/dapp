import { WebbApiProvider } from '@webb-dapp/api-providers';

export abstract class ECDSAClaims<T extends WebbApiProvider<any> = WebbApiProvider<any>> {
  constructor(readonly inner: T) {}
  abstract claim(destAccount: string, claim: Uint8Array): Promise<string>;
}
