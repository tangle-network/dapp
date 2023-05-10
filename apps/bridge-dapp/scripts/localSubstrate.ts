/**
 * Copyright 2023 Webb Technologies Inc.
 * SPDX-License-Identifier: Apache-2.0
 *
 * This script is used to start a local protocol substrate and create a pool share asset
 * for the bridge dapp to use (mostly for testing purposes)
 *
 * Dependency:
 * - @webb-tools/protocol-substrate: https://github.com/webb-tools/protocol-substrate
 *   Please put the `protocol-substrate` repo in the same level as the `webb-dapp` repo
 *   and follow the instructions in the `protocol-substrate` repo to build the node binary
 *   and then run this script.
 *
 * Options:
 * -v --verbose: Enable node logging
 */

import { ApiPromise, WsProvider } from '@polkadot/api';
import { LocalProtocolSubstrate } from '@webb-tools/test-utils';
import { BN } from 'bn.js';
import chalk from 'chalk';
import { Command } from 'commander';
import { config } from 'dotenv';
import { resolve } from 'path';

import addAssetMetadata from './utils/addAssetMetadata';
import addAssetToPool from './utils/addAssetToPool';
import createPoolShare from './utils/createPoolShare';
import createVAnchor from './utils/createVAnchor';
import getLocalApi from './utils/getLocalApi';
import getKeyring from './utils/getKeyRing';
import transferAsset from './utils/transferAsset';

// Load env variables
config();

const ALICE_PORT = 9944;
const ALICE_KEY_URI = '//Alice';

const NATIVE_ASSET_ID = '0';
const NATIVE_ASSET = 'tTNT';

const FUNGIBLE_ASSET = 'webbtTNT';

const TEST_ACCOUNT = process.env.POLKADOT_TEST_ACCOUNT_ADDRESS;

const AMOUNT = 1000;

const usageMode = {
  mode: 'host',
  nodePath: resolve(
    '../protocol-substrate/target/release/webb-standalone-node'
  ),
} as const;

// Define CLI options
const program = new Command();

program.option('-v --verbose', 'Enable node logging');

program.parse(process.argv);

const options = program.opts();

async function main() {
  // Start the nodes
  console.log(chalk.blue('Starting local substrate protocol...'));

  await LocalProtocolSubstrate.start({
    name: 'substrate-alice',
    authority: 'alice',
    usageMode,
    ports: 'auto',
    enableLogging: options.verbose,
  });

  await LocalProtocolSubstrate.start({
    name: 'substrate-bob',
    authority: 'bob',
    usageMode,
    ports: 'auto',
    enableLogging: options.verbose,
  });

  // Wait until we are ready and connected
  console.log(chalk.blue('Waiting for API to be ready...'));

  const aliceApi = await getLocalApi(ALICE_PORT);

  console.log(chalk`=> {green.bold API is ready!}`);

  await initPoolShare(aliceApi);
}

async function initPoolShare(api: ApiPromise) {
  const sudoKey = getKeyring(ALICE_KEY_URI);

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

  // Add assets to pool
  console.log(chalk`[+] {blue Adding assets to pool...}`);
  await addAssetToPool(
    api,
    NATIVE_ASSET_ID,
    poolShareAssetId.toString(),
    sudoKey
  );
  console.log(chalk`  => {green Assets ${FUNGIBLE_ASSET} added to pool}`);

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

  console.log(chalk.green.bold('✅ Protocol Substrate ready to use!!!'));
}

main().catch(console.error);
