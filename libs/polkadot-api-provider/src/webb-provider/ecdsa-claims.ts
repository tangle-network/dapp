import '@webb-tools/protocol-substrate-types';

import { ECDSAClaims } from '@nepoche/abstract-api-provider/ecdsa-claims';
import { WebbError, WebbErrorCodes } from '@nepoche/dapp-types/WebbError';

import { Option, U128 } from '@polkadot/types';
import { BN } from '@polkadot/util';

import { WebbPolkadot } from '../webb-provider';

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
    const txHash = await tx.call(null);
    return txHash;
  }

  async getClaim(address: string): Promise<string | null> {
    console.log('getClaim', address);
    const claimRaw = await this.inner.api.query.claims.claims<Option<U128>>(address);
    const claim = this.inner.api.createType('Option<U128>', claimRaw);
    if (claim.isSome) {
      let amount = claim.unwrap().toBn();
      amount = amount.div(new BN(10).pow(new BN(12)));
      return amount.toString();
    }
    return null;
  }
}
