/**
 * Copyright 2023 Webb Technologies Inc.
 * SPDX-License-Identifier: Apache-2.0
 *
 * This script is used to setup a local protocol substrate and create a pool share asset
 * for the bridge dapp to use (mostly for testing purposes)
 *
 * Dependency:
 * - @webb-tools/protocol-substrate: https://github.com/webb-tools/protocol-substrate
 *   Please start the `protocol-substrate` repo first and then run this script to
 *   setup the nessary assets for the bridge dapp to use.
 */

import { ApiPromise } from '@polkadot/api';
import { BN } from 'bn.js';
import chalk from 'chalk';
import { config } from 'dotenv';

import addAssetMetadata from './utils/addAssetMetadata';
import createPoolShare from './utils/createPoolShare';
import createVAnchor from './utils/createVAnchor';
import getKeyring from './utils/getKeyRing';
import getLocalApi from './utils/getLocalApi';
import transferAsset from './utils/transferAsset';

// Load env variables
config();

const ALICE_PORT = 9944;
const ALICE_KEY_URI = '//Alice';
const BOB_URI = '//Bob';

const NATIVE_ASSET_ID = '0';
const NATIVE_ASSET = 'tTNT';

const FUNGIBLE_ASSET = 'webbtTNT';

const TEST_ACCOUNT = process.env.BRIDGE_DAPP_POLKADOT_TEST_ACCOUNT_ADDRESS;

const AMOUNT = 1_000_000;

async function main() {
  // Start the nodes
  console.log(chalk.blue('Starting local substrate protocol...'));

  // Wait until we are ready and connected
  console.log(chalk.blue('Waiting for API to be ready...'));

  const aliceApi = await getLocalApi(ALICE_PORT);

  console.log(chalk`=> {green.bold API is ready!}`);

  await initPoolShare(aliceApi);
}

async function initPoolShare(api: ApiPromise) {
  const sudoKey = getKeyring(ALICE_KEY_URI);
  const bobKey = getKeyring(BOB_URI);

  // Create pool share asset
  console.log(chalk`[+] {blue Creating pool share asset...}`);
  const poolShareAssetId = await createPoolShare(
    api,
    FUNGIBLE_ASSET,
    +NATIVE_ASSET_ID,
    sudoKey
  );
  console.log(
    chalk`  => {green Pool share asset ${FUNGIBLE_ASSET} created with id \`${poolShareAssetId}\`}`
  );

  // Add assets metadata
  console.log(chalk`[+] {blue Adding assets metadata...}`);
  await addAssetMetadata(api, sudoKey, NATIVE_ASSET_ID, NATIVE_ASSET);
  await addAssetMetadata(
    api,
    sudoKey,
    poolShareAssetId.toString(),
    FUNGIBLE_ASSET
  );
  console.log(chalk`  => {green Assets metadata added}`);

  console.log(
    chalk`[+] {blue Creating VAnchor for asset ${FUNGIBLE_ASSET}...}`
  );
  const vanchorId = await createVAnchor(api, poolShareAssetId, sudoKey);
  console.log(chalk`  => {green VAnchor with id \`${vanchorId}\` created}`);

  // Wrapping the token to initialize the fee recipient account
  console.log(
    chalk`[+] {blue Wrapping ${AMOUNT} ${NATIVE_ASSET} to initialize the fee recipient account...}`
  );
  const wrappingAmount = new BN(AMOUNT).mul(new BN(10).pow(new BN(18)));

  const wrappingTx = await api.tx.tokenWrapper
    .wrap(NATIVE_ASSET_ID, poolShareAssetId, wrappingAmount, bobKey.address)
    .signAsync(bobKey);

  const wrappingHash = await new Promise<string>((resolve, reject) => {
    wrappingTx
      .send((result) => {
        if (result.isInBlock) {
          resolve(result.status.asInBlock.toString());
        } else if (result.isFinalized) {
          resolve(result.status.asFinalized.toString());
        } else if (result.isError) {
          reject(result);
        }
      })
      .catch(reject);
  });

  console.log(chalk`  => {green Token wrapped with hash \`${wrappingHash}\`}`);

  // Transfer some tokens to the test account
  if (TEST_ACCOUNT) {
    console.log(
      chalk`[+] {blue Transferring ${AMOUNT} ${NATIVE_ASSET} to test account...}`
    );
    const hash = await transferAsset(
      api,
      sudoKey,
      TEST_ACCOUNT,
      0,
      new BN(AMOUNT).mul(new BN(10).pow(new BN(18)))
    );

    console.log(
      chalk`  => {green Token transferred to test account with hash \`${hash}\`}`
    );
  }
}

main()
  .then(() => {
    console.log(chalk.green.bold('✅ Protocol Substrate ready to use!!!'));
    process.exit(0);
  })
  .catch((error) => {
    console.log(chalk.red.bold('❌ Protocol Substrate failed to start!!!'));
    console.log(error);
    process.exit(1);
  });
