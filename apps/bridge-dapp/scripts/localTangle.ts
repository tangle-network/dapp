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

import { ApiPromise, WsProvider } from '@polkadot/api';
import { BN } from 'bn.js';
import chalk from 'chalk';
import { Command } from 'commander';
import { workspaceRoot } from 'nx/src/utils/workspace-root';
import { resolve } from 'path';

import addAssetMetadata from './utils/addAssetMetadata';
import createPoolShare from './utils/createPoolShare';
import createVAnchor from './utils/createVAnchor';
import getLocalApi from './utils/getLocalApi';
import getKeyring from './utils/getKeyRing';
import transferAsset from './utils/transferAsset';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const shelljs = require('shelljs');

const ALICE_PORT = 9944;

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

async function main() {
  console.log(
    chalk.yellow.bold('⚠️ Warning: Local Tangle is not supported yet!')
  );

  process.exit(0);

  // Start the nodes
  console.log(chalk.blue.bold('Starting local tangle network'));

  const proc = shelljs.exec(localStandaloneTangleScript + ' --clean', {
    cwd: resolve(localStandaloneTangleScript, '../../'),
    async: true,
    silent: true,
  });
  cleanup(() => proc.kill('SIGINT'));

  if (options.verbose) {
    console.log(chalk.inverse(' - Verbose mode enabled'));
    proc.stdout.on('data', (data: Buffer) => {
      console.log(data.toString());
    });
    proc.stderr.on('data', (data: Buffer) => {
      console.error(data.toString());
    });
  }

  // Wait until we are ready and connected
  console.log(chalk.blue.bold('Waiting for APIs to be ready'));

  const aliceApi = await getLocalApi(ALICE_PORT);

  console.log(chalk.green('APIs are ready'));

  // Wait until the first block is produced
  console.log(chalk.blue('Waiting for first block to be produced'));

  aliceApi.rpc.chain.subscribeNewHeads(async (header) => {
    const block = header.number.toNumber();
    // Init pool share after first block
    if (block === 1) {
      console.log(chalk.green('First block produced'));
      await initPoolShare(aliceApi);
    }
  });
}

async function initPoolShare(api: ApiPromise) {
  const sudoKey = getKeyring(TANGLE_SUDO_URI);

  // Create pool share asset
  console.log(chalk.blue('Creating pool share asset'));
  console.log(chalk`=> {blue Creating pool asset ${FUNGIBLE_ASSET}}`);
  const poolShareAssetId = await createPoolShare(
    api,
    FUNGIBLE_ASSET,
    +NATIVE_ASSET_ID,
    sudoKey
  );
  console.log(
    chalk`=> {green Pool share asset ${FUNGIBLE_ASSET} created with id ${poolShareAssetId}}`
  );

  // Add assets metadata
  console.log(chalk`=> {blue Adding metadata for ${NATIVE_ASSET}}`);
  await addAssetMetadata(api, sudoKey, NATIVE_ASSET_ID, NATIVE_ASSET);

  console.log(chalk`=> {blue Adding metadata for ${FUNGIBLE_ASSET}}`);
  await addAssetMetadata(
    api,
    sudoKey,
    poolShareAssetId.toString(),
    FUNGIBLE_ASSET
  );
  console.log(chalk`=> {green Assets metadata added}`);

  const vanchorId = await createVAnchor(api, poolShareAssetId, sudoKey);

  console.log(chalk`=> {green VAnchor with id ${vanchorId} created}`);

  // Transfer some tokens to the test account
  if (TEST_ACCOUNT) {
    console.log(
      chalk.blue(`Transferring ${AMOUNT} ${NATIVE_ASSET} to test account`)
    );
    const hash = await transferAsset(
      api,
      sudoKey,
      TEST_ACCOUNT,
      0,
      new BN(AMOUNT).mul(new BN(10).pow(new BN(18)))
    );

    console.log(
      chalk`=> {green Token transferred to test account with hash \`${hash}\``
    );
  }

  console.log(chalk.green.bold('✅ Tangle network ready to use!!!'));
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
