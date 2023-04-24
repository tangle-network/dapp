/**
 * Copyright 2022 Webb Technologies Inc.
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

import { ApiPromise } from '@polkadot/api';
import { LoggerService } from '@webb-tools/browser-utils/src/logger/logger-service';
import { LocalProtocolSubstrate } from '@webb-tools/test-utils';
import { BN } from 'bn.js';
import chalk from 'chalk';
import { Command } from 'commander';
import { resolve } from 'path';

import addAssetMetadata from './utils/addAssetMetadata';
import addAssetToPool from './utils/addAssetToPool';
import createPoolShare from './utils/createPoolShare';
import createVAnchor from './utils/createVAnchor';
import getKeyring from './utils/getKeyRing';
import transferAsset from './utils/transferAsset';

const ALICE_KEY_URI = '//Alice';

const NATIVE_ASSET_ID = '0';
const NATIVE_ASSET = 'tTNT';

const FUNGIBLE_ASSET = 'webbtTNT';

const TEST_ACCOUNT = '5DkHGdLaqqCn2CcCXTxUXnbvH1jq7oMp9HjZrWZBZimjXweW';

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

const logger = LoggerService.get('LOCAL SUBSTRATE');

async function main() {
  // Start the nodes
  logger.info('Starting local substrate protocol');

  const aliceNode = await LocalProtocolSubstrate.start({
    name: 'substrate-alice',
    authority: 'alice',
    usageMode,
    ports: 'auto',
    enableLogging: options.verbose,
  });

  const bobNode = await LocalProtocolSubstrate.start({
    name: 'substrate-bob',
    authority: 'bob',
    usageMode,
    ports: 'auto',
    enableLogging: options.verbose,
  });

  // Wait until we are ready and connected
  logger.info('Waiting for APIs to be ready');

  const aliceApi = await aliceNode.api();
  await aliceApi.isReady;

  const bobApi = await bobNode.api();
  await bobApi.isReady;

  logger.info('APIs are ready');

  await initPoolShare(aliceApi);
}

async function initPoolShare(api: ApiPromise) {
  const sudoKey = getKeyring(ALICE_KEY_URI);

  // Create pool share asset
  logger.info('Creating pool share asset');
  const poolShareAssetId = await createPoolShare(
    api,
    FUNGIBLE_ASSET,
    +NATIVE_ASSET_ID,
    sudoKey
  );
  logger.info(
    `Pool share asset ${FUNGIBLE_ASSET} created with id \`${poolShareAssetId}\``
  );

  // Add assets to pool
  logger.info('Adding assets to pool');
  await addAssetToPool(
    api,
    NATIVE_ASSET_ID,
    poolShareAssetId.toString(),
    sudoKey
  );
  logger.info(`Assets ${FUNGIBLE_ASSET} added to pool`);

  // Add assets metadata
  logger.info('Adding assets metadata');
  await addAssetMetadata(api, sudoKey, NATIVE_ASSET_ID, NATIVE_ASSET);
  await addAssetMetadata(
    api,
    sudoKey,
    poolShareAssetId.toString(),
    FUNGIBLE_ASSET
  );
  logger.info(`Assets metadata added`);

  const vanchorId = await createVAnchor(api, poolShareAssetId, sudoKey);

  logger.info(`VAnchor with id \`${vanchorId}\` created`);

  // Transfer some tokens to the test account
  logger.info(`Transferring ${AMOUNT} ${NATIVE_ASSET} to test account`);
  const hash = await transferAsset(
    api,
    sudoKey,
    TEST_ACCOUNT,
    0,
    new BN(AMOUNT).mul(new BN(10).pow(new BN(18)))
  );

  logger.info(
    `Token transferred to test account with hash \`${hash.toHuman()}\``
  );

  logger.info(chalk.green.bold('Protocol Substrate ready to use'));
}

main().catch(console.error);
