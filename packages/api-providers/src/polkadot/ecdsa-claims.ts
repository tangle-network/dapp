import { WebbError, WebbErrorCodes, WebbPolkadot } from '@webb-dapp/api-providers';
import { ECDSAClaims } from '@webb-dapp/api-providers/abstracts/ecdsa-claims';

export class PolkadotECDSAClaims extends ECDSAClaims<WebbPolkadot> {
  async claim(destAccount: string, claim: Uint8Array): Promise<string> {
    const account = await this.inner.accounts.activeOrDefault;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }
    const tx = this.inner.txBuilder.build(
      {
        method: 'claim',
        section: 'claims',
      },
      [destAccount, claim]
    );
    const txHash = await tx.call(account.address);
    return txHash;
  }
}
