import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { polkadotTx } from '@webb-tools/test-utils';

/**
 * Utility function to add asset metadata to the asset registry
 * @param apiPromise the polkadot api instance
 * @param signer the signer to sign the transaction
 * @param assetId the asset id
 * @param assetSymbol the asset symbol
 * @param decimals the asset decimals (denomination)
 */
async function addAssetMetadata(
  apiPromise: ApiPromise,
  signer: KeyringPair,
  assetId: string,
  assetSymbol: string,
  decimals = 18
) {
  await polkadotTx(
    apiPromise,
    {
      section: 'sudo',
      method: 'sudo',
    },
    [apiPromise.tx.assetRegistry.setMetadata(assetId, assetSymbol, decimals)],
    signer
  );
}

export default addAssetMetadata;
