/**
 * Copyright 2023 Webb Technologies Inc.
 * SPDX-License-Identifier: Apache-2.0
 *
 * This script is used to start a local tangle network and create a pool share asset
 * for the bridge dapp to use (mostly for testing purposes)
 *
 * Dependency:
 * - @webb-tools/tangle: https://github.com/webb-tools/tangle
 *   Please put the `tangle` repo in the same level as the `webb-dapp` repo
 *   and follow the instructions in the `tangle` repo to build the node binary
 *   and then run this script.
 *
 * Options:
 * -v --verbose: Enable node logging
 */

import { ApiPromise } from '@polkadot/api';
import { LoggerService } from '@webb-tools/browser-utils/src/logger/logger-service';
import { createApiPromise } from '@webb-tools/test-utils';
import { BN } from 'bn.js';
import chalk from 'chalk';
import { Command } from 'commander';
import { workspaceRoot } from 'nx/src/utils/workspace-root';
import { resolve } from 'path';

import addAssetMetadata from './utils/addAssetMetadata';
import addAssetToPool from './utils/addAssetToPool';
import createPoolShare from './utils/createPoolShare';
import createVAnchor from './utils/createVAnchor';
import getKeyring from './utils/getKeyRing';
import transferAsset from './utils/transferAsset';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const shelljs = require('shelljs');

const ALICE_PORT = 9944;
const BOB_PORT = 9945;

const TANGLE_SUDO_URI = '//Alice';

const NATIVE_ASSET_ID = '0';
const NATIVE_ASSET = 'tTNT';

const FUNGIBLE_ASSET = 'webbtTNT';

const TEST_ACCOUNT = process.env.POLKADOT_TEST_ACCOUNT_ADDRESS;

const AMOUNT = 1000;

const localStandaloneTangleScript = resolve(
  workspaceRoot,
  '../tangle/scripts/run-standalone.sh'
);

// Define CLI options
const program = new Command();

program.option('-v --verbose', 'Enable node logging');

program.parse(process.argv);

const options = program.opts();

const logger = LoggerService.get('LOCAL TANGLE');

async function main() {
  // Start the nodes
  logger.info('Starting local tangle network');

  const proc = shelljs.exec(localStandaloneTangleScript + ' --clean', {
    cwd: resolve(localStandaloneTangleScript, '../../'),
    async: true,
    silent: true,
  });
  cleanup(() => proc.kill('SIGINT'));

  if (options.verbose) {
    logger.debug('Verbose mode enabled');
    proc.stdout.on('data', (data: Buffer) => {
      console.log(data.toString());
    });
    proc.stderr.on('data', (data: Buffer) => {
      console.error(data.toString());
    });
  }

  // Wait until we are ready and connected
  logger.info('Waiting for APIs to be ready');

  const aliceApi = await createApiPromise(getEndpoint(ALICE_PORT));
  await aliceApi.isReady;

  const bobApi = await createApiPromise(getEndpoint(BOB_PORT));
  await bobApi.isReady;

  logger.info('APIs are ready');

  // Wait until the first block is produced
  logger.info('Waiting for first block to be produced');

  await aliceApi.rpc.chain.subscribeNewHeads(async (header) => {
    const block = header.number.toNumber();
    logger.debug(`New block produced: ${chalk.green(block.toString())}`);
    // Init pool share after first block
    if (block === 1) {
      await initPoolShare(aliceApi);
    }
  });
}

async function initPoolShare(api: ApiPromise) {
  const sudoKey = getKeyring(TANGLE_SUDO_URI);

  // Create pool share asset
  logger.info('Creating pool share asset');
  const poolShareAssetId = await createPoolShare(
    api,
    FUNGIBLE_ASSET,
    +NATIVE_ASSET_ID,
    sudoKey
  );
  logger.info(
    `Pool share asset ${FUNGIBLE_ASSET} created with id ${poolShareAssetId}`
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
  if (TEST_ACCOUNT) {
    logger.info(`Transferring ${AMOUNT} ${NATIVE_ASSET} to test account`);
    const hash = await transferAsset(
      api,
      sudoKey,
      TEST_ACCOUNT,
      0,
      new BN(AMOUNT).mul(new BN(10).pow(new BN(18)))
    );

    logger.info(`Token transferred to test account with hash \`${hash}\``);
  }

  logger.info('Tangle network ready to use');
}

function getEndpoint(port: number) {
  return `ws://127.0.0.1:${port}`;
}

function cleanup(callback: () => any) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function noOp() {}

  // attach user callback to the process event emitter
  // if no callback, it will still exit gracefully on Ctrl-C
  callback = callback || noOp;

  // do app specific cleaning before exiting
  process.on('exit', function () {
    callback();
    process.exit(0);
  });

  // catch ctrl+c event and exit normally
  process.on('SIGINT', function () {
    callback();
    process.exit(0);
  });

  //catch uncaught exceptions, trace, then exit normally
  process.on('uncaughtException', function (e) {
    callback();
    process.exit(1);
  });
}

main().catch(console.error);
