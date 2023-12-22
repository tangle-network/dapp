import { ECDSAClaims } from '@webb-tools/abstract-api-provider/ecdsa-claims';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';

import { Option, U128 } from '@polkadot/types';
import { BN } from '@polkadot/util';

import { WebbPolkadot } from '../webb-provider';
import { isEthereumAddress } from '@polkadot/util-crypto';

export class PolkadotECDSAClaims extends ECDSAClaims<WebbPolkadot> {
  async claim(destAccount: string, signature: string): Promise<string> {
    const account = await this.inner.accounts.activeOrDefault;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const isDestAccountEth = isEthereumAddress(destAccount);
    const isSignerEth = isEthereumAddress(account.address);

    const tx = this.inner.txBuilder.buildWithoutNotification(
      [
        {
          method: 'claim',
          section: 'claims',
        },
      ],
      [
        [
          isDestAccountEth ? { EVM: destAccount } : { Native: destAccount }, // destAccount
          isSignerEth ? { EVM: account.address } : { Native: account.address }, // signer
          isDestAccountEth ? { EVM: signature } : { Native: signature }, // signataure
        ],
      ]
    );

    const txHash = await tx.call(null);

    return txHash;
  }

  async getClaim(address: string): Promise<string | null> {
    const claimRaw = await this.inner.api.query.claims.claims(address);
    if (claimRaw.isSome) {
      let amount = claimRaw.unwrap().toBn();
      amount = amount.div(new BN(10).pow(new BN(12)));
      return amount.toString();
    }
    return null;
  }
}
