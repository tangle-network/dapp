import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { polkadotTx } from '@webb-tools/test-utils';

/**
 * Creates a vanchor on the substrate chain
 * @param apiPromise the polkadot api instance
 * @param assetId the asset of the vanchor
 * @param signer the signer of the transaction
 * @returns the id of the newly created vanchor
 */
async function createVAnchor(
  apiPromise: ApiPromise,
  assetId: number,
  signer: KeyringPair
): Promise<number> {
  await polkadotTx(
    apiPromise,
    {
      section: 'sudo',
      method: 'sudo',
    },
    [apiPromise.tx.vAnchorBn254.create(1, 30, assetId)],
    signer
  );
  const nextTreeId = await apiPromise?.query.merkleTreeBn254.nextTreeId();
  return nextTreeId.toNumber() - 1;
}

export default createVAnchor;
