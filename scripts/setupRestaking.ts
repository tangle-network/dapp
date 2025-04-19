import {
  ALICE,
  CHARLIE,
  createAmount,
  createApi,
  getRandomShortId,
  submitTx,
} from './util';

const PALLET_ACCOUNT_ADDRESS =
  '5EYCAe5cKPAoFh2HnQQvpKqRYZGqBpaA87u4Zzw89qPE58is';

const LST_AND_ASSET_AND_VAULT_ID = 1;

(async () => {
  const api = await createApi();

  // 1. Fund pallet account, otherwise restaking actions will fail with `Token.CannotCreate`.
  await submitTx({
    description: 'fund pallet account',
    tx: api.tx.balances.transferAllowDeath(
      PALLET_ACCOUNT_ADDRESS,
      createAmount(10),
    ),
  });

  // 2. Create an LST which will create a corresponding custom asset with the same ID.
  await submitTx({
    description: 'create LST & asset',
    tx: api.tx.lst.create(
      createAmount(100),
      ALICE.address,
      ALICE.address,
      ALICE.address,
      `LST ${getRandomShortId()}`,
      null,
    ),
  });

  // 3. Create a vault for the new asset by creating its reward config.
  const createVaultRewardConfigTx = api.tx.rewards.createRewardVault(
    LST_AND_ASSET_AND_VAULT_ID,
    {
      apy: 1,
      incentiveCap: createAmount(60_000),
      depositCap: createAmount(60_000),
    },
  );

  await submitTx({
    description: 'create vault reward config',
    tx: createVaultRewardConfigTx,
    useSudo: true,
  });

  // 4. Join operators for CHARLIE (required for delegation step).
  await submitTx({
    description: 'join operators',
    origin: CHARLIE,
    tx: api.tx.multiAssetDelegation.joinOperators(createAmount(100)),
  });

  await api.disconnect();
})();
