import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { polkadotTx } from '@webb-tools/test-utils';

/**
 * Adding an asset to a existing pool
 * @param apiPromise the polkadot api instance
 * @param assetId the asset id
 * @param poolAssetId the pool asset id
 * @param signer the signer to sign the transaction
 */
async function addAssetToPool(
  apiPromise: ApiPromise,
  assetId: string,
  poolAssetId: string,
  signer: KeyringPair
) {
  await polkadotTx(
    apiPromise,
    {
      section: 'sudo',
      method: 'sudo',
    },
    [apiPromise.tx.assetRegistry.addAssetToPool(poolAssetId, Number(assetId))],
    signer
  );
}

export default addAssetToPool;
