import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { BN } from '@polkadot/util';

/**
 * Transfers an asset from one account to another
 * @param apiPromise the polkadot api instance
 * @param sender the sender of the transaction
 * @param recipient the recipient of the transaction
 * @param assetId the asset id of the asset to transfer
 * @param amount the amount of the asset to transfer (u128 format)
 * @returns the hash of the transaction
 */
async function transferAsset(
  apiPromise: ApiPromise,
  sender: KeyringPair,
  recipient: string,
  assetId: number,
  amount: BN
) {
  // If assetId is 0, then interact with balances pallet
  if (assetId === 0) {
    return apiPromise.tx.balances
      .transfer(recipient, amount)
      .signAndSend(sender);
  }

  // Otherwise, interact with tokens pallet
  return apiPromise.tx.tokens
    .transfer(recipient, assetId, amount)
    .signAndSend(sender);
}

export default transferAsset;
