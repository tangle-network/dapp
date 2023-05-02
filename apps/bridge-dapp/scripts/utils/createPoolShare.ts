import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { Option, U32 } from '@polkadot/types';
import { polkadotTx } from '@webb-tools/test-utils';
import { BN } from 'bn.js';

/**
 * Create a new pool share and add it to the asset registry
 * @param apiPromise the polkadot api instance
 * @param name the pool share token name
 * @param nativeAssetId the native asset id to wrap into the pool share
 * @param signer the signer to sign the transaction
 * @param existentialDeposit the existential deposit of the pool share
 * @returns the newly created pool share id
 */
async function createPoolShare(
  apiPromise: ApiPromise,
  name: string,
  nativeAssetId: number,
  signer: KeyringPair,
  existentialDeposit = new BN(10).mul(new BN(10).pow(new BN(18)))
) {
  await polkadotTx(
    apiPromise,
    {
      section: 'sudo',
      method: 'sudo',
    },
    [
      apiPromise.tx.assetRegistry.register(
        name,
        {
          PoolShare: [nativeAssetId],
        },
        existentialDeposit
      ),
    ],
    signer
  );
  const nextAssetId = await apiPromise.query.assetRegistry.nextAssetId<U32>();
  const id = nextAssetId.toNumber() - 1;
  const tokenWrapperNonce = await apiPromise.query.tokenWrapper.proposalNonce<
    Option<U32>
  >(name);
  const nonce = tokenWrapperNonce.unwrapOr(new BN(0)).toNumber() + 1;
  await polkadotTx(
    apiPromise,
    {
      section: 'sudo',
      method: 'sudo',
    },
    [apiPromise.tx.tokenWrapper.setWrappingFee(1, id, nonce)],
    signer
  );
  return id;
}

export default createPoolShare;
